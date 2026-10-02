import { defineConfig } from '@hey-api/openapi-ts';

// Typed client generated from the backend's committed OpenAPI export.
// Run `npm run api:sync` after the backend's `npm run api:export`.
// BACKEND_DIR lets CI point at a checkout of the backend repo.
const backendDir = process.env.BACKEND_DIR ?? '../SuperAI_Backend';

export default defineConfig({
  input: `${backendDir}/openapi/openapi.json`,
  output: { path: 'src/api/generated' },
  parser: {
    filters: {
      operations: {
        // The chat stream is SSE and hand-written (src/platform/stream). Its error
        // responses are also mislabelled text/event-stream in the OpenAPI file.
        exclude: ['POST /api/v1/conversations/{id}/messages'],
      },
    },
  },
  plugins: [
    { name: '@hey-api/client-fetch', runtimeConfigPath: './src/api/hey-api.ts' },
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@tanstack/react-query',
  ],
});
