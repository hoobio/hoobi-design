import { useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  CodeBlock,
  ConfirmButton,
  DescriptionList,
  Divider,
  Input,
  Menu,
  Modal,
  Progress,
  Section,
  Select,
  Spinner,
  Tabs,
  Timeline,
  Tooltip,
  cx,
} from '@hoobi/design';
import { useContext } from 'react';
import {
  Demo,
  Import,
  Label,
  Playground,
  Props,
  ShellDemoContext,
  Snippet,
  highlight,
} from './kit.js';
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
const TIMELINE_TONES = TONES;
const FACTS = [
  { label: 'status', value: 'awaiting_approval' },
  { label: 'reporter', value: 'hoobi' },
  { label: 'media', value: 'MegaMan: NT Warrior - Season 1' },
  {
    label: 'release',
    value: '[TADA] Rockman EXE (2002 - 2003) Singapore-English Dubbed; 01 - 56',
  },
  { label: 'opened', value: '31 Aug 2026, 14:01' },
];

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
          <Checkbox
            label="bar"
            checked={demo.bar}
            onChange={(e) => {
              demo.setBar(e.target.checked);
            }}
          />
        </Demo>
      ) : null}
      <p className="text-body text-text-dim">
        The one page chrome, so every Hoobi app lays out the same way: a full-width 48px top bar
        with the brand mark in the top-left column and the panel trigger beside the wordmark. In
        side mode a pane below animates between a 48px icon rail and a 216px pane on the Fluent
        decelerate curve - the mark and the rail icons share one 48px column. In top mode the items
        lie along the bar and groups auto-convert to dropdowns. Below md both modes become a
        slide-in overlay with a scrim, and the trigger swaps to a close cross while it is up.
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
      <Demo
        title="bar={false}"
        note="Uncheck bar above to see it on this page. The top bar goes on md+ and the side pane runs the full viewport height, taking a 48px header cell of its own at its top - the same cell, holding the same wordmark and collapse trigger. Below md the bar still renders whatever bar says: it carries the overlay trigger, which is the only nav there is at that width, so actions are unavailable on md+ in this mode."
        stack
        code={`<Shell bar={false} nav={nav} navFooter={<Shell.User ... />}>
  {routes}
</Shell>`}
      >
        <p className="text-caption text-text-dim">
          The content column loses its 40px desktop gap too (md:pt-6 rather than md:pt-10) - with no
          bar above it, that gap reads as a hole rather than as breathing room.
        </p>
      </Demo>
      <Demo
        title="The user menu"
        note="Live in the pane's bottom row - click hoobi. Expanded it grows downward as a distinct raised panel; collapse the pane and the same rows become a flyout beside the rail. The rows are Menu.Item / Label / Divider re-exported as Shell.MenuItem / MenuLabel / MenuDivider, so a consumer's row and the built-in Sign out row are one implementation, and onSignOut appends that danger row for you."
        stack
        code={`<Shell.User
  name="hoobi"
  detail="design.hoobi.io"
  menu={
    <>
      <Shell.MenuLabel>Signed in as hoobi</Shell.MenuLabel>
      <Shell.MenuItem onClick={copyKey}>Copy API key</Shell.MenuItem>
      <Shell.MenuItem
        onClick={relink}
        action={<Button size="sm" variant="ghost" onClick={unlink}>Unlink</Button>}
      >
        user@example.com
      </Shell.MenuItem>
      <Shell.MenuDivider />
    </>
  }
  onSignOut={signOut}
/>`}
      >
        <p className="text-caption text-text-dim">
          A real button, not a details/summary: Chromium paints a summary's focus ring on mouse
          clicks. Outside pointerdown and Escape close it, and the flyout is fixed and placed off
          the row's rect, so the pane's own overflow cannot clip it.
        </p>
      </Demo>
      <Props
        rows={[
          ['brand', 'ReactNode', '', 'Square mark in the top bar, ~24px.'],
          ['title', 'ReactNode', '', 'Wordmark / app name next to the mark.'],
          [
            'actions',
            'ReactNode',
            '',
            'Right side of the top bar. Unavailable on md+ when bar={false} - there is no bar to put them in.',
          ],
          [
            'bar',
            'boolean',
            'true',
            'false drops the top bar on md+ and gives the pane the full viewport height with the pane header cell at its own top. Below md the bar always renders, and mode="top" ignores it outright - there the bar IS the nav.',
          ],
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
            'Shell.MenuItem / MenuLabel / MenuDivider',
            'icon, tone, action, ...button props',
            '',
            'The same rows as Menu.Item / Label / Divider, for composing into the Shell.User menu. The built-in Sign out row is one of them, so a consumer row and the library row are one implementation.',
          ],
          [
            'Shell.User',
            'name, detail, avatar, menu, onSignOut, as, onClick',
            '',
            'Bottom-docked identity row, avatar-only on the rail, initials hue-hashed from the name. menu renders as a flyout beside the rail when collapsed and a downward expander when expanded - a distinct raised panel either way, on a real button, so no summary focus-ring quirk. onSignOut appends the standard danger sign-out row.',
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
        The styles ship a <code className="text-accent-blue">[data-tip]</code> rule, so anything
        carrying that attribute grows a tooltip, shown instantly on hover and on keyboard focus.
        Tooltip and Badge place theirs <em>fixed</em>, off the anchor's own rect, because an
        absolutely positioned tip is cut off by any scrolling or clipping ancestor - a page shell's
        main column, a card that rounds by clipping. Still no positioning library: two lines of
        measurement in <code className="text-accent-blue">tipAnchor</code>, and CSS does the rest.
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
        title="padded={false}"
        note="For content that bleeds its own hairlines - a DescriptionList, a full-width list. The body runs flush to the edges so those hairlines actually reach them, and the title becomes its own section above one."
        stack
        code={`<Card padded={false} title="facts">
  <DescriptionList items={facts} />
</Card>`}
      >
        <Card padded={false} title="facts" className="w-full max-w-[28rem]">
          <DescriptionList
            items={[
              { label: 'status', value: 'awaiting_approval' },
              { label: 'reporter', value: 'hoobi' },
              { label: 'media', value: 'MegaMan: NT Warrior - Season 1' },
            ]}
            className="py-2"
          />
        </Card>
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

const CODE_SAMPLES: { language: string; label: string; code: string }[] = [
  {
    language: 'json',
    label: 'json',
    code: `{
  "seerr": { "baseUrl": "http://seerr:5057", "resolved": true },
  "retries": 3,
  "bazarr": null
}`,
  },
  {
    language: 'typescript',
    label: 'typescript',
    code: `export async function remediate(issue: SeerrIssue): Promise<Plan> {
  // believe the reporter, not the label
  const plan = await agent.plan(issue);
  return plan.risky ? approve(plan) : execute(plan);
}`,
  },
  {
    language: 'bash',
    label: 'bash',
    code: `# publish flows through the v* tag
npm version minor && git push --follow-tags`,
  },
  {
    language: 'yaml',
    label: 'yaml',
    code: `trigger:
  tags:
    include: [v*]
steps:
  - script: npm publish`,
  },
];

export function CodeBlockPage() {
  return (
    <>
      <Import names="CodeBlock" />
      <p className="text-body text-text-dim">
        The house code surface, bring-your-own-engine: the library ships the chrome and a stylesheet
        mapping standard highlight.js token classes onto the theme tokens - which ARE the Ayu Mirage
        syntax scheme - and stays dependency-free. Install{' '}
        <code className="text-accent-blue">highlight.js</code> in the app, register only the
        grammars it needs, and pass the highlighted markup in. Without{' '}
        <code className="text-accent-blue">html</code> the code renders as plain text.
      </p>
      <div className="mt-4">
        <Snippet
          code={`import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);

<CodeBlock code={src} html={hljs.highlight(src, { language: 'json' }).value} />`}
        />
      </div>
      {CODE_SAMPLES.map((sample) => (
        <Demo
          key={sample.language}
          title={sample.label}
          code={`hljs.registerLanguage('${sample.language}', ${sample.language});
<CodeBlock code={src} html={hljs.highlight(src, { language: '${sample.language}' }).value} />`}
          stack
        >
          <CodeBlock
            code={sample.code}
            html={highlight(sample.code, sample.language)}
            className="w-full"
          />
        </Demo>
      ))}
      <Props
        rows={[
          ['code', 'string', 'required', 'The source; rendered as plain text when html is absent.'],
          [
            'html',
            'string',
            '',
            'Pre-highlighted markup from a trusted engine - hljs.highlight(...).value. hljs escapes its input; never pass user-authored markup.',
          ],
          ['...rest', 'HTMLAttributes<HTMLPreElement>', '', 'className, id, aria-*.'],
        ]}
      />
    </>
  );
}

export function BreadcrumbsPage() {
  return (
    <>
      <Import names="Breadcrumbs" />
      <Demo
        title="Default"
        note="The last item is the current page: never a link whatever as says, so its href is dropped rather than rendered inert."
        code={`<Breadcrumbs
  items={[
    { label: 'issues', as: 'a', href: '/issues' },
    { label: 'open', as: 'a', href: '/issues?status=open' },
    { label: 'Severance S01E03' },
  ]}
/>`}
      >
        <Breadcrumbs
          items={[
            { label: 'issues', as: 'a', href: '#breadcrumbs' },
            { label: 'open', as: 'a', href: '#breadcrumbs' },
            { label: 'Severance S01E03' },
          ]}
        />
      </Demo>

      <Demo
        title="Custom separator"
        note="Any node. The default is the Fluent 12px chevron in text-mute."
        code={`<Breadcrumbs separator="/" items={items} />`}
      >
        <Breadcrumbs
          separator="/"
          items={[
            { label: 'radarr', as: 'a', href: '#breadcrumbs' },
            { label: 'The Odyssey (2026)' },
          ]}
        />
      </Demo>

      <Demo
        title="One item"
        note="A single item is just the current page - no separator, no link."
        code={`<Breadcrumbs items={[{ label: 'config' }]} />`}
      >
        <Breadcrumbs items={[{ label: 'config' }]} />
      </Demo>

      <Demo
        title="At 360px"
        note="The last item truncates and the earlier ones hold their width; the strip scrolls rather than wrapping to a second line."
        stack
        code={`<Breadcrumbs items={items} />   // inside a 360px column`}
      >
        <div className="w-[360px] max-w-full rounded-panel bg-bg p-3">
          <Breadcrumbs
            items={[
              { label: 'issues', as: 'a', href: '#breadcrumbs' },
              { label: 'open', as: 'a', href: '#breadcrumbs' },
              { label: 'Rockman.EXE: The Program of Light and Darkness' },
            ]}
          />
        </div>
      </Demo>

      <Props
        rows={[
          [
            'items',
            'BreadcrumbItem[]',
            'required',
            'label, an optional as, and anything else (href, to, onClick) spread onto the element.',
          ],
          ['separator', 'ReactNode', 'Fluent chevron', 'Rendered between items, aria-hidden.'],
          ['className', 'string', '', 'On the nav element.'],
          [
            'BreadcrumbItem.as',
            'ElementType',
            `'span'`,
            'The element for that crumb - pass a router Link for SPA nav. Ignored on the last item, which is the current page.',
          ],
        ]}
      />
    </>
  );
}

/** A one-off on the 20px Fluent grid at 1.5px, so the icon prop has something honest to show. */
function KeyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="none">
      <circle cx="7" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.25 10H17M14.5 10v2.5M16.5 10v1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuPage() {
  return (
    <>
      <Import names="Menu" />
      <Playground
        knobs={{
          variant: {
            kind: 'select',
            options: ['secondary', 'primary', 'ghost', 'danger'],
            init: 'secondary',
          },
          size: { kind: 'select', options: ['md', 'sm'], init: 'md' },
          align: { kind: 'select', options: ['start', 'end'], init: 'start' },
          disabled: { kind: 'boolean', init: false },
          label: { kind: 'text', init: 'Bulk actions' },
        }}
        render={(v) => (
          <Menu
            variant={v.variant as 'secondary'}
            size={v.size as 'md'}
            align={v.align as 'start'}
            disabled={v.disabled as boolean}
            label={v.label as string}
          >
            <Menu.Item onClick={() => undefined}>Approve selected</Menu.Item>
            <Menu.Item onClick={() => undefined}>Reanalyze selected</Menu.Item>
            <Menu.Divider />
            <Menu.Item tone="danger" onClick={() => undefined}>
              Reject selected
            </Menu.Item>
          </Menu>
        )}
        code={(v) =>
          `<Menu label="${String(v.label)}" variant="${String(v.variant)}" size="${String(v.size)}" align="${String(v.align)}"${v.disabled ? ' disabled' : ''}>
  <Menu.Item onClick={approve}>Approve selected</Menu.Item>
  <Menu.Item onClick={reanalyze}>Reanalyze selected</Menu.Item>
  <Menu.Divider />
  <Menu.Item tone="danger" onClick={reject}>Reject selected</Menu.Item>
</Menu>`
        }
      />

      <Demo
        title="The row set"
        note="Label, item, divider and a trailing action - so a menu never needs a consumer to hand-roll a row at a different indent than the ones beside it. Selecting a row closes the menu; the action is its own control and does not."
        code={`<Menu label="Account">
  <Menu.Label>Signed in as hoobi</Menu.Label>
  <Menu.Item icon={<KeyIcon />} onClick={copyKey}>Copy API key</Menu.Item>
  <Menu.Item
    onClick={link}
    action={<Button size="sm" variant="ghost" onClick={unlink}>Unlink</Button>}
  >
    user@example.com
  </Menu.Item>
  <Menu.Divider />
  <Menu.Item tone="danger" onClick={signOut}>Sign out</Menu.Item>
</Menu>`}
      >
        <Menu label="Account">
          <Menu.Label>Signed in as hoobi</Menu.Label>
          <Menu.Item icon={<KeyIcon />} onClick={() => undefined}>
            Copy API key
          </Menu.Item>
          <Menu.Item
            onClick={() => undefined}
            action={
              <Button size="sm" variant="ghost" onClick={() => undefined}>
                Unlink
              </Button>
            }
          >
            user@example.com
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item tone="danger" onClick={() => undefined}>
            Sign out
          </Menu.Item>
        </Menu>
      </Demo>

      <Demo
        title="Alignment"
        note="The panel is fixed and placed off the trigger's rect when it opens, so no scroll-container ancestor can clip it. align='end' hangs it off the trigger's right edge - what a menu at the end of a toolbar wants."
        code={`<Menu label="More" align="end" variant="ghost">...</Menu>`}
      >
        <Menu label="More" align="end" variant="ghost">
          <Menu.Item onClick={() => undefined}>Export</Menu.Item>
          <Menu.Item onClick={() => undefined}>Refresh</Menu.Item>
        </Menu>
      </Demo>

      <Props
        rows={[
          [
            'label',
            'ReactNode',
            'required',
            "The trigger's content. A chevron is appended and rotates when open.",
          ],
          [
            'variant',
            `'primary' | 'secondary' | 'ghost' | 'danger'`,
            `'secondary'`,
            'Trigger styling, straight through to Button.',
          ],
          ['size', `'sm' | 'md'`, `'md'`, 'Trigger height, straight through to Button.'],
          [
            'align',
            `'start' | 'end'`,
            `'start'`,
            "Which of the panel's edges lines up with the trigger's.",
          ],
          ['disabled', 'boolean', 'false', 'Disables the trigger.'],
          ['children', 'ReactNode', 'required', 'Menu.Item / Menu.Label / Menu.Divider rows.'],
          [
            'Menu.Item',
            'icon, tone, action, ...button props',
            '',
            '40px row. tone="danger" for a destructive one. Selecting it closes the menu.',
          ],
          [
            'Menu.Item action',
            'ReactNode',
            '',
            'Trailing control, right-aligned. Its own button, so its clicks never reach the row.',
          ],
          [
            'Menu.Label',
            'children, className',
            '',
            'Group caption on the same 12px rhythm as the rows.',
          ],
          [
            'Menu.Divider',
            'className',
            '',
            'House hairline: 1px of page background, never a border colour.',
          ],
        ]}
      />
    </>
  );
}

export function CheckboxPage() {
  const [checked, setChecked] = useState(true);
  return (
    <>
      <Import names="Checkbox" />
      <Playground
        knobs={{
          label: { kind: 'text', init: 'Whole season' },
          indeterminate: { kind: 'boolean', init: false },
          disabled: { kind: 'boolean', init: false },
        }}
        render={(v) => (
          <Checkbox
            label={(v.label as string) || undefined}
            aria-label={(v.label as string) || 'Whole season'}
            indeterminate={v.indeterminate as boolean}
            disabled={v.disabled as boolean}
            defaultChecked
          />
        )}
        code={(v) =>
          `<Checkbox label="${String(v.label)}"${v.indeterminate ? ' indeterminate' : ''}${v.disabled ? ' disabled' : ''} checked={value} onChange={onChange} />`
        }
      />

      <Demo
        title="States"
        note="A native input type=checkbox given the house look, not a re-implementation: the label association, the space key and the global focus ring are all still the platform's."
        code={`<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Indeterminate" indeterminate />
<Checkbox label="Disabled" disabled defaultChecked />`}
      >
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Disabled" disabled defaultChecked />
      </Demo>

      <Demo
        title="Controlled"
        note="Standard React: checked plus onChange. indeterminate is not an attribute, so it is set on the DOM node for you."
        stack
        code={`const [checked, setChecked] = useState(true);

<Checkbox
  label="Search the whole season"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>`}
      >
        <Checkbox
          label="Search the whole season"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
          }}
        />
        <p className="text-caption text-text-dim">
          checked is <span className="font-mono text-accent-blue">{String(checked)}</span>
        </p>
      </Demo>

      <Demo
        title="Without a label"
        note="A row-selection box in a table has its label in the row beside it, so pass aria-label instead."
        code={`<Checkbox aria-label="Select issue 1042" />`}
      >
        <Checkbox aria-label="Select issue 1042" />
      </Demo>

      <Props
        rows={[
          ['label', 'ReactNode', '', 'Text beside the box. Without one, pass aria-label.'],
          [
            'indeterminate',
            'boolean',
            'false',
            'The dash state, for a parent box over a partial selection. Set on the DOM node via a ref effect.',
          ],
          [
            '...rest',
            'InputHTMLAttributes<HTMLInputElement> minus type/size',
            '',
            'checked, defaultChecked, onChange, disabled, name, value, aria-*.',
          ],
          [
            'className',
            'string',
            '',
            'On the label wrapper, which is the 44px touch target under a coarse pointer. The painted box stays 20px.',
          ],
        ]}
      />
    </>
  );
}

