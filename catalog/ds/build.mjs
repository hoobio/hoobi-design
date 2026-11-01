import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build, createServer, transformWithOxc } from 'vite';
import EXAMPLES from './examples.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = resolve(here, '..');
const repo = resolve(catalog, '..');
const outArg = process.argv.indexOf('--out');
const root = resolve(outArg > 0 ? process.argv[outArg + 1] : join(catalog, 'design-system'));
const out = join(root, 'project');

const read = (p) => readFileSync(join(repo, p), 'utf8');
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
const version = JSON.parse(read('package.json')).version;
const sha = git('rev-parse', '--short', 'HEAD');
const tag = git('tag', '--points-at', 'HEAD')
  .split('\n')
  .find((t) => t === `v${version}`);
const by = git('config', 'user.name') || 'Claude';
const now = new Date().toISOString();
const usage = JSON.parse(readFileSync(join(here, 'usage.json'), 'utf8'));
const skipped = [];

function write(path, body) {
  const full = join(out, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
}

const need = (name) => {
  if (!usage[name]) throw new Error(`catalog/ds/usage.json has no usage note for ${name}`);
  return usage[name];
};

function tokens() {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const body = css.match(/@theme static \{([\s\S]*?)\n\}/)?.[1];
  if (!body) throw new Error('no @theme static block in styles.css');
  const vars = [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, n, v]) => [
    n,
    v.replace(/\s+/g, ' ').trim(),
  ]);
  const colours = [];
  const spacing = [];
  const radius = [];
  const shadow = [];
  const families = {};
  const styles = new Map();
  const hexOf = new Map(vars.filter(([, v]) => /^#[0-9a-f]{6}$/i.test(v)));
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixed = (value) => {
    const v = value
      .replace(/var\(--([\w-]+)\)/g, (ref, n) => hexOf.get(n) ?? ref)
      .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])\b/gi, '#$1$1$2$2$3$3');
    const m = v.match(/^color-mix\(in srgb, (#[0-9a-f]{6}) (\d+)%, (#[0-9a-f]{6})\)$/i);
    if (!m) return null;
    const [a, b, p] = [rgb(m[1]), rgb(m[3]), m[2] / 100];
    const channel = (x, i) => Math.round(x * p + b[i] * (1 - p));
    return `#${a.map((x, i) => channel(x, i).toString(16).padStart(2, '0')).join('')}`;
  };
  for (const [name, value] of vars) {
    if (name.startsWith('color-')) {
      const hex = /^#[0-9a-f]{3,8}$/i.test(value) ? value : mixed(value);
      if (hex) colours.push({ name, value: hex.toLowerCase(), usage: need(name) });
      else skipped.push(`\`--${name}\` (\`${value}\`): a computed colour has no token form`);
    } else if (name === 'spacing') spacing.push({ name, value, usage: need(name) });
    else if (name.startsWith('radius-')) radius.push({ name, value, usage: need(name) });
    else if (name.startsWith('shadow-')) shadow.push({ name, value, usage: need(name) });
    else if (name.startsWith('font-')) families[name.slice(5)] = value;
    else if (name.startsWith('ease-'))
      skipped.push(`\`--${name}\` (\`${value}\`): the format has no motion family`);
    else if (name.startsWith('text-')) {
      const [base, part] = name.split('--');
      const style = styles.get(base) ?? { name: base.slice(5) };
      if (!part) style.fontSize = value;
      else if (part === 'line-height') style.lineHeight = value;
      else if (part === 'font-weight') style.fontWeight = Number(value);
      else if (part === 'letter-spacing') style.letterSpacing = value;
      else throw new Error(`unplaced type variable --${name}`);
      styles.set(base, style);
    } else throw new Error(`styles.css --${name} has no family in catalog/ds/build.mjs`);
  }
  const fonts = [...read('styles.css').matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, b]) => {
    const get = (k) => b.match(new RegExp(`${k}:\\s*([^;]+);`))?.[1].trim();
    return {
      family: get('font-family').replace(/['"]/g, ''),
      file: get('src').match(/url\('\.\/(fonts\/[^']+)'\)/)[1],
      weight: get('font-weight'),
      style: get('font-style'),
    };
  }).filter((f) => existsSync(join(repo, f.file)));
  const typeStyles = [...styles.entries()].map(([base, s]) => ({
    ...s,
    fontWeight: s.fontWeight ?? 400,
    usage: need(base),
  }));
  return {
    name: 'Hoobi Design',
    version: 1,
    meta: {
      source: 'git',
      repo: 'https://dev.azure.com/Hoobi/Hoobi/_git/hoobi-design',
      ref: `${tag ?? 'main'}@${sha}`,
      package: '@hoobi/design',
      version,
      paths: {
        tokens: ['styles.css'],
        fonts: fonts.map((f) => f.file),
        docs: ['AGENTS.md', 'catalog/src/pages.tsx', 'catalog/ds'],
      },
      synced: now.slice(0, 10),
    },
    color: { themes: [{ id: 'dark', name: 'Dark' }], tokens: colours },
    type: {
      fonts,
      families,
      groups: [
        {
          name: 'Text',
          family: 'sans',
          note: 'The WinUI 3 ramp in rem against the 18px root (16px under 40rem), so text tracks user zoom. Reached as Tailwind utilities: text-caption, text-body and so on.',
          styles: typeStyles,
        },
      ],
    },
    spacing: { note: 'A 4px pixel grid.', tokens: spacing },
    radius: { note: 'Two radii: 4px controls, 8px surfaces.', tokens: radius },
    shadow: { note: 'Depth is fill; the one shadow is for flyouts.', tokens: shadow },
  };
}

function tokensCss(t) {
  const decl = (list) => list.map((x) => `  --${x.name}: ${x.value};`).join('\n');
  const fams = Object.entries(t.type.families)
    .map(([k, v]) => `  --font-${k}: ${v};`)
    .join('\n');
  const classes = t.type.groups.flatMap((g) =>
    g.styles.map(
      (s) =>
        `.${s.name} {\n  font-family: var(--font-${s.family ?? g.family});\n  font-size: ${s.fontSize};\n  line-height: ${s.lineHeight};\n  font-weight: ${s.fontWeight};${s.letterSpacing ? `\n  letter-spacing: ${s.letterSpacing};` : ''}\n}`,
    ),
  );
  const faces = t.type.fonts.map(
    (f) =>
      `@font-face {\n  font-family: '${f.family}';\n  src: url('${f.file}') format('woff2');\n  font-weight: ${f.weight};\n  font-style: ${f.style};\n  font-display: swap;\n}`,
  );
  return [
    `/* Hoobi Design \u2014 generated from tokens.json */`,
    `:root, [data-theme="${t.color.themes[0].id}"] {\n${decl([...t.color.tokens, ...t.shadow.tokens])}\n}`,
    `:root {\n${decl([...t.spacing.tokens, ...t.radius.tokens])}\n${fams}\n}`,
    ...classes,
    ...faces,
    '',
  ].join('\n');
}

function bundleCss(declared) {
  const html = readFileSync(join(catalog, 'dist/index.html'), 'utf8');
  const style = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1];
  if (!style)
    throw new Error('no inlined <style> in catalog/dist/index.html - run vite build first');
  let css = style.replace(/@font-face\{[^}]*\}/g, '');
  for (const name of declared) {
    css = css.replace(new RegExp(`(?<=[{;])--${name}:[^;}]*;?`, 'g'), '');
  }
  return css.replace(/:root,:host\{\}/g, '');
}

