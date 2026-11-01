import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const themes = join(root, 'dotnet/src/Hoobi.Design.Avalonia/Themes');
export const sourcePath = join(root, 'tokens/tokens.css');
export const stylesPath = join(root, 'react/styles.css');
export const tokensPath = join(themes, 'Tokens.axaml');
export const resourcesPath = join(themes, 'Resources.axaml');

const THEME = /@theme static \{[\s\S]*?\n\}/;
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const pascal = (name) => name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const byte = (n) => n.toString(16).padStart(2, '0').toUpperCase();

export function parseTokens(css) {
  const theme = css.match(THEME)?.[0].replace(/\/\*[\s\S]*?\*\//g, '');
  if (!theme) throw new Error('tokens: no @theme static block in tokens/tokens.css');
  return Object.fromEntries(
    [...theme.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]),
  );
}

export function argb(vars, value) {
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  if (ref) {
    if (!(ref[1] in vars)) throw new Error(`tokens: --${ref[1]} is not defined`);
    return argb(vars, vars[ref[1]]);
  }
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, '$&$&') : hex[1];
    const [r, g, b, a = 255] = full.match(/../g).map((c) => parseInt(c, 16));
    return [a, r, g, b];
  }
  const rgba = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
  if (rgba) return [Math.round(Number(rgba[4]) * 255), ...rgba.slice(1, 4).map(Number)];
  const mix = value.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/);
  if (mix) {
    const [a, pct] = [argb(vars, mix[1]), Number(mix[2])];
    if (mix[3] === 'transparent') return [Math.round((a[0] * pct) / 100), a[1], a[2], a[3]];
    const [b, p] = [argb(vars, mix[3]), pct / 100];
    if (a[0] !== 255 || b[0] !== 255)
      throw new Error(`tokens: cannot mix translucent colours in ${value}`);
    return [255, ...[1, 2, 3].map((i) => Math.round(a[i] * p + b[i] * (1 - p)))];
  }
  throw new Error(`tokens: cannot evaluate ${value}`);
}

const xamlColour = (c) => `#${c.map(byte).join('')}`;

function boxShadows(vars, value) {
  return value
    .split(/,(?![^(]*\))/)
    .map((shadow) => {
      const parts = shadow.trim().match(/rgb\([^)]*\)|#\w+|\S+/g);
      const lengths = parts.slice(0, -1).map((p) => parseFloat(p));
      while (lengths.length < 4) lengths.push(0);
      return `${lengths.join(' ')} ${xamlColour(argb(vars, parts.at(-1)))}`;
    })
    .join(', ');
}

export function tokensXaml(vars) {
  const lines = [];
  for (const [key, value] of Object.entries(vars)) {
    const colour = key.match(/^color-(.+)$/);
    if (colour) {
      const name = pascal(colour[1]);
      lines.push(`    <Color x:Key="Hoobi${name}Color">${xamlColour(argb(vars, value))}</Color>`);
      lines.push(
        `    <SolidColorBrush x:Key="Hoobi${name}Brush" Color="{StaticResource Hoobi${name}Color}" />`,
      );
    }
    const radius = key.match(/^radius-(.+)$/);
    if (radius)
      lines.push(
        `    <CornerRadius x:Key="HoobiRadius${pascal(radius[1])}">${parseFloat(value)}</CornerRadius>`,
      );
    const shadow = key.match(/^shadow-(.+)$/);
    if (shadow)
      lines.push(
        `    <BoxShadows x:Key="HoobiShadow${pascal(shadow[1])}">${boxShadows(vars, value)}</BoxShadows>`,
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
    '<!-- Generated from tokens/tokens.css by tokens/build.mjs; do not edit. -->',
    '<ResourceDictionary',
    '    xmlns="https://github.com/avaloniaui"',
    '    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
    ...lines,
    '</ResourceDictionary>',
    '',
  ].join('\n');
}

export function stylesCss(source, styles) {
  const theme = source.match(THEME)?.[0];
  if (!theme) throw new Error('tokens: no @theme static block in tokens/tokens.css');
  if (!THEME.test(styles)) throw new Error('tokens: no @theme static block in react/styles.css');
  return styles.replace(THEME, () => theme);
}

export function literalColours(xaml) {
  return xaml
    .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '))
    .split('\n')
    .flatMap((line, i) =>
      /#[0-9a-f]{3,8}\b/i.test(line) ||
      /Color="(?!\{|Transparent")[^"]*"|<Color[^>]*>(?!\{)/.test(line)
        ? [`${i + 1}: ${line.trim()}`]
        : [],
    );
}

export function outputs() {
  const source = read(sourcePath);
  const vars = parseTokens(source);
  return [
    [stylesPath, stylesCss(source, read(stylesPath))],
    [tokensPath, tokensXaml(vars)],
  ];
}

export function check() {
  const errors = outputs()
    .filter(([path, text]) => read(path) !== text)
    .map(
      ([path]) =>
        `${relative(root, path)}: stale against tokens/tokens.css - run node tokens/build.mjs`,
    );
  for (const hit of literalColours(read(resourcesPath)))
    errors.push(
      `${relative(root, resourcesPath)}:${hit}: literal colour - add a token to tokens/tokens.css`,
    );
  return errors.map((e) => e.replace(/\\/g, '/'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--check')) {
    const errors = check();
    if (errors.length) {
      console.error(errors.join('\n'));
      process.exit(1);
    }
    console.log('tokens: generated files are current');
  } else {
    for (const [path, text] of outputs()) {
      writeFileSync(path, text);
      console.log(`tokens: wrote ${relative(root, path)}`);
    }
  }
}
