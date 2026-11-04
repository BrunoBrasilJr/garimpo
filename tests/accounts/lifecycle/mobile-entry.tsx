import { registerRootComponent } from 'expo';
import App from '../../../apps/mobile/src/navigation/App';
import { MobileAccountClient } from '../../../apps/mobile/src/features/account/client';
/** Actual native navigation/client. Only refresh storage is test-only memory; no SecureStore/device claim. */
let failCleanup = false; Object.assign(globalThis, { failLifecycleCleanupOnce: () => { failCleanup = true; } });
function clientFactory() { let refresh: string | null = null; return new MobileAccountClient(location.origin, { get: async () => refresh, set: async value => { refresh = value; }, clear: async () => { if (failCleanup) { failCleanup = false; throw new Error('isolated cleanup failure'); } refresh = null; } }, globalThis.fetch.bind(globalThis)); }
function Preview() { return <App clientFactory={clientFactory} />; }
registerRootComponent(Preview);
