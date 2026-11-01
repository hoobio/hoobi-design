import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Button, type ButtonSize, type ButtonVariant } from './Button.js';
import { cx } from './cx.js';
import {
  cssLength,
  FLYOUT_MAX_HEIGHT,
  FLYOUT_RESET,
  placePanel,
  placeSubPanel,
  raiseFlyout,
} from './flyout.js';

export interface MenuProps {
  /** The trigger's content. */
  label: ReactNode;
  /** Trigger styling, matching Button. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** 'start' aligns the panel's left edge to the trigger's, 'end' its right. Unset, the trigger's half of the viewport decides: left half 'start', right half 'end'. */
  align?: 'start' | 'end';
  /** Tallest the panel grows before its rows scroll: px, or a CSS length. Default `24rem`, and never past the viewport edge. */
  maxHeight?: number | string;
  /** The trigger's dropdown chevron, on by default. `false` for a glyph trigger that already reads as a menu, such as an ellipsis. */
  chevron?: boolean;
  /** Menu.Item rows. */
  children: ReactNode;
  className?: string;
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  tone?: 'neutral' | 'danger';
  /** Trailing control on the row - its own button, so its clicks never reach the row. */
  action?: ReactNode;
}

export interface MenuSubProps {
  /** The row's content, and the back row's in the drill-down panel. */
  label: ReactNode;
  icon?: ReactNode;
  /** The submenu's rows: Menu.Item, Menu.Label, Menu.Divider and further Menu.Sub. */
  children: ReactNode;
}

export interface MenuLabelProps {
  children: ReactNode;
  className?: string;
}

export interface MenuDividerProps {
  className?: string;
}

const ROW = 'flex h-10 w-full items-center gap-3 rounded-control px-3 text-caption';
const PANEL =
  'mirage-flyout fixed z-50 w-56 max-w-[calc(100vw-2rem)] rounded-panel p-1 shadow-flyout';
const SUBMENU_HOVER_DELAY_MS = 200;
const DRILL_DOWN_QUERY = '(pointer: coarse), (max-width: 40rem)';

/** Set by an open Menu so its items can close it; a no-op for a row used on its own. */
const MenuCloseContext = createContext<() => void>(() => undefined);

/** True when a sibling row has an icon, so icon-less rows reserve the same gutter. */
const MenuGutterContext = createContext(false);

interface MenuNav {
  path: string[];
  go: (path: string[]) => void;
  hover: (path: string[]) => void;
  hold: () => void;
  drill: boolean;
  cap: string;
}

const noop = () => undefined;
const MenuNavContext = createContext<MenuNav>({
  path: [],
  go: noop,
  hover: noop,
  hold: noop,
  drill: false,
  cap: FLYOUT_MAX_HEIGHT,
});
const MenuDepthContext = createContext(0);
const MenuPlaceContext = createContext<object>({});

function useLevel() {
  const nav = useContext(MenuNavContext);
  const depth = useContext(MenuDepthContext);
  return { nav, depth, hidden: nav.drill && nav.path.length > depth };
}

/** Does any row at this level have an icon? A submenu's rows decide their own gutter. */
function hasIconRow(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;
    const props = child.props as { icon?: ReactNode; children?: ReactNode };
    if (child.type === MenuSub) return props.icon !== undefined;
    return props.icon !== undefined || hasIconRow(props.children);
  });
}

/**
 * Decides the icon gutter for one group of rows. Menu wraps its panel in this; Shell's
 * user flyout wraps its own rows, which are outside a Menu.
 */
export function MenuGutter({ children }: { children: ReactNode }) {
  return (
    <MenuGutterContext.Provider value={hasIconRow(children)}>{children}</MenuGutterContext.Provider>
  );
}

function RowIcon({ icon }: { icon: ReactNode }) {
  const gutter = useContext(MenuGutterContext);
  // A wrapped icon keeps every row's glyph on the same 20px cell.
  if (icon !== undefined) {
    return (
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>
    );
  }
  return gutter ? <span aria-hidden className="size-5 shrink-0" /> : null;
}

