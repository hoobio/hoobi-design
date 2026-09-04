import type { ReactNode } from 'react';
import { cx } from './cx.js';

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Present makes the column sortable. Rows with an undefined value sink to the bottom either way. */
  sortValue?: (row: T) => number | string | undefined;
  /** Direction the first click on this header takes. */
  defaultDirection?: SortDirection;
  align?: 'start' | 'end';
  /**
   * The row's title. Wide it is an ordinary column; stacked it takes the full width and drops the
   * label every other cell repeats beside its value.
   */
  primary?: boolean;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Controlled: the consumer holds the sort (in the URL, usually) and the table only applies it. */
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  /** A per-row control, rendered last: right-aligned wide, below the cells stacked. */
  rowAction?: (row: T) => ReactNode;
  /** Names the table for assistive tech. */
  label?: string;
  className?: string;
}

function compare(a: number | string | undefined, b: number | string | undefined): number {
  if (a === undefined || b === undefined) return a === undefined ? (b === undefined ? 0 : 1) : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function Chevron({ up }: { up: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('shrink-0 transition-transform', up && 'rotate-180')}
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

// Every class is written out in full: Tailwind reads the compiled file for utilities to emit, and a
// name assembled at runtime is one it never sees.
const CELL = '@2xl:table-cell @2xl:px-3 @2xl:py-2 @2xl:align-top @2xl:text-body';

/**
 * One markup path: a real <table> from `@2xl` (a container query, so it keys off its own column,
 * not the viewport) and below that each row is a card whose cells wrap with their column label in
 * front of them. The sort is applied here so the consumer can keep its rows in whatever order they
 * are stored, and held by the consumer so it has a URL.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  rowAction,
  label,
  className,
}: TableProps<T>) {
  const active = sort ? columns.find((c) => c.id === sort.column) : undefined;
  const sortValue = active?.sortValue;
  const ordered =
    sortValue && sort
      ? [...rows].sort((a, b) => {
          const va = sortValue(a);
          const vb = sortValue(b);
          // Undefined sinks regardless of direction: it is an absence, not a small value.
          if (va === undefined || vb === undefined) return compare(va, vb);
          return sort.direction === 'asc' ? compare(va, vb) : compare(vb, va);
        })
      : rows;

  function toggle(column: TableColumn<T>): void {
    if (!onSortChange) return;
    const direction =
      sort?.column === column.id
        ? sort.direction === 'asc'
          ? 'desc'
          : 'asc'
        : (column.defaultDirection ?? 'asc');
    onSortChange({ column: column.id, direction });
  }

  return (
    <div className={cx('@container overflow-x-auto', className)}>
      <table
        aria-label={label}
        className="block w-full border-collapse text-body @2xl:table @2xl:overflow-hidden @2xl:rounded-panel @2xl:bg-surface-raised"
      >
        <thead className="hidden @2xl:table-header-group">
          <tr className="text-caption text-text-mute">
            {columns.map((column) => {
              const sortable = column.sortValue !== undefined && onSortChange !== undefined;
              const isActive = sort?.column === column.id;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    isActive ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cx(
                    'px-3 py-2 font-medium',
                    column.align === 'end' ? 'text-right' : 'text-left',
                    column.className,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(column)}
                      className={cx(
                        'inline-flex items-center gap-1 transition-colors hover:text-text',
                        isActive && 'text-text',
                      )}
                    >
                      {column.header}
                      {isActive ? <Chevron up={sort?.direction === 'asc'} /> : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
            {rowAction ? <th scope="col" className="px-3 py-2" /> : null}
          </tr>
        </thead>
        <tbody className="flex flex-col gap-2 @2xl:table-row-group">
          {ordered.map((row) => (
            <tr
              key={rowKey(row)}
              className="block rounded-panel bg-surface-raised p-3 @2xl:table-row @2xl:rounded-none @2xl:border-t @2xl:border-bg @2xl:p-0"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cx(
                    column.primary
                      ? 'mb-1.5 block'
                      : 'mr-3 inline-flex items-center gap-1 text-caption',
                    CELL,
                    column.align === 'end' && '@2xl:text-right',
                    column.className,
                  )}
                >
                  {column.primary ? null : (
                    <span className="text-text-mute @2xl:hidden">{column.header}</span>
                  )}
                  {column.cell(row)}
                </td>
              ))}
              {rowAction ? (
                <td className={cx('mt-2 block @2xl:text-right @2xl:whitespace-nowrap', CELL)}>
                  {rowAction(row)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
