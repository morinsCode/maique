import { useCallback, useEffect, useRef, useState } from "react";
import type { TrackRequest } from "../../../shared/types.ts";
import type { PlayerAdapters } from "./types.ts";

// Owns "what is playing": which playlist position is current, which provider
// adapter is in charge of it, and whether the DJ wants music. It only knows
// the PlayerAdapter contract — never YouTube or SoundCloud specifics.
export function usePlaybackController(playlist: TrackRequest[]) {
  const [adapters, setAdapters] = useState<PlayerAdapters | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // What the player is actually doing (from its events), versus what the DJ
  // asked for (from button clicks). After a track ends, the next one starts
  // by itself only if the DJ hadn't paused.
  const [isPlaying, setIsPlaying] = useState(false);
  const wantsToPlayRef = useRef(false);

  const currentTrack: TrackRequest | undefined = playlist[currentIndex];
  const activeService = currentTrack?.service;
  // A provider without an adapter (Spotify, for now) gives undefined.
  const activeAdapter = activeService ? adapters?.[activeService] : undefined;
  const canGoNext = currentIndex + 1 < playlist.length;

  // Room state arrives as fresh objects on every WebSocket update, so loading
  // is keyed on the position and URL (which only change when the track really
  // changes) and the latest track object is read through a ref.
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  });
  const currentUrl = currentTrack?.url;

  // Keying on currentIndex as well as the URL means the same song approved
  // twice in a row still plays twice.
  useEffect(() => {
    const track = currentTrackRef.current;
    if (!activeAdapter || !currentUrl || !track) return;
    activeAdapter
      .load(track, { autoplay: wantsToPlayRef.current })
      .catch(console.error);
  }, [activeAdapter, currentIndex, currentUrl]);

  // useCallback keeps the same function between renders until the playlist
  // length changes, so the subscription below isn't redone on every render.
  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1 < playlist.length ? i + 1 : i));
  }, [playlist.length]);

  useEffect(() => {
    if (!activeAdapter) return;
    // Only the active adapter is subscribed, so events from the previous
    // provider are never heard. subscribe() returns the cleanup function.
    return activeAdapter.subscribe((event) => {
      if (event.type === "playing") setIsPlaying(true);
      if (event.type === "paused") setIsPlaying(false);
      if (event.type === "ended" || event.type === "error") {
        if (event.type === "error") console.error(event.message);
        setIsPlaying(false);
        next();
      }
    });
  }, [activeAdapter, next]);

  function play() {
    wantsToPlayRef.current = true;
    activeAdapter?.play().catch(console.error);
  }

  function pause() {
    wantsToPlayRef.current = false;
    activeAdapter?.pause().catch(console.error);
  }

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    canGoNext,
    play,
    pause,
    next,
    // Everything <PlayerHosts> needs, ready to spread onto it.
    hostProps: { activeService, onAdapters: setAdapters },
  };
}
