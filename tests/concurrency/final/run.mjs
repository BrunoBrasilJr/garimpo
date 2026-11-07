import { isolated } from '../../performance/runner.mjs';
for (const [namespace, config, pattern] of [
  ['004', 'tests/accounts/vitest.integration.config.ts', 'concurrent refresh reuse|two independent transactions attempting to deactivate'],
  ['018', 'tests/checkout/vitest.integration.config.ts', 'two independent sessions replaying|reservation-to-order transfer never exposes'],
  ['019', 'tests/payments/vitest.integration.config.ts', 'two independent sessions applying|expiry and approval contend|two independent refund retries|a concurrent checkout cannot reuse'],
  ['027', 'tests/aftersales/exchanges/vitest.integration.config.ts', 'competing offer responses serialize']
]) await isolated(namespace, config, pattern);
