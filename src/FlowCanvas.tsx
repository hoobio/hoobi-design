import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { BadgeTone } from './Badge.js';
import { Button } from './Button.js';
import { cx } from './cx.js';

export interface FlowPort {
  id: string;
  label?: string;
  tone?: BadgeTone;
}

export interface FlowNode {
  id: string;
  x: number;
  y: number;
  title: ReactNode;
  /** Accessible name; defaults to `title` when that is a string. */
  label?: string;
  subtitle?: ReactNode;
  leading?: ReactNode;
  inputs: FlowPort[];
  outputs: FlowPort[];
  footer?: ReactNode;
  tone?: BadgeTone;
}

export interface FlowEdge {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
  label?: ReactNode;
  animated?: boolean;
}

export interface FlowSelection {
  kind: 'node' | 'edge';
  id: string;
}

export interface FlowConnection {
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

export interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selected?: FlowSelection | null;
  onSelect?: (sel: FlowSelection | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onConnect?: (c: FlowConnection) => void;
  onDelete?: (sel: FlowSelection) => void;
  readOnly?: boolean;
  /** Default fills the parent; never below 360px. */
  height?: number | string;
  /** Names the canvas for assistive tech. */
  label?: string;
  className?: string;
}

export const FLOW_GRID = 8;
export const FLOW_NODE_WIDTH = 220;
const DEFAULT_HEIGHT = 72;
const CLICK_SLOP = 3;
const MIN_SCALE = 0.25;
const FIT_PAD = 32;

interface Size {
  w: number;
  h: number;
}
interface Point {
  x: number;
  y: number;
}

export const snap = (v: number) => Math.round(v / FLOW_GRID) * FLOW_GRID;

export const PORT_TOP = 24;
export const PORT_PITCH = 24;

export const portOffset = (index: number) => PORT_TOP + index * PORT_PITCH;

export const nodeMinHeight = (ports: number) => portOffset(Math.max(ports, 1) - 1) + PORT_TOP;

export function portPoint(
  node: Pick<FlowNode, 'x' | 'y'>,
  width: number,
  side: 'in' | 'out',
  index: number,
): Point {
  return { x: node.x + (side === 'out' ? width : 0), y: node.y + portOffset(index) };
}

const CORNER = 8;
const STUB = 24;
const MARGIN = 16;
const SHARED = 0.2;
const MAGNET = 12;

function simplify(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && last.x === p.x && last.y === p.y) continue;
    const prev = out[out.length - 2];
    if (
      last &&
      prev &&
      ((prev.x === last.x && last.x === p.x) || (prev.y === last.y && last.y === p.y))
    ) {
      out[out.length - 1] = p;
      continue;
    }
    out.push(p);
  }
  return out;
}

const heading = (from: Point, to: Point) => {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  return { x: (to.x - from.x) / len, y: (to.y - from.y) / len, len };
};

/** Straight segments, rounded only where the direction changes; a jog under two radii is one full-radius S. */
export function roundedPath(points: Point[]): string {
  const pts = simplify(points);
  const first = pts[0] as Point;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i] as Point;
    const prev = pts[i - 1] as Point;
    const next = pts[i + 1];
    if (!next) {
      d += ` L ${p.x} ${p.y}`;
      continue;
    }
    const into = heading(prev, p);
    const out = heading(p, next);
    const after = pts[i + 2];
    if (after && out.len < CORNER * 2) {
      const on = heading(next, after);
      if (on.x === into.x && on.y === into.y) {
        d += ` L ${p.x - into.x * CORNER} ${p.y - into.y * CORNER}`;
        d += ` C ${p.x} ${p.y} ${next.x} ${next.y} ${next.x + on.x * CORNER} ${next.y + on.y * CORNER}`;
        i++;
        continue;
      }
    }
    const r = Math.min(CORNER, into.len / 2, out.len / 2);
    d += ` L ${p.x - into.x * r} ${p.y - into.y * r} Q ${p.x} ${p.y} ${p.x + out.x * r} ${p.y + out.y * r}`;
  }
  return d;
}

