import { defineConfig } from 'orval';

export default defineConfig({
  fnoApi: {
    input: {
      target: './openapi.json',
    },
    output: {
      mode: 'single',
      target: './src/openapi/api-client.ts',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/openapi/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
