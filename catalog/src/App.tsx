import { useEffect, useState, type ReactNode } from 'react';
import { Section, Select, cx } from '@hoobi/design';
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
  SpinnerPage,
  TabsPage,
} from './components.js';

interface Page {
  id: string;
  group: string;
  title: string;
  command: string;
  caption: string;
  render: () => ReactNode;
}

const PAGES: Page[] = [
  {
    id: 'identity',
    group: 'Foundations',
    title: 'Identity',
    command: 'cat ./IDENTITY.md',
    caption: 'What this library is, and what it refuses to be.',
    render: () => <Identity />,
  },
  {
    id: 'colour',
    group: 'Foundations',
    title: 'Colour',
    command: 'grep --color styles.css',
    caption: 'Ayu Mirage, as Tailwind v4 theme tokens.',
    render: () => <Colour />,
  },
  {
    id: 'typography',
    group: 'Foundations',
    title: 'Typography',
    command: 'fc-list | grep -E "Noto|Dank"',
    caption: 'The WinUI 3 type ramp in Noto Sans, plus Dank Mono for code.',
    render: () => <Typography />,
  },
  {
    id: 'spacing',
    group: 'Foundations',
    title: 'Spacing & Radius',
    command: 'cat ./spacing.css',
    caption: 'A 4px pixel grid, two radii, one control height.',
    render: () => <Spacing />,
  },
  {
    id: 'button',
    group: 'Components',
    title: 'Button',
    command: 'cat ./src/Button.tsx',
    caption: 'Four variants, two sizes. Accent is spent once per view.',
    render: () => <ButtonPage />,
  },
  {
    id: 'badge',
    group: 'Components',
    title: 'Badge',
    command: 'cat ./src/Badge.tsx',
    caption: 'Six tones, optional status dot. 20px tall.',
    render: () => <BadgePage />,
  },
  {
    id: 'card',
    group: 'Components',
    title: 'Card',
    command: 'cat ./src/Card.tsx',
    caption: 'A raised surface with an optional header and actions.',
    render: () => <CardPage />,
  },
  {
    id: 'alert',
    group: 'Components',
    title: 'Alert',
    command: 'cat ./src/Alert.tsx',
    caption: 'Four semantic tones, with the ARIA role picked for you.',
    render: () => <AlertPage />,
  },
  {
    id: 'input',
    group: 'Components',
    title: 'Input',
    command: 'cat ./src/Input.tsx',
    caption: 'A 32px field with label, hint and error slots.',
    render: () => <InputPage />,
  },
  {
    id: 'select',
    group: 'Components',
    title: 'Select',
    command: 'cat ./src/Select.tsx',
    caption: 'A native select, styled to match Input exactly.',
    render: () => <SelectPage />,
  },
  {
    id: 'modal',
    group: 'Components',
    title: 'Modal',
    command: 'cat ./src/Modal.tsx',
    caption: 'A native dialog, so the platform does the hard parts.',
    render: () => <ModalPage />,
  },
  {
    id: 'tabs',
    group: 'Components',
    title: 'Tabs',
    command: 'cat ./src/Tabs.tsx',
    caption: 'Controlled, scrollable, no panel opinions.',
    render: () => <TabsPage />,
  },
  {
    id: 'progress',
    group: 'Components',
    title: 'Progress',
    command: 'cat ./src/Progress.tsx',
    caption: 'A 4px determinate bar with an optional label row.',
    render: () => <ProgressPage />,
  },
  {
    id: 'spinner',
    group: 'Components',
    title: 'Spinner',
    command: 'cat ./src/Spinner.tsx',
    caption: 'Two sizes. Compose it, do not prop it into everything.',
    render: () => <SpinnerPage />,
  },
  {
    id: 'section',
    group: 'Components',
    title: 'Section',
    command: 'cat ./src/Section.tsx',
    caption: 'The page heading used throughout this catalog.',
    render: () => <SectionPage />,
  },
  {
    id: 'cx',
    group: 'Utilities',
    title: 'cx',
    command: 'cat ./src/cx.ts',
    caption: 'The whole class-joining story, in one line.',
    render: () => <CxPage />,
  },
];

const GROUPS = [...new Set(PAGES.map((p) => p.group))];

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

export function App() {
  const page = useHashPage();
  return (
    <div className="mx-auto flex max-w-[80rem] flex-col md:flex-row">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-body text-text">@hoobi/design</span>
          <span className="font-mono text-caption text-text-mute">v0.2.0</span>
        </div>
        <Select
          aria-label="Page"
          className="mt-2"
          value={page.id}
          onChange={(e) => {
            location.hash = e.target.value;
          }}
        >
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {PAGES.filter((p) => p.group === g).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </header>

      <nav className="styled-scrollbar sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-r border-border px-4 py-6 md:block">
        <div className="font-mono text-body text-text">@hoobi/design</div>
        <div className="font-mono text-caption text-text-mute">v0.2.0</div>
        {GROUPS.map((g) => (
          <div key={g} className="mt-6">
            <div className="text-caption text-text-mute">{g}</div>
            <ul className="mt-1">
              {PAGES.filter((p) => p.group === g).map((p) => (
                <li key={p.id}>
                  <a
                    href={`#${p.id}`}
                    aria-current={p.id === page.id ? 'page' : undefined}
                    className={cx(
                      '-mx-2 block rounded-control px-2 py-1 text-body no-underline hover:no-underline',
                      p.id === page.id
                        ? 'bg-surface text-text'
                        : 'text-text-dim hover:bg-surface hover:text-text',
                    )}
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <main className="min-w-0 flex-1 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] md:px-10">
        <Section
          id={page.id}
          title={page.title}
          command={page.command}
          caption={page.caption}
          className="pt-6 md:pt-10"
        >
          {page.render()}
        </Section>
      </main>
    </div>
  );
}
