# MaiQue

A shared music queue for events: the crowd requests tracks from their phones, and the DJ decides what plays.

## Project overview

### What it is

MaiQue is a web app for parties, events and anyone else playing music to a room. Guests open a link on their phones and paste a YouTube or SoundCloud link to request a song. The DJ sees incoming requests live, approves or rejects them, and plays the approved tracks in order from one simple player.

### The problem it solves

Song requests at events usually mean people shouting at the DJ or passing a phone around. Tracks also live on different services, so the DJ ends up juggling several apps and tabs. MaiQue gathers all requests in one place, leaves the final say with the DJ, and plays tracks from different services through one set of controls.

### Main features

- **Rooms with a code:** the DJ creates a room and shares its short code, and guests join with it.
- **Requests from any phone:** guests paste a YouTube or SoundCloud link, and the service is detected automatically.
- **DJ approval:** each request can be approved into the playlist or rejected.
- **Live sync:** requests and the playlist update instantly on every connected screen, with no refresh needed.
- **One player for several services:** Play, Pause and Next control both YouTube and SoundCloud tracks, and the next track starts automatically when one ends.

### My contribution

This is a solo project. I designed and built the frontend, the backend and the shared data model. That includes the real-time room sync and the playback layer that lets one set of controls drive different music providers.

### Status

Early-stage prototype that runs locally in development mode. No public demo or deployment exists yet. Spotify links are planned but not yet supported.

### Technology

React and TypeScript in the browser (built with Vite, styled with Material UI). Node.js, Express and WebSockets on the server.

## Technical guide

### Architecture

The repository has three parts, without a shared build tool:

- **[`backend/`](backend/)** is an Express server on port 3000. It provides a REST API for rooms and a WebSocket server on the same HTTP server. Room state (`requests` and `playlist`) is kept in memory per room ID. After every change, the server sends the room's full state to every WebSocket client in that room.
- **[`frontend/`](frontend/)** is a React 19 + Vite single-page app with three routes: `/` (create or join a room), `/guest/:roomId` (submit requests) and `/dj/:roomId` (review requests and play music). In development, Vite forwards `/rooms` (including the WebSocket) and `/health` to the backend, so the browser talks to a single origin.
- **[`shared/`](shared/types.ts)** holds the TypeScript types used by both sides (`TrackRequest`, `Service`). Both sides import them directly by relative path.

API endpoints, defined in [`backend/src/routes/rooms.routes.ts`](backend/src/routes/rooms.routes.ts) and [`backend/src/server.ts`](backend/src/server.ts):

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/rooms/:roomId/state` | Current requests and playlist |
| `POST` | `/rooms/:roomId/requests` | Submit a request (`{ guest, url, service }`) |
| `POST` | `/rooms/:roomId/approve` | Move request `{ index }` to the playlist |
| `POST` | `/rooms/:roomId/reject` | Discard request `{ index }` |
| WS | `/rooms/:roomId/ws` | Receives the full room state after every change |

**Playback:** the DJ page drives each provider through a provider-neutral `PlayerAdapter` interface ([`frontend/src/playback/types.ts`](frontend/src/playback/types.ts)). YouTube and SoundCloud adapters live in [`frontend/src/providers/`](frontend/src/providers/). [`usePlaybackController`](frontend/src/playback/usePlaybackController.ts) handles track order and play/pause state, and it contains no provider-specific code. To add a provider, you write a new adapter and register it in [`PlayerHosts.tsx`](frontend/src/playback/PlayerHosts.tsx).

[`CLAUDE.md`](CLAUDE.md) has more detailed architecture notes.

### Prerequisites

- Node.js and npm. The repository doesn't pin a Node version (there is no `engines` field or `.nvmrc`).

### Configuration

No environment variables or config files are needed. The backend port (`3000`) is set in [`backend/src/server.ts`](backend/src/server.ts), and the dev proxy target is set in [`frontend/vite.config.ts`](frontend/vite.config.ts).

### Run locally

Start the backend and the frontend in two terminals:

```bash
# Terminal 1 — backend on http://localhost:3000 (restarts on file changes)
cd backend
npm install
npm run dev
```

```bash
# Terminal 2 — frontend (Vite dev server)
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, then click **Create a room**. To join as a guest, open the app in a second tab, click **Request Track** and enter the room code shown on the DJ page.

The backend can also be started without file watching using `npm run start` in `backend/`.

### Checks and build

| Where | Command | What it does |
|---|---|---|
| `backend/` | `npm run typecheck` | Type-checks with `tsc --noEmit` |
| `frontend/` | `npm run lint` | Runs ESLint |
| `frontend/` | `npm run build` | Type-checks and builds to `frontend/dist/` |
| `frontend/` | `npm run preview` | Serves the production build locally |

There are no automated tests yet. `npm test` in `backend/` is a placeholder that exits with an error.

### Repository layout

```
backend/src/
  server.ts                  Express app, /health, starts WebSocket server
  routes/ controllers/ services/   Rooms API: routing → validation → in-memory state
  websocket.ts               Per-room WebSocket broadcast
frontend/src/
  pages/                     LandingPage, GuestPage, DjPage
  components/                Request list, playlist, player controls, guest form
  hooks/useRoomState.ts      REST + WebSocket sync with the backend (auto-reconnect)
  playback/                  Provider-neutral playback controller and player hosts
  providers/                 YouTube/SoundCloud URL detection, API loaders, adapters
shared/types.ts              Types shared by frontend and backend
```

### Known limitations

- **State is not saved:** rooms live in server memory and are lost when the backend restarts.
- **Development only:** there is no production deployment setup. The `/rooms` proxy exists only in the Vite dev server, and the backend doesn't serve the built frontend.
- **Local network access isn't configured:** by default Vite listens only on `localhost`, so testing from a phone needs extra Vite host configuration that isn't in the repository.
- **Spotify isn't supported yet:** `spotify` exists as a service type, but guests can only submit YouTube and SoundCloud links, and there is no Spotify player.
- **No guest names:** every request is sent with the fixed name `"moe"`.
- **No access control:** anyone who knows a room code can open its DJ page.
- **Browser autoplay rules:** browsers may block automatic playback. When that happens, the DJ page shows a hint to press Play.
- **No license:** the repository has no license file yet.
