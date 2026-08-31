import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';
import { tipAnchor } from './tip.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info';
export type BadgeAppearance = 'chip' | 'text';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** 'chip' (default) is the filled pill. 'text' drops the fill/padding/radius for an inline run of tone-coloured text - for a banner headline or a label beside other text. */
  appearance?: BadgeAppearance;
  dot?: boolean;
  /** Tooltip shown on hover and keyboard focus, explaining what the badge means. */
  tooltip?: string;
}

const TONES: Record<BadgeTone, { text: string; dot: string }> = {
  neutral: { text: 'text-text-dim', dot: 'bg-text-dim' },
  accent: { text: 'text-accent', dot: 'bg-accent' },
  success: { text: 'text-success', dot: 'bg-success' },
  warn: { text: 'text-warn', dot: 'bg-warn' },
  danger: { text: 'text-danger', dot: 'bg-danger' },
  info: { text: 'text-info', dot: 'bg-info' },
};

// 'text' appearance colour is its own map, not TONES.text: accent reads as accent-blue
// here (there is no chip fill to carry the plain accent hue against).
const TEXT_TONES: Record<BadgeTone, string> = {
  neutral: 'text-text-dim',
  accent: 'text-accent-blue',
  success: 'text-success',
  warn: 'text-warn',
  danger: 'text-danger',
  info: 'text-info',
};

export function Badge({
  tone = 'neutral',
  appearance = 'chip',
  dot = false,
  tooltip,
  className,
  children,
  ...rest
}: BadgeProps) {
  if (appearance === 'text') {
    return (
      <span
        {...tipAnchor(tooltip)}
        className={cx(
          'inline-flex items-center gap-1.5',
          tooltip && 'tip-fixed',
          TEXT_TONES[tone],
          className,
        )}
        {...rest}
      >
        {dot ? <span className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
        {children}
      </span>
    );
  }
  const t = TONES[tone];
  return (
    <span
      {...tipAnchor(tooltip)}
      className={cx(
        'inline-flex h-5 items-center gap-1.5 rounded-chip bg-chip px-2 text-caption whitespace-nowrap',
        tooltip && 'tip-fixed',
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
