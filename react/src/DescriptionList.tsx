import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** 'stack' is label above value; 'inline' is a two-column grid from sm up. Ignored when `plain`. */
  layout?: 'stack' | 'inline';
  /** Unboxed: no hairlines, no bleed, no padding assumptions - a plain label-over-value stack that drops into any container. */
  plain?: boolean;
  className?: string;
}

/**
 * Rows use a 1px hairline of page background running the full width of the surface. The
 * list sets its own row padding: a padded parent would inset every hairline and turn the
 * effect into a drawn line, so use an unpadded surface for it, such as `<Card className="p-0">`.
 */
export function DescriptionList({
  items,
  layout = 'stack',
  plain = false,
  className,
}: DescriptionListProps) {
  if (plain) {
    return (
      <dl className={cx('flex min-w-0 flex-col gap-3', className)}>
        {items.map((item, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-1">
            <dt className="text-caption text-text-mute">{item.label}</dt>
            <dd className="min-w-0 text-body break-words text-text">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
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
          <dt className="text-caption text-text-mute">{item.label}</dt>
          <dd className="min-w-0 text-body break-words text-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
