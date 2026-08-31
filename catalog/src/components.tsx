import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Progress,
  Section,
  Select,
  Spinner,
  Tabs,
  Tooltip,
  cx,
} from '@hoobi/design';
import { useContext } from 'react';
import { Demo, Import, Label, Playground, Props, ShellDemoContext, Snippet } from './kit.js';
import posterUrl from './poster.jpg';

export function ButtonPage() {
  return (
    <>
      <Import names="Button" />
      <Playground
        knobs={{
          variant: {
            kind: 'select',
            options: ['primary', 'secondary', 'ghost', 'danger'],
            init: 'primary',
          },
          size: { kind: 'select', options: ['md', 'sm'], init: 'md' },
          disabled: { kind: 'boolean', init: false },
          label: { kind: 'text', init: 'Approve' },
        }}
        render={(v) => (
          <Button
            variant={v.variant as 'primary'}
            size={v.size as 'md'}
            disabled={v.disabled as boolean}
          >
            {v.label as string}
          </Button>
        )}
        code={(v) =>
          `<Button variant="${String(v.variant)}" size="${String(v.size)}"${v.disabled ? ' disabled' : ''}>${String(v.label)}</Button>`
        }
      />
      <Demo
        title="Variants"
        note="Accent is spent on exactly one button per view. Everything else is neutral or semantic."
        code={`<Button variant="primary">Approve</Button>
<Button variant="secondary">Details</Button>
<Button variant="ghost">Dismiss</Button>
<Button variant="danger">Delete file</Button>`}
      >
        <Button variant="primary">Approve</Button>
        <Button variant="secondary">Details</Button>
        <Button variant="ghost">Dismiss</Button>
        <Button variant="danger">Delete file</Button>
      </Demo>

      <Demo
        title="Sizes"
        note="md is the 32px WinUI standard. sm is 28px, for dense toolbars and card actions."
        code={`<Button size="md" variant="primary">Standard 32px</Button>
<Button size="sm" variant="primary">Small 28px</Button>`}
      >
        <Button size="md" variant="primary">
          Standard 32px
        </Button>
        <Button size="sm" variant="primary">
          Small 28px
        </Button>
      </Demo>

      <Demo
        title="Matrix"
        stack
        code={`{(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
  <Button key={v} variant={v} size="sm">{v}</Button>
))}`}
      >
        {(['md', 'sm'] as const).map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            <Label>size={size}</Label>
            {(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
              <Button key={v} variant={v} size={size}>
                {v}
              </Button>
            ))}
          </div>
        ))}
      </Demo>

      <Demo
        title="States"
        note="Tab to a button to see the focus ring: 2px outer, 2px offset, the same everywhere in the library. There is no loading prop; compose a Spinner instead."
        stack
        code={`<Button variant="primary" disabled>Approve</Button>

<Button variant="primary" disabled>
  <Spinner /> Searching
</Button>`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Label>disabled</Label>
          <Button variant="primary" disabled>
            Approve
          </Button>
          <Button variant="secondary" disabled>
            Details
          </Button>
          <Button variant="ghost" disabled>
            Dismiss
          </Button>
          <Button variant="danger" disabled>
            Delete file
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label>loading</Label>
          <Button variant="primary" disabled>
            <Spinner /> Searching
          </Button>
          <Button variant="secondary" disabled>
            <Spinner /> Importing
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label>full width</Label>
          <Button variant="primary" className="w-full">
            Block button
          </Button>
        </div>
      </Demo>

      <Props
        rows={[
          [
            'variant',
            `'primary' | 'secondary' | 'ghost' | 'danger'`,
            `'secondary'`,
            'Visual weight. Use primary once per view.',
          ],
          ['size', `'sm' | 'md'`, `'md'`, '28px or the 32px standard.'],
          ['className', 'string', '', 'Merged after the variant classes, so it wins.'],
          [
            '...rest',
            'ButtonHTMLAttributes<HTMLButtonElement>',
            '',
            'onClick, disabled, type, aria-*.',
          ],
        ]}
      />
    </>
  );
}

const TONES = ['neutral', 'accent', 'success', 'warn', 'danger', 'info'] as const;

