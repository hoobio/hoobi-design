import type { CSSProperties } from 'react';

export type FlyoutPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

const GAP = 4;
const EDGE = 8;
const PANEL_PAD = 4;

interface Side {
  room: number;
  pos: number;
}

export const FLYOUT_MAX_HEIGHT = '24rem';

function pick(size: number, preferred: Side, fallback: Side): Side {
  return size <= preferred.room || preferred.room >= fallback.room ? preferred : fallback;
}

function clamp(side: Side, size: number, limit: number): number {
  return Math.max(EDGE, Math.min(side.pos, limit - size - EDGE));
}

/**
 * Viewport coordinates for an anchored panel: the requested side when the panel fits there, the
 * opposite side when it does not, the roomier of the two when neither holds it, clamped to an
 * 8px edge gap in every case. `room` is the height available on the side chosen. Without a
 * placement the panel opens below, hanging from the trigger's left edge in the left half of the
 * viewport and from its right edge in the right half.
 */
export function placeFlyout(
  anchor: DOMRect,
  panel: { width: number; height: number },
  placement?: FlyoutPlacement,
): { top: number; left: number; room: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aboveRoom = anchor.top - GAP - EDGE;
  const below: Side = { room: vh - anchor.bottom - GAP - EDGE, pos: anchor.bottom + GAP };
  const above: Side = {
    room: aboveRoom,
    pos: anchor.top - Math.min(panel.height, Math.max(0, aboveRoom)) - GAP,
  };
  const fromStart: Side = { room: vw - anchor.left - EDGE, pos: anchor.left };
  const fromEnd: Side = { room: anchor.right - EDGE, pos: anchor.right - panel.width };
  const wantsTop = placement?.startsWith('top') ?? false;
  const wantsEnd = placement ? placement.endsWith('end') : anchor.left + anchor.width / 2 >= vw / 2;
  const vertical = pick(panel.height, wantsTop ? above : below, wantsTop ? below : above);
  const room = Math.max(0, Math.floor(vertical.room));
  return {
    top: clamp(vertical, Math.min(panel.height, room), vh),
    left: clamp(
      pick(panel.width, wantsEnd ? fromEnd : fromStart, wantsEnd ? fromStart : fromEnd),
      panel.width,
      vw,
    ),
    room,
  };
}

/**
 * Places `panel` off `anchor` and returns the style that does it, `maxHeight` included: the
 * smaller of `cap` and the room on the chosen side. The natural height is measured under `cap`
 * alone, so a long panel is judged by the height it will actually take.
 */
export function placePanel(
  anchor: DOMRect,
  panel: HTMLElement,
  placement: FlyoutPlacement | undefined,
  cap: string,
): { top: number; left: number; maxHeight: string } {
  const applied = panel.style.maxHeight;
  panel.style.maxHeight = cap;
  const { width, height } = panel.getBoundingClientRect();
  panel.style.maxHeight = applied;
  const { top, left, room } = placeFlyout(anchor, { width, height }, placement);
  return { top, left, maxHeight: `min(${cap}, ${room}px)` };
}

/**
 * Viewport coordinates for a submenu panel beside its parent panel: on the side the cascade
 * already runs (right unless `leftward`) when it fits, the other side when it does not, the
 * roomier side when neither holds it, its first row level with the row that opened it, and
 * clamped to the 8px edge gap. `maxHeight` is the viewport less both edge gaps.
 */
export function placeSubmenu(
  row: { top: number },
  parent: { left: number; right: number },
  panel: { width: number; height: number },
  leftward = false,
): { top: number; left: number; maxHeight: number; leftward: boolean } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const right: Side = { room: vw - parent.right - GAP - EDGE, pos: parent.right + GAP };
  const left: Side = { room: parent.left - GAP - EDGE, pos: parent.left - GAP - panel.width };
  const maxHeight = Math.max(0, vh - 2 * EDGE);
  const side = leftward ? pick(panel.width, left, right) : pick(panel.width, right, left);
  return {
    top: clamp(
      { room: maxHeight, pos: row.top - PANEL_PAD },
      Math.min(panel.height, maxHeight),
      vh,
    ),
    left: clamp(side, panel.width, vw),
    maxHeight,
    leftward: side === left,
  };
}

/** placeSubmenu for live elements, measured under `cap` as placePanel does. */
export function placeSubPanel(
  row: DOMRect,
  parent: DOMRect,
  panel: HTMLElement,
  cap: string,
  leftward: boolean,
): { style: { top: number; left: number; maxHeight: string }; leftward: boolean } {
  const applied = panel.style.maxHeight;
  panel.style.maxHeight = cap;
  const { width, height } = panel.getBoundingClientRect();
  panel.style.maxHeight = applied;
  const place = placeSubmenu(row, parent, { width, height }, leftward);
  return {
    style: { top: place.top, left: place.left, maxHeight: `min(${cap}, ${place.maxHeight}px)` },
    leftward: place.leftward,
  };
}

export function cssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Raises a panel into the top layer, where no ancestor's transform, filter, containment or
 * z-index reaches it. `manual` rather than `auto`: both flyouts own their own dismissal, and
 * light dismiss would force-close sibling popovers as well. Returns the undo.
 *
 * The element stays where it is in the DOM - the top layer is a rendering concept - so React
 * context and the "a click inside the panel is not an outside click" containment check hold.
 */
export function raiseFlyout(panel: HTMLElement): () => void {
  if (typeof panel.showPopover !== 'function') return () => undefined;
  panel.setAttribute('popover', 'manual');
  if (!panel.matches(':popover-open')) panel.showPopover();
  return () => {
    if (panel.isConnected && panel.matches(':popover-open')) panel.hidePopover();
  };
}

/**
 * Cancels the UA styling the `popover` attribute brings that the panel's own classes do not
 * already beat: the `inset: 0` plus `margin: auto` that would centre it, the default border,
 * and the UA's `overflow: auto`, which is kept on the y axis only so a panel capped by
 * `maxHeight` scrolls.
 */
export const FLYOUT_RESET: CSSProperties = {
  right: 'auto',
  bottom: 'auto',
  margin: 0,
  border: 0,
  overflowX: 'hidden',
  overflowY: 'auto',
};
