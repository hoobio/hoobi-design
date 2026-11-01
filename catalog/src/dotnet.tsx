import { Badge, Card, CodeBlock } from '@hoobi/design';
import { highlight } from './kit.js';
import buttons from './gallery/buttons.png';
import settingsCards from './gallery/settings-cards.png';
import dialog from './gallery/dialog.png';
import flyout from './gallery/flyout.png';

function Code({ code, language }: { code: string; language: 'xml' | 'typescript' | 'bash' }) {
  return <CodeBlock code={code} html={highlight(code, language)} copy />;
}

function Heading({ children }: { children: string }) {
  return <h3 className="mt-8 text-body-strong text-text">{children}</h3>;
}

const PACKAGES: [name: string, text: string][] = [
  [
    'Hoobi.Design.Avalonia',
    'HoobiTheme (tokens, control themes, dialogs, settings cards, glyphs), the fonts, UseHoobiDesign, AppDialogs, HoobiChrome, IdleMemory, ToastWindow and the build checks.',
  ],
  [
    'Hoobi.Design.Avalonia.Testing',
    'Headless probes for a consumer test project: HoverFlashProbe, PopupSurfaceProbe, TextCentring and HeadlessSession.',
  ],
  [
    'Hoobi.Desktop.Windows',
    'Windows plumbing: StoreUpdater, StartAtSignIn, RestartRegistration, GitHubReleaseChecker, SingleInstance and UiWatchdog.',
  ],
];

const CHECKS: [code: string, text: string][] = [
  [
    'HOOBI001',
    'A literal colour in an .axaml file. Use a Hoobi token resource, or put <!-- hex-ok: reason --> on the line above.',
  ],
  [
    'HOOBI002',
    'An x:Key that the package already defines, at app scope. Scope the override to the element’s own Resources.',
  ],
  [
    'HOOBI003',
    'A popup surface that drops the Mirage acrylic. An exception needs <!-- popup-ok: reason --> on the line above.',
  ],
];

const CONTROLS: [name: string, text: string][] = [
  ['SettingsCard', 'The settings row: header, description, control, an optional fold and preview.'],
  ['SlideExpander', 'A fold that slides its content as WinUI’s Expander does.'],
  ['ToastWindow', 'A no-activate toast window, placed per monitor.'],
  ['LevelMeter', 'A toned level bar with hold and volume.'],
  ['RichTextBlock', 'Paragraphs, lists and links as Avalonia inlines.'],
  ['ProgressRing and Spinner', 'Determinate and indeterminate progress.'],
  ['IconImage and ImageLoader', 'Remote images with a fallback and a failed state.'],
  ['Tone', 'Neutral, accent, success, warn and danger, with brush, button and glyph keys.'],
  ['Motion', 'WinUI’s durations and easings, zero when Windows turns off animation.'],
];

const GALLERY: [src: string, alt: string][] = [
  [buttons, 'The button themes and classes, at rest and disabled'],
  [settingsCards, 'Settings cards, a settings group and a fold'],
  [dialog, 'A form dialog shown through AppDialogs'],
  [flyout, 'A flyout on the Mirage acrylic'],
];

