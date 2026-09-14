import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './cx.js';

export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

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

const GAP = 4;
const EDGE = 8;

/**
 * An anchored floating panel with a trigger of your choosing: fixed, so nothing that scrolls or
 * clips can cut it off, and re-placed on capture-phase scroll because a table's own scroll
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
    if (!open) return;
    const position = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      if (!anchor || !panel) return;
      const left = placement.endsWith('end') ? anchor.right - panel.width : anchor.left;
      const top = placement.startsWith('top')
        ? anchor.top - panel.height - GAP
        : anchor.bottom + GAP;
      setPlace({
        left: Math.max(EDGE, Math.min(left, window.innerWidth - panel.width - EDGE)),
        top: Math.max(EDGE, Math.min(top, window.innerHeight - panel.height - EDGE)),
      });
    };
    position();
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
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
          style={place}
          className="fade-in fixed z-50 flex max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-panel bg-surface-raised p-2"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