export interface FlowBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The middle of the longest horizontal run after the first segment, else of the first. */
export function labelPoint(points: Point[]): Point {
  const pts = simplify(points);
  let best: [Point, Point] = [pts[0] as Point, pts[1] ?? (pts[0] as Point)];
  let longest = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i] as Point;
    const b = pts[i + 1] as Point;
    const len = Math.abs(b.x - a.x);
    if (a.y === b.y && len > longest) {
      best = [a, b];
      longest = len;
    }
  }
  return { x: (best[0].x + best[1].x) / 2, y: (best[0].y + best[1].y) / 2 };
}

/** The route when no clear one exists: out, one vertical run, in; a target behind goes under. */
export function stepPoints(a: Point, b: Point): Point[] {
  const x = a.x + STUB;
  if (b.x >= a.x + STUB * 2) return [a, { x, y: a.y }, { x, y: b.y }, b];
  const y = Math.max(a.y, b.y) + STUB * 2;
  return [a, { x, y: a.y }, { x, y }, { x: b.x - STUB, y }, { x: b.x - STUB, y: b.y }, b];
}

type Entry = [cost: number, seq: number, state: number];

class Heap {
  private items: Entry[] = [];
  private seq = 0;
  get size() {
    return this.items.length;
  }
  push(cost: number, state: number) {
    const items = this.items;
    items.push([cost, this.seq++, state]);
    let i = items.length - 1;
    while (i > 0) {
      const up = (i - 1) >> 1;
      if (!Heap.less(items[i] as Entry, items[up] as Entry)) break;
      [items[i], items[up]] = [items[up] as Entry, items[i] as Entry];
      i = up;
    }
  }
  pop(): Entry {
    const items = this.items;
    const top = items[0] as Entry;
    const last = items.pop() as Entry;
    if (items.length === 0) return top;
    items[0] = last;
    let i = 0;
    for (;;) {
      const l = i * 2 + 1;
      let m = i;
      if (l < items.length && Heap.less(items[l] as Entry, items[m] as Entry)) m = l;
      if (l + 1 < items.length && Heap.less(items[l + 1] as Entry, items[m] as Entry)) m = l + 1;
      if (m === i) return top;
      [items[i], items[m]] = [items[m] as Entry, items[i] as Entry];
      i = m;
    }
  }
  private static less(a: Entry, b: Entry) {
    return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  }
}

const DIRS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
];

export const segmentKey = (a: Point, b: Point) =>
  a.x < b.x || (a.x === b.x && a.y < b.y)
    ? `${a.x},${a.y},${b.x},${b.y}`
    : `${b.x},${b.y},${a.x},${a.y}`;

/**
 * An orthogonal route from output port `a` to input port `b` that keeps `MARGIN` clear of every
 * box: the shortest path over the lines of the box edges, then the fewest bends, then up before
 * down. A segment in `shared` (an earlier edge from the same port) counts a fifth of its length,
 * so siblings share one trunk and branch off it. Null when no clear route exists.
 */
