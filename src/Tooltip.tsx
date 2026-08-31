import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  children: ReactNode;
}

/**
 * CSS-only: the base layer renders [data-tip] on hover and keyboard focus.
 * tabIndex makes the anchor reachable so keyboard users get the tip too.
 */
export function Tooltip({ text, children, className, ...rest }: TooltipProps) {
  return (
    <span
      data-tip={text}
      aria-description={text}
      tabIndex={0}
      className={cx('inline-flex', className)}
      {...rest}
    >
      {children}
    </span>
  );
}
