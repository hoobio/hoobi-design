import { useContext, type CSSProperties, type ReactNode } from 'react';
import { Alert, Badge, Card, Select } from '@hoobi/design';
import { DEMO_TEXTURE, ShellDemoContext, Snippet } from './kit.js';
import { colour, token } from './tokens.js';
import posterUrl from './poster.jpg';

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

export function Colour() {
  return (
    <>
      <p className="text-body text-text-dim">
        Every colour is a Tailwind v4 <code className="text-accent-blue">@theme</code> token, so
        each name below is also a real utility: <code className="text-accent-blue">bg-surface</code>
        , <code className="text-accent-blue">text-text-dim</code>,{' '}
        <code className="text-accent-blue">border-border</code>. Hex values are read live from the
        running stylesheet.
      </p>
      {GROUPS.map((g) => (
        <div key={g.group} className="mt-8">
          <h3 className="text-body-strong text-text">{g.group}</h3>
          <p className="mt-1 text-caption text-text-dim">{g.note}</p>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
            {g.names.map((n) => (
              <div key={n} className="rounded-panel bg-surface p-3">
                <div
                  className="h-10 w-full rounded-control border border-border"
                  style={{ backgroundColor: `var(--color-${n})` }}
                />
                <div className="mt-2 truncate font-mono text-caption text-text">{n}</div>
                <div className="font-mono text-caption text-text-mute">{colour(n)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-8">
        <Snippet code={`<div className="bg-surface-raised text-text-dim" />`} />
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
      <p className="text-body text-text-dim">
        The WinUI 3 ramp shape with a YouTube-sized reading tier, expressed in rem against the 18px
        root so it still tracks user zoom. Hanken Grotesk carries every step. Dank Mono is reserved for
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
      <p className="mt-1 text-caption text-text-dim">
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
      <p className="mt-1 text-caption text-text-dim">
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
      <p className="mt-1 text-caption text-text-dim">
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
      <p className="mt-1 text-caption text-text-dim">
        The WinUI pair: 4px on controls, 8px on surfaces and overlays. Nothing else.
      </p>
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
        {RADII.map(([cls, token, px]) => (
          <div key={cls} className="rounded-panel bg-surface p-3">
            <div className={`h-12 w-full bg-accent-fill ${cls}`} />
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
      <p className="mt-4 text-body text-text-dim">
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
        <Card title="Fills, not strokes">
          <p className="text-caption text-text-dim">
            Surfaces are told apart by background alone. Cards, pills and alerts carry no border;
            segmentation is a 1px hairline of page background. The only scrim is the Modal backdrop.
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

export function Mirage() {
  const demo = useContext(ShellDemoContext);
  return (
    <>
      <p className="text-body text-text-dim">
        The house material - Fluent mica, named for Ayu Mirage. Hand it{' '}
        <strong className="text-text">any CSS image</strong> and it is fixed behind the whole app,
        heavily blurred by the layer itself and tinted back towards{' '}
        <code className="text-accent-blue">bg</code>. The blur is the point: a low-res photo, a
        movie poster, a stack of gradients - all melt into the same soft colour wash, so an app can
        derive its backdrop from whatever it is showing. With no artwork,{' '}
        <code className="text-accent-blue">mirageImage(colors?)</code> builds one from a few hues -
        the Ayu trio by default.
      </p>

      {demo ? (
        <div className="mt-6 rounded-panel bg-surface p-4">
          <Select
            aria-label="Mirage source"
            className="w-auto"
            label="mirage on this catalog, live"
            value={demo.mirage}
            onChange={(e) => {
              demo.setMirage(e.target.value as typeof demo.mirage);
            }}
          >
            <option value="off">off</option>
            <option value="hues">default hues</option>
            <option value="poster">the poster below</option>
          </Select>
        </div>
      ) : null}

      <h3 className="mt-8 text-body-strong text-text">The pieces</h3>
      <p className="mt-1 text-caption text-text-dim">
        Shell wires it from one prop. Outside a Shell,{' '}
        <code className="text-accent-blue">.mirage-layer</code> is the fixed backdrop reading{' '}
        <code className="text-accent-blue">--mirage-image</code>. With hairlines on (
        <code className="text-accent-blue">divided</code>) the chrome stays transparent over it;
        seamless chrome takes a bg fill instead.
      </p>
      <div className="mt-3">
        <Snippet
          code={`<Shell mirage="url(/poster.jpg)" ... />
<Shell mirage={mirageImage(['#409fff', '#f28779'])} ... />

// or by hand:
<div className="mirage-layer" style={{ '--mirage-image': 'url(/poster.jpg)' }} />`}
        />
      </div>

      <h3 className="mt-8 text-body-strong text-text">In miniature</h3>
      <p className="mt-1 text-caption text-text-dim">
        The default hues, then a movie poster - raw and as mirage. The blur melts a 500px poster
        into the backdrop an app would sit on while showing that film.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <div
          className="relative aspect-2/3 w-44 overflow-hidden rounded-panel"
          style={{ backgroundImage: `url(${posterUrl})`, backgroundSize: 'cover' }}
        >
          <span className="absolute bottom-3 left-3 rounded-control bg-chip px-2 py-1 text-caption text-text">
            poster, raw
          </span>
        </div>
        <div className="relative aspect-2/3 w-44 overflow-hidden rounded-panel">
          <div
            className="absolute inset-0 scale-110 blur-2xl saturate-150"
            style={{
              backgroundImage: `linear-gradient(color-mix(in srgb, var(--color-bg) 72%, transparent), color-mix(in srgb, var(--color-bg) 72%, transparent)), url(${posterUrl})`,
              backgroundSize: 'cover',
            }}
          />
          <span className="absolute bottom-3 left-3 rounded-control bg-chip px-2 py-1 text-caption text-text">
            poster, mirage
          </span>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          className="relative h-40 overflow-hidden rounded-panel"
          style={{ backgroundImage: DEMO_TEXTURE, backgroundSize: 'cover' }}
        >
          <span className="absolute bottom-3 left-3 rounded-control bg-chip px-2 py-1 text-caption text-text">
            raw
          </span>
        </div>
        <div className="relative h-40 overflow-hidden rounded-panel">
          <div
            className="absolute inset-0 scale-110 blur-2xl saturate-150"
            style={{
              backgroundImage: `linear-gradient(color-mix(in srgb, var(--color-bg) 72%, transparent), color-mix(in srgb, var(--color-bg) 72%, transparent)), ${DEMO_TEXTURE}`,
              backgroundSize: 'cover',
            }}
          />
          <span className="absolute bottom-3 left-3 rounded-control bg-chip px-2 py-1 text-caption text-text">
            mirage
          </span>
        </div>
      </div>

      <h3 className="mt-8 text-body-strong text-text">Edge, for a row</h3>
      <p className="mt-1 text-caption text-text-dim">
        A third strength for list rows: the host paints its own{' '}
        <code className="text-accent-blue">bg-surface</code> and{' '}
        <code className="text-accent-blue">.mirage-edge</code> masks a strip of artwork at the left,
        fading out before it reaches the text - a hint at the row&apos;s edge, not the fill. A full
        <code className="text-accent-blue">.mirage-scoped</code> per row is too busy at list density.
      </p>
      <div className="mt-3">
        <Snippet
          code={`<div className="mirage-edge rounded-panel bg-surface" style={{ '--mirage-image': 'url(/poster.jpg)' }}>
  ...
</div>`}
        />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <div
          className="mirage-edge rounded-panel bg-surface p-4"
          style={{ '--mirage-image': DEMO_TEXTURE } as CSSProperties}
        >
          <p className="text-body-strong text-text">The Odyssey</p>
          <p className="text-caption text-text-dim">Video issue - wrong quality</p>
        </div>
        <div
          className="mirage-edge rounded-panel bg-surface p-4"
          style={{ '--mirage-image': `url(${posterUrl})` } as CSSProperties}
        >
          <p className="text-body-strong text-text">Rockman.EXE</p>
          <p className="text-caption text-text-dim">Audio issue - wrong language</p>
        </div>
      </div>

      <h3 className="mt-8 text-body-strong text-text">Hero, for a page head</h3>
      <p className="mt-1 text-caption text-text-dim">
        The fourth strength: <code className="text-accent-blue">.mirage-hero</code> is an absolutely
        positioned band behind the top of a page, fading down into flat{' '}
        <code className="text-accent-blue">bg</code> before the reading starts. The host page column
        takes <code className="text-accent-blue">relative isolate</code>; header content over it
        usually takes <code className="text-accent-blue">.mirage-lift</code>.
      </p>
      <div className="mt-3">
        <Snippet
          code={`<div className="relative isolate">
  <div className="mirage-hero" style={{ '--mirage-image': 'url(/poster.jpg)' }} />
  <div className="mirage-lift">breadcrumbs, header...</div>
  ...flat content below...
</div>`}
        />
      </div>
      <div className="relative isolate mt-3 overflow-hidden rounded-panel bg-bg">
        <div
          className="mirage-hero absolute"
          style={{ '--mirage-image': `url(${posterUrl})` } as CSSProperties}
        />
        <div className="mirage-lift p-4">
          <p className="text-subtitle text-text">Rockman.EXE: The Program of Light and Darkness</p>
          <p className="text-caption text-text-dim">Missing file, wants alternatives</p>
        </div>
        <div className="h-40 p-4 text-caption text-text-mute">
          The page reads on flat background from here down.
        </div>
      </div>
    </>
  );
}

const CURVES: { name: string; token: string; fluent: string; use: string }[] = [
  {
    name: 'Decelerate',
    token: '--ease-decelerate',
    fluent: 'curveDecelerateMid',
    use: 'Entering and growing. Arrives fast, settles softly - the thing is coming to rest where you are looking.',
  },
  {
    name: 'Accelerate',
    token: '--ease-accelerate',
    fluent: 'curveAccelerateMid',
    use: 'Leaving and shrinking. Departs slowly, exits fast - nobody needs to watch the last half of an exit.',
  },
  {
    name: 'Standard',
    token: '--ease-standard',
    fluent: 'curveEasyEase',
    use: 'Moving in place. A colour shift, a hover, a value changing where it already is.',
  },
];

const DURATIONS: [ms: string, fluent: string, use: string][] = [
  ['150ms', 'durationFast', 'Colour, opacity, hover and focus - anything that does not move.'],
  ['250ms', 'durationGentle', 'A pane, a flyout, a modal. The library default for travel.'],
  ['300ms', 'durationSlow', 'Large surfaces crossing most of the viewport.'],
];

/** The cubic-bezier as an SVG path in a 0-100 box, y flipped so time runs left, progress up. */
function curvePath(value: string): string {
  const n = value.match(/-?\d*\.?\d+/g)?.map(Number);
  if (!n || n.length < 4) return '';
  const [x1, y1, x2, y2] = n as [number, number, number, number];
  return `M0,100 C${x1 * 100},${100 - y1 * 100} ${x2 * 100},${100 - y2 * 100} 100,0`;
}

export function Motion() {
  return (
    <>
      <p className="text-body text-text-dim">
        Fluent 2 motion, unmodified: three curves and three durations, and nothing outside them. The
        library&apos;s easings are the exact values Microsoft ships in{' '}
        <code className="text-accent-blue">@fluentui/tokens</code> - the mid tier of each family,
        which is the one Fluent uses for UI. Motion here signals <em>what happened</em>, never
        decoration; a component gets an animation only when something moved or appeared.
      </p>

      <h3 className="mt-8 text-body-strong text-text">Curves</h3>
      <p className="mt-1 text-caption text-text-dim">
        Time runs left to right, progress bottom to top. The dot replays the curve on a loop.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {CURVES.map((c) => (
          <div key={c.token} className="rounded-panel bg-surface p-4">
            <svg viewBox="-6 -6 112 112" className="w-full" role="img" aria-label={c.name}>
              <path d="M0,100 L100,0" stroke="var(--color-border)" strokeWidth="1" fill="none" />
              <path
                d={curvePath(token(c.token))}
                stroke="var(--color-accent)"
                strokeWidth="3"
                fill="none"
              />
              <circle r="5" fill="var(--color-accent-yellow)" cx="0" cy="100">
                <animate
                  attributeName="cx"
                  values="0;100;100"
                  keyTimes="0;0.55;1"
                  dur="2.2s"
                  calcMode="linear"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="100;0;0"
                  keyTimes="0;0.55;1"
                  dur="2.2s"
                  calcMode="spline"
                  keySplines={`${token(c.token)
                    .replace(/cubic-bezier\(|\)/g, '')
                    .split(',')
                    .map((v) => v.trim())
                    .join(' ')};0 0 1 1`}
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <div className="mt-3 text-body-strong text-text">{c.name}</div>
            <div className="font-mono text-caption-small text-accent-blue">{c.token}</div>
            <div className="font-mono text-caption-small text-text-mute">{token(c.token)}</div>
            <div className="font-mono text-caption-small text-text-mute">Fluent {c.fluent}</div>
            <p className="mt-2 text-caption text-text-dim">{c.use}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Snippet
          code={`transition: translate 0.25s var(--ease-decelerate);
/* Tailwind: the easings are @theme tokens, so they are utilities too. */
<div className="transition-opacity duration-150 ease-standard" />`}
        />
      </div>

      <h3 className="mt-8 text-body-strong text-text">Durations</h3>
      <p className="mt-1 text-caption text-text-dim">
        Fluent&apos;s ramp runs 50 / 100 / 150 / 200 / 250 / 300 / 400 / 500ms. This library uses
        three of them, because a house with three durations is one nobody has to think about. Size
        and distance pick the value: a small thing moving a short way takes 150ms, a pane crossing
        the viewport takes 300ms.
      </p>
      <div className="mt-3 flex flex-col gap-px overflow-hidden rounded-panel">
        {DURATIONS.map(([ms, fluent, use]) => (
          <div key={ms} className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-surface p-4">
            <span className="w-16 shrink-0 font-mono text-caption text-accent-blue">{ms}</span>
            <span className="w-32 shrink-0 font-mono text-caption-small text-text-mute">
              {fluent}
            </span>
            <span className="min-w-0 flex-1 text-caption text-text-dim">{use}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-body-strong text-text">What the library animates</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card title=".slide-in-left">
          <p className="text-caption text-text-dim">
            250ms on decelerate. The Shell&apos;s side pane entering. Travel is the whole point, so
            it gets the middle duration.
          </p>
        </Card>
        <Card title=".fade-in">
          <p className="text-caption text-text-dim">
            150ms on standard. Menus, tooltips and anything appearing in place. No movement, so it
            takes the fast tier.
          </p>
        </Card>
      </div>

      <Alert tone="warn" title="Reduced motion is handled globally" className="mt-6">
        The base layer collapses every animation, transition and smooth scroll to 0.01ms under{' '}
        <code>prefers-reduced-motion: reduce</code>. Components must not re-implement that check,
        and must not rely on an animation to convey state - the state has to survive the animation
        being switched off.
      </Alert>
    </>
  );
}