export function routeEdge(
  a: Point,
  b: Point,
  boxes: FlowBox[],
  shared: ReadonlySet<string> = new Set(),
): { points: Point[]; keys: string[] } | null {
  const s = { x: a.x + STUB, y: a.y };
  const t = { x: b.x - STUB, y: b.y };
  const walls = boxes.map((o) => ({
    l: o.x - MARGIN,
    r: o.x + o.w + MARGIN,
    t: o.y - MARGIN,
    b: o.y + o.h + MARGIN,
  }));
  const inside = (x: number, y: number) =>
    walls.some((o) => x > o.l && x < o.r && y > o.t && y < o.b);
  if (inside(s.x, s.y) || inside(t.x, t.y)) return null;
  const axis = (v: number[]) => [...new Set(v)].sort((p, q) => p - q);
  const xs = axis([s.x, t.x, ...walls.flatMap((o) => [o.l, o.r])]);
  const ys = axis([s.y, t.y, ...walls.flatMap((o) => [o.t, o.b])]);
  const ny = ys.length;
  const at = (n: number): Point => ({
    x: xs[Math.floor(n / ny)] as number,
    y: ys[n % ny] as number,
  });
  const goal = xs.indexOf(t.x) * ny + ys.indexOf(t.y);
  const cost = new Map<number, number>();
  const prev = new Map<number, number>();
  const heap = new Heap();
  const start = (xs.indexOf(s.x) * ny + ys.indexOf(s.y)) * 4;
  cost.set(start, 0);
  heap.push(0, start);
  let found = -1;
  let best = Infinity;
  while (heap.size > 0) {
    const [c, , state] = heap.pop();
    if (c >= best) break;
    if (c > (cost.get(state) ?? Infinity)) continue;
    const node = state >> 2;
    const dir = state & 3;
    if (node === goal) {
      const total = c + (dir === 0 ? 0 : 1);
      if (total < best) {
        best = total;
        found = state;
      }
      continue;
    }
    const from = at(node);
    const xi = Math.floor(node / ny);
    const yi = node % ny;
    DIRS.forEach(([dx, dy], nd) => {
      if ((dir ^ 1) === nd) return;
      const nxi = xi + dx;
      const nyi = yi + dy;
      if (nxi < 0 || nyi < 0 || nxi >= xs.length || nyi >= ny) return;
      const next = nxi * ny + nyi;
      const to = at(next);
      if (inside(to.x, to.y) || inside((from.x + to.x) / 2, (from.y + to.y) / 2)) return;
      const len = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
      const step =
        len * (shared.has(segmentKey(from, to)) ? SHARED : 1) +
        (nd === dir ? 0 : 1) +
        (dy > 0 ? len * 1e-4 : 0) +
        (dx === 0 ? Math.abs(to.x - s.x) * 1e-6 : 0);
      const ns = next * 4 + nd;
      if (c + step < (cost.get(ns) ?? Infinity)) {
        cost.set(ns, c + step);
        prev.set(ns, state);
        heap.push(c + step, ns);
      }
    });
  }
  if (found < 0) return null;
  const path: Point[] = [];
  const keys: string[] = [];
  for (let st: number | undefined = found; st !== undefined; st = prev.get(st)) {
    const p = at(st >> 2);
    const last = path[path.length - 1];
    if (last) keys.push(segmentKey(p, last));
    path.push(p);
  }
  return { points: [a, ...path.reverse(), b], keys };
}

/** The `y` that lines a port of the dragged node up with a port it is wired to, within `MAGNET`. */
export function magnetY(y: number, pairs: { own: number; other: number }[]): number {
  let best = y;
  let gap = MAGNET + 1;
  for (const { own, other } of pairs) {
    const d = Math.abs(y + own - other);
    if (d < gap) {
      gap = d;
      best = other - own;
    }
  }
  return best;
}

/** Where a node dragged by `dx`, `dy` lands: on the 8px grid, then pulled level with a wired port. */
export function dropPosition(
  node: FlowNode,
  dx: number,
  dy: number,
  nodes: FlowNode[],
  edges: FlowEdge[],
): Point {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pairs = edges.flatMap((e) => {
    const out = e.from === node.id;
    if (!out && e.to !== node.id) return [];
    const other = byId.get(out ? e.to : e.from);
    if (!other || other.id === node.id) return [];
    const own = (out ? node.outputs : node.inputs).findIndex(
      (p) => p.id === (out ? e.fromPort : e.toPort),
    );
    const far = (out ? other.inputs : other.outputs).findIndex(
      (p) => p.id === (out ? e.toPort : e.fromPort),
    );
    return own < 0 || far < 0 ? [] : [{ own: portOffset(own), other: other.y + portOffset(far) }];
  });
  return { x: snap(node.x + dx), y: magnetY(snap(node.y + dy), pairs) };
}

export type FlowKeyAction =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'select' }
  | { type: 'deselect' }
  | { type: 'delete' };

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function flowKeyAction(
  key: string,
  ctx: { readOnly: boolean; onNode: boolean; hasSelection: boolean },
): FlowKeyAction | null {
  const arrow = ARROWS[key];
  if (arrow) {
    return ctx.onNode && !ctx.readOnly
      ? { type: 'move', dx: arrow[0] * FLOW_GRID, dy: arrow[1] * FLOW_GRID }
      : null;
  }
  if (key === 'Enter' || key === ' ') return ctx.onNode ? { type: 'select' } : null;
  if (key === 'Escape') return ctx.hasSelection ? { type: 'deselect' } : null;
  if (key === 'Delete' || key === 'Backspace') {
    return ctx.hasSelection && !ctx.readOnly ? { type: 'delete' } : null;
  }
  return null;
}

export function resolveConnection(
  from: { node: string; port: string },
  target: { node: string; port: string; side: string } | null,
  readOnly: boolean,
): FlowConnection | null {
  if (readOnly || !target || target.side !== 'in' || target.node === from.node) return null;
  return { from: from.node, fromPort: from.port, to: target.node, toPort: target.port };
}

