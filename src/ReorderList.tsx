import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cx } from './cx.js';

export interface ReorderHandleProps {
  role: 'button';
  tabIndex: 0;
  'aria-label': string;
  'aria-describedby'?: string;
  onPointerDown: (event: ReactPointerEvent) => void;
  onKeyDown: (event: ReactKeyboardEvent) => void;
  className: string;
}

export interface ReorderListProps<T> {
  items: T[];
  itemKey: (item: T) => string;
  onReorder: (items: T[]) => void;
  /** Renders one row. Spread `handle` onto the element that starts a drag: a grip or the row itself. */
  children: (item: T, handle: ReorderHandleProps) => ReactNode;
  /** Accessible name for a row's handle. Defaults to "Reorder". */
  itemLabel?: (item: T) => string;
  label?: string;
  className?: string;
}

interface DragState {
  key: string;
  from: number;
  to: number;
  dy: number;
  tops: number[];
  heights: number[];
  centres: number[];
  settling: boolean;
}

const SLIDE = 'transform 250ms var(--ease-decelerate)';
const SLIDE_MS = 250;

function reorderTo<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

/**
 * Drag or keyboard reordering of a list the consumer owns: `onReorder` hands back the whole
 * array in its new order and the consumer stores it. The dragged row lifts on the flyout
 * elevation and follows the pointer while its neighbours slide into the slot it left; on drop
 * it animates point to point into that slot and the transforms clear in the same update as the
 * reorder, so nothing flashes. Vertical only.
 */
