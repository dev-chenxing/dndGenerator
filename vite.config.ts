import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/dndGenerator/',
  plugins: [react(), tailwindcss(),],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
    },
  },
});
