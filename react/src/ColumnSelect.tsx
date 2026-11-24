import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';
import { cssLength, FLYOUT_MAX_HEIGHT, FLYOUT_RESET, placePanel, raiseFlyout } from './flyout.js';
import { ChevronIcon } from './icons.js';

export interface ColumnSelectOption {
  value: string;
  label: string;
  detail?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
}

export interface ColumnSelectProps {
  options: ColumnSelectOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  label?: ReactNode;
  info?: string;
  error?: ReactNode;
  hideLabel?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  maxHeight?: number | string;
  className?: string;
}

const TYPEAHEAD_MS = 500;

export function stepOption(options: ColumnSelectOption[], from: number, step: 1 | -1): number {
  for (let i = from + step; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i;
  }
  return from;
}

export function edgeOption(options: ColumnSelectOption[], end: boolean): number {
  return end ? stepOption(options, options.length, -1) : stepOption(options, -1, 1);
}

export function matchOption(options: ColumnSelectOption[], from: number, text: string): number {
  const query = text.toLowerCase();
  const start = text.length > 1 ? Math.max(from, 0) : from + 1;
  for (let n = 0; n < options.length; n++) {
    const i = (start + n) % options.length;
    const option = options[i];
    if (option && !option.disabled && option.label.toLowerCase().startsWith(query)) return i;
  }
  return -1;
}

export function ColumnSelect({
  options,
  value,
  onChange,
  label,
  info,
  error,
  hideLabel = false,
  placeholder,
  disabled,
  id,
  'aria-label': ariaLabel,
  maxHeight = FLYOUT_MAX_HEIGHT,
  className,
}: ColumnSelectProps) {
  const fallbackId = useId();
  const triggerId = id ?? fallbackId;
  const listId = `${triggerId}-list`;
  const infoId = `${triggerId}-info`;
  const optionId = (index: number) => `${listId}-${String(index)}`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [minWidth, setMinWidth] = useState(0);
  const [place, setPlace] = useState({ top: 0, left: 0, maxHeight: cssLength(maxHeight) });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const selected = options.findIndex((option) => option.value === value);
  const current = options[selected];

  const show = (index: number) => {
    setMinWidth(triggerRef.current?.offsetWidth ?? 0);
    setActive(index);
    setOpen(true);
  };

  const pick = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    setOpen(false);
    if (option.value !== value) onChange(option.value);
  };

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const lower = raiseFlyout(panel);
    const position = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (anchor) setPlace(placePanel(anchor, panel, undefined, cssLength(maxHeight)));
    };
    position();
    const resize = new ResizeObserver(position);
    resize.observe(panel);
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
      lower();
    };
  }, [open, maxHeight]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
    };
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const typeahead = (key: string): number => {
    const now = Date.now();
    const text = (now - typed.current.at < TYPEAHEAD_MS ? typed.current.text : '') + key;
    typed.current = { text, at: now };
    return matchOption(options, open ? active : selected, text);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const typing = Date.now() - typed.current.at < TYPEAHEAD_MS;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key !== ' ' || typing)) {
      e.preventDefault();
      const match = typeahead(e.key);
      if (match >= 0) {
        if (open) setActive(match);
        else show(match);
      }
      return;
    }
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show(selected >= 0 ? selected : edgeOption(options, false));
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        show(edgeOption(options, e.key === 'End'));
      }
      return;
    }
    const moves: Record<string, () => number> = {
      ArrowDown: () => stepOption(options, active, 1),
      ArrowUp: () => stepOption(options, active, -1),
      Home: () => edgeOption(options, false),
      End: () => edgeOption(options, true),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      setActive(move());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label ? (
        <FieldLabel
          htmlFor={triggerId}
          info={info}
          infoId={infoId}
          className={hideLabel ? 'sr-only' : undefined}
        >
          {label}
        </FieldLabel>
      ) : null}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={info ? infoId : undefined}
        disabled={disabled}
        onClick={() => {
          if (open) setOpen(false);
          else show(selected >= 0 ? selected : edgeOption(options, false));
        }}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => {
          if (e.key === ' ') e.preventDefault();
        }}
        onBlur={() => {
          setOpen(false);
        }}
        className={cx(
          'flex h-8 w-full min-w-0 items-center gap-2 rounded-control px-2.5 text-left text-body text-text disabled:opacity-50',
          error ? 'bg-danger/15' : 'bg-chip',
        )}
      >
        {current ? (
          <>
            <span className="shrink-0 whitespace-nowrap">{current.label}</span>
            <span className="min-w-0 flex-1 truncate text-text-dim">{current.detail}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-text-mute">{placeholder}</span>
        )}
        <ChevronIcon
          aria-hidden
          className={cx(
            'size-3 shrink-0 text-text-mute transition-transform duration-150 ease-standard',
            open ? '-rotate-90' : 'rotate-90',
          )}
        />
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={listId}
          role="listbox"
          aria-labelledby={label ? triggerId : undefined}
          aria-label={label ? undefined : ariaLabel}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          style={{ ...FLYOUT_RESET, ...place, minWidth } as CSSProperties}
          className="mirage-flyout fade-in fixed z-50 grid max-w-[calc(100vw-2rem)] grid-cols-[auto_minmax(0,1fr)_auto] content-start gap-x-3 rounded-panel p-1 shadow-flyout"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === selected}
              aria-disabled={option.disabled ? true : undefined}
              onPointerMove={() => {
                if (!option.disabled && index !== active) setActive(index);
              }}
              onClick={() => {
                pick(index);
              }}
              className={cx(
                'col-span-3 grid min-h-8 cursor-default grid-cols-subgrid items-center rounded-control px-2.5 text-body pointer-coarse:min-h-11',
                option.disabled
                  ? 'text-text-mute'
                  : index === active
                    ? 'bg-surface'
                    : index === selected && 'bg-chip',
              )}
            >
              <span className="whitespace-nowrap">{option.label}</span>
              <span className="min-w-0 truncate text-text-dim">{option.detail}</span>
              <span className="text-right whitespace-nowrap tabular-nums">{option.trailing}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
