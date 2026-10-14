import type { Service, TrackRequest } from "../../../shared/types.ts";

// Something that happened inside a provider player, reported back to MaiQue.
export type PlayerEvent =
  | { type: "playing" }
  | { type: "paused" }
  | { type: "ended" }
  | { type: "error"; message: string };

// The common contract every provider player (YouTube, SoundCloud, later
// Spotify) must implement. The playback controller only talks to this
// interface and never calls provider-specific methods directly.
export interface PlayerAdapter {
  readonly service: Service;

  // Load a track. With autoplay: true it starts playing right away;
  // otherwise it is cued up and waits for play(). The first call also loads
  // the provider's API script and creates the player.
  load(track: TrackRequest, options: { autoplay: boolean }): Promise<void>;

  play(): Promise<void>;
  pause(): Promise<void>;

  // Pause and rewind. Used when switching to a different provider.
  stop(): Promise<void>;

  // Listen for player events. Returns a function that stops listening.
  subscribe(listener: (event: PlayerEvent) => void): () => void;

  // Tear down the player and its iframe. Safe to call more than once.
  destroy(): void;
}

// The adapters available right now, keyed by provider. A provider without
// an adapter yet (e.g. Spotify) is simply missing.
export type PlayerAdapters = Partial<Record<Service, PlayerAdapter>>;