const TONE_FILL: Record<BadgeTone, string> = {
  neutral: 'bg-text-mute',
  accent: 'bg-accent',
  success: 'bg-success',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
};

const TONE_TINT: Record<BadgeTone, string> = {
  neutral: '',
  accent: 'bg-accent/15',
  success: 'bg-success/15',
  warn: 'bg-warn/15',
  danger: 'bg-danger/15',
  info: 'bg-info/15',
};

const TONE_TEXT: Record<BadgeTone, string> = {
  neutral: 'text-text-dim',
  accent: 'text-accent',
  success: 'text-success',
  warn: 'text-warn',
  danger: 'text-danger',
  info: 'text-info',
};

const TONE_STROKE: Record<BadgeTone, string> = {
  neutral: 'stroke-text-mute',
  accent: 'stroke-accent',
  success: 'stroke-success',
  warn: 'stroke-warn',
  danger: 'stroke-danger',
  info: 'stroke-info',
};

type Gesture =
  | {
      kind: 'pan';
      sx: number;
      sy: number;
      ox: number;
      oy: number;
      moved: boolean;
      click: FlowSelection | null;
    }
  | { kind: 'node'; id: string; sx: number; sy: number; dx: number; dy: number; moved: boolean }
  | { kind: 'connect'; node: string; port: string; at: Point };

const dotPitch = (scale: number) =>
  FLOW_GRID * 2 * scale * 2 ** Math.max(0, Math.ceil(Math.log2(12 / (FLOW_GRID * 2 * scale))));

const nameOf = (node: FlowNode) =>
  node.label ?? (typeof node.title === 'string' ? node.title : node.id);

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * A node graph: absolutely positioned HTML nodes over an SVG edge layer, panned by dragging
 * empty canvas or scrolling, zoomed by pinch or ctrl-scroll and framed by Fit. Positions,
 * edges and selection are the consumer's; drags report on release, snapped to the 8px grid.
 */
