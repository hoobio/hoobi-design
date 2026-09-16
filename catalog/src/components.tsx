import { useState } from 'react';
import {
  Alert,
  Badge,
  type BadgeTone,
  Banner,
  BarList,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  ChipInput,
  type Chip,
  CodeBlock,
  ConfirmButton,
  DescriptionList,
  Divider,
  Input,
  Menu,
  Modal,
  MultiSelect,
  Notice,
  PageHeader,
  Persona,
  Popover,
  Progress,
  Rating,
  ReorderGrip,
  ReorderList,
  RichTooltip,
  Section,
  Select,
  Shell,
  Spinner,
  Stat,
  Table,
  type TableSort,
  Tabs,
  TimeAxis,
  Timeline,
  Tooltip,
  cx,
  mirageImage,
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
  useFold,
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
        note="20px tall, chip surface, the text colour alone sets the tone."
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

      <Demo
        title="Text appearance"
        note="No fill, no padding, no chip radius - just tone-coloured text, for a banner headline or a label beside other text. className merges after the tone colour, so a larger type class (text-body-strong) wins."
        code={`<Badge appearance="text" tone="danger" dot>3 issues need approval</Badge>
<Badge appearance="text" tone="success" className="text-body-strong">Imported</Badge>`}
      >
        <Badge appearance="text" tone="danger" dot>
          3 issues need approval
        </Badge>
        <Badge appearance="text" tone="success" className="text-body-strong">
          Imported
        </Badge>
      </Demo>

      <Props
        rows={[
          [
            'tone',
            `'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'`,
            `'neutral'`,
            'Text and dot colour.',
          ],
          [
            'appearance',
            `'chip' | 'text'`,
            `'chip'`,
            "'chip' is the filled pill. 'text' drops the fill/padding/radius for an inline run of tone-coloured text.",
          ],
          ['dot', 'boolean', 'false', 'Leading 6px status dot in the tone colour.'],
          [
            'label',
            'ReactNode',
            '',
            "Text appearance: a mute word before the value - 'confidence high', 'webhook registered'. The pair never loses its space, whatever container it sits in.",
          ],
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

const PERSONA_TONES = ['accent', 'neutral'] as const;

export function PersonaPage() {
  return (
    <>
      <Import names="Persona" />
      <Demo
        title="Tones"
        note="An inline identity chip: the name's first letter in a small circle, then the name. Accent for the current user or the model; neutral for everyone else."
        code={`<Persona name="hoobi" tone="accent" />
<Persona name="mendarr" tone="neutral" />`}
      >
        {PERSONA_TONES.map((t) => (
          <Persona key={t} name={t === 'accent' ? 'hoobi' : 'mendarr'} tone={t} />
        ))}
      </Demo>

      <Demo
        title="In context"
        code={`<div className="flex items-center gap-2">
  <Persona name="hoobi" tone="accent" />
  <span className="text-body text-text-dim">approved the plan</span>
</div>`}
      >
        <div className="flex items-center gap-2">
          <Persona name="hoobi" tone="accent" />
          <span className="text-body text-text-dim">approved the plan</span>
        </div>
      </Demo>

      <Props
        rows={[
          [
            'name',
            'string',
            'required',
            'Shown in full; its first character (uppercased) fills the avatar circle.',
          ],
          [
            'tone',
            `'accent' | 'neutral'`,
            `'neutral'`,
            'accent tints blue for the current user or the model; neutral is everyone else.',
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
          title="Live controls"
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
        Collapse the side pane and the labels fade out, the active pill stays, each rail icon gets a
        tooltip, and items without an icon fall back to their initial.
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
      <Shell.Item as={NavLink} to="/automations" icon={<GearIcon />} label="automations" meta={<Badge tone="info">soon</Badge>} />
      <Shell.Item as={NavLink} to="/settings" icon={<GearIcon />} label="settings">
        <Shell.Item as={NavLink} to="/settings/connections" label="Connections" active />
        <Shell.Item as={NavLink} to="/settings/logs" label="Logs" />
      </Shell.Item>
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
        note="Uncheck bar above to see it on this page. The top bar goes on md+ and the side pane runs the full viewport height, taking a 48px header cell of its own at its top - the same cell, holding the same wordmark and collapse trigger. Below md the bar still renders whatever bar says: it holds the overlay trigger, which is the only nav there is at that width, so actions are unavailable on md+ in this mode."
        stack
        code={`<Shell bar={false} nav={nav} navFooter={<Shell.User ... />}>
  {routes}
</Shell>`}
      >
        <p className="text-caption text-text-dim">
          The content column loses its 40px desktop gap too (md:pt-6 rather than md:pt-10) - without
          the bar above it, that gap looks unintentional.
        </p>
      </Demo>
      <Demo
        title="The user menu"
        note="Every row is the consumer's, composed from Shell.MenuItem / MenuLabel / MenuDivider (Menu's rows, one implementation), so nothing about accounts is baked in. onSignOut alone appends the danger row and the hairline above it, so a menu never needs to end in a divider of its own. Expanded it grows downward as a distinct raised panel; on the rail the same rows become a flyout; below md it opens inside the overlay pane. The pane's own bottom row is the live one, holding the catalog's rows."
        stack
        code={`<Shell.User
  name="hoobi"
  detail="admin"
  menu={
    <>
      <Shell.MenuLabel>linked accounts</Shell.MenuLabel>
      <Shell.MenuItem
        action={<Button size="sm" variant="ghost" onClick={unlink}>unlink</Button>}
      >
        user@example.com
      </Shell.MenuItem>
      <Shell.MenuItem onClick={link}>Link Microsoft account</Shell.MenuItem>
    </>
  }
  onSignOut={signOut}
/>`}
      >
        <div className="w-54 rounded-panel bg-chip p-1">
          <Shell.User
            name="hoobi"
            detail="admin"
            menu={
              <>
                <Shell.MenuLabel>linked accounts</Shell.MenuLabel>
                <Shell.MenuItem
                  action={
                    <Button size="sm" variant="ghost" onClick={() => undefined}>
                      unlink
                    </Button>
                  }
                >
                  user@example.com
                </Shell.MenuItem>
                <Shell.MenuItem onClick={() => undefined}>Link Microsoft account</Shell.MenuItem>
              </>
            }
            onSignOut={() => undefined}
          />
        </div>
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
            'as, icon, label, active, meta, href|to...',
            '',
            'One nav row. as swaps the element (router Link). Rail shows the icon or the initial, with the label as a tooltip; top mode renders a chip with an underline. meta is a right-aligned trailing slot (a Badge, a count), hidden on the collapsed rail like the label.',
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
        with that attribute shows a tooltip, instantly on hover and on keyboard focus. Tooltip and
        Badge place theirs <em>fixed</em>, off the anchor's own rect, because an absolutely
        positioned tip is cut off by any scrolling or clipping ancestor - a page shell's main
        column, a card that rounds by clipping. Still no positioning library: two lines of
        measurement in <code className="text-accent-blue">tipAnchor</code>, and plain CSS places it.
      </p>
      <Demo
        title="Any element as anchor"
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

export function RichTooltipPage() {
  return (
    <>
      <Import names="RichTooltip" />
      <p className="text-body text-text-dim">
        Tooltip holds a string in a CSS attribute, which fits a sentence but not anything with
        structure. RichTooltip is the panel version: a title and a few lines, following the pointer,
        clamped to the viewport and <code className="text-accent-blue">pointer-events: none</code>{' '}
        so it never intercepts the hover that opened it. Words alone still belong on Tooltip.
      </p>
      <Demo
        title="A title and its lines"
        note="Hover or Tab to the chip and move the pointer around: the panel follows and stops at the viewport edge."
        code={`<RichTooltip
  content={
    <>
      <p className="text-body-strong">Restoration Shaman</p>
      <p className="text-text-dim">Hoobi, Dorfmeister, Nyx</p>
    </>
  }
>
  <Badge tone="success" dot>3 signed</Badge>
</RichTooltip>`}
      >
        <RichTooltip
          content={
            <>
              <p className="text-body-strong">Restoration Shaman</p>
              <p className="text-text-dim">Hoobi, Dorfmeister, Nyx</p>
            </>
          }
        >
          <Badge tone="success" dot>
            3 signed
          </Badge>
        </RichTooltip>
        <RichTooltip
          content={
            <>
              <p className="text-body-strong">Mythic Rasz&apos;ageth</p>
              <p className="text-text-dim">Best pull: 4% remaining</p>
              <p className="text-text-dim">14 pulls across two nights</p>
            </>
          }
        >
          <Badge tone="warn" dot>
            progression
          </Badge>
        </RichTooltip>
      </Demo>
      <Props
        rows={[
          [
            'content',
            'ReactNode',
            'required',
            'The panel body: a title and a few lines, not a paragraph.',
          ],
          ['children', 'ReactNode', 'required', 'The anchor. Focusable, so keyboard reaches it.'],
          ['...rest', 'HTMLAttributes<HTMLSpanElement>', '', 'className, aria-*.'],
        ]}
      />
    </>
  );
}

const SWATCH_ROWS: { id: string; name: string; tone: BadgeTone }[] = [
  { id: 'verify', name: 'Verify', tone: 'success' },
  { id: 'import', name: 'Import', tone: 'warn' },
  { id: 'notify', name: 'Notify', tone: 'danger' },
];

function NestedPopoverDemo() {
  const [rows, setRows] = useState(SWATCH_ROWS);
  const [openRow, setOpenRow] = useState<string | null>('verify');
  return (
    <div className="w-full max-w-100 rounded-panel bg-bg p-2" style={{ transform: 'translateZ(0)' }}>
      <ReorderList
        label="Stage colours"
        items={rows}
        itemKey={(r) => r.id}
        itemLabel={(r) => r.name}
        onReorder={setRows}
      >
        {(row, handle) => (
          <div className="flex items-center gap-3 rounded-panel bg-surface px-2 py-2">
            <ReorderGrip {...handle} />
            <span className="min-w-0 flex-1 truncate text-caption text-text">{row.name}</span>
            <Popover
              label={`${row.name} colour`}
              placement="bottom-end"
              open={openRow === row.id}
              onOpenChange={(next) => {
                setOpenRow(next ? row.id : null);
              }}
              trigger={
                <Badge tone={row.tone} dot>
                  {row.tone}
                </Badge>
              }
            >
              <Checkbox label="Success" defaultChecked={row.tone === 'success'} />
              <Checkbox label="Warn" defaultChecked={row.tone === 'warn'} />
              <Checkbox label="Danger" defaultChecked={row.tone === 'danger'} />
            </Popover>
          </div>
        )}
      </ReorderList>
    </div>
  );
}

export function PopoverPage() {
  return (
    <>
      <Import names="Popover" />
      <p className="text-body text-text-dim">
        Menu renders rows; Popover renders arbitrary content - a filter set, a few checkboxes and a
        field, a small form. Placed off the trigger&apos;s own rect in the top layer and re-placed on
        capture-phase scroll, on resize and when its own content changes height, so neither a
        scroll container nor a transformed ancestor can clip it or drag it out of line. It flips to
        the opposite side when the requested one has no room, and closes on Escape and on a pointer
        down outside, returning focus to the trigger.
      </p>
      <Demo
        title="Wrapped trigger"
        note="Pass a node and the popover wraps it in its own bare button."
        code={`<Popover label="Add an origin" trigger={<Badge tone="accent">+ origin</Badge>}>
  <Checkbox label="Example Guild" />
  <Checkbox label="Vanilla crew" />
  <Button variant="primary" size="sm">Add</Button>
</Popover>`}
      >
        <Popover label="Add an origin" trigger={<Badge tone="accent">+ origin</Badge>}>
          <Checkbox label="Example Guild" />
          <Checkbox label="Vanilla crew" />
          <Button variant="primary" size="sm">
            Add
          </Button>
        </Popover>
      </Demo>
      <Demo
        title="Your own trigger"
        note="A render prop hands you ref, onClick and the ARIA wiring to spread onto any control. placement picks the corner it hangs from."
        code={`<Popover
  placement="bottom-end"
  trigger={(props) => (
    <Button variant="secondary" size="sm" {...props}>Columns</Button>
  )}
>
  <Checkbox label="Score" defaultChecked />
  <Checkbox label="Indexer" />
</Popover>`}
      >
        <Popover
          placement="bottom-end"
          trigger={(props) => (
            <Button variant="secondary" size="sm" {...props}>
              Columns
            </Button>
          )}
        >
          <Checkbox label="Score" defaultChecked />
          <Checkbox label="Indexer" />
        </Popover>
      </Demo>
      <Demo
        title="Inside a transformed row"
        note="The panel is raised into the top layer with the native popover API, so an ancestor with a transform, a filter or containment - a ReorderList row mid-slide, a wrapper on its own compositing layer - cannot become its containing block and drag it off-screen or stretch a Modal's scroll area. The first row opens with the page."
        stack
        code={`<div style={{ transform: 'translateZ(0)' }}>
  <ReorderList items={rows} itemKey={(r) => r.id} onReorder={setRows}>
    {(row, handle) => (
      <div className="flex items-center gap-3 rounded-panel bg-surface px-2 py-2">
        <ReorderGrip {...handle} />
        <span className="min-w-0 flex-1 truncate text-caption">{row.name}</span>
        <Popover
          placement="bottom-end"
          open={openRow === row.id}
          onOpenChange={(next) => { setOpenRow(next ? row.id : null); }}
          trigger={<Badge tone={row.tone} dot>{row.tone}</Badge>}
        >
          <Checkbox label="Success" />
          <Checkbox label="Warn" />
          <Checkbox label="Danger" />
        </Popover>
      </div>
    )}
  </ReorderList>
</div>`}
      >
        <NestedPopoverDemo />
      </Demo>
      <Demo
        title="Flip near an edge"
        note="A tall panel on a trigger low in the viewport renders above it instead of below. Scroll this demo towards the bottom of the window and open it: bottom-start becomes top-start, and if neither side holds the panel it takes the roomier one and clamps to an 8px edge gap."
        code={`<Popover
  label="Pick a stage"
  trigger={(props) => (
    <Button variant="secondary" size="sm" {...props}>Stages</Button>
  )}
>
  {STAGES.map((stage) => (
    <Checkbox key={stage.id} label={stage.name} />
  ))}
</Popover>`}
      >
        <Popover
          label="Pick a stage"
          trigger={(props) => (
            <Button variant="secondary" size="sm" {...props}>
              Stages
            </Button>
          )}
        >
          {STAGES.map((stage) => (
            <Checkbox key={stage.id} label={stage.name} />
          ))}
        </Popover>
      </Demo>
      <Props
        rows={[
          [
            'trigger',
            'ReactNode | (props) => ReactNode',
            'required',
            'A node the library wraps in a bare button, or a render prop for your own control.',
          ],
          ['children', 'ReactNode', 'required', 'The panel body.'],
          [
            'open / onOpenChange',
            'boolean / (open) => void',
            'undefined',
            'Controlled: pass both, or neither and the popover holds it.',
          ],
          [
            'placement',
            "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'",
            "'bottom-start'",
            'Which corner it hangs from. Flipped to the opposite side when that one has no room, then clamped to the viewport.',
          ],
          ['label', 'string', 'undefined', 'Names the panel, and the wrapped trigger.'],
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
        note="Card has no width of its own. Lay it out with a grid."
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
        title="tone"
        note="The whole card - not just a strip inside it - takes the tone as a solid fill. warn is a person needed to act, success is a completed fix, danger a failure, info in-progress. Ignored when mirage is also set."
        stack
        code={`<Card tone="warn" title="Awaiting approval">
  A person needs to act.
</Card>
<Card tone="success" title="Landed">
  The fix went through.
</Card>
<Card tone="danger" title="Failed">
  The grab was rejected.
</Card>
<Card tone="info" title="In progress">
  The agent is still working.
</Card>`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Card tone="warn" title="Awaiting approval">
            <p className="text-body text-text-dim">A person needs to act.</p>
          </Card>
          <Card tone="success" title="Landed">
            <p className="text-body text-text-dim">The fix went through.</p>
          </Card>
          <Card tone="danger" title="Failed">
            <p className="text-body text-text-dim">The grab was rejected.</p>
          </Card>
          <Card tone="info" title="In progress">
            <p className="text-body text-text-dim">The agent is still working.</p>
          </Card>
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
          [
            'tone',
            "'info' | 'success' | 'warn' | 'danger'",
            '',
            'Solid tone tint for the whole card fill (bg-{tone}/15). Ignored when mirage is set.',
          ],
          ['...rest', 'HTMLAttributes<HTMLDivElement> (minus title)', '', 'id, onClick, aria-*.'],
        ]}
      />
    </>
  );
}

export function PageHeaderPage() {
  return (
    <>
      <Import names="PageHeader" />
      <Demo
        title="Anatomy"
        note="Crumbs above the title row, a fixed thumb slot, title + meta, right-aligned actions."
        stack
        code={`<PageHeader
  crumbs={<Breadcrumbs items={[{ label: 'issues', as: 'a', href: '#' }, { label: '#4' }]} />}
  thumb={<img src="/poster.jpg" alt="" className="size-full object-cover" />}
  title="Wrong audio track"
  meta="issue #4 · opened by hoobi"
  actions={<Button size="sm">Reanalyze</Button>}
/>`}
      >
        <PageHeader
          className="w-full"
          crumbs={
            <Breadcrumbs items={[{ label: 'issues', as: 'a', href: '#' }, { label: '#4' }]} />
          }
          thumb={<div className="size-full" style={{ backgroundImage: mirageImage() }} />}
          title="Wrong audio track"
          meta="issue #4 · opened by hoobi"
          actions={<Button size="sm">Reanalyze</Button>}
        />
      </Demo>

      <Demo
        title="Mirage"
        note="The report's own poster, as a hero band behind the header - mica confined to the top of the page rather than the whole viewport. mirage-lift keeps the crumbs and meta line readable over it."
        stack
        code={`<PageHeader
  mirage="url(/poster.jpg)"
  title="Wrong audio track"
  meta="issue #4 · opened by hoobi"
/>`}
      >
        <div className="relative isolate w-full overflow-hidden rounded-panel bg-bg p-4">
          <PageHeader
            mirage={mirageImage()}
            title="Wrong audio track"
            meta="issue #4 · opened by hoobi"
            actions={<Button size="sm">Reanalyze</Button>}
          />
        </div>
      </Demo>

      <Props
        rows={[
          [
            'mirage',
            'string (CSS image)',
            '',
            'Renders .mirage-hero as the first child, anchored to the nearest positioned ancestor.',
          ],
          [
            'thumb',
            'ReactNode',
            '',
            'Sized into a fixed 44x66 slot regardless of the child - typically an <img>.',
          ],
          ['title', 'ReactNode', 'required', 'text-subtitle, breaks on long words.'],
          ['meta', 'ReactNode', '', 'A text-caption text-text-dim line under the title.'],
          ['actions', 'ReactNode', '', 'Right-aligned beside the title row.'],
          ['crumbs', 'ReactNode', '', 'A row above the title - a Breadcrumbs trail.'],
          ['...rest', 'HTMLAttributes<HTMLDivElement>', '', 'id, className, aria-*.'],
        ]}
      />
    </>
  );
}

export function BannerPage() {
  return (
    <>
      <Import names="Banner" />
      <Demo
        title="Anatomy"
        note="Headline (the one-look answer) and an optional machine code on the same row, the reasoning as children, dense facts as chips, buttons as actions. Built on Card, so tone tints the whole surface."
        stack
        code={`<Banner
  tone="success"
  headline={<Badge appearance="text" tone="success">Imported</Badge>}
  code="replace_with_release"
  chips={<>
    <span className="text-text-dim">audio <span className="text-text">en, ja</span></span>
    <span className="text-text-dim">quality <span className="text-text">WEBDL-1080p</span></span>
  </>}
  actions={<Button size="sm">Close</Button>}
>
  <p className="text-body text-text-dim">
    [TADA] Rockman EXE - 01-56 landed with English audio, as asked.
  </p>
</Banner>`}
      >
        <Banner
          className="w-full"
          tone="success"
          headline={
            <Badge appearance="text" tone="success">
              Imported
            </Badge>
          }
          code="replace_with_release"
          chips={
            <>
              <span className="text-text-dim">
                audio <span className="text-text">en, ja</span>
              </span>
              <span className="text-text-dim">
                quality <span className="text-text">WEBDL-1080p</span>
              </span>
            </>
          }
          actions={<Button size="sm">Close</Button>}
        >
          <p className="text-body text-text-dim">
            [TADA] Rockman EXE - 01-56 landed with English audio, as asked.
          </p>
        </Banner>
      </Demo>

      <Props
        rows={[
          [
            'tone',
            "'info' | 'success' | 'warn' | 'danger'",
            '',
            'Forwarded to the underlying Card - a solid tint of the whole surface.',
          ],
          [
            'headline',
            'ReactNode',
            'required',
            'The one-look answer - typically a Badge appearance="text".',
          ],
          ['code', 'ReactNode', '', 'A raw machine string, right-aligned on the headline row.'],
          ['children', 'ReactNode', '', 'The body: sentences, quotes.'],
          ['chips', 'ReactNode', '', 'A row of dense facts under the body.'],
          ['actions', 'ReactNode', '', 'A row of buttons under the chips.'],
          ['className', 'string', '', ''],
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
        note="A native select. In Chrome and Edge the option list is styled here too; elsewhere it is the platform's own. 32px to match Input and Button."
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

const CLASS_OPTIONS = [
  { value: 'warrior', label: 'Warrior', iconUrl: posterUrl },
  { value: 'mage', label: 'Mage', iconUrl: posterUrl },
  { value: 'rogue', label: 'Rogue', iconUrl: posterUrl },
  { value: 'priest', label: 'Priest', iconUrl: posterUrl },
];

export function MultiSelectPage() {
  const [classes, setClasses] = useState<string[]>(['mage']);
  return (
    <>
      <Import names="MultiSelect, type MultiSelectOption" />
      <p className="text-body text-text-dim">
        A categorical filter: a Popover trigger showing the count of what is picked, a Checkbox row
        per option, and a Clear row once anything is selected. Built from the primitives.
      </p>
      <Demo
        title="Class filter"
        note="The trigger reads the label until something is picked, then the label plus a count badge."
        code={`const [classes, setClasses] = useState<string[]>(['mage']);

<MultiSelect
  label="Class"
  options={classOptions}
  value={classes}
  onChange={setClasses}
/>`}
      >
        <MultiSelect label="Class" options={CLASS_OPTIONS} value={classes} onChange={setClasses} />
      </Demo>

      <Props
        rows={[
          ['label', 'string', '', 'The trigger text, and the popover panel label.'],
          ['options', 'MultiSelectOption[]', '', 'value, label (a node, so an option can be coloured), optional iconUrl (16px).'],
          ['value', 'string[]', '', 'The selected option values, in any order.'],
          [
            'onChange',
            '(value: string[]) => void',
            '',
            'Called with the new selection, in option order.',
          ],
          ['placeholder', 'string', 'label', 'Trigger text while nothing is selected.'],
          ['className', 'string', '', "Applied to Popover's own root element."],
          ['...rest', 'HTMLAttributes<HTMLDivElement>', '', "Forwarded to Popover's root."],
        ]}
      />
    </>
  );
}

export function ModalPage() {
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [lg, setLg] = useState(false);
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
        note="md is capped at 38rem wide, lg at 54rem, both 85dvh tall with the body scrolling and a safe-area pad at the bottom edge. Override the width with className."
        code={`<Modal open={open} onClose={close} title="Wide" size="lg">
  ...
</Modal>`}
      >
        <p className="text-caption text-text-dim">
          Open &quot;Long content&quot; above to see the scroll and the sticky header.
        </p>
      </Demo>

      <Demo
        title="lg size"
        note="For a modal with more content per row - a wider table, a two-column form."
        code={`<Modal open={open} onClose={close} title="Sonarr queue" size="lg">
  ...
</Modal>`}
      >
        <Button variant="secondary" onClick={() => setLg(true)}>
          Open lg
        </Button>
      </Demo>

      <Modal open={lg} onClose={() => setLg(false)} title="Sonarr queue" size="lg">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
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
          ['size', "'md' | 'lg'", 'md', '38rem wide, or 54rem for lg.'],
          ['className', 'string', '', 'Merged onto the dialog. Keep p-0 for backdrop clicks.'],
        ]}
      />
    </>
  );
}

interface Release {
  title: string;
  score?: number;
  quality: string;
  sizeGb: number;
  indexer: string;
  age: string;
  ok: boolean;
}

const RELEASES: Release[] = [
  {
    title: 'Show.S01E09.1080p.NF.WEB-DL.AAC2.0.H.264-VARYG',
    score: 301,
    quality: 'WEBDL-1080p',
    sizeGb: 1.0,
    indexer: 'DrunkenSlug',
    age: '2 hours',
    ok: true,
  },
  {
    title: '[Erai-raws] Show - 09 [1080p][MultiSub]',
    score: 351,
    quality: 'WEBDL-1080p',
    sizeGb: 1.4,
    indexer: 'NZBFinder',
    age: '5 hours',
    ok: true,
  },
  {
    title: 'Show.S01E09.REPACK.1080p.WEB.MSubs-GROUP',
    score: 1,
    quality: 'WEBDL-1080p',
    sizeGb: 0.9,
    indexer: 'DrunkenSlug',
    age: '3 days',
    ok: false,
  },
  {
    title: '[Judas] Show 09 (720p) [A1B2C3D4]',
    quality: 'HDTV-720p',
    sizeGb: 0.5,
    indexer: 'AnimeBytes',
    age: '11 days',
    ok: true,
  },
];

export function TablePage() {
  const [sort, setSort] = useState<TableSort>({ column: 'score', direction: 'desc' });
  const [selected, setSelected] = useState(new Set<string>());
  return (
    <>
      <Import names="Table" />
      <Demo
        title="Sortable, controlled"
        note="The table applies the sort; you hold it, usually in the URL. Click a header again to flip. A row with no value sinks to the bottom either way. Narrow the window: the same markup stacks into row cards with each column's label above its value."
        stack
        code={`const [sort, setSort] = useState<TableSort>({ column: 'score', direction: 'desc' });

<Table
  rows={releases}
  rowKey={(r) => r.title}
  sort={sort}
  onSortChange={setSort}
  columns={[
    { id: 'title', header: 'release', primary: true, cell: (r) => <span className="font-mono text-caption break-all">{r.title}</span> },
    { id: 'score', header: 'score', align: 'end', defaultDirection: 'desc', sortValue: (r) => r.score, cell: (r) => r.score ?? '-' },
    { id: 'quality', header: 'quality', sortValue: (r) => r.quality, cell: (r) => <Badge>{r.quality}</Badge> },
    { id: 'size', header: 'size', align: 'end', sortValue: (r) => r.sizeGb, cell: (r) => \`\${r.sizeGb.toFixed(1)} GB\` },
  ]}
  rowAction={(r) => <Button size="sm" variant="secondary">Grab</Button>}
/>`}
      >
        <div className="w-full">
          <Table
            label="Release candidates"
            rows={RELEASES}
            rowKey={(r) => r.title}
            sort={sort}
            onSortChange={setSort}
            columns={[
              {
                id: 'title',
                header: 'release',
                primary: true,
                cell: (r) => (
                  <span className="flex flex-col gap-1">
                    <span className="font-mono text-caption break-all">{r.title}</span>
                    <Badge tone={r.ok ? 'success' : 'danger'} dot className="self-start">
                      {r.ok ? 'grabbable' : 'rejected'}
                    </Badge>
                  </span>
                ),
              },
              {
                id: 'score',
                header: 'score',
                align: 'end',
                defaultDirection: 'desc',
                sortValue: (r) => r.score,
                cell: (r) =>
                  r.score === undefined ? '-' : `${r.score > 0 ? '+' : ''}${String(r.score)}`,
              },
              {
                id: 'quality',
                header: 'quality',
                sortValue: (r) => r.quality,
                cell: (r) => <Badge>{r.quality}</Badge>,
              },
              {
                id: 'size',
                header: 'size',
                align: 'end',
                sortValue: (r) => r.sizeGb,
                cell: (r) => `${r.sizeGb.toFixed(1)} GB`,
              },
              {
                id: 'indexer',
                header: 'indexer',
                sortValue: (r) => r.indexer,
                cell: (r) => r.indexer,
              },
            ]}
            rowAction={() => (
              <Button size="sm" variant="secondary">
                Grab
              </Button>
            )}
          />
        </div>
      </Demo>
      <Demo
        title="Progressive columns"
        note="Drag the handle at the bottom right of the surface. Columns with a compact rendering switch to it first, then the lowest priority column drops behind a +N menu, and only once the primary column and the must-show band (priority 100 and up) no longer fit does the table stack into cards. The primary column truncates rather than letting the table scroll sideways. Nothing is lost: the menu names what went, and the cards show every column again."
        stack
        code={`<Table
  rows={releases}
  rowKey={(r) => r.title}
  columns={[
    { id: 'title', header: 'release', primary: true, cell: (r) => r.title },
    { id: 'quality', header: 'quality', priority: 100,
      compactHeader: 'q', compact: (r) => <Badge size="sm">{r.quality.split('-')[1]}</Badge>,
      cell: (r) => <Badge>{r.quality}</Badge> },
    { id: 'size', header: 'size', align: 'end', priority: 50, cell: (r) => \`\${r.sizeGb.toFixed(1)} GB\` },
    { id: 'score', header: 'score', align: 'end', priority: 10, cell: (r) => r.score ?? '-' },
    { id: 'status', header: 'status', priority: 20,
      compactHeader: '', compact: (r) => <Badge size="sm" tone={r.ok ? 'success' : 'danger'} dot />,
      cell: (r) => <Badge tone={r.ok ? 'success' : 'danger'} dot>{r.ok ? 'grabbable' : 'rejected'}</Badge> },
    { id: 'age', header: 'age', priority: 5, cell: (r) => r.age },
    { id: 'indexer', header: 'indexer', cell: (r) => r.indexer },
  ]}
/>`}
      >
        <div className="styled-scrollbar w-full min-w-70 resize-x overflow-auto rounded-panel bg-bg p-2">
          <Table
            label="Release candidates, progressive"
            rows={RELEASES}
            rowKey={(r) => r.title}
            columns={[
              {
                id: 'title',
                header: 'release',
                primary: true,
                cell: (r) => <span className="text-caption break-all">{r.title}</span>,
              },
              {
                id: 'quality',
                header: 'quality',
                priority: 100,
                compactHeader: 'q',
                compact: (r) => <Badge size="sm">{r.quality.split('-')[1]}</Badge>,
                cell: (r) => <Badge>{r.quality}</Badge>,
              },
              {
                id: 'size',
                header: 'size',
                align: 'end',
                priority: 50,
                cell: (r) => `${r.sizeGb.toFixed(1)} GB`,
              },
              {
                id: 'score',
                header: 'score',
                align: 'end',
                priority: 10,
                cell: (r) =>
                  r.score === undefined ? '-' : `${r.score > 0 ? '+' : ''}${String(r.score)}`,
              },
              {
                id: 'status',
                header: 'status',
                priority: 20,
                compactHeader: '',
                compact: (r) => <Badge size="sm" tone={r.ok ? 'success' : 'danger'} dot />,
                cell: (r) => (
                  <Badge tone={r.ok ? 'success' : 'danger'} dot>
                    {r.ok ? 'grabbable' : 'rejected'}
                  </Badge>
                ),
              },
              { id: 'age', header: 'age', priority: 5, cell: (r) => r.age },
              { id: 'indexer', header: 'indexer', cell: (r) => r.indexer },
            ]}
          />
        </div>
      </Demo>
      <Demo
        title="Selection"
        note="Controlled, like the sort: the keys are rowKey values and you hold the Set. The header checkbox covers the rows currently shown and goes indeterminate on a partial selection; it unions those keys in and out, so a row selected under another filter survives. Stacked, the checkbox leads each row card and the select-all moves to a labelled row above them."
        stack
        code={`const [selected, setSelected] = useState(new Set<string>());

<Table
  rows={releases}
  rowKey={(r) => r.title}
  selection={{ selected, onChange: setSelected, label: (r) => \`Select \${r.title}\` }}
  columns={[...]}
/>`}
      >
        <div className="flex w-full flex-col gap-2">
          <Table
            label="Release candidates, selectable"
            rows={RELEASES}
            rowKey={(r) => r.title}
            selection={{
              selected,
              onChange: setSelected,
              label: (r) => `Select ${r.title}`,
            }}
            columns={[
              {
                id: 'title',
                header: 'release',
                primary: true,
                cell: (r) => <span className="text-caption break-all">{r.title}</span>,
              },
              {
                id: 'quality',
                header: 'quality',
                cell: (r) => <Badge>{r.quality}</Badge>,
              },
              {
                id: 'size',
                header: 'size',
                align: 'end',
                cell: (r) => `${r.sizeGb.toFixed(1)} GB`,
              },
            ]}
          />
          <p className="text-caption text-text-dim">
            {selected.size === 0 ? 'Nothing selected' : `${String(selected.size)} selected`}
          </p>
        </div>
      </Demo>
      <Props
        rows={[
          [
            'columns',
            'TableColumn<T>[]',
            '-',
            'id, header, cell; sortValue makes a column sortable; align, valign, primary, defaultDirection, className.',
          ],
          [
            'column.valign',
            "'top' | 'middle'",
            "'middle'",
            'Vertical placement for one column, for a cell whose content should hug the top of a taller row.',
          ],
          [
            'column.priority',
            'number',
            '0',
            'A higher value stays visible longer as the container narrows. 100 and up is the must-show band, never hidden: the table stacks into cards instead. Declaring it on any column turns the measured cascade on; a table with neither priority nor compact wraps and stacks on the @2xl container query as before.',
          ],
          [
            'column.compact / compactHeader',
            '(row: T) => ReactNode / ReactNode',
            'undefined',
            'A narrower rendering - icons where the cell has words - tried before anything is hidden.',
          ],
          [
            'column.hideLabel',
            'boolean',
            'false',
            'Stacked, the cell carries no label: its own control already names it. The header still does wide.',
          ],
          ['rows', 'T[]', '-', 'In stored order. The table sorts a copy for display.'],
          ['rowKey', '(row: T) => string', '-', 'Stable key per row.'],
          [
            'sort',
            'TableSort',
            'undefined',
            'Controlled: { column, direction }. Absent renders stored order.',
          ],
          [
            'onSortChange',
            '(sort: TableSort) => void',
            'undefined',
            'Headers are plain text without it.',
          ],
          [
            'rowAction',
            '(row: T) => ReactNode',
            'undefined',
            'Trailing control: right-aligned wide, below the cells stacked.',
          ],
          [
            'rowValign',
            "(row: T) => 'top' | 'middle' | undefined",
            'undefined',
            "Vertical placement for one row, ahead of any column's own valign. undefined leaves that row to the columns.",
          ],
          [
            'selection',
            '{ selected, onChange, label?, allLabel? }',
            'undefined',
            'Row selection, off when absent. Controlled: the keys are rowKey values, label names one row’s checkbox and allLabel the select-all, which defaults to "Select all".',
          ],
          ['label', 'string', 'undefined', 'aria-label for the table.'],
        ]}
      />
    </>
  );
}

interface Stage {
  id: string;
  name: string;
  tone: BadgeTone;
  runs: string;
}

const STAGES: Stage[] = [
  { id: 'fetch', name: 'Fetch', tone: 'info', runs: '4s' },
  { id: 'verify', name: 'Verify', tone: 'success', runs: '1s' },
  { id: 'import', name: 'Import', tone: 'warn', runs: '12s' },
  { id: 'rename', name: 'Rename', tone: 'neutral', runs: '0s' },
  { id: 'notify', name: 'Notify', tone: 'danger', runs: '2s' },
];

export function ReorderListPage() {
  const [stages, setStages] = useState(STAGES);
  return (
    <>
      <Import names="ReorderList, ReorderGrip" />
      <Demo
        title="Drag the grip, or focus it and press Alt with an arrow key"
        note="The dragged row lifts on the flyout elevation and follows the pointer; its neighbours slide into the slot it left on the decelerate curve. Escape during a drag puts everything back. Alt+Home and Alt+End move to the ends, and each keyboard move is announced on a polite live region. Alt is the gate so a focused handle does not swallow the arrow keys the page scrolls with. You hold the order: onReorder hands back the whole array."
        stack
        code={`const [stages, setStages] = useState(STAGES);

<ReorderList
  label="Pipeline stages"
  items={stages}
  itemKey={(s) => s.id}
  itemLabel={(s) => s.name}
  onReorder={setStages}
>
  {(stage, handle) => (
    <div className="flex items-center gap-3 rounded-panel bg-surface px-2 py-2">
      <ReorderGrip {...handle} />
      <Badge tone={stage.tone} dot>{stage.name}</Badge>
      <span className="ml-auto pr-2 text-caption text-text-mute tabular-nums">{stage.runs}</span>
    </div>
  )}
</ReorderList>`}
      >
        <div className="w-full max-w-100 rounded-panel bg-bg p-2">
          <ReorderList
            label="Pipeline stages"
            items={stages}
            itemKey={(s) => s.id}
            itemLabel={(s) => s.name}
            onReorder={setStages}
          >
            {(stage, handle) => (
              <div className="flex items-center gap-3 rounded-panel bg-surface px-2 py-2">
                <ReorderGrip {...handle} />
                <Badge tone={stage.tone} dot>
                  {stage.name}
                </Badge>
                <span className="ml-auto pr-2 text-caption text-text-mute tabular-nums">
                  {stage.runs}
                </span>
              </div>
            )}
          </ReorderList>
        </div>
      </Demo>
      <Props
        rows={[
          ['items', 'T[]', '-', 'The current order. The list renders it as given and never sorts.'],
          [
            'itemKey',
            '(item: T) => string',
            '-',
            "Stable key per item; it lands on the row's data-key.",
          ],
          [
            'onReorder',
            '(items: T[]) => void',
            '-',
            'The whole array in its new order, fired once the drop animation has finished so nothing flashes.',
          ],
          [
            'children',
            '(item: T, handle: ReorderHandleProps) => ReactNode',
            '-',
            'Renders one row. Spread handle onto the element that starts a drag: a grip, or the row itself.',
          ],
          [
            'itemLabel',
            '(item: T) => string',
            "'Reorder'",
            "Accessible name for a row's handle, and the name the live region announces.",
          ],
          ['label', 'string', 'undefined', 'aria-label for the list.'],
        ]}
      />
    </>
  );
}

export function TimeAxisPage() {
  const from = new Date();
  from.setSeconds(0, 0);
  const to = new Date(from.getTime() + 60 * 60 * 1000);
  const ticks = Array.from({ length: 5 }, (_, i) => new Date(from.getTime() + i * 15 * 60 * 1000));
  const every5min = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ at: new Date(from.getTime() + i * 5 * 60 * 1000) }));

  return (
    <>
      <Import names="TimeAxis" />
      <Demo
        title="A schedule, three jobs and a single firing"
        note="One lane per row, marks positioned by fraction of the window. now draws an accent line; a mark defaults to neutral and can pulse for work in progress."
        stack
        code={`<TimeAxis
  from={from}
  to={to}
  now={new Date()}
  ticks={ticks}
  rows={[
    { id: 'monitor', label: 'monitor', marks: every5min.map((at, i) => ({ at, tone: i === 0 ? 'info' : undefined, pulse: i === 0 })) },
    { id: 'backfill', label: 'backfill', marks: every5min },
    { id: 'watchdog', label: 'watchdog', marks: [...every5min, { tone: 'danger' }] },
    { id: 'scan', label: 'scan', marks: [{ at: nextHour }] },
  ]}
/>`}
      >
        <div className="w-full">
          <TimeAxis
            label="Scheduled jobs"
            from={from}
            to={to}
            now={new Date(from.getTime() + 22 * 60 * 1000)}
            ticks={ticks}
            rows={[
              {
                id: 'monitor',
                label: 'monitor',
                marks: every5min(12).map((m, i) =>
                  i === 0
                    ? { ...m, tone: 'info' as const, pulse: true, tooltip: 'running now' }
                    : m,
                ),
              },
              { id: 'backfill', label: 'backfill', marks: every5min(12) },
              {
                id: 'watchdog',
                label: 'watchdog',
                marks: [
                  ...every5min(12),
                  {
                    at: new Date(from.getTime() + 47 * 60 * 1000),
                    tone: 'danger' as const,
                    tooltip: 'failed',
                  },
                ],
              },
              {
                id: 'scan',
                label: 'scan',
                marks: [{ at: new Date(from.getTime() + 60 * 60 * 1000) }],
              },
            ]}
          />
        </div>
      </Demo>

      <Props
        rows={[
          ['from', 'Date', '', 'Start of the window.'],
          ['to', 'Date', '', 'End of the window.'],
          ['rows', 'TimeAxisRow[]', '', 'One lane each: id, label, marks.'],
          ['now', 'Date', 'undefined', 'A vertical accent line at this instant.'],
          ['ticks', 'Date[]', '[]', 'Labelled gridlines.'],
          [
            'formatTick',
            '(d: Date) => string',
            'HH:mm',
            'Intl.DateTimeFormat hour/minute 2-digit in the viewer’s locale.',
          ],
          ['label', 'string', 'undefined', 'Names the figure for assistive tech.'],
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
        title="Node labels"
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
        note="The strip scrolls horizontally with the scrollbar hidden, so a long set still fits a 360px viewport. Drag it sideways."
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

      <Demo
        title="Tone"
        note="Fill colour only, for when the bar itself should show the state rather than a badge beside it."
        stack
        code={`<Progress value={64} label="Downloading" tone="accent" />
<Progress value={100} label="Imported" tone="success" />
<Progress value={64} label="Paused" tone="warn" />
<Progress value={22} label="Failed" tone="danger" />`}
      >
        <Progress value={64} label="Downloading" tone="accent" className="w-full" />
        <Progress value={100} label="Imported" tone="success" className="w-full" />
        <Progress value={64} label="Paused" tone="warn" className="w-full" />
        <Progress value={22} label="Failed" tone="danger" className="w-full" />
      </Demo>

      <Props
        rows={[
          ['value', 'number', 'required', 'Clamped against max.'],
          ['max', 'number', '100', 'Denominator. A max of 0 renders 0%.'],
          ['label', 'ReactNode', '', 'Caption row above the bar, with a % readout.'],
          ['tone', "'accent' | 'success' | 'warn' | 'danger'", 'accent', 'Fill colour.'],
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
        note="A bordered circle with an accent top arc. 16px and 24px."
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
  // the reporter is the source of truth
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
      <Demo
        title="copy"
        note="A Copy button on the block's own fill, in the top-right; the first line clears it and the rest scrolls under. Falls back to execCommand where the Clipboard API is sandboxed away."
        code={`<CodeBlock code={src} html={html} copy />`}
        stack
      >
        <CodeBlock code={'{ "runTime": "24m", "probed": "24m 03s" }'} copy className="w-full" />
      </Demo>
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
            'copy',
            'boolean',
            'false',
            'A Copy button in the top-right, putting code on the clipboard.',
          ],
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
        title="Two-step confirmation"
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
            confirmed <span className="text-accent-blue tabular-nums">{count}</span> times
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

/** Demo-only: what mendarr renders behind a merged call+result Step. */
function ToolIo({ input, output }: { input: [string, string]; output: [string, string] }) {
  return (
    <div className="flex flex-col gap-1">
      {[
        ['input', ...input],
        ['output', ...output],
      ].map(([name, at, body]) => (
        <div key={name} className="flex flex-col gap-0.5">
          <span className="text-text-mute">
            {name} · {at}
          </span>
          <CodeBlock code={body} copy />
        </div>
      ))}
    </div>
  );
}

export function TimelinePage() {
  // ?open=timeline-run,timeline-probe - the demo's own folds are permalinkable, as the rule says.
  const run = useFold('timeline-run');
  const probe = useFold('timeline-probe');
  const search = useFold('timeline-search');

  return (
    <>
      <Import names="Timeline" />
      <Demo
        title="Default"
        note="The rail is one of the border exceptions the design rules allow. Tone reflects the outcome; time is dense metadata in tabular figures, head takes badges or labels beside it."
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

      <Demo
        title="Plain"
        note="A bare neutral rail with no Timeline.Item chrome - children render as-is, for a feed whose beats already have their own layout."
        stack
        code={`<Timeline plain>
  <p className="text-body text-text">Issue 1042 opened by hoobi.</p>
  <p className="text-body text-text">Reanalyzed after a steer.</p>
</Timeline>`}
      >
        <Timeline plain className="w-full">
          <p className="text-body text-text">Issue 1042 opened by hoobi: wrong audio track.</p>
          <p className="text-body text-text">
            Reanalyzed after a steer: reporter asked for dual audio.
          </p>
        </Timeline>
      </Demo>

      <Demo
        title="Comment"
        note="A said-thing beat - a reporter or mendarr's own comment, set apart from machinery. author is caller-styled (a Persona, a name), the body is the surface fill."
        stack
        code={`<Timeline plain>
  <Timeline.Comment author={<Persona name="hoobi" />} time="14:01:03">
    Wrong audio track - can we get the dub?
  </Timeline.Comment>
  <Timeline.Comment author={<Persona name="mendarr" tone="accent" />} time="14:02:40" emphasis>
    Grabbed [TADA] Rockman EXE - 01-56 with English audio, as asked.
  </Timeline.Comment>
</Timeline>`}
      >
        <Timeline plain className="w-full">
          <Timeline.Comment author={<Persona name="hoobi" />} time="14:01:03">
            Wrong audio track - can we get the dub?
          </Timeline.Comment>
          <Timeline.Comment
            author={<Persona name="mendarr" tone="accent" />}
            time="14:02:40"
            emphasis
          >
            Grabbed [TADA] Rockman EXE - 01-56 with English audio, as asked.
          </Timeline.Comment>
        </Timeline>
      </Demo>

      <Demo
        title="Machinery: Fold, Event, Step"
        note="The comments hold the conversation; everything mendarr did on its own collapses behind a Fold so the feed reads as what was SAID. Opened, it reads forward in one stream: an Event is a dense transition line, a Step is a dense agent-tool line, in the order they happened. A call and its result are one Step - the tool and what came back on the line, the input and output behind its chevron."
        stack
        code={`<Timeline plain>
  <Timeline.Fold summary="2 status changes and 2 agent steps" range="10:50 am - 10:52 am" id="run-1" open={open} onOpenChange={setOpen}>
    <Timeline.Event time="10:50 am" label={<Badge appearance="text" tone="info">analyzing</Badge>} />
    <Timeline.Step
      time="10:50 am"
      kind="tool call"
      label={<><span className="text-accent-cyan">get_media_info()</span> runtimeMismatch: false</>}
      detail={<ToolIo input={['10:50:03 am', '{ "episodeNumber": 1 }']} output={[...]} />}
    />
    <Timeline.Step time="10:51 am" kind="tool call" label={...} detail={...} />
    <Timeline.Event
      time="10:52 am"
      label={<Badge appearance="text" tone="warn">awaiting_approval</Badge>}
      note="reporter is not the requester"
    />
  </Timeline.Fold>
</Timeline>`}
      >
        <Timeline plain className="w-full">
          <Timeline.Fold
            summary="2 status changes and 2 agent steps"
            range="10:50 am – 10:52 am"
            {...run}
          >
            <Timeline.Event
              time="10:50 am"
              label={
                <Badge appearance="text" tone="info">
                  analyzing
                </Badge>
              }
            />
            <Timeline.Step
              {...probe}
              time="10:50 am"
              kind="tool call"
              label={
                <>
                  <span className="text-accent-cyan">get_media_info()</span> runtimeMismatch: false
                </>
              }
              detail={
                <ToolIo
                  input={['10:50:03 am', '{ "episodeNumber": 1 }']}
                  output={['10:50:04 am', '{ "runTime": "24m", "probed": "24m 03s" }']}
                />
              }
            />
            <Timeline.Step
              {...search}
              time="10:51 am"
              kind="tool call"
              label={
                <>
                  <span className="text-accent-cyan">search_releases()</span> 3 candidates
                </>
              }
              detail={
                <ToolIo
                  input={['10:51:10 am', '{ "wholeSeason": true }']}
                  output={[
                    '10:51:31 am',
                    '1. [TADA] Rockman EXE 01-56 (dual audio)NL2. [blkqi] Rockman.EXE S01NL3. Rockman EXE Complete (JP)'.replaceAll(
                      'NL',
                      String.fromCharCode(10),
                    ),
                  ]}
                />
              }
            />
            <Timeline.Event
              time="10:52 am"
              label={
                <Badge appearance="text" tone="warn">
                  awaiting_approval
                </Badge>
              }
              note="reporter is not the requester"
            />
          </Timeline.Fold>
        </Timeline>
      </Demo>

      <Props
        rows={[
          ['children', 'ReactNode', 'required', 'Timeline.Item rows. The list is a real ol.'],
          [
            'plain',
            'boolean',
            'false',
            'A bare neutral rail with no Timeline.Item chrome - children render as-is.',
          ],
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
            'Dense metadata on the head row - a timestamp, in muted caption.',
          ],
          [
            'Timeline.Item head',
            'ReactNode',
            '',
            'Badges or labels beside the time. The row stacks below sm and is one baseline-aligned row from sm up.',
          ],
          ['className', 'string', '', 'On the ol, and on each li.'],
          [
            'Timeline.Comment author',
            'ReactNode',
            'required',
            'Caller-styled - a Persona, a name.',
          ],
          ['Timeline.Comment time', 'string', '', 'Muted caption beside the author.'],
          [
            'Timeline.Comment emphasis',
            'boolean',
            'false',
            "text-text instead of text-dim - mendarr's own word over the reporter's.",
          ],
          [
            'Timeline.Fold summary',
            'ReactNode',
            'required',
            'The collapsed line - a details/summary.',
          ],
          ['Timeline.Fold range', 'string', '', 'e.g. "10:50 am - 11:28 am", beside the summary.'],
          ['Timeline.Fold defaultOpen', 'boolean', 'false', ''],
          [
            'Timeline.Event label',
            'ReactNode',
            'required',
            'e.g. a Badge appearance="text" - the new status.',
          ],
          ['Timeline.Event time', 'string', '', 'First column, tabular figures.'],
          ['Timeline.Event note', 'ReactNode', '', 'Dense caption, wraps to its own row below sm.'],
          [
            'Timeline.Step label',
            'ReactNode',
            'required',
            'Caller colours it; a tool name goes in <code>.',
          ],
          ['Timeline.Step time / kind', 'string', '', "Muted prefix - e.g. 'call' / 'result'."],
          [
            'Timeline.Step detail',
            'ReactNode',
            '',
            'When present, the step line itself becomes the summary of a details - click it to reveal. Absent, the line renders plain (padded to keep marker alignment).',
          ],
          [
            'Timeline.Step children',
            'ReactNode',
            '',
            'Alternative plain-text body under the line.',
          ],
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
        <code className="text-accent-blue">--pad</code>, which a Card already does - so a hairline
        inside a padded card reaches the edges without anyone passing it a magic inset.
      </p>

      <Demo
        title="Inside a Card"
        note="The default. The card pads its content by 16px and the rule undoes exactly that, so it reaches edge to edge."
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
        note="A two-column grid from sm up, stacked below it. Long values wrap rather than pushing the row wide, which is what keeps it usable at 360px."
        stack
        code={`<DescriptionList layout="inline" items={items} />`}
      >
        <div className="w-full max-w-[36rem] overflow-hidden rounded-panel bg-surface-raised py-2">
          <DescriptionList layout="inline" items={FACTS} />
        </div>
      </Demo>

      <Demo
        title="Plain"
        note="Unboxed: no hairlines, no bleed, no padding assumptions - a plain label-over-value stack that drops into any container. layout is ignored when plain."
        stack
        code={`<DescriptionList plain items={items} />`}
      >
        <div className="w-full max-w-[28rem]">
          <DescriptionList plain items={FACTS} />
        </div>
      </Demo>

      <Props
        rows={[
          ['items', 'DescriptionItem[]', 'required', 'label and value pairs, both ReactNode.'],
          [
            'layout',
            `'stack' | 'inline'`,
            `'stack'`,
            'Label above value, or a two-column grid from sm up. Ignored when plain.',
          ],
          [
            'plain',
            'boolean',
            'false',
            'Unboxed label-over-value stack with no hairlines, bleed or padding assumptions.',
          ],
          ['className', 'string', '', 'On the dl.'],
        ]}
      />
    </>
  );
}

const RATERS = ['Sturmwind', 'Bolvar', 'Khadgar'];

export function RatingPage() {
  const [value, setValue] = useState<number | null>(3);
  return (
    <>
      <Import names="Rating" />
      <Playground
        knobs={{
          size: { kind: 'select', options: ['md', 'sm'], init: 'md' },
          max: { kind: 'select', options: ['3', '5', '10'], init: '5' },
          readOnly: { kind: 'boolean', init: false },
        }}
        render={(v) => (
          <Rating
            value={value}
            max={Number(v.max)}
            size={v.size as 'md'}
            readOnly={v.readOnly as boolean}
            label="Raid performance"
            onChange={setValue}
          />
        )}
        code={(v) =>
          `<Rating value={value} onChange={setValue}${v.max === '5' ? '' : ` max={${String(v.max)}}`}${v.size === 'md' ? '' : ' size="sm"'}${v.readOnly ? ' readOnly' : ''} label="Raid performance" />`
        }
      />

      <Demo
        title="Committed against preview"
        note="The committed value is text-warn; hover and keyboard focus preview in text-warn/60, so the tone says which stars are yours and which are the pointer's. pointer-coarse skips the preview - a tap has no hover to leave."
        code={`<Rating value={rating} onChange={setRating} label="Raid performance" />`}
      >
        <Rating value={value} onChange={setValue} label="Raid performance" />
        <span className="text-caption text-text-dim">
          {value === null ? 'Unrated' : `${String(value)} of 5`}
        </span>
      </Demo>

      <Demo
        title="Clearing"
        note="Clicking the star that is already the value sets it back to null. There is no separate clear control, because the row would need one per rating."
        code={`onChange={(next) => { setRating(next); }} // next is null when the current value was clicked`}
      >
        <Rating value={value} onChange={setValue} label="Raid performance" />
      </Demo>

      <Demo
        title="Read only, in a list"
        note="Without onChange the stars are one role=img span: no buttons, no tab stops, and the whole rating is read out as a sentence."
        stack
        code={`{raiders.map((name) => (
  <div key={name}>
    <span>{name}</span>
    <Rating value={ratings[name]} size="sm" readOnly label={name} />
  </div>
))}`}
      >
        {RATERS.map((name, i) => (
          <div key={name} className="flex w-full max-w-[20rem] items-center justify-between">
            <span className="text-body text-text">{name}</span>
            <Rating value={i + 2} size="sm" readOnly label={name} />
          </div>
        ))}
      </Demo>

      <Props
        rows={[
          ['value', 'number | null', 'required', 'The committed rating. null is unrated.'],
          ['max', 'number', '5', 'How many stars.'],
          [
            'onChange',
            '(next: number | null) => void',
            '',
            'Clicking the current value passes null. Omitting it makes the rating read-only.',
          ],
          ['size', `'sm' | 'md'`, `'md'`, 'sm is the in-row marker, md the standalone control.'],
          ['readOnly', 'boolean', 'false', 'Stars only: no buttons, no tab stops.'],
          ['label', 'string', '', 'Names the group for assistive tech.'],
          ['className', 'string', '', 'On the wrapper.'],
        ]}
      />
    </>
  );
}

const PEOPLE: Chip[] = [
  { id: 'u1', label: 'Sturmwind', detail: '@sturm', avatarUrl: posterUrl },
  { id: 'u2', label: 'Bolvar', detail: '@bolvar' },
  { id: 'u3', label: 'Khadgar', detail: '@khad' },
  { id: 'u4', label: 'Jaina', detail: '@jaina' },
  { id: 'u5', label: 'Thrall', detail: '@thrall' },
];

export function ChipInputPage() {
  const [chips, setChips] = useState<Chip[]>([PEOPLE[0] as Chip]);
  return (
    <>
      <Import names="ChipInput, type Chip" />
      <Demo
        title="People filter"
        note="The surface is bg-chip with no border, like every field inside a row. Type to match, Tab or Enter takes the top suggestion (marked with the tab key), Backspace on an empty input removes the last chip, Escape clears the query."
        stack
        code={`const [chips, setChips] = useState<Chip[]>([]);

<ChipInput
  chips={chips}
  onChange={setChips}
  suggestions={(query) =>
    people.filter((p) => p.label.toLowerCase().includes(query.trim().toLowerCase()))
  }
  placeholder="Filter by raider"
/>`}
      >
        <div className="w-full max-w-[26rem]">
          <ChipInput
            chips={chips}
            onChange={setChips}
            suggestions={(query) =>
              PEOPLE.filter((person) =>
                person.label.toLowerCase().includes(query.trim().toLowerCase()),
              )
            }
            placeholder="Filter by raider"
          />
        </div>
      </Demo>

      <Demo
        title="Async suggestions"
        note="The prop returns Chip[] or a promise of them, so a local array and a lookup endpoint are the same call. Stale responses are dropped, and chips already picked never come back as suggestions."
        stack
        code={`<ChipInput
  chips={chips}
  onChange={setChips}
  suggestions={async (query) => (await searchUsers(query)).map(toChip)}
  maxSuggestions={4}
/>`}
      >
        <div className="w-full max-w-[26rem]">
          <ChipInput
            chips={chips}
            onChange={setChips}
            maxSuggestions={4}
            suggestions={(query) =>
              Promise.resolve(
                PEOPLE.filter((person) =>
                  person.label.toLowerCase().includes(query.trim().toLowerCase()),
                ),
              )
            }
            placeholder="Search the roster"
          />
        </div>
      </Demo>

      <Props
        rows={[
          ['chips', 'Chip[]', 'required', '{ id, label, detail?, avatarUrl? } - the picked set.'],
          ['onChange', '(chips: Chip[]) => void', 'required', 'Fires on add and on remove.'],
          [
            'suggestions',
            '(query: string) => Chip[] | Promise<Chip[]>',
            'required',
            'The consumer owns the matching. Already-picked chips are filtered out for you.',
          ],
          ['placeholder', 'string', '', 'Shown only while no chip is picked.'],
          [
            'query',
            'string',
            '',
            'Controlled query, for a box whose leftover text also filters something else.',
          ],
          ['onQueryChange', '(query: string) => void', '', 'Every keystroke, including clears.'],
          ['renderChip', '(chip: Chip) => ReactNode', '', 'Replaces avatar / label / detail.'],
          [
            'renderSuggestion',
            '(chip: Chip) => ReactNode',
            '',
            'Replaces the suggestion row body.',
          ],
          ['maxSuggestions', 'number', '6', 'How many rows the list shows at most.'],
          ['className', 'string', '', 'On the wrapper.'],
        ]}
      />
    </>
  );
}

export function StatPage() {
  return (
    <>
      <Import names="Stat" />
      <Playground
        knobs={{
          tone: {
            kind: 'select',
            options: ['default', 'success', 'warn', 'danger'],
            init: 'default',
          },
          label: { kind: 'text', init: 'Parse average' },
          value: { kind: 'text', init: '84.2' },
          sub: { kind: 'text', init: 'across 12 kills' },
        }}
        render={(v) => (
          <Stat
            tone={v.tone as 'default'}
            label={v.label as string}
            value={v.value as string}
            sub={(v.sub as string) || undefined}
            className="w-56"
          />
        )}
        code={(v) =>
          `<Stat label="${String(v.label)}" value="${String(v.value)}"${v.sub ? ` sub="${String(v.sub)}"` : ''}${v.tone === 'default' ? '' : ` tone="${String(v.tone)}"`} />`
        }
      />

      <Demo
        title="A row of them"
        note="A Card variant, not a new surface: caption label, text-title tabular value, caption-mute sub. The tone colours the number and the icon, never the card."
        stack
        code={`<div className="grid gap-3 sm:grid-cols-3">
  <Stat label="Parse average" value="84.2" sub="across 12 kills" />
  <Stat label="Attendance" value="96%" sub="last 8 weeks" tone="success" />
  <Stat label="Missed raids" value="3" sub="two unexcused" tone="warn" />
</div>`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <Stat label="Parse average" value="84.2" sub="across 12 kills" />
          <Stat label="Attendance" value="96%" sub="last 8 weeks" tone="success" />
          <Stat label="Missed raids" value="3" sub="two unexcused" tone="warn" />
        </div>
      </Demo>

      <Props
        rows={[
          ['label', 'ReactNode', 'required', 'Caption above the number.'],
          [
            'value',
            'ReactNode',
            'required',
            'The number itself, tabular so a row of them lines up.',
          ],
          ['sub', 'ReactNode', '', 'What it is measured against, or where it came from.'],
          [
            'tone',
            `'default' | 'success' | 'warn' | 'danger'`,
            `'default'`,
            'Colours the value and the icon. The card stays surface-raised.',
          ],
          ['icon', 'ReactNode', '', 'A 20px Fluent icon left of the stack.'],
          ['className', 'string', '', 'On the Card.'],
        ]}
      />
    </>
  );
}

export function BarListPage() {
  return (
    <>
      <Import names="BarList" />
      <Demo
        title="Shares of a whole"
        note="Label, an 8px bg-chip track with a toned fill scaled to the largest value, then a right-aligned tabular readout. Not a chart library: one row per thing, no axes, no legend."
        stack
        code={`<Card title="Loot by raider">
  <BarList
    items={[
      { key: 'sturm', label: 'Sturmwind', value: 12, display: '12' },
      { key: 'bolvar', label: 'Bolvar', value: 9, display: '9' },
      { key: 'khad', label: 'Khadgar', value: 4, display: '4' },
    ]}
  />
</Card>`}
      >
        <Card title="Loot by raider" className="w-full max-w-[32rem]">
          <BarList
            items={[
              { key: 'sturm', label: 'Sturmwind', value: 12, display: '12' },
              { key: 'bolvar', label: 'Bolvar', value: 9, display: '9' },
              { key: 'khad', label: 'Khadgar', value: 4, display: '4' },
            ]}
          />
        </Card>
      </Demo>

      <Demo
        title="Tones, avatars and a fixed max"
        note="max pins what a full track means, so two lists beside each other stay comparable. labelWidth aligns the tracks when the labels are long."
        stack
        code={`<BarList
  max={100}
  labelWidth="10rem"
  items={[
    { key: 'a', label: 'Uptime', value: 99, display: '99%', fill: 'success' },
    { key: 'b', label: 'Queue depth', value: 62, display: '62%', fill: 'warn' },
    { key: 'c', label: 'Failed jobs', value: 18, display: '18%', fill: 'danger' },
  ]}
/>`}
      >
        <div className="w-full max-w-[32rem]">
          <BarList
            max={100}
            labelWidth="10rem"
            items={[
              { key: 'a', label: 'Uptime', value: 99, display: '99%', fill: 'success' },
              { key: 'b', label: 'Queue depth', value: 62, display: '62%', fill: 'warn' },
              { key: 'c', label: 'Failed jobs', value: 18, display: '18%', fill: 'danger' },
            ]}
          />
        </div>
      </Demo>

      <Props
        rows={[
          [
            'items',
            'BarListItem[]',
            'required',
            '{ key, label, value, display?, avatarUrl?, fill? } per row.',
          ],
          [
            'max',
            'number',
            'largest value',
            'What a full track means. Pin it to compare two lists.',
          ],
          ['labelWidth', 'string', `'8rem'`, 'Width of the label column, so tracks start level.'],
          ['className', 'string', '', 'On the wrapper.'],
        ]}
      />
    </>
  );
}

const NOTICE_TONES = ['danger', 'success', 'warn', 'info'] as const;
const NOTICE_TITLES: Record<(typeof NOTICE_TONES)[number], string> = {
  danger: 'Disconnected',
  success: 'Reconnected',
  warn: 'Read-only mode',
  info: 'Syncing the roster',
};

export function NoticePage() {
  const [shown, setShown] = useState<'danger' | 'success' | 'warn' | 'info' | null>(null);
  return (
    <>
      <Import names="Notice" />
      <Demo
        title="Persistent state notice"
        note="A Notice shows the state of what is being viewed - a dropped connection, a save that failed on the way out. It stays centred where the eye already is until the state changes, unlike a toast, which can be missed. The page keeps working underneath it."
        stack
        code={`<Notice
  open={connection !== 'live'}
  tone="danger"
  title="Disconnected"
  onDismiss={() => { setDismissed(true); }}
>
  The server may be updating or restarting. This page reconnects on its own.
</Notice>`}
      >
        <Button
          onClick={() => {
            setShown('danger');
          }}
        >
          Drop the connection
        </Button>
        <Notice
          open={shown === 'danger'}
          tone="danger"
          title="Disconnected"
          autoHideMs={4000}
          onDismiss={() => {
            setShown(null);
          }}
        >
          The server may be updating or restarting. This page reconnects on its own.
        </Notice>
      </Demo>

      <Demo
        title="Tones"
        note="An opaque surface-raised base with the library's mirage under a translucent tone wash, no border. danger is a failure, success the fix landing, warn something a person must act on, info work in progress. Only one is up at a time, so these raise the same Notice."
        code={`<Notice open={phase === 'reconnected'} tone="success" title="Reconnected" autoHideMs={3000} />`}
      >
        {NOTICE_TONES.map((tone) => (
          <Button
            key={tone}
            variant="secondary"
            onClick={() => {
              setShown(tone);
            }}
          >
            {tone}
          </Button>
        ))}
        {NOTICE_TONES.filter((tone) => tone !== 'danger').map((tone) => (
          <Notice
            key={tone}
            open={shown === tone}
            tone={tone}
            title={NOTICE_TITLES[tone]}
            autoHideMs={3000}
            onDismiss={() => {
              setShown(null);
            }}
          />
        ))}
      </Demo>

      <Props
        rows={[
          [
            'open',
            'boolean',
            'required',
            'Controlled. The consumer owns the state that raised it.',
          ],
          [
            'tone',
            `'danger' | 'success' | 'warn' | 'info'`,
            'required',
            'Tints the wash over the mirage and colours the icon.',
          ],
          ['title', 'ReactNode', 'required', 'The one-look answer.'],
          ['children', 'ReactNode', '', 'What to do about it, or why it happened.'],
          ['icon', 'ReactNode', '', 'A 20px Fluent icon, toned for you.'],
          [
            'onDismiss',
            '() => void',
            '',
            'Omitted means no close button: the consumer closes it on its own terms.',
          ],
          ['autoHideMs', 'number', '', 'Calls onDismiss after this long. Omitted means it stays.'],
          [
            'placement',
            `'top' | 'center'`,
            `'top'`,
            'Under the app bar, or in the middle of the viewport.',
          ],
          ['className', 'string', '', 'On the fixed wrapper.'],
        ]}
      />
    </>
  );
}
