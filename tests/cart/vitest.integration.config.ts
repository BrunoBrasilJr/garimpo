import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/cart/**/*.integration.ts'], environment: 'node', testTimeout: 30000, hookTimeout: 60000, fileParallelism: false } });
