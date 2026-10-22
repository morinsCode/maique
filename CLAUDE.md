# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MaiQue is a mixed-provider collaborative playlist app: guests submit track requests (YouTube/SoundCloud/Spotify URLs) from their phones, a DJ approves/rejects them into a live playlist, and everyone watching stays in sync in real time. Current phase: frontend + backend prototype (React/Vite + Express/TypeScript).

## Commands

Backend (`backend/`):

- `npm run dev` — run server with `tsx watch` (auto-restart) on `http://localhost:3000`
- `npm run typecheck` — `tsc --noEmit`
- No test suite exists yet (`npm test` is a stub that exits 1).

Frontend (`frontend/`):

- `npm run dev` — Vite dev server; proxies `/rooms` and `/health` to the backend on port 3000 (see `vite.config.ts`)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- No test suite exists yet.

Run backend and frontend dev servers concurrently (separate terminals) for local multi-device testing — open the DJ page and a guest page on different devices on the same network, pointed at the same room ID.

## Architecture

**Three packages, no shared build tooling:** `backend/`, `frontend/`, and `shared/` (plain `.ts`, no `package.json`). Both backend and frontend import directly from `../../../shared/types.ts` using explicit `.ts` extensions (`allowImportingTsExtensions`), not a published/linked package. `shared/types.ts` defines the provider-neutral domain types (`TrackRequest`, `Service`) that both sides must stay in sync with by hand.

**Rooms are the core unit of state.** Everything is scoped by `roomId`:

- `backend/src/services/rooms.service.ts` holds an in-memory `Map<roomId, RoomState>` (`{ requests, playlist }`) — no persistence, state resets on server restart.
- `backend/src/controllers/rooms.controller.ts` validates input and calls the service, then calls `broadcastRoom` to push the new state to WebSocket clients in that room.
- `backend/src/routes/rooms.routes.ts` wires REST endpoints: `GET /rooms/:roomId/state`, `POST /rooms/:roomId/requests`, `POST /rooms/:roomId/playlist` (DJ adds a track directly, skipping approval), `POST /rooms/:roomId/approve`, `POST /rooms/:roomId/reject`.
- `backend/src/websocket.ts` runs a `ws` `WebSocketServer` attached to the same HTTP server, keyed by room via the URL path `/rooms/:roomId/ws`. Every mutation broadcasts the _entire_ room state (not deltas) to all sockets in that room.

**Frontend sync model:** `frontend/src/hooks/useRoomState.ts` is the single integration point with the backend — it fetches initial state via REST, opens a WebSocket for live updates with auto-reconnect (re-fetches state on reconnect in case it missed updates while disconnected), and exposes `submitRequest`/`addToPlaylist`/`approve`/`reject` as REST calls. `App.tsx` reads `roomId` from the React Router URL param and wires this hook into `DjPage` (DJ view) and `GuestPage` (guest view) — there is no other state management layer; backend is the source of truth and nothing is persisted to `localStorage`.

