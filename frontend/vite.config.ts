import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // allow importing shared/ types, which lives outside this project's root
      allow: [fileURLToPath(new URL("..", import.meta.url))],
    },
    // forward API/WebSocket calls to the backend so the browser sees a single origin
    proxy: {
      "/rooms": { target: "http://localhost:3000", ws: true },
      "/health": "http://localhost:3000",
    },
  },
});
