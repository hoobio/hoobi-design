import { readFileSync, readdirSync } from 'node:fs';

/**
 * The rules AGENTS.md states, enforced. Each check exists because the pattern it
 * catches has either been written against this library already or forks the
 * design system silently the day it is.
 */
const errors = [];
const src = readdirSync('src').filter((f) => f.endsWith('.tsx'));

for (const f of src) {
  const text = readFileSync(`src/${f}`, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    // Annotated exemption: 'hex-ok: reason' covers the next line, 'hex-ok x2' the next two.
    if (/hex-ok x2/.test(lines[i - 2] ?? '') || /hex-ok/.test(lines[i - 1] ?? '')) return;
    const at = `src/${f}:${i + 1}`;
    // "Everything comes from a token in styles.css. No literal hex in component files."
    if (/#[0-9a-fA-F]{3,8}\b/.test(line) && !line.trim().startsWith('//')) {
      errors.push(`${at}: literal hex colour - use a token from styles.css`);
    }
    // "One focus language everywhere": components must not clear or restyle the global ring.
    if (/outline-none|focus:outline|focus-visible:(ring|outline)/.test(line)) {
      errors.push(`${at}: bespoke focus styling - the global :focus-visible ring is the only one`);
    }
    // Depth is fill, never shadow. The Modal backdrop scrim is bg-black/60, not a shadow.
    if (/shadow-(sm|md|lg|xl|2xl)\b/.test(line)) {
      errors.push(`${at}: box shadow - depth is fill, never shadow`);
    }
  });
}

// Every exported component has a catalog page; the design system cannot lag the library.
// Type re-exports and non-visual helpers are the carve-outs.
const NON_VISUAL = new Set(['cx', 'mirageImage', 'markFavicon', 'tipAnchor']);
const index = readFileSync('src/index.ts', 'utf8');
const exported = [...index.matchAll(/export \{\s*([^}]+)\}/g)]
  .flatMap(([, names]) => names.split(','))
  .map((n) => n.trim())
  .filter((n) => n && !n.startsWith('type ') && !NON_VISUAL.has(n));
const pages = readFileSync('catalog/src/pages.tsx', 'utf8');
for (const name of exported) {
  // Subcomponents (Menu.Item) live on their parent's page; only top-level exports need one.
  if (
    !new RegExp(`title: '${name}[ ']|<${name}Page`).test(pages) &&
    !pages.includes(`${name}Page`)
  ) {
    errors.push(`src/index.ts: ${name} is exported but has no page in catalog/src/pages.tsx`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} design-rule violation(s).`);
  process.exit(1);
}
console.log(`check: ${src.length} components, ${exported.length} exports paged, all rules hold`);
