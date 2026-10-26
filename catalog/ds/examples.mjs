const openFirstButton = `const ref = useRef(null);
useEffect(() => { ref.current.querySelector('button').click(); }, []);
`;

const stages = `[
  { id: 'fetch', name: 'Fetch', tone: 'info', runs: '4s' },
  { id: 'verify', name: 'Verify', tone: 'success', runs: '1s' },
  { id: 'import', name: 'Import', tone: 'warn', runs: '12s' },
  { id: 'rename', name: 'Rename', tone: 'neutral', runs: '0s' },
]`;

const steps = `[
  { label: 'Seerr', summary: 'http://seerr:5057' },
  { label: 'Media servers', summary: 'sonarr, radarr' },
  { label: 'Jellyfin', summary: 'http://jellyfin:8096' },
  { label: 'Done' },
]`;

const navItems = `[
  { id: 'connections', label: 'Connections', dirty: true },
  { id: 'llm', label: 'LLM' },
  { id: 'notify', label: 'Notifications' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'security', label: 'Security' },
]`;

const releases = `[
  { title: 'Show.S01E09.1080p.NF.WEB-DL.AAC2.0.H.264-VARYG', score: 301, quality: 'WEBDL-1080p', sizeGb: 1.0, ok: true },
  { title: '[Erai-raws] Show - 09 [1080p][MultiSub]', score: 351, quality: 'WEBDL-1080p', sizeGb: 1.4, ok: true },
  { title: 'Show.S01E09.REPACK.1080p.WEB.MSubs-GROUP', score: 1, quality: 'WEBDL-1080p', sizeGb: 0.9, ok: false },
  { title: '[Judas] Show 09 (720p) [A1B2C3D4]', quality: 'HDTV-720p', sizeGb: 0.5, ok: true },
]`;

