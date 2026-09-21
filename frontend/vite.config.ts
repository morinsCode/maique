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
  },
});
