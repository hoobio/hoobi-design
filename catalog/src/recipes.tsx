import { useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  ConfirmButton,
  DescriptionList,
  Input,
  Section,
  Select,
  Tabs,
  Timeline,
} from '@hoobi/design';
import { Recipe } from './kit.js';

/**
 * Page-shaped compositions, not components.
 *
 * A gallery of atoms tells you what a Button looks like and nothing about what a
 * page looks like, which is why anything generating new UI from a component list
 * alone produces something that uses the right parts in the wrong shapes. These
 * four are the real shapes in use in mendarr, reduced to the bones.
 */

export function ListRecipe() {
  const [q, setQ] = useState('');
  const rows = [
    {
      id: 4,
      title: 'The Odyssey',
      tone: 'warn',
      status: 'awaiting_approval',
      meta: '2026 - 1080p',
    },
    { id: 3, title: 'Rockman EXE', tone: 'info', status: 'monitoring', meta: 'S01 - 56 episodes' },
    { id: 2, title: 'Frieren', tone: 'success', status: 'resolved', meta: 'S01E12 - subtitles' },
  ] as const;
  return (
    <Recipe
      note="A filtered list. The filters are the section's actions, not a toolbar of their own; the empty state is an Alert rather than a paragraph, so it is toned; and one markup path collapses from a row grid to stacked cards below md - never two branches, since two branches let the phone layout drift out of date unnoticed."
      code={`<Section
  id="issues"
  title="Issues"
  caption="Everything mendarr is holding."
  actions={
    <div className="flex flex-wrap items-end gap-3">
      <Select label="status" className="w-auto">...</Select>
      <Input label="search" className="w-44" />
    </div>
  }
>
  {visible.length === 0 ? <Alert tone="info" title="No issues match." /> : null}

  <div className="flex flex-col gap-px overflow-hidden rounded-panel">
    {visible.map((row) => (
      <a key={row.id} href={\`#/issues/\${row.id}\`}
         className="bg-surface p-4 hover:bg-surface-raised md:grid md:grid-cols-[3rem_1fr_auto] md:items-center md:gap-4">
        <span className="font-mono text-caption text-text-mute">#{row.id}</span>
        <span className="min-w-0">
          <span className="block truncate text-body text-text">{row.title}</span>
          <span className="block truncate text-caption text-text-mute">{row.meta}</span>
        </span>
        <Badge tone={row.tone} dot>{row.status}</Badge>
      </a>
    ))}
  </div>
</Section>`}
    >
      <Section
        id="recipe-issues"
        title="Issues"
        caption="Everything mendarr is holding."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <Select label="status" className="w-auto" defaultValue="open">
              <option value="open">open</option>
              <option value="all">all</option>
            </Select>
            <Input
              label="search"
              className="w-44"
              value={q}
              placeholder="title or id"
              onChange={(e) => {
                setQ(e.target.value);
              }}
            />
          </div>
        }
      >
        <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-panel">
          {rows.map((row) => (
            <a
              key={row.id}
              href="#recipe-list"
              className="bg-surface p-4 hover:bg-surface-raised md:grid md:grid-cols-[3rem_1fr_auto] md:items-center md:gap-4"
            >
              <span className="font-mono text-caption text-text-mute">#{row.id}</span>
              <span className="min-w-0">
                <span className="block truncate text-body text-text">{row.title}</span>
                <span className="block truncate text-caption text-text-mute">{row.meta}</span>
              </span>
              <span className="mt-2 flex md:mt-0">
                <Badge tone={row.tone} dot>
                  {row.status}
                </Badge>
              </span>
            </a>
          ))}
        </div>
      </Section>
    </Recipe>
  );
}

