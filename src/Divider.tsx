import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /**
   * true insets the rule to its container's padding. The default bleeds to the surface's
   * edges, so it appears as one continuous slice.
   */
  padded?: boolean;
}

/**
 * 1px of page background cutting a surface in two, never a border colour. It bleeds by
 * cancelling whatever padding its container sets as `--pad`, so it reaches the edges
 * without the container specifying a distance. A Card sets `--pad` automatically.
 */
export function Divider({ padded = false, className, ...rest }: DividerProps) {
  return (
    <hr
      className={cx('border-0 border-t border-bg', !padded && 'rule-bleed', className)}
      {...rest}
    />
  );
}
