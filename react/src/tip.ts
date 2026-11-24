import { raiseFlyout } from './flyout.js';

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

// One box in the top layer: a flyout's backdrop-filter and overflow clip a tip drawn inside it.
let box: HTMLDivElement | undefined;
let anchor: HTMLElement | undefined;
let lower = (): void => undefined;
let described = false;
let watch: MutationObserver | undefined;

function tipOf(target: EventTarget | null): HTMLElement | undefined {
  let el = target instanceof Element ? target.closest('[data-tip]') : null;
  while (el && !(el instanceof HTMLElement)) el = el.parentElement?.closest('[data-tip]') ?? null;
  return el ?? undefined;
}

export function hideTip(): void {
  if (!anchor) return;
  if (described) anchor.removeAttribute('aria-describedby');
  anchor = undefined;
  watch?.disconnect();
  lower();
  box?.remove();
}

export function showTip(el: HTMLElement): void {
  hideTip();
  const text = el.dataset.tip;
  if (!text) return;
  box ??= Object.assign(document.createElement('div'), { id: 'hoobi-tip', className: 'tip-layer' });
  box.setAttribute('role', 'tooltip');
  box.textContent = text;
  anchor = el;
  described = !el.hasAttribute('aria-describedby') && !el.hasAttribute('aria-description');
  if (described) el.setAttribute('aria-describedby', box.id);
  document.body.append(box);
  lower = raiseFlyout(box);
  const right = el.dataset.tipPlace === 'right';
  const root = document.documentElement;
  const { width, height } = box.getBoundingClientRect();
  const p = tipPosition(
    el.getBoundingClientRect(),
    right ? 'right' : 'above',
    { width, height },
    root.clientWidth,
    root.clientHeight,
  );
  box.style.left = `${String(p.x)}px`;
  box.style.top = `${String(p.y)}px`;
  box.style.translate = right ? '0 -50%' : `-50% ${p.below ? '0' : '-100%'}`;
  watch ??= new MutationObserver(() => {
    if (anchor && (!anchor.isConnected || anchor.dataset.tip !== box?.textContent)) {
      const still = anchor.isConnected && anchor.dataset.tip ? anchor : undefined;
      if (still) showTip(still);
      else hideTip();
    }
  });
  watch.observe(document.body, { childList: true, subtree: true });
  watch.observe(el, { attributes: true, attributeFilter: ['data-tip'] });
}

if (typeof document !== 'undefined' && !document.documentElement.hasAttribute('data-tip-layer')) {
  document.documentElement.setAttribute('data-tip-layer', '');
  document.addEventListener('mouseover', (e) => {
    const el = tipOf(e.target);
    if (el && el !== anchor) showTip(el);
  });
  document.addEventListener('mouseout', (e) => {
    if (!anchor || !(e.target instanceof Node) || !anchor.contains(e.target)) return;
    if (!(e.relatedTarget instanceof Node && anchor.contains(e.relatedTarget))) hideTip();
  });
  document.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLElement && e.target.matches('[data-tip]:focus-visible'))
      showTip(e.target);
  });
  document.addEventListener('focusout', (e) => {
    if (e.target === anchor) hideTip();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTip();
  });
  document.addEventListener('scroll', hideTip, true);
  window.addEventListener('blur', hideTip);
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
  const base = { 'data-tip': text, 'data-tip-place': placement };
  if (!focusable) return { ...base, tabIndex: -1 };
  return { ...base, 'aria-description': text, tabIndex: 0 };
}
