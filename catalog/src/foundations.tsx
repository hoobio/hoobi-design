import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Badge, Card } from '@hoobi/design';
import { Snippet } from './kit.js';

const GROUPS: { group: string; note: string; names: string[] }[] = [
  {
    group: 'Surfaces',
    note: 'Ayu Mirage backgrounds, stacked darkest to lightest. Separation comes from the fills themselves - no borders, no shadows; segmented surfaces are sliced by a 1px hairline of bg.',
    names: ['bg', 'surface', 'surface-raised', 'border', 'chip'],
  },
  {
    group: 'Text',
    note: 'Three levels of emphasis plus the on-accent foreground.',
    names: ['text', 'text-dim', 'text-mute', 'on-accent'],
  },
  {
    group: 'Ayu hues',
    note: 'The raw Ayu Mirage syntax palette. Use for data and categorisation, not for chrome.',
    names: [
      'accent-blue',
      'accent-cyan',
      'accent-green',
      'accent-yellow',
      'accent-orange',
      'accent-red',
      'accent-purple',
    ],
  },
  {
    group: 'Action',
    note: 'Restrained by design: accent marks the one primary action, the selected tab, progress fill and the focus ring.',
    names: ['accent', 'accent-hover', 'accent-fill'],
  },
  {
    group: 'Semantic',
    note: 'Literal hex on purpose, so Tailwind opacity modifiers such as bg-warn/10 can decompose them.',
    names: ['success', 'warn', 'danger', 'info'],
  },
];

const hex = (rgb: string) => {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return rgb;
  return (
    '#' +
    m
      .slice(0, 3)
      .map((n) => Math.round(Number(n)).toString(16).padStart(2, '0'))
      .join('')
  );
};

// Resolve through a real element so color-mix() tokens report a concrete value.
function useResolved(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const probe = document.createElement('span');
    probe.style.position = 'fixed';
    probe.style.opacity = '0';
    document.body.append(probe);
    const out: Record<string, string> = {};
    for (const n of names) {
      probe.style.backgroundColor = `var(--color-${n})`;
      out[n] = hex(getComputedStyle(probe).backgroundColor);
    }
    probe.remove();
    setValues(out);
  }, [names.join(',')]);
  return values;
}

const ALL = GROUPS.flatMap((g) => g.names);

