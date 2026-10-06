import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const checks = [
  ['node', ['--version'], true],
  ['npm', ['--version'], true],
  ['git', ['--version'], true],
  ['rustc', ['--version'], false],
  ['cargo', ['--version'], false],
  ['xcode-select', ['-p'], false],
  ['ffmpeg', ['-version'], false],
  ['ffprobe', ['-version'], false],
  ['gh', ['--version'], false],
];

let failedRequired = false;
console.log('\nAbrxs Studio Doctor\n');

for (const [bin, args, required] of checks) {
  try {
    const output = execFileSync(bin, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n')[0]
      .trim();
    console.log(`✓ ${bin.padEnd(12)} ${output}`);
  } catch {
    console.log(`${required ? '✗' : '○'} ${bin.padEnd(12)} ${required ? 'REQUIRED' : 'optional / capability unavailable'}`);
    if (required) failedRequired = true;
  }
}

const requiredFiles = [
  'apps/desktop/src-tauri/icons/app-icon.svg',
  'apps/desktop/src-tauri/icons/icon.png',
  'apps/desktop/src-tauri/icons/icon.icns',
  'apps/desktop/src-tauri/icons/icon.ico',
  'apps/desktop/src-tauri/tauri.conf.json',
];

console.log('\nDesktop assets:');
for (const relative of requiredFiles) {
  const file = resolve(relative);
  const ok = existsSync(file) && statSync(file).size > 0;
  console.log(`${ok ? '✓' : '✗'} ${relative}`);
  if (!ok) failedRequired = true;
}

console.log('\nReproducibility:');
for (const relative of ['package-lock.json', 'apps/desktop/src-tauri/Cargo.lock']) {
  const file = resolve(relative);
  const ok = existsSync(file) && statSync(file).size > 0;
  console.log(`${ok ? '✓' : '○'} ${relative}${ok ? '' : ' (generate before release)'}`);
}

console.log('\nNotes:');
console.log('- Node/npm/git are required for the shared Studio foundation.');
console.log('- Rust/Cargo + Apple Command Line Tools are required to build the canonical Desktop app.');
console.log('- Native icons are generated from one canonical SVG before every desktop dev/check/build entry point.');
console.log('- package-lock.json and Cargo.lock should be committed for release reproducibility.');
console.log('- FFmpeg/ffprobe become required when Canter/Dresser media engines are enabled.');

console.log('\nFoundation checks complete.');
if (failedRequired) process.exit(1);
