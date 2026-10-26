import { createContext, useSyncExternalStore, type ReactNode } from 'react';
import { Button, Checkbox, CodeBlock, Input, Select, cx, mirageImage } from '@hoobi/design';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('yaml', yaml);
// JSX is not part of the typescript grammar: hljs hands every element off to the xml
// sublanguage, and an unregistered sublanguage silently emits plain text. Without this
// the first element in a snippet highlights and everything after it does not.
hljs.registerLanguage('xml', xml);

/** Highlight through the shared registry; CodeBlock renders the resulting html, styled by the theme. */
export function highlight(code: string, language = 'typescript'): string {
  return hljs.highlight(code, { language }).value;
}

/** The Shell page controls the catalog's own chrome through this. */
export interface ShellDemo {
  navType: 'pinned' | 'rail' | 'top';
  setNavType: (v: ShellDemo['navType']) => void;
  mirage: 'off' | 'hues' | 'poster';
  setMirage: (v: ShellDemo['mirage']) => void;
  bar: boolean;
  setBar: (v: boolean) => void;
}
export const ShellDemoContext = createContext<ShellDemo | null>(null);

/**
 * The URL is the state. Pages are paths, everything else a person can change - a knob, an
 * expanded fold, the Shell's presentation - is a query parameter, so any state has a link.
 * Defaults are never written; a parameter appears only when it differs from the default.
 */
