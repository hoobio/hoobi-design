import { createContext, useContext, type ReactNode } from 'react';
import { Card, type CardTone } from './Card.js';
import { cx } from './cx.js';

export type StatTone = 'default' | 'success' | 'warn' | 'danger' | 'mute';

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** The line under the number: what it is measured against, or where it came from. */
  sub?: ReactNode;
  tone?: StatTone;
  /** Tints the whole surface for a state the number puts the reader in; the number keeps its tone. */
  tint?: CardTone;
  /** A flush bg-surface cell for a sliced surface instead of a Card. Defaults to true inside a StatStrip. */
  sliced?: boolean;
  icon?: ReactNode;
  className?: string;
}

const TONES: Record<StatTone, string> = {
  default: 'text-text',
  success: 'text-success',
  warn: 'text-warn',
  danger: 'text-danger',
  mute: 'text-text-mute',
};

const SLICED_TINTS: Record<CardTone, string> = {
  info: 'bg-[color-mix(in_srgb,var(--color-info)_15%,var(--color-surface))]',
  success: 'bg-[color-mix(in_srgb,var(--color-success)_15%,var(--color-surface))]',
  warn: 'bg-[color-mix(in_srgb,var(--color-warn)_15%,var(--color-surface))]',
  danger: 'bg-[color-mix(in_srgb,var(--color-danger)_15%,var(--color-surface))]',
};

const Sliced = createContext(false);

export function Stat({
  label,
  value,
  sub,
  tone = 'default',
  tint,
  sliced,
  icon,
  className,
}: StatProps) {
  const inStrip = useContext(Sliced);
  const flush = sliced ?? inStrip;
  const body = (
    <>
      {icon ? <span className={cx('mt-1 shrink-0', TONES[tone])}>{icon}</span> : null}
      <div className={cx('flex min-w-0 flex-col', flush ? 'gap-0.5' : 'gap-1')}>
        <p className="text-caption text-text-dim">{label}</p>
        <p className={cx('text-title tabular-nums', flush && 'truncate', TONES[tone])}>{value}</p>
        {sub ? <p className="text-caption text-text-mute">{sub}</p> : null}
      </div>
    </>
  );
  return flush ? (
    <div
      className={cx(
        'flex min-w-0 items-start gap-3 px-4 py-3',
        tint ? SLICED_TINTS[tint] : 'bg-surface',
        className,
      )}
    >
      {body}
    </div>
  ) : (
    <Card tone={tint} className={cx('flex items-start gap-3', className)}>
      {body}
    </Card>
  );
}

export interface StatStripProps {
  /** Columns at 760px and wider; a four-column strip folds to two below that. */
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

const COLUMNS: Record<NonNullable<StatStripProps['columns']>, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 min-[760px]:grid-cols-4',
};

export function StatStrip({ columns = 4, children, className }: StatStripProps) {
  return (
    <Sliced.Provider value>
      <div
        className={cx(
          'grid min-w-0 gap-px overflow-hidden rounded-panel bg-bg',
          COLUMNS[columns],
          className,
        )}
      >
        {children}
      </div>
    </Sliced.Provider>
  );
}
