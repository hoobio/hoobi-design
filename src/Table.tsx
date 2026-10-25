import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Badge } from './Badge.js';
import { Checkbox } from './Checkbox.js';
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
  /** Vertical placement for this column's cells. The table's default is `middle`. */
  valign?: 'top' | 'middle';
  /**
   * The row's title. Wide it is an ordinary column; stacked it takes the full width and drops the
   * label every other cell repeats beside its value.
   */
  primary?: boolean;
  /**
   * Higher-priority columns are dropped later as the container narrows; the default is 0.
   * `100` and up is the must-show band, which is never hidden - the table stacks into cards
   * instead.
   */
  priority?: number;
  /** A narrower rendering - icons where the full cell has words - tried before anything is hidden. */
  compact?: (row: T) => ReactNode;
  /** The header that goes with `compact`. Defaults to `header`. */
  compactHeader?: ReactNode;
  /** Stacked, the cell carries no label: its own control already names it. The header still does wide. */
  hideLabel?: boolean;
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
  /** Vertical placement for one row's cells, taking precedence over `valign` on a column. */
  rowValign?: (row: T) => 'top' | 'middle' | undefined;
  /** Names the table for assistive tech. */
  label?: string;
  className?: string;
  /** Pins the header row to the nearest scrolling ancestor; set `--table-sticky-top` to the height of any sticky block above the table. */
  stickyHeader?: boolean;
  /** Row selection, off when absent. Controlled: keys are `rowKey` values. */
  selection?: {
    selected: ReadonlySet<string>;
    onChange: (selected: Set<string>) => void;
    /** Accessible name for a row's checkbox. Defaults to "Select row". */
    label?: (row: T) => string;
    /** Name for the select-all checkbox, which covers the rows currently shown. Defaults to "Select all". */
    allLabel?: string;
  };
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

// Every class is written out in full: Tailwind's compiler only emits utilities that appear
// literally in the file; a class name assembled at runtime goes undetected.
const QUERY_WIDE = {
  table: '@2xl:table @2xl:overflow-hidden @2xl:rounded-panel @2xl:bg-surface-raised',
  tableSticky: '@2xl:table @2xl:overflow-clip @2xl:rounded-panel @2xl:bg-surface-raised',
  head: '@2xl:table-header-group',
  headSticky:
    '@2xl:table-header-group @2xl:sticky @2xl:top-[var(--table-sticky-top,0px)] @2xl:z-10 @2xl:bg-surface-raised',
  body: '@2xl:table-row-group',
  row: '@2xl:static @2xl:table-row @2xl:rounded-none @2xl:border-t @2xl:border-bg @2xl:p-0 @2xl:hover:bg-surface',
  cell: '@2xl:table-cell @2xl:px-3 @2xl:py-2 @2xl:text-body',
  top: '@2xl:align-top',
  middle: '@2xl:align-middle',
  narrow: '@2xl:w-px @2xl:whitespace-nowrap',
  end: '@2xl:text-right',
  // w-px: the action cell hugs its control, so a table with room to spare gives it to a real column.
  action: '@2xl:static @2xl:w-px @2xl:text-right @2xl:whitespace-nowrap',
  label: '@2xl:hidden',
  nowrap: '',
  fluid: '',
};
const MEASURED_WIDE = {
  table: 'table overflow-hidden rounded-panel bg-surface-raised',
  tableSticky: 'table overflow-clip rounded-panel bg-surface-raised',
  head: 'table-header-group',
  headSticky:
    'table-header-group sticky top-[var(--table-sticky-top,0px)] z-10 bg-surface-raised',
  body: 'table-row-group',
  row: 'static table-row rounded-none border-t border-bg p-0 hover:bg-surface',
  cell: 'table-cell px-3 py-2 text-body',
  top: 'align-top',
  middle: 'align-middle',
  narrow: 'w-px whitespace-nowrap',
  end: 'text-right',
  action: 'static w-px text-right whitespace-nowrap',
  label: 'hidden',
  nowrap: 'whitespace-nowrap',
  fluid: 'w-full max-w-0 truncate',
};
// The primary column truncates, so it has no natural width: this is the room it must keep or stack.
const PRIMARY_MIN = 320;

