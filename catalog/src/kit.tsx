import { useEffect, useState, type ReactNode } from 'react';
import { Button, cx } from '@hoobi/design';

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
      <pre className="styled-scrollbar overflow-x-auto rounded-control bg-chip p-3 pr-20 text-caption text-text-dim">
        <code>{code}</code>
      </pre>
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
