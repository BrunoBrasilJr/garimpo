import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/aftersales/cancellations/*.integration.ts'],
    environment: 'node',
    testTimeout: 45000,
    hookTimeout: 90000,
    fileParallelism: false
  }
});
