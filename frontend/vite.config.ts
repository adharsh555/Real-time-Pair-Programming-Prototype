import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Plugin } from "vite";

// Detect production mode
const isProd = process.env.NODE_ENV === "production";

// --- REMOVE React Refresh from production ---
function removeReactRefresh(): Plugin {
  return {
    name: "remove-react-refresh",
    enforce: "post",
    transform(code) {
      if (isProd) {
        // Remove $RefreshSig$ calls
        return code
          .replace(/\$RefreshSig\$\([\s\S]*?\);?/g, "")
          .replace(/\$RefreshReg\$\([\s\S]*?\);?/g, "")
          .replace(/import\s+["']react-refresh["'];?/g, "")
          .replace(/\/\*.*react-refresh.*\*\//g, "");
      }
      return code;
    },
  };
}

export default defineConfig({
  plugins: [
    react(),           // normal react plugin
    removeReactRefresh(), // 🔥 remove all refresh/hmr code in production
  ],

  server: {
    host: true,
    allowedHosts: [
      "real-time-pair-programming.up.railway.app",
      "real-time-pair-programming-prototype-production.up.railway.app",
    ],
  },
});