export function ConfirmButtonPage() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Import names="ConfirmButton" />
      <Demo
        title="Arm, then confirm"
        note="First click arms it: the button turns danger and shows confirmLabel. A second click within the timeout fires onConfirm; otherwise it disarms itself. Press it once and wait to see that."
        stack
        code={`<ConfirmButton onConfirm={deleteFile}>Delete file</ConfirmButton>`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <ConfirmButton
            onConfirm={() => {
              setCount((n) => n + 1);
            }}
          >
            Delete file
          </ConfirmButton>
          <span className="text-caption text-text-dim">
            confirmed <span className="font-mono text-accent-blue">{count}</span> times
          </span>
        </div>
      </Demo>

      <Demo
        title="Labels and timing"
        note="The armed label defaults to 'Confirm' plus the children when they are a string. Override it when that reads badly, and shorten the timeout for something cheap to redo."
        code={`<ConfirmButton confirmLabel="Yes, revert" timeout={8000} onConfirm={revert}>
  Revert
</ConfirmButton>
<ConfirmButton variant="ghost" timeout={2000} onConfirm={clear}>Clear</ConfirmButton>
<ConfirmButton size="sm" onConfirm={blocklist}>Blocklist</ConfirmButton>`}
      >
        <ConfirmButton confirmLabel="Yes, revert" timeout={8000} onConfirm={() => undefined}>
          Revert
        </ConfirmButton>
        <ConfirmButton variant="ghost" timeout={2000} onConfirm={() => undefined}>
          Clear
        </ConfirmButton>
        <ConfirmButton size="sm" onConfirm={() => undefined}>
          Blocklist
        </ConfirmButton>
      </Demo>

      <Props
        rows={[
          ['onConfirm', '() => void', 'required', 'Fires on the second click, which also disarms.'],
          [
            'variant',
            `'primary' | 'secondary' | 'ghost' | 'danger'`,
            `'secondary'`,
            'The resting variant. Armed is always danger.',
          ],
          [
            'confirmLabel',
            'ReactNode',
            `'Confirm ' + children`,
            'The armed label. Falls back to plain Confirm when the children are not a string.',
          ],
          [
            'timeout',
            'number',
            '4000',
            'ms before it disarms itself. The timer is cleared on confirm and on unmount.',
          ],
          ['...rest', 'ButtonProps minus onClick', '', 'size, disabled, className, aria-*.'],
        ]}
      />
    </>
  );
}

