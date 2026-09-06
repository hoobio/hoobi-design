import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Input,
  SettingList,
  SettingRow,
  Switch,
} from '@hoobi/design';
import { DoDont, Snippet } from './kit.js';

/**
 * The house rules, shown as pairs rather than stated as prose. Every rule here is
 * also written down in AGENTS.md; this page is the version you can look at.
 */
export function Rules() {
  return (
    <>
      <p className="text-body text-text-dim">
        Each rule below is a decision the library has already made. They are not preferences to
        weigh against your own - a change that breaks one of these is a change that does not land.
        The wrong column is not a strawman: every one of them is a pattern that has actually been
        written against this library and had to be taken back out.
      </p>

      <DoDont
        rule="Accent is spent once per view"
        why="Accent marks the one primary action, the selected tab, progress fill and the focus ring. A second accent button does not double the emphasis, it halves it - now neither is the answer to what happens next."
        doLabel="One primary, everything else neutral."
        dontLabel="Three primaries: nothing is primary."
      >
        <>
          <Button variant="primary">Approve</Button>
          <Button variant="secondary">Details</Button>
          <Button variant="ghost">Dismiss</Button>
        </>
        <>
          <Button variant="primary">Approve</Button>
          <Button variant="primary">Details</Button>
          <Button variant="primary">Dismiss</Button>
        </>
      </DoDont>

      <DoDont
        rule="Depth is fill, never stroke, never shadow"
        why="Surfaces are told apart by background alone - bg, surface, surface-raised, chip. A card that outlines itself is carrying its separation twice, and the outline is the half that stops working the moment two cards sit side by side."
        doLabel="bg-surface, no border."
        dontLabel="A border doing what the fill already did."
      >
        <div className="w-64 rounded-panel bg-surface p-4">
          <div className="text-body-strong text-text">Rockman EXE</div>
          <div className="mt-1 text-caption text-text-dim">56 episodes, one pack.</div>
        </div>
        <div className="w-64 rounded-panel border border-border bg-surface p-4">
          <div className="text-body-strong text-text">Rockman EXE</div>
          <div className="mt-1 text-caption text-text-dim">56 episodes, one pack.</div>
        </div>
      </DoDont>

      <DoDont
        rule="Segmentation is a hairline of page background"
        why="The earmark WinUI card treatment: sections are sliced apart by 1px of bg showing through, not divided by a stroke drawn on top. Divider does it and bleeds to the surface edges on its own, cancelling whatever padding the container published as --pad."
        doLabel="Divider - a slice of bg, edge to edge."
        dontLabel="border-border: a stroke, inset by the padding."
      >
        <div className="w-64 rounded-panel bg-surface p-4">
          <div className="text-caption text-text">Audio</div>
          <Divider />
          <div className="text-caption text-text">Subtitles</div>
        </div>
        <div className="w-64 rounded-panel bg-surface p-4">
          <div className="text-caption text-text">Audio</div>
          <div className="my-2 border-t border-border" />
          <div className="text-caption text-text">Subtitles</div>
        </div>
      </DoDont>

      <DoDont
        rule="A state tints the whole surface"
        why="Semantic tone is a fill at low opacity - bg-danger/15 - so the surface itself reads as the state at a glance and from the corner of the eye. A coloured border on a neutral fill is a state you have to go looking for."
        doLabel="The surface carries the tone."
        dontLabel="A coloured outline around a neutral box."
      >
        <Alert tone="danger" title="Execution failed" className="w-64">
          Sonarr refused the release.
        </Alert>
        <div className="w-64 rounded-panel border border-danger bg-surface p-4">
          <div className="text-body-strong text-danger">Execution failed</div>
          <div className="mt-1 text-caption text-text-dim">Sonarr refused the release.</div>
        </div>
      </DoDont>

      <DoDont
        rule="Links shift shade, they never underline"
        why="WinUI hyperlinks move accent-blue to accent-cyan on hover. The base layer already does it for every anchor, so a link needs no classes at all - and a button-shaped link (a nav row, a sidebar entry) highlights its own surface instead, because it is a target, not a word."
        doLabel="Colour shift, handled by the base layer."
        dontLabel="An underline the house does not have."
      >
        <a href="#rules">Open in Seerr</a>
        <a href="#rules" className="underline">
          Open in Seerr
        </a>
      </DoDont>

      <DoDont
        rule="The focus ring is one language, set globally"
        why="A 2px accent outline at 2px offset, on :focus-visible, for everything. A component that clears the outline to draw its own has forked the keyboard experience, and the replacement is always worse on the one surface nobody tested it against."
        doLabel="Tab to it: the global ring, unmodified."
        dontLabel="Cleared outline and a bespoke replacement."
      >
        <Button variant="secondary">Reanalyze</Button>
        <button
          type="button"
          className="h-8 rounded-control bg-surface-raised px-3 text-body text-text outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
        >
          Reanalyze
        </button>
      </DoDont>

      <DoDont
        rule="Caption is de-emphasised by colour, not by size"
        why="14px is the floor. Metadata recedes because it is text-mute, not because it shrank - the YouTube grid does exactly this, and it is why their channel line stays readable on a phone."
        doLabel="text-caption at 14px, muted."
        dontLabel="11px grey, unreadable at arm's length."
      >
        <div className="w-56">
          <div className="text-body text-text">The Odyssey</div>
          <div className="text-caption text-text-mute">2026 - 1080p WEBDL - 4.4 GB</div>
        </div>
        <div className="w-56">
          <div className="text-body text-text">The Odyssey</div>
          <div className="text-[11px] text-text-mute">2026 - 1080p WEBDL - 4.4 GB</div>
        </div>
      </DoDont>

      <DoDont
        rule="Everything lands on the 4px grid"
        why="--spacing is 4px, so every Tailwind spacing utility is already a multiple of it. An arbitrary value is a number nobody can align to later, and it is how a page ends up 3px out of true with the one beside it."
        doLabel="gap-3, p-4: 12px and 16px."
        dontLabel="Arbitrary values, off the grid."
      >
        <div className="flex gap-3 rounded-panel bg-surface p-4">
          <Badge tone="success">imported</Badge>
          <Badge tone="info">monitoring</Badge>
        </div>
        <div className="flex gap-[7px] rounded-panel bg-surface p-[13px]">
          <Badge tone="success">imported</Badge>
          <Badge tone="info">monitoring</Badge>
        </div>
      </DoDont>

      <DoDont
        rule="Settings are one surface level"
        why="Rows are bg-surface with a 1px seam of bg between them, and a group is a caption title, not a box. A row inside a panel inside a section is three fills saying the same thing, and the reader has to work out which one is the setting. surface-raised is for things that float: a menu, the unsaved bar."
        doLabel="SettingList: rows and a seam."
        dontLabel="A surface inside a surface."
      >
        <SettingList className="w-72">
          <SettingRow
            label="Auto-approve"
            description="Never applies to a reanalysis."
            control={
              <Switch
                stateLabel
                aria-label="Auto-approve"
                checked
                onCheckedChange={() => undefined}
              />
            }
          />
          <SettingRow
            label="Unstick held downloads"
            control={
              <Switch
                stateLabel
                aria-label="Unstick"
                checked={false}
                onCheckedChange={() => undefined}
              />
            }
          />
        </SettingList>
        <div className="w-72 rounded-panel bg-surface p-3">
          <div className="flex flex-col gap-3 rounded-panel bg-surface-raised p-3">
            <Switch
              align="between"
              label="Auto-approve"
              checked
              onCheckedChange={() => undefined}
            />
            <Switch
              align="between"
              label="Unstick held downloads"
              checked={false}
              onCheckedChange={() => undefined}
            />
          </div>
        </div>
      </DoDont>

      <DoDont
        rule="A field sits into the row, and the row is its label"
        why="Inside a SettingRow the words are already there at body size, so the field draws no label of its own (hideLabel keeps it for screen readers) and fills with chip rather than standing on the surface with a border. A second, caption-sized label under the first is the same words twice, smaller."
        doLabel="hideLabel, chip fill, the row says what it is."
        dontLabel="A labelled field: the words twice."
      >
        <SettingList className="w-72">
          <SettingRow label="Public url" description="Where Seerr reaches mendarr.">
            <Input hideLabel label="Public url" mono defaultValue="http://mendarr:3144" />
          </SettingRow>
        </SettingList>
        <SettingList className="w-72">
          <SettingRow label="Public url" description="Where Seerr reaches mendarr.">
            <Input label="public url" mono defaultValue="http://mendarr:3144" />
          </SettingRow>
        </SettingList>
      </DoDont>

      <h3 className="mt-10 text-body-strong text-text">Changes land here, not in the consumer</h3>
      <p className="mt-1 text-caption text-text-dim">
        The rule with no picture, and the most expensive one to break. A consumer that needs a
        component to look or behave differently is the trigger to change it in hoobi-design and
        repin. A className override or a hand-rolled copy forks the design system silently, and the
        fork is only found once the two have already drifted. Library changes are backwards
        compatible and ideally additive: new props default to the old behaviour.
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-px overflow-hidden rounded-panel">
          <div className="bg-surface px-4 py-2 text-caption font-medium text-success">Do</div>
          <Snippet
            flush
            code={`// hoobi-design/src/Badge.tsx - add the tone to the library, repin, use it
<Badge tone="warn" dot>degraded</Badge>`}
          />
        </div>
        <div className="flex flex-col gap-px overflow-hidden rounded-panel">
          <div className="bg-surface px-4 py-2 text-caption font-medium text-danger">
            Don&apos;t
          </div>
          <Snippet
            flush
            code={`// consumer - a silent fork of the design system
<Badge className="!bg-yellow-500/20 !text-yellow-300">degraded</Badge>`}
          />
        </div>
      </div>

      <Card title="Deliberately absent" className="mt-8">
        <p className="text-caption text-text-dim">
          There is no Table, Toast or Skeleton, and that is a decision rather than a gap. A
          component is added when a consumer actually needs one - never speculatively, and never
          with props added &quot;for later&quot;. If you need one of these, the answer is to write
          it here first, not to reach for another library or hand-roll it in the app. Toggle came
          off that list rather than onto this one: Checkbox is the native input given the house
          look, which is what the absence already recommended.
        </p>
      </Card>
    </>
  );
}
