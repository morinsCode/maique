import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaylistEntry, TrackRequest } from "../../../shared/types.ts";
import type { PlayerAdapter, PlayerAdapters } from "./types.ts";

// How long to wait for a "playing" event after asking a player to start,
// before assuming the browser blocked it.
const BLOCKED_AFTER_MS = 5000;

// Where the current song is in `next`, given it was at `index` in `prev`.
// Songs are matched by id, so deleting or reordering songs around it doesn't
// move playback onto a different song. If the current song itself was
// deleted, the first surviving song after it takes over ("skip to next"). If
// none survived, the result is "past the end": the spot the queue reaches when
// it runs out, where a newly added song is only cued. That spot is counted
// (how many earlier songs are still there) rather than taken from a song's
// position, so it stays past the end when those songs are reordered.
function followCurrentSong(
  prev: PlaylistEntry[],
  next: PlaylistEntry[],
  index: number,
): number {
  const isInNext = (entry: PlaylistEntry) =>
    next.some((e) => e.id === entry.id);

  for (let i = index; i < prev.length; i++) {
    const found = next.findIndex((e) => e.id === prev[i].id);
    if (found !== -1) return found;
  }
  return prev.slice(0, index).filter(isInNext).length;
}

// Owns "what is playing": which playlist position is current, which provider
// adapter is in charge of it, and whether the DJ wants music. It only knows
// the PlayerAdapter contract — never YouTube or SoundCloud specifics.
export function usePlaybackController(playlist: PlaylistEntry[]) {
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

  // Every new playlist (e.g. after a delete) may have shifted the songs, so
  // move currentIndex to wherever the current song is now. Doing this during
  // render (React's "adjust state when a prop changes" pattern) means React
  // re-renders straight away, before any effect could load the wrong song.
  const [prevPlaylist, setPrevPlaylist] = useState(playlist);
  if (playlist !== prevPlaylist) {
    setPrevPlaylist(playlist);
    const index = followCurrentSong(prevPlaylist, playlist, currentIndex);
    if (index !== currentIndex) setCurrentIndex(index);
  }

  const currentTrack: PlaylistEntry | undefined = playlist[currentIndex];
  const activeService = currentTrack?.service;
  // A provider without an adapter (Spotify, for now) gives undefined.
  const activeAdapter = activeService ? adapters?.[activeService] : undefined;
  const canGoNext = currentIndex + 1 < playlist.length;
  // Also true after the queue has run out (currentIndex is then one past the
  // end), so the DJ can go back to the last track.
  const canGoPrevious = currentIndex > 0;

  // Room state arrives as fresh objects on every WebSocket update, so loading
  // is keyed on the track's id (which only changes when the track really
  // changes) and the latest track object is read through a ref.
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  });
  const currentId = currentTrack?.id;

  // The adapter that most recently had a track loaded into it, so we know
  // which player to stop when the next track belongs to a different provider.
  const loadedAdapterRef = useRef<PlayerAdapter | undefined>(undefined);

  // Keyed on the id, not the position: deleting a song before the current one
  // changes currentIndex but not the song, so it must not reload (and restart)
  // it. Every playlist entry has its own id, so the same song approved twice
  // in a row still plays twice.
  useEffect(() => {
    const track = currentTrackRef.current;
    if (!track) {
      // Nothing to play: the queue ran out, or the last song was deleted
      // while it played. Silence whatever was loaded and, as when the queue
      // runs out, let the next added song only be cued.
      wantsToPlayRef.current = false;
      setPlaying(false);
      const loaded = loadedAdapterRef.current;
      loadedAdapterRef.current = undefined;
      loaded?.stop().catch(console.error);
      return;
    }
    if (!activeAdapter || !currentId) return;

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
  }, [
    activeAdapter,
    currentId,
    expectPlaying,
    clearBlocked,
    setPlaying,
  ]);

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

  // Clicking a song in the playlist is an explicit request to hear it, so it
  // always plays (unlike approving, which only cues).
  function playAt(index: number) {
    if (index === currentIndex) {
      // Already loaded, so the load effect won't run again: just resume
      // (no-op if it's already playing).
      play();
      return;
    }
    wantsToPlayRef.current = true;
    setCurrentIndex(index);
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
    playAt,
    pause,
    next,
    previous,
    // Everything <PlayerHosts> needs, ready to spread onto it.
    hostProps: { activeService, onAdapters: setAdapters },
  };
}
