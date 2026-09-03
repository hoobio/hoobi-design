import { useEffect, useState } from 'react';
import { Section, Shell } from '@hoobi/design';
import { DEMO_TEXTURE, ShellDemoContext } from './kit.js';
import posterUrl from './poster.jpg';
import { GROUPS, PAGES, type Page } from './pages.js';

function useHashPage(): Page {
  const read = () => PAGES.find((p) => p.id === location.hash.slice(1)) ?? PAGES[0]!;
  const [page, setPage] = useState(read);
  useEffect(() => {
    const on = () => {
      setPage(read());
      // The Shell scrolls its main column, not the window.
      document.querySelector('main')?.scrollTo(0, 0);
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return page;
}

type NavType = 'pinned' | 'rail' | 'top';

export function App() {
  const page = useHashPage();
  // The chrome doubles as the Shell demo: this switches the real nav between
  // its three presentations so each can be experienced, not just read about.
  const [navType, setNavType] = useState<NavType>('rail');
  const [mirageSrc, setMirageSrc] = useState<'off' | 'hues' | 'poster'>('off');
  const [bar, setBar] = useState(true);
  return (
    <Shell
      brand={
        <span className="flex size-6 items-center justify-center rounded-control bg-accent font-mono text-caption text-on-accent">
          h
        </span>
      }
      title={<span className="font-mono">@hoobi/design</span>}
      subtitle={<span className="font-mono">v{__LIB_VERSION__}</span>}
      bar={bar}
      mode={navType === 'top' ? 'top' : 'side'}
      collapsible={navType === 'rail'}
      mirage={
        mirageSrc === 'off'
          ? undefined
          : mirageSrc === 'poster'
            ? `url(${posterUrl})`
            : DEMO_TEXTURE
      }
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
      navFooter={
        <Shell.User
          name="hoobi"
          detail="design.hoobi.io"
          // The catalog's own menu carries the catalog's own rows: where this version came
          // from. Account-shaped rows (linked accounts, Sign out) are a consumer's to compose;
          // the Shell page renders that composition as a demo.
          menu={
            <>
              <Shell.MenuLabel>@hoobi/design v{__LIB_VERSION__}</Shell.MenuLabel>
              <Shell.MenuItem
                onClick={() => {
                  open('https://dev.azure.com/Hoobi/Hoobi/_git/hoobi-design', '_blank');
                }}
              >
                Repository
              </Shell.MenuItem>
              <Shell.MenuItem
                onClick={() => {
                  open('https://dev.azure.com/Hoobi/Hoobi/_artifacts/feed/Hoobi', '_blank');
                }}
              >
                Package feed
              </Shell.MenuItem>
            </>
          }
        />
      }
    >
      <ShellDemoContext.Provider
        value={{ navType, setNavType, mirage: mirageSrc, setMirage: setMirageSrc, bar, setBar }}
      >
        <Section id={page.id} title={page.title} caption={page.caption}>
          {page.render()}
        </Section>
      </ShellDemoContext.Provider>
    </Shell>
  );
}
