import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Detect production mode
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: isProd ? [] : ["react-refresh/babel"],
      },
    }),
  ],

  server: {
    host: true,
    allowedHosts: [
      "real-time-pair-programming.up.railway.app",
      "real-time-pair-programming-prototype-production.up.railway.app",
    ],
  },
});

