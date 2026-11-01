import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface MarkdownProps {
  children: string;
  /** Inline formatting only, in a span: for a label or any other one-line slot. */
  inline?: boolean;
  className?: string;
}

type Inline = string | { tag: 'strong' | 'em'; children: Inline[] };
type Block = { tag: 'p'; lines: Inline[][] } | { tag: 'ul' | 'ol'; items: Inline[][] };

const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+\.\s+(.*)$/;
const WORD = /[\p{L}\p{N}]/u;
const SPACE = /\s/;

function opener(s: string, i: number): string | undefined {
  const d = s.startsWith('**', i) ? '**' : s[i] === '*' ? '*' : s[i] === '_' ? '_' : undefined;
  if (!d) return undefined;
  const next = s[i + d.length];
  if (next === undefined || SPACE.test(next)) return undefined;
  if (d === '_' && WORD.test(s[i - 1] ?? '')) return undefined;
  return d;
}

function closer(s: string, from: number, d: string): number {
  for (let j = from + 1; j < s.length; j++) {
    if (d === '*' && s.startsWith('**', j)) {
      j++;
      continue;
    }
    if (!s.startsWith(d, j) || SPACE.test(s[j - 1] ?? ' ')) continue;
    if (d === '_' && WORD.test(s[j + 1] ?? '')) continue;
    if (d === '**' && s[j + 2] === '*') continue;
    return j;
  }
  return -1;
}

function spans(s: string): Inline[] {
  const out: Inline[] = [];
  let text = '';
  for (let i = 0; i < s.length;) {
    const d = opener(s, i);
    const end = d ? closer(s, i + d.length, d) : -1;
    if (d && end > 0) {
      if (text) out.push(text);
      text = '';
      out.push({ tag: d === '**' ? 'strong' : 'em', children: spans(s.slice(i + d.length, end)) });
      i = end + d.length;
    } else {
      text += s[i];
      i++;
    }
  }
  if (text) out.push(text);
  return out;
}

function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  let open: Block | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const item = BULLET.exec(raw) ?? NUMBERED.exec(raw);
    if (!line) {
      open = undefined;
    } else if (item) {
      const tag = BULLET.test(raw) ? 'ul' : 'ol';
      if (open?.tag !== tag) blocks.push((open = { tag, items: [] }));
      open.items.push(spans((item[1] ?? '').trim()));
    } else {
      if (open?.tag !== 'p') blocks.push((open = { tag: 'p', lines: [] }));
      open.lines.push(spans(line));
    }
  }
  return blocks;
}

function render(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, i) =>
    typeof node === 'string' ? (
      node
    ) : node.tag === 'strong' ? (
      <strong key={i} className="font-semibold">
        {render(node.children)}
      </strong>
    ) : (
      <em key={i}>{render(node.children)}</em>
    ),
  );
}

function lines(rows: Inline[][]): ReactNode[] {
  return rows.flatMap((row, i) =>
    i === 0 ? render(row) : [<br key={`br${i}`} />, ...render(row)],
  );
}

/**
 * Renders the markdown subset Seerr shows in a comment as React nodes, never as HTML: links,
 * headings, code and raw tags stay literal text. Size and colour inherit from the parent.
 */
export function Markdown({ children, inline = false, className }: MarkdownProps) {
  const blocks = parseMarkdown(children);
  if (inline) {
    return (
      <span className={className}>
        {lines(blocks.flatMap((b) => (b.tag === 'p' ? b.lines : b.items)))}
      </span>
    );
  }
  return (
    <div className={cx('flex min-w-0 flex-col gap-2', className)}>
      {blocks.map((block, i) =>
        block.tag === 'p' ? (
          <p key={i}>{lines(block.lines)}</p>
        ) : (
          <block.tag
            key={i}
            className={cx('space-y-1 pl-5', block.tag === 'ul' ? 'list-disc' : 'list-decimal')}
          >
            {block.items.map((item, j) => (
              <li key={j}>{render(item)}</li>
            ))}
          </block.tag>
        ),
      )}
    </div>
  );
}