async function bundleJs(components) {
  const shim = `const R = window.React;
export const Fragment = R.Fragment;
function make(type, props, key, isStatic) {
  const { children, ...rest } = props;
  if (key !== undefined) rest.key = key;
  if (children === undefined) return R.createElement(type, rest);
  return isStatic && Array.isArray(children) ? R.createElement(type, rest, ...children) : R.createElement(type, rest, children);
}
export const jsx = (type, props, key) => make(type, props, key, false);
export const jsxs = (type, props, key) => make(type, props, key, true);`;
  const [result] = await build({
    configFile: false,
    logLevel: 'warn',
    root: repo,
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      {
        name: 'react-globals',
        enforce: 'pre',
        resolveId: (id) => (id === 'react/jsx-runtime' ? '\0jsx-runtime' : null),
        load: (id) => (id === '\0jsx-runtime' ? shim : null),
      },
    ],
    build: {
      write: false,
      minify: true,
      lib: {
        entry: join(repo, 'dist/index.js'),
        formats: ['iife'],
        name: 'HoobiDesign',
        fileName: () => 'bundle.js',
      },
      rolldownOptions: {
        external: ['react', 'react-dom'],
        output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
      },
    },
  });
  const code = result.output[0].code;
  const header = {
    format: 4,
    namespace: 'HoobiDesign',
    components: components.map((name) => ({ name })),
  };
  return `/* @ds-bundle: ${JSON.stringify(header)} */\n${code}`;
}

