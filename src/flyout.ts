import type { CSSProperties } from 'react';

export type FlyoutPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

const GAP = 4;
const EDGE = 8;

interface Side {
  room: number;
  pos: number;
}

function resolve(size: number, limit: number, preferred: Side, fallback: Side): number {
  const side = size <= preferred.room || preferred.room >= fallback.room ? preferred : fallback;
  return Math.max(EDGE, Math.min(side.pos, limit - size - EDGE));
}

/**
 * Viewport coordinates for an anchored panel: the requested side when the panel fits there, the
 * opposite side when it does not, the roomier of the two when neither holds it, clamped to an
 * 8px edge gap in every case.
 */
export function placeFlyout(
  anchor: DOMRect,
  panel: { width: number; height: number },
  placement: FlyoutPlacement,
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const below: Side = { room: vh - anchor.bottom - GAP - EDGE, pos: anchor.bottom + GAP };
  const above: Side = { room: anchor.top - GAP - EDGE, pos: anchor.top - panel.height - GAP };
  const fromStart: Side = { room: vw - anchor.left - EDGE, pos: anchor.left };
  const fromEnd: Side = { room: anchor.right - EDGE, pos: anchor.right - panel.width };
  const wantsTop = placement.startsWith('top');
  const wantsEnd = placement.endsWith('end');
  return {
    top: resolve(panel.height, vh, wantsTop ? above : below, wantsTop ? below : above),
    left: resolve(panel.width, vw, wantsEnd ? fromEnd : fromStart, wantsEnd ? fromStart : fromEnd),
  };
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
 * and the scroll container `overflow: auto` would make of it.
 */
export const FLYOUT_RESET: CSSProperties = {
  right: 'auto',
  bottom: 'auto',
  margin: 0,
  border: 0,
  overflow: 'visible',
};