export function TimelinePage() {
  return (
    <>
      <Import names="Timeline" />
      <Demo
        title="Default"
        note="The rail is one of the border exceptions the design rules allow. Tone carries the outcome; time is dense metadata in mono, head takes badges or labels beside it."
        stack
        code={`<Timeline>
  <Timeline.Item tone="accent" time="14:02:11" head={<Badge tone="accent">plan</Badge>}>
    Replace with <strong>[TADA] Rockman EXE - 01-56</strong>
  </Timeline.Item>
  <Timeline.Item tone="success" time="14:04:47" head={<Badge tone="success" dot>imported</Badge>}>
    56 episodes mapped through Override and Grab.
  </Timeline.Item>
</Timeline>`}
      >
        <Timeline className="w-full">
          <Timeline.Item tone="info" time="14:01:03" head={<Badge tone="info">webhook</Badge>}>
            Issue 1042 opened by hoobi: wrong audio track.
          </Timeline.Item>
          <Timeline.Item tone="accent" time="14:02:11" head={<Badge tone="accent">plan</Badge>}>
            Replace with <strong className="text-text">[TADA] Rockman EXE - 01-56</strong>.
          </Timeline.Item>
          <Timeline.Item
            tone="warn"
            time="14:02:40"
            head={
              <Badge tone="warn" dot>
                awaiting approval
              </Badge>
            }
          >
            Reporter is not the requester, so it waits.
          </Timeline.Item>
          <Timeline.Item
            tone="success"
            time="14:04:47"
            head={
              <Badge tone="success" dot>
                imported
              </Badge>
            }
          >
            56 episodes mapped through Override and Grab.
          </Timeline.Item>
        </Timeline>
      </Demo>

      <Demo
        title="Tones"
        note="Neutral is the border colour - the resting rail. The rest are the semantic set, same six as Badge."
        stack
        code={`{(['neutral', 'accent', 'success', 'warn', 'danger', 'info'] as const).map((t) => (
  <Timeline.Item key={t} tone={t} time="00:00:00">{t}</Timeline.Item>
))}`}
      >
        <Timeline className="w-full">
          {TIMELINE_TONES.map((t) => (
            <Timeline.Item key={t} tone={t} time="00:00:00">
              {t}
            </Timeline.Item>
          ))}
        </Timeline>
      </Demo>

      <Demo
        title="Content only"
        note="Both time and head are optional; with neither, the head row is not rendered at all."
        stack
        code={`<Timeline>
  <Timeline.Item>Blocklisted the previous release.</Timeline.Item>
  <Timeline.Item>Deleted 1 file (4.4 GB).</Timeline.Item>
</Timeline>`}
      >
        <Timeline className="w-full">
          <Timeline.Item>Blocklisted the previous release.</Timeline.Item>
          <Timeline.Item>Deleted 1 file (4.4 GB).</Timeline.Item>
        </Timeline>
      </Demo>

      <Props
        rows={[
          ['children', 'ReactNode', 'required', 'Timeline.Item rows. The list is a real ol.'],
          [
            'Timeline.Item tone',
            `'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'`,
            `'neutral'`,
            "The 2px rail's colour.",
          ],
          [
            'Timeline.Item time',
            'ReactNode',
            '',
            'Dense metadata on the head row - a timestamp, in mono caption.',
          ],
          [
            'Timeline.Item head',
            'ReactNode',
            '',
            'Badges or labels beside the time. The row stacks below sm and is one baseline-aligned row from sm up.',
          ],
          ['className', 'string', '', 'On the ol, and on each li.'],
        ]}
      />
    </>
  );
}