function indexDts(files) {
  const reactTypes = new Set();
  const bodies = files.map((f) =>
    readFileSync(join(repo, 'dist', `${f}.d.ts`), 'utf8')
      .split('\n')
      .filter((line) => {
        const named = line.match(/^import (?:type )?\{([^}]+)\} from ['"]react['"];?$/)?.[1];
        named?.split(',').forEach((n) => reactTypes.add(n.replace(/^\s*type\s+/, '').trim()));
        return (
          !/^(import|export) .* from ['"](\.\/.*|react)['"];?$/.test(line) &&
          !line.startsWith('//# sourceMappingURL')
        );
      })
      .join('\n')
      .trim(),
  );
  return `import type { ${[...reactTypes].sort().join(', ')} } from 'react';\n\n${bodies.join('\n\n')}\n`;
}

function propsOf(file, name) {
  const dts = readFileSync(join(repo, 'dist', `${file}.d.ts`), 'utf8');
  const start = dts.search(
    new RegExp(`(/\\*\\*(?:(?!\\*/)[\\s\\S])*\\*/\\s*)?export (interface|type) ${name}Props\\b`),
  );
  if (start < 0) return null;
  const open = dts.indexOf(name + 'Props', start);
  let i = dts.indexOf('{', open);
  if (dts.slice(open, i).includes(';')) return dts.slice(start, dts.indexOf(';', open) + 1);
  for (let depth = 0; i < dts.length; i++) {
    if (dts[i] === '{') depth++;
    else if (dts[i] === '}' && --depth === 0) break;
  }
  return dts.slice(start, i + 1).trim();
}

function readAttr(s, i) {
  const m = /^\s*([A-Za-z]+)(=)?/.exec(s.slice(i));
  if (!m) return null;
  i += m[0].length;
  if (!m[2]) return { name: m[1], value: true, end: i };
  if (s[i] === '"') {
    const j = s.indexOf('"', i + 1);
    return { name: m[1], value: s.slice(i + 1, j), end: j + 1 };
  }
  if (s[i] !== '{') return null;
  let k = i + 1;
  while (/\s/.test(s[k])) k++;
  if ('`\'"'.includes(s[k])) {
    let j = k + 1;
    while (s[j] !== s[k] || s[j - 1] === '\\') j++;
    return { name: m[1], value: s.slice(k + 1, j), end: s.indexOf('}', j) + 1 };
  }
  let depth = 0;
  let j = i;
  for (; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) break;
  }
  return { name: m[1], value: null, end: j + 1 };
}

function catalogDemos(component) {
  for (const file of ['src/components.tsx', 'src/settings.tsx']) {
    const src = readFileSync(join(catalog, file), 'utf8');
    const start = src.indexOf(`export function ${component}Page(`);
    if (start < 0) continue;
    const next = src.slice(start + 1).search(/^(export )?function /m);
    const body = src.slice(start, next < 0 ? undefined : start + 1 + next);
    return [...body.matchAll(/<Demo\b/g)].map((m) => {
      const demo = {};
      let i = m.index + 5;
      for (let a; (a = readAttr(body, i)); i = a.end) demo[a.name] = a.value;
      const open = body.indexOf('>', i);
      demo.children = body.slice(open + 1, body.indexOf('</Demo>', open)).trim();
      return demo;
    });
  }
  return [];
}

async function compile(code, id) {
  const lines = code.split('\n');
  const at = lines.findIndex((l) => l.startsWith('<'));
  const pre = at > 0 ? lines.slice(0, at).join('\n') : '';
  const jsx = at > 0 ? lines.slice(at).join('\n') : code;
  const { code: js } = await transformWithOxc(
    `function ${id}() {\n${pre}\nreturn (<>${jsx}</>);\n}`,
    `${id}.tsx`,
    { lang: 'tsx', jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'F' } },
  );
  return js.trim();
}

