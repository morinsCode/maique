import { loadScriptOnce } from "./loadScript.ts";

// Minimal shape of the YouTube IFrame Player API used by MaiQue.
export type YTPlayer = {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  destroy: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
};

export type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string;
      playerVars?: { autoplay?: 0 | 1; mute?: 0 | 1; playsinline?: 0 | 1 };
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_API_SRC = "https://www.youtube.com/iframe_api";

let apiPromise: Promise<YTNamespace> | null = null;

// Resolves once the YouTube API is fully ready to create players. The
// iframe_api script loads more code by itself, so "script loaded" isn't
// enough: YouTube signals real readiness via window.onYouTubeIframeAPIReady.
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (!apiPromise) {
    apiPromise = new Promise<YTNamespace>((resolve, reject) => {
      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve(window.YT!);
      };
      loadScriptOnce(YT_API_SRC).catch((error) => {
        apiPromise = null; // allow a later retry
        reject(error);
      });
    });
  }
  return apiPromise;
}
