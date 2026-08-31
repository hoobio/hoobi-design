import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from './cx.js';

/**
 * The one page chrome, WinUI 3 NavigationView sized like exp-textura's MainNav:
 * a 48px top bar spanning the full width with the brand mark in the top-left
 * column, and either a side pane below it (48px icon rail <-> 216px pane on the
 * Fluent decelerate curve) or, in top mode, the items laid along the bar with
 * groups auto-converted to dropdowns. Below md both modes fall back to a
 * slide-in overlay pane behind a scrim.
 */

interface ShellState {
  collapsed: boolean;
  overlayOpen: boolean;
}

const ShellContext = createContext<ShellState>({ collapsed: false, overlayOpen: false });

/** Which presentation a nav row is being rendered into. */
type NavArea = 'side' | 'overlay' | 'top' | 'dropdown';
const NavAreaContext = createContext<NavArea>('side');

export interface ShellProps {
  /** Square mark in the top-left 48px column, ~24px. */
  brand?: ReactNode;
  /** Wordmark / app name next to the mark. */
  title?: ReactNode;
  /** Right side of the top bar. */
  actions?: ReactNode;
  /** 'side' (default) is the collapsible pane; 'top' lays items along the bar. */
  mode?: 'side' | 'top';
  /** Pane content: Shell.Item / Shell.Group / Shell.User. */
  nav: ReactNode;
  /** Bottom-docked pane content - the settings / user slot. Side pane and overlay only. */
  navFooter?: ReactNode;
  defaultCollapsed?: boolean;
  /** Controlled collapse state; omit for uncontrolled (textura's contract). */
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  /** false pins the pane expanded on md+ (the trigger still opens the mobile overlay). */
  collapsible?: boolean;
  children: ReactNode;
}

