export type TrackRequest = {
  guest: string;
  url: string;
  service: Service;
};

export type Service = "youtube" | "spotify" | "soundcloud";

// A track on the playlist. The id is created by the backend so a song can be
// found again after songs before it are deleted.
export type PlaylistEntry = TrackRequest & { id: string };
