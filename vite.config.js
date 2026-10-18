import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerenderRoutesPlugin } from './scripts/prerender-routes.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  // prerenderRoutesPlugin: after the build, each public route gets its own HTML with its own title,
  // description, canonical and og tags (scripts/prerender-routes.mjs).
  plugins: [react(), prerenderRoutesPlugin()],
  server: {
    port: 5174,
    host: true,
  },
});
