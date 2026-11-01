import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  FlowCanvas,
  dropPosition,
  flowKeyAction,
  labelPoint,
  portPoint,
  resolveConnection,
  roundedPath,
  routeEdge,
  stepPoints,
  snap,
} from '../dist/FlowCanvas.js';

const nodes = [
  { id: 't', x: 0, y: 0, title: 'Import', inputs: [], outputs: [{ id: 'out' }] },
  {
    id: 'if',
    x: 320,
    y: 0,
    title: 'Has English audio',
    inputs: [{ id: 'in' }],
    outputs: [
      { id: 'true', label: 'true', tone: 'success' },
      { id: 'false', label: 'false', tone: 'danger' },
    ],
  },
];
const edges = [{ id: 'e1', from: 't', fromPort: 'out', to: 'if', toPort: 'in', label: '12' }];
const html = (props = {}) =>
  renderToStaticMarkup(createElement(FlowCanvas, { nodes, edges, ...props }));

test('renders named nodes, ports and edges', () => {
  const out = html();
  assert.match(out, /role="button"[^>]*aria-label="Import"/);
  assert.match(out, /aria-label="true output of Has English audio"/);
  assert.match(out, /aria-label="input input of Has English audio"/);
  assert.match(out, /aria-label="Edge from Import to Has English audio"/);
  assert.match(out, />12<\/span>/);
});

const box = (x, y, h = 72) => ({ x, y, w: 220, h });

test('ports sit at a fixed offset from the top, on the grid', () => {
  assert.deepEqual(portPoint({ x: 0, y: 0 }, 220, 'out', 0), { x: 220, y: 24 });
  assert.deepEqual(portPoint({ x: 320, y: 8 }, 220, 'in', 1), { x: 320, y: 56 });
});

test('connected nodes at the same y draw one straight line whatever their footers', () => {
  const out = html({
    nodes: [
      { ...nodes[0], footer: createElement('span', null, 'runs 214') },
      { ...nodes[1], subtitle: 'If' },
    ],
  });
  assert.match(out, /d="M 220 24 L 320 24"/);
});

test('every segment is straight and only direction changes are rounded', () => {
  assert.equal(
    roundedPath([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 40 },
      { x: 100, y: 40 },
    ]),
    'M 0 0 L 42 0 Q 50 0 50 8 L 50 32 Q 50 40 58 40 L 100 40',
  );
  assert.equal(
    roundedPath([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 6 },
      { x: 100, y: 6 },
    ]),
    'M 0 0 L 42 0 C 50 0 50 6 58 6 L 100 6',
  );
});

test('a route detours round a node in the way', () => {
  const a = { x: 220, y: 24 };
  const b = { x: 760, y: 24 };
  const blocker = box(400, 0);
  const { points } = routeEdge(a, b, [box(0, 0), blocker, box(760, 0)]);
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    assert.ok(!(mx > 400 && mx < 620 && my > 0 && my < 72), `segment ${i} crosses the blocker`);
  }
  assert.equal(labelPoint(points).y < 0 || labelPoint(points).y > 72, true);
});

test('a target above and behind its source is reached through the gap between them', () => {
  const source = box(0, 200);
  const target = box(100, 0, 100);
  const a = portPoint(source, 220, 'out', 0);
  const b = portPoint(target, 220, 'in', 0);
  const { points } = routeEdge(a, b, [source, target]);
  assert.ok(points.slice(2).every((p) => p.y <= source.y));
  assert.deepEqual(points.at(-1), b);
});

test('a 40px gap between columns shrinks the stubs and keeps one vertical run in the middle', () => {
  const source = box(0, 0);
  const target = box(260, 32);
  const a = portPoint(source, 220, 'out', 0);
  const b = portPoint(target, 220, 'in', 0);
  const { points } = routeEdge(a, b, [source, target]);
  assert.deepEqual(
    points.filter((p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y),
    [
      { x: 220, y: 24 },
      { x: 240, y: 24 },
      { x: 240, y: 56 },
      { x: 260, y: 56 },
    ],
  );
  assert.equal(
    roundedPath(points),
    'M 220 24 L 232 24 Q 240 24 240 32 L 240 48 Q 240 56 248 56 L 260 56',
  );
  assert.equal(roundedPath(stepPoints(a, b)), roundedPath(points));
});

test('edges from one port share a trunk before they branch', () => {
  const boxes = [box(0, 0), box(400, 0), box(400, 200)];
  const a = { x: 220, y: 24 };
  const first = routeEdge(a, { x: 400, y: 24 }, boxes);
  const second = routeEdge(a, { x: 400, y: 224 }, boxes, new Set(first.keys));
  assert.ok(second.keys.some((k) => first.keys.includes(k)));
});

test('a dragged node is pulled level with a wired port within 12px', () => {
  const [t, iff] = nodes;
  assert.deepEqual(dropPosition(iff, 0, 9, nodes, edges), { x: 320, y: 0 });
  assert.deepEqual(dropPosition(iff, 0, 24, nodes, edges), { x: 320, y: 24 });
  assert.deepEqual(dropPosition(t, 3, -7, nodes, edges), { x: 0, y: 0 });
});

test('the selected node and edge are marked pressed', () => {
  assert.match(
    html({ selected: { kind: 'node', id: 't' } }),
    /aria-pressed="true" aria-label="Import"/,
  );
  assert.match(
    html({ selected: { kind: 'edge', id: 'e1' } }),
    /aria-pressed="true" aria-label="Edge from/,
  );
});

test('a drop on another node input connects; anything else does not', () => {
  const from = { node: 't', port: 'out' };
  assert.deepEqual(resolveConnection(from, { node: 'if', port: 'in', side: 'in' }, false), {
    from: 't',
    fromPort: 'out',
    to: 'if',
    toPort: 'in',
  });
  assert.equal(resolveConnection(from, { node: 't', port: 'in', side: 'in' }, false), null);
  assert.equal(resolveConnection(from, { node: 'if', port: 'true', side: 'out' }, false), null);
  assert.equal(resolveConnection(from, null, false), null);
  assert.equal(resolveConnection(from, { node: 'if', port: 'in', side: 'in' }, true), null);
});

test('keys select, move by the grid and delete; readOnly blocks edits', () => {
  const ctx = { readOnly: false, onNode: true, hasSelection: true };
  assert.deepEqual(flowKeyAction('ArrowRight', ctx), { type: 'move', dx: 8, dy: 0 });
  assert.deepEqual(flowKeyAction('ArrowUp', ctx), { type: 'move', dx: 0, dy: -8 });
  assert.deepEqual(flowKeyAction('Enter', ctx), { type: 'select' });
  assert.deepEqual(flowKeyAction('Delete', ctx), { type: 'delete' });
  assert.deepEqual(flowKeyAction('Backspace', ctx), { type: 'delete' });
  assert.deepEqual(flowKeyAction('Escape', ctx), { type: 'deselect' });
  assert.equal(flowKeyAction('Delete', { ...ctx, hasSelection: false }), null);
  const ro = { ...ctx, readOnly: true };
  assert.equal(flowKeyAction('ArrowRight', ro), null);
  assert.equal(flowKeyAction('Delete', ro), null);
  assert.deepEqual(flowKeyAction('Enter', ro), { type: 'select' });
});

test('positions snap to the 8px grid', () => {
  assert.equal(snap(13), 16);
  assert.equal(snap(11), 8);
  assert.equal(snap(-3), -0);
});

test('readOnly drops the connect cursor from output ports', () => {
  assert.match(html(), /cursor-crosshair/);
  assert.doesNotMatch(html({ readOnly: true }), /cursor-crosshair/);
});
