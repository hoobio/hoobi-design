import { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from './cx.js';

export interface SectionNavItem {
  /** The section's DOM id, and what `onSelect` receives. */
  id: string;
  label: string;
  /** A warn dot: this section holds unsaved edits. */
  dirty?: boolean;
}

export interface SectionNavProps {
  items: SectionNavItem[];
  /**
   * Controlled override. Omit it and the nav tracks scroll position itself, so every
   * consumer gets the same behaviour instead of reimplementing it.
   */
  activeId?: string;
  onSelect: (id: string) => void;
  /**
   * 'rail'  - the sticky column, hidden below md.
   * 'chips' - the wrapping jump list, hidden from md up.
   * Render both; each hides itself at the other's breakpoint.
   */
  variant?: 'rail' | 'chips';
  label?: string;
  className?: string;
}

/** The scrolling ancestor, because an app shell scrolls its own pane, not the window. */
function scrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const overflow = getComputedStyle(node).overflowY;
    if (/(auto|scroll|overlay)/.test(overflow) && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/** Scroll position at which a section becomes active: 30% down the scroll root. */
const LINE = 0.3;

/** Keys that scroll. Typing in a field inside the pane is not a person leaving the section. */
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
  'Spacebar',
]);

/**
 * Computes the scroll position at which each section becomes active.
 *
 * A section's natural activation point is where its top crosses the line 30% down the pane.
 * Sections near the end of the page cannot reach that point: nothing can scroll them that far
 * up. Without this, consumers add pb-[70vh] padding so the last section can reach the top.
 * Those are spread evenly across the remaining scroll, with the last one landing exactly
 * at the bottom, so scrolling the final stretch walks through them in order.
 *
 * A click pins the active section until the person scrolls: a wheel, a touch, a scrolling
 * key, or a drag on the scrollbar. Releasing the pin when a smooth scroll stops selects the
 * wrong section (click Security, the highlight moves to Webhook).
 */
function useScrollSpy(ids: string[], enabled: boolean) {
  const key = ids.join(' ');
  const [active, setActive] = useState<string | undefined>(undefined);
  const pinned = useRef<string | null>(null);
  const measure = useRef<() => void>(() => undefined);

  const pin = useCallback((id: string) => {
    pinned.current = id;
    setActive(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const list = key ? key.split(' ') : [];
    const anchor = list[0] === undefined ? null : document.getElementById(list[0]);
    if (!anchor) return;
    const root = scrollParent(anchor);
    const box: Element = root ?? document.scrollingElement ?? document.documentElement;

    let points: number[] = [];

    const plan = () => {
      const els = list.map((id) => document.getElementById(id));
      const rootTop = root ? root.getBoundingClientRect().top : 0;
      const scrollTop = box.scrollTop;
      const paneHeight = root ? root.clientHeight : window.innerHeight;
      const maxScroll = Math.max(0, box.scrollHeight - paneHeight);

      // Where each section's top crosses the line, in scrollTop terms.
      const natural = els.map((el) =>
        el
          ? Math.max(0, el.getBoundingClientRect().top - rootTop + scrollTop - paneHeight * LINE)
          : 0,
      );

      let reachable = 0;
      for (let i = 0; i < natural.length; i++) {
        if ((natural[i] as number) <= maxScroll) reachable = i;
      }

      points = natural.slice();
      const trailing = natural.length - 1 - reachable;
      if (trailing > 0) {
        const from = natural[reachable] as number;
        const span = maxScroll - from;
        for (let i = 1; i <= trailing; i++) {
          points[reachable + i] = from + (span * i) / trailing;
        }
      }
    };

    measure.current = () => {
      if (pinned.current !== null) return;
      // +1: a fractional layout can leave scrollTop a pixel under the maximum, which would
      // keep the last section out of reach.
      const scrollTop = box.scrollTop + 1;
      let current = list[0];
      for (let i = 0; i < list.length; i++) {
        if (scrollTop >= (points[i] ?? Infinity)) current = list[i];
      }
      setActive(current);
    };

    const replan = () => {
      plan();
      measure.current();
    };

    let frame = 0;
    const onScroll = () => {
      // A pin holds through the scroll it started; only the person releases it.
      if (pinned.current !== null) return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure.current();
      });
    };

    const release = (e: Event) => {
      if (pinned.current === null) return;
      if (e.type === 'keydown' && !SCROLL_KEYS.has((e as KeyboardEvent).key)) return;
      pinned.current = null;
      measure.current();
    };

    const target: HTMLElement | Window = root ?? window;
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', replan);
    // The person's own intent to move, wherever it lands: wheel, finger, scroll key, or a
    // drag that starts on the scrollbar. Capture, so nothing inside can swallow it first.
    const intents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    for (const type of intents) {
      window.addEventListener(type, release, { passive: true, capture: true });
    }

    // The plan is geometry, so it is only valid while the geometry holds: a section that
    // expands, a pane that resizes, a font that finishes loading all move the points.
    const observer = new ResizeObserver(replan);
    if (root) observer.observe(root);
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    replan();

    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', replan);
      for (const type of intents) {
        window.removeEventListener(type, release, { capture: true });
      }
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [key, enabled]);

  return { active, pin };
}

/**
 * Jump list for a long page of sections. A dot rather than a count for a dirty section, since
 * only the presence of unsaved edits is useful information. `self-start` on the rail is
 * load-bearing - a stretched flex item is full height, and a sticky element with nowhere to
 * move does not stick.
 */
export function SectionNav({
  items,
  activeId,
  onSelect,
  variant = 'rail',
  label = 'Sections',
  className,
}: SectionNavProps) {
  const rail = variant === 'rail';
  const { active: spied, pin } = useScrollSpy(
    items.map((item) => item.id),
    activeId === undefined,
  );
  const current = activeId ?? spied ?? items[0]?.id;

  return (
    <nav
      aria-label={label}
      className={cx(
        rail
          ? 'sticky top-6 hidden w-42 shrink-0 flex-col gap-0.5 self-start md:flex'
          : 'flex flex-wrap gap-1.5 md:hidden',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === current;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'true' : undefined}
            onClick={() => {
              onSelect(item.id);
              pin(item.id);
              document.getElementById(item.id)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            className={cx(
              'inline-flex shrink-0 items-center gap-1.5 rounded-control border-0 text-left transition-colors',
              rail ? 'h-8 w-full justify-between px-2.5 text-body' : 'h-7 px-2.5 text-caption',
              active
                ? rail
                  ? 'bg-surface text-text'
                  : 'bg-surface-raised text-text'
                : cx(
                    'text-text-dim hover:bg-surface hover:text-text',
                    rail ? 'bg-transparent' : 'bg-chip',
                  ),
            )}
          >
            <span className="min-w-0 truncate">{item.label}</span>
            {item.dirty ? (
              <span
                aria-label="unsaved changes"
                className="size-1.5 shrink-0 rounded-full bg-warn"
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
