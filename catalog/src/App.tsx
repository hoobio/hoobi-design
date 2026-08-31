import { useEffect, useState, type ReactNode } from 'react';
import { Section, Shell } from '@hoobi/design';
import { ShellDemoContext } from './kit.js';
import { Colour, Identity, Spacing, Typography } from './foundations.js';
import {
  AlertPage,
  BadgePage,
  ButtonPage,
  CardPage,
  CxPage,
  InputPage,
  ModalPage,
  ProgressPage,
  SectionPage,
  SelectPage,
  ShellPage,
  SpinnerPage,
  TabsPage,
  TooltipPage,
} from './components.js';

interface Page {
  id: string;
  group: string;
  title: string;
  caption: string;
  render: () => ReactNode;
}

const PAGES: Page[] = [
  {
    id: 'identity',
    group: 'Foundations',
    title: 'Identity',
    caption: 'What this library is, and what it refuses to be.',
    render: () => <Identity />,
  },
  {
    id: 'colour',
    group: 'Foundations',
    title: 'Colour',
    caption: 'Ayu Mirage, as Tailwind v4 theme tokens.',
    render: () => <Colour />,
  },
  {
    id: 'typography',
    group: 'Foundations',
    title: 'Typography',
    caption: 'The WinUI 3 type ramp in Noto Sans, plus Dank Mono for code.',
    render: () => <Typography />,
  },
  {
    id: 'spacing',
    group: 'Foundations',
    title: 'Spacing & Radius',
    caption: 'A 4px pixel grid, two radii, one control height.',
    render: () => <Spacing />,
  },
  {
    id: 'button',
    group: 'Actions',
    title: 'Button',
    caption: 'Four variants, two sizes. Accent is spent once per view.',
    render: () => <ButtonPage />,
  },
  {
    id: 'badge',
    group: 'Visual Elements',
    title: 'Badge',
    caption: 'Six tones, optional status dot. 20px tall.',
    render: () => <BadgePage />,
  },
  {
    id: 'card',
    group: 'Layout',
    title: 'Card',
    caption: 'A raised surface with an optional header and actions.',
    render: () => <CardPage />,
  },
  {
    id: 'alert',
    group: 'Notifications',
    title: 'Alert',
    caption: 'Four semantic tones, with the ARIA role picked for you.',
    render: () => <AlertPage />,
  },
  {
    id: 'input',
    group: 'Inputs',
    title: 'Input',
    caption: 'A 32px field with label, hint and error slots.',
    render: () => <InputPage />,
  },
  {
    id: 'select',
    group: 'Inputs',
    title: 'Select',
    caption: 'A native select, styled to match Input exactly.',
    render: () => <SelectPage />,
  },
  {
    id: 'modal',
    group: 'Overlays',
    title: 'Modal',
    caption: 'A native dialog, so the platform does the hard parts.',
    render: () => <ModalPage />,
  },
  {
    id: 'tabs',
    group: 'Navigation',
    title: 'Tabs',
    caption: 'Controlled, scrollable, no panel opinions.',
    render: () => <TabsPage />,
  },
  {
    id: 'shell',
    group: 'Navigation',
    title: 'Shell',
    caption: 'The one page chrome: top bar, collapsible side pane, Fluent motion.',
    render: () => <ShellPage />,
  },
  {
    id: 'tooltip',
    group: 'Overlays',
    title: 'Tooltip',
    caption: 'CSS-only, instant on hover and keyboard focus.',
    render: () => <TooltipPage />,
  },
  {
    id: 'progress',
    group: 'Progress',
    title: 'Progress',
    caption: 'A 4px determinate bar with an optional label row.',
    render: () => <ProgressPage />,
  },
  {
    id: 'spinner',
    group: 'Progress',
    title: 'Spinner',
    caption: 'Two sizes. Compose it, do not prop it into everything.',
    render: () => <SpinnerPage />,
  },
  {
    id: 'section',
    group: 'Layout',
    title: 'Section',
    caption: 'The page heading used throughout this catalog.',
    render: () => <SectionPage />,
  },
  {
    id: 'cx',
    group: 'Utilities',
    title: 'cx',
    caption: 'The whole class-joining story, in one line.',
    render: () => <CxPage />,
  },
];

// Textura's storybook taxonomy, minus the groups nothing lives in yet.
const GROUPS = [
  'Foundations',
  'Actions',
  'Inputs',
  'Layout',
  'Navigation',
  'Notifications',
  'Overlays',
  'Progress',
  'Visual Elements',
  'Utilities',
];

function useHashPage(): Page {
  const read = () => PAGES.find((p) => p.id === location.hash.slice(1)) ?? PAGES[0]!;
  const [page, setPage] = useState(read);
  useEffect(() => {
    const on = () => {
      setPage(read());
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return page;
}

type NavType = 'pinned' | 'rail' | 'top';
type Texture = 'none' | 'mica' | 'acrylic';

// A stand-in desktop: three Ayu hue blobs. Any CSS image works, including url(...).
const DEMO_TEXTURE = [
  'radial-gradient(40rem 30rem at 20% 10%, #409fffcc, transparent)',
  'radial-gradient(50rem 35rem at 80% 20%, #d4bfffaa, transparent)',
  'radial-gradient(45rem 40rem at 50% 90%, #95e6cb99, transparent)',
].join(', ');

export function App() {
  const page = useHashPage();
  // The chrome doubles as the Shell demo: this switches the real nav between
  // its three presentations so each can be experienced, not just read about.
  const [navType, setNavType] = useState<NavType>('rail');
  const [texture, setTexture] = useState<Texture>('none');
  return (
    <Shell
      brand={
        <span className="flex size-6 items-center justify-center rounded-control bg-accent font-mono text-caption text-on-accent">
          h
        </span>
      }
      title={<span className="font-mono">@hoobi/design</span>}
      subtitle={<span className="font-mono">v{__LIB_VERSION__}</span>}
      mode={navType === 'top' ? 'top' : 'side'}
      collapsible={navType === 'rail'}
      texture={texture === 'none' ? undefined : texture}
      textureImage={DEMO_TEXTURE}
      nav={
        <>
          {GROUPS.map((g) => (
            <Shell.Group key={g} label={g}>
              {PAGES.filter((p) => p.group === g).map((p) => (
                <Shell.Item
                  key={p.id}
                  href={`#${p.id}`}
                  label={p.title}
                  active={p.id === page.id}
                />
              ))}
            </Shell.Group>
          ))}
        </>
      }
      navFooter={<Shell.User name="hoobi" detail="design.hoobi.io" />}
    >
      <ShellDemoContext.Provider value={{ navType, setNavType, texture, setTexture }}>
        <div className="max-w-[72rem] px-4 pb-[max(4rem,env(safe-area-inset-bottom))] md:px-10">
          {/* Top padding mirrors the side padding, so the title sits square in the corner. */}
          <Section id={page.id} title={page.title} caption={page.caption} className="pt-4 md:pt-10">
            {page.render()}
          </Section>
        </div>
      </ShellDemoContext.Provider>
    </Shell>
  );
}
