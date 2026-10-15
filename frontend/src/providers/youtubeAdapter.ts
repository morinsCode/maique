import type { PlayerAdapter, PlayerEvent } from "../playback/types.ts";
import { extractYouTubeVideoId } from "./youtube.ts";
import { loadYouTubeApi, type YTPlayer } from "./youtubeApi.ts";

// Wraps a YouTube IFrame player in the provider-neutral PlayerAdapter
// contract. The adapter owns everything inside `container`; React should
// render the container empty and never touch its children.
export function createYouTubeAdapter(container: HTMLElement): PlayerAdapter {
  const listeners = new Set<(event: PlayerEvent) => void>();
  let playerPromise: Promise<YTPlayer> | null = null;
  let player: YTPlayer | null = null;
  let destroyed = false;

  // Tell every listener about an event. Delivered on a later tick (setTimeout)
  // rather than straight away, so listener code — which may switch tracks or
  // even destroy this player — never runs inside YouTube's own event handler.
  function emit(event: PlayerEvent) {
    setTimeout(() => {
      if (destroyed) return;
      listeners.forEach((listener) => listener(event));
    }, 0);
  }

  // Creates the player the first time it's needed (lazy), and resolves only
  // once YouTube says it's ready. Every later call gets the same promise.
  function getPlayer(): Promise<YTPlayer> {
    if (!playerPromise) {
      playerPromise = loadYouTubeApi().then(
        (YT) =>
          new Promise<YTPlayer>((resolve, reject) => {
            if (destroyed) {
              reject(new Error("YouTube adapter was destroyed"));
              return;
            }
            // YT.Player replaces the element it's given with an iframe, so
            // hand it a child element rather than the container itself.
            const element = document.createElement("div");
            container.appendChild(element);
            const created = new YT.Player(element, {
              playerVars: { playsinline: 1 },
              events: {
                onReady: () => resolve(created),
                // Translate YouTube's numeric states into neutral events.
                onStateChange: ({ data }) => {
                  if (data === YT.PlayerState.PLAYING) emit({ type: "playing" });
                  if (data === YT.PlayerState.PAUSED) emit({ type: "paused" });
                  if (data === YT.PlayerState.ENDED) emit({ type: "ended" });
                },
                // e.g. 101/150: the video's owner doesn't allow embedding.
                onError: ({ data }) =>
                  emit({ type: "error", message: `YouTube error ${data}` }),
              },
            });
            player = created;
          }),
      );
    }
    return playerPromise;
  }

  // Waits for the player, then runs the action unless we were destroyed
  // in the meantime.
  async function withPlayer(action: (player: YTPlayer) => void) {
    const readyPlayer = await getPlayer();
    if (!destroyed) action(readyPlayer);
  }

  return {
    service: "youtube",

    async load(track, { autoplay }) {
      const videoId = extractYouTubeVideoId(track.url);
      if (!videoId) throw new Error(`Not a YouTube video URL: ${track.url}`);
      await withPlayer((p) =>
        autoplay ? p.loadVideoById(videoId) : p.cueVideoById(videoId),
      );
    },

    play: () => withPlayer((p) => p.playVideo()),
    pause: () => withPlayer((p) => p.pauseVideo()),
    stop: () => withPlayer((p) => p.stopVideo()),

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
      player?.destroy();
      player = null;
      container.replaceChildren();
    },
  };
}
