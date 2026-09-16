import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './cx.js';
import { FLYOUT_RESET, placeFlyout, raiseFlyout, type FlyoutPlacement } from './flyout.js';

export type PopoverPlacement = FlyoutPlacement;

export interface PopoverTriggerProps {
  ref: (el: HTMLElement | null) => void;
  onClick: () => void;
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
}

export interface PopoverProps {
  /** A node the library wraps in its own bare button, or a render prop for your own control. */
  trigger: ReactNode | ((props: PopoverTriggerProps) => ReactNode);
  children: ReactNode;
  /** Controlled: pass both, or neither and the popover holds it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  /** Names the panel and the wrapped trigger for assistive tech. */
  label?: string;
  className?: string;
}

/**
 * An anchored floating panel with a trigger of your choosing: raised into the top layer, so no
 * ancestor's transform, clip or z-index can cut it off, flipped to the opposite side when the
 * requested one has no room, and re-placed on capture-phase scroll because a table's own scroll
 * container never bubbles one to the window.
 */
export function Popover({
  trigger,
  children,
  open: openProp,
  onOpenChange,
  placement = 'bottom-start',
  label,
  className,
}: PopoverProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const [place, setPlace] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const lower = raiseFlyout(panel);
    const position = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (anchor) setPlace(placeFlyout(anchor, panel.getBoundingClientRect(), placement));
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
  }, [open, placement]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
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

  const triggerProps: PopoverTriggerProps = {
    ref: (el) => {
      triggerRef.current = el;
    },
    onClick: () => {
      setOpen(!open);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
  };

  return (
    <div ref={rootRef} className={cx('relative inline-flex', className)}>
      {typeof trigger === 'function' ? (
        trigger(triggerProps)
      ) : (
        <button type="button" aria-label={label} {...triggerProps}>
          {trigger}
        </button>
      )}
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label}
          style={{ ...FLYOUT_RESET, ...place }}
          className="fade-in fixed z-50 flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-panel bg-surface-raised p-2 shadow-flyout"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
