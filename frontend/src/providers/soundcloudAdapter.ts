import type { PlayerAdapter, PlayerEvent } from "../playback/types.ts";
import { loadSoundCloudApi, type SCWidget } from "./soundcloudApi.ts";

// Wraps a SoundCloud Widget in the provider-neutral PlayerAdapter contract.
// The adapter owns everything inside `container`; React should render the
// container empty and never touch its children.
export function createSoundCloudAdapter(container: HTMLElement): PlayerAdapter {
  const listeners = new Set<(event: PlayerEvent) => void>();
  let widgetPromise: Promise<SCWidget> | null = null;
  let destroyed = false;

  // Same as the YouTube adapter: deliver events on a later tick so listener
  // code never runs inside SoundCloud's own event dispatch.
  function emit(event: PlayerEvent) {
    setTimeout(() => {
      if (destroyed) return;
      listeners.forEach((listener) => listener(event));
    }, 0);
  }

  // A SoundCloud widget can only wrap an iframe that already points at a
  // track, so the widget is created by the first load(), with that track.
  function createWidget(url: string, autoplay: boolean): Promise<SCWidget> {
    return loadSoundCloudApi().then(
      (SC) =>
        new Promise<SCWidget>((resolve, reject) => {
          if (destroyed) {
            reject(new Error("SoundCloud adapter was destroyed"));
            return;
          }
          const iframe = document.createElement("iframe");
          iframe.title = "SoundCloud player";
          iframe.width = "100%";
          iframe.height = "166";
          iframe.allow = "autoplay; encrypted-media";
          iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=${autoplay}`;
          container.appendChild(iframe);

          const widget = SC.Widget(iframe);
          const { Events } = SC.Widget;
          widget.bind(Events.READY, () => resolve(widget));
          widget.bind(Events.PLAY, () => emit({ type: "playing" }));
          widget.bind(Events.PAUSE, () => emit({ type: "paused" }));
          widget.bind(Events.FINISH, () => emit({ type: "ended" }));
          widget.bind(Events.ERROR, () =>
            emit({ type: "error", message: "SoundCloud could not play track" }),
          );
        }),
    );
  }

  // Runs the action once the widget is ready. Before the first load() there
  // is no widget, and nothing to play or pause.
  async function withWidget(action: (widget: SCWidget) => void) {
    if (!widgetPromise) return;
    const widget = await widgetPromise;
    if (!destroyed) action(widget);
  }

  return {
    service: "soundcloud",

    async load(track, { autoplay }) {
      if (!widgetPromise) {
        widgetPromise = createWidget(track.url, autoplay);
        await widgetPromise;
        return;
      }
      const widget = await widgetPromise;
      if (destroyed) return;
      // The widget calls `callback` once the new track is ready.
      await new Promise<void>((resolve) =>
        widget.load(track.url, { auto_play: autoplay, callback: () => resolve() }),
      );
    },

    play: () => withWidget((w) => w.play()),
    pause: () => withWidget((w) => w.pause()),
    stop: () =>
      withWidget((w) => {
        w.pause();
        w.seekTo(0);
      }),

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.clear();
      // Removing the iframe tears down the widget's listeners. Don't call
      // widget.unbind(): it breaks if the iframe is already gone.
      container.replaceChildren();
    },
  };
}