export function BadgePage() {
  return (
    <>
      <Import names="Badge" />
      <Playground
        knobs={{
          tone: {
            kind: 'select',
            options: ['neutral', 'accent', 'success', 'warn', 'danger', 'info'],
            init: 'warn',
          },
          dot: { kind: 'boolean', init: true },
          tooltip: { kind: 'text', init: 'Waiting for an admin to approve the plan.' },
          label: { kind: 'text', init: 'awaiting_approval' },
        }}
        render={(v) => (
          <Badge
            tone={v.tone as 'warn'}
            dot={v.dot as boolean}
            tooltip={(v.tooltip as string) || undefined}
          >
            {v.label as string}
          </Badge>
        )}
        code={(v) =>
          `<Badge tone="${String(v.tone)}"${v.dot ? ' dot' : ''}${v.tooltip ? ` tooltip="${String(v.tooltip)}"` : ''}>${String(v.label)}</Badge>`
        }
      />
      <Demo
        title="Tones"
        note="20px tall, chip surface, tone carried by the text colour only."
        code={`{(['neutral', 'accent', 'success', 'warn', 'danger', 'info'] as const).map((t) => (
  <Badge key={t} tone={t}>{t}</Badge>
))}`}
      >
        {TONES.map((t) => (
          <Badge key={t} tone={t}>
            {t}
          </Badge>
        ))}
      </Demo>

      <Demo
        title="With dot"
        note="The dot prop covers the status-dot case, so there is no separate StatusDot component."
        code={`<Badge tone="success" dot>Imported</Badge>
<Badge tone="warn" dot>Queued</Badge>
<Badge tone="danger" dot>Failed</Badge>`}
      >
        {TONES.map((t) => (
          <Badge key={t} tone={t} dot>
            {t}
          </Badge>
        ))}
      </Demo>

      <Demo
        title="In context"
        code={`<Card title="Severance S01E03">
  <Badge tone="warn" dot>Bad quality</Badge>
</Card>`}
      >
        <Card
          title="Severance S01E03"
          actions={
            <Badge tone="warn" dot>
              Bad quality
            </Badge>
          }
        >
          <p className="text-body text-text-dim">Reported 4 minutes ago by hoobi.</p>
        </Card>
      </Demo>

      <Props
        rows={[
          [
            'tone',
            `'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'`,
            `'neutral'`,
            'Text and dot colour.',
          ],
          ['dot', 'boolean', 'false', 'Leading 6px status dot in the tone colour.'],
          [
            'tooltip',
            'string',
            '',
            'Explains the badge on hover and keyboard focus. Also its accessible description.',
          ],
          ['...rest', 'HTMLAttributes<HTMLSpanElement>', '', 'title, aria-*, onClick.'],
        ]}
      />
    </>
  );
}