export function ReorderList<T>({
  items,
  itemKey,
  onReorder,
  children,
  itemLabel,
  label,
  className,
}: ReorderListProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flip, setFlip] = useState<Record<string, number>>({});
  const [announcement, setAnnouncement] = useState('');
  const startY = useRef(0);
  const pending = useRef<T[] | null>(null);
  const flipFrom = useRef<Map<string, number> | null>(null);
  const hintId = `${useId()}-reorder-hint`;

  const rowTops = useCallback(
    () => [...(listRef.current?.children ?? [])].map((row) => row.getBoundingClientRect().top),
    [],
  );

  const commit = useCallback(
    (next: T[]) => {
      const tops = rowTops();
      flipFrom.current = new Map(items.map((item, i) => [itemKey(item), tops[i] as number]));
      onReorder(next);
    },
    [items, itemKey, onReorder, rowTops],
  );

  useLayoutEffect(() => {
    const before = flipFrom.current;
    if (!before) return;
    flipFrom.current = null;
    const tops = rowTops();
    const inverse: Record<string, number> = {};
    items.forEach((item, i) => {
      const was = before.get(itemKey(item));
      const now = tops[i];
      if (was !== undefined && now !== undefined && was !== now) inverse[itemKey(item)] = was - now;
    });
    setFlip(inverse);
    // Two frames: the inverse has to reach the screen untransitioned before it is cleared.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlip({});
      });
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [items, itemKey, rowTops]);

  const finish = useCallback(() => {
    const next = pending.current;
    pending.current = null;
    setDrag(null);
    if (next) onReorder(next);
  }, [onReorder]);

  const settle = useCallback(
    (apply: boolean) => {
      setDrag((current) => {
        if (!current || current.settling) return current;
        const { from, to, tops, heights } = current;
        const moved = apply && to !== from;
        const rest = !moved
          ? 0
          : to > from
            ? (tops[to] as number) + (heights[to] as number) - (heights[from] as number) - (tops[from] as number)
            : (tops[to] as number) - (tops[from] as number);
        pending.current = moved ? reorderTo(items, from, to) : null;
        return { ...current, dy: rest, settling: true };
      });
    },
    [items],
  );

  useEffect(() => {
    if (!drag || drag.settling) return;
    const onMove = (event: PointerEvent) => {
      setDrag((current) => {
        if (!current || current.settling) return current;
        const centre = (current.centres[current.from] as number) + (event.clientY - startY.current);
        let to = current.from;
        for (let j = current.from + 1; j < current.centres.length; j++) {
          if (centre > (current.centres[j] as number)) to = j;
        }
        for (let j = current.from - 1; j >= 0; j--) {
          if (centre < (current.centres[j] as number)) to = j;
        }
        return { ...current, dy: event.clientY - startY.current, to };
      });
    };
    const onUp = () => {
      settle(true);
    };
    const onCancel = () => {
      settle(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') settle(false);
    };
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onCancel);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onCancel);
      removeEventListener('keydown', onKey);
    };
  }, [drag, settle]);

  useEffect(() => {
    if (!drag?.settling) return;
    const timer = setTimeout(finish, SLIDE_MS + 60);
    return () => {
      clearTimeout(timer);
    };
  }, [drag?.settling, finish]);

  const labelOf = (item: T) => itemLabel?.(item) ?? 'Reorder';

  const startDrag = (event: ReactPointerEvent, index: number) => {
    if (event.button !== 0 || items.length < 2 || drag) return;
    const rows = [...(listRef.current?.children ?? [])].map((row) => row.getBoundingClientRect());
    if (rows.length !== items.length) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startY.current = event.clientY;
    setDrag({
      key: itemKey(items[index] as T),
      from: index,
      to: index,
      dy: 0,
      tops: rows.map((row) => row.top),
      heights: rows.map((row) => row.height),
      centres: rows.map((row) => row.top + row.height / 2),
      settling: false,
    });
  };

  const moveTo = (item: T, from: number, to: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, to));
    if (clamped === from) return;
    commit(reorderTo(items, from, clamped));
    setAnnouncement(`Moved ${labelOf(item)} to position ${clamped + 1} of ${items.length}`);
  };

  const onHandleKey = (event: ReactKeyboardEvent, item: T, index: number) => {
    const step =
      event.key === 'ArrowUp'
        ? -1
        : event.key === 'ArrowDown'
          ? 1
          : event.key === 'Home'
            ? -index
            : event.key === 'End'
              ? items.length - 1 - index
              : 0;
    if (step === 0) return;
    event.preventDefault();
    moveTo(item, index, index + step);
  };

  const offsetFor = (index: number, key: string): number => {
    const inverse = flip[key];
    if (inverse !== undefined) return inverse;
    if (!drag) return 0;
    const height = drag.heights[drag.from] as number;
    if (index === drag.from) return drag.dy;
    if (drag.to > drag.from && index > drag.from && index <= drag.to) return -height;
    if (drag.to < drag.from && index >= drag.to && index < drag.from) return height;
    return 0;
  };

  return (
    <div className={cx('min-w-0', className)}>
      <span id={hintId} className="sr-only">
        Drag, or press the arrow keys to move this item.
      </span>
      <ul ref={listRef} role="list" aria-label={label} className="flex flex-col gap-px">
        {items.map((item, index) => {
          const key = itemKey(item);
          const lifted = drag?.key === key;
          const settled = flip[key] !== undefined || (lifted && !drag.settling);
          const offset = offsetFor(index, key);
          return (
            <li
              key={key}
              data-key={key}
              className={cx('relative min-w-0', lifted && 'shadow-flyout')}
              style={{
                transform: `translateY(${String(offset)}px)`,
                transition: settled ? 'none' : SLIDE,
                zIndex: lifted ? 1 : undefined,
              }}
              onTransitionEnd={(event) => {
                if (lifted && drag.settling && event.propertyName === 'transform') finish();
              }}
            >
              {children(item, {
                role: 'button',
                tabIndex: 0,
                'aria-label': labelOf(item),
                'aria-describedby': hintId,
                onPointerDown: (event) => {
                  startDrag(event, index);
                },
                onKeyDown: (event) => {
                  onHandleKey(event, item, index);
                },
                className: cx(
                  'cursor-grab touch-none select-none',
                  lifted && !drag.settling && 'cursor-grabbing',
                ),
              })}
            </li>
          );
        })}
      </ul>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

/** A six-dot grip button that takes the handle props. */
export function ReorderGrip({ className, ...rest }: ReorderHandleProps) {
  return (
    <span
      {...rest}
      className={cx(
        'inline-flex h-8 w-6 shrink-0 items-center justify-center rounded-control text-text-mute hover:bg-surface-raised hover:text-text pointer-coarse:min-h-11',
        className,
      )}
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <circle cx="8" cy="5.5" r="1.25" />
        <circle cx="12" cy="5.5" r="1.25" />
        <circle cx="8" cy="10" r="1.25" />
        <circle cx="12" cy="10" r="1.25" />
        <circle cx="8" cy="14.5" r="1.25" />
        <circle cx="12" cy="14.5" r="1.25" />
      </svg>
    </span>
  );
}
