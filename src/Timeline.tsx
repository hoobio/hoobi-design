import type { ReactNode } from 'react';
import { cx } from './cx.js';

export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info';

export interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export interface TimelineItemProps {
  /** Rail colour. */
  tone?: TimelineTone;
  /** Dense metadata shown above/beside the content - a timestamp. */
  time?: ReactNode;
  /** Badges or labels on the item's head row, beside the time. */
  head?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const RAILS: Record<TimelineTone, string> = {
  neutral: 'border-border',
  accent: 'border-accent',
  success: 'border-success',
  warn: 'border-warn',
  danger: 'border-danger',
  info: 'border-info',
};

export function Timeline({ children, className }: TimelineProps) {
  return <ol className={cx('flex min-w-0 flex-col gap-3', className)}>{children}</ol>;
}

function TimelineItem({ tone = 'neutral', time, head, children, className }: TimelineItemProps) {
  return (
    <li className={cx('min-w-0 border-l-2 pl-3', RAILS[tone], className)}>
      {time || head ? (
        <div className="flex flex-col gap-x-3 gap-y-1 sm:flex-row sm:flex-wrap sm:items-baseline">
          {time ? <span className="font-mono text-caption text-text-mute">{time}</span> : null}
          {head}
        </div>
      ) : null}
      {children ? <div className="min-w-0 text-body break-words text-text">{children}</div> : null}
    </li>
  );
}

Timeline.Item = TimelineItem;
