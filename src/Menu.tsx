import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, type ButtonSize, type ButtonVariant } from './Button.js';
import { cx } from './cx.js';
import { FLYOUT_RESET, placeFlyout, raiseFlyout } from './flyout.js';

export interface MenuProps {
  /** The trigger's content. */
  label: ReactNode;
  /** Trigger styling, matching Button. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** 'start' (default) aligns the panel's left edge to the trigger's, 'end' its right. */
  align?: 'start' | 'end';
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

export interface MenuLabelProps {
  children: ReactNode;
  className?: string;
}

export interface MenuDividerProps {
  className?: string;
}

/** Set by an open Menu so its items can close it; a no-op for a row used on its own. */
const MenuCloseContext = createContext<() => void>(() => undefined);

/** True when a sibling row has an icon, so icon-less rows reserve the same gutter. */
const MenuGutterContext = createContext(false);

/** Does any descendant row have an icon? Read once by Menu, off its own children. */
function hasIconRow(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;
    const props = child.props as { icon?: ReactNode; children?: ReactNode };
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

export function MenuItem({
  icon: iconProp,
  tone = 'neutral',
  action,
  className,
  children,
  onClick,
  ...rest
}: MenuItemProps) {
  const close = useContext(MenuCloseContext);
  const gutter = useContext(MenuGutterContext);
  // A wrapped icon keeps every row's glyph on the same 20px cell.
  const icon =
    iconProp === undefined ? undefined : (
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center">
        {iconProp}
      </span>
    );
  // A row without its own onClick is inert (a linked account whose only act is its trailing
  // button): no hover fill, no button semantics, and clicking it closes nothing.
  const interactive = onClick !== undefined;
  const rowClass = cx(
    // caption size: a flyout is a 216px pane of controls, sized for quick scanning.
    'flex h-10 w-full items-center gap-3 rounded-control px-3 text-caption',
    tone === 'danger' ? 'text-danger' : 'text-text',
    interactive && (tone === 'danger' ? 'hover:bg-danger/15' : 'hover:bg-surface'),
    // Clears a ghost sm action ("unlink") so a long label truncates instead of colliding.
    action ? 'pr-16' : undefined,
    className,
  );
  const inner = (
    <>
      {icon ?? (gutter ? <span aria-hidden className="size-5 shrink-0" /> : null)}
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

export function MenuLabel({ children, className }: MenuLabelProps) {
  return (
    <div className={cx('px-3 pt-2 pb-1 text-caption text-text-mute', className)}>{children}</div>
  );
}

export function MenuDivider({ className }: MenuDividerProps) {
  // -mx-1 cancels the panel's p-1: a hairline is a slice of page background through
  // the whole surface, so an inset one reads as a drawn line instead.
  return <div role="separator" className={cx('-mx-1 my-1 border-t border-bg', className)} />;
}

export function Menu({
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  align = 'start',
  chevron = true,
  children,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The root's rect is the trigger's: the panel is the only other child and it is out of flow.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const lower = raiseFlyout(panel);
    const position = () => {
      const anchor = rootRef.current?.getBoundingClientRect();
      if (anchor) {
        setPlace(placeFlyout(anchor, panel.getBoundingClientRect(), `bottom-${align}`));
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
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof PointerEvent && rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cx('relative inline-flex', className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((was) => !was);
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
        style={{ ...FLYOUT_RESET, ...place }}
        className={cx(
          'mirage-flyout fixed z-50 w-56 max-w-[calc(100vw-2rem)] rounded-panel p-1 shadow-flyout',
          open ? 'fade-in' : 'hidden',
        )}
      >
        <MenuCloseContext.Provider
          value={() => {
            setOpen(false);
          }}
        >
          <MenuGutter>{children}</MenuGutter>
        </MenuCloseContext.Provider>
      </div>
    </div>
  );
}

Menu.Item = MenuItem;
Menu.Label = MenuLabel;
Menu.Divider = MenuDivider;