function Chevron({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden fill="none" className="size-3 shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const CHEVRON_RIGHT = 'M4.5 2.5L8 6l-3.5 3.5';
const CHEVRON_LEFT = 'M7.5 2.5L4 6l3.5 3.5';

export function MenuItem({
  icon,
  tone = 'neutral',
  action,
  className,
  children,
  onClick,
  onPointerEnter,
  ...rest
}: MenuItemProps) {
  const close = useContext(MenuCloseContext);
  const { nav, depth, hidden } = useLevel();
  if (hidden) return null;
  // A row without its own onClick is inert (a linked account whose only act is its trailing
  // button): no hover fill, no button semantics, and clicking it closes nothing.
  const interactive = onClick !== undefined;
  const rowClass = cx(
    // caption size: a flyout is a 216px pane of controls, sized for quick scanning.
    ROW,
    tone === 'danger' ? 'text-danger' : 'text-text',
    interactive && (tone === 'danger' ? 'hover:bg-danger/15' : 'hover:bg-surface'),
    // Clears a ghost sm action ("unlink") so a long label truncates instead of colliding.
    action ? 'pr-16' : undefined,
    className,
  );
  const inner = (
    <>
      <RowIcon icon={icon} />
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    </>
  );
  const row = interactive ? (
    <button
      type="button"
      onClick={(e) => {
        close();
        onClick(e);
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse' && !nav.drill) nav.hover(nav.path.slice(0, depth));
        onPointerEnter?.(e);
      }}
      className={rowClass}
      {...rest}
    >
      {inner}
    </button>
  ) : (
    <div className={rowClass}>{inner}</div>
  );

  if (!action) return row;

  // Overlaid rather than nested: a button cannot contain a button, and the row's
  // hover fill must still span the full row width beneath it.
  return (
    <div className="relative flex items-center">
      {row}
      <span
        className="absolute right-1 flex shrink-0 items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        {action}
      </span>
    </div>
  );
}

export function MenuSub({ label, icon, children }: MenuSubProps) {
  const { nav, depth, hidden } = useLevel();
  const id = useId();
  const rowRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<CSSProperties>({});
  const [leftward, setLeftward] = useState(false);
  const parentPlace = useContext(MenuPlaceContext);
  const reposition = useRef<(() => void) | undefined>(undefined);
  const focusOnOpen = useRef(false);
  const focusOnClose = useRef(false);
  const open = nav.path[depth] === id;
  const here = nav.path.slice(0, depth);
  const cascade = open && !nav.drill;

  const openSub = (keyboard: boolean) => {
    focusOnOpen.current = keyboard;
    nav.go([...here, id]);
  };
  const closeSub = (keyboard: boolean) => {
    focusOnClose.current = keyboard;
    nav.go(here);
  };

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!cascade || !panel) return;
    const lower = raiseFlyout(panel);
    const position = () => {
      const row = rowRef.current;
      const parent = row?.closest<HTMLElement>('[data-menu-panel]');
      if (row && parent) {
        const next = placeSubPanel(
          row.getBoundingClientRect(),
          parent.getBoundingClientRect(),
          panel,
          nav.cap,
          parent.dataset.menuPanel === 'left',
        );
        setPlace(next.style);
        setLeftward(next.leftward);
      }
    };
    reposition.current = position;
    position();
    const resize = new ResizeObserver(position);
    resize.observe(panel);
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
      reposition.current = undefined;
      lower();
    };
  }, [cascade, nav.cap]);

  // A child's scroll listener runs before its parent panel moves, so re-measure once it has.
  useLayoutEffect(() => {
    reposition.current?.();
  }, [parentPlace]);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      (nav.drill
        ? backRef.current
        : panelRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      )?.focus();
    }
    if (!open && focusOnClose.current) {
      focusOnClose.current = false;
      rowRef.current?.focus();
    }
  }, [open, nav.drill]);

  // One tree shape whether or not a deeper level is open, so the rows keep their useId.
  const rows = (back?: ReactNode) => (
    <MenuDepthContext.Provider value={depth + 1}>
      {back}
      <MenuGutter>{children}</MenuGutter>
    </MenuDepthContext.Provider>
  );

  if (open && nav.drill) {
    const deeper = nav.path.length > depth + 1;
    return rows(
      <>
        {deeper ? null : (
          <button
            ref={backRef}
            type="button"
            onClick={(e) => {
              closeSub(e.detail === 0);
            }}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft') return;
              e.preventDefault();
              closeSub(true);
            }}
            className={cx(ROW, 'text-text-dim hover:bg-surface')}
          >
            <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
              <Chevron d={CHEVRON_LEFT} />
            </span>
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          </button>
        )}
        <MenuDivider className="mt-1" />
      </>,
    );
  }
  if (hidden) return null;

  return (
    <>
      <button
        ref={rowRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          openSub(e.detail === 0);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight') return;
          e.preventDefault();
          openSub(true);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse' && !nav.drill) nav.hover([...here, id]);
        }}
        className={cx(ROW, 'text-text hover:bg-surface', open && 'bg-surface')}
      >
        <RowIcon icon={icon} />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <Chevron d={CHEVRON_RIGHT} />
      </button>
      {cascade ? (
        <div
          ref={panelRef}
          role="menu"
          data-menu-panel={leftward ? 'left' : 'right'}
          style={{ ...FLYOUT_RESET, ...place }}
          className={cx(PANEL, 'fade-in')}
          onPointerEnter={nav.hold}
          onKeyDown={(e) => {
            if (e.key !== 'Escape' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            e.stopPropagation();
            closeSub(true);
          }}
        >
          <MenuPlaceContext.Provider value={place}>{rows()}</MenuPlaceContext.Provider>
        </div>
      ) : null}
    </>
  );
}

