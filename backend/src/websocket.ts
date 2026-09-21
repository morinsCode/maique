import type { Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import type { RoomState } from "./services/rooms.service.ts";

const roomSockets = new Map<string, Set<WebSocket>>();

function getRoomId(url: string | undefined): string | null {
  const match = url?.match(/^\/rooms\/([^/]+)\/ws$/);
  return match ? match[1] : null;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, req) => {
    const roomId = getRoomId(req.url);
    if (!roomId) {
      socket.close();
      return;
    }

    let sockets = roomSockets.get(roomId);
    if (!sockets) {
      sockets = new Set();
      roomSockets.set(roomId, sockets);
    }
    sockets.add(socket);

    socket.on("close", () => {
      sockets?.delete(socket);
      if (sockets?.size === 0) roomSockets.delete(roomId);
    });
  });
}

export function broadcastRoom(roomId: string, state: RoomState) {
  const sockets = roomSockets.get(roomId);
  if (!sockets) return;
  const payload = JSON.stringify(state);
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}
