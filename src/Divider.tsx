import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /**
   * true insets the rule to its container's padding. The default bleeds to the surface's
   * edges, because a slice that stops short is not a slice, it is a drawn line.
   */
  padded?: boolean;
}

/**
 * The house hairline: 1px of PAGE background cutting a surface in two, never a border
 * colour. It bleeds by cancelling whatever padding its container published as `--pad`, so
 * it reaches the edges without being told how far to reach - a Card does that for free.
 */
export function Divider({ padded = false, className, ...rest }: DividerProps) {
  return (
    <hr
      className={cx('border-0 border-t border-bg', !padded && 'rule-bleed', className)}
      {...rest}
    />
  );
}
