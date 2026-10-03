import { useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';

export interface RichTooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** A short title and a few lines. Plain text still uses `Tooltip`. */
  content: ReactNode;
  children: ReactNode;
}

const OFFSET = 14;
const EDGE = 8;

/**
 * Tooltip holds a string in a CSS attribute; this one holds nodes, so it is a real panel that
 * follows the pointer (and parks off the anchor on keyboard focus), clamped to the viewport and
 * pointer-events-none so it never captures the hover that spawned it.
 */
export function RichTooltip({ content, children, className, ...rest }: RichTooltipProps) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [place, setPlace] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = panelRef.current?.getBoundingClientRect();
    if (!at || !box) return;
    setPlace({
      left: Math.max(EDGE, Math.min(at.x + OFFSET, window.innerWidth - box.width - EDGE)),
      top: Math.max(EDGE, Math.min(at.y + OFFSET, window.innerHeight - box.height - EDGE)),
    });
  }, [at]);

  return (
    <span
      tabIndex={0}
      className={cx('inline-flex gap-1', className)}
      onPointerEnter={(e) => {
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onPointerMove={(e) => {
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onPointerLeave={() => {
        setAt(null);
      }}
      onFocus={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setAt({ x: r.left, y: r.bottom });
      }}
      onBlur={() => {
        setAt(null);
      }}
      {...rest}
    >
      {children}
      {at ? (
        <div
          ref={panelRef}
          role="tooltip"
          style={place}
          className="fade-in pointer-events-none fixed z-50 flex max-w-[calc(100vw-2rem)] flex-col gap-1 mirage-flyout rounded-panel px-3 py-2 text-caption"
        >
          {content}
        </div>
      ) : null}
    </span>
  );
}
