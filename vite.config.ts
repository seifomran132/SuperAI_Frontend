import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Client-only app (SPA mode): the browser talks to the NestJS API and GoTrue
// directly. Every route is served by the shell (dist/client/_shell.html).
// Public pages (landing, plans) get prerender entries in `pages` when they exist.
export default defineConfig({
  server: { port: 3001 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: { enabled: true },
      pages: [{ path: '/plans' }],
      // Only listed pages: crawling would prerender the _guest pages too.
      prerender: { crawlLinks: false },
    }),
    viteReact(),
  ],
});
