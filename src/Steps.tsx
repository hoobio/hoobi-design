import type { CSSProperties } from 'react';
import { cx } from './cx.js';

export interface Step {
  label: string;
  /** Shown on the right of a completed step in the stacked layout: what it ended up as. */
  summary?: string;
}

export interface StepsProps {
  steps: Step[];
  /** 0-based. Everything before it is done, everything after is pending. */
  current: number;
  /** Jumping back to a completed step. Omit to make the trail read-only. */
  onSelect?: (index: number) => void;
  label?: string;
  className?: string;
}

/**
 * Where you are in a linear flow. Chevrons on a wide screen because a row of them reads as
 * a direction; a stacked list below md because four clipped arrows at 360px are four
 * ellipses. A finished step swaps its number for a tick and, stacked, says what it settled
 * on - a trail that only counts is a trail you have to remember.
 */
export function Steps({ steps, current, onSelect, label = 'Progress', className }: StepsProps) {
  return (
    <ol
      aria-label={label}
      className={cx('m-0 flex list-none flex-col gap-0.5 p-0 md:flex-row', className)}
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = onSelect !== undefined && done;
        const Tag = clickable ? 'button' : 'span';
        return (
          <li
            key={step.label}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 md:flex-1"
          >
            <Tag
              {...(clickable
                ? {
                    type: 'button' as const,
                    onClick: () => {
                      onSelect(i);
                    },
                  }
                : {})}
              // The chevron is a clip, not a background image: it keeps the fill a token and
              // survives any width. Off below md, where the notches eat the label instead.
              style={
                {
                  '--chev':
                    'polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%,12px 50%)',
                } as CSSProperties
              }
              className={cx(
                'flex h-8 w-full min-w-0 items-center gap-2.5 rounded-control border-0 px-2.5 text-left text-caption md:h-9 md:gap-2 md:rounded-none md:pr-3.5 md:pl-5.5 md:[clip-path:var(--chev)]',
                active
                  ? 'bg-surface-raised text-text'
                  : done
                    ? 'bg-surface text-text-dim'
                    : 'bg-chip text-text-mute',
                clickable && 'hover:text-text',
              )}
            >
              <span
                aria-hidden
                className={cx(
                  'flex size-4.5 shrink-0 items-center justify-center rounded-full font-mono text-caption-small',
                  active
                    ? 'bg-accent text-on-accent'
                    : done
                      ? 'bg-success text-bg'
                      : 'bg-surface text-text-mute',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className="min-w-0 truncate">{step.label}</span>
              {done && step.summary ? (
                <span className="ml-auto min-w-0 truncate text-text-mute md:hidden">
                  {step.summary}
                </span>
              ) : null}
            </Tag>
          </li>
        );
      })}
    </ol>
  );
}
