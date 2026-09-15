import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

/**
 * Builds the Claude Design system bundle: one standalone HTML card per catalog
 * page, plus the tokens and a hash manifest.
 *
 * Server-rendered on purpose. The catalog's own dist/index.html is a 610KB React
 * bundle; a design system built from bundled JS gives a reader nothing to read
 * directly. The value is that the real markup and the real utility classes are
 * visible. Static also means no runtime, so a card cannot break.
 *
 * Everything comes from catalog/src/pages.tsx, the same list the catalog nav
 * renders, so a component cannot be in one and missing from the other.
 *
 * ponytail: every card includes the full compiled stylesheet (~350KB, of which
 * 186KB is the four inlined woff2). Duplicated across ~30 cards, that is ~10MB
 * of bundle. Simple and correct; if the size becomes a problem, compile
 * Tailwind per rendered card instead, which drops each to a few KB.
 */

const OUT = 'design-system';
const version = JSON.parse(readFileSync('../package.json', 'utf8')).version;

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * The compiled stylesheet, lifted out of the catalog's single-file build. Reusing
 * it means the cards are styled by the exact CSS the catalog was verified in -
 * a second Tailwind invocation here would be a second source of truth.
 */
function stylesheet() {
  const html = readFileSync('dist/index.html', 'utf8');
  // Scripts go first: the bundled hljs XML grammar contains the literal text
  // `<style(?=\s|>)`, so matching the style tag on the raw file would include a
  // chunk of the bundle in every card.
  const style = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .match(/<style[^>]*>[\s\S]*?<\/style>/)?.[0];
  if (!style) throw new Error('no inlined <style> in dist/index.html - run vite build first');
  if (!style.includes('data:font'))
    throw new Error('fonts are not inlined - check assetsInlineLimit');
  return style;
}

/**
 * Reveals what the server render leaves closed. Both overlays keep their panel
 * in the DOM when shut, so this unhides the real component instead of
 * substituting a hand-rolled open copy, which consumers do not write.
 */
function revealOverlays(markup) {
  return (
    markup
      .replace(/<dialog(?![^>]*\bopen\b)/g, '<dialog open')
      // Bare `hidden` only. A responsive `md:hidden` is a layout decision and stays.
      .replace(/class="([^"]*)"/g, (all, cls) => {
        const kept = cls.split(/\s+/).filter((c) => c !== 'hidden');
        return kept.length === cls.split(/\s+/).length ? all : `class="${kept.join(' ')}"`;
      })
  );
}

function card({ page, markup, style }) {
  const title = `${page.title} - Hoobi Design`;
  return `<!-- @dsCard group="${escapeAttr(page.group)}" name="${escapeAttr(page.title)}" subtitle="${escapeAttr(page.caption)}" -->
<!doctype html>
<html lang="en" data-hoobi-design="${version}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeAttr(title)}</title>
${style}
</head>
<body>
<main class="mx-auto max-w-5xl px-6 py-10">
<header class="mb-8">
<h1 class="text-title text-text">${escapeAttr(page.title)}</h1>
<p class="mt-1 text-body text-text-dim">${escapeAttr(page.caption)}</p>
<p class="mt-2 font-mono text-caption-small text-text-mute">@hoobi/design ${version} - ${escapeAttr(page.group)}</p>
</header>
${markup}
</main>
</body>
</html>
`;
}

const server = await createServer({
  configFile: 'vite.config.ts',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
});

try {
  const style = stylesheet();
  const { PAGES } = await server.ssrLoadModule('/src/pages.tsx');
  const { TOKENS } = await server.ssrLoadModule('/src/tokens.ts');

  rmSync(OUT, { recursive: true, force: true });

  const hashes = {};
  const write = (path, body) => {
    const full = join(OUT, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
    hashes[path] = createHash('sha256').update(body).digest('hex').slice(0, 16);
  };

  const exported = PAGES.filter((p) => !p.dsSkip);
  for (const page of exported) {
    let markup = renderToStaticMarkup(createElement(page.render));
    if (page.dsOpen) markup = revealOverlays(markup);
    write(`${slug(page.group)}/${page.id}.html`, card({ page, markup, style }));
  }

  // The tokens as data, not as a picture of a swatch. Parsed from styles.css by
  // the same module the Colour and Motion pages read, so it cannot drift.
  write('tokens.json', JSON.stringify({ version, tokens: TOKENS }, null, 2));

  // Cards are ~350KB and get_file caps at 256KiB, so remote content cannot be
  // read back to diff. This is the small file the sync reads instead.
  writeFileSync(
    join(OUT, '_hashes.json'),
    JSON.stringify({ version, files: hashes }, null, 2) + '\n',
  );

  const bytes = Object.keys(hashes).reduce((n, p) => n + readFileSync(join(OUT, p)).byteLength, 0);
  const groups = [...new Set(exported.map((p) => p.group))];
  console.log(
    `${OUT}/ - ${exported.length} cards in ${groups.length} groups, ${(bytes / 1024 / 1024).toFixed(1)}MB, @hoobi/design ${version}`,
  );
} finally {
  await server.close();
}