export function DividerPage() {
  return (
    <>
      <Import names="Divider" />
      <p className="text-body text-text-dim">
        A slice, not a rule you draw: 1px of page background cutting a surface in two. It bleeds to
        the surface's edges by cancelling whatever padding its container published as{' '}
        <code className="text-accent-blue">--pad</code>, which a Card does for free - so a hairline
        inside a padded card reaches the edges without anyone passing it a magic inset.
      </p>

      <Demo
        title="Inside a Card"
        note="The default. The card pads its content by 16px and the rule undoes exactly that, so it lands edge to edge."
        stack
        code={`<Card title="plan">
  <p>...</p>
  <Divider />
  <p>...</p>
</Card>`}
      >
        <Card title="plan" className="w-full max-w-[32rem]">
          <p className="text-body">Replace the current file with the English-dubbed release.</p>
          <Divider className="my-3" />
          <p className="text-caption text-text-dim">
            The release is a partial season, which matches what is on disk.
          </p>
        </Card>
      </Demo>

      <Demo
        title="padded"
        note="Opts out, for a rule that should sit inside the padding rather than cut the whole surface. Rare - reach for it only when the two sides are not really separate sections."
        stack
        code={`<Divider padded />`}
      >
        <Card title="plan" className="w-full max-w-[32rem]">
          <p className="text-body">Replace the current file.</p>
          <Divider padded className="my-3" />
          <p className="text-caption text-text-dim">The release is a partial season.</p>
        </Card>
      </Demo>

      <Props
        rows={[
          [
            'padded',
            'boolean',
            'false',
            'Insets the rule to the container padding instead of bleeding to its edges.',
          ],
          [
            'className',
            'string',
            '-',
            'Spacing lives here - the rule ships none, so my-3 or my-4 is yours to pick.',
          ],
          ['... rest', 'HTMLAttributes<HTMLHRElement>', '-', 'It is a real hr.'],
        ]}
      />
    </>
  );
}