export function ShellPage() {
  const demo = useContext(ShellDemoContext);
  return (
    <>
      <Import names="Shell" />
      {demo ? (
        <Demo
          title="Try it"
          note="These steer the real Shell around this page: the pane's three presentations, and the mirage behind them."
          code={`<Shell mode="side" collapsible mirage="url(...)" />`}
        >
          <Select
            aria-label="Nav type"
            value={demo.navType}
            onChange={(e) => {
              demo.setNavType(e.target.value as typeof demo.navType);
            }}
          >
            <option value="pinned">nav: side, pinned</option>
            <option value="rail">nav: side, collapsible</option>
            <option value="top">nav: top</option>
          </Select>
          <Select
            aria-label="Mirage source"
            className="w-auto"
            value={demo.mirage}
            onChange={(e) => {
              demo.setMirage(e.target.value as typeof demo.mirage);
            }}
          >
            <option value="off">mirage: off</option>
            <option value="hues">mirage: hues</option>
            <option value="poster">mirage: poster</option>
          </Select>
        </Demo>
      ) : null}
      <p className="text-body text-text-dim">
        The one page chrome, so every Hoobi app lays out the same way: a full-width 48px top bar
        with the brand mark in the top-left column (textura's arrangement) and the panel trigger
        beside the wordmark. In side mode a pane below animates between a 48px icon rail and a 216px
        pane on the Fluent decelerate curve - the mark and the rail icons share one 48px column. In
        top mode the items lie along the bar and groups auto-convert to dropdowns. Below md both
        modes become a slide-in overlay with a scrim, and the trigger swaps to a close cross while
        it is up.
      </p>
      <p className="mt-3 text-body text-text-dim">
        <strong className="text-text">This catalog is the live demo</strong> - the chrome around
        this page is a Shell, and the selector in the top bar switches its presentation live.
        Collapse the side pane and the labels fade out, the active pill stays, each rail icon grows
        a tooltip, and items without an icon fall back to their initial.
      </p>
      <div className="mt-4">
        <Snippet
          code={`<Shell
  brand={<Logo />}                    // ~24px square mark, top-left column
  title="mendarr"
  actions={<ThemePicker />}           // right side of the top bar
  mode="side"                         // or "top": groups become dropdowns
  nav={
    <>
      <Shell.Item as={NavLink} to="/issues" icon={<IssuesIcon />} label="issues" active />
      <Shell.Group label="Admin">
        <Shell.Item as={NavLink} to="/config" icon={<GearIcon />} label="config" />
      </Shell.Group>
    </>
  }
  navFooter={<Shell.User name="hoobi" detail="admin" onClick={openAccount} />}
>
  {routes}
</Shell>`}
        />
      </div>
      <Props
        rows={[
          ['brand', 'ReactNode', '', 'Square mark in the top bar, ~24px.'],
          ['title', 'ReactNode', '', 'Wordmark / app name next to the mark.'],
          ['actions', 'ReactNode', '', 'Right side of the top bar.'],
          ['nav', 'ReactNode', 'required', 'Shell.Item and Shell.Group rows.'],
          ['navFooter', 'ReactNode', '', 'Bottom-docked pane rows (the settings slot).'],
          [
            'collapsed / defaultCollapsed',
            'boolean',
            'false',
            'Controlled / uncontrolled rail state.',
          ],
          [
            'collapsible',
            'boolean',
            'true',
            'false pins the pane expanded on md+ - this catalog does that, since initials alone do not tell 18 pages apart.',
          ],
          ['onCollapseChange', '(collapsed: boolean) => void', '', 'Fires on toggle (md+ only).'],
          [
            'mode',
            `'side' | 'top'`,
            `'side'`,
            'Collapsible pane, or items along the bar with groups as dropdowns.',
          ],
          [
            'subtitle',
            'ReactNode',
            '',
            'Line under the title in the pane header - a version, a tagline.',
          ],
          [
            'divided',
            'boolean',
            'true',
            'Chrome hairlines: under the bar and along the pane edge. false for seamless chrome.',
          ],
          [
            'pageWidth',
            "'default' | 'full'",
            "'default'",
            'The Shell owns the content column: default centres a max-width column that breathes with the pane, full runs fluid. Children need no wrapper.',
          ],
          [
            'mirage',
            'string (CSS image)',
            '',
            'The house material: fixed behind the app, blurred by the layer itself and tinted back towards bg. A low-res poster works - the blur erases resolution. See Foundations > Mirage.',
          ],
          [
            'Shell.Item',
            'as, icon, label, active, href|to...',
            '',
            'One nav row. as swaps the element (router Link). Rail shows the icon or the initial, with the label as a tooltip; top mode renders a chip with an underline.',
          ],
          [
            'Shell.Group',
            'label, children',
            '',
            'Caption over its items; a hairline on the rail; a dropdown in top mode.',
          ],
          [
            'Shell.User',
            'name, detail, avatar, menu, onSignOut, as, onClick',
            '',
            'Bottom-docked identity row, avatar-only on the rail, initials hue-hashed from the name. menu renders as a flyout beside the rail when collapsed and an upward accordion when expanded - on a real button, so no summary focus-ring quirk. onSignOut appends the standard danger sign-out row.',
          ],
        ]}
      />
    </>
  );
}

export function TooltipPage() {
  return (
    <>
      <Import names="Tooltip" />
      <Playground
        knobs={{
          text: { kind: 'text', init: 'Radarr accepted the release and the download is running.' },
          tone: {
            kind: 'select',
            options: ['neutral', 'accent', 'success', 'warn', 'danger', 'info'],
            init: 'info',
          },
        }}
        render={(v) => (
          <Tooltip text={v.text as string}>
            <Badge tone={v.tone as 'info'} dot>
              hover me
            </Badge>
          </Tooltip>
        )}
        code={(v) => `<Tooltip text="${String(v.text)}">
  <Badge tone="${String(v.tone)}" dot>hover me</Badge>
</Tooltip>`}
      />
      <p className="text-body text-text-dim">
        CSS-only: the styles ship a <code className="text-accent-blue">[data-tip]</code> rule, so
        anything carrying that attribute grows a tooltip - no JS, no positioning library. It shows
        instantly on hover and on keyboard focus.
      </p>
      <Demo
        title="Wrap anything"
        note="Hover or Tab to the chip. The wrapper is focusable so keyboard users get the tip too."
        code={`<Tooltip text="Radarr accepted the release and the download is running.">
  <Badge tone="info" dot>grabbing</Badge>
</Tooltip>`}
      >
        <Tooltip text="Radarr accepted the release and the download is running.">
          <Badge tone="info" dot>
            grabbing
          </Badge>
        </Tooltip>
        <Tooltip text="ffprobe saw a 42 minute file where a 105 minute film was expected.">
          <Badge tone="danger" dot>
            runtime mismatch
          </Badge>
        </Tooltip>
      </Demo>

      <Demo
        title="Badge shorthand"
        note="Badge takes a tooltip prop directly - no wrapper element."
        code={`<Badge tone="warn" dot tooltip="Waiting for an admin to approve the plan.">
  awaiting_approval
</Badge>`}
      >
        <Badge tone="warn" dot tooltip="Waiting for an admin to approve the plan.">
          awaiting_approval
        </Badge>
        <Badge
          tone="accent"
          tooltip="Opened automatically by the unfilled-anime scan, not by a person."
        >
          auto
        </Badge>
      </Demo>

      <Props
        rows={[
          ['text', 'string', 'required', 'The tip. Also the accessible description of the anchor.'],
          ['children', 'ReactNode', 'required', 'The anchor the tip is attached to.'],
          ['...rest', 'HTMLAttributes<HTMLSpanElement>', '', 'className, aria-*.'],
        ]}
      />
    </>
  );
}

export function CardPage() {
  return (
    <>
      <Import names="Card" />
      <Playground
        knobs={{
          title: { kind: 'text', init: 'Sonarr' },
          actions: { kind: 'boolean', init: false },
          body: { kind: 'text', init: 'A raised surface, told apart by fill.' },
        }}
        render={(v) => (
          <Card
            title={(v.title as string) || undefined}
            actions={v.actions ? <Button size="sm">Open</Button> : undefined}
            className="w-full"
          >
            <p className="text-body text-text-dim">{v.body as string}</p>
          </Card>
        )}
        code={(v) =>
          `<Card${v.title ? ` title="${String(v.title)}"` : ''}${v.actions ? ' actions={<Button size="sm">Open</Button>}' : ''}>${String(v.body)}</Card>`
        }
      />
      <Demo
        title="Anatomy"
        stack
        code={`<Card>Bare surface, no header.</Card>

<Card title="Sonarr">Titled.</Card>

<Card title="Sonarr" actions={<Button size="sm">Open</Button>}>
  Titled with actions.
</Card>`}
      >
        <Card>
          <p className="text-body text-text-dim">Bare surface, no header.</p>
        </Card>
        <Card title="Sonarr">
          <p className="text-body text-text-dim">
            Title only, rendered at the body-strong step of the ramp.
          </p>
        </Card>
        <Card title="Sonarr" actions={<Button size="sm">Open</Button>}>
          <p className="text-body text-text-dim">
            Header and actions share a baseline and wrap on a narrow viewport.
          </p>
        </Card>
      </Demo>

      <Demo
        title="Grid"
        note="Card carries no width of its own. Lay it out with a grid."
        stack
        code={`<div className="grid gap-3 sm:grid-cols-3">
  <Card title="Queue"><Progress value={64} /></Card>
</div>`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <Card title="Queue">
            <Progress value={64} />
          </Card>
          <Card title="Issues" actions={<Badge tone="danger">3</Badge>}>
            <p className="text-caption text-text-dim">Awaiting approval</p>
          </Card>
          <Card title="Uptime">
            <p className="text-subtitle text-text">99.8%</p>
          </Card>
        </div>
      </Demo>

      <Demo
        title="Sliced"
        note="Segmented information is cut by a 1px hairline of page background, never ruled by a border. The container rounds and clips; each segment is its own fill."
        stack
        code={`<div className="flex flex-col gap-px overflow-hidden rounded-panel">
  <div className="bg-surface-raised p-4">...</div>
  <div className="bg-surface-raised p-4">...</div>
</div>`}
      >
        <div className="flex w-full flex-col gap-px overflow-hidden rounded-panel">
          <div className="bg-surface-raised p-4">
            <p className="text-body-strong text-text">Comms</p>
            <p className="text-caption text-text-dim">Elgato Virtual Audio</p>
          </div>
          <div className="bg-surface-raised p-4">
            <p className="text-caption text-text-mute">Rules</p>
            <p className="mt-1 text-body text-text">Default Devices</p>
          </div>
        </div>
      </Demo>

      <Demo
        title="Toned"
        note="A state tints the whole surface - the WinUI critical-background treatment. The tone lives in the fill, not on a border."
        stack
        code={`<div className="flex flex-col gap-px overflow-hidden rounded-panel">
  <div className="bg-danger/15 p-4">...</div>
  <div className="bg-danger/15 p-4">...</div>
</div>`}
      >
        <div className="flex w-full flex-col gap-px overflow-hidden rounded-panel">
          <div className="bg-danger/15 p-4">
            <p className="text-body-strong text-text">Microphone Mix</p>
            <p className="text-caption text-text-dim">Muted</p>
          </div>
          <div className="bg-danger/15 p-4">
            <p className="text-caption text-text-mute">Rules</p>
            <p className="mt-1 text-body text-text">Default Devices</p>
          </div>
        </div>
      </Demo>

      <Demo
        title="Mirage"
        note="The scoped material: the card's own fill becomes the artwork, blurred and tinted towards surface-raised. Text stays readable; the colour comes along."
        stack
        code={`<Card title="The Odyssey" mirage="url(/poster.jpg)">
  ...
</Card>`}
      >
        <Card title="The Odyssey" mirage={`url(${posterUrl})`} className="w-full">
          <p className="text-body text-text-dim">
            The poster, melted into the card - the issue-card treatment.
          </p>
        </Card>
      </Demo>

      <Props
        rows={[
          ['title', 'ReactNode', '', 'Rendered as an h3 at the body-strong step.'],
          ['actions', 'ReactNode', '', 'Right side of the header, baseline aligned.'],
          [
            'mirage',
            'string (CSS image)',
            '',
            'Scoped mirage: the image becomes the card fill, blurred and tinted. Hand-rolled surfaces get the same via .mirage-scoped and --mirage-image.',
          ],
          ['...rest', 'HTMLAttributes<HTMLDivElement> (minus title)', '', 'id, onClick, aria-*.'],
        ]}
      />
    </>
  );
}

export function AlertPage() {
  return (
    <>
      <Import names="Alert" />
      <Playground
        knobs={{
          tone: { kind: 'select', options: ['info', 'success', 'warn', 'danger'], init: 'info' },
          title: { kind: 'text', init: 'Heads up' },
          body: { kind: 'text', init: 'The whole surface takes the tint.' },
        }}
        render={(v) => (
          <Alert
            tone={v.tone as 'info'}
            title={(v.title as string) || undefined}
            className="w-full"
          >
            {(v.body as string) || null}
          </Alert>
        )}
        code={(v) =>
          `<Alert tone="${String(v.tone)}"${v.title ? ` title="${String(v.title)}"` : ''}>${String(v.body)}</Alert>`
        }
      />
      <Demo
        title="Tones"
        stack
        code={`<Alert tone="info" title="Heads up">Body copy.</Alert>
<Alert tone="success" title="Imported" />
<Alert tone="warn" title="Low seeders" />
<Alert tone="danger" title="Search failed" />`}
      >
        <Alert tone="info" title="Heads up">
          A 15% tint of the whole surface and the title in the tone colour - no border. Body copy
          stays dim so the tone reads as a signal rather than as decoration.
        </Alert>
        <Alert tone="success" title="Imported">
          Severance S01E03 landed at 1080p.
        </Alert>
        <Alert tone="warn" title="Low seeders">
          The only candidate release has 2 seeders.
        </Alert>
        <Alert tone="danger" title="Search failed">
          Sonarr returned 500 on the indexer query.
        </Alert>
      </Demo>

      <Demo
        title="Title only, body only"
        note="danger renders role=alert, every other tone renders role=status."
        stack
        code={`<Alert tone="warn" title="Approval required" />

<Alert tone="info">No title, body only.</Alert>`}
      >
        <Alert tone="warn" title="Approval required" />
        <Alert tone="info">No title, body only.</Alert>
      </Demo>

      <Props
        rows={[
          [
            'tone',
            `'info' | 'success' | 'warn' | 'danger'`,
            `'info'`,
            'Also picks the ARIA role: danger is alert, the rest are status.',
          ],
          ['title', 'ReactNode', '', 'Body-strong line above the children.'],
          ['...rest', 'HTMLAttributes<HTMLDivElement> (minus title)', '', 'id, className, aria-*.'],
        ]}
      />
    </>
  );
}

export function InputPage() {
  const [value, setValue] = useState('Severance');
  return (
    <>
      <Import names="Input" />
      <Playground
        knobs={{
          label: { kind: 'text', init: 'search' },
          placeholder: { kind: 'text', init: 'title, id, action' },
          hint: { kind: 'text', init: '' },
          error: { kind: 'text', init: '' },
        }}
        render={(v) => (
          <Input
            label={(v.label as string) || undefined}
            placeholder={v.placeholder as string}
            hint={(v.hint as string) || undefined}
            error={(v.error as string) || undefined}
            className="w-64"
          />
        )}
        code={(v) =>
          `<Input${v.label ? ` label="${String(v.label)}"` : ''} placeholder="${String(v.placeholder)}"${v.hint ? ` hint="${String(v.hint)}"` : ''}${v.error ? ` error="${String(v.error)}"` : ''} />`
        }
      />
      <Demo
        title="Anatomy"
        note="32px field, label at caption, hint or error below. The label is wired to the input with a generated id when you do not pass one."
        stack
        code={`<Input label="Series" placeholder="Search Sonarr" />

<Input label="Series" hint="Matched against the Sonarr library." />

<Input label="Series" error="No match in Sonarr." defaultValue="Sevrance" />`}
      >
        <Input label="Series" placeholder="Search Sonarr" />
        <Input label="Series" hint="Matched against the Sonarr library." defaultValue="Severance" />
        <Input label="Series" error="No match in Sonarr." defaultValue="Sevrance" />
      </Demo>

      <Demo
        title="States"
        note="Focus is the global 2px ring: the component sets no focus border of its own. Tab into the fields to see it."
        stack
        code={`<Input label="Disabled" disabled defaultValue="Locked" />
<Input label="Read only" readOnly defaultValue="radarr" />`}
      >
        <Input label="Disabled" disabled defaultValue="Locked" />
        <Input label="Read only" readOnly defaultValue="radarr" />
        <Input label="No label" placeholder="Placeholder only" />
      </Demo>

      <Demo
        title="Controlled"
        stack
        code={`const [value, setValue] = useState('Severance');

<Input label="Series" value={value} onChange={(e) => setValue(e.target.value)} />`}
      >
        <Input label="Series" value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="text-caption text-text-mute">
          value: <span className="font-mono text-accent-blue">{value || '(empty)'}</span>
        </p>
      </Demo>

      <Demo
        title="Types"
        note="Any native input type passes straight through."
        stack
        code={`<Input label="Season" type="number" min={1} defaultValue={1} />
<Input label="Reported" type="date" />
<Input label="API key" type="password" />`}
      >
        <Input label="Season" type="number" min={1} defaultValue={1} />
        <Input label="Reported" type="date" />
        <Input label="API key" type="password" defaultValue="hunter2" />
      </Demo>

      <Props
        rows={[
          ['label', 'ReactNode', '', 'Caption-sized label, linked by id.'],
          ['hint', 'ReactNode', '', 'Muted helper line. Hidden while error is set.'],
          ['error', 'ReactNode', '', 'Danger line; also sets the danger border and aria-invalid.'],
          ['className', 'string', '', 'Applied to the wrapper, not the input.'],
          [
            '...rest',
            'InputHTMLAttributes<HTMLInputElement>',
            '',
            'value, onChange, type, disabled.',
          ],
        ]}
      />
    </>
  );
}

export function SelectPage() {
  return (
    <>
      <Import names="Select" />
      <Demo
        title="Anatomy"
        note="A native select, so the option list is the platform's own. 32px to match Input and Button."
        stack
        code={`<Select label="Quality profile" defaultValue="1080p">
  <option value="720p">HD - 720p</option>
  <option value="1080p">HD - 1080p</option>
  <option value="2160p">Ultra HD</option>
</Select>`}
      >
        <Select label="Quality profile" defaultValue="1080p">
          <option value="720p">HD - 720p</option>
          <option value="1080p">HD - 1080p</option>
          <option value="2160p">Ultra HD</option>
        </Select>
        <Select label="Disabled" disabled defaultValue="1080p">
          <option value="1080p">HD - 1080p</option>
        </Select>
        <Select aria-label="No label">
          <option>No label</option>
        </Select>
      </Demo>

      <Demo
        title="Beside an Input"
        note="Both are 32px, so they line up in a row without any alignment work."
        code={`<div className="flex flex-wrap items-end gap-3">
  <Input label="Series" defaultValue="Severance" />
  <Select label="Season"><option>1</option></Select>
  <Button variant="primary">Search</Button>
</div>`}
      >
        <div className="flex w-full flex-wrap items-end gap-3">
          <Input label="Series" defaultValue="Severance" className="flex-1" />
          <Select label="Season" className="w-28">
            <option>1</option>
            <option>2</option>
          </Select>
          <Button variant="primary">Search</Button>
        </div>
      </Demo>

      <Props
        rows={[
          ['label', 'ReactNode', '', 'Caption-sized label, linked by id.'],
          ['className', 'string', '', 'Applied to the wrapper, not the select.'],
          [
            '...rest',
            'SelectHTMLAttributes<HTMLSelectElement>',
            '',
            'value, onChange, disabled, children.',
          ],
        ]}
      />
    </>
  );
}

export function ModalPage() {
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  return (
    <>
      <Import names="Modal" />
      <Demo
        title="Open one"
        note="A native <dialog> with showModal(), so Escape, the focus trap and the inert backdrop come from the platform. Clicking the backdrop closes it."
        code={`const [open, setOpen] = useState(false);

<Button variant="primary" onClick={() => setOpen(true)}>Review plan</Button>

<Modal open={open} onClose={() => setOpen(false)} title="Remediation plan">
  <p>Delete the current file and search for a better release.</p>
  <div className="mt-4 flex justify-end gap-2">
    <Button onClick={() => setOpen(false)}>Reject</Button>
    <Button variant="primary" onClick={() => setOpen(false)}>Approve</Button>
  </div>
</Modal>`}
      >
        <Button variant="primary" onClick={() => setOpen(true)}>
          Review plan
        </Button>
        <Button variant="secondary" onClick={() => setScroll(true)}>
          Long content
        </Button>
      </Demo>

      <Modal open={open} onClose={() => setOpen(false)} title="Remediation plan">
        <p className="text-body text-text-dim">
          Delete the current file for Severance S01E03 and trigger a Sonarr search for a better
          release.
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Reject</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Approve
          </Button>
        </div>
      </Modal>

      <Modal open={scroll} onClose={() => setScroll(false)} title="Sonarr queue">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 text-body text-text-dim"
            >
              <span className="min-w-0 truncate">Episode {i + 1} - 1080p WEB-DL</span>
              <Badge tone={i % 3 === 0 ? 'success' : 'neutral'} dot>
                {i % 3 === 0 ? 'done' : 'queued'}
              </Badge>
            </div>
          ))}
        </div>
      </Modal>

      <Demo
        title="Sizing"
        note="Capped at 38rem wide and 85dvh tall, with the body scrolling and a safe-area pad at the bottom edge. Override the width with className."
        code={`<Modal open={open} onClose={close} title="Wide" className="w-[min(60rem,calc(100vw-1.5rem))]">
  ...
</Modal>`}
      >
        <p className="text-caption text-text-dim">
          Open &quot;Long content&quot; above to see the scroll and the sticky header.
        </p>
      </Demo>

      <Props
        rows={[
          ['open', 'boolean', 'required', 'Drives showModal() / close().'],
          [
            'onClose',
            '() => void',
            'required',
            'Fires on Escape, the close button, and a backdrop click.',
          ],
          ['title', 'ReactNode', '', 'Subtitle-sized h2 in the header.'],
          ['children', 'ReactNode', 'required', 'Scrollable body.'],
          ['className', 'string', '', 'Merged onto the dialog. Keep p-0 for backdrop clicks.'],
        ]}
      />
    </>
  );
}