export function DetailRecipe() {
  const [tab, setTab] = useState('plan');
  return (
    <Recipe
      note="An item is a page, not a modal. Breadcrumbs mark depth, so the list it came from has none and this one has exactly two rungs. Tabs are view state in the query string, never useState in production - a permalink has to reopen the tab you were on. Facts go in a DescriptionList, history in a Timeline; neither is a table."
      code={`<Breadcrumbs items={[{ label: 'issues', href: '/issues' }, { label: '#4 The Odyssey' }]} />

<Section id="issue" title="The Odyssey" caption="Reported by hoobi - video" actions={<Badge tone="warn" dot>awaiting_approval</Badge>}>
  <Tabs
    items={[{ id: 'plan', label: 'Plan' }, { id: 'activity', label: 'Activity' }]}
    value={tab}
    onChange={setTab}
  />
  {tab === 'plan' ? (
    <Card title="Remediation plan" padded={false} className="mt-4">
      <DescriptionList items={[
        { label: 'Action', value: 'replace_with_release' },
        { label: 'Confidence', value: <Badge tone="success">high</Badge> },
      ]} />
    </Card>
  ) : (
    <Timeline className="mt-4">
      <Timeline.Item tone="success" time="12:04" head="Plan produced" />
    </Timeline>
  )}
</Section>`}
    >
      <Breadcrumbs
        items={[{ label: 'issues', href: '#recipe-detail' }, { label: '#4 The Odyssey' }]}
      />
      <Section
        id="recipe-issue"
        title="The Odyssey"
        caption="Reported by hoobi - video"
        actions={
          <Badge tone="warn" dot>
            awaiting_approval
          </Badge>
        }
      >
        <Tabs
          className="mt-4"
          items={[
            { id: 'plan', label: 'Plan' },
            { id: 'activity', label: 'Activity' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'plan' ? (
          <Card title="Remediation plan" padded={false} className="mt-4">
            <DescriptionList
              items={[
                { label: 'Action', value: 'replace_with_release' },
                { label: 'Target', value: 'The Odyssey (2026)' },
                { label: 'Confidence', value: <Badge tone="success">high</Badge> },
                { label: 'Risk', value: <Badge tone="warn">deletes a file</Badge> },
              ]}
            />
          </Card>
        ) : (
          <Timeline className="mt-4">
            <Timeline.Item tone="success" time="12:04" head="Plan produced">
              Four candidates found, one survived the cam guard.
            </Timeline.Item>
            <Timeline.Item tone="warn" time="12:04" head="Awaiting approval">
              Reporter is not the requester.
            </Timeline.Item>
          </Timeline>
        )}
      </Section>
    </Recipe>
  );
}

export function DestructiveRecipe() {
  return (
    <Recipe
      note="Two tiers. ConfirmButton is arm-then-confirm in place: right for a reversible or small destructive act, because it costs one extra click and no context switch. A Modal is for the act that needs the consequence spelled out before the click - it deletes a 4.4GB file. Never use a Modal to confirm something trivial, and never use an inline confirm for something you cannot undo."
      code={`{/* small, reversible: arm in place */}
<ConfirmButton variant="danger" onConfirm={reject}>Reject plan</ConfirmButton>

{/* irreversible: spell out the consequence first */}
<Modal open={open} onClose={close} title="Replace this file?">
  <p className="text-body text-text-dim">
    Deletes <strong className="text-text">The.Odyssey.2026.1080p.WEBDL.mkv</strong> (4.4 GB)
    and grabs the chosen release. Reversible only while the download is in flight.
  </p>
  <div className="mt-4 flex justify-end gap-2">
    <Button onClick={close}>Cancel</Button>
    <Button variant="danger" onClick={confirm}>Replace file</Button>
  </div>
</Modal>`}
    >
      <div className="flex flex-col gap-4">
        <Card title="Reversible: armed in place">
          <div className="flex flex-wrap gap-3">
            <ConfirmButton variant="danger" onConfirm={() => undefined}>
              Reject plan
            </ConfirmButton>
            <ConfirmButton variant="secondary" onConfirm={() => undefined}>
              Close issue
            </ConfirmButton>
          </div>
        </Card>
        <Card title="Irreversible: cost spelled out">
          <p className="text-body text-text-dim">
            Deletes <strong className="text-text">The.Odyssey.2026.1080p.WEBDL.mkv</strong> (4.4 GB)
            and grabs the chosen release. Reversible only while the download is in flight.
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button>Cancel</Button>
            <Button variant="danger">Replace file</Button>
          </div>
        </Card>
      </div>
    </Recipe>
  );
}

export function StatesRecipe() {
  return (
    <Recipe
      note="Empty, loading and failed are designs, not afterthoughts. An empty state says what would be here and how to make it appear; a failure says what broke and what to do, never just red text. Every one of them is an Alert, so the tone conveys the meaning and no page invents its own vocabulary for the same three moments."
      code={`{error ? <Alert tone="danger" title="Sonarr is unreachable">
  Check the connection in Config. The sweep will retry on the next tick.
</Alert> : null}

{!issues ? <Alert tone="neutral" title="Loading issues..." /> : null}

{issues && visible.length === 0 ? (
  <Alert tone="info" title="No issues match.">
    Clear the filters, or wait - the sweep adopts new Seerr issues every minute.
  </Alert>
) : null}`}
    >
      <div className="flex flex-col gap-3">
        <Alert tone="info" title="No issues match.">
          Clear the filters, or wait - the sweep adopts new Seerr issues every minute.
        </Alert>
        <Alert tone="danger" title="Sonarr is unreachable">
          Check the connection in Config. The sweep will retry on the next tick.
        </Alert>
        <Alert tone="warn" title="Reporter has not replied">
          Closing automatically in 3 days. A reply reopens the remediation.
        </Alert>
        <Alert tone="success" title="Imported and confirmed">
          English audio, no burned-in subtitles. The issue is closed.
        </Alert>
      </div>
    </Recipe>
  );
}
