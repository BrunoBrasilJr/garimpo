import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/accounts/lifecycle/**/*.integration.ts', 'tests/accounts/blocking/**/*.integration.ts'], environment: 'node', testTimeout: 45000, hookTimeout: 90000, fileParallelism: false } });
