#!/usr/bin/env bash
set -euo pipefail
# Run from the repository after npm run build, with the private test environment.
test -n "${TEST_DATABASE_URL:-}" && test -f apps/web/dist/index.html
export NODE_OPTIONS="--max-old-space-size=768 --dns-result-order=ipv4first"
cd apps/mobile
for pair in \
  'tests/e2e/catalog-mobile/entry.tsx:catalog-mobile-preview.js' \
  'tests/engagement/mobile-entry.tsx:engagement-mobile-preview.js' \
  'tests/reviews/mobile-entry.tsx:reviews-mobile-preview.js' \
  'tests/e2e/cart/mobile-entry.tsx:cart-mobile-preview.js' \
  'tests/e2e/checkout/mobile-entry.tsx:purchase-mobile-preview.js' \
  'tests/orders/mobile-entry.tsx:orders-mobile-preview.js' \
  'tests/accounts/lifecycle/mobile-entry.tsx:lifecycle-mobile-preview.js'; do
  node ../../node_modules/@expo/cli/build/bin/cli export:embed --platform web \
    --entry-file "../../${pair%%:*}" --bundle-output "../web/dist/${pair##*:}" \
    --dev false --minify true --max-workers 2
done
cd ../..
for suite in tests/e2e/account tests/e2e/catalog-web tests/e2e/catalog-mobile \
  tests/inventory tests/engagement tests/reviews tests/pricing tests/e2e/cart \
  tests/e2e/freight-admin tests/e2e/checkout tests/orders tests/accounts/lifecycle; do
  NODE_OPTIONS=--max-old-space-size=512 node node_modules/@playwright/test/cli.js test --config "$suite/playwright.config.ts"
done
# Post-sale/report UI and native bundles have fresh TASK-032 evidence on the same
# production source. Keep that evidence rather than repeating it for documentation.
