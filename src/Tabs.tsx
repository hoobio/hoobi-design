import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface TabItem {
  id: string;
  label: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cx(
        'no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-border px-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cx(
              '-mb-px inline-flex h-8 shrink-0 items-center border-b-2 px-3 text-body whitespace-nowrap transition-colors',
              active
                ? 'border-accent text-text'
                : 'border-transparent text-text-dim hover:text-text',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
