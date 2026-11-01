import { useState } from 'react';
import {
  Badge,
  Checkbox,
  FlowCanvas,
  type FlowEdge,
  type FlowNode,
  type FlowSelection,
} from '@hoobi/design';
import { Demo, Import, Props } from './kit.js';

const START: FlowNode[] = [
  {
    id: 'trigger',
    x: 0,
    y: 40,
    title: 'On import',
    subtitle: 'Trigger',
    inputs: [],
    outputs: [{ id: 'out' }],
    footer: <Badge>214 runs</Badge>,
  },
  {
    id: 'source',
    x: 320,
    y: 40,
    title: 'Episode files',
    subtitle: 'Sonarr',
    inputs: [{ id: 'in' }],
    outputs: [{ id: 'out' }],
    footer: (
      <Badge dot pulse tone="info">
        running
      </Badge>
    ),
    tone: 'info',
  },
  {
    id: 'if',
    x: 640,
    y: 40,
    title: 'Has English audio',
    subtitle: 'If',
    inputs: [{ id: 'in' }],
    outputs: [
      { id: 'true', label: 'true', tone: 'success' },
      { id: 'false', label: 'false', tone: 'danger' },
    ],
  },
  {
    id: 'action',
    x: 960,
    y: 160,
    title: 'Replace release',
    subtitle: 'Action',
    inputs: [{ id: 'in' }],
    outputs: [],
    footer: <Badge tone="danger">1 failed</Badge>,
  },
];

const EDGES: FlowEdge[] = [
  { id: 'e1', from: 'trigger', fromPort: 'out', to: 'source', toPort: 'in', label: '3' },
  {
    id: 'e2',
    from: 'source',
    fromPort: 'out',
    to: 'if',
    toPort: 'in',
    label: '26',
    animated: true,
  },
  { id: 'e3', from: 'if', fromPort: 'false', to: 'action', toPort: 'in', label: '2' },
];

export function FlowCanvasPage() {
  const [nodes, setNodes] = useState(START);
  const [edges, setEdges] = useState(EDGES);
  const [selected, setSelected] = useState<FlowSelection | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  return (
    <>
      <Import names="FlowCanvas" />
      <Demo
        title="A trigger, a source, an If and an action"
        note="Drag a node to move it, drag from an output port to an input to connect, drag the background or scroll to pan, pinch or ctrl-scroll to zoom. Tab to a node, arrows move it by the grid, Enter selects, Delete removes the selection."
        stack
        flush
        code={`<FlowCanvas
  nodes={nodes}
  edges={edges}
  selected={selected}
  onSelect={setSelected}
  onMove={(id, x, y) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x, y } : n)))}
  onConnect={(c) => setEdges((es) => [...es, { id: crypto.randomUUID(), ...c }])}
  onDelete={(sel) => (sel.kind === 'edge' ? removeEdge(sel.id) : removeNode(sel.id))}
  height={420}
/>`}
      >
        <div className="px-2">
          <Checkbox
            label="readOnly"
            checked={readOnly}
            onChange={(e) => {
              setReadOnly(e.target.checked);
            }}
            className="mb-2"
          />
          <FlowCanvas
            label="Audio language workflow"
            nodes={nodes}
            edges={edges}
            selected={selected}
            readOnly={readOnly}
            height={420}
            onSelect={setSelected}
            onMove={(id, x, y) => {
              setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x, y } : n)));
            }}
            onConnect={(c) => {
              setEdges((es) => [
                ...es,
                { id: `${c.from}.${c.fromPort}-${c.to}.${c.toPort}`, ...c },
              ]);
            }}
            onDelete={(sel) => {
              setSelected(null);
              if (sel.kind === 'edge') {
                setEdges((es) => es.filter((e) => e.id !== sel.id));
              } else {
                setNodes((ns) => ns.filter((n) => n.id !== sel.id));
                setEdges((es) => es.filter((e) => e.from !== sel.id && e.to !== sel.id));
              }
            }}
          />
        </div>
      </Demo>

      <Props
        rows={[
          [
            'nodes',
            'FlowNode[]',
            '',
            'id, x, y (top-left), title, label?, subtitle?, leading?, inputs, outputs, footer?, tone?.',
          ],
          [
            'edges',
            'FlowEdge[]',
            '',
            'id, from, fromPort, to, toPort, label? at the curve midpoint, animated?.',
          ],
          [
            'selected',
            'FlowSelection | null',
            'null',
            'The selected node or edge, shown as the accent tint.',
          ],
          [
            'onSelect',
            '(sel | null) => void',
            '',
            'Click a node or edge; a click on empty canvas passes null.',
          ],
          [
            'onMove',
            '(id, x, y) => void',
            '',
            'On drag end and on arrow keys, snapped to the 8px grid.',
          ],
          [
            'onConnect',
            '(c: FlowConnection) => void',
            '',
            'Drag from an output port, drop on another node’s input.',
          ],
          [
            'onDelete',
            '(sel: FlowSelection) => void',
            '',
            'Delete or Backspace on the selection while the canvas has focus.',
          ],
          [
            'readOnly',
            'boolean',
            'false',
            'No drag, connect or delete; select and pan still work.',
          ],
          ['height', 'number | string', '100%', 'Fills the parent by default; never below 360px.'],
          ['label', 'string', 'Flow canvas', 'Names the canvas for assistive tech.'],
        ]}
      />
    </>
  );
}
