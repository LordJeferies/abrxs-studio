import { execFileSync } from 'node:child_process';

const checks = [
  ['node', ['--version'], true],
  ['npm', ['--version'], true],
  ['git', ['--version'], true],
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
    console.log(`✓ ${bin.padEnd(8)} ${output}`);
  } catch {
    console.log(`${required ? '✗' : '○'} ${bin.padEnd(8)} ${required ? 'REQUIRED' : 'optional / later phase'}`);
    if (required) failedRequired = true;
  }
}

console.log('\nFoundation checks complete.');
if (failedRequired) process.exit(1);
