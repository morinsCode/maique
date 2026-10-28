import { useCallback, useEffect, useRef, useState } from "react";
import type { TrackRequest } from "../../../shared/types.ts";
import type { PlayerAdapter, PlayerAdapters } from "./types.ts";

// How long to wait for a "playing" event after asking a player to start,
// before assuming the browser blocked it.
const BLOCKED_AFTER_MS = 5000;

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
  // The same as isPlaying, but readable from inside a timer callback, which
  // would otherwise only see the value from the render that created it.
  const isPlayingRef = useRef(false);

  // True when we asked a player to start but it never reported "playing" —
  // most likely the browser's autoplay policy blocked it. We never retry by
  // ourselves; the UI asks the DJ to press Play.
  const [isBlocked, setIsBlocked] = useState(false);
  const blockedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Call after asking a player to start: if it isn't playing a few seconds
  // later, flag it as blocked.
  const expectPlaying = useCallback(() => {
    clearTimeout(blockedTimerRef.current);
    blockedTimerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) setIsBlocked(true);
    }, BLOCKED_AFTER_MS);
  }, []);

  const clearBlocked = useCallback(() => {
    clearTimeout(blockedTimerRef.current);
    setIsBlocked(false);
  }, []);

  const setPlaying = useCallback(
    (playing: boolean) => {
      isPlayingRef.current = playing;
      setIsPlaying(playing);
      if (playing) clearBlocked();
    },
    [clearBlocked],
  );

  // Don't leave a timer running after the DJ page is gone.
  useEffect(() => () => clearTimeout(blockedTimerRef.current), []);

  const currentTrack: TrackRequest | undefined = playlist[currentIndex];
  const activeService = currentTrack?.service;
  // A provider without an adapter (Spotify, for now) gives undefined.
  const activeAdapter = activeService ? adapters?.[activeService] : undefined;
  const canGoNext = currentIndex + 1 < playlist.length;
  // Also true after the queue has run out (currentIndex is then one past the
  // end), so the DJ can go back to the last track.
  const canGoPrevious = currentIndex > 0;

  // Room state arrives as fresh objects on every WebSocket update, so loading
  // is keyed on the position and URL (which only change when the track really
  // changes) and the latest track object is read through a ref.
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  });
  const currentUrl = currentTrack?.url;

  // The adapter that most recently had a track loaded into it, so we know
  // which player to stop when the next track belongs to a different provider.
  const loadedAdapterRef = useRef<PlayerAdapter | undefined>(undefined);

  // Keying on currentIndex as well as the URL means the same song approved
  // twice in a row still plays twice.
  useEffect(() => {
    const track = currentTrackRef.current;
    if (!activeAdapter || !currentUrl || !track) return;

    // Set by the cleanup below when a newer track comes along. Loading is
    // async, so this run must check it after every await and bow out if it
    // has been superseded (e.g. Next clicked several times quickly).
    let cancelled = false;

    const previous = loadedAdapterRef.current;
    loadedAdapterRef.current = activeAdapter;

    async function switchTrack(adapter: PlayerAdapter, track: TrackRequest) {
      // Silence the old provider before starting the new one.
      if (previous && previous !== adapter) await previous.stop();
      if (cancelled) return;

      const autoplay = wantsToPlayRef.current;
      await adapter.load(track, { autoplay });

      if (cancelled) {
        // We lost the race while loading: a newer track on a *different*
        // provider has taken over, so silence what we just loaded.
        if (loadedAdapterRef.current !== adapter) await adapter.stop();
        return;
      }
      // Started without a click, so this is where autoplay blocking bites.
      if (autoplay) expectPlaying();
    }

    switchTrack(activeAdapter, track).catch(console.error);

    return () => {
      cancelled = true;
      // A hint about the previous track no longer applies.
      clearBlocked();
    };
  }, [activeAdapter, currentIndex, currentUrl, expectPlaying, clearBlocked]);

  // useCallback keeps the same function between renders until the playlist
  // length changes, so the subscription below isn't redone on every render.
  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1 < playlist.length ? i + 1 : i));
  }, [playlist.length]);

  // Follows the same play intent as next(): plays right away if the DJ is
  // playing, otherwise the earlier track is only cued.
  const previous = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  // Like next(), but used when a track finishes: it may step one past the
  // last track. currentTrack is then undefined (nothing to play), and as soon
  // as a new track is approved, playlist[currentIndex] exists again and the
  // load effect cues it up.
  const advance = useCallback(() => {
    if (currentIndex + 1 >= playlist.length) {
      // The queue ran out, so the music stops here. A newly approved track
      // is only cued; the DJ starts it with Play.
      wantsToPlayRef.current = false;
    }
    setCurrentIndex(Math.min(currentIndex + 1, playlist.length));
  }, [currentIndex, playlist.length]);

  useEffect(() => {
    if (!activeAdapter) return;
    // Only the active adapter is subscribed, so events from the previous
    // provider are never heard. subscribe() returns the cleanup function.
    return activeAdapter.subscribe((event) => {
      if (event.type === "playing") setPlaying(true);
      if (event.type === "paused") setPlaying(false);
      if (event.type === "ended" || event.type === "error") {
        if (event.type === "error") console.error(event.message);
        setPlaying(false);
        advance();
      }
    });
  }, [activeAdapter, advance, setPlaying]);

  function play() {
    wantsToPlayRef.current = true;
    activeAdapter
      ?.play()
      .then(() => expectPlaying())
      .catch(console.error);
  }

  function pause() {
    wantsToPlayRef.current = false;
    clearBlocked();
    activeAdapter?.pause().catch(console.error);
  }

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    isBlocked,
    canGoNext,
    canGoPrevious,
    play,
    pause,
    next,
    previous,
    // Everything <PlayerHosts> needs, ready to spread onto it.
    hostProps: { activeService, onAdapters: setAdapters },
  };
}
