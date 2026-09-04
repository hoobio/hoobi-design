import { useState } from 'react';
import {
  ActionButton,
  Badge,
  Button,
  ActionDialog,
  ConnectionCard,
  CopyField,
  CronInput,
  Divider,
  DurationInput,
  FormDialog,
  FieldLabel,
  Input,
  SecretField,
  Section,
  SectionNav,
  Select,
  Slider,
  Steps,
  Switch,
  Toaster,
  UnsavedBar,
  cronRuns,
  dismissAllToasts,
  toast,
} from '@hoobi/design';
import { Demo, DoDont, Import, Playground, Props, Snippet } from './kit.js';

/* ------------------------------------------------------------------ FieldLabel */

export function FieldLabelPage() {
  return (
    <>
      <Import names="FieldLabel" />
      <Playground
        knobs={{
          label: { kind: 'text', init: 'public url' },
          info: { kind: 'text', init: 'The address Seerr uses to reach mendarr.' },
        }}
        render={(v) => (
          <FieldLabel info={(v.info as string) || undefined} className="w-72">
            {v.label as string}
          </FieldLabel>
        )}
        code={(v) =>
          `<FieldLabel${v.info ? ` info="${String(v.info)}"` : ''}>${String(v.label)}</FieldLabel>`
        }
      />

      <Demo
        title="The (i) is where explanations live"
        note="Every field in the library labels itself through this row. Hover or tab to the (i)."
        stack
        code={`<Input label="model" info="Any OpenAI-compatible model id." mono defaultValue="qwen3-30b-a3b" />`}
      >
        <Input
          label="model"
          info="Any OpenAI-compatible model id the endpoint serves."
          mono
          defaultValue="qwen3-30b-a3b"
          className="w-72"
        />
      </Demo>

      <Demo
        title="aside"
        note="The right of the label row: a state badge, a live readout, a small action."
        stack
        code={`<FieldLabel aside={<Badge size="sm" tone="success" dot>set</Badge>}>api key</FieldLabel>`}
      >
        <FieldLabel
          className="w-72"
          info="Found under Settings → General in the app itself."
          aside={
            <Badge size="sm" tone="success" dot>
              set
            </Badge>
          }
        >
          api key
        </FieldLabel>
        <FieldLabel className="w-72" aside={<span className="font-mono text-text">0.10</span>}>
          temperature
        </FieldLabel>
      </Demo>

      <DoDont
        rule="Explain in the (i), not under the field"
        why="A caption under every field is a caption nobody reads, and six of them turn a form into a wall. The line under a control is reserved for a validation error."
        doLabel="One glyph, one tooltip, on demand."
        dontLabel="A sentence per field, always on screen."
      >
        <div className="flex w-72 flex-col gap-3">
          <Input
            label="max tokens"
            info="Maximum tokens per completion."
            mono
            defaultValue="1500"
          />
          <Input label="temperature" info="Lower is more deterministic." mono defaultValue="0.10" />
        </div>
        <div className="flex w-72 flex-col gap-3">
          <Input
            label="max tokens"
            hint="Maximum tokens per completion."
            mono
            defaultValue="1500"
          />
          <Input label="temperature" hint="Lower is more deterministic." mono defaultValue="0.10" />
        </div>
      </DoDont>

      <Demo
        title="InfoTip is not a tab stop"
        note="The glyph is a role=img span with tabIndex -1, hover-only: Tab from the first field lands on the second, never on an explanation. The words still reach a screen reader, through a hidden span the control names in aria-describedby - every field here wires that for you. Tab through these two."
        stack
        code={`<Input label="username" info="Your Jellyfin account name." />
<Input label="password" type="password" />

// composing your own control:
<FieldLabel info={text} infoId={id}>label</FieldLabel>
<input aria-describedby={id} />`}
      >
        <Input className="w-72" label="username" info="Your Jellyfin account name." />
        <Input className="w-72" label="password" type="password" />
        <FieldLabel
          className="w-72"
          info="Composing your own control? Pass infoId too and point aria-describedby at it."
        >
          standalone
        </FieldLabel>
      </Demo>

      <Props
        rows={[
          ['children', 'ReactNode', '', 'The label text.'],
          ['info', 'string', '', 'Shown from an (i) on hover. Never a tab stop.'],
          [
            'infoId',
            'string',
            '',
            "Id of the hidden copy of info, for the control's aria-describedby.",
          ],
          ['aside', 'ReactNode', '', 'Right-aligned in the row: a badge, a readout, an action.'],
          ['htmlFor', 'string', '', 'Renders a real <label> bound to that control.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ Switch */

export function SwitchPage() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  return (
    <>
      <Import names="Switch" />
      <Playground
        knobs={{
          label: { kind: 'text', init: 'disable thinking' },
          checked: { kind: 'boolean', init: true },
          disabled: { kind: 'boolean', init: false },
        }}
        render={(v) => (
          <Switch
            checked={v.checked as boolean}
            onCheckedChange={() => undefined}
            label={(v.label as string) || undefined}
            aria-label={v.label ? undefined : 'Setting'}
            disabled={v.disabled as boolean}
          />
        )}
        code={(v) =>
          `<Switch checked={${String(v.checked)}} onCheckedChange={setValue}${v.label ? ` label="${String(v.label)}"` : ''}${v.disabled ? ' disabled' : ''} />`
        }
      />

      <Demo
        title="On and off"
        note="role=switch with aria-checked, so it announces as a switch and toggles on Space and Enter."
        stack
        code={`<Switch checked={on} onCheckedChange={setOn} label="disable thinking" />
<Switch checked={off} onCheckedChange={setOff} label="auto-approve" />`}
      >
        <Switch checked={on} onCheckedChange={setOn} label="disable thinking" />
        <Switch checked={off} onCheckedChange={setOff} label="auto-approve" />
      </Demo>

      <Demo
        title={`A settings row: align="between"`}
        note="The words left, the track flush right, and the label WRAPS - a sentence-long setting must not set a floor on the page width. Narrow the window to 360px: this is the layout mendarr's Behaviour and Scanner rows use."
        stack
        code={`<Switch
  align="between"
  checked={on}
  onCheckedChange={setOn}
  label="Auto-approve when the reporter is the requester"
  info="Executes the plan immediately when the reporter also requested the media."
/>`}
      >
        <div className="w-90 max-w-full rounded-panel bg-surface-raised px-4">
          <Switch
            align="between"
            checked={on}
            onCheckedChange={setOn}
            label="Auto-approve when the reporter is the requester"
            info="Executes the plan immediately when the reporter also requested the media."
          />
        </div>
        <div className="w-90 max-w-full rounded-panel bg-surface-raised px-4">
          <Switch
            align="between"
            checked={off}
            onCheckedChange={setOff}
            label="Open Seerr issues for requests that were never filled"
          />
        </div>
      </Demo>

      <Demo
        title="Bare, beside its own copy"
        note="A section that a switch turns on wholesale puts the switch in the title row and the words in the title. Pass aria-label when there is no inline label."
        code={`<Switch checked={on} onCheckedChange={setOn} aria-label="Unfilled request scanner" />`}
      >
        <span className="text-body text-text">Unfilled request scanner</span>
        <Switch
          checked={on}
          onCheckedChange={setOn}
          aria-label="Unfilled request scanner"
          info="Ignored: an (i) beside a bare track names nothing."
        />
      </Demo>

      <Demo
        title="With an (i)"
        note="The glyph sits outside the switch's hit target, so tabbing reaches the explanation without risking a toggle."
        code={`<Switch checked={on} onCheckedChange={setOn} label="disable thinking" info="Required for Qwen reasoning models." />`}
      >
        <Switch
          checked={on}
          onCheckedChange={setOn}
          label="disable thinking"
          info="Required for Qwen reasoning models."
        />
      </Demo>

      <DoDont
        rule="A switch takes effect; a checkbox is a value"
        why="A setting that acts the moment you press it is a Switch. One of several options you tick and then submit is a Checkbox."
        doLabel="Switch for the setting, checkbox for the selection."
        dontLabel="A checkbox that silently applies, a switch inside a form."
      >
        <Switch checked={on} onCheckedChange={setOn} label="auto-approve requester matches" />
        <Switch
          checked={off}
          onCheckedChange={setOff}
          label="include season packs in this search"
        />
      </DoDont>

      <Props
        rows={[
          ['checked', 'boolean', '', 'Controlled; there is no uncontrolled mode.'],
          ['onCheckedChange', '(checked: boolean) => void', '', 'Called with the next state.'],
          [
            'label',
            'ReactNode',
            '',
            "Wraps. Inside the hit target for align='start'; beside it for 'between'.",
          ],
          ['info', 'string', '', '(i) beside the label, never inside the hit target.'],
          [
            'align',
            "'start' | 'between'",
            "'start'",
            "'between' is the full-width settings row: words left, track flush right.",
          ],
          ['disabled', 'boolean', 'false', 'Locks and dims it.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ Slider */

export function SliderPage() {
  const [temp, setTemp] = useState(0.1);
  return (
    <>
      <Import names="Slider" />
      <Playground
        knobs={{
          label: { kind: 'text', init: 'temperature' },
          info: { kind: 'text', init: 'Lower is more deterministic.' },
        }}
        render={(v) => (
          <Slider
            className="w-72"
            label={v.label as string}
            info={(v.info as string) || undefined}
            valueLabel={temp.toFixed(2)}
            min={0}
            max={2}
            step={0.05}
            value={temp}
            onChange={(e) => {
              setTemp(Number(e.target.value));
            }}
          />
        )}
        code={(v) =>
          `<Slider label="${String(v.label)}"${v.info ? ` info="${String(v.info)}"` : ''} valueLabel={value.toFixed(2)} min={0} max={2} step={0.05} value={value} onChange={...} />`
        }
      />

      <Demo
        title="The readout is not optional"
        note="A slider without a number is a control you cannot set deliberately or describe to anyone else. Format the value yourself - the component does not guess your precision."
        stack
        code={`<Slider label="temperature" valueLabel={value.toFixed(2)} min={0} max={2} step={0.05} value={value} onChange={(e) => setValue(Number(e.target.value))} />`}
      >
        <Slider
          className="w-72"
          label="temperature"
          info="Lower is more deterministic."
          valueLabel={temp.toFixed(2)}
          min={0}
          max={2}
          step={0.05}
          value={temp}
          onChange={(e) => {
            setTemp(Number(e.target.value));
          }}
        />
      </Demo>

      <Props
        rows={[
          ['label', 'ReactNode', '', 'Caption label, left of the row.'],
          ['valueLabel', 'ReactNode', '', 'Mono readout, right of the row.'],
          ['info', 'string', '', '(i) beside the label.'],
          ['...rest', 'input props', '', 'min, max, step, value, onChange, disabled.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ SecretField */

export function SecretFieldPage() {
  const [draft, setDraft] = useState('');
  const [set, setSet] = useState(true);
  const [apiKey, setApiKey] = useState('mnd_4f9c1e7b2a8d43c0b6e5f1a2d9c8b7a6');
  const [confirm, setConfirm] = useState<null | 'clear' | 'regen' | 'rotate'>(null);
  const [note, setNote] = useState<string | undefined>(undefined);

  return (
    <>
      <Import names="SecretField" />
      <Playground
        knobs={{
          variant: {
            kind: 'select',
            options: ['write-only', 'reveal', 'hidden'],
            init: 'write-only',
          },
          set: { kind: 'boolean', init: true },
        }}
        render={(v) => (
          <SecretField
            className="w-80"
            variant={v.variant as 'write-only' | 'reveal' | 'hidden'}
            label="api key"
            set={v.set as boolean}
            value={draft}
            onChange={setDraft}
            onClear={() => undefined}
            revealedValue={apiKey}
            onRegenerate={() => undefined}
            onRotate={() => undefined}
          />
        )}
        code={(v) =>
          `<SecretField variant="${String(v.variant)}" label="api key" set={${String(v.set)}} ... />`
        }
      />

      <Demo
        title="write-only"
        note="The lock and the dots say a value is stored and cannot be read back. Nothing writes that in a sentence; the wording is on the lock's tooltip, on hover and keyboard focus. Typing arms a replacement, which is the one thing worth a line of its own."
        stack
        code={`<SecretField
  label="api key"
  set={set}
  value={draft}
  onChange={setDraft}
  onClear={() => setConfirm('clear')}
/>`}
      >
        <SecretField
          className="w-80"
          label="api key"
          set={set}
          value={draft}
          onChange={setDraft}
          onClear={() => {
            setConfirm('clear');
          }}
        />
        <SecretField className="w-80" label="api key (nothing stored)" set={false} />
        <SecretField
          className="w-80"
          label="api key"
          set
          value="short"
          error="Sonarr rejected this key."
        />
      </Demo>

      <Demo
        title="reveal"
        note="For a value the server can hand back: masked, with an eye, a copy and an optional regenerate. The eye IS the affordance, so there is no helper text at all."
        stack
        code={`<SecretField
  variant="reveal"
  label="mendarr API key"
  set
  revealedValue={apiKey}
  onRegenerate={() => setConfirm('regen')}
  note={note}
/>`}
      >
        <SecretField
          variant="reveal"
          label="mendarr API key"
          set
          revealedValue={apiKey}
          onRegenerate={() => {
            setConfirm('regen');
          }}
          note={note}
        />
      </Demo>

      <Demo
        title="hidden"
        note="A value nobody ever sees: a lock, a name, and the one action there is."
        stack
        code={`<SecretField
  variant="hidden"
  label="Cookie secret"
  set
  onRotate={() => setConfirm('rotate')}
/>`}
      >
        <SecretField
          variant="hidden"
          label="Cookie secret"
          set
          onRotate={() => {
            setConfirm('rotate');
          }}
        />
      </Demo>

      <DoDont
        rule="Destructive callbacks are confirmed by the consumer"
        why="clear, regenerate and rotate fire immediately and hold no arm state. The page puts a ActionDialog in front of them, because only the page knows what the byproduct is."
        doLabel="ActionDialog states the consequence, then acts."
        dontLabel="A second click on a strip that says nothing."
      >
        <Button
          variant="danger"
          onClick={() => {
            setConfirm('rotate');
          }}
        >
          rotate
        </Button>
        <Button variant="danger">rotate · click again</Button>
      </DoDont>

      <ActionDialog
        open={confirm !== null}
        tone="danger"
        title={confirm === 'clear' ? 'Clear the stored key?' : 'Rotate the secret?'}
        description={
          confirm === 'clear'
            ? 'The stored key is discarded and mendarr stops reaching this service until a new one is saved.'
            : 'The current value stops working immediately. Everyone, including you, will be signed out.'
        }
        actionLabel={confirm === 'clear' ? 'Clear' : 'Rotate'}
        onCancel={() => {
          setConfirm(null);
        }}
        onAction={() => {
          if (confirm === 'clear') setSet(false);
          if (confirm === 'regen') {
            setApiKey(`mnd_${Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32)}`);
            setNote('New API key generated.');
          }
          setConfirm(null);
        }}
      />

      <Props
        rows={[
          [
            'variant',
            "'write-only' | 'reveal' | 'hidden'",
            "'write-only'",
            'Which affordances the value gets.',
          ],
          ['label', 'ReactNode', '', 'The field name.'],
          [
            'set',
            'boolean',
            'false',
            'A value exists server-side: lock tooltip, set badge, masked placeholder.',
          ],
          [
            'value / onChange',
            'string / (v: string) => void',
            '',
            'write-only: the replacement draft.',
          ],
          ['onClear', '() => void', '', 'Fires immediately. Confirm it with a ActionDialog.'],
          ['revealedValue', 'string', '', 'reveal: the real value, behind the eye.'],
          [
            'onRegenerate / onRotate',
            '() => void',
            '',
            'Fire immediately. Confirm them with a ActionDialog.',
          ],
          ['error', 'ReactNode', '', 'The only prose rendered under the control.'],
          ['note', 'ReactNode', '', 'A short success readout after an action.'],
          [
            'labels',
            'Partial<SecretFieldLabels>',
            '',
            'Wording overrides for translation. Not a helper-text slot.',
          ],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ ActionDialog */

export function ActionDialogPage() {
  const [open, setOpen] = useState<null | 'default' | 'danger' | 'busy' | 'async'>(null);
  return (
    <>
      <Import names="ActionDialog" />
      <Demo
        title="Default and danger"
        note="Escape and the focus trap come from Modal's native dialog. For a danger tone the focus lands on Cancel, so the reflex key press does not fire the thing."
        code={`<ActionDialog
  open={open}
  tone="danger"
  title="Rotate the cookie secret?"
  description="Everyone, including you, will be signed out."
  actionLabel="Rotate"
  onAction={rotate}
  onCancel={() => setOpen(false)}
/>`}
      >
        <Button
          onClick={() => {
            setOpen('default');
          }}
        >
          Re-register in Seerr
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            setOpen('danger');
          }}
        >
          Rotate cookie secret
        </Button>
        <Button
          onClick={() => {
            setOpen('busy');
          }}
        >
          Busy state
        </Button>
      </Demo>

      <ActionDialog
        open={open === 'default'}
        title="Re-register the webhook in Seerr?"
        description="Seerr's existing webhook settings are overwritten with mendarr's."
        actionLabel="Re-register"
        onAction={() => {
          setOpen(null);
        }}
        onCancel={() => {
          setOpen(null);
        }}
      />
      <ActionDialog
        open={open === 'danger'}
        tone="danger"
        title="Rotate the cookie secret?"
        description="Everyone, including you, will be signed out."
        actionLabel="Rotate"
        onAction={() => {
          setOpen(null);
        }}
        onCancel={() => {
          setOpen(null);
        }}
      />
      <ActionDialog
        open={open === 'busy'}
        tone="danger"
        busy
        title="Regenerate the API key?"
        description="The current key stops working immediately."
        actionLabel="Regenerate"
        onAction={() => {
          setOpen(null);
        }}
        onCancel={() => {
          setOpen(null);
        }}
      />

      <Demo
        title="onAction returns a promise"
        note="The dialog runs it: busy while pending, a danger line on reject, and it STAYS OPEN either way. Closing is the consumer flipping open once the work actually succeeded - a dialog that closes itself closes over failures too. Press Regenerate; it fails."
        code={`<ActionDialog
  open={open}
  tone="danger"
  title="Regenerate the API key?"
  description="The current key stops working immediately."
  actionLabel="Regenerate"
  onAction={() => api.regenerate()}   // rejects -> error line, dialog stays open
  onCancel={() => setOpen(false)}
/>`}
      >
        <Button
          variant="danger"
          onClick={() => {
            setOpen('async');
          }}
        >
          Regenerate API key
        </Button>
      </Demo>

      <ActionDialog
        open={open === 'async'}
        tone="danger"
        title="Regenerate the API key?"
        description="The current key stops working immediately."
        actionLabel="Regenerate"
        onAction={async () => {
          await wait(1100);
          throw new Error('mendarr returned 500: could not write to mendarr.db');
        }}
        onCancel={() => {
          setOpen(null);
        }}
      />

      <DoDont
        rule="The button names the action"
        why={
          'actionLabel is required and has no default: a dialog whose button says Confirm has told the reader nothing they did not already know. Confirm was never the concept, which is why this is ActionDialog.'
        }
        doLabel="Rotate. Regenerate. Delete 12 issues."
        dontLabel="Confirm. OK. Yes."
      >
        <Button
          variant="danger"
          onClick={() => {
            setOpen('danger');
          }}
        >
          Rotate cookie secret
        </Button>
        <Button variant="danger">Confirm</Button>
      </DoDont>

      <DoDont
        rule="Byproducts get a dialog, not an armed button"
        why="Anything destructive, irrecoverable, or with a side effect on somebody else needs its consequence stated before the second click. ConfirmButton disarms itself after four seconds and states nothing; it is deprecated for exactly this."
        doLabel="The consequence, then Cancel and Rotate."
        dontLabel="An armed button that says only 'confirm'."
      >
        <Button
          variant="danger"
          onClick={() => {
            setOpen('danger');
          }}
        >
          Rotate cookie secret
        </Button>
        <Button variant="danger">Confirm rotate</Button>
      </DoDont>

      <Props
        rows={[
          ['open', 'boolean', '', 'Controlled.'],
          ['title', 'ReactNode', '', 'The question.'],
          ['description', 'ReactNode', '', 'One plain statement of the consequence.'],
          ['children', 'ReactNode', '', 'Anything richer than a sentence.'],
          [
            'actionLabel',
            'ReactNode',
            'required',
            'Names the action. There is deliberately no default.',
          ],
          ['cancelLabel', 'ReactNode', "'Cancel'", ''],
          [
            'tone',
            "'default' | 'danger'",
            "'default'",
            'danger reddens the action and focuses Cancel. Only for discarding something irrecoverable.',
          ],
          [
            'busy',
            'boolean',
            'false',
            'Force the busy state; unnecessary when onAction returns a promise.',
          ],
          [
            'onAction',
            '() => void | Promise<unknown>',
            '',
            'A promise makes it busy, then shows a rejection inline. Never closes itself.',
          ],
          ['onCancel', '() => void', '', 'Cancel also fires on Escape and on the backdrop.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ DurationInput */

export function DurationInputPage() {
  const [hours, setHours] = useState<number | ''>(48);
  return (
    <>
      <Import names="DurationInput" />
      <Playground
        knobs={{
          label: { kind: 'text', init: 'request age threshold' },
          unit: {
            kind: 'select',
            options: ['minutes', 'hours', 'days', 'days ago'],
            init: 'hours',
          },
        }}
        render={(v) => (
          <DurationInput
            className="w-64"
            label={v.label as string}
            unit={v.unit as string}
            value={hours}
            onChange={setHours}
            info="Minimum age of an unfilled request. 0 disables the scanner."
          />
        )}
        code={(v) =>
          `<DurationInput label="${String(v.label)}" unit="${String(v.unit)}" value={value} onChange={setValue} info="..." />`
        }
      />

      <Demo
        title="The unit is in the field"
        note="A bare number box with the word 'hours' somewhere beside it is how a value gets entered in the wrong scale. What zero does goes on the (i), not under the field."
        stack
        code={`<DurationInput
  label="search cooldown"
  unit="days"
  value={value}
  onChange={setValue}
  info="Minimum time between searches for the same item. 0 disables the cooldown."
/>`}
      >
        <DurationInput
          className="w-64"
          label="request age threshold"
          unit="hours"
          value={hours}
          onChange={setHours}
          info="Minimum age of an unfilled request. 0 disables the scanner."
        />
        <DurationInput
          className="w-64"
          label="ignore items added more than"
          unit="days ago"
          value={365}
          onChange={() => undefined}
          info="Skips items added before this. 0 removes the limit."
        />
        <DurationInput
          className="w-64"
          label="search cooldown"
          unit="days"
          value={0}
          onChange={() => undefined}
          error="Must be at least 1 day."
        />
      </Demo>

      <Props
        rows={[
          ['label', 'ReactNode', '', ''],
          [
            'unit',
            'DurationUnit',
            '',
            "'minutes' | 'hours' | 'days', or any label - 'days ago' is one.",
          ],
          ['value', "number | ''", '', 'Empty string while the field is cleared.'],
          ['onChange', "(v: number | '') => void", '', 'Already clamped to min/max.'],
          ['min / max / step', 'number', '0 / - / 1', ''],
          ['info', 'string', '', 'What the number means and what 0 does.'],
          ['error', 'ReactNode', '', 'The only prose under the control.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ CronInput */

export function CronInputPage() {
  const [expr, setExpr] = useState('*/5 * * * *');
  return (
    <>
      <Import names="CronInput, cronRuns" />
      <Demo
        title="Chips first, expression second"
        note="The answer is almost always one of four, so nobody should have to write */15 * * * * to get it. Try 'advanced' and break the expression."
        stack
        code={`<CronInput label="Monitor schedule" value={expr} onChange={setExpr} info="How often to poll Sonarr and Radarr." />`}
      >
        <CronInput
          label="Monitor schedule"
          info="How often to poll Sonarr and Radarr."
          value={expr}
          onChange={setExpr}
        />
      </Demo>

      <Demo
        title="States"
        note="The next firings are the validation that matters: a syntactically perfect expression that fires on the 31st of February is still wrong, and only the run list says so."
        stack
        code={`<CronInput value="0 3 * * 1" onChange={setExpr} advanced />
<CronInput value="*/0 * * *" onChange={setExpr} advanced />
<CronInput value="0 0 31 2 *" onChange={setExpr} advanced />`}
      >
        <CronInput label="valid" value="0 3 * * 1" onChange={() => undefined} advanced />
        <CronInput label="malformed" value="*/0 * * *" onChange={() => undefined} advanced />
        <CronInput label="never fires" value="0 0 31 2 *" onChange={() => undefined} advanced />
      </Demo>

      <Demo
        title="cronRuns, on its own"
        note="The matcher is exported: five fields, *, lists, ranges and steps, brute-forced a minute at a time over a 366-day horizon. Zero dependencies."
        stack
        code={`const { runs, error } = cronRuns('0 3 * * 1', 3);`}
      >
        <pre className="w-full overflow-x-auto font-mono text-caption text-text-dim">
          {JSON.stringify(
            {
              runs: cronRuns('0 3 * * 1', 3).runs?.map((d) => d.toISOString()),
              error: cronRuns('*/0 * * *').error,
            },
            null,
            2,
          )}
        </pre>
      </Demo>

      <Props
        rows={[
          ['value', 'string', '', 'The five-field expression.'],
          ['onChange', '(expression: string) => void', '', 'From a preset chip or the raw field.'],
          ['presets', 'CronPreset[]', 'every 5/15/30 min, hourly', '{ label, expression }.'],
          ['advanced', 'boolean', '', 'Controlled disclosure; omit for internal state.'],
          ['onAdvancedChange', '(open: boolean) => void', '', 'So the fold can live in the URL.'],
          ['runs', 'number', '3', 'How many firings to list.'],
          ['info', 'string', '', 'What the schedule drives.'],
        ]}
      />
      <Snippet
        code={`import { cronRuns, formatCronRun, formatCronRelative, parseCronField } from '@hoobi/design';

const { runs, error } = cronRuns('*/15 * * * *', 3);`}
      />
    </>
  );
}

/* ------------------------------------------------------------------ CopyField */

export function CopyFieldPage() {
  return (
    <>
      <Import names="CopyField" />
      <Demo
        title="A value to paste somewhere else"
        note="Chip fill and mono, so it never reads as an editable field, with copy as the only affordance."
        stack
        code={`<CopyField
  label="redirect URI"
  info="Register this exact URI on the Entra app registration."
  value="https://mendarr.example.com/auth/callback"
/>`}
      >
        <CopyField
          className="w-full max-w-120"
          label="redirect URI"
          info="Register this exact URI on the Entra app registration."
          value="https://mendarr.example.com/auth/callback"
        />
      </Demo>

      <Demo
        title="Rows, for a block of settings"
        note="`name` puts a fixed-width label inside the row instead, so a stack of them lines up. `display` masks a secret while copy still hands over the real value."
        stack
        flush
        code={`<CopyField name="webhook url" value={url} />
<CopyField name="auth header" value={secret} display="••••••••••••" />`}
      >
        <div className="flex w-full flex-col gap-px overflow-hidden rounded-control">
          <CopyField name="webhook url" value="http://mendarr:3144/webhook/seerr" />
          <CopyField name="auth header" value="s3cr3t" display="••••••••••••" />
        </div>
      </Demo>

      <Props
        rows={[
          ['value', 'string', '', 'What lands on the clipboard.'],
          ['label', 'ReactNode', '', 'Caption label above the row.'],
          ['name', 'ReactNode', '', 'A 96px label inside the row instead.'],
          [
            'display',
            'ReactNode',
            '',
            'Shown in place of the value; value is still what is copied.',
          ],
          ['info', 'string', '', '(i) beside the label.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ ConnectionCard */

export function ConnectionCardPage() {
  const [editing, setEditing] = useState(false);
  const [failSave, setFailSave] = useState(true);
  const [probe, setProbe] = useState<Record<string, string>>({});
  return (
    <>
      <Import names="ConnectionCard" />
      <Demo
        title="A grid of upstreams"
        note="Full height, so a responsive grid lines up whatever each card holds. No description in the header: six paragraphs of prose in a grid is a wall. Press Test on prowlarr and on bazarr - the button reports the CALL (busy, tick, or the error on its tooltip) and the result line reports the FINDING. Press edit on sonarr: an editing card with onSave ends in cancel + Save, and the first Save fails so you can see it stay open."
        stack
        code={`<ConnectionCard
  name="sonarr"
  health={{ ok: true, ms: 18 }}
  rows={[
    { label: 'url', value: 'http://sonarr:8989', mono: true },
    { label: 'api key', value: 'set', tone: 'success' },
  ]}
  result="reachable · 18 ms · just now"
  onTest={test}
  editing={editing}
  onEditingChange={setEditing}
/>`}
      >
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <ConnectionCard
            name="sonarr"
            health={{ ok: true, ms: 18 }}
            rows={[
              { label: 'url', value: 'http://sonarr:8989', mono: true },
              { label: 'api key', value: 'set', tone: 'success' },
            ]}
            result="reachable · 18 ms · just now"
            onTest={() => undefined}
            editing={editing}
            onEditingChange={setEditing}
            onSave={async () => {
              await wait(900);
              if (failSave) {
                setFailSave(false);
                throw new Error('Sonarr rejected the api key');
              }
            }}
          >
            <Input label="base url" mono defaultValue="http://sonarr:8989" />
            <SecretField label="api key" set />
          </ConnectionCard>
          <ConnectionCard
            name="seerr"
            health={{ ok: false }}
            rows={[
              { label: 'url', value: 'http://seerr:5057', mono: true },
              { label: 'api key', value: 'set', tone: 'success' },
              { label: 'bot user', value: 'could not resolve', tone: 'danger' },
            ]}
            result="connect ECONNREFUSED seerr:5057"
            resultTone="danger"
            onTest={() => undefined}
            onEditingChange={() => undefined}
          />
          <ConnectionCard
            name="prowlarr"
            optional
            health={{ ok: true, ms: 64 }}
            rows={[
              { label: 'url', value: 'http://prowlarr:9696', mono: true },
              { label: 'api key', value: 'set', tone: 'success' },
            ]}
            result={probe.prowlarr}
            onTest={async () => {
              await wait(900);
              setProbe((p) => ({ ...p, prowlarr: 'reachable · 61 ms · just now' }));
            }}
            onEditingChange={() => undefined}
          />
          <ConnectionCard
            name="bazarr"
            optional
            rows={[
              { label: 'url', value: 'not set', tone: 'dim' },
              { label: 'api key', value: 'not set', tone: 'mute' },
            ]}
            result={probe.bazarr}
            resultTone="danger"
            onTest={async () => {
              await wait(900);
              setProbe((p) => ({ ...p, bazarr: 'no base url' }));
              throw new Error('no base url configured for bazarr');
            }}
            onEditingChange={() => undefined}
          />
        </div>
      </Demo>

      <Props
        rows={[
          ['name', 'string', '', 'The service, mono: it is a hostname, not a title.'],
          ['optional', 'boolean', 'false', 'The app runs without it.'],
          [
            'health',
            'ConnectionHealth',
            '',
            "{ ok, ms?, label? }. Omitted reads 'not configured'.",
          ],
          ['rows', 'ConnectionRow[]', '', '{ label, value, tone?, mono? } - the static view.'],
          ['children', 'ReactNode', '', 'The form, swapped in while editing.'],
          [
            'editing / onEditingChange',
            'boolean / (v) => void',
            '',
            'Controlled. Omit the handler to drop the edit button.',
          ],
          [
            'onSave',
            '() => void | Promise<unknown>',
            '',
            'Turns the editing footer into cancel + Save. Resolving leaves edit mode; rejecting stays.',
          ],
          [
            'result / resultTone',
            "ReactNode / 'neutral' | 'danger'",
            "'neutral'",
            'The last test outcome.',
          ],
          [
            'onTest',
            '() => void | Promise<unknown>',
            '',
            'A promise makes Test an ActionButton: busy, tick, or the error on its tooltip. Omit to drop the button.',
          ],
          ['testing', 'boolean', 'false', 'Deprecated. Forces busy; return a promise instead.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ SectionNav */

const NAV_ITEMS = [
  { id: 'connections', label: 'Connections', dirty: true },
  { id: 'llm', label: 'LLM' },
  { id: 'notify', label: 'Notifications' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'scanner', label: 'Request scanner' },
  { id: 'webhook', label: 'Webhook' },
  { id: 'security', label: 'Security' },
];

export function SectionNavPage() {
  const [active, setActive] = useState('connections');
  return (
    <>
      <Import names="SectionNav" />
      <Demo
        title="It spies on the page"
        note="Omit activeId and the nav follows the scroll itself - an IntersectionObserver on the nearest scrolling ancestor, cropped to the top 30% so the section nearest the top wins, with the bottom of the scroll claiming the last one. Scroll the pane, then click an item."
        stack
        flush
        code={`<div className="flex gap-6 overflow-y-auto">
  <SectionNav items={items} onSelect={() => {}} />
  <main>{sections}</main>
</div>`}
      >
        <div className="styled-scrollbar flex h-100 w-full gap-6 overflow-y-auto rounded-panel bg-bg p-4">
          <SectionNav items={NAV_ITEMS} onSelect={() => undefined} className="!top-0" />
          <SectionNav items={NAV_ITEMS} onSelect={() => undefined} variant="chips" />
          <main className="flex min-w-0 flex-1 flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Section key={item.id} id={item.id} title={item.label} panel>
                <div className="h-60 rounded-panel bg-surface-raised" />
              </Section>
            ))}
          </main>
        </div>
      </Demo>

      <Demo
        title="Rail and chips"
        note="Render both: the rail hides below md, the chips hide from md up. Narrow the window to swap them. activeId is the controlled override, for a nav driven by a router instead of the scroll."
        stack
        code={`<SectionNav items={items} activeId={active} onSelect={setActive} />
<SectionNav items={items} activeId={active} onSelect={setActive} variant="chips" />`}
      >
        <SectionNav
          items={NAV_ITEMS}
          activeId={active}
          onSelect={setActive}
          className="!static !flex"
        />
        <SectionNav
          items={NAV_ITEMS}
          activeId={active}
          onSelect={setActive}
          variant="chips"
          className="!flex"
        />
      </Demo>

      <Props
        rows={[
          [
            'items',
            'SectionNavItem[]',
            '',
            '{ id, label, dirty? } - id is the section element id.',
          ],
          [
            'activeId',
            'string',
            '',
            'Controlled override. Omit it and the nav spies on the scroll itself.',
          ],
          [
            'onSelect',
            '(id: string) => void',
            '',
            'Fired on click; the component also scrolls the section into view.',
          ],
          ['variant', "'rail' | 'chips'", "'rail'", 'rail hides below md; chips hide from md up.'],
          ['label', 'string', "'Sections'", 'The nav aria-label.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ UnsavedBar */

export function UnsavedBarPage() {
  const [dirty, setDirty] = useState(['Connections', 'LLM']);
  const [failOnce, setFailOnce] = useState(true);
  return (
    <>
      <Import names="UnsavedBar" />
      <Demo
        title="Which sections, not just that something changed"
        note="On a page you scroll, 'you have unsaved changes' leaves you hunting. Nothing renders when the list is empty. Save is an ActionButton: the first press fails and says why on its tooltip, the second saves and reads Saved."
        stack
        flush
        code={`<UnsavedBar
  sections={dirtySections}
  onSave={() => api.save()}   // a promise: busy -> Saved, or the error on the tooltip
  onDiscard={discard}
/>`}
      >
        <div className="w-full px-4">
          <UnsavedBar
            sections={dirty}
            onSave={async () => {
              await wait(900);
              if (failOnce) {
                setFailOnce(false);
                throw new Error('mendarr returned 500: could not write to mendarr.db');
              }
              setDirty([]);
            }}
            onDiscard={() => {
              setDirty([]);
            }}
          />
          {dirty.length === 0 ? (
            <div className="py-3">
              <Button
                onClick={() => {
                  setDirty(['Connections', 'LLM']);
                }}
              >
                Make something dirty again
              </Button>
            </div>
          ) : null}
        </div>
      </Demo>

      <Props
        rows={[
          ['sections', 'string[]', '', 'Section names holding edits. Empty renders nothing.'],
          [
            'onSave',
            '() => void | Promise<unknown>',
            '',
            'A promise makes Save an ActionButton: busy, then Saved, or the error on its tooltip.',
          ],
          ['onDiscard', '() => void', '', ''],
          ['saving', 'boolean', 'false', 'Forces the saving state, for a parent that tracks it.'],
          ['saveLabel / discardLabel', 'string', "'Save' / 'Discard'", ''],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ Settings recipe */

export function SettingsRecipe() {
  const [temp, setTemp] = useState(0.1);
  const [thinking, setThinking] = useState(true);
  const [expr, setExpr] = useState('*/5 * * * *');
  const [hours, setHours] = useState<number | ''>(48);
  const [scanner, setScanner] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [dirty, setDirty] = useState<string[]>([]);
  const touch = (s: string) => {
    setDirty((d) => (d.includes(s) ? d : [...d, s]));
  };
  const NAV = [
    { id: 'recipe-connections', label: 'Connections', dirty: dirty.includes('Connections') },
    { id: 'recipe-llm', label: 'LLM', dirty: dirty.includes('LLM') },
    { id: 'recipe-notify', label: 'Notifications' },
    { id: 'recipe-behaviour', label: 'Behaviour', dirty: dirty.includes('Behaviour') },
    {
      id: 'recipe-scanner',
      label: 'Request scanner',
      dirty: dirty.includes('Request scanner'),
    },
    { id: 'recipe-webhook', label: 'Webhook' },
    { id: 'recipe-security', label: 'Security' },
  ];

  return (
    <>
      <p className="text-body text-text-dim">
        The whole page: a jump list, panel sections, and a bar that only exists while something is
        unsaved. Every explanation is on an (i); the only sentences on screen are one line per
        section and the cron readout.
      </p>
      <div className="styled-scrollbar mt-4 h-160 overflow-y-auto rounded-panel bg-bg p-4">
        <div className="flex items-start gap-6">
          <SectionNav items={NAV} onSelect={() => undefined} className="!top-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <SectionNav items={NAV} onSelect={() => undefined} variant="chips" />
            <main className="flex min-w-0 flex-1 flex-col gap-4">
              <Section
                id="recipe-connections"
                title="Connections"
                caption="Health is checked every minute."
                panel
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConnectionCard
                    name="sonarr"
                    health={{ ok: true, ms: 18 }}
                    rows={[
                      { label: 'url', value: 'http://sonarr:8989', mono: true },
                      { label: 'api key', value: 'set', tone: 'success' },
                    ]}
                    onTest={() => {
                      touch('Connections');
                    }}
                    onEditingChange={() => undefined}
                  />
                  <ConnectionCard
                    name="radarr"
                    health={{ ok: true, ms: 22 }}
                    rows={[
                      { label: 'url', value: 'http://radarr:7878', mono: true },
                      { label: 'api key', value: 'set', tone: 'success' },
                    ]}
                    onTest={() => undefined}
                    onEditingChange={() => undefined}
                  />
                </div>
              </Section>

              <Section id="recipe-llm" title="LLM" caption="OpenAI-compatible endpoint." panel>
                <div className="grid gap-4 rounded-panel bg-surface-raised p-4 sm:grid-cols-2">
                  <Input label="base url" mono defaultValue="http://llama-swap:8080/v1" />
                  <Input
                    label="model"
                    mono
                    defaultValue="qwen3-30b-a3b"
                    info="Any model the endpoint serves."
                  />
                  <SecretField
                    label="api key"
                    set
                    onChange={() => {
                      touch('LLM');
                    }}
                  />
                  <Slider
                    label="temperature"
                    info="Lower is more deterministic."
                    valueLabel={temp.toFixed(2)}
                    min={0}
                    max={2}
                    step={0.05}
                    value={temp}
                    onChange={(e) => {
                      setTemp(Number(e.target.value));
                      touch('LLM');
                    }}
                  />
                  <Select
                    label="reasoning"
                    info="Required for Qwen reasoning models."
                    defaultValue="off"
                  >
                    <option value="off">off</option>
                    <option value="on">on</option>
                  </Select>
                  <Switch
                    checked={thinking}
                    onCheckedChange={(v) => {
                      setThinking(v);
                      touch('LLM');
                    }}
                    label="disable thinking"
                    info="Required for Qwen reasoning models."
                  />
                </div>
              </Section>

              <Section id="recipe-notify" title="Notifications &amp; sign-in" panel>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConnectionCard
                    name="telegram"
                    health={{ ok: true, label: 'on' }}
                    rows={[
                      { label: 'bot token', value: 'set', tone: 'success' },
                      { label: 'chat id', value: '-1001987654321', mono: true },
                    ]}
                  />
                  <ConnectionCard
                    name="microsoft entra"
                    optional
                    rows={[
                      { label: 'tenant id', value: 'not set', tone: 'mute' },
                      { label: 'client id', value: 'not set', tone: 'mute' },
                    ]}
                  />
                </div>
              </Section>

              <Section id="recipe-behaviour" title="Behaviour" panel>
                <div className="flex flex-col gap-4 rounded-panel bg-surface-raised p-4">
                  <Switch
                    align="between"
                    checked={autoApprove}
                    onCheckedChange={(v) => {
                      setAutoApprove(v);
                      touch('Behaviour');
                    }}
                    label="Auto-approve when the reporter is the requester"
                    info="Executes the plan immediately when the reporter also requested the media."
                  />
                  <CronInput
                    label="Monitor schedule"
                    info="How often to poll Sonarr and Radarr."
                    value={expr}
                    onChange={(v) => {
                      setExpr(v);
                      touch('Behaviour');
                    }}
                  />
                </div>
              </Section>

              <Section
                id="recipe-scanner"
                title="Unfilled request scanner"
                caption="Opens Seerr issues for requests that were never filled."
                panel
                actions={
                  <Switch
                    checked={scanner}
                    onCheckedChange={(v) => {
                      setScanner(v);
                      touch('Request scanner');
                    }}
                    aria-label="Unfilled request scanner"
                  />
                }
              >
                {scanner ? (
                  <div className="grid gap-4 rounded-panel bg-surface-raised p-4 sm:grid-cols-2">
                    <DurationInput
                      label="request age threshold"
                      unit="hours"
                      value={hours}
                      onChange={(v) => {
                        setHours(v);
                        touch('Request scanner');
                      }}
                      info="Minimum age of an unfilled request. 0 disables the scanner."
                    />
                    <DurationInput
                      label="ignore items added more than"
                      unit="days ago"
                      value={365}
                      onChange={() => undefined}
                      info="Skips items added before this. 0 removes the limit."
                    />
                  </div>
                ) : null}
              </Section>

              <Section id="recipe-webhook" title="Webhook" panel>
                <div className="flex flex-col gap-4 rounded-panel bg-surface-raised p-4">
                  <CopyField
                    label="endpoint"
                    info="Derived from the public url. Register this in Seerr."
                    value="http://mendarr:3144/webhook/seerr"
                  />
                  <SecretField label="shared secret" set />
                </div>
              </Section>

              <Section id="recipe-security" title="Security" panel>
                <div className="flex flex-col gap-4 rounded-panel bg-surface-raised p-4">
                  <SecretField
                    variant="reveal"
                    label="mendarr API key"
                    set
                    revealedValue="mnd_4f9c1e7b2a8d43c0b6e5f1a2d9c8b7a6"
                    onRegenerate={() => undefined}
                  />
                  <Divider />
                  <SecretField
                    variant="hidden"
                    label="Cookie secret"
                    set
                    onRotate={() => undefined}
                  />
                </div>
              </Section>

              <UnsavedBar
                sections={dirty}
                onSave={() => {
                  setDirty([]);
                }}
                onDiscard={() => {
                  setDirty([]);
                }}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ Steps */

const WIZARD_STEPS = [
  { label: 'Seerr', summary: 'http://seerr:5057' },
  { label: 'Media servers', summary: 'sonarr, radarr' },
  { label: 'Jellyfin', summary: 'http://jellyfin:8096' },
  { label: 'Done' },
];

export function StepsPage() {
  const [current, setCurrent] = useState(1);
  return (
    <>
      <Import names="Steps" />
      <Demo
        title="Chevrons wide, a list narrow"
        note="A row of clipped arrows reads as a direction; four of them at 360px read as four ellipses, so below md it becomes a stacked list and a completed step says what it settled on."
        stack
        code={`<Steps steps={steps} current={step} onSelect={setStep} />`}
      >
        <div className="w-full rounded-panel bg-bg p-4">
          <Steps steps={WIZARD_STEPS} current={current} onSelect={setCurrent} />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={current === 0}
            onClick={() => {
              setCurrent(current - 1);
            }}
          >
            Back
          </Button>
          <Button
            variant="primary"
            disabled={current === WIZARD_STEPS.length - 1}
            onClick={() => {
              setCurrent(current + 1);
            }}
          >
            Continue
          </Button>
        </div>
      </Demo>

      <Demo
        title="Every position"
        note="Pending is chip and muted, active is surface-raised with an accent number, done is surface with a green tick."
        stack
        code={`<Steps steps={steps} current={0} />
<Steps steps={steps} current={3} />`}
      >
        {/* On bg, not surface: a done step is filled with surface, so a surface-filled demo
            card hides exactly the state this demo exists to show. */}
        <div className="flex w-full flex-col gap-4 rounded-panel bg-bg p-4">
          <Steps steps={WIZARD_STEPS} current={0} />
          <Steps steps={WIZARD_STEPS} current={2} />
          <Steps steps={WIZARD_STEPS} current={3} />
        </div>
      </Demo>

      <Props
        rows={[
          [
            'steps',
            'Step[]',
            '',
            '{ label, summary? } - summary shows on a done step, stacked only.',
          ],
          ['current', 'number', '', '0-based: before it is done, after it is pending.'],
          [
            'onSelect',
            '(index: number) => void',
            '',
            'Makes completed steps clickable. Omit for a read-only trail.',
          ],
          ['label', 'string', "'Progress'", 'The list aria-label.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ ActionButton */

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export function ActionButtonPage() {
  return (
    <>
      <Import names="ActionButton" />
      <Demo
        title="The promise is the state"
        note="Press each one. Busy while it runs, a green tick for a moment on resolve, a red state for longer on reject with the message on the button's tooltip and title. A second press mid-flight is ignored."
        code={`<ActionButton action={() => api.reregister()}>Re-register in Seerr</ActionButton>

<ActionButton action={save} successLabel="Saved" variant="primary">Save</ActionButton>

<ActionButton action={() => Promise.reject(new Error('Seerr returned 403'))}>
  Re-register in Seerr
</ActionButton>`}
      >
        <ActionButton
          action={async () => {
            await wait(1200);
          }}
        >
          Re-register in Seerr
        </ActionButton>
        <ActionButton
          variant="primary"
          successLabel="Saved"
          action={async () => {
            await wait(900);
          }}
        >
          Save
        </ActionButton>
        <ActionButton
          action={async () => {
            await wait(900);
            throw new Error('Seerr returned 403');
          }}
        >
          Re-register in Seerr
        </ActionButton>
        <ActionButton
          size="sm"
          failureLabel="Failed"
          action={async () => {
            await wait(700);
            throw new Error('connect ECONNREFUSED seerr:5057');
          }}
        >
          Test
        </ActionButton>
      </Demo>

      <Demo
        title="Button busy, when you already track it"
        note="The label keeps its place and its width - a spinner sits over it - so a row of buttons does not shuffle the moment one is pressed."
        code={`<Button busy>Save</Button>`}
      >
        <Button>Save</Button>
        <Button busy>Save</Button>
        <Button variant="primary" busy>
          Re-register in Seerr
        </Button>
        <Button size="sm" busy>
          Test
        </Button>
      </Demo>

      <DoDont
        rule="An async button reports its own outcome"
        why="A plain Button with an async onClick has no way to say it is working, worked, or failed - and a button that quietly failed is the bug this component exists to prevent."
        doLabel="ActionButton: busy, then success or the error."
        dontLabel="A button that looks identical before and after."
      >
        <ActionButton
          action={async () => {
            await wait(900);
          }}
        >
          Re-register in Seerr
        </ActionButton>
        <Button
          onClick={() => {
            void wait(900);
          }}
        >
          Re-register in Seerr
        </Button>
      </DoDont>

      <Props
        rows={[
          ['action', '() => Promise<unknown>', '', 'The work. Its promise drives every state.'],
          ['successLabel', 'ReactNode', '', 'Swaps the label while success holds - Save to Saved.'],
          ['failureLabel', 'ReactNode', '', 'Swaps the label while failure holds.'],
          ['successMs / failureMs', 'number', '1500 / 3000', 'How long the transient states hold.'],
          [
            'variant / size',
            'ButtonProps',
            "'secondary' / 'md'",
            'Everything Button takes except onClick and busy.',
          ],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ FormDialog */

export function FormDialogPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [again, setAgain] = useState('');
  const [failFirst, setFailFirst] = useState(true);

  return (
    <>
      <Import names="FormDialog" />
      <Demo
        title="Invalid, valid, submitting, failed"
        note="Open it: Save is dead until the fields satisfy their own constraints (required, minLength 8) AND the two passwords match. Submitting runs the promise; the first attempt fails and the dialog stays open with the reason. Enter submits."
        code={`<FormDialog
  open={open}
  title="Set a password"
  submitLabel="Set password"
  valid={pw === again}
  onSubmit={() => api.setPassword(pw)}
  onCancel={() => setOpen(false)}
>
  <Input label="username" required value={name} onChange={...} />
  <Input label="password" type="password" required minLength={8} ... />
  <Input label="repeat password" type="password" required error={...} ... />
</FormDialog>`}
      >
        <Button
          variant="primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Set a password
        </Button>
        <span className="text-caption text-text-mute">8+ characters, and the two must match.</span>
      </Demo>

      <FormDialog
        open={open}
        title="Set a password"
        submitLabel="Set password"
        valid={pw !== '' && pw === again}
        onSubmit={async () => {
          await wait(1000);
          if (failFirst) {
            setFailFirst(false);
            throw new Error('Jellyfin rejected the password: it is on the common-password list.');
          }
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Input
          label="username"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <Input
          label="password"
          type="password"
          required
          minLength={8}
          info="At least 8 characters."
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
          }}
        />
        <Input
          label="repeat password"
          type="password"
          required
          value={again}
          error={again !== '' && again !== pw ? 'The two passwords do not match.' : undefined}
          onChange={(e) => {
            setAgain(e.target.value);
          }}
        />
      </FormDialog>

      <DoDont
        rule="Fields get a FormDialog, yes-or-no gets an ActionDialog"
        why="Validity, Enter-to-submit and a disabled submit are form problems; a confirm has nothing to validate. Splitting them keeps ActionDialog free of a prop that would only ever mean something here."
        doLabel="FormDialog: fields, native validity, Enter submits."
        dontLabel="An ActionDialog with inputs stuffed into its body."
      >
        <Button
          variant="primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Set a password
        </Button>
        <Button variant="primary">Confirm</Button>
      </DoDont>

      <Props
        rows={[
          [
            'children',
            'ReactNode',
            '',
            'The fields. They are the form children, so required/pattern/type validate.',
          ],
          ['submitLabel', 'ReactNode', 'required', 'Names what submitting does. No default.'],
          ['cancelLabel', 'ReactNode', "'Cancel'", ''],
          [
            'valid',
            'boolean',
            'true',
            'A cross-field rule the browser cannot express. ANDed with checkValidity().',
          ],
          [
            'busy',
            'boolean',
            'false',
            'Force the busy state; unnecessary when onSubmit returns a promise.',
          ],
          [
            'onSubmit',
            '(e: FormEvent) => void | Promise<unknown>',
            '',
            'Enter or the button. A promise drives busy and the inline error. Never closes itself.',
          ],
          ['tone', "'default' | 'danger'", "'default'", 'A form is almost never danger.'],
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ Toast */

export function ToasterPage() {
  return (
    <>
      <Import names="Toaster, toast" />
      <Demo
        title="Mount one Toaster, then call toast()"
        note="A module-level store, so a poll callback or a socket message can raise one without a component to hang a hook off. Three at most, newest at the bottom, bottom-right here and full width along the bottom edge on a phone."
        code={`// once, near the root
<Toaster />

// anywhere at all
toast({ title: 'Issue 12 resolved', description: 'The replacement imported cleanly.' });`}
      >
        <Button
          onClick={() => {
            toast({
              title: 'Issue 12 resolved',
              description: 'The replacement imported cleanly.',
            });
          }}
        >
          default
        </Button>
        <Button
          onClick={() => {
            toast({
              tone: 'success',
              title: 'Sweep finished',
              description: '18 issues analysed, 2 plans waiting.',
            });
          }}
        >
          success
        </Button>
        <Button
          onClick={() => {
            toast({
              tone: 'warn',
              title: 'Telegram is not configured',
              description: 'Approvals can only come from the API until a bot token is set.',
            });
          }}
        >
          warn
        </Button>
        <Button
          onClick={() => {
            toast({
              tone: 'danger',
              title: 'Seerr is unreachable',
              description: 'connect ECONNREFUSED seerr:5057',
            });
          }}
        >
          danger
        </Button>
      </Demo>

      <Demo
        title="Action, and sticky"
        note="An action dismisses the toast when pressed. duration 0 makes it sticky - for a job that will take its own toast down when it finishes, through the handle toast() returns."
        code={`toast({
  tone: 'success',
  title: 'Plan reverted',
  action: { label: 'Undo', onClick: () => api.reapply() },
});

const t = toast({ title: 'Scanning…', duration: 0 });
// later
t.dismiss();`}
      >
        <Button
          onClick={() => {
            toast({
              tone: 'success',
              title: 'Plan reverted',
              description: 'The blocklisted release was restored.',
              action: {
                label: 'Undo',
                onClick: () => {
                  toast({ title: 'Re-applied' });
                },
              },
            });
          }}
        >
          with an action
        </Button>
        <Button
          onClick={() => {
            const handle = toast({
              title: 'Scanning the library…',
              description: 'This one is sticky; it takes itself down when the job ends.',
              duration: 0,
            });
            setTimeout(() => {
              handle.dismiss();
              toast({ tone: 'success', title: 'Scan finished', description: '3 gaps found.' });
            }, 2500);
          }}
        >
          sticky, then replaced
        </Button>
        <Button
          onClick={() => {
            dismissAllToasts();
          }}
        >
          dismiss all
        </Button>
      </Demo>

      <DoDont
        rule="A toast is news you did not ask for"
        why="A background outcome nobody clicked for - a job that finished, an auto-correction that landed - is a toast. The result of a button someone pressed belongs on that button, where they are already looking."
        doLabel="toast() for the sweep that finished on its own."
        dontLabel="A toast for the Save the person is watching."
      >
        <Button
          onClick={() => {
            toast({ tone: 'success', title: 'Sweep finished', description: '2 plans waiting.' });
          }}
        >
          Simulate a background job
        </Button>
        <ActionButton
          variant="primary"
          successLabel="Saved"
          action={async () => {
            await wait(800);
          }}
        >
          Save
        </ActionButton>
      </DoDont>

      <Props
        rows={[
          ['title', 'string', '', 'One line. The whole point of the toast.'],
          ['description', 'string', '', 'A second line of detail. Optional.'],
          [
            'tone',
            "'default' | 'success' | 'warn' | 'danger'",
            "'default'",
            '15% tint and a leading dot. danger takes role="alert", the rest role="status".',
          ],
          ['duration', 'number', '4000', '0 is sticky. The timer pauses on hover and on focus.'],
          [
            'action',
            '{ label, onClick }',
            '',
            'One thing to do about it. Dismisses the toast when pressed.',
          ],
          ['-> returns', 'ToastHandle', '', '{ id, dismiss } - take your own toast down.'],
        ]}
      />
    </>
  );
}
