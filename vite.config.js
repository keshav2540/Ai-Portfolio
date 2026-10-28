import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api calls go to the Python (FastAPI) backend during development
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8000" } },
});
