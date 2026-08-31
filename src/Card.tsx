import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  /**
   * Mirage backdrop scoped to this card: any CSS image (a poster url(...)),
   * blurred and tinted towards surface-raised. The layer becomes the fill.
   */
  mirage?: string;
}

export function Card({ title, actions, mirage, className, style, children, ...rest }: CardProps) {
  return (
    <div
      className={cx('rounded-panel p-4', mirage ? 'mirage-scoped' : 'bg-surface-raised', className)}
      style={mirage ? ({ ...style, '--mirage-image': mirage } as CSSProperties) : style}
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
