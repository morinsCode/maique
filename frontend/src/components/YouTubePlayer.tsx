import { useEffect, useRef } from "react";

// Minimal shape of the YouTube IFrame Player API used here.
type YTPlayerInstance = {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
};
type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    },
  ) => YTPlayerInstance;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubePlayerProps = {
  videoId: string;
  onEnded?: () => void;
};

function YouTubePlayer({ videoId, onEnded }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const playerReadyRef = useRef(false);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;

    function createPlayer() {
      if (cancelled || !containerRef.current || !window.YT) return;
      playerReadyRef.current = false;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        events: {
          onReady: () => {
            playerReadyRef.current = true;
          },
          onStateChange: (event) => {
            if (event.data === window.YT!.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
      playerReadyRef.current = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    // The player isn't ready to accept loadVideoById right after being
    // constructed (its videoId is already set via the constructor); only
    // call it once the player has actually fired onReady.
    if (!playerReadyRef.current) return;
    playerRef.current?.loadVideoById(videoId);
  }, [videoId]);

  return (
    <div>
      <p>Now playing:</p>
      <div ref={containerRef} />
    </div>
  );
}

export default YouTubePlayer;
