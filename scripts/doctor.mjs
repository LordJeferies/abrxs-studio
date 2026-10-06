import { execFileSync } from 'node:child_process';

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

console.log('\nNotes:');
console.log('- Node/npm/git are required for the shared Studio foundation.');
console.log('- Rust/Cargo + Apple Command Line Tools are required to build the canonical Desktop app.');
console.log('- FFmpeg/ffprobe become required when Canter/Dresser media engines are enabled.');

console.log('\nFoundation checks complete.');
if (failedRequired) process.exit(1);