export function TabsPage() {
  const [tab, setTab] = useState('queue');
  const [many, setMany] = useState('t1');
  return (
    <>
      <Import names="Tabs" />
      <Demo
        title="Controlled"
        note="Tabs owns no state. You hold the value and render the panel yourself."
        stack
        code={`const [tab, setTab] = useState('queue');

<Tabs
  value={tab}
  onChange={setTab}
  items={[
    { id: 'queue', label: 'Queue' },
    { id: 'history', label: 'History' },
    { id: 'issues', label: 'Issues' },
  ]}
/>
{tab === 'queue' ? <QueuePanel /> : null}`}
      >
        <div className="w-full">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'queue', label: 'Queue' },
              { id: 'history', label: 'History' },
              { id: 'issues', label: 'Issues' },
            ]}
          />
          <div className="pt-4 text-body text-text-dim">
            {tab === 'queue' ? '3 downloads in progress.' : null}
            {tab === 'history' ? 'Last import: 4 minutes ago.' : null}
            {tab === 'issues' ? '1 issue awaiting approval.' : null}
          </div>
        </div>
      </Demo>

      <Demo
        title="Labels can be nodes"
        note="label is a ReactNode, so counts and dots go inline."
        stack
        code={`items={[
  { id: 'issues', label: <>Issues <Badge tone="danger">3</Badge></> },
]}`}
      >
        <div className="w-full">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'queue', label: 'Queue' },
              {
                id: 'issues',
                label: (
                  <span className="inline-flex items-center gap-2">
                    Issues <Badge tone="danger">3</Badge>
                  </span>
                ),
              },
              { id: 'history', label: 'History' },
            ]}
          />
        </div>
      </Demo>

      <Demo
        title="Overflow"
        note="The strip scrolls horizontally with the scrollbar hidden, so a long set survives a 360px viewport. Drag it sideways."
        stack
        code={`<Tabs value={value} onChange={setValue} items={manyItems} />`}
      >
        <div className="w-full max-w-sm">
          <Tabs
            value={many}
            onChange={setMany}
            items={Array.from({ length: 9 }, (_, i) => ({
              id: `t${i + 1}`,
              label: `Indexer ${i + 1}`,
            }))}
          />
        </div>
      </Demo>

      <Props
        rows={[
          ['items', 'TabItem[]', 'required', '{ id: string; label: ReactNode }'],
          ['value', 'string', 'required', 'id of the selected tab.'],
          ['onChange', '(id: string) => void', 'required', 'Fired on click.'],
          ['className', 'string', '', 'Merged onto the tablist.'],
        ]}
      />
    </>
  );
}

