import { useEffect, useRef } from "react";

// Minimal shape of the SoundCloud Widget API used here.
type SCWidgetInstance = {
  load: (url: string, options?: { auto_play?: boolean }) => void;
  bind: (eventName: string, callback: () => void) => void;
  unbind: (eventName: string) => void;
};
type SCNamespace = {
  Widget: {
    (element: HTMLElement): SCWidgetInstance;
    Events: { FINISH: string; READY: string };
  };
};

declare global {
  interface Window {
    SC?: SCNamespace;
  }
}

type SoundCloudPlayerProps = {
  url: string;
  onEnded?: () => void;
};

function SoundCloudPlayer({ url, onEnded }: SoundCloudPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidgetInstance | null>(null);
  const widgetReadyRef = useRef(false);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;

    function createWidget() {
      if (cancelled || !iframeRef.current || !window.SC) return;
      const widget = window.SC.Widget(iframeRef.current);
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        onEndedRef.current?.();
      });
      widget.bind(window.SC.Widget.Events.READY, () => {
        widgetReadyRef.current = true;
      });
      widgetRef.current = widget;
    }

    if (window.SC) {
      createWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.onload = createWidget;
      document.body.appendChild(script);
    }

    return () => {
      // Don't call widget.unbind() here: it can run while the widget is
      // still mid-dispatch of the event that triggered this unmount (e.g.
      // FINISH), and its internal iframe reference is already gone by then.
      // Removing the iframe from the DOM tears down its listeners for us.
      cancelled = true;
      widgetReadyRef.current = false;
      widgetRef.current = null;
    };
  }, []);

  useEffect(() => {
    // The widget isn't ready to accept load() right after being constructed
    // (its url is already set via the iframe src); only call it once the
    // widget has actually fired READY.
    if (!widgetReadyRef.current) return;
    widgetRef.current?.load(url, { auto_play: true });
  }, [url]);

  return (
    <div>
      <p>Now playing:</p>
      <iframe
        ref={iframeRef}
        title="SoundCloud player"
        width="100%"
        height="166"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`}
        allow="autoplay"
      />
    </div>
  );
}

export default SoundCloudPlayer;
