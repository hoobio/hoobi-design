import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent,
  type PointerEvent,
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
  /** Wordmark / app name in the pane header. */
  title?: ReactNode;
  /** Line under the title - a version, a tagline. */
  subtitle?: ReactNode;
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
  /** Chrome hairlines - under the bar, along the pane edge. false for seamless chrome. */
  divided?: boolean;
  /**
   * Mirage, the house material: any CSS image - a url(...) photo or gradients -
   * fixed behind the app, blurred by the layer itself and tinted back towards bg.
   */
  mirage?: string;
  /**
   * textura's PageLayout contract: 'default' centres the content in a max-width
   * column that breathes with the pane; 'full' lets it run fluid. The Shell owns
   * the content paddings either way - children need no wrapper of their own.
   */
  pageWidth?: 'default' | 'full';
  children: ReactNode;
}

/**
 * Builds a mirage image from a few hues - the default backdrop when there is no
 * artwork to derive one from. Colours are 6-digit hex; each becomes a soft blob.
 */
export function mirageImage(colors: string[] = ['#409fff', '#d4bfff', '#95e6cb']): string {
  const spots = [
    '40rem 30rem at 20% 10%',
    '50rem 35rem at 80% 20%',
    '45rem 40rem at 50% 90%',
    '38rem 30rem at 10% 70%',
  ];
  return colors
    .slice(0, spots.length)
    .map((color, i) => `radial-gradient(${spots[i] ?? ''}, ${color}cc, transparent)`)
    .join(', ');
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
  subtitle,
  actions,
  mode = 'side',
  nav,
  navFooter,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapseChange,
  collapsible = true,
  divided = true,
  mirage,
  pageWidth = 'default',
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

  // Whether the brand button collapses a pane on md+ (top mode and pinned panes have none).
  const canToggleMd = mode === 'side' && collapsible;

  const toggle = () => {
    // One button, two behaviours: overlay on small screens, rail on md+.
    if (window.matchMedia('(min-width: 48rem)').matches) {
      if (!canToggleMd) return;
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

  return (
    <ShellContext.Provider value={{ collapsed, overlayOpen }}>
      <div className="isolate flex h-dvh min-h-0 flex-col">
        {mirage ? (
          <div
            aria-hidden
            className="mirage-layer"
            style={{ '--mirage-image': mirage } as CSSProperties}
          />
        ) : null}
        {/* Full width, layered above the overlay scrim so the brand button stays reachable.
            The hairline under the bar anchors it - bg-on-bg chrome otherwise reads as page
            whitespace above the content. */}
        <header
          className={cx(
            'relative z-40 flex h-12 shrink-0 items-center pr-3',
            divided && 'border-b border-border',
            // Sliced chrome stays transparent over the mirage; only seamless chrome
            // takes a fill to tell itself apart.
            mirage ? (divided ? undefined : 'bg-bg/85') : 'bg-bg',
          )}
        >
          {/* textura's pane header, lifted into the bar: a hairlined cell exactly as wide as
              the pane, animating with it. Expanded it holds the wordmark block on the left and
              the collapse trigger at its right edge; collapsed it is the 48px square showing
              the brand mark, which reveals the expand glyph on hover. */}
          {mode === 'side' ? (
            <div
              className={cx(
                'hidden h-full shrink-0 items-center transition-[width] duration-250 ease-decelerate md:flex',
                divided && 'border-r border-border',
                collapsed ? 'w-12' : 'w-54',
              )}
            >
              {collapsed ? (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={false}
                  aria-label="Expand navigation"
                  className="group flex h-full w-12 items-center justify-center hover:bg-surface"
                >
                  <span aria-hidden className="flex items-center justify-center group-hover:hidden">
                    {brand ?? <TriggerIcon close={false} />}
                  </span>
                  <span
                    aria-hidden
                    className="hidden items-center justify-center text-text-dim group-hover:flex group-hover:text-text"
                  >
                    <TriggerIcon close={false} />
                  </span>
                </button>
              ) : (
                <>
                  <span className="flex min-w-0 flex-1 flex-col justify-center pl-3">
                    <span className="truncate text-body-strong leading-5 text-text">{title}</span>
                    {subtitle ? (
                      <span className="truncate text-caption-small leading-4 text-text-mute">
                        {subtitle}
                      </span>
                    ) : null}
                  </span>
                  {collapsible ? (
                    <button
                      type="button"
                      onClick={toggle}
                      aria-expanded
                      aria-label="Collapse navigation"
                      className="flex h-full w-12 shrink-0 items-center justify-center text-text-dim hover:bg-surface hover:text-text"
                    >
                      <TriggerIcon close={false} />
                    </button>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          {/* Collapsed, the wordmark takes the window-title spot: centred across the bar. */}
          {mode === 'side' && collapsed ? (
            <span className="fade-in pointer-events-none absolute inset-x-0 hidden flex-col items-center justify-center text-center md:flex">
              <span className="truncate text-body-strong leading-5 text-text">{title}</span>
              {subtitle ? (
                <span className="truncate text-caption-small leading-4 text-text-mute">
                  {subtitle}
                </span>
              ) : null}
            </span>
          ) : null}
          {/* Below md (both modes) and top-mode desktops: mark, wordmark and the overlay trigger
              sit statically in the flow. */}
          <div className={cx('flex min-w-0 items-center', mode === 'side' && 'md:hidden')}>
            {brand ? (
              <span aria-hidden className="flex size-12 shrink-0 items-center justify-center">
                {brand}
              </span>
            ) : null}
            <span className={cx('flex min-w-0 flex-col justify-center', !brand && 'pl-3')}>
              <span className="truncate text-body-strong leading-5 text-text">{title}</span>
              {subtitle ? (
                <span className="truncate text-caption-small leading-4 text-text-mute">
                  {subtitle}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={overlayOpen}
              aria-label="Toggle navigation"
              className={cx(
                'ml-1 flex h-full w-12 shrink-0 items-center justify-center text-text-dim hover:bg-surface hover:text-text',
                mode === 'top' && 'md:hidden',
              )}
            >
              <TriggerIcon close={overlayOpen} />
            </button>
          </div>
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
                divided && 'border-r border-border',
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

          <main className="styled-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div
              className={cx(
                'w-full px-4 pt-4 pb-[max(4rem,env(safe-area-inset-bottom))] md:px-10 md:pt-10',
                pageWidth === 'default' && 'mx-auto max-w-[72rem]',
              )}
            >
              {children}
            </div>
          </main>
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

/**
 * The house tooltip, on the rail only: the pane is a scroll container, so the tip
 * uses the fixed [data-tip].tip-fixed variant, placed beside the anchor on entry.
 * Expanded rows carry no tip at all - the label is right there.
 */
function sideTip(label: string) {
  return {
    'data-tip': label,
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--tip-x', `${String(rect.right + 8)}px`);
      e.currentTarget.style.setProperty('--tip-y', `${String(rect.top + rect.height / 2)}px`);
    },
  };
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

  return (
    <Comp
      aria-current={active ? 'page' : undefined}
      className={cx(
        'relative flex h-10 items-center gap-3 overflow-hidden rounded-control whitespace-nowrap',
        active ? 'bg-surface text-text' : 'text-text-dim hover:bg-surface hover:text-text',
        railed && 'tip-fixed',
        className,
      )}
      {...rest}
      {...(railed ? sideTip(label) : null)}
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
        {icon ?? <InitialMark label={label} />}
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

/** The Ayu hue wheel for initial fallbacks; hues, never chrome colours. */
const MARK_HUES = [
  'accent-blue',
  'accent-cyan',
  'accent-green',
  'accent-yellow',
  'accent-orange',
  'accent-red',
  'accent-purple',
];

/**
 * Icon-less items get a brand-mark-styled square with the label's initial. Hues are
 * dealt around the wheel in first-seen order, so a list of marks never repeats a
 * colour until the wheel wraps - a hash would cluster. The registry is module-level:
 * stable per label for the session, and list order is what seeds it.
 */
const assignedHues = new Map<string, number>();

function hueFor(label: string): string {
  let slot = assignedHues.get(label);
  if (slot === undefined) {
    slot = assignedHues.size;
    assignedHues.set(label, slot);
  }
  return MARK_HUES[slot % MARK_HUES.length] ?? 'accent-blue';
}

function InitialMark({ label }: { label: string }) {
  const hue = hueFor(label);
  return (
    <span
      className="flex size-6 items-center justify-center rounded-control font-mono text-caption"
      style={{ backgroundColor: `var(--color-${hue})`, color: 'var(--color-bg)' }}
    >
      {label.charAt(0).toUpperCase()}
    </span>
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
    // Auto-converted dropdown, hover-triggered (focus-within covers keyboard). The
    // wrapper fills the bar's height so pointer travel to the panel never leaves it,
    // and the panel is fixed - the strip is a scroll container that would clip it -
    // placed from the wrapper's rect as the pointer or focus arrives.
    const place = (e: { currentTarget: HTMLDivElement }) => {
      const wrapper = e.currentTarget;
      const panel = wrapper.querySelector<HTMLDivElement>('[data-shell-dropdown]');
      if (!panel) return;
      const rect = wrapper.getBoundingClientRect();
      panel.style.left = `${String(Math.min(rect.left, window.innerWidth - 224))}px`;
      panel.style.top = `${String(rect.bottom)}px`;
    };
    return (
      <div
        className="group flex h-full shrink-0 items-center"
        onPointerEnter={place}
        onFocusCapture={place}
      >
        <span
          tabIndex={0}
          className="flex h-8 items-center gap-1.5 rounded-control px-3 text-body whitespace-nowrap text-text-dim select-none group-focus-within:bg-surface group-focus-within:text-text group-hover:bg-surface group-hover:text-text"
        >
          {label}
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden fill="none">
            <path
              d="M2.5 4.5L6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div
          data-shell-dropdown
          className="invisible fixed z-50 w-54 rounded-panel bg-surface-raised p-1 opacity-0 transition-opacity duration-150 ease-standard group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
        >
          <NavAreaContext.Provider value="dropdown">{children}</NavAreaContext.Provider>
        </div>
      </div>
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
  /**
   * Account actions. With this set the row becomes a real button (never a summary -
   * Chromium paints summaries' focus ring on mouse clicks) that opens the menu as a
   * flyout beside the rail when collapsed, and an upward accordion when expanded.
   */
  menu?: ReactNode;
  [key: string]: unknown;
}

/** textura's MainNav.User: bottom-docked identity row, avatar-only on the rail. */
function ShellUser({ as, name, detail, avatar, menu, className, ...rest }: ShellUserProps) {
  const { collapsed } = useContext(ShellContext);
  const area = useContext(NavAreaContext);
  const railed = area === 'side' && collapsed;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // The flyout is fixed (the pane clips overflow), placed off the row when it opens.
  const openFlyout = (e: MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget;
    setOpen((was) => !was);
    const panel = rootRef.current?.querySelector<HTMLDivElement>('[data-shell-user-flyout]');
    if (!panel) return;
    const rect = row.getBoundingClientRect();
    panel.style.left = `${String(rect.right + 8)}px`;
    panel.style.bottom = `${String(window.innerHeight - rect.bottom)}px`;
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

  const row = (
    <>
      <span aria-hidden className="flex w-10 shrink-0 items-center justify-center">
        {avatar ?? (
          <span
            className="flex size-6 items-center justify-center rounded-full font-mono text-caption-small"
            style={{ backgroundColor: `var(--color-${hueFor(name)})`, color: 'var(--color-bg)' }}
          >
            {initials}
          </span>
        )}
      </span>
      <span
        className={cx(
          'flex min-w-0 flex-1 flex-col text-left transition-opacity',
          railed ? 'opacity-0' : 'opacity-100',
        )}
      >
        <span className="truncate text-body">{name}</span>
        {detail ? <span className="truncate text-caption text-text-mute">{detail}</span> : null}
      </span>
    </>
  );

  const rowClasses = cx(
    'flex h-12 w-full items-center gap-3 overflow-hidden rounded-control whitespace-nowrap text-text',
    railed && 'tip-fixed',
    className,
  );

  if (menu) {
    return (
      <div ref={rootRef}>
        <button
          type="button"
          aria-expanded={open}
          onClick={openFlyout}
          // A menu button never takes focus from a pointer, so a click can never
          // paint the focus ring; keyboard focus still rings as it should.
          onPointerDown={(e) => {
            e.preventDefault();
          }}
          {...(railed ? sideTip(name) : null)}
          className={cx(rowClasses, 'hover:bg-surface')}
        >
          {row}
          {!railed ? (
            <svg
              viewBox="0 0 12 12"
              aria-hidden
              fill="none"
              className={cx(
                'mr-3 size-3 shrink-0 text-text-mute transition-transform duration-250 ease-standard',
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
        </button>
        {/* Expanded: the WinUI expander - the menu grows downward off the row on the
            decelerate curve (the bottom-anchored footer gives the row the lift). Always
            mounted, so the button never remounts and the grid rows can animate. */}
        <div
          aria-hidden={!open}
          inert={!open || railed}
          className={cx(
            'grid transition-[grid-template-rows] duration-250 ease-decelerate',
            railed && 'hidden',
          )}
          style={{ gridTemplateRows: open && !railed ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-bg">{menu}</div>
          </div>
        </div>
        {/* Railed: a flyout beside the rail. */}
        <div
          data-shell-user-flyout
          className={cx(
            'fixed z-50 w-72 max-w-[calc(100vw-4rem)] rounded-panel bg-surface-raised p-1',
            open && railed ? 'fade-in' : 'hidden',
          )}
        >
          {menu}
        </div>
      </div>
    );
  }

  const Comp: ElementType = as ?? 'div';
  return (
    <Comp
      {...(railed ? sideTip(name) : null)}
      className={cx(
        rowClasses,
        (rest.onClick !== undefined || as !== undefined) && 'hover:bg-surface',
      )}
      {...rest}
    >
      {row}
    </Comp>
  );
}

Shell.Item = ShellItem;
Shell.Group = ShellGroup;
Shell.User = ShellUser;
