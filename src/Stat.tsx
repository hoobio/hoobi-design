import type { ReactNode } from 'react';
import { Card } from './Card.js';
import { cx } from './cx.js';

export type StatTone = 'default' | 'success' | 'warn' | 'danger';

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** The line under the number: what it is measured against, or where it came from. */
  sub?: ReactNode;
  tone?: StatTone;
  icon?: ReactNode;
  className?: string;
}

const TONES: Record<StatTone, string> = {
  default: 'text-text',
  success: 'text-success',
  warn: 'text-warn',
  danger: 'text-danger',
};

export function Stat({ label, value, sub, tone = 'default', icon, className }: StatProps) {
  return (
    <Card className={cx('flex items-start gap-3', className)}>
      {icon ? <span className={cx('mt-1 shrink-0', TONES[tone])}>{icon}</span> : null}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-caption text-text-dim">{label}</p>
        <p className={cx('text-title tabular-nums', TONES[tone])}>{value}</p>
        {sub ? <p className="text-caption text-text-mute">{sub}</p> : null}
      </div>
    </Card>
  );
}
