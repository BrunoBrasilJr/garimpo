import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
  include: ['tests/operations/backup/*.integration.ts'], environment: 'node', testTimeout: 90000, hookTimeout: 90000, fileParallelism: false
} });
