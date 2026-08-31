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

/** Rows are sliced the house way: a 1px hairline of page background, never a border colour. */
export function DescriptionList({ items, layout = 'stack', className }: DescriptionListProps) {
  return (
    <dl className={cx('min-w-0', className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cx(
            'min-w-0 border-t border-bg py-2 first:border-t-0 first:pt-0',
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
