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
    Events: { FINISH: string };
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
      cancelled = true;
      widgetRef.current?.unbind(window.SC?.Widget.Events.FINISH ?? "finish");
      widgetRef.current = null;
    };
  }, []);

  useEffect(() => {
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
