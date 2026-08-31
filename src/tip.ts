import type { PointerEvent, FocusEvent } from 'react';

/**
 * Anchor props for the house tooltip. The tip is `position: fixed` and placed off the
 * anchor's own rect as the pointer or focus arrives, because an absolutely positioned
 * one is clipped by any scrolling or clipping ancestor - a page shell's <main>, a card
 * that rounds by clipping - and a tip you cannot read is worse than none.
 *
 * Still no positioning library and no state: two lines of measurement, and the CSS in
 * the base layer does the rest.
 */
export function tipAnchor(text: string | undefined, placement: 'above' | 'right' = 'above') {
  if (!text) return {};
  const place = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const x = placement === 'right' ? r.right + 8 : r.left + r.width / 2;
    const y = placement === 'right' ? r.top + r.height / 2 : r.top - 6;
    el.style.setProperty('--tip-x', `${String(x)}px`);
    el.style.setProperty('--tip-y', `${String(y)}px`);
  };
  return {
    'data-tip': text,
    'aria-description': text,
    tabIndex: 0,
    'data-tip-place': placement,
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      place(e.currentTarget);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      place(e.currentTarget);
    },
  };
}