const listeners = new Set<() => void>();
function notify() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    removeEventListener('popstate', listener);
  };
}
export function useUrl(): URL {
  // The third snapshot is for a render in Node, where there is no location.
  return new URL(
    useSyncExternalStore(
      subscribe,
      () => location.href,
      () => 'http://ds/',
    ),
  );
}
export function navigateTo(path: string) {
  history.pushState(null, '', path);
  notify();
}
export function setQuery(name: string, value: string | null) {
  const url = new URL(location.href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  history.replaceState(null, '', url);
  notify();
}
/** `?open=a&open=b` - the expanded folds and steps, by their static ids. */
export function useFold(id: string) {
  const open = useUrl().searchParams.getAll('open');
  const isOpen = open.includes(id);
  return {
    id,
    open: isOpen,
    onOpenChange: (next: boolean) => {
      // <details> fires toggle on mount too; only a real change touches the URL.
      if (next === isOpen) return;
      const url = new URL(location.href);
      url.searchParams.delete('open');
      for (const o of open.filter((o) => o !== id)) url.searchParams.append('open', o);
      if (next) url.searchParams.append('open', id);
      history.replaceState(null, '', url);
      notify();
    },
  };
}

/** The library's default hues, as a stand-in desktop. Any CSS image works too. */
export const DEMO_TEXTURE = mirageImage();

export function Snippet({ code, flush = false }: { code: string; flush?: boolean }) {
  return (
    <CodeBlock
      code={code}
      html={highlight(code)}
      copy
      className={flush ? 'rounded-t-none rounded-b-panel' : undefined}
    />
  );
}

export type KnobDef =
  | { kind: 'select'; options: readonly string[]; init: string }
  | { kind: 'boolean'; init: boolean }
  | { kind: 'text'; init: string };

export type KnobValues = Record<string, string | boolean>;

/**
 * Live component configuration: a row of knobs controlling a real render, with
 * the JSX for the current state below it. Every component page includes one.
 */
export function Playground({
  knobs,
  render,
  code,
}: {
  knobs: Record<string, KnobDef>;
  render: (values: KnobValues) => ReactNode;
  code: (values: KnobValues) => string;
}) {
  // One Playground per page, so a knob's own name is its parameter: ?variant=primary.
  const params = useUrl().searchParams;
  const values: KnobValues = Object.fromEntries(
    Object.entries(knobs).map(([name, def]) => {
      const raw = params.get(name);
      if (raw === null) return [name, def.init];
      return [name, def.kind === 'boolean' ? raw === 'true' : raw];
    }),
  );
  const set = (name: string, value: string | boolean) => {
    setQuery(name, value === knobs[name]?.init ? null : String(value));
  };
  return (
    <div className="mt-6">
      <h3 className="text-body-strong text-text">Playground</h3>
      <div className="mt-2 rounded-panel bg-surface p-4">
        <div className="flex flex-wrap items-end gap-3">
          {Object.entries(knobs).map(([name, def]) => {
            if (def.kind === 'select') {
              return (
                <Select
                  key={name}
                  label={name}
                  className="w-auto"
                  value={values[name] as string}
                  onChange={(e) => {
                    set(name, e.target.value);
                  }}
                >
                  {def.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              );
            }
            if (def.kind === 'boolean') {
              return (
                <Checkbox
                  key={name}
                  className="h-8 text-text-dim"
                  label={name}
                  checked={values[name] as boolean}
                  onChange={(e) => {
                    set(name, e.target.checked);
                  }}
                />
              );
            }
            return (
              <Input
                key={name}
                label={name}
                className="w-44"
                value={values[name] as string}
                onChange={(e) => {
                  set(name, e.target.value);
                }}
              />
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-bg pt-4">
          {render(values)}
        </div>
      </div>
      <div className="mt-2">
        <Snippet code={code(values)} />
      </div>
    </div>
  );
}

export function Demo({
  title,
  note,
  code,
  stack,
  flush,
  children,
}: {
  title: string;
  note?: string;
  code: string;
  stack?: boolean;
  /** For a component that bleeds its own hairlines: the surface adds no padding. */
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-8 first:mt-6">
      <h3 className="text-body-strong text-text">{title}</h3>
      {note ? <p className="mt-1 text-caption text-text-dim">{note}</p> : null}
      <div className="mt-2 flex flex-col gap-px">
        <div
          className={cx(
            'rounded-t-panel bg-surface',
            flush ? 'py-2' : 'p-4',
            stack ? 'flex flex-col gap-4' : 'flex flex-wrap items-center gap-3',
          )}
        >
          {children}
        </div>
        <Snippet code={code} flush />
      </div>
    </div>
  );
}

export type PropRow = [name: string, type: string, def: string, description: string];

export function Props({ rows }: { rows: PropRow[] }) {
  return (
    <div className="styled-scrollbar mt-6 overflow-x-auto rounded-panel bg-surface">
      <table className="w-full min-w-[34rem] border-collapse text-left text-body">
        <thead>
          <tr className="bg-surface text-caption text-text-mute">
            <th className="px-3 py-2 font-medium">Prop</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Default</th>
            <th className="px-3 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, def, description]) => (
            <tr key={name} className="border-t border-bg align-top">
              <td className="px-3 py-2 font-mono text-caption text-accent-blue">{name}</td>
              <td className="px-3 py-2 font-mono text-caption text-text-dim">{type}</td>
              <td className="px-3 py-2 font-mono text-caption text-text-mute">{def || '-'}</td>
              <td className="px-3 py-2 text-caption text-text-dim">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Import({ names }: { names: string }) {
  return (
    <div className="mt-4">
      <Snippet code={`import { ${names} } from '@hoobi/design';`} />
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="w-24 shrink-0 text-caption text-text-mute">{children}</span>;
}

/**
 * A rule, shown rather than stated: the correct render beside the wrong one.
 * Pairs are the highest-value format in a design system for anyone - human or
 * model - generating new UI: a rule stated only in prose is easy to override
 * with patterns learned from every other library they have seen.
 */
export function DoDont({
  rule,
  why,
  doLabel,
  dontLabel,
  children,
}: {
  rule: string;
  why: string;
  doLabel: string;
  dontLabel: string;
  /** Exactly two: the good render, then the bad one. */
  children: [ReactNode, ReactNode];
}) {
  return (
    <div className="mt-8 first:mt-6">
      <h3 className="text-body-strong text-text">{rule}</h3>
      <p className="mt-1 text-caption text-text-dim">{why}</p>
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        {(
          [
            ['Do', doLabel, 'text-success', children[0]],
            ["Don't", dontLabel, 'text-danger', children[1]],
          ] as const
        ).map(([verdict, label, tone, node]) => (
          <div key={verdict} className="flex min-w-0 flex-col gap-px overflow-hidden rounded-panel">
            <div className="flex items-center gap-2 bg-surface px-4 py-2">
              <span className={cx('text-caption font-medium', tone)}>{verdict}</span>
              <span className="min-w-0 flex-1 text-caption text-text-dim">{label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-surface p-4">{node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A page-shaped composition, with the JSX that produced it underneath. */
export function Recipe({
  note,
  code,
  children,
}: {
  note: string;
  code: string;
  children: ReactNode;
}) {
  return (
    <>
      <p className="text-body text-text-dim">{note}</p>
      <div className="mt-4 overflow-hidden rounded-panel bg-bg p-4">{children}</div>
      <div className="mt-2">
        <Snippet code={code} />
      </div>
    </>
  );
}
