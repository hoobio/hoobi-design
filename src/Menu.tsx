import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Button, type ButtonSize, type ButtonVariant } from './Button.js';
import { cx } from './cx.js';

export interface MenuProps {
  /** The trigger's content. */
  label: ReactNode;
  /** Trigger styling, matching Button. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** 'start' (default) aligns the panel's left edge to the trigger's, 'end' its right. */
  align?: 'start' | 'end';
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

export function MenuItem({
  icon,
  tone = 'neutral',
  action,
  className,
  children,
  onClick,
  ...rest
}: MenuItemProps) {
  const close = useContext(MenuCloseContext);
  const row = (
    <button
      type="button"
      onClick={(e) => {
        close();
        onClick?.(e);
      }}
      className={cx(
        'flex h-10 w-full items-center gap-3 rounded-control px-3 text-body',
        tone === 'danger' ? 'text-danger hover:bg-danger/15' : 'text-text hover:bg-surface',
        action ? 'pr-12' : undefined,
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden className="flex shrink-0 items-center">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    </button>
  );

  if (!action) return row;

  // Overlaid rather than nested: a button cannot contain a button, and the row's
  // hover fill still has to run the full width under it.
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
    <div className={cx('px-3 pt-2 pb-1 font-mono text-caption text-text-mute', className)}>
      {children}
    </div>
  );
}

export function MenuDivider({ className }: MenuDividerProps) {
  return <div role="separator" className={cx('my-1 border-t border-bg', className)} />;
}

export function Menu({
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  align = 'start',
  children,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel is fixed and placed off the trigger's rect: a scroll-container
  // ancestor would otherwise clip it. Always mounted, so the ref is there on click.
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const panel = panelRef.current;
    if (panel) {
      panel.style.top = `${String(rect.bottom + 4)}px`;
      if (align === 'end') {
        panel.style.left = 'auto';
        panel.style.right = `${String(Math.max(window.innerWidth - rect.right, 8))}px`;
      } else {
        panel.style.right = 'auto';
        panel.style.left = `${String(Math.max(rect.left, 8))}px`;
      }
    }
    setOpen((was) => !was);
  };

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
        onClick={toggle}
        // A menu button never takes focus from a pointer, so a click can never
        // paint the focus ring; keyboard focus still rings as it should.
        onPointerDown={(e) => {
          e.preventDefault();
        }}
      >
        {label}
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
      </Button>
      <div
        ref={panelRef}
        role="menu"
        className={cx(
          'fixed z-50 w-56 max-w-[calc(100vw-2rem)] rounded-panel bg-surface-raised p-1',
          open ? 'fade-in' : 'hidden',
        )}
      >
        <MenuCloseContext.Provider
          value={() => {
            setOpen(false);
          }}
        >
          {children}
        </MenuCloseContext.Provider>
      </div>
    </div>
  );
}

Menu.Item = MenuItem;
Menu.Label = MenuLabel;
Menu.Divider = MenuDivider;
