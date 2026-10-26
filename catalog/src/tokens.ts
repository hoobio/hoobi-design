import css from '../../styles.css?raw';

/**
 * The design tokens, parsed from styles.css at build time.
 *
 * styles.css is the single source of truth: `@theme static` is what Tailwind
 * compiles utilities from, so anything that reads tokens has to read THAT, not a
 * copy. Parsing it beats the old approach of probing a hidden DOM node for
 * computed values - that needed a browser, so it produced nothing outside one.
 */
function parseTheme(source: string): Record<string, string> {
  const body = source.replace(/\/\*[\s\S]*?\*\//g, '').match(/@theme static \{([\s\S]*?)\n\}/)?.[1];
  if (!body) throw new Error('no @theme static block in styles.css');
  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    out[name!] = value!.replace(/\s+/g, ' ').trim();
  }
  return out;
}

export const TOKENS: Record<string, string> = parseTheme(css);

/** `--color-surface-raised` -> `#242936`. Utilities drop the `--color-` prefix. */
export function colour(name: string): string {
  return TOKENS[`--color-${name}`] ?? '';
}

export function token(name: string): string {
  return TOKENS[name] ?? '';
}

/** Everything under one prefix, prefix stripped. Ordered as styles.css declares them. */
export function group(prefix: string): [name: string, value: string][] {
  return Object.entries(TOKENS)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, v]) => [k.slice(prefix.length), v]);
}