const HOOKS = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback'];

function ssr(js, id, lib) {
  const names = Object.keys(lib);
  const fn = new Function(...names, ...HOOKS, 'h', 'F', `${js}\nreturn ${id};`);
  const C = fn(
    ...names.map((n) => lib[n]),
    ...HOOKS.map((n) => React[n]),
    React.createElement,
    React.Fragment,
  );
  const logged = [];
  const consoleError = console.error;
  console.error = (...args) => logged.push(args.join(' '));
  try {
    renderToStaticMarkup(React.createElement(C));
  } finally {
    console.error = consoleError;
  }
  if (logged.length) throw new Error(logged[0]);
}

async function examples(component, lib) {
  const own = EXAMPLES[component];
  const usable = (code) =>
    typeof code === 'string' &&
    code &&
    !code.includes('${') &&
    !/(^|>)\s*\.\.\.\s*($|<)/m.test(code);
  const candidates = own ?? catalogDemos(component);
  const kept = [];
  for (const demo of candidates) {
    if (kept.length === 4) break;
    const id = `Example${kept.length}`;
    const sources = own ? [demo.code] : [demo.children, demo.code].filter(usable);
    for (const source of sources) {
      try {
        const js = await compile(source, id);
        ssr(js, id, lib);
        kept.push({ ...demo, id, js });
        break;
      } catch (error) {
        if (own)
          throw new Error(`catalog/ds/examples.mjs ${component} "${demo.title}": ${error.message}`);
      }
    }
  }
  return kept;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function preview({ name, group, caption, list, libNames, height }) {
  const script = `(function () {
var h = React.createElement, F = React.Fragment;
var ${HOOKS.map((n) => `${n} = React.${n}`).join(', ')};
var { ${libNames.join(', ')} } = window.HoobiDesign;
${list.map((e) => e.js).join('\n')}
var examples = [${list.map((e) => `[${JSON.stringify(e.title ?? '')}, ${e.id}, ${e.stack ? 'true' : 'false'}, ${e.flush ? 'true' : 'false'}]`).join(', ')}];
function Preview() {
  if (${list.some((e) => e.bare)}) return h(examples[0][1]);
  return h('div', { className: 'flex flex-col gap-6 p-4' }, examples.map(function (e) {
    var surface = 'rounded-panel bg-surface ' + (e[3] ? 'py-2 ' : 'p-4 ') + (e[2] ? 'flex flex-col gap-4' : 'flex flex-wrap items-center gap-3');
    return h('section', { key: e[0] }, h('h3', { className: 'mb-2 text-caption text-text-dim' }, e[0]), h('div', { className: surface }, h(e[1])));
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(Preview));
})();`;
  if (/<\/script|<!--/i.test(script))
    throw new Error(`${name} preview script holds </script or <!--`);
  return `<!-- @dsCard group="${esc(group)}" height=${height} subtitle="${esc(caption)}" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(name)}</title>
</head>
<body>
<div id="root"></div>
<script>
${script}
</script>
</body>
</html>
`;
}

function sections(md) {
  const map = {};
  for (const part of md.split(/^## /m).slice(1)) {
    const nl = part.indexOf('\n');
    map[part.slice(0, nl).trim()] = part.slice(nl + 1).trim();
  }
  return map;
}

const PARTS = {
  SettingRow: ['SettingList', 'SettingGroup'],
  Stat: ['StatStrip'],
  ReorderList: ['ReorderGrip'],
};

function componentReadme({ name, caption, guidance, list, file }) {
  const props = [name, ...(PARTS[name] ?? [])].map((n) => propsOf(file, n)).filter(Boolean);
  const notes = list.filter((e) => e.note).map((e) => `- **${e.title}**: ${e.note}`);
  return `${[
    `# ${name}`,
    caption,
    guidance,
    PARTS[name] && `Parts that share this card: ${PARTS[name].map((p) => `\`${p}\``).join(', ')}.`,
    notes.length && `## Examples\n\n${notes.join('\n')}`,
    props.length && `## Props\n\n\`\`\`ts\n${props.join('\n\n')}\n\`\`\``,
  ]
    .filter(Boolean)
    .join('\n\n')}\n`;
}

function check(tokenSet) {
  const errors = [];
  const files = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const full = join(dir, f);
      if (statSync(full).isDirectory()) walk(full);
      else files.push(relative(root, full).split('\\').join('/'));
    }
  };
  walk(root);
  const css = readFileSync(join(out, 'components/bundle.css'), 'utf8');
  const selector = (c) => `.${c.replace(/[:/[\].@%()#,!]/g, (m) => `\\${m}`)}`;
  const toolchain =
    /(^|\/)(package\.json|pnpm-lock\.yaml|package-lock\.json|tsconfig\.json|CLAUDE\.md|AGENTS\.md|node_modules)(\/|$)/;
  let total = 0;
  for (const path of files) {
    const size = statSync(join(root, path)).size;
    total += size;
    if (!path.startsWith('project/')) errors.push(`${path}: outside project/`);
    if (path.split('/').some((seg) => seg.startsWith('.'))) errors.push(`${path}: dot-file`);
    if (toolchain.test(path)) errors.push(`${path}: toolchain file`);
    if (size > 15 * 1024 * 1024) errors.push(`${path}: over 15 MiB`);
    if (/\.(md|json|css|js|ts|html)$/.test(path)) {
      const text = readFileSync(join(root, path), 'utf8');
      const lines = path === 'project/tokens.css' ? text.split('\n').slice(1) : [text];
      if (lines.some((l) => l.includes('\u2014'))) errors.push(`${path}: em-dash`);
      if (path.endsWith('/preview.html')) {
        if (size > 256 * 1024) errors.push(`${path}: preview over 256 KB`);
        if (!/^<!-- @dsCard [^\n]*height=\d+[^\n]*-->\n/.test(text))
          errors.push(`${path}: line 1 is not the marker`);
        const classes = [...text.matchAll(/className: ["']([^"']*)["']/g)].flatMap((m) =>
          m[1].split(/\s+/).filter(Boolean),
        );
        for (const c of new Set(classes)) {
          if (!css.includes(selector(c)))
            errors.push(`${path}: .${c} is not in bundle.css - use a class the catalog uses`);
        }
      }
    }
  }
  if (files.length > 1008) errors.push(`${files.length} files, over 1,008`);
  const js = readFileSync(join(out, 'components/bundle.js'), 'utf8');
  if (Buffer.byteLength(js) > 6 * 1024 * 1024) errors.push('bundle.js over 6 MB');
  if (/<\/script|<!--/i.test(js)) errors.push('bundle.js holds </script or <!--');
  if (!js.startsWith('/* @ds-bundle: {"format":4,"namespace":"HoobiDesign"'))
    errors.push('bundle.js line 1 is not the header');
  const nameRe = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
  const seen = new Set();
  for (const fam of ['color', 'spacing', 'radius', 'shadow']) {
    for (const t of tokenSet[fam].tokens) {
      if (!nameRe.test(t.name)) errors.push(`token ${t.name}: bad name`);
      if (seen.has(t.name)) errors.push(`token ${t.name}: duplicate`);
      seen.add(t.name);
      if (!t.usage) errors.push(`token ${t.name}: no usage`);
    }
  }
  const colourNames = new Set(tokenSet.color.tokens.map((t) => t.name));
  for (const t of tokenSet.color.tokens) {
    for (const v of typeof t.value === 'string' ? [t.value] : Object.values(t.value)) {
      const alias = v.match(/^\{(.+)\}$/)?.[1];
      if (
        alias
          ? !colourNames.has(alias) || alias === t.name
          : !/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)
      )
        errors.push(`colour ${t.name}: ${v} is not a valid value`);
    }
  }
  if (errors.length) throw new Error(`format check failed:\n${errors.join('\n')}`);
  return { files: files.length, total };
}

const server = await createServer({
  configFile: join(catalog, 'vite.config.ts'),
  root: catalog,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
});

try {
  const { PAGES } = await server.ssrLoadModule('/src/pages.tsx');
  const lib = await import('@hoobi/design');
  const index = read('src/index.ts');
  const fileOf = (name) =>
    [...index.matchAll(/export \{([^}]+)\} from '\.\/(\w+)\.js'/g)].find(([, names]) =>
      names.split(',').some((n) => n.trim() === name),
    )?.[2];

  rmSync(root, { recursive: true, force: true });

  const t = tokens();
  write('tokens.json', `${JSON.stringify(t, null, 2)}\n`);
  write('tokens.css', tokensCss(t));
  mkdirSync(join(out, 'fonts'), { recursive: true });
  for (const f of t.type.fonts) copyFileSync(join(repo, f.file), join(out, f.file));
  copyFileSync(join(repo, 'fonts/OFL.txt'), join(out, 'fonts/OFL.txt'));

  const guidance = sections(readFileSync(join(here, 'guidance.md'), 'utf8'));
  const libNames = Object.keys(lib);
  const cards = [];
  for (const page of PAGES) {
    const name = String(page.render).match(/\b([A-Z]\w*)Page\b/)?.[1];
    if (!name || (typeof lib[name] !== 'function' && typeof lib[name] !== 'object')) continue;
    const list = await examples(name, lib);
    if (!list.length)
      throw new Error(`${name}: no catalog example renders - add one to catalog/ds/examples.mjs`);
    const height = Math.min(
      4000,
      32 + list.reduce((n, e) => n + 40 + (e.height ?? (e.stack ? 160 : 72)), 0),
    );
    write(
      `components/${name}/preview.html`,
      preview({ name, group: page.group, caption: page.caption, list, libNames, height }),
    );
    write(
      `components/${name}/README.md`,
      componentReadme({
        name,
        caption: page.caption,
        guidance: guidance[name],
        list,
        file: fileOf(name),
      }),
    );
    cards.push(name);
  }

  const declared = [...t.color.tokens, ...t.shadow.tokens, ...t.spacing.tokens, ...t.radius.tokens]
    .map((x) => x.name)
    .concat(Object.keys(t.type.families).map((k) => `font-${k}`));
  write('components/bundle.css', bundleCss(declared));
  write('components/bundle.js', await bundleJs(cards));
  const files = [...new Set([...index.matchAll(/from '\.\/(\w+)\.js'/g)].map((m) => m[1]))];
  write('components/index.d.ts', indexDts(files));

  skipped.push(
    '`.mirage-scoped`, `.mirage-flyout` and `.mirage-lift` lift `--color-text-dim` to `#a6adb6` and `--color-text-mute` to `#949daa` inside a mirage: a scoped override, not a theme',
    'The parts `SettingList`, `SettingGroup`, `StatStrip` and `ReorderGrip` share their parent card, as in the catalog',
  );
  const brand = readFileSync(join(here, 'brand.md'), 'utf8').trimEnd();
  write('README.md', `${brand}\n\n## Not synced\n\n${skipped.map((s) => `- ${s}`).join('\n')}\n`);

  write('components/Cover/preview.html', readFileSync(join(here, 'cover.html'), 'utf8'));

  write(
    'design-system.json',
    `${JSON.stringify(
      {
        v: 3,
        layout: 'files',
        createdOnFiles: { v: 1, at: now },
        title: 'Hoobi Design',
        namespace: 'HoobiDesign',
        libraries: [
          { name: 'react', version: '18' },
          { name: 'react-dom', version: '18' },
        ],
        sections: {},
        groups: [],
        assetGroups: {},
        blobs: {},
        docs: { readme: 'project/README.md', sections: [] },
        editing: 'code',
        lastChange: {
          by,
          at: now,
          via: `Claude Code \u00b7 hoobi-design@${sha}`,
          note: `@hoobi/design ${version}: ${t.color.tokens.length} colours, ${cards.length} components`,
        },
      },
      null,
      2,
    )}\n`,
  );

  const { files: count, total } = check(t);
  console.log(
    `${relative(process.cwd(), out) || out}: ${count} files, ${(total / 1024 / 1024).toFixed(2)} MB, ${cards.length} components, @hoobi/design ${version} @ ${sha}`,
  );
} finally {
  await server.close();
}
