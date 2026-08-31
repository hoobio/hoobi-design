import { createContext, useEffect, useState, type ReactNode } from 'react';
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

/** Highlight through the shared registry; CodeBlock takes the html and the theme does the rest. */
export function highlight(code: string, language = 'typescript'): string {
  return hljs.highlight(code, { language }).value;
}

/** The Shell page steers the catalog's own chrome through this. */
export interface ShellDemo {
  navType: 'pinned' | 'rail' | 'top';
  setNavType: (v: ShellDemo['navType']) => void;
  mirage: 'off' | 'hues' | 'poster';
  setMirage: (v: ShellDemo['mirage']) => void;
  bar: boolean;
  setBar: (v: boolean) => void;
}
export const ShellDemoContext = createContext<ShellDemo | null>(null);

/** The library's default hues, as a stand-in desktop. Any CSS image works too. */
export const DEMO_TEXTURE = mirageImage();

function copy(text: string) {
  navigator.clipboard?.writeText(text).catch(() => fallbackCopy(text));
  if (!navigator.clipboard) fallbackCopy(text);
}

// Clipboard API is unavailable in a sandboxed iframe, which is where this page usually lives.
function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.append(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

export function Snippet({ code, flush = false }: { code: string; flush?: boolean }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="relative">
      <CodeBlock
        code={code}
        html={highlight(code)}
        className={cx('pr-20', flush ? 'rounded-t-none rounded-b-panel' : undefined)}
      />
      <Button
        size="sm"
        variant="ghost"
        // The code scrolls under this, so the button needs the surface's own fill to sit on.
        className="absolute top-1.5 right-1.5 bg-chip"
        onClick={() => {
          copy(code);
          setCopied(true);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

export type KnobDef =
  | { kind: 'select'; options: readonly string[]; init: string }
  | { kind: 'boolean'; init: boolean }
  | { kind: 'text'; init: string };

export type KnobValues = Record<string, string | boolean>;

/**
 * Live component configuration: a row of knobs steering a real render, with the
 * JSX for the current state below it. Every component page carries one.
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
  const [values, setValues] = useState<KnobValues>(() =>
    Object.fromEntries(Object.entries(knobs).map(([name, def]) => [name, def.init])),
  );
  const set = (name: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
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
 * Pairs are the highest-value thing in a design system for anyone - human or
 * model - generating new UI, because a rule you can only read is a rule that
 * gets averaged away against every other library they have seen.
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
