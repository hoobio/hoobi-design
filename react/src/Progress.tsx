import type { ReactNode } from 'react';
import { cx } from './cx.js';

export type ProgressTone = 'accent' | 'success' | 'warn' | 'danger';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: ReactNode;
  tone?: ProgressTone;
  className?: string;
}

const FILLS: Record<ProgressTone, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

export function Progress({ value, max = 100, label, tone = 'accent', className }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-caption text-text-dim">
          <span className="min-w-0">{label}</span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className={cx('h-full rounded-full transition-[width] duration-500', FILLS[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
