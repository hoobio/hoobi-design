import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';
import { tipAnchor } from './tip.js';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info';
export type BadgeAppearance = 'chip' | 'text';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** 'chip' (default) is the filled pill. 'text' drops the fill/padding/radius for an inline run of tone-coloured text - for a banner headline or a label beside other text. */
  appearance?: BadgeAppearance;
  /** 'sm' is the 18px inline marker that sits inside a field label; 'md' is the standalone chip. */
  size?: BadgeSize;
  dot?: boolean;
  /** A mute word before the value: `confidence high`, `webhook registered`. Text appearance only. */
  label?: ReactNode;
  /** The dot breathes: something is in progress right now. */
  pulse?: boolean;
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

const SIZES: Record<BadgeSize, { chip: string; dot: string }> = {
  sm: { chip: 'h-4.5 gap-1 px-1.5 text-caption-small', dot: 'size-1.25' },
  md: { chip: 'h-5 gap-1.5 px-2 text-caption', dot: 'size-1.5' },
};

export function Badge({
  tone = 'neutral',
  appearance = 'chip',
  size = 'md',
  dot = false,
  pulse = false,
  label,
  tooltip,
  className,
  children,
  ...rest
}: BadgeProps) {
  if (appearance === 'text') {
    // A plain inline run, NOT inline-flex: a flex container's reported baseline would be the
    // dot's box, which makes the text ride high next to any baseline-aligned neighbour.
    return (
      <span
        {...tipAnchor(tooltip)}
        className={cx('inline', tooltip && 'tip-fixed', TEXT_TONES[tone], className)}
        {...rest}
      >
        {label != null ? <span className="text-text-mute">{label} </span> : null}
        {dot ? (
          <span
            aria-hidden
            className={cx(
              'inline-block size-1.5 rounded-full bg-current align-[0.06em]',
              children != null && 'mr-1.5',
              pulse && 'animate-pulse',
            )}
          />
        ) : null}
        {children}
      </span>
    );
  }
  const t = TONES[tone];
  return (
    <span
      {...tipAnchor(tooltip)}
      className={cx(
        'inline-flex items-center rounded-chip bg-chip whitespace-nowrap',
        SIZES[size].chip,
        tooltip && 'tip-fixed',
        t.text,
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          className={cx('shrink-0 rounded-full', SIZES[size].dot, t.dot, pulse && 'animate-pulse')}
        />
      ) : null}
      {children}
    </span>
  );
}