export function DescriptionListPage() {
  return (
    <>
      <Import names="DescriptionList" />
      <Demo
        title="Stacked"
        note="The default: label above value, rows sliced by a 1px hairline of page background. A real dl / dt / dd, so it reads as facts to a screen reader rather than as a table."
        stack
        code={`<DescriptionList
  items={[
    { label: 'status', value: 'awaiting_approval' },
    { label: 'reporter', value: 'hoobi' },
    { label: 'release', value: '[TADA] Rockman EXE (2002 - 2003) Singapore-English Dubbed; 01 - 56' },
  ]}
/>`}
      >
        <div className="w-full max-w-[28rem] overflow-hidden rounded-panel bg-surface-raised py-2">
          <DescriptionList items={FACTS} />
        </div>
      </Demo>

      <Demo
        title="Inline"
        note="A two-column grid from sm up, stacked below it. Long values wrap rather than pushing the row wide, which is what makes it survive 360px."
        stack
        code={`<DescriptionList layout="inline" items={items} />`}
      >
        <div className="w-full max-w-[36rem] overflow-hidden rounded-panel bg-surface-raised py-2">
          <DescriptionList layout="inline" items={FACTS} />
        </div>
      </Demo>

      <Props
        rows={[
          ['items', 'DescriptionItem[]', 'required', 'label and value pairs, both ReactNode.'],
          [
            'layout',
            `'stack' | 'inline'`,
            `'stack'`,
            'Label above value, or a two-column grid from sm up.',
          ],
          ['className', 'string', '', 'On the dl.'],
        ]}
      />
    </>
  );
}
