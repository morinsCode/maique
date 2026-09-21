import express from "express";
import type { TrackRequest } from "../../shared/types.ts";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});

// keeps the TrackRequest import from being flagged as unused until routes are added
export type { TrackRequest };
