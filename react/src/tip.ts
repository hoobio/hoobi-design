import type { PointerEvent, FocusEvent } from 'react';

/**
 * Anchor props for the house tooltip. The tip is `position: fixed` and placed off the
 * anchor's own rect as the pointer or focus arrives, because an absolutely positioned
 * one is clipped by any scrolling or clipping ancestor - a page shell's <main>, a card
 * that rounds by clipping - and the tip needs to stay readable.
 *
 * No positioning library and no state: the anchor and tip are measured, and the CSS in
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

type Rect = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'>;

export function tipPosition(
  r: Rect,
  placement: 'above' | 'right',
  tip: { width: number; height: number },
  vw: number,
  vh: number,
  margin = 8,
) {
  const { width: w, height: h } = tip;
  if (placement === 'right') {
    const x = r.right + 8 + w > vw - margin ? r.left - 8 - w : r.right + 8;
    const cy = r.top + r.height / 2;
    const y = Number.isNaN(h) ? cy : Math.max(margin + h / 2, Math.min(cy, vh - margin - h / 2));
    return { x, y, below: false };
  }
  const x = Math.max(margin + w / 2, Math.min(r.left + r.width / 2, vw - margin - w / 2));
  const below = r.top - 6 - h < margin;
  return { x, y: below ? r.bottom + 6 : r.top - 6, below };
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
    const set = (p: { x: number; y: number; below: boolean }) => {
      el.style.setProperty('--tip-x', `${String(p.x - (host?.left ?? 0))}px`);
      el.style.setProperty('--tip-y', `${String(p.y - (host?.top ?? 0))}px`);
      if (p.below) el.style.setProperty('--tip-ty', '0');
      else el.style.removeProperty('--tip-ty');
    };
    const root = document.documentElement;
    const vw = root.clientWidth;
    const vh = root.clientHeight;
    set(tipPosition(r, placement, { width: 0, height: 0 }, vw, vh));
    const box = getComputedStyle(el, '::after');
    const width = parseFloat(box.width);
    const tip = {
      width: Number.isNaN(width) ? parseFloat(box.maxWidth) || 0 : width,
      height: parseFloat(box.height),
    };
    set(tipPosition(r, placement, tip, vw, vh));
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
