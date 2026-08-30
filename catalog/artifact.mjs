import { readFileSync, writeFileSync } from 'node:fs';

// Claude Artifacts wrap the published file in their own <!doctype>/<head>/<body>,
// so flatten dist/index.html to body-level content. <title> goes first: only the
// first 8KB is scanned for it, and the inlined font data URIs are far bigger.
const src = readFileSync('dist/index.html', 'utf8');
const head = src.match(/<head>([\s\S]*?)<\/head>/)?.[1];
const body = src.match(/<body>([\s\S]*?)<\/body>/)?.[1];
if (!head || !body) throw new Error('dist/index.html is not the expected shape - run vite build');

const pick = (tag) => {
  const m = head.match(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`));
  if (!m) throw new Error(`no inlined <${tag}> in dist/index.html - is vite-plugin-singlefile on?`);
  return m[0];
};

const out = `<title>Hoobi Design</title>\n${pick('style')}\n${body.trim()}\n${pick('script')}\n`;
if (out.includes('url(./') || /src="\.?\//.test(out)) throw new Error('external asset reference');

writeFileSync('dist/artifact.html', out);
console.log(`dist/artifact.html ${(out.length / 1024).toFixed(0)}KB`);
