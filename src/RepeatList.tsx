import type { ReactNode } from 'react';
import { Button } from './Button.js';
import { cx } from './cx.js';
import { tipAnchor } from './tip.js';

export type RepeatCellSize = 'sm' | 'md' | 'lg';

export interface RepeatCell {
  key: string;
  node: ReactNode;
  /** sm holds a code or a number and does not grow; md and lg share the rest, lg twice as fast. */
  size?: RepeatCellSize;
}

export interface RepeatListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  /** The item "Add" appends. */
  newItem: () => T;
  /** One row's controls, in order. Pass each control `hideLabel`: the header or the placeholder says what it is. */
  cells: (item: T, update: (next: T) => void, index: number) => RepeatCell[];
  /** Column labels, one per cell, drawn once above the rows with the same widths. */
  columns?: ReactNode[];
  /** The add button's words: "Add condition". */
  addLabel: string;
  /** The remove button's accessible name for one row. Defaults to "Remove row N". */
  removeLabel?: (item: T, index: number) => string;
  /** Remove is disabled while the list holds this many. */
  minItems?: number;
  className?: string;
}

const SIZES: Record<RepeatCellSize, string> = {
  sm: 'shrink-0 grow-0 basis-18',
  md: 'grow basis-24',
  lg: 'grow-[2] basis-24',
};

function Cells({ cells }: { cells: { key: string; node: ReactNode; size?: RepeatCellSize }[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
      {cells.map((cell) => (
        <div key={cell.key} className={cx('min-w-0', SIZES[cell.size ?? 'md'])}>
          {cell.node}
        </div>
      ))}
    </div>
  );
}

/**
 * A list the consumer owns, edited as one row of controls per item: a remove button at the
 * end of each row and an add button under the last. Rows wrap onto a second line in a narrow
 * container rather than squeezing every control.
 */
export function RepeatList<T>({
  items,
  onChange,
  newItem,
  cells,
  columns,
  addLabel,
  removeLabel,
  minItems = 0,
  className,
}: RepeatListProps<T>) {
  const rows = items.map((item, i) =>
    cells(
      item,
      (next) => {
        onChange(items.map((it, j) => (j === i ? next : it)));
      },
      i,
    ),
  );
  const first = rows[0];
  return (
    <div className={cx('flex min-w-0 flex-col gap-3', className)}>
      {columns && first ? (
        <div aria-hidden className="-mb-2 flex items-end gap-1.5 text-caption text-text-mute">
          <Cells
            cells={first.map((cell, i) => ({
              key: cell.key,
              size: cell.size,
              node: <span className="block truncate">{columns[i]}</span>,
            }))}
          />
          <span className="w-8 shrink-0" />
        </div>
      ) : null}
      {rows.map((row, i) => {
        const name = removeLabel?.(items[i] as T, i) ?? `Remove row ${String(i + 1)}`;
        return (
          <div key={i} className="flex items-start gap-1.5">
            <Cells cells={row} />
            <Button
              variant="ghost"
              aria-label={name}
              {...tipAnchor(name)}
              disabled={items.length <= minItems}
              className="w-8 px-0 text-body-large"
              onClick={() => {
                onChange(items.filter((_, j) => j !== i));
              }}
            >
              &times;
            </Button>
          </div>
        );
      })}
      <div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onChange([...items, newItem()]);
          }}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
