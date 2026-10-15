import { loadScriptOnce } from "./loadScript.ts";

// Minimal shape of the SoundCloud Widget API used by MaiQue.
export type SCWidget = {
  load: (
    url: string,
    options?: { auto_play?: boolean; callback?: () => void },
  ) => void;
  play: () => void;
  pause: () => void;
  seekTo: (milliseconds: number) => void;
  bind: (eventName: string, callback: () => void) => void;
};

export type SCNamespace = {
  Widget: {
    (iframe: HTMLIFrameElement): SCWidget;
    Events: {
      READY: string;
      PLAY: string;
      PAUSE: string;
      FINISH: string;
      ERROR: string;
    };
  };
};

declare global {
  interface Window {
    SC?: SCNamespace;
  }
}

const SC_API_SRC = "https://w.soundcloud.com/player/api.js";

// Unlike YouTube, SoundCloud's api.js defines window.SC as soon as it has
// loaded, so "script loaded" really does mean "API ready".
export async function loadSoundCloudApi(): Promise<SCNamespace> {
  await loadScriptOnce(SC_API_SRC);
  return window.SC!;
}