export function DotnetPage() {
  const version = __LIB_VERSION__;
  return (
    <>
      <p className="text-body text-text-dim">
        The same design system for Avalonia desktop apps, as three NuGet packages. They share the
        version and the tokens of <code>@hoobi/design</code>; one release publishes all four.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="neutral">.NET 10</Badge>
        <Badge tone="neutral">Avalonia 12.1.4</Badge>
        <Badge tone="neutral">FluentAvaloniaUI 3.1.0</Badge>
        <Badge tone="info" dot>
          Windows first
        </Badge>
      </div>

      <Heading>Packages</Heading>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {PACKAGES.map(([name, text]) => (
          <Card key={name} title={name}>
            <p className="text-caption text-text-dim">{text}</p>
          </Card>
        ))}
      </div>

      <Heading>Feed</Heading>
      <p className="mt-2 text-body text-text-dim">
        The packages are on the private Hoobi feed on Azure Artifacts. A restore needs read access
        to that feed, which the owner grants; the feed rejects an anonymous restore.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <Code
          language="xml"
          code={`<!-- nuget.config -->
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="Hoobi" value="https://pkgs.dev.azure.com/Hoobi/Hoobi/_packaging/Hoobi/nuget/v3/index.json" />
  </packageSources>
  <packageSourceMapping>
    <packageSource key="Hoobi"><package pattern="Hoobi.*" /></packageSource>
    <packageSource key="nuget.org"><package pattern="*" /></packageSource>
  </packageSourceMapping>
</configuration>`}
        />
        <Code
          language="xml"
          code={`<!-- Directory.Packages.props -->
<PackageVersion Include="Hoobi.Design.Avalonia" Version="${version}" />
<PackageVersion Include="Hoobi.Desktop.Windows" Version="${version}" />
<PackageVersion Include="Hoobi.Design.Avalonia.Testing" Version="${version}" />`}
        />
      </div>

      <Heading>Consumer setup</Heading>
      <div className="mt-2 flex flex-col gap-2">
        <Code
          language="xml"
          code={`<!-- App.axaml -->
<Application xmlns:hoobi="using:Hoobi.Design.Avalonia" RequestedThemeVariant="Dark">
  <Application.Styles>
    <hoobi:HoobiTheme />
  </Application.Styles>
</Application>`}
        />
        <Code
          language="typescript"
          code={`// Program.cs
AppBuilder.Configure<App>()
    .UsePlatformDetect()
    .UseHoobiDesign();`}
        />
        <Code
          language="typescript"
          code={`// MainWindow.axaml.cs, after InitializeComponent
chrome = HoobiChrome.Attach(this, onSessionEnding: Quit);
idle = new IdleMemory(this);

// any dialog, queued behind one already open
await AppDialogs.ShowMessageAsync(this, "Remove WeakAuras?", "Its saved variables stay.", "Remove", "Cancel");`}
        />
      </div>
      <p className="mt-2 text-caption text-text-dim">
        <code>UseHoobiDesign</code> registers the fonts, the emoji fallback, popup placement, the
        scroll indicator and the dialog resource scope. <code>HoobiChrome.Attach</code> cloaks the
        window until its first frame, keeps the caption buttons in step with activation and quits on
        session end. <code>IdleMemory</code> trims the working set while the app sits in the tray.
      </p>

      <Heading>Title bar</Heading>
      <Code
        language="xml"
        code={`<Window xmlns:chrome="using:Avalonia.Controls.Chrome"
        ExtendClientAreaToDecorationsHint="True"
        ExtendClientAreaTitleBarHeightHint="{StaticResource TitleBarHeight}"
        WindowDecorationsTheme="{StaticResource HoobiWindowDecorations}">
  <Grid RowDefinitions="48,*">
    <Grid Background="Transparent" chrome:WindowDecorationProperties.ElementRole="TitleBar">
      <TextBlock Text="App name" FontSize="12" Margin="14,0,0,0" VerticalAlignment="Center" />
      <Button Content="Account" HorizontalAlignment="Right"
              chrome:WindowDecorationProperties.ElementRole="User" />
    </Grid>
  </Grid>
</Window>`}
      />
      <p className="mt-2 text-caption text-text-dim">
        The drag area takes the <code>TitleBar</code> role; anything that takes a click takes{' '}
        <code>User</code>. <code>HoobiCloseOnlyDecorations</code> is the close-only variant.
      </p>

      <Heading>Build checks</Heading>
      <p className="mt-2 text-body text-text-dim">
        The package’s build targets run before every compile in a consuming project and fail the
        build on a design rule. <code>HoobiDesignChecks=false</code> turns them off for a project.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {CHECKS.map(([code, text]) => (
          <div
            key={code}
            className="flex flex-wrap items-baseline gap-3 rounded-panel bg-surface p-4"
          >
            <Badge tone="danger">{code}</Badge>
            <span className="min-w-0 flex-1 text-caption text-text-dim">{text}</span>
          </div>
        ))}
      </div>

      <Heading>Controls and helpers</Heading>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {CONTROLS.map(([name, text]) => (
          <Card key={name} title={name}>
            <p className="text-caption text-text-dim">{text}</p>
          </Card>
        ))}
      </div>

      <Heading>Gallery</Heading>
      <p className="mt-2 text-body text-text-dim">
        Renders from <code>samples/Hoobi.Design.Gallery</code>, the native catalog: every style key
        and control theme the package ships is on one of its pages.
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {GALLERY.map(([src, alt]) => (
          <figure key={alt} className="m-0 overflow-hidden rounded-panel bg-surface">
            <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
            <figcaption className="p-3 text-caption text-text-dim">{alt}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
