# Worklog

## 2026-09-15

- Added multi-provider guest track submission:
  - `frontend/src/providers/detect.ts` — detects `youtube` / `soundcloud` from a pasted URL.
  - `frontend/src/providers/soundcloud.ts` — SoundCloud URL validator.
  - `GuestUI.tsx` — auto-detects the service on submit instead of hardcoding `"youtube"`; shows an inline error for unrecognized URLs.
- Added SoundCloud playback support:
  - `frontend/src/components/SoundCloudPlayer.tsx` (new) — mirrors `YouTubePlayer.tsx`, using the SoundCloud Widget API.
  - `App.tsx` — renders `YouTubePlayer` or `SoundCloudPlayer` based on `currentSong.service`.
- Fixed crash: SoundCloud → YouTube transition threw `TypeError: can't access property "postMessage", i is null`.
  - Cause: `SoundCloudPlayer`'s unmount cleanup called `widget.unbind()` while the widget was still mid-dispatch of the `FINISH` event that triggered the unmount.
  - Fix: removed the `unbind()` call from cleanup; removing the iframe from the DOM tears down its listeners.
- Fixed crash: second YouTube clip (after a SoundCloud clip) threw `TypeError: playerRef.current.loadVideoById is not a function`.
  - Cause: the `[videoId]` effect fired immediately after player construction, before the YouTube IFrame player had finished its internal ready handshake.
  - First attempt: skip-on-initial-mount flag — insufficient because React `StrictMode` double-invokes effects in dev, desyncing the flag from the actual player instance.
  - Final fix: track real readiness via the player's own `onReady` event (`playerReadyRef`) instead of a mount-count heuristic. Applied the same pattern to `SoundCloudPlayer` (`widgetReadyRef` via the widget's `READY` event) preemptively.
- Implemented autoplay:
  - YouTube: `playerVars: { autoplay: 1 }`.
  - SoundCloud: `&auto_play=true` on the iframe `src`.
  - Verified unmuted autoplay works in the browser tested, with a discussion of cross-browser autoplay-policy variability (Chrome media engagement index, Safari gesture requirements, Firefox prefs).
- Implemented reliable mute/unmute workaround for autoplay-with-sound restrictions:
  - Both players now start muted (`mute: 1` for YouTube; `setVolume(0)` for SoundCloud) so autoplay is guaranteed.
  - Added `soundEnabled` prop to both players; unmutes/sets volume to 100 on the provider's ready event or when the prop flips true.
  - `App.tsx` — added `soundEnabled` state and an "Enable sound" button (single click enables sound for the current and all subsequent songs in the session).