/**
 * One markup path: a real <table> from `@2xl` (a container query, keyed off its own column
 * width, not the viewport), and below that each row is a card whose cells show their column
 * label above the value, wrapping in the order the columns are given; a column's `className`
 * takes `@max-*` flex utilities to group the cells onto lines. The sort is applied here so the consumer can keep its rows in
 * whatever order they are stored, and held by the consumer so it has a URL.
 *
 * A column with `priority` or `compact` set turns on progressive hiding: cells stop wrapping,
 * the natural width is measured against the wrapper, and columns are dropped in order as the
 * container narrows. Anything with `compact` switches to its narrow rendering first, then the
 * lowest-`priority` columns drop one at a time behind a "+N" menu, and the table stacks only
 * once the primary column plus the must-show band no longer fit. Such a table stacks on that
 * measurement rather than on the container query.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  rowAction,
  rowValign,
  label,
  className,
  stickyHeader = false,
  selection,
}: TableProps<T>) {
  const hideable = columns
    .map((column, index) => ({ column, index }))
    .filter(({ column }) => !column.primary && (column.priority ?? 0) < 100)
    .sort((a, b) => (a.column.priority ?? 0) - (b.column.priority ?? 0) || b.index - a.index)
    .map(({ column }) => column.id);
  const progressive = columns.some(
    (column) => column.compact !== undefined || column.priority !== undefined,
  );
  const wide = progressive ? MEASURED_WIDE : QUERY_WIDE;
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
  const shown = stacked ? columns : columns.filter((column) => !hidden.has(column.id));

  const measure = useRef<(() => void) | null>(null);
  measure.current = () => {
    const root = rootRef.current;
    const table = tableRef.current;
    const head = headRef.current;
    if (!root || !table || !head || !progressive || step > lastStep) return;
    if (head.clientHeight === 0) return;
    const rawPrimaryIndex = shown.findIndex((column) => column.primary);
    // A leading selection checkbox cell shifts every DOM column index by one.
    const primaryIndex = rawPrimaryIndex >= 0 && selection ? rawPrimaryIndex + 1 : rawPrimaryIndex;
    const widths: number[] = [];
    for (const row of Array.from(table.rows)) {
      Array.from(row.cells).forEach((cell, index) => {
        if (index === primaryIndex) return;
        widths[index] = Math.max(widths[index] ?? 0, cell.scrollWidth);
      });
    }
    const needed =
      widths.reduce((total, width) => total + width, 0) + (primaryIndex >= 0 ? PRIMARY_MIN : 0);
    if (needed > root.clientWidth) setStep(step + 1);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      const grew = width > widthRef.current;
      widthRef.current = width;
      cancelAnimationFrame(frame);
      // A container that grew re-measures from the full column set; a narrowing one continues from the current step.
      frame = requestAnimationFrame(() => (grew ? setStep(0) : measure.current?.()));
    });
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    measure.current?.();
  });

  const active = sort ? columns.find((c) => c.id === sort.column) : undefined;
  const sortValue = active?.sortValue;
  const ordered =
    sortValue && sort
      ? [...rows].sort((a, b) => {
          const va = sortValue(a);
          const vb = sortValue(b);
          // Undefined represents missing data, so it always sinks regardless of sort direction.
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

  const orderedKeys = selection ? ordered.map(rowKey) : [];
  const selectedCount = selection
    ? orderedKeys.filter((key) => selection.selected.has(key)).length
    : 0;
  const allSelected =
    selection !== undefined && orderedKeys.length > 0 && selectedCount === orderedKeys.length;
  const someSelected = selection !== undefined && selectedCount > 0 && !allSelected;

  function toggleAll(): void {
    if (!selection) return;
    // The box covers the rows currently shown, so a key selected under another filter survives.
    const next = new Set(selection.selected);
    for (const key of orderedKeys) {
      if (allSelected) next.delete(key);
      else next.add(key);
    }
    selection.onChange(next);
  }

  function toggleRow(row: T): void {
    if (!selection) return;
    const key = rowKey(row);
    const next = new Set(selection.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  }

  return (
    <div
      ref={rootRef}
      // overflow-x-clip makes no scroll container, so the sticky header resolves against the page scroller
      className={cx('@container', stickyHeader ? 'overflow-x-clip' : 'overflow-x-auto', className)}
    >
      {selection && (!progressive || stacked) ? (
        <div className={cx('mb-2 px-3', !progressive && '@2xl:hidden')}>
          <Checkbox
            label={selection.allLabel ?? 'Select all'}
            className="text-caption text-text-mute"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
          />
        </div>
      ) : null}
      <table
        ref={tableRef}
        aria-label={label}
        className={cx(
          'block w-full border-collapse text-body',
          !stacked && (stickyHeader ? wide.tableSticky : wide.table),
        )}
      >
        <thead
          ref={headRef}
          className={cx('hidden', !stacked && (stickyHeader ? wide.headSticky : wide.head))}
        >
          <tr className="text-caption text-text-mute">
            {selection ? (
              <th scope="col" className={cx('px-3 py-2', !stacked && wide.narrow)}>
                <Checkbox
                  aria-label={selection.allLabel ?? 'Select all'}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </th>
            ) : null}
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
                    !stacked && wide.nowrap,
                    !stacked && column.primary && wide.fluid,
                    narrow && wide.narrow,
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
            {rowAction ? (
              <th scope="col" className={cx('px-3 py-2', !stacked && wide.narrow)} />
            ) : null}
            {overflowCell ? (
              <th scope="col" className={cx('px-3 py-2 text-right', wide.narrow)}>
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
        <tbody className={cx('flex flex-col gap-2', !stacked && wide.body)}>
          {ordered.map((row) => (
            <tr
              key={rowKey(row)}
              className={cx(
                'relative flex flex-wrap items-start gap-x-4 gap-y-2 rounded-panel bg-surface-raised p-3',
                !stacked && wide.row,
              )}
            >
              {selection ? (
                <td className={cx('shrink-0', !stacked && wide.cell, !stacked && wide.narrow)}>
                  <Checkbox
                    aria-label={selection.label?.(row) ?? 'Select row'}
                    checked={selection.selected.has(rowKey(row))}
                    onChange={() => toggleRow(row)}
                  />
                </td>
              ) : null}
              {shown.map((column) => {
                const narrow = !stacked && compact && column.compact !== undefined;
                const valign = rowValign?.(row) ?? column.valign ?? 'middle';
                return (
                  <td
                    key={column.id}
                    className={cx(
                      column.primary
                        ? selection
                          ? 'min-w-0 grow basis-[calc(100%-36px)]'
                          : 'w-full'
                        : 'flex min-w-0 flex-col gap-1 text-caption',
                      // room for the action sitting in the card's corner
                      column.primary &&
                        rowAction &&
                        (stacked ? 'pr-9' : progressive ? undefined : '@max-2xl:pr-9'),
                      !stacked && wide.cell,
                      !stacked && wide[valign],
                      !stacked && column.align === 'end' && wide.end,
                      !stacked && wide.nowrap,
                      !stacked && column.primary && wide.fluid,
                      narrow && wide.narrow,
                      column.className,
                    )}
                  >
                    {column.primary || column.hideLabel ? null : (
                      <span className={cx('text-text-mute', !stacked && wide.label)}>
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
                    // stacked, the row is a card and its action belongs in the corner, not on a line of its own
                    'absolute top-2 right-2',
                    !stacked && wide.action,
                    !stacked && wide.cell,
                    !stacked && wide[rowValign?.(row) ?? 'middle'],
                  )}
                  colSpan={overflowCell ? 2 : undefined}
                >
                  {rowAction(row)}
                </td>
              ) : null}
              {overflowCell && !rowAction ? <td className={wide.cell} /> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
