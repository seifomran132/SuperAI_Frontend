import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// Client-only app (SPA mode): the browser talks to the NestJS API and GoTrue
// directly. Every route is served by the shell (dist/client/_shell.html).
// Public pages (landing, plans) are prerendered through `pages`.
export default defineConfig(({ mode }) => ({
  server: { port: 3001 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // The shell renders from a route other than `/`, which is the prerendered
      // landing page. Only the root layout ends up in the shell.
      spa: { enabled: true, maskPath: '/sign-in' },
      pages: [{ path: '/' }, { path: '/plans' }, { path: '/privacy' }],
      // Only listed pages: crawling would prerender the _guest pages too.
      prerender: { crawlLinks: false },
    }),
    viteReact(),
    // `npm run analyze` writes stats.html into each build output (dist/client/stats.html) (chunk contents, gzip sizes).
    mode === 'analyze' &&
      visualizer({ filename: 'stats.html', emitFile: true, gzipSize: true }),
  ],
}));