**Provider abstraction:** Provider-specific logic (YouTube, SoundCloud, Spotify) is kept out of domain/UI code. There is no separate `Track` type: `TrackRequest` (`{ guest, url, service }`) is the track type everywhere, and playlist entries have no id (they're addressed by index; the backend only ever appends to the playlist). `frontend/src/providers/` holds all provider-specific code:

- URL helpers: `detect.ts` (`detectService`), `youtube.ts` (`extractYouTubeVideoId`), `soundcloud.ts` (`isSoundCloudUrl`).
- API loaders/types: `loadScript.ts` (`loadScriptOnce`, cached per URL), `youtubeApi.ts` (`loadYouTubeApi`, resolves on `onYouTubeIframeAPIReady`), `soundcloudApi.ts` (`loadSoundCloudApi`).
- Adapters: `youtubeAdapter.ts` / `soundcloudAdapter.ts` — factory functions (`createYouTubeAdapter(container)`) implementing the `PlayerAdapter` contract.

**Unified playback (DJ page):** one MaiQue player UI controls whichever provider plays the current track — unified control, not a unified audio engine.

- `frontend/src/playback/types.ts` defines the provider-neutral `PlayerAdapter` contract (`load(track, { autoplay })`, `play`, `pause`, `stop`, `subscribe(listener) → unsubscribe`, `destroy`) and the `PlayerEvent` union (`playing` / `paused` / `ended` / `error`).
- Adapters create their player lazily on the first `load()`, keep readiness internal (every method awaits a ready promise), emit events on a later tick (`setTimeout`) so listeners never run inside the provider's own handler, and own everything inside their container — React renders the container empty and never touches the iframe. `destroy()` is idempotent (StrictMode creates/destroys/recreates in dev).
- `frontend/src/playback/PlayerHosts.tsx` renders one container per provider for the whole DJ session, creates the adapters, and _parks_ inactive players (invisible 1px box — not `display: none`, which can stop embedded players from initialising). The active player stays visible.
- `frontend/src/playback/usePlaybackController.ts` owns `currentIndex`, `isPlaying` (from adapter events), the DJ's play intent, and an autoplay-blocked flag. It picks the adapter via `adapters[track.service]`, stops the previous provider before loading a different one, drops superseded loads with a `cancelled` flag, subscribes only to the active adapter, and advances on `ended`/`error`. It never imports provider code. Product rule: approving a track never starts it — after the queue runs out the play intent resets and the next approved track is only cued.
- To add a provider (e.g. Spotify): write `providers/spotifyAdapter.ts` implementing `PlayerAdapter` and add it in `PlayerHosts`; the controller needs no changes. Today a track whose provider has no adapter (Spotify) simply doesn't play: no player is shown, Play does nothing, and the DJ uses Next.

**Routes:** `/` (LandingPage — create/join a room), `/guest/:roomId` (GuestPage — submit requests), `/dj/:roomId` (DjPage — approve/reject requests, playback). There's also a `DisplayPage` component not yet wired into a route.

## Project conventions (from `.github/copilot-instructions.md`)

- TypeScript everywhere; avoid `any`.
- React function components and hooks only.
- Prefer simple, readable code over premature abstraction; keep components small and focused.
- Keep provider-specific logic (Spotify/YouTube/SoundCloud) isolated in `frontend/src/providers/`; use the neutral `Track`/`Service` types elsewhere (in this codebase `TrackRequest` plays the `Track` role).
- Preserve the `frontend/` / `backend/` / `shared/` separation.
- Do not install new libraries without discussing the need first.
- Do not expand MVP scope without explicit instruction.
- When requirements are unclear, ask before making architectural decisions.
- Explain suggested changes briefly; when correcting code, explain what was wrong. Don't generate large implementations unless explicitly requested.

### Updating `WORKLOG.md`

When asked to update `WORKLOG.md` with the day's work:

- Edit only `WORKLOG.md` — do not touch source files — unless explicitly told otherwise.
- Find that day's commits with `git log --since="<date> 00:00" --until="<date> 23:59:59"`, then inspect each with `git show --stat` / `git show` to describe actual behavioral changes, not just commit messages.
- Include uncommitted work (`git diff`, `git diff --cached`) only if the user confirms it belongs to that day, or the request is clearly made at the end of that same day.
- Diff against the existing entry for that date to avoid duplicates.
- Record the local date; include commit times where useful; never invent timestamps for uncommitted work.
- Separate completed changes, bug fixes, tests/validation, and known limitations/follow-ups.
- Only claim something was verified if Git history, command output, or the user confirms it.

## Session handoff

**At the start of a new session, briefly remind the user of the "Current status" below and how to resume a previous conversation.** Keep this section up to date when a piece of work finishes.

How to resume the previous Claude Code conversation (instead of starting fresh):

- `claude --continue` — reopens the most recent conversation in this directory.
- `claude --resume` — lists past conversations to pick from.

Working style: Split work into small steps (one concept each), explain the code and the reasoning, give concrete manual checks (the user tests in Firefox), and commit only after the user confirms. Plans for larger features live in `~/.claude/plans/`.

### Current status (updated 2026-10-20)

- Default branch is `main` (renamed from `master`). The unified playback work (`feat-unified-player`, steps `6c0c9ff` … `6b82d2b`, manually verified in Firefox) is merged into `main`.
- Repo prepared for a public GitHub push: `README.md` rewritten for GitHub, `WORKLOG.md` removed. Not pushed yet — no remote configured.
- Possible next steps: create the GitHub repo and push `main`; add a LICENSE; Spotify adapter (`providers/spotifyAdapter.ts`, see "Unified playback" above); test autoplay outside Firefox (especially iOS Safari).