export default {
  Shell: [
    {
      title: 'The page chrome',
      bare: true,
      height: 420,
      code: `<Shell
  brand={<span className="flex size-6 items-center justify-center rounded-control bg-accent text-caption text-on-accent">m</span>}
  title="mendarr"
  subtitle="v2.4.0"
  mirage={mirageImage()}
  nav={
    <>
      <Shell.Group label="Library">
        <Shell.Item href="#issues" label="Issues" active meta={<Badge tone="danger">3</Badge>} />
        <Shell.Item href="#timeline" label="Timeline" />
      </Shell.Group>
      <Shell.Group label="Settings">
        <Shell.Item href="#connections" label="Connections" />
        <Shell.Item href="#schedule" label="Schedule" />
      </Shell.Group>
    </>
  }
  navFooter={<Shell.User name="hoobi" detail="user@example.com" />}
>
  <h1 className="text-title text-text">Issues</h1>
  <p className="mt-1 text-body text-text-dim">Three need a decision.</p>
</Shell>`,
    },
  ],
  Menu: [
    {
      title: 'The row set',
      height: 280,
      code: `${openFirstButton}
<div ref={ref}>
  <Menu label="Account">
    <Menu.Label>Signed in as hoobi</Menu.Label>
    <Menu.Item>Copy API key</Menu.Item>
    <Menu.Item action={<Button size="sm" variant="ghost">Unlink</Button>}>user@example.com</Menu.Item>
    <Menu.Divider />
    <Menu.Item tone="danger">Sign out</Menu.Item>
  </Menu>
</div>`,
    },
  ],
  Popover: [
    {
      title: 'Wrapped trigger',
      height: 220,
      code: `${openFirstButton}
<div ref={ref}>
  <Popover label="Add an origin" trigger={<Badge tone="accent">+ origin</Badge>}>
    <Checkbox label="Example Guild" />
    <Checkbox label="Vanilla crew" />
    <Button variant="primary" size="sm">Add</Button>
  </Popover>
</div>`,
    },
  ],
  Modal: [
    {
      title: 'Open',
      note: 'A native <dialog> with showModal(), so Escape, the focus trap and the inert backdrop come from the platform. Clicking the backdrop closes it.',
      height: 360,
      code: `const [open, setOpen] = useState(true);

<Button variant="primary" onClick={() => setOpen(true)}>Review plan</Button>
<Modal open={open} onClose={() => setOpen(false)} title="Remediation plan">
  <p className="text-body text-text-dim">Delete the current file for Severance S01E03 and trigger a Sonarr search for a better release.</p>
  <div className="mt-4 flex flex-wrap justify-end gap-2">
    <Button onClick={() => setOpen(false)}>Reject</Button>
    <Button variant="primary" onClick={() => setOpen(false)}>Approve</Button>
  </div>
</Modal>`,
    },
  ],
  Sheet: [
    {
      title: 'Open',
      height: 480,
      code: `const [open, setOpen] = useState(true);

<Button variant="primary" onClick={() => setOpen(true)}>New rule</Button>
<Sheet
  open={open}
  onClose={() => setOpen(false)}
  title="New rule"
  description="Applies to every new release."
  footer={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={() => setOpen(false)}>Create</Button>
    </>
  }
>
  <div className="flex flex-col gap-4">
    <Input label="name" placeholder="Prefer WEB-DL" />
    <Select label="quality">
      <option>WEBDL-1080p</option>
      <option>HDTV-720p</option>
    </Select>
  </div>
</Sheet>`,
    },
  ],
  ActionDialog: [
    {
      title: 'Danger',
      height: 300,
      code: `const [open, setOpen] = useState(true);

<Button variant="danger" onClick={() => setOpen(true)}>Rotate</Button>
<ActionDialog
  open={open}
  tone="danger"
  title="Rotate the cookie secret?"
  description="Everyone, including you, will be signed out."
  actionLabel="Rotate"
  onAction={() => setOpen(false)}
  onCancel={() => setOpen(false)}
/>`,
    },
  ],
  FormDialog: [
    {
      title: 'Open',
      height: 440,
      code: `const [open, setOpen] = useState(true);
const [pw, setPw] = useState('');
const [again, setAgain] = useState('');

<Button variant="primary" onClick={() => setOpen(true)}>Set password</Button>
<FormDialog
  open={open}
  title="Set a password"
  submitLabel="Set password"
  valid={pw === again}
  onSubmit={() => setOpen(false)}
  onCancel={() => setOpen(false)}
>
  <Input label="username" required placeholder="hoobi" />
  <Input label="password" type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} />
  <Input label="repeat password" type="password" required value={again} onChange={(e) => setAgain(e.target.value)} error={again && pw !== again ? 'The passwords do not match.' : undefined} />
</FormDialog>`,
    },
  ],
  ConfirmButton: [
    {
      title: 'Two-step confirmation',
      note: 'For trivial, reversible actions only. Anything destructive confirms through ActionDialog.',
      code: `<ConfirmButton onConfirm={() => {}}>Delete file</ConfirmButton>
<ConfirmButton confirmLabel="Yes, revert" timeout={8000} onConfirm={() => {}}>Revert</ConfirmButton>
<ConfirmButton variant="ghost" timeout={2000} onConfirm={() => {}}>Clear</ConfirmButton>
<ConfirmButton size="sm" onConfirm={() => {}}>Blocklist</ConfirmButton>`,
    },
  ],
  CodeBlock: [
    {
      title: 'Highlighted, with copy',
      note: 'Bring your own engine: pass the highlight.js markup as html, and the theme maps its token classes onto Ayu Mirage.',
      stack: true,
      code: `<CodeBlock
  copy
  code={'{\\n  "seerr": "http://seerr:5057",\\n  "retries": 3\\n}'}
  html={'{\\n  <span class="hljs-attr">&quot;seerr&quot;</span><span class="hljs-punctuation">:</span> <span class="hljs-string">&quot;http://seerr:5057&quot;</span><span class="hljs-punctuation">,</span>\\n  <span class="hljs-attr">&quot;retries&quot;</span><span class="hljs-punctuation">:</span> <span class="hljs-number">3</span>\\n}'}
/>`,
    },
    {
      title: 'Plain',
      stack: true,
      code: `<CodeBlock code="pnpm add @hoobi/design" />`,
    },
  ],
  Notice: [
    {
      title: 'Persistent state notice',
      height: 200,
      code: `<Notice open tone="danger" title="Disconnected" onDismiss={() => {}}>
  The server may be updating or restarting. This page reconnects on its own.
</Notice>`,
    },
  ],
  MultiSelect: [
    {
      title: 'Class filter',
      height: 320,
      code: `${openFirstButton}const [classes, setClasses] = useState(['mage']);

<div ref={ref}>
  <MultiSelect
    label="Class"
    options={[
      { value: 'mage', label: 'Mage' },
      { value: 'priest', label: 'Priest' },
      { value: 'rogue', label: 'Rogue' },
      { value: 'warrior', label: 'Warrior' },
    ]}
    value={classes}
    onChange={setClasses}
  />
</div>`,
    },
  ],
  Tabs: [
    {
      title: 'Controlled',
      stack: true,
      code: `const [tab, setTab] = useState('queue');

<Tabs
  value={tab}
  onChange={setTab}
  items={[
    { id: 'queue', label: 'Queue' },
    { id: 'history', label: 'History' },
    { id: 'issues', label: <>Issues <Badge tone="danger">3</Badge></> },
  ]}
/>`,
    },
  ],
  Table: [
    {
      title: 'Sortable, controlled',
      note: 'The table applies the sort; you hold it, usually in the URL. A row with no value sinks to the bottom either way.',
      stack: true,
      height: 300,
      code: `const [sort, setSort] = useState({ column: 'score', direction: 'desc' });

<div className="w-full">
  <Table
    label="Release candidates"
    rows={${releases}}
    rowKey={(r) => r.title}
    sort={sort}
    onSortChange={setSort}
    columns={[
      { id: 'title', header: 'release', primary: true, cell: (r) => (
        <span className="flex flex-col gap-1">
          <span className="font-mono text-caption break-all">{r.title}</span>
          <Badge tone={r.ok ? 'success' : 'danger'} dot className="self-start">{r.ok ? 'grabbable' : 'rejected'}</Badge>
        </span>
      ) },
      { id: 'score', header: 'score', align: 'end', defaultDirection: 'desc', sortValue: (r) => r.score, cell: (r) => r.score === undefined ? '-' : '+' + r.score },
      { id: 'quality', header: 'quality', sortValue: (r) => r.quality, cell: (r) => <Badge>{r.quality}</Badge> },
      { id: 'size', header: 'size', align: 'end', sortValue: (r) => r.sizeGb, cell: (r) => r.sizeGb.toFixed(1) + ' GB' },
    ]}
    rowAction={() => <Button size="sm" variant="secondary">Grab</Button>}
  />
</div>`,
    },
    {
      title: 'Expansion',
      note: 'expansion renders a full-width row under each expanded row; the toggle is your own control in a cell.',
      stack: true,
      height: 260,
      code: `const [expanded, setExpanded] = useState(new Set(['[Erai-raws] Show - 09 [1080p][MultiSub]']));
const toggle = (key) => setExpanded((now) => { const next = new Set(now); if (next.has(key)) next.delete(key); else next.add(key); return next; });

<div className="w-full">
  <Table
    rows={${releases}}
    rowKey={(r) => r.title}
    expansion={{ expanded, render: (r) => <p className="text-caption text-text-dim">{r.title} scored {r.score ?? 'nothing'} against the profile.</p> }}
    columns={[
      { id: 'title', header: 'release', primary: true, cell: (r) => (
        <button type="button" className="text-left text-body text-text" onClick={() => toggle(r.title)}>{r.title}</button>
      ) },
      { id: 'quality', header: 'quality', cell: (r) => <Badge>{r.quality}</Badge> },
    ]}
  />
</div>`,
    },
  ],
  ReorderList: [
    {
      title: 'Drag the grip, or focus it and press Alt with an arrow key',
      stack: true,
      height: 220,
      code: `const [items, setItems] = useState(${stages});

<ReorderList label="Pipeline stages" items={items} itemKey={(s) => s.id} itemLabel={(s) => s.name} onReorder={setItems}>
  {(stage, handle) => (
    <div className="flex items-center gap-3 rounded-panel bg-surface-raised px-2 py-2">
      <ReorderGrip {...handle} />
      <Badge tone={stage.tone} dot>{stage.name}</Badge>
      <span className="ml-auto pr-2 text-caption text-text-mute tabular-nums">{stage.runs}</span>
    </div>
  )}
</ReorderList>`,
    },
  ],
  TimeAxis: [
    {
      title: 'A schedule, three jobs and a single firing',
      stack: true,
      height: 200,
      code: `const from = new Date('2026-01-01T09:00:00');
const at = (m) => new Date(from.getTime() + m * 60000);
const every5 = Array.from({ length: 12 }, (_, i) => ({ at: at(i * 5 + 2) }));

<div className="w-full">
  <TimeAxis
    from={from}
    to={at(60)}
    now={at(31)}
    ticks={[at(0), at(15), at(30), at(45), at(60)]}
    rows={[
      { id: 'monitor', label: 'monitor', marks: every5 },
      { id: 'watchdog', label: 'watchdog', marks: [...every5.slice(0, 6), { at: at(32), tone: 'danger' }] },
      { id: 'scan', label: 'scan', marks: [{ at: at(45) }] },
    ]}
  />
</div>`,
    },
  ],
  Rating: [
    {
      title: 'Committed against preview',
      note: 'Clicking the star that is already the value sets it back to null.',
      code: `const [value, setValue] = useState(3);

<Rating value={value} onChange={setValue} label="Raid performance" />
<Rating value={4} size="sm" label="Read only" />`,
    },
  ],
  Switch: [
    {
      title: 'On and off',
      code: `const [on, setOn] = useState(true);
const [off, setOff] = useState(false);

<Switch checked={on} onCheckedChange={setOn} label="disable thinking" />
<Switch checked={off} onCheckedChange={setOff} label="auto-approve" />`,
    },
    {
      title: 'A settings row: align="between"',
      stack: true,
      code: `const [on, setOn] = useState(true);

<Switch
  align="between"
  checked={on}
  onCheckedChange={setOn}
  label="Auto-approve when the reporter is the requester"
  info="Executes the plan immediately when the reporter also requested the media."
/>`,
    },
  ],
  ColorPicker: [
    {
      title: 'Bound to state',
      height: 320,
      code: `const [colour, setColour] = useState('#409fff');

<ColorPicker
  value={colour}
  onChange={setColour}
  label="Accent"
  names={[
    { name: 'Accent blue', hex: '#73d0ff' },
    { name: 'Accent red', hex: '#f28779' },
    { name: 'Accent green', hex: '#bae67e' },
  ]}
/>`,
    },
  ],
  Slider: [
    {
      title: 'A required readout',
      code: `const [value, setValue] = useState(0.7);

<div className="w-72">
  <Slider label="temperature" valueLabel={value.toFixed(2)} min={0} max={2} step={0.05} value={value} onChange={(e) => setValue(Number(e.target.value))} />
</div>`,
    },
  ],
  DurationInput: [
    {
      title: 'Unit inside the field',
      code: `const [value, setValue] = useState(7);

<div className="w-56">
  <DurationInput
    label="search cooldown"
    unit="days"
    value={value}
    onChange={setValue}
    info="Minimum time between searches for the same item. 0 disables the cooldown."
  />
</div>`,
    },
  ],
  CronInput: [
    {
      title: 'Chips first, expression second',
      stack: true,
      height: 220,
      code: `const [expr, setExpr] = useState('*/15 * * * *');

<CronInput label="Monitor schedule" value={expr} onChange={setExpr} info="How often to poll Sonarr and Radarr." />`,
    },
    {
      title: 'States',
      stack: true,
      height: 260,
      code: `<CronInput label="weekly" value="0 3 * * 1" onChange={() => {}} advanced />
<CronInput label="invalid" value="*/0 * * *" onChange={() => {}} advanced />`,
    },
  ],
  LogViewer: [
    {
      title: 'The log file, in the browser',
      stack: true,
      flush: true,
      height: 420,
      code: `const t0 = new Date('2026-01-01T09:00:00Z').getTime();
const at = (s) => new Date(t0 + s * 1000).toISOString();

<LogViewer
  lines={[
    { ts: at(0), tag: 'VERBOSE', ctx: 'issue-1042', message: 'GET sonarr/api/v3/series/812 -> 200 in 41 ms' },
    { ts: at(1), tag: 'INFO', ctx: 'issue-1042', message: 'Plan: episode S02E07 has a file Sonarr rejected on import (sample match)' },
    { ts: at(219), tag: 'ERROR', ctx: 'issue-1042', message: 'Sonarr rejected the import: quality cutoff already met', extra: ['    at ArrClient.command (services/arr/client.ts:212:11)'] },
    { ts: at(220), tag: 'WARNING', ctx: 'issue-1042', message: 'Falling back to metadata refresh' },
    { ts: at(223), tag: 'SUCCESS', ctx: 'issue-1042', message: 'S02E07 imported, commented on Seerr issue #1042' },
    { ts: at(780), tag: 'INFO', ctx: 'MONITOR', message: 'Tick: 12 open issues, sonarr queue 3, radarr queue 0' },
  ]}
/>`,
    },
  ],
  SectionNav: [
    {
      title: 'Rail and chips',
      stack: true,
      height: 300,
      code: `const [active, setActive] = useState('llm');

<SectionNav items={${navItems}} activeId={active} onSelect={setActive} />
<SectionNav items={${navItems}} activeId={active} onSelect={setActive} variant="chips" />`,
    },
  ],
  Toaster: [
    {
      title: 'One Toaster, mounted once',
      note: 'News you did not ask for: a background outcome, bottom-right, three at most.',
      height: 260,
      code: `useEffect(() => {
  toast({ title: 'Issue 12 resolved', description: 'The replacement imported cleanly.', duration: 0 });
  toast({ tone: 'success', title: 'Plan reverted', action: { label: 'Undo', onClick: () => {} }, duration: 0 });
}, []);

<Toaster />`,
    },
  ],
  UnsavedBar: [
    {
      title: 'Named dirty sections',
      stack: true,
      code: `<UnsavedBar sections={['Connections', 'LLM']} onSave={() => {}} onDiscard={() => {}} />`,
    },
  ],
  Steps: [
    {
      title: 'Chevrons wide, a list narrow',
      stack: true,
      code: `const [step, setStep] = useState(1);

<Steps steps={${steps}} current={step} onSelect={setStep} />`,
    },
    {
      title: 'Every position',
      stack: true,
      code: `<Steps steps={${steps}} current={0} />
<Steps steps={${steps}} current={3} />`,
    },
  ],
};
