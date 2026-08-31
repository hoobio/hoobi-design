import type { ElementType, ReactNode } from 'react';
import { cx } from './cx.js';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Element to render - a plain span when absent; pass a router Link for SPA nav. */
  as?: ElementType;
  [key: string]: unknown;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Between items. Defaults to the Fluent chevron. */
  separator?: ReactNode;
  className?: string;
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden fill="none">
      <path
        d="M4.5 2.5L8 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Fluent 2 breadcrumb. The last item is the current page: never a link, whatever
 * `as` says, so its href/onClick are dropped rather than rendered inert.
 */
export function Breadcrumbs({ items, separator, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx('no-scrollbar min-w-0 overflow-x-auto', className)}>
      <ol className="flex h-8 min-w-0 items-center text-body">
        {items.map((item, i) => {
          const { label, as, ...rest } = item;
          const last = i === items.length - 1;
          const Comp: ElementType = last ? 'span' : (as ?? 'span');
          return (
            <li
              key={i}
              className={cx('flex items-center gap-1', last ? 'min-w-0 flex-1' : 'shrink-0')}
            >
              {i > 0 ? (
                <span aria-hidden className="flex shrink-0 items-center px-1 text-text-mute">
                  {separator ?? <Chevron />}
                </span>
              ) : null}
              {last ? (
                <span
                  aria-current="page"
                  className="block min-w-0 truncate px-2 leading-8 text-text"
                >
                  {label}
                </span>
              ) : (
                <Comp
                  className="flex h-8 shrink-0 items-center rounded-control px-2 whitespace-nowrap text-text-dim hover:bg-surface hover:text-text"
                  {...rest}
                >
                  {label}
                </Comp>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