export function FlowCanvas({
  nodes,
  edges,
  selected = null,
  onSelect,
  onMove,
  onConnect,
  onDelete,
  readOnly = false,
  height,
  label = 'Flow canvas',
  className,
}: FlowCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef(new Map<string, HTMLDivElement>());
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const [view, setViewState] = useState({ x: FIT_PAD, y: FIT_PAD, scale: 1 });
  const viewRef = useRef(view);
  const [gesture, setGestureState] = useState<Gesture | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const [motion, setMotion] = useState(false);
  const latest = useRef({ nodes, edges, onSelect, onMove, onConnect, readOnly });
  latest.current = { nodes, edges, onSelect, onMove, onConnect, readOnly };

  const setView = useCallback((next: { x: number; y: number; scale: number }) => {
    viewRef.current = next;
    setViewState(next);
  }, []);
  const setGesture = useCallback((next: Gesture | null) => {
    gestureRef.current = next;
    setGestureState(next);
  }, []);

  const sizeOf = (id: string): Size => sizes[id] ?? { w: FLOW_NODE_WIDTH, h: DEFAULT_HEIGHT };

  const toCanvas = useCallback((clientX: number, clientY: number): Point => {
    const rect = rootRef.current?.getBoundingClientRect();
    const v = viewRef.current;
    return {
      x: (clientX - (rect?.left ?? 0) - v.x) / v.scale,
      y: (clientY - (rect?.top ?? 0) - v.y) / v.scale,
    };
  }, []);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setMotion(!query.matches);
    };
    update();
    query.addEventListener('change', update);
    return () => {
      query.removeEventListener('change', update);
    };
  }, []);

  const ids = nodes.map((n) => n.id).join('\n');
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setSizes((current) => {
        let next = current;
        for (const entry of entries) {
          const el = entry.target as HTMLDivElement;
          const id = el.dataset.flowNode;
          if (!id) continue;
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          if (current[id]?.w === w && current[id]?.h === h) continue;
          if (next === current) next = { ...current };
          next[id] = { w, h };
        }
        return next;
      });
    });
    for (const el of nodeEls.current.values()) observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [ids]);

  const fit = useCallback(() => {
    const root = rootRef.current;
    const list = latest.current.nodes;
    if (!root || list.length === 0) return;
    const size = (id: string) => {
      const el = nodeEls.current.get(id);
      return el
        ? { w: el.offsetWidth, h: el.offsetHeight }
        : { w: FLOW_NODE_WIDTH, h: DEFAULT_HEIGHT };
    };
    const minX = Math.min(...list.map((n) => n.x));
    const minY = Math.min(...list.map((n) => n.y));
    const maxX = Math.max(...list.map((n) => n.x + size(n.id).w));
    const maxY = Math.max(...list.map((n) => n.y + size(n.id).h));
    const cw = root.clientWidth;
    const ch = root.clientHeight;
    const scale = Math.max(
      MIN_SCALE,
      Math.min(1, (cw - FIT_PAD * 2) / (maxX - minX), (ch - FIT_PAD * 2) / (maxY - minY)),
    );
    setView({
      x: (cw - (maxX - minX) * scale) / 2 - minX * scale,
      y: (ch - (maxY - minY) * scale) / 2 - minY * scale,
      scale,
    });
  }, [setView]);

  useEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const v = viewRef.current;
      if (event.ctrlKey) {
        const rect = root.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        const scale = Math.min(2, Math.max(MIN_SCALE, v.scale * Math.exp(-event.deltaY / 200)));
        setView({
          x: px - ((px - v.x) * scale) / v.scale,
          y: py - ((py - v.y) * scale) / v.scale,
          scale,
        });
      } else {
        setView({ ...v, x: v.x - event.deltaX, y: v.y - event.deltaY });
      }
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      root.removeEventListener('wheel', onWheel);
    };
  }, [setView]);

  const track = useCallback(() => {
    const onMovePointer = (event: PointerEvent) => {
      const g = gestureRef.current;
      if (!g) return;
      if (g.kind === 'connect') {
        setGesture({ ...g, at: toCanvas(event.clientX, event.clientY) });
        return;
      }
      const sx = event.clientX - g.sx;
      const sy = event.clientY - g.sy;
      const moved = g.moved || Math.hypot(sx, sy) > CLICK_SLOP;
      if (g.kind === 'pan') {
        if (moved) setView({ ...viewRef.current, x: g.ox + sx, y: g.oy + sy });
        if (moved !== g.moved) setGesture({ ...g, moved });
        return;
      }
      const scale = viewRef.current.scale;
      setGesture({ ...g, moved, dx: sx / scale, dy: sy / scale });
    };
    const onUp = (event: PointerEvent) => {
      removeEventListener('pointermove', onMovePointer);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onCancel);
      const g = gestureRef.current;
      setGesture(null);
      if (!g) return;
      const { nodes: list, onSelect: select, onMove: move, onConnect: connect } = latest.current;
      if (g.kind === 'pan') {
        if (!g.moved) select?.(g.click);
      } else if (g.kind === 'node') {
        const node = list.find((n) => n.id === g.id);
        if (!g.moved) select?.({ kind: 'node', id: g.id });
        else if (node) {
          const to = dropPosition(node, g.dx, g.dy, list, latest.current.edges);
          move?.(g.id, to.x, to.y);
        }
      } else {
        const port = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest<HTMLElement>('[data-flow-port]');
        const target = port
          ? {
              node: port.dataset.flowPortNode ?? '',
              port: port.dataset.flowPort ?? '',
              side: port.dataset.flowPortSide ?? '',
            }
          : null;
        const c = resolveConnection(
          { node: g.node, port: g.port },
          target,
          latest.current.readOnly,
        );
        if (c) connect?.(c);
      }
    };
    const onCancel = () => {
      removeEventListener('pointermove', onMovePointer);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onCancel);
      setGesture(null);
    };
    addEventListener('pointermove', onMovePointer);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onCancel);
  }, [setGesture, setView, toCanvas]);

  const startPan = (event: ReactPointerEvent, click: FlowSelection | null) => {
    const v = viewRef.current;
    setGesture({
      kind: 'pan',
      sx: event.clientX,
      sy: event.clientY,
      ox: v.x,
      oy: v.y,
      moved: false,
      click,
    });
    track();
  };

  const onCanvasDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    rootRef.current?.focus({ preventScroll: true });
    startPan(event, null);
  };

  const onNodeDown = (event: ReactPointerEvent, id: string) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (readOnly) {
      startPan(event, { kind: 'node', id });
      return;
    }
    setGesture({
      kind: 'node',
      id,
      sx: event.clientX,
      sy: event.clientY,
      dx: 0,
      dy: 0,
      moved: false,
    });
    track();
  };

  const onPortDown = (event: ReactPointerEvent, node: string, port: string) => {
    if (readOnly || event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    setGesture({ kind: 'connect', node, port, at: toCanvas(event.clientX, event.clientY) });
    track();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isEditable(event.target)) return;
    const nodeId = (event.target as HTMLElement).dataset.flowNode;
    const action = flowKeyAction(event.key, {
      readOnly,
      onNode: nodeId !== undefined,
      hasSelection: selected !== null,
    });
    if (!action) return;
    event.preventDefault();
    if (action.type === 'move' && nodeId) {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) onMove?.(nodeId, snap(node.x) + action.dx, snap(node.y) + action.dy);
    } else if (action.type === 'select' && nodeId) {
      onSelect?.({ kind: 'node', id: nodeId });
    } else if (action.type === 'deselect') {
      onSelect?.(null);
    } else if (action.type === 'delete' && selected) {
      onDelete?.(selected);
    }
  };

  const positionOf = (node: FlowNode): Point =>
    gesture?.kind === 'node' && gesture.id === node.id && gesture.moved
      ? dropPosition(node, gesture.dx, gesture.dy, nodes, edges)
      : { x: node.x, y: node.y };

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const anchor = (nodeId: string, portId: string, side: 'in' | 'out') => {
    const node = byId.get(nodeId);
    if (!node) return null;
    const ports = side === 'in' ? node.inputs : node.outputs;
    const index = ports.findIndex((p) => p.id === portId);
    if (index < 0) return null;
    return {
      point: portPoint(positionOf(node), sizeOf(nodeId).w, side, index),
      port: ports[index] as FlowPort,
      node,
    };
  };

  const boxes: FlowBox[] = nodes.map((n) => {
    const pos = positionOf(n);
    const size = sizeOf(n.id);
    return { x: pos.x, y: pos.y, w: size.w, h: size.h };
  });
  const route = (a: Point, b: Point, shared?: ReadonlySet<string>) =>
    routeEdge(a, b, boxes, shared) ?? { points: stepPoints(a, b), keys: [] };

  const trunks = new Map<string, Set<string>>();
  const drawn = edges.flatMap((edge) => {
    const a = anchor(edge.from, edge.fromPort, 'out');
    const b = anchor(edge.to, edge.toPort, 'in');
    if (!a || !b) return [];
    const trunk = `${edge.from}\n${edge.fromPort}`;
    const shared = trunks.get(trunk) ?? new Set<string>();
    trunks.set(trunk, shared);
    const { points, keys } = route(a.point, b.point, shared);
    for (const key of keys) shared.add(key);
    return [{ edge, a, b, d: roundedPath(points), mid: labelPoint(points) }];
  });

  const live =
    gesture?.kind === 'connect'
      ? (() => {
          const a = anchor(gesture.node, gesture.port, 'out');
          return a ? roundedPath(route(a.point, gesture.at).points) : null;
        })()
      : null;

  const isSelected = (kind: FlowSelection['kind'], id: string) =>
    selected?.kind === kind && selected.id === id;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="flow canvas"
      aria-label={label}
      tabIndex={-1}
      onPointerDown={onCanvasDown}
      onKeyDown={onKeyDown}
      className={cx(
        'relative min-h-[360px] w-full touch-none overflow-hidden rounded-panel bg-bg select-none',
        gesture?.kind === 'pan' && gesture.moved ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      style={{
        height: height ?? '100%',
        backgroundImage: 'radial-gradient(var(--color-surface-raised) 1px, transparent 1px)',
        backgroundSize: `${dotPitch(view.scale)}px ${dotPitch(view.scale)}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <svg
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
          width={1}
          height={1}
        >
          {drawn.map(({ edge, a, b, d }) => {
            const on = isSelected('edge', edge.id);
            const stroke = on ? 'stroke-accent' : TONE_STROKE[a.port.tone ?? 'neutral'];
            return (
              <g key={edge.id}>
                <path
                  d={d}
                  fill="none"
                  strokeWidth={on ? 2.5 : 1.5}
                  strokeDasharray={edge.animated ? '6 6' : undefined}
                  className={stroke}
                >
                  {edge.animated && motion ? (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="12"
                      to="0"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  ) : null}
                </path>
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`Edge from ${nameOf(a.node)}${a.port.label ? ` ${a.port.label}` : ''} to ${nameOf(b.node)}`}
                  className="cursor-pointer"
                  style={{ pointerEvents: 'stroke' }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={() => onSelect?.({ kind: 'edge', id: edge.id })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onSelect?.({ kind: 'edge', id: edge.id });
                    }
                  }}
                />
              </g>
            );
          })}
          {live ? (
            <path
              d={live}
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              className="stroke-accent"
            />
          ) : null}
        </svg>

        {drawn.map(({ edge, mid }) =>
          edge.label === undefined ? null : (
            <span
              key={edge.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-chip bg-surface px-1.5 text-caption whitespace-nowrap tabular-nums text-text-dim"
              style={{ left: mid.x, top: mid.y }}
            >
              {edge.label}
            </span>
          ),
        )}

        {nodes.map((node) => {
          const pos = positionOf(node);
          const on = isSelected('node', node.id);
          const name = nameOf(node);
          const labelled = node.outputs.some((p) => p.label);
          return (
            <div
              key={node.id}
              ref={(el) => {
                if (el) nodeEls.current.set(node.id, el);
                else nodeEls.current.delete(node.id);
              }}
              data-flow-node={node.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={name}
              onPointerDown={(event) => {
                onNodeDown(event, node.id);
              }}
              className={cx(
                'absolute rounded-panel bg-surface-raised',
                readOnly ? 'cursor-pointer' : 'cursor-move',
              )}
              style={{
                left: pos.x,
                top: pos.y,
                width: FLOW_NODE_WIDTH,
                minHeight: nodeMinHeight(Math.max(node.inputs.length, node.outputs.length)),
              }}
            >
              {node.tone && node.tone !== 'neutral' ? (
                <span
                  aria-hidden
                  className={cx('absolute inset-0 rounded-panel', TONE_TINT[node.tone])}
                />
              ) : null}
              {on ? (
                <span aria-hidden className="absolute inset-0 rounded-panel bg-accent/15" />
              ) : null}
              <div className={cx('relative flex min-w-0 gap-3 p-3', labelled && 'pr-14')}>
                {node.leading ? (
                  <span className="flex shrink-0 items-center">{node.leading}</span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body-strong text-text">{node.title}</div>
                  {node.subtitle ? (
                    <div className="truncate text-caption text-text-dim">{node.subtitle}</div>
                  ) : null}
                  {node.footer ? (
                    <div className="mt-2 flex flex-wrap gap-1">{node.footer}</div>
                  ) : null}
                </div>
              </div>
              {(['in', 'out'] as const).map((side) => {
                const ports = side === 'in' ? node.inputs : node.outputs;
                return ports.map((port, i) => {
                  const y = portOffset(i);
                  return (
                    <span
                      key={`${side}-${port.id}`}
                      data-flow-port={port.id}
                      data-flow-port-node={node.id}
                      data-flow-port-side={side}
                      role="img"
                      aria-label={`${port.label ?? (side === 'in' ? 'input' : 'output')} ${side === 'in' ? 'input' : 'output'} of ${name}`}
                      onPointerDown={
                        side === 'out'
                          ? (event) => {
                              onPortDown(event, node.id, port.id);
                            }
                          : undefined
                      }
                      className={cx(
                        'absolute flex size-6 -translate-y-1/2 items-center justify-center pointer-coarse:size-10',
                        side === 'in'
                          ? '-left-3 pointer-coarse:-left-5'
                          : '-right-3 pointer-coarse:-right-5',
                        side === 'out' && !readOnly && 'cursor-crosshair',
                      )}
                      style={{ top: y }}
                    >
                      <span
                        className={cx('size-3 rounded-full', TONE_FILL[port.tone ?? 'neutral'])}
                      />
                      {side === 'out' && port.label ? (
                        <span
                          aria-hidden
                          className={cx(
                            'absolute right-6 text-caption whitespace-nowrap pointer-coarse:right-8',
                            TONE_TEXT[port.tone ?? 'neutral'],
                          )}
                        >
                          {port.label}
                        </span>
                      ) : null}
                    </span>
                  );
                });
              })}
            </div>
          );
        })}
      </div>

      <Button
        size="sm"
        className="absolute right-2 bottom-2"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={fit}
      >
        Fit
      </Button>
    </div>
  );
}