export function MenuLabel({ children, className }: MenuLabelProps) {
  if (useLevel().hidden) return null;
  return (
    <div className={cx('px-3 pt-2 pb-1 text-caption text-text-mute', className)}>{children}</div>
  );
}

export function MenuDivider({ className }: MenuDividerProps) {
  if (useLevel().hidden) return null;
  // -mx-1 cancels the panel's p-1: a hairline is a slice of page background through
  // the whole surface, so an inset one reads as a drawn line instead.
  return <div role="separator" className={cx('-mx-1 my-1 border-t border-bg', className)} />;
}

export function Menu({
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  align,
  maxHeight = FLYOUT_MAX_HEIGHT,
  chevron = true,
  children,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const [drill, setDrill] = useState(false);
  const [place, setPlace] = useState({ top: 0, left: 0, maxHeight: cssLength(maxHeight) });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  const go = useCallback((next: string[]) => {
    window.clearTimeout(hoverTimer.current);
    setPath((was) => (was.join('\n') === next.join('\n') ? was : next));
  }, []);
  const shut = useCallback(() => {
    go([]);
    setOpen(false);
  }, [go]);
  const nav = useMemo<MenuNav>(
    () => ({
      path,
      go,
      hover: (next) => {
        window.clearTimeout(hoverTimer.current);
        hoverTimer.current = window.setTimeout(() => {
          go(next);
        }, SUBMENU_HOVER_DELAY_MS);
      },
      hold: () => {
        window.clearTimeout(hoverTimer.current);
      },
      drill,
      cap: cssLength(maxHeight),
    }),
    [path, go, drill, maxHeight],
  );

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current);
    },
    [],
  );

  // The root's rect is the trigger's: the panel is the only other child and it is out of flow.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const lower = raiseFlyout(panel);
    const position = () => {
      const anchor = rootRef.current?.getBoundingClientRect();
      if (anchor) {
        setPlace(placePanel(anchor, panel, align && `bottom-${align}`, cssLength(maxHeight)));
      }
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
  }, [open, align, maxHeight]);

  useLayoutEffect(() => {
    if (drill && panelRef.current) panelRef.current.scrollTop = 0;
  }, [drill, path]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== 'Escape') return;
        if (path.length) {
          go(path.slice(0, -1));
          return;
        }
      }
      if (e instanceof PointerEvent && rootRef.current?.contains(e.target as Node)) return;
      shut();
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open, path, go, shut]);

  return (
    <div ref={rootRef} className={cx('relative inline-flex', className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            shut();
            return;
          }
          setDrill(window.matchMedia(DRILL_DOWN_QUERY).matches);
          setOpen(true);
        }}
        // A menu button never takes focus from a pointer, so a click can never
        // paint the focus ring; keyboard focus still shows the ring.
        onPointerDown={(e) => {
          e.preventDefault();
        }}
      >
        {label}
        {chevron ? (
          <svg
            viewBox="0 0 12 12"
            aria-hidden
            fill="none"
            className={cx(
              'size-3 shrink-0 transition-transform duration-250 ease-standard',
              open && 'rotate-180',
            )}
          >
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
      </Button>
      <div
        ref={panelRef}
        role="menu"
        data-menu-panel="right"
        style={{ ...FLYOUT_RESET, ...place }}
        className={cx(PANEL, open ? 'fade-in' : 'hidden')}
      >
        <MenuCloseContext.Provider value={shut}>
          <MenuNavContext.Provider value={nav}>
            <MenuPlaceContext.Provider value={place}>
              <MenuGutter>{children}</MenuGutter>
            </MenuPlaceContext.Provider>
          </MenuNavContext.Provider>
        </MenuCloseContext.Provider>
      </div>
    </div>
  );
}

Menu.Item = MenuItem;
Menu.Sub = MenuSub;
Menu.Label = MenuLabel;
Menu.Divider = MenuDivider;
