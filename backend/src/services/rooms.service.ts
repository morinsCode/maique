import type { TrackRequest } from "../../../shared/types.ts";

export type RoomState = {
  requests: TrackRequest[];
  playlist: TrackRequest[];
};

const rooms = new Map<string, RoomState>();

export function getOrCreateRoom(roomId: string): RoomState {
  let room = rooms.get(roomId);
  if (!room) {
    room = { requests: [], playlist: [] };
    rooms.set(roomId, room);
  }
  return room;
}

export function addRequest(roomId: string, request: TrackRequest): RoomState {
  const room = getOrCreateRoom(roomId);
  room.requests.push(request);
  return room;
}

export function approveRequest(roomId: string, index: number): RoomState {
  const room = getOrCreateRoom(roomId);
  const [request] = room.requests.splice(index, 1);
  if (request) room.playlist.push(request);
  return room;
}

export function rejectRequest(roomId: string, index: number): RoomState {
  const room = getOrCreateRoom(roomId);
  room.requests.splice(index, 1);
  return room;
}

export function addToPlaylist(roomId: string, track: TrackRequest): RoomState {
  const room = getOrCreateRoom(roomId);
  room.playlist.push(track);
  return room;
}
