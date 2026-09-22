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

## 2026-09-21

- Added a TypeScript Express backend (`backend/`) so guest requests and DJ playlists are shared across devices instead of living only in each browser's `localStorage` (commits `f181b78` 14:14, `9e69015` 14:36, `a03c19f` 15:12):
  - `shared/types.ts` (new) — `TrackRequest`/`Service` moved here from `frontend/src/components/types.ts` (deleted), imported by both frontend and backend.
  - `backend/src/server.ts`, `tsconfig.json`, `package.json` — Express + TypeScript scaffold; `tsx` runs the server for both dev and start, `tsc --noEmit` is used for type-checking only (no compiled build step — see limitations).
  - Rooms API split into controller/service/routes layers: `backend/src/services/rooms.service.ts` (in-memory `Map<roomId, RoomState>`), `backend/src/controllers/rooms.controller.ts` (request validation), `backend/src/routes/rooms.routes.ts` (Express `Router`).
  - Endpoints: `GET /rooms/:roomId/state`, `POST /rooms/:roomId/requests|approve|reject`.
  - `backend/src/websocket.ts` (new) — a `WebSocketServer` attached to the HTTP server broadcasts a room's updated state to every client connected to `ws://.../rooms/:roomId/ws` after each mutation.
- Wired the frontend to the new backend in place of `localStorage`:
  - `frontend/src/hooks/useRoomState.ts` (new) — fetches a room's initial state, subscribes to its WebSocket for live updates, and exposes `submitRequest`/`approve`/`reject` as REST calls; reconnects and re-syncs state automatically if the socket closes (e.g. on a backend restart).
  - Removed `frontend/src/hooks/useSyncedState.ts` (the old `localStorage`-based hook), no longer used.
  - `frontend/src/App.tsx` — routes changed to `/dj/:roomId` and `/guest/:roomId`; new `DjRoom`/`GuestRoom` wrapper components read the room ID from the URL and call `useRoomState`.
  - `frontend/src/pages/LandingPage.tsx` — "Start a room as DJ" generates a room code and navigates in; a room-code field + "Join as guest" button lets a guest enter a code, with helper text explaining where to get one.
  - `frontend/src/pages/DjPage.tsx` — now displays the room code with a "Copy" button so the DJ can share it with guests.
  - `frontend/vite.config.ts` — dev server proxies `/rooms` (including the WebSocket upgrade) and `/health` to the backend, and allows serving `shared/` from outside the frontend project root.

### Bug fixes

- Fixed: a DJ tab would silently stop receiving live updates if its WebSocket connection dropped (e.g. backend restart) — there was no reconnect logic. `useRoomState` now retries the connection and re-fetches state on reconnect.
- Fixed an unhandled `SyntaxError` in `useRoomState`'s initial state fetch when it hit a transient error response (e.g. a 502 during a backend restart) by adding a `.catch()`.

### Tests / validation

- Verified backend REST endpoints end-to-end with `curl` (submit → approve → state reflects the change), confirmed state is isolated per room.
- Verified WebSocket broadcast with a Node WebSocket client: connecting to a room and posting a REST mutation delivered the update immediately.
- Verified the full multi-device flow in the browser using two separate tabs (DJ + guest): a guest submission appeared live on the DJ tab without a refresh.
- Verified reconnect behavior by force-restarting the backend process while a DJ tab was open, then confirming a guest submission still reached it without a manual page reload.
- Verified `tsc --noEmit` (backend) and `tsc -b` + `npm run build` (frontend) all pass after these changes.

### Known limitations / follow-ups

- No production/non-dev deployment story yet — the frontend-to-backend proxy is only configured for the Vite dev server.
- Room state is in-memory only on the backend: it does not persist across backend restarts or scale across multiple backend instances (would need a database).
- `GuestUI` still hardcodes the guest name (`"moe"`) rather than capturing a real identity.
- `DisplayPage.tsx` remains an empty, unwired placeholder from the 2026-09-17 session.
