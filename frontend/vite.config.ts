import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow external access
    allowedHosts: [
      "real-time-pair-programming.up.railway.app",              // Frontend domain
      "real-time-pair-programming-prototype-production.up.railway.app", // Backend API domain
    ],
  },
});
