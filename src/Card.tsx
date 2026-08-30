import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
}

export function Card({ title, actions, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx('rounded-panel border border-border bg-surface-raised p-4', className)}
      {...rest}
    >
      {title || actions ? (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          {title ? <h3 className="text-body-strong text-text">{title}</h3> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  );
}
