import type { Request, Response } from "express";
import type { TrackRequest } from "../../../shared/types.ts";
import * as roomsService from "../services/rooms.service.ts";
import { broadcastRoom } from "../websocket.ts";

type RoomParams = { roomId: string };

export function getState(req: Request<RoomParams>, res: Response) {
  res.json(roomsService.getOrCreateRoom(req.params.roomId));
}

// Returns the track from a request body, or null if it isn't a valid TrackRequest.
function parseTrackRequest(body: unknown): TrackRequest | null {
  const { guest, url, service } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof guest !== "string" ||
    typeof url !== "string" ||
    (service !== "youtube" && service !== "spotify" && service !== "soundcloud")
  ) {
    return null;
  }
  return { guest, url, service };
}

export function submitRequest(req: Request<RoomParams>, res: Response) {
  const track = parseTrackRequest(req.body);
  if (!track) {
    res.status(400).json({ error: "invalid track request" });
    return;
  }
  const room = roomsService.addRequest(req.params.roomId, track);
  broadcastRoom(req.params.roomId, room);
  res.json(room);
}

// DJ-added tracks skip the request queue and go straight onto the playlist.
export function addToPlaylist(req: Request<RoomParams>, res: Response) {
  const track = parseTrackRequest(req.body);
  if (!track) {
    res.status(400).json({ error: "invalid track request" });
    return;
  }
  const room = roomsService.addToPlaylist(req.params.roomId, track);
  broadcastRoom(req.params.roomId, room);
  res.json(room);
}

export function removeFromPlaylist(
  req: Request<RoomParams & { trackId: string }>,
  res: Response,
) {
  const room = roomsService.removeFromPlaylist(
    req.params.roomId,
    req.params.trackId,
  );
  broadcastRoom(req.params.roomId, room);
  res.json(room);
}

export function approveRequest(req: Request<RoomParams>, res: Response) {
  const { index } = req.body ?? {};
  if (typeof index !== "number") {
    res.status(400).json({ error: "index must be a number" });
    return;
  }
  const room = roomsService.approveRequest(req.params.roomId, index);
  broadcastRoom(req.params.roomId, room);
  res.json(room);
}

export function rejectRequest(req: Request<RoomParams>, res: Response) {
  const { index } = req.body ?? {};
  if (typeof index !== "number") {
    res.status(400).json({ error: "index must be a number" });
    return;
  }
  const room = roomsService.rejectRequest(req.params.roomId, index);
  broadcastRoom(req.params.roomId, room);
  res.json(room);
}
