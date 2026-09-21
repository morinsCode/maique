import express from "express";
import { roomsRouter } from "./routes/rooms.routes.ts";
import { setupWebSocket } from "./websocket.ts";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/rooms", roomsRouter);

const server = app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});

setupWebSocket(server);
