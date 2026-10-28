import { useEffect, useState } from "react";
import type { PlaylistEntry, TrackRequest } from "../../../shared/types.ts";

type RoomState = {
  requests: TrackRequest[];
  playlist: PlaylistEntry[];
};

// Fetches a room's state from the backend, keeps it live via WebSocket, and exposes mutations as REST calls.
export function useRoomState(roomId: string) {
  const [state, setState] = useState<RoomState>({ requests: [], playlist: [] });

  useEffect(() => {
    let cancelled = false;

    function fetchState() {
      fetch(`/rooms/${roomId}/state`)
        .then((res) => res.json())
        .then((data: RoomState) => {
          if (!cancelled) setState(data);
        })
        .catch(() => {
          // ignore transient failures (e.g. backend restarting) — the next reconnect attempt will retry
        });
    }

    fetchState();

    let socket: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      socket = new WebSocket(
        `${protocol}://${window.location.host}/rooms/${roomId}/ws`,
      );
      socket.onmessage = (event) => {
        setState(JSON.parse(event.data) as RoomState);
      };
      socket.onclose = () => {
        if (cancelled) return;
        // re-sync in case state changed while disconnected, then retry the socket
        fetchState();
        reconnectTimer = setTimeout(connect, 1000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      socket.onclose = null;
      socket.close();
    };
  }, [roomId]);

  async function submitRequest(request: TrackRequest) {
    await fetch(`/rooms/${roomId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  }

  async function addToPlaylist(track: TrackRequest) {
    await fetch(`/rooms/${roomId}/playlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(track),
    });
  }

  async function removeFromPlaylist(id: string) {
    await fetch(`/rooms/${roomId}/playlist/${id}`, { method: "DELETE" });
  }

  async function approve(index: number) {
    await fetch(`/rooms/${roomId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
  }

  async function reject(index: number) {
    await fetch(`/rooms/${roomId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
  }

  return {
    ...state,
    submitRequest,
    addToPlaylist,
    removeFromPlaylist,
    approve,
    reject,
  };
}
