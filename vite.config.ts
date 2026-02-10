import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Needed for GitHub Pages when deploying to:
  // https://<username>.github.io/be-my-valentine/
  base: "/be-my-valentine/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});

