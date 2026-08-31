import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** 'stack' is label above value; 'inline' is a two-column grid from sm up. */
  layout?: 'stack' | 'inline';
  className?: string;
}

/**
 * Rows are sliced the house way: a 1px hairline of page background running the full width
 * of the surface. The list owns its own row padding for exactly that reason - a padded
 * parent would inset every hairline and turn a slice into a drawn line - so drop it into
 * an unpadded surface (`<Card className="p-0">`), not one that pads its children.
 */
export function DescriptionList({ items, layout = 'stack', className }: DescriptionListProps) {
  return (
    <dl className={cx('min-w-0', className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cx(
            'min-w-0 border-t border-bg px-4 py-2 first:border-t-0',
            layout === 'inline' &&
              'sm:grid sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-baseline sm:gap-x-4',
          )}
        >
          <dt className="font-mono text-caption text-text-mute">{item.label}</dt>
          <dd className="min-w-0 text-body break-words text-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
