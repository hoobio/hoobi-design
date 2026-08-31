import { createContext, useEffect, useState, type ReactNode } from 'react';
import { Button, CodeBlock, Input, Select, cx, mirageImage } from '@hoobi/design';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import typescript from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('json', json);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('yaml', yaml);

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

export function Snippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="relative">
      <CodeBlock code={code} html={highlight(code)} className="pr-20" />
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1.5 right-1.5"
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
                <label key={name} className="flex h-8 items-center gap-1.5 text-body text-text-dim">
                  <input
                    type="checkbox"
                    checked={values[name] as boolean}
                    onChange={(e) => {
                      set(name, e.target.checked);
                    }}
                  />
                  {name}
                </label>
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
  children,
}: {
  title: string;
  note?: string;
  code: string;
  stack?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-8 first:mt-6">
      <h3 className="text-body-strong text-text">{title}</h3>
      {note ? <p className="mt-1 text-caption text-text-dim">{note}</p> : null}
      <div
        className={cx(
          'mt-2 rounded-panel bg-surface p-4',
          stack ? 'flex flex-col gap-4' : 'flex flex-wrap items-center gap-3',
        )}
      >
        {children}
      </div>
      <div className="mt-2">
        <Snippet code={code} />
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
