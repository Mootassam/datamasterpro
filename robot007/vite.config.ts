import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0', // Crucial change
    hmr: {
      protocol: 'ws',
      host: '162.0.230.49'
    },
    cors: true
  }
});