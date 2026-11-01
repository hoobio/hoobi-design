import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const files = ['DankMono-Regular.woff2', 'DankMono-Italic.woff2', 'DankMono-Bold.woff2'];
const fonts = join(dirname(fileURLToPath(import.meta.url)), 'fonts');
const strict = Boolean(process.env.CI || process.env.TF_BUILD);

if (files.every((f) => existsSync(join(fonts, f)))) {
  console.log('fonts: Dank Mono already in fonts/');
  process.exit(0);
}

const temp = mkdtempSync(join(tmpdir(), 'dankmono-'));
const result = spawnSync(
  'az',
  [
    'artifacts',
    'universal',
    'download',
    '--organization',
    'https://dev.azure.com/Hoobi',
    '--project',
    'Hoobi',
    '--scope',
    'project',
    '--feed',
    'Hoobi',
    '--name',
    'hoobi-design-fonts-dankmono',
    '--version',
    '1.0.0',
    '--path',
    temp,
    '-o',
    'none',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

if (result.status !== 0) {
  rmSync(temp, { recursive: true, force: true });
  const message =
    'fonts: could not download hoobi-design-fonts-dankmono (az not installed or not signed in to the Hoobi org)';
  if (strict) throw new Error(message);
  console.log(`${message}; mono text falls back to Cascadia Mono or the system monospace`);
  process.exit(0);
}

for (const f of files) copyFileSync(join(temp, f), join(fonts, f));
rmSync(temp, { recursive: true, force: true });
console.log('fonts: Dank Mono copied into fonts/');
