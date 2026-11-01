import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const tokensPath = join(root, 'dotnet/src/Hoobi.Design.Avalonia/Themes/Tokens.axaml');

const pascal = (name) => name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const hex = (rgb) => rgb.map((c) => c.toString(16).padStart(2, '0').toUpperCase()).join('');

export function tokensXaml(css) {
  const theme = css.match(/@theme static \{([\s\S]*?)\n\}/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const vars = Object.fromEntries(
    [...theme.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]),
  );
  const rgb = (value) => {
    const ref = value.match(/^var\(--([\w-]+)\)$/);
    if (ref) return rgb(vars[ref[1]]);
    const plain = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (plain)
      return (plain[1].length === 3 ? plain[1].replace(/./g, '$&$&') : plain[1])
        .match(/../g)
        .map((c) => parseInt(c, 16));
    const mix = value.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/);
    if (mix) {
      const [a, p, b] = [rgb(mix[1]), Number(mix[2]) / 100, rgb(mix[3])];
      return a.map((c, i) => Math.round(c * p + b[i] * (1 - p)));
    }
    throw new Error(`build-tokens: cannot evaluate ${value}`);
  };

  const lines = [];
  for (const [key, value] of Object.entries(vars)) {
    const colour = key.match(/^color-(.+)$/);
    if (colour) {
      const name = pascal(colour[1]);
      lines.push(`    <Color x:Key="Hoobi${name}Color">#FF${hex(rgb(value))}</Color>`);
      lines.push(
        `    <SolidColorBrush x:Key="Hoobi${name}Brush" Color="{StaticResource Hoobi${name}Color}" />`,
      );
    }
    const radius = key.match(/^radius-(.+)$/);
    if (radius)
      lines.push(
        `    <CornerRadius x:Key="HoobiRadius${pascal(radius[1])}">${parseFloat(value)}</CornerRadius>`,
      );
    const ease = key.match(/^ease-(.+)$/);
    if (ease) {
      const [x1, y1, x2, y2] = value
        .match(/cubic-bezier\(([^)]+)\)/)[1]
        .split(',')
        .map((n) => n.trim());
      lines.push(
        `    <SplineEasing x:Key="HoobiEase${pascal(ease[1])}" X1="${x1}" Y1="${y1}" X2="${x2}" Y2="${y2}" />`,
      );
    }
  }

  return [
    '<!-- Generated from styles.css @theme by dotnet/build-tokens.mjs; do not edit. -->',
    '<ResourceDictionary',
    '    xmlns="https://github.com/avaloniaui"',
    '    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
    ...lines,
    '</ResourceDictionary>',
    '',
  ].join('\n');
}

export const readTokens = () => tokensXaml(readFileSync(join(root, 'react/styles.css'), 'utf8'));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(tokensPath, readTokens());
  console.log(`build-tokens: wrote ${tokensPath}`);
}
