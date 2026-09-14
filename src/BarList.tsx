import type { ReactNode } from 'react';
import { cx } from './cx.js';

export type BarFill = 'accent' | 'accent-blue' | 'accent-cyan' | 'success' | 'warn' | 'danger';

export interface BarListItem {
  key: string;
  label: ReactNode;
  value: number;
  /** What to print on the right. Defaults to the value. */
  display?: string;
  avatarUrl?: string;
  fill?: BarFill;
}

export interface BarListProps {
  items: BarListItem[];
  /** What a full track means. Defaults to the largest value in the list. */
  max?: number;
  labelWidth?: string;
  className?: string;
}

const FILLS: Record<BarFill, string> = {
  accent: 'bg-accent',
  'accent-blue': 'bg-accent-blue',
  'accent-cyan': 'bg-accent-cyan',
  success: 'bg-success',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

export function BarList({ items, max, labelWidth = '8rem', className }: BarListProps) {
  const ceiling = max ?? Math.max(...items.map((item) => item.value), 0);

  return (
    <div className={cx('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3">
          <div
            className="flex min-w-0 shrink-0 items-center gap-2 text-caption text-text"
            style={{ width: labelWidth }}
          >
            {item.avatarUrl ? (
              <img src={item.avatarUrl} alt="" className="size-5 shrink-0 rounded-full" />
            ) : null}
            <span className="min-w-0 truncate">{item.label}</span>
          </div>
          <div className="h-2 min-w-0 flex-1 rounded-full bg-chip">
            <div
              className={cx('h-full rounded-full', FILLS[item.fill ?? 'accent'])}
              style={{ width: `${String(ceiling > 0 ? (item.value / ceiling) * 100 : 0)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-caption tabular-nums text-text-dim">
            {item.display ?? item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
