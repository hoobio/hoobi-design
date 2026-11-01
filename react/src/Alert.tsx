import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export type AlertTone = 'info' | 'success' | 'warn' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
}

const TONES: Record<AlertTone, string> = {
  info: 'bg-info/15 text-info',
  success: 'bg-success/15 text-success',
  warn: 'bg-warn/15 text-warn',
  danger: 'bg-danger/15 text-danger',
};

export function Alert({ tone = 'info', title, className, children, ...rest }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('rounded-control px-3 py-2 text-body break-words', TONES[tone], className)}
      {...rest}
    >
      {title ? <div className="text-body-strong">{title}</div> : null}
      {children ? <div className="text-text-dim">{children}</div> : null}
    </div>
  );
}