/** Auto-changing trigger: the Fluent panel-left icon, a close cross while the overlay is up. */
function TriggerIcon({ close }: { close: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="none">
      {close ? (
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          <rect
            x="2.75"
            y="4.25"
            width="14.5"
            height="11.5"
            rx="1.75"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M7.5 4.5v11" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

export function Shell({
  brand,
  title,
  actions,
  mode = 'side',
  nav,
  navFooter,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapseChange,
  collapsible = true,
  children,
}: ShellProps) {
  const [uncontrolledCollapsed, setCollapsed] = useState(defaultCollapsed);
  const collapsed =
    mode === 'side' && collapsible ? (controlledCollapsed ?? uncontrolledCollapsed) : false;
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlayOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [overlayOpen]);

  const toggle = () => {
    // One button, two behaviours: overlay on small screens, rail on md+.
    if (mode === 'side' && window.matchMedia('(min-width: 48rem)').matches) {
      const next = !collapsed;
      setCollapsed(next);
      onCollapseChange?.(next);
    } else {
      setOverlayOpen((open) => !open);
    }
  };

  const pane = (area: NavArea) => (
    <NavAreaContext.Provider value={area}>
      <div className="flex h-full min-h-0 flex-col overflow-x-hidden">
        <div className="styled-scrollbar min-h-0 flex-1 overflow-y-auto px-1 py-1">{nav}</div>
        {navFooter ? <div className="px-1 py-1">{navFooter}</div> : null}
      </div>
    </NavAreaContext.Provider>
  );

  // In top mode md+ there is no pane, so the trigger only exists for the overlay.
  const triggerHiddenMd = mode === 'top' || !collapsible;

  return (
    <ShellContext.Provider value={{ collapsed, overlayOpen }}>
      <div className="flex min-h-dvh flex-col">
        {/* Full width, layered above the overlay scrim so the trigger stays reachable. */}
        <header className="relative z-40 flex h-12 shrink-0 items-center bg-bg pr-3">
          {brand ? (
            <span aria-hidden className="flex size-12 shrink-0 items-center justify-center">
              {brand}
            </span>
          ) : null}
          {title ? (
            <span
              className={cx(
                'min-w-0 shrink-0 truncate text-body-strong text-text',
                !brand && 'pl-3',
                // The absolute trigger owns the pane's last 48px while expanded; the title
                // stops short of it, and gets the room back once the trigger slides home.
                mode === 'side' && !triggerHiddenMd && !collapsed && 'md:max-w-30',
              )}
            >
              {title}
            </span>
          ) : null}
          {/* textura's trigger: absolute, pinned to the pane's top-RIGHT while expanded, and
              sliding onto the brand's square when collapsed - invisible there until hovered,
              when its fill and icon appear over the mark. Static in the flow below md. */}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={overlayOpen || !collapsed}
            aria-label="Toggle navigation"
            className={cx(
              'z-10 flex size-12 shrink-0 items-center justify-center rounded-control',
              triggerHiddenMd && 'md:hidden',
              mode === 'side' &&
                !triggerHiddenMd &&
                'md:absolute md:top-0 md:transition-[left] md:duration-250 md:ease-decelerate',
              mode === 'side' && !triggerHiddenMd && collapsed
                ? 'md:left-0 md:text-transparent md:hover:bg-surface md:hover:text-text'
                : 'md:left-42',
              'max-md:ml-1 text-text-dim hover:bg-surface hover:text-text',
            )}
          >
            <TriggerIcon close={overlayOpen} />
          </button>
          {mode === 'top' ? (
            <NavAreaContext.Provider value="top">
              <nav
                aria-label="Main"
                className="no-scrollbar ml-2 hidden min-w-0 flex-1 items-center gap-1 self-stretch overflow-x-auto md:flex"
              >
                {nav}
              </nav>
            </NavAreaContext.Provider>
          ) : null}
          <span className="ml-auto flex shrink-0 items-center gap-2">{actions}</span>
        </header>

        <div className="flex min-h-0 flex-1">
          {mode === 'side' ? (
            <nav
              aria-label="Main"
              className={cx(
                'hidden shrink-0 transition-[width] duration-250 ease-decelerate md:block',
                collapsed ? 'w-12' : 'w-54',
              )}
            >
              {pane('side')}
            </nav>
          ) : null}

          {/* below md: overlay pane + scrim, WinUI LeftMinimal, whatever the mode. */}
          {overlayOpen ? (
            <div
              className="fixed inset-0 z-30 md:hidden"
              onClick={() => {
                setOverlayOpen(false);
              }}
            >
              <div aria-hidden className="fade-in absolute inset-0 bg-black/60" />
              <nav
                aria-label="Main"
                className="slide-in-left absolute inset-y-0 left-0 w-54 bg-surface pt-12"
              >
                {pane('overlay')}
              </nav>
            </div>
          ) : null}

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export interface ShellItemProps extends HTMLAttributes<HTMLElement> {
  /** Element to render - an anchor by default; pass a router Link for SPA nav. */
  as?: ElementType;
  icon?: ReactNode;
  label: string;
  active?: boolean;
  [key: string]: unknown;
}

function ShellItem({ as, icon, label, active = false, className, ...rest }: ShellItemProps) {
  const { collapsed } = useContext(ShellContext);
  const area = useContext(NavAreaContext);
  const railed = area === 'side' && collapsed;
  const Comp: ElementType = as ?? 'a';

  if (area === 'top') {
    // WinUI top nav: compact chip, selection carried by an underline.
    return (
      <Comp
        aria-current={active ? 'page' : undefined}
        className={cx(
          'relative flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-body whitespace-nowrap',
          active ? 'text-text' : 'text-text-dim hover:bg-surface hover:text-text',
          className,
        )}
        {...rest}
      >
        {label}
        <span
          aria-hidden
          className={cx(
            'absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent transition-opacity',
            active ? 'opacity-100' : 'opacity-0',
          )}
        />
      </Comp>
    );
  }

  // Native title, not data-tip: the pane is a scroll container, which clips a
  // CSS ::after tooltip. The browser's own tooltip renders in the top layer.
  // ponytail: upgrade to an anchored popover if the delay ever grates.
  return (
    <Comp
      aria-current={active ? 'page' : undefined}
      title={railed ? label : undefined}
      className={cx(
        'relative flex h-10 items-center gap-3 overflow-hidden rounded-control whitespace-nowrap',
        active ? 'bg-surface text-text' : 'text-text-dim hover:bg-surface hover:text-text',
        className,
      )}
      {...rest}
    >
      {/* The WinUI selection pill: a 3px accent bar on the item's left edge. */}
      <span
        aria-hidden
        className={cx(
          'absolute left-0 h-4 w-0.75 rounded-full bg-accent transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span aria-hidden className="flex w-10 shrink-0 items-center justify-center">
        {icon ?? (
          <span className="text-body-strong text-text-dim">{label.charAt(0).toUpperCase()}</span>
        )}
      </span>
      <span
        className={cx(
          'min-w-0 truncate text-body transition-opacity',
          railed ? 'opacity-0' : 'opacity-100',
        )}
      >
        {label}
      </span>
    </Comp>
  );
}

export interface ShellGroupProps {
  label: string;
  /** The group's items. In top mode the group renders as a dropdown of them. */
  children?: ReactNode;
}

function ShellGroup({ label, children }: ShellGroupProps) {
  const { collapsed } = useContext(ShellContext);
  const area = useContext(NavAreaContext);

  if (area === 'top') {
    // Auto-converted dropdown: a native disclosure, items rendered as full rows.
    const closeOnPick = (e: MouseEvent<HTMLDivElement>) => {
      e.currentTarget.closest('details')?.removeAttribute('open');
    };
    // The strip is a scroll container, which would clip an absolute panel, so the
    // panel is fixed and placed from the summary's rect when the disclosure opens.
    const place = (e: MouseEvent<HTMLDetailsElement>) => {
      const details = e.currentTarget;
      const panel = details.querySelector<HTMLDivElement>('[data-shell-dropdown]');
      if (!panel) return;
      const rect = details.getBoundingClientRect();
      panel.style.left = `${String(Math.min(rect.left, window.innerWidth - 224))}px`;
      panel.style.top = `${String(rect.bottom + 4)}px`;
    };
    return (
      <details className="shrink-0" onClick={place}>
        <summary className="flex h-8 cursor-default list-none items-center gap-1.5 rounded-control px-3 text-body whitespace-nowrap text-text-dim select-none hover:bg-surface hover:text-text [&::-webkit-details-marker]:hidden">
          {label}
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden fill="none">
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </summary>
        <div
          data-shell-dropdown
          className="fade-in fixed z-50 w-54 rounded-panel bg-surface-raised p-1"
          onClick={closeOnPick}
        >
          <NavAreaContext.Provider value="dropdown">{children}</NavAreaContext.Provider>
        </div>
      </details>
    );
  }

  const railed = area === 'side' && collapsed;
  return (
    <div>
      {railed ? (
        <div className="mx-2 my-2 border-t border-bg" />
      ) : (
        <div className="px-3 pt-4 pb-1 text-caption whitespace-nowrap text-text-mute">{label}</div>
      )}
      {children}
    </div>
  );
}

export interface ShellUserProps extends HTMLAttributes<HTMLElement> {
  /** Element to render - a plain div by default; pass a button or link to make it act. */
  as?: ElementType;
  name: string;
  /** Second line under the name - a role, an email. */
  detail?: string;
  /** ~24px avatar; falls back to the name's initials. */
  avatar?: ReactNode;
  [key: string]: unknown;
}

/** textura's MainNav.User: bottom-docked identity row, avatar-only on the rail. */
function ShellUser({ as, name, detail, avatar, className, ...rest }: ShellUserProps) {
  const { collapsed } = useContext(ShellContext);
  const area = useContext(NavAreaContext);
  const railed = area === 'side' && collapsed;
  const Comp: ElementType = as ?? 'div';
  const initials = name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <Comp
      title={railed ? name : undefined}
      className={cx(
        'flex h-12 w-full items-center gap-3 overflow-hidden rounded-control whitespace-nowrap text-text',
        (rest.onClick !== undefined || as !== undefined) && 'hover:bg-surface',
        className,
      )}
      {...rest}
    >
      <span aria-hidden className="flex w-10 shrink-0 items-center justify-center">
        {avatar ?? (
          <span className="flex size-6 items-center justify-center rounded-full bg-surface-raised text-caption text-text-dim">
            {initials}
          </span>
        )}
      </span>
      <span
        className={cx(
          'flex min-w-0 flex-col text-left transition-opacity',
          railed ? 'opacity-0' : 'opacity-100',
        )}
      >
        <span className="truncate text-body">{name}</span>
        {detail ? <span className="truncate text-caption text-text-mute">{detail}</span> : null}
      </span>
    </Comp>
  );
}

Shell.Item = ShellItem;
Shell.Group = ShellGroup;
Shell.User = ShellUser;
