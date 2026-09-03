import { useEffect, useState, type HTMLAttributes } from 'react';
import { Button } from './Button.js';
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
  /** A Copy button in the top-right corner, putting `code` on the clipboard. */
  copy?: boolean;
}

/**
 * The house code surface. Bring your own engine: the stylesheet maps standard
 * highlight.js token classes onto the theme tokens - which ARE Ayu Mirage - so
 * any hljs grammar lands themed while the library stays dependency-free.
 */
export function CodeBlock({ code, html, copy = false, className, ...rest }: CodeBlockProps) {
  const content =
    html === undefined ? { children: code } : { dangerouslySetInnerHTML: { __html: html } };
  const pre = (
    <pre
      className={cx(
        'code-block styled-scrollbar overflow-x-auto rounded-control bg-chip p-3 font-mono text-caption whitespace-pre text-text',
        // Clears the button, so the first line never starts under it.
        copy && 'pr-20',
        className,
      )}
      {...content}
      {...rest}
    />
  );
  if (!copy) return pre;
  return (
    <div className="relative">
      {pre}
      <CopyButton code={code} />
    </div>
  );
}

/** The Clipboard API is absent in a sandboxed iframe (a design-system card), so fall back. */
function copyText(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.append(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => {
      setCopied(false);
    }, 1400);
    return () => {
      clearTimeout(t);
    };
  }, [copied]);
  return (
    // The code scrolls under this, so it sits on the surface's own fill. A wrapper, not a
    // className on the Button: the ghost variant's transparent fill wins in stylesheet order.
    <span className="absolute top-1.5 right-1.5 rounded-control bg-chip">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          copyText(code);
          setCopied(true);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </span>
  );
}
