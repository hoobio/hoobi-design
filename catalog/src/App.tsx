import { useEffect, type MouseEvent } from 'react';
import { Section, Shell, Toaster } from '@hoobi/design';
import { DEMO_TEXTURE, ShellDemoContext, navigateTo, setQuery, useUrl } from './kit.js';
import posterUrl from './mirage-art.png';
import { GROUPS, PAGES, type Page } from './pages.js';

type NavType = 'pinned' | 'rail' | 'top';
type MirageSrc = 'off' | 'hues' | 'poster';

// Old hash-based links still resolve to the page, now at its path.
const legacy = PAGES.find((p) => p.id === location.hash.slice(1));
if (legacy && location.pathname === '/') history.replaceState(null, '', `/${legacy.id}`);

function pick<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw ?? '') ? (raw as T) : fallback;
}

export function App() {
  const url = useUrl();
  const page: Page = PAGES.find((p) => p.id === url.pathname.slice(1)) ?? PAGES[0]!;
  useEffect(() => {
    // The Shell scrolls its main column, not the window.
    document.querySelector('main')?.scrollTo(0, 0);
  }, [page.id]);

  // The chrome doubles as the Shell demo: ?nav, ?mirage and ?bar switch the real nav between
  // its presentations, each directly linkable.
  const navType = pick<NavType>(url.searchParams.get('nav'), ['pinned', 'rail', 'top'], 'rail');
  const mirageSrc = pick<MirageSrc>(
    url.searchParams.get('mirage'),
    ['off', 'hues', 'poster'],
    'off',
  );
  const bar = url.searchParams.get('bar') !== 'off';
  const setNavType = (v: NavType) => {
    setQuery('nav', v === 'rail' ? null : v);
  };
  const setMirageSrc = (v: MirageSrc) => {
    setQuery('mirage', v === 'off' ? null : v);
  };
  const setBar = (v: boolean) => {
    setQuery('bar', v ? null : 'off');
  };
  return (
    <Shell
      brand={
        <span className="flex size-6 items-center justify-center rounded-control bg-accent text-caption text-on-accent">
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
                  href={`/${p.id}`}
                  label={p.title}
                  active={p.id === page.id}
                  onClick={(e: MouseEvent) => {
                    e.preventDefault();
                    navigateTo(`/${p.id}`);
                  }}
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
          // The catalog's own menu holds the catalog's own rows: where this version came
          // from. Account-shaped rows (linked accounts, Sign out) are a consumer's to compose;
          // the Shell page renders that composition as a demo.
          menu={
            <>
              <Shell.MenuLabel>@hoobi/design v{__LIB_VERSION__}</Shell.MenuLabel>
              <Shell.MenuItem
                onClick={() => {
                  open('https://github.com/hoobio/hoobi-design', '_blank');
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
      {/* One Toaster for the whole app, mounted at the root. Every toast() call renders here. */}
      <Toaster />
    </Shell>
  );
}
