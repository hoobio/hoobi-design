import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';
import { tipAnchor } from './tip.js';

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  children: ReactNode;
}

/**
 * The base layer renders [data-tip] on hover and keyboard focus; tabIndex makes the
 * anchor reachable so keyboard users get the tip too. Placed fixed off the anchor's
 * own rect, so no scrolling or clipping ancestor can cut it off.
 */
export function Tooltip({ text, children, className, ...rest }: TooltipProps) {
  return (
    <span {...tipAnchor(text)} className={cx('tip-fixed inline-flex', className)} {...rest}>
      {children}
    </span>
  );
}
