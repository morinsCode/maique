import { useEffect, useRef } from "react";
import { loadScriptOnce } from "../providers/loadScript.ts";
import type { YTPlayer as YTPlayerInstance } from "../providers/youtubeApi.ts";

type YouTubePlayerProps = {
  videoId: string;
  soundEnabled: boolean;
  onEnded?: () => void;
};

function YouTubePlayer({ videoId, soundEnabled, onEnded }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const playerReadyRef = useRef(false);
  const onEndedRef = useRef(onEnded);

  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (soundEnabled && playerReadyRef.current) {
      playerRef.current?.unMute();
      playerRef.current?.setVolume(100);
    }
  }, [soundEnabled]);

  useEffect(() => {
    let cancelled = false;

    function createPlayer() {
      if (cancelled || !containerRef.current || !window.YT) return;
      playerReadyRef.current = false;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        // Autoplay reliably works only when muted; unmuting requires a
        // separate user gesture (see soundEnabled effect below).
        playerVars: { autoplay: 1, mute: 1 },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            if (soundEnabledRef.current) {
              playerRef.current?.unMute();
              playerRef.current?.setVolume(100);
            }
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
      // The script finishing loading doesn't mean the API is ready (it loads
      // more code itself), so readiness is still signalled by the callback.
      loadScriptOnce("https://www.youtube.com/iframe_api").catch(
        console.error,
      );
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
