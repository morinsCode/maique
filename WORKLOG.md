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

## 2026-09-17

- Restructured the app to use React Router (`react-router` v7) instead of rendering all UI in one tree (commit `fb83665`, 13:34):
  - `main.tsx` — wraps `App` in `BrowserRouter`.
  - `App.tsx` — replaced direct rendering of `GuestUI`/`DjUI`/`Playlist`/players with `<Routes>`: `/` → `LandingPage`, `/guest` → `GuestPage`, `/dj` → `DjPage`. State (`requests`, `playlist`, `currentIndex`, `soundEnabled`) and handlers stay lifted in `App.tsx` and are passed down as props.
  - `pages/LandingPage.tsx` (new) — links to `/guest` and `/dj`.
  - `pages/GuestPage.tsx` (new) — renders `GuestUI`, forwards `onSubmit`.
  - `pages/DjPage.tsx` (new) — renders `DjUI`, `Playlist`, the "Enable sound" button, and the YouTube/SoundCloud players (DJ's tab is where playback happens).
  - `pages/DisplayPage.tsx` — created empty; deferred, not wired up yet.
- Added cross-tab state sync via `localStorage`:
  - `hooks/useSyncedState.ts` (new) — drop-in replacement for `useState` that persists a value to `localStorage` and listens for the `storage` event to pick up changes made in other tabs of the same browser.
  - `App.tsx` — `requests` and `playlist` now use `useSyncedState`; `currentIndex` and `soundEnabled` remain plain `useState` (playback state is intentionally per-tab).
  - Verified: submitting a guest request in one tab now appears in the DJ tab in the same browser without a manual refresh; confirmed this does not work across separate browser tabs/windows opened independently, or across devices, since `localStorage` is per-browser.
- Fixed SoundCloud playback: added `encrypted-media` to the player iframe's `allow` attribute.
- Discussed and planned (not yet implemented) a backend to support cross-device guest requests: Node.js + Express, Server-Sent Events for live updates, in-memory store, single global session. Plan recorded for a future session; no backend code exists yet.

### Known limitations / follow-ups

- `DisplayPage` is an empty placeholder — no dedicated "now playing" view yet.
- Cross-device guest requests still don't work; requires the planned backend.
- `localStorage` sync is a stopgap for local, same-browser multi-tab testing and will likely be retired once a backend is introduced.
