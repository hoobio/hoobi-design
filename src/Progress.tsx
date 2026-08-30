import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: ReactNode;
  className?: string;
}

export function Progress({ value, max = 100, label, className }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-xs text-text-dim">
          <span className="min-w-0">{label}</span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 overflow-hidden rounded-full border border-border bg-surface"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
