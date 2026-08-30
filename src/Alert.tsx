import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export type AlertTone = 'info' | 'success' | 'warn' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
}

const TONES: Record<AlertTone, string> = {
  info: 'border-info/40 bg-info/10 text-info',
  success: 'border-success/40 bg-success/10 text-success',
  warn: 'border-warn/40 bg-warn/10 text-warn',
  danger: 'border-danger/40 bg-danger/10 text-danger',
};

export function Alert({ tone = 'info', title, className, children, ...rest }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(
        'rounded-control border px-3 py-2 text-body break-words',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {title ? <div className="text-body-strong">{title}</div> : null}
      {children ? <div className="text-text-dim">{children}</div> : null}
    </div>
  );
}