export function Colour() {
  const values = useResolved(ALL);
  return (
    <>
      <p className="max-w-prose text-body text-text-dim">
        Every colour is a Tailwind v4 <code className="text-accent-blue">@theme</code> token, so
        each name below is also a real utility: <code className="text-accent-blue">bg-surface</code>
        , <code className="text-accent-blue">text-text-dim</code>,{' '}
        <code className="text-accent-blue">border-border</code>. Hex values are read live from the
        running stylesheet.
      </p>
      {GROUPS.map((g) => (
        <div key={g.group} className="mt-8">
          <h3 className="text-body-strong text-text">{g.group}</h3>
          <p className="mt-1 max-w-prose text-caption text-text-dim">{g.note}</p>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
            {g.names.map((n) => (
              <div key={n} className="rounded-panel bg-surface p-3">
                <div
                  className="h-10 w-full rounded-control border border-border"
                  style={{ backgroundColor: `var(--color-${n})` }}
                />
                <div className="mt-2 truncate font-mono text-caption text-text">{n}</div>
                <div className="font-mono text-caption text-text-mute">{values[n] ?? '...'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-8">
        <Snippet
          code={`<div className="bg-surface-raised text-text-dim" />`}
        />
      </div>
    </>
  );
}

const RAMP: { cls: string; name: string; size: string; lh: string; use: string }[] = [
  {
    cls: 'text-caption',
    name: 'Caption',
    size: '14px',
    lh: '20px',
    use: 'Labels, hints, metadata',
  },
  { cls: 'text-body', name: 'Body', size: '16px', lh: '22px', use: 'Default UI text' },
  {
    cls: 'text-body-strong',
    name: 'Body Strong',
    size: '16px / 500',
    lh: '22px',
    use: 'Card and alert titles',
  },
  { cls: 'text-body-large', name: 'Body Large', size: '18px', lh: '24px', use: 'Lead paragraphs' },
  {
    cls: 'text-subtitle',
    name: 'Subtitle',
    size: '20px / 600',
    lh: '28px',
    use: 'Modal and panel titles',
  },
  {
    cls: 'text-title',
    name: 'Title',
    size: '28px / 600',
    lh: '36px',
    use: 'Page and section head',
  },
];

export function Typography() {
  return (
    <>
      <p className="max-w-prose text-body text-text-dim">
        The WinUI 3 ramp shape with a YouTube-sized reading tier, expressed in rem against the 18px
        root so it still tracks user zoom. Noto Sans carries every step. Dank Mono is reserved for
        code.
      </p>
      <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-panel">
        {RAMP.map((r) => (
          <div key={r.cls} className="bg-surface p-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption text-text-mute">
              <span className="font-mono text-accent-blue">{r.cls}</span>
              <span>{r.size}</span>
              <span>line-height {r.lh}</span>
              <span className="text-text-dim">{r.use}</span>
            </div>
            <p className={`mt-1 text-text ${r.cls}`}>{r.name} - Sphinx of black quartz, judge my</p>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-body-strong text-text">Dank Mono</h3>
      <p className="mt-1 max-w-prose text-caption text-text-dim">
        Regular, italic and bold, at the caption and body sizes. Italic is the reason this face is
        here.
      </p>
      <pre className="styled-scrollbar mt-3 overflow-x-auto rounded-panel bg-chip p-4 text-body">
        <code className="font-mono">
          <span className="text-text-mute italic">{'// remediate the issue, or ask a human'}</span>
          {'\n'}
          <span className="text-accent-purple">export async function</span>{' '}
          <span className="text-accent-yellow">remediate</span>
          <span className="text-text-dim">(</span>
          <span className="text-accent-orange">issue</span>
          <span className="text-text-dim">: </span>
          <span className="text-accent-cyan">SeerrIssue</span>
          <span className="text-text-dim">) {'{'}</span>
          {'\n  '}
          <span className="text-accent-purple">const</span> plan{' '}
          <span className="text-text-dim">=</span> <span className="text-accent-purple">await</span>{' '}
          agent<span className="text-text-dim">.</span>
          <span className="text-accent-yellow">plan</span>
          <span className="text-text-dim">(</span>issue<span className="text-text-dim">);</span>
          {'\n  '}
          <span className="text-accent-purple">return</span> plan
          <span className="text-text-dim">.</span>risky
          {'\n    '}
          <span className="text-text-dim">?</span>{' '}
          <span className="text-accent-yellow">approve</span>
          <span className="text-text-dim">(</span>plan<span className="text-text-dim">)</span>
          {'\n    '}
          <span className="text-text-dim">:</span>{' '}
          <span className="text-accent-yellow">execute</span>
          <span className="text-text-dim">(</span>plan<span className="text-text-dim">);</span>
          {'\n'}
          <span className="text-text-dim">{'}'}</span>
        </code>
      </pre>

      <h3 className="mt-8 text-body-strong text-text">Root size</h3>
      <p className="mt-1 max-w-prose text-caption text-text-dim">
        18px, dropping to 16px under 40rem so the ramp stays comfortable on a phone. Spacing does
        not move with it: that is deliberate, see Spacing &amp; Radius.
      </p>
    </>
  );
}

const STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
const RADII: [string, string, string][] = [
  ['rounded-chip', '--radius-chip', '4px'],
  ['rounded-control', '--radius-control', '4px'],
  ['rounded-panel', '--radius-panel', '8px'],
];

export function Spacing() {
  return (
    <>
      <Alert tone="info" title="Spacing is px, not rem">
        WinUI 3 lays out in device-independent pixels, so{' '}
        <code className="text-accent-blue">--spacing</code> is <code>4px</code> rather than the
        Tailwind default of <code>0.25rem</code>. <code>p-4</code> is a real 16px at any root size,
        and <code>h-8</code> is a real 32px control. Text stays in rem so it still responds to user
        zoom.
      </Alert>

      <h3 className="mt-8 text-body-strong text-text">Scale</h3>
      <p className="mt-1 max-w-prose text-caption text-text-dim">
        Every spacing utility is n x 4px. Reach for the WinUI grid values (4 / 8 / 12 / 16 / 24 /
        32) rather than odd numbers.
      </p>
      <div className="mt-3 flex flex-col gap-2 rounded-panel bg-surface p-4">
        {STEPS.map((n) => (
          <div key={n} className="flex items-center gap-3">
            <span className="w-10 shrink-0 font-mono text-caption text-accent-blue">{n}</span>
            <span className="w-12 shrink-0 font-mono text-caption text-text-mute">{n * 4}px</span>
            <span
              className="h-3 rounded-chip bg-accent-fill"
              style={{ width: `calc(var(--spacing) * ${n})` }}
            />
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-body-strong text-text">Radius</h3>
      <p className="mt-1 max-w-prose text-caption text-text-dim">
        The WinUI pair: 4px on controls, 8px on surfaces and overlays. Nothing else.
      </p>
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
        {RADII.map(([cls, token, px]) => (
          <div key={cls} className="rounded-panel bg-surface p-3">
            <div className={`h-12 w-full border border-accent bg-accent-fill/30 ${cls}`} />
            <div className="mt-2 font-mono text-caption text-text">{cls}</div>
            <div className="font-mono text-caption text-text-mute">
              {token} - {px}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-body-strong text-text">Control density</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card title="32px standard">
          <p className="text-caption text-text-dim">
            Button md, Input, Select and Tabs are all <code className="text-accent-blue">h-8</code>.
            Button sm is <code className="text-accent-blue">h-7</code> (28px), Badge is{' '}
            <code className="text-accent-blue">h-5</code> (20px).
          </p>
        </Card>
        <Card title="44px on touch">
          <p className="text-caption text-text-dim">
            Under <code className="text-accent-blue">pointer: coarse</code> the base layer applies a
            44px min-height to buttons, tabs, inputs and selects. min-height beats height, so touch
            targets always win.
          </p>
        </Card>
      </div>
    </>
  );
}

export function Identity({ children }: { children?: ReactNode }) {
  return (
    <>
      <blockquote className="rounded-panel bg-surface p-4 text-body-large text-text">
        hoobi-design is a <strong>dark-mode-preference</strong> library using the{' '}
        <strong>Ayu Mirage</strong> colour scheme heavily, with components, fonts and spacing{' '}
        <strong>heavily influenced by WinUI 3 (Fluent 2)</strong>.{' '}
        <strong>Minimalism heavy.</strong>
      </blockquote>
      <p className="mt-4 max-w-prose text-body text-text-dim">
        Every token and component decision resolves against that statement. If a change makes the
        library less Ayu, less WinUI, or less minimal, it does not land.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="info" dot>
          Dark only
        </Badge>
        <Badge tone="neutral">Zero runtime deps</Badge>
        <Badge tone="neutral">React 19</Badge>
        <Badge tone="neutral">Tailwind v4</Badge>
        <Badge tone="success" dot>
          Mobile first
        </Badge>
      </div>

      <h3 className="mt-8 text-body-strong text-text">Install</h3>
      <div className="mt-2 flex flex-col gap-2">
        <Snippet code={`npm install @hoobi/design`} />
        <Snippet
          code={`/* your styles.css - one line, the library imports Tailwind itself */\n@import '@hoobi/design/styles.css';`}
        />
        <Snippet code={`import { Button, Card, Badge } from '@hoobi/design';`} />
      </div>

      <h3 className="mt-8 text-body-strong text-text">What WinUI 3 buys us</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card title="4px and 8px">
          <p className="text-caption text-text-dim">
            Controls and chips round at 4px, surfaces and overlays at 8px. Two values, no others.
          </p>
        </Card>
        <Card title="32px density">
          <p className="text-caption text-text-dim">
            Compact but breathable. Everything interactive lands on the same 32px line, so forms and
            toolbars align without effort.
          </p>
        </Card>
        <Card title="Borders, not shadows">
          <p className="text-caption text-text-dim">
            A single 1px border does the separating. The only scrim in the library is the Modal
            backdrop.
          </p>
        </Card>
        <Card title="One accent">
          <p className="text-caption text-text-dim">
            Accent marks the primary action, the selected tab, progress fill and the focus ring.
            Everything else is neutral.
          </p>
        </Card>
      </div>
      {children}
    </>
  );
}