export function ProgressPage() {
  const [value, setValue] = useState(64);
  return (
    <>
      <Import names="Progress" />
      <Playground
        knobs={{ value: { kind: 'select', options: ['12', '38', '64', '90', '100'], init: '64' } }}
        render={(v) => (
          <div className="w-full">
            <Progress value={Number(v.value)} />
          </div>
        )}
        code={(v) => `<Progress value={${String(v.value)}} />`}
      />
      <Demo
        title="With and without a label"
        note="4px bar, the WinUI ProgressBar height. The track is border, the fill is accent."
        stack
        code={`<Progress value={64} label="Downloading" />

<Progress value={64} />`}
      >
        <Progress value={64} label="Downloading" className="w-full" />
        <Progress value={64} className="w-full" />
      </Demo>

      <Demo
        title="Range"
        note="Clamped to 0-100% and rounded for the readout, so out-of-range values are safe."
        stack
        code={`<Progress value={0} label="Queued" />
<Progress value={37} label="Downloading" />
<Progress value={100} label="Imported" />
<Progress value={3} max={4} label="Episodes" />`}
      >
        <Progress value={0} label="Queued" className="w-full" />
        <Progress value={37} label="Downloading" className="w-full" />
        <Progress value={100} label="Imported" className="w-full" />
        <Progress value={3} max={4} label="Episodes" className="w-full" />
      </Demo>

      <Demo
        title="Animated"
        note="Width transitions over 500ms, and is disabled under prefers-reduced-motion."
        stack
        code={`<Progress value={value} label="Downloading" />`}
      >
        <Progress value={value} label="Downloading" className="w-full" />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setValue((v) => Math.max(0, v - 20))}>
            -20
          </Button>
          <Button size="sm" onClick={() => setValue((v) => Math.min(100, v + 20))}>
            +20
          </Button>
        </div>
      </Demo>

      <Props
        rows={[
          ['value', 'number', 'required', 'Clamped against max.'],
          ['max', 'number', '100', 'Denominator. A max of 0 renders 0%.'],
          ['label', 'ReactNode', '', 'Caption row above the bar, with a % readout.'],
          ['className', 'string', '', 'Applied to the wrapper. Set the width here.'],
        ]}
      />
    </>
  );
}

