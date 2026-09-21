import type { Request, Response } from "express";
import * as roomsService from "../services/rooms.service.ts";
import { broadcastRoom } from "../websocket.ts";

type RoomParams = { roomId: string };

export function getState(req: Request<RoomParams>, res: Response) {
  res.json(roomsService.getOrCreateRoom(req.params.roomId));
}

export function submitRequest(req: Request<RoomParams>, res: Response) {
  const { guest, url, service } = req.body ?? {};
  if (
    typeof guest !== "string" ||
    typeof url !== "string" ||
    (service !== "youtube" && service !== "spotify" && service !== "soundcloud")
  ) {
    res.status(400).json({ error: "invalid track request" });
    return;
  }
  const room = roomsService.addRequest(req.params.roomId, {
    guest,
    url,
    service,
  });
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
