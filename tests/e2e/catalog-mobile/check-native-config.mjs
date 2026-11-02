import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const command = spawnSync(process.execPath, ['node_modules/@expo/cli/build/bin/cli', 'config', 'apps/mobile', '--type', 'introspect', '--json'], { cwd: root, encoding: 'utf8', timeout: 60000 });
if (command.error || command.status !== 0) throw new Error('Native config introspection failed; no acceptance inferred.');
const config = JSON.parse(command.stdout), native = config._internal?.modResults;
assert.ok(native?.android?.manifest?.manifest && native?.ios?.infoPlist, 'Both effective native configurations are required.');
assert.equal(config.sdkVersion, '57.0.0'); assert.deepEqual(config.platforms, ['android', 'ios']);
const permissions = native.android.manifest.manifest['uses-permission']; assert.ok(Array.isArray(permissions));
const names = permissions.map(permission => permission.$['android:name']);
for (const forbidden of ['RECORD_AUDIO', 'FOREGROUND_SERVICE_MICROPHONE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK']) assert.equal(names.includes('android.permission.' + forbidden), false);
const services = native.android.manifest.manifest.application?.flatMap(application => application.service ?? []) ?? [];
assert.equal(services.some(service => String(service.$['android:name']).includes('expo.modules.audio')), false);
assert.equal(native.ios.infoPlist.NSMicrophoneUsageDescription, undefined);
assert.equal((native.ios.infoPlist.UIBackgroundModes ?? []).includes('audio'), false);
console.info('Effective Android/iOS config PASS: SDK 57 retained; microphone and audio background capabilities absent. No generated native project or device execution claimed.');
