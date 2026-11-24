import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';
import { tipAnchor } from './tip.js';

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  children: ReactNode;
}

/**
 * Shows `text` on hover and keyboard focus, in the top layer over any clipping ancestor or open
 * flyout; tabIndex makes the anchor reachable so keyboard users get the tip too.
 */
export function Tooltip({ text, children, className, ...rest }: TooltipProps) {
  return (
    <span {...tipAnchor(text)} className={cx('inline-flex gap-1', className)} {...rest}>
      {children}
    </span>
  );
}
