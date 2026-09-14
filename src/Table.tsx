import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Badge } from './Badge.js';
import { Menu, MenuItem, MenuLabel } from './Menu.js';
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
  /**
   * Higher survives longer as the container narrows; the default is 0. `100` and up is the
   * must-show band, which is never hidden - the table stacks into cards instead.
   */
  priority?: number;
  /** A narrower rendering - icons where the full cell has words - tried before anything is hidden. */
  compact?: (row: T) => ReactNode;
  /** The header that goes with `compact`. Defaults to `header`. */
  compactHeader?: ReactNode;
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
const TABLE_WIDE = '@2xl:table @2xl:overflow-hidden @2xl:rounded-panel @2xl:bg-surface-raised';
const ROW_WIDE = '@2xl:table-row @2xl:rounded-none @2xl:border-t @2xl:border-bg @2xl:p-0';
const NARROW_COLUMN = '@2xl:w-px @2xl:whitespace-nowrap';

/**
 * One markup path: a real <table> from `@2xl` (a container query, so it keys off its own column,
 * not the viewport) and below that each row is a card whose cells wrap with their column label in
 * front of them. The sort is applied here so the consumer can keep its rows in whatever order they
 * are stored, and held by the consumer so it has a URL.
 *
 * Columns give way in order as the container narrows: anything with `compact` switches to its
 * narrow rendering, then the lowest `priority` columns drop one at a time behind a "+N" menu, and
 * only when the primary column plus the must-show band still overflows does the table stack.
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
  const hideable = columns
    .map((column, index) => ({ column, index }))
    .filter(({ column }) => !column.primary && (column.priority ?? 0) < 100)
    .sort((a, b) => (a.column.priority ?? 0) - (b.column.priority ?? 0) || b.index - a.index)
    .map(({ column }) => column.id);
  const compactAt = columns.some((column) => column.compact) ? 1 : 0;
  const lastStep = compactAt + hideable.length;
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const widthRef = useRef(0);

  const compact = compactAt === 1 && step >= compactAt;
  const stacked = step > lastStep;
  const hidden = new Set(
    hideable.slice(0, Math.min(Math.max(step - compactAt, 0), hideable.length)),
  );
  const overflowCell = !stacked && hidden.size > 0;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Only a container that grew can un-hide a column, so a narrowing drag never re-runs the cascade.
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      if (width > widthRef.current) setStep(0);
      widthRef.current = width;
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const table = tableRef.current;
    const head = headRef.current;
    if (!root || !table || !head || step > lastStep) return;
    // A hidden header means the container query already stacked us: nothing to measure.
    if (head.clientHeight === 0) return;
    if (table.scrollWidth > root.clientWidth + 1) setStep(step + 1);
  });

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

  const shown = stacked ? columns : columns.filter((column) => !hidden.has(column.id));

  return (
    <div ref={rootRef} className={cx('@container overflow-x-auto', className)}>
      <table
        ref={tableRef}
        aria-label={label}
        className={cx('block w-full border-collapse text-body', !stacked && TABLE_WIDE)}
      >
        <thead ref={headRef} className={cx('hidden', !stacked && '@2xl:table-header-group')}>
          <tr className="text-caption text-text-mute">
            {shown.map((column) => {
              const narrow = compact && column.compact !== undefined;
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
                    narrow && NARROW_COLUMN,
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
                      {narrow ? (column.compactHeader ?? column.header) : column.header}
                      {isActive ? <Chevron up={sort?.direction === 'asc'} /> : null}
                    </button>
                  ) : narrow ? (
                    (column.compactHeader ?? column.header)
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
            {rowAction ? <th scope="col" className="px-3 py-2" /> : null}
            {overflowCell ? (
              <th scope="col" className={cx('px-3 py-2 text-right', NARROW_COLUMN)}>
                <Menu
                  variant="ghost"
                  size="sm"
                  align="end"
                  label={<Badge size="sm">+{hidden.size}</Badge>}
                >
                  <MenuLabel>Hidden while narrow</MenuLabel>
                  {columns
                    .filter((column) => hidden.has(column.id))
                    .map((column) => (
                      <MenuItem key={column.id}>{column.header}</MenuItem>
                    ))}
                </Menu>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className={cx('flex flex-col gap-2', !stacked && '@2xl:table-row-group')}>
          {ordered.map((row) => (
            <tr
              key={rowKey(row)}
              className={cx('block rounded-panel bg-surface-raised p-3', !stacked && ROW_WIDE)}
            >
              {shown.map((column) => {
                const narrow = !stacked && compact && column.compact !== undefined;
                return (
                  <td
                    key={column.id}
                    className={cx(
                      column.primary
                        ? 'mb-1.5 block'
                        : 'mr-3 inline-flex items-center gap-1 text-caption',
                      !stacked && CELL,
                      !stacked && column.align === 'end' && '@2xl:text-right',
                      narrow && NARROW_COLUMN,
                      column.className,
                    )}
                  >
                    {column.primary ? null : (
                      <span className={cx('text-text-mute', !stacked && '@2xl:hidden')}>
                        {column.header}
                      </span>
                    )}
                    {narrow && column.compact ? column.compact(row) : column.cell(row)}
                  </td>
                );
              })}
              {rowAction ? (
                <td
                  className={cx(
                    'mt-2 block',
                    !stacked && '@2xl:text-right @2xl:whitespace-nowrap',
                    !stacked && CELL,
                  )}
                  colSpan={overflowCell ? 2 : undefined}
                >
                  {rowAction(row)}
                </td>
              ) : null}
              {overflowCell && !rowAction ? <td className={CELL} /> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
