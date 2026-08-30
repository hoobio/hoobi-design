import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const TONES: Record<BadgeTone, { text: string; dot: string }> = {
  neutral: { text: 'text-text-dim', dot: 'bg-text-dim' },
  accent: { text: 'text-accent', dot: 'bg-accent' },
  success: { text: 'text-success', dot: 'bg-success' },
  warn: { text: 'text-warn', dot: 'bg-warn' },
  danger: { text: 'text-danger', dot: 'bg-danger' },
  info: { text: 'text-info', dot: 'bg-info' },
};

export function Badge({ tone = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span
      className={cx(
        'inline-flex h-5 items-center gap-1.5 rounded-chip border border-chip-border bg-chip px-2 text-caption whitespace-nowrap',
        t.text,
        className,
      )}
      {...rest}
    >
      {dot ? <span className={cx('size-1.5 shrink-0 rounded-full', t.dot)} /> : null}
      {children}
    </span>
  );
}
