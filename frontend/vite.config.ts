import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Vendor splitting. Without it everything lands in one ~800 kB chunk, which
    // blocks first paint on the home page and invalidates the entire bundle on
    // any application change. These four libraries have very different update
    // cadences, so separating them also makes browser caching far more useful.
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
