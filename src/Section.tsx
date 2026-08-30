import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface SectionProps {
  id: string;
  title: string;
  caption?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({ id, title, caption, actions, className, children }: SectionProps) {
  return (
    <section id={id} className={cx('scroll-mt-16 pt-8 md:pt-12', className)}>
      <header className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="min-w-0 text-title break-words text-text">{title}</h2>
          {actions}
        </div>
        {caption ? <p className="mt-1 text-body text-text-dim">{caption}</p> : null}
      </header>
      {children}
    </section>
  );
}
