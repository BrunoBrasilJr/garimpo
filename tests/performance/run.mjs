import { isolated } from './runner.mjs';
// Existing foundation guard is reused, always in a fresh UUID schema.
await isolated('030', 'tests/performance/vitest.config.ts');
