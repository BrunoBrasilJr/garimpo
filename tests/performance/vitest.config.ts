import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/performance/*.integration.ts'], environment: 'node',
  testTimeout: 600000, hookTimeout: 180000, fileParallelism: false } });
