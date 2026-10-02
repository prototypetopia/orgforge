import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

// A file's suffix is its tier: only the two `TESTS.md` naming patterns are test
// files for this harness. Everything else stays at Vitest defaults (node
// environment, default pool, per-file isolation).
export default defineConfig({
  test: {
    include: ['src/**/*.unit.test.ts', 'src/**/*.mock.test.ts'],
  },
  resolve: {
    // `@/*` -> `./src/*`, matching `tsconfig.json` `paths`. Vite resolves alias
    // replacements against the importing module, so the path is made absolute
    // here; `./src` alone would be resolved relative to each test file. This
    // package is CommonJS, so `__dirname` is used rather than `import.meta.url`.
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
