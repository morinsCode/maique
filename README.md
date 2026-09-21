Here's the step-by-step path from current state to a working multi-device setup:

Design the room data model in the backend

Add backend/src/rooms.ts with an in-memory Map<roomId, { requests: TrackRequest[]; playlist: TrackRequest[] }> and helper functions (getOrCreateRoom, addRequest, approveRequest, removeRequest).
Add REST endpoints for room state and mutations

GET /rooms/:roomId/state — returns current requests/playlist.
POST /rooms/:roomId/requests — guest submits a track.
POST /rooms/:roomId/approve — DJ moves a request into the playlist.
POST /rooms/:roomId/reject — DJ discards a request.
Add realtime push so all devices stay in sync

Add a WebSocket server (ws package) alongside Express, keyed by roomId.
On every mutation, broadcast the room's updated state to all connected clients in that room.
Introduce a room ID concept on the frontend

Add routes like /dj/:roomId and /guest/:roomId (React Router params).
Update LandingPage.tsx so a DJ can create/generate a room code, and guests can enter one to join.
Replace useSyncedState with a backend-backed hook

New hook (e.g. useRoomState) that: fetches initial state via GET /rooms/:roomId/state, opens a WebSocket connection for live updates, and exposes mutation functions that call the REST endpoints instead of setting local state directly.
Remove localStorage persistence from this path — the backend is now the source of truth.
Wire App.tsx to the new hook

Read roomId from the URL, pass it into useRoomState, and replace handleApprove/handleRemove/guest submit handlers with calls to the hook's mutation functions.
Handle basic connection/error states in the UI

Loading state while initial GET /rooms/:roomId/state resolves.
Reconnect logic (or at least a visible "disconnected" indicator) if the WebSocket drops.
Manual multi-device test

Run backend (npm run dev in backend) and frontend (npm run dev in frontend).
Open the DJ page and a guest page in two different browsers/devices on the same network, pointed at the same room ID, and confirm a guest submission shows up live on the DJ's screen.
(Optional, later) CORS/config for cross-origin dev

Since frontend (Vite) and backend (Express) run on different ports, add CORS middleware on the backend for local dev.
