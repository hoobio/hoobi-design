import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  /** The source. Rendered as plain text unless html is given. */
  code: string;
  /**
   * Pre-highlighted markup for the same source, e.g.
   * `hljs.highlight(code, { language: 'json' }).value`. Injected as HTML, so it
   * must come from a highlighter that escapes its input (highlight.js does);
   * never hand this user-authored markup.
   */
  html?: string;
}

/**
 * The house code surface. Bring your own engine: the stylesheet maps standard
 * highlight.js token classes onto the theme tokens - which ARE Ayu Mirage - so
 * any hljs grammar lands themed while the library stays dependency-free.
 */
export function CodeBlock({ code, html, className, ...rest }: CodeBlockProps) {
  const content =
    html === undefined ? { children: code } : { dangerouslySetInnerHTML: { __html: html } };
  return (
    <pre
      className={cx(
        'code-block styled-scrollbar overflow-x-auto rounded-control bg-chip p-3 font-mono text-caption whitespace-pre text-text',
        className,
      )}
      {...content}
      {...rest}
    />
  );
}
