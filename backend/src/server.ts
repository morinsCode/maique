import path from "node:path";
import express from "express";
import { roomsRouter } from "./routes/rooms.routes.ts";
import { setupWebSocket } from "./websocket.ts";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/rooms", roomsRouter);

// In production (Docker) the backend also serves the built frontend. In dev
// STATIC_DIR is unset and Vite serves the frontend instead.
const staticDir = process.env.STATIC_DIR;
if (staticDir) {
  app.use(express.static(staticDir));
  // Client-side routes like /dj/abc have no file of their own: send the app
  // and let React Router pick the page.
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.resolve(staticDir, "index.html"));
  });
}

const server = app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});

setupWebSocket(server);
