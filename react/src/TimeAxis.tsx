import { Fragment, type ReactNode } from 'react';
import { Badge, type BadgeTone } from './Badge.js';
import { cx } from './cx.js';

export interface TimeAxisMark {
  at: Date;
  tone?: BadgeTone;
  pulse?: boolean;
  tooltip?: string;
}

export interface TimeAxisRow {
  id: string;
  label: ReactNode;
  marks: TimeAxisMark[];
}

export interface TimeAxisProps {
  from: Date;
  to: Date;
  rows: TimeAxisRow[];
  /** A vertical accent line at this instant. */
  now?: Date;
  /** Labelled gridlines; default none. */
  ticks?: Date[];
  /** Default `HH:mm` in the viewer's locale (Intl.DateTimeFormat hour/minute 2-digit). */
  formatTick?: (d: Date) => string;
  /** Names the figure for assistive tech. */
  label?: string;
  className?: string;
}

const defaultFormatTick = (d: Date) =>
  new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);

/** Events on a shared horizontal time window, one lane per row. */
export function TimeAxis({
  from,
  to,
  rows,
  now,
  ticks = [],
  formatTick = defaultFormatTick,
  label,
  className,
}: TimeAxisProps) {
  const span = to.getTime() - from.getTime();
  const pct = (at: Date) => ((at.getTime() - from.getTime()) / span) * 100;
  const visibleTicks = ticks.filter((t) => pct(t) >= 0 && pct(t) <= 100);
  const nowPct = now && pct(now) >= 0 && pct(now) <= 100 ? pct(now) : undefined;
  // A label centred on the window's edge would be half outside the clipped figure.
  const align = (p: number) =>
    p < 5 ? 'translate-x-0' : p > 95 ? '-translate-x-full' : '-translate-x-1/2';

  return (
    <figure
      role="img"
      aria-label={label}
      className={cx(
        '@container grid min-w-0 grid-cols-[minmax(6rem,max-content)_1fr] gap-y-px overflow-hidden rounded-panel bg-bg',
        className,
      )}
    >
      <div className="h-7 bg-surface" />
      <div className="relative h-7 bg-surface">
        <div className="relative mx-2 h-full">
          {visibleTicks.map((t, i) => (
            <span
              key={i}
              className={cx(
                // Narrow, the labels collide: only the first and last stay, the gridlines all do.
                'absolute top-1/2 -translate-y-1/2 text-caption whitespace-nowrap tabular-nums text-text-dim @max-md:not-first:not-last:hidden',
                align(pct(t)),
              )}
              style={{ left: `${pct(t)}%` }}
            >
              {formatTick(t)}
            </span>
          ))}
        </div>
      </div>
      {rows.map((row) => (
        <Fragment key={row.id}>
          <span className="flex h-10 max-w-40 items-center truncate bg-surface px-4 text-caption text-text">
            {row.label}
          </span>
          <div className="relative h-10 bg-surface">
            <div className="relative mx-2 h-full">
              {visibleTicks.map((t, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute inset-y-0 w-px bg-bg"
                  style={{ left: `${pct(t)}%` }}
                />
              ))}
              {nowPct !== undefined ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-px bg-accent"
                  style={{ left: `${nowPct}%` }}
                />
              ) : null}
              {row.marks
                .filter((m) => pct(m.at) >= 0 && pct(m.at) <= 100)
                .map((m, i) => (
                  <Badge
                    key={i}
                    appearance="text"
                    dot
                    tone={m.tone ?? 'neutral'}
                    pulse={m.pulse}
                    tooltip={m.tooltip}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pct(m.at)}%` }}
                  />
                ))}
            </div>
          </div>
        </Fragment>
      ))}
    </figure>
  );
}