export function SpinnerPage() {
  return (
    <>
      <Import names="Spinner" />
      <Playground
        knobs={{ size: { kind: 'select', options: ['sm', 'md'], init: 'sm' } }}
        render={(v) => <Spinner size={v.size as 'sm'} />}
        code={(v) => `<Spinner size="${String(v.size)}" />`}
      />
      <Demo
        title="Sizes"
        note="A bordered circle with an accent top arc. 16px and 24px, nothing else."
        code={`<Spinner />
<Spinner size="md" />`}
      >
        <Spinner />
        <Spinner size="md" />
      </Demo>

      <Demo
        title="In a button"
        note="There is no loading prop on Button. Compose the two."
        code={`<Button variant="primary" disabled>
  <Spinner /> Searching
</Button>`}
      >
        <Button variant="primary" disabled>
          <Spinner /> Searching
        </Button>
        <Button variant="secondary" disabled>
          <Spinner /> Importing
        </Button>
      </Demo>

      <Props
        rows={[
          ['size', `'sm' | 'md'`, `'sm'`, '16px or 24px.'],
          ['label', 'string', `'Loading'`, 'aria-label on the role=status element.'],
          ['className', 'string', '', 'Merged onto the circle.'],
        ]}
      />
    </>
  );
}

export function SectionPage() {
  return (
    <>
      <Import names="Section" />
      <p className="text-body text-text-dim">
        Every heading on this page is a Section: a title at the top of the ramp, an optional muted
        caption, and an optional actions slot on the same baseline as the title.
      </p>
      <Demo
        title="Default"
        stack
        code={`<Section id="queue" title="Queue">
  <p>Anything.</p>
</Section>`}
      >
        <div className="w-full rounded-panel bg-surface p-4">
          <Section id="queue" title="Queue">
            <p className="text-body text-text-dim">Anything.</p>
          </Section>
        </div>
      </Demo>

      <Demo
        title="Caption and actions"
        stack
        code={`<Section
  id="issues"
  title="Open issues"
  caption="Reported by Seerr, awaiting a plan."
  actions={<Badge tone="danger" dot>3</Badge>}
>
  ...
</Section>`}
      >
        <div className="w-full rounded-panel bg-surface p-4">
          <Section
            id="issues"
            title="Open issues"
            caption="Reported by Seerr, awaiting a plan."
            actions={
              <Badge tone="danger" dot>
                3
              </Badge>
            }
          >
            <p className="text-body text-text-dim">
              The id doubles as the anchor, with scroll-mt-16 already applied.
            </p>
          </Section>
        </div>
      </Demo>

      <Props
        rows={[
          ['id', 'string', 'required', 'Element id and anchor target.'],
          ['title', 'string', 'required', 'Title-sized heading.'],
          ['caption', 'string', '', 'Body line under the title.'],
          ['actions', 'ReactNode', '', 'Right of the title.'],
          ['children', 'ReactNode', 'required', 'Section body.'],
        ]}
      />
    </>
  );
}

export function CxPage() {
  return (
    <>
      <Import names="cx" />
      <p className="text-body text-text-dim">
        Six lines that join truthy class strings. There is no clsx, no tailwind-merge and no
        variant-authoring library in the dependency tree, because this covers every case the
        components have.
      </p>
      <div className="mt-4">
        <Snippet
          code={`export type ClassValue = string | false | null | undefined;

export const cx = (...parts: ClassValue[]): string => parts.filter(Boolean).join(' ');`}
        />
      </div>
      <Demo
        title="Usage"
        note="Later classes win in the source order Tailwind emits, so put the caller's className last."
        stack
        code={`<div className={cx('rounded-panel bg-surface', active && 'bg-surface-raised', className)} />`}
      >
        <div className={cx('rounded-panel bg-surface p-4 text-body text-text')}>
          cx(&apos;rounded-panel bg-surface&apos;, false, &apos;p-4&apos;)
        </div>
      </Demo>
      <Props
        rows={[
          [
            'cx(...parts)',
            '(string | false | null | undefined)[] => string',
            '',
            'Drops falsy entries, joins the rest with a space.',
          ],
        ]}
      />
    </>
  );
}
