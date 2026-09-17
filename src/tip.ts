import type { PointerEvent, FocusEvent } from 'react';

/**
 * Anchor props for the house tooltip. The tip is `position: fixed` and placed off the
 * anchor's own rect as the pointer or focus arrives, because an absolutely positioned
 * one is clipped by any scrolling or clipping ancestor - a page shell's <main>, a card
 * that rounds by clipping - and the tip needs to stay readable.
 *
 * No positioning library and no state: two lines of measurement, and the CSS in
 * the base layer renders and positions the tip at that point.
 */
function fixedHost(el: HTMLElement): DOMRect | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (
      style.backdropFilter !== 'none' ||
      style.filter !== 'none' ||
      style.transform !== 'none' ||
      style.perspective !== 'none' ||
      /paint|layout|strict|content/.test(style.contain)
    )
      return node.getBoundingClientRect();
  }
  return null;
}

export function tipAnchor(
  text: string | undefined,
  placement: 'above' | 'right' = 'above',
  /**
   * false leaves the anchor out of the tab order and off the accessibility tree: the tip is
   * hover-only decoration, and its words reach assistive tech another way (an `id` the
   * control points `aria-describedby` at). Taking a tab stop for an (i) icon between two
   * fields is a keyboard regression.
   */
  focusable = true,
) {
  if (!text) return {};
  const place = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    // backdrop-filter, filter, transform or contain on an ancestor (a flyout's mirage, say) makes
    // that ancestor the containing block for a fixed child, so the viewport point is rebased onto it.
    const host = fixedHost(el);
    const x = (placement === 'right' ? r.right + 8 : r.left + r.width / 2) - (host?.left ?? 0);
    const y = (placement === 'right' ? r.top + r.height / 2 : r.top - 6) - (host?.top ?? 0);
    el.style.setProperty('--tip-x', `${String(x)}px`);
    el.style.setProperty('--tip-y', `${String(y)}px`);
  };
  const base = {
    'data-tip': text,
    'data-tip-place': placement,
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      place(e.currentTarget);
    },
  };
  if (!focusable) return { ...base, tabIndex: -1 };
  return {
    ...base,
    'aria-description': text,
    tabIndex: 0,
    onFocus: (e: FocusEvent<HTMLElement>) => {
      place(e.currentTarget);
    },
  };
}
