import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface SectionProps {
  id: string;
  title: string;
  /** Shell line under the `$` prompt. Defaults to `cat ./<id>.yaml`. */
  command?: string;
  caption?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  title,
  command,
  caption,
  actions,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cx('scroll-mt-16 pt-8 md:pt-12', className)}>
      <header className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-caption text-text-mute">
          <div className="min-w-0 font-mono break-all">
            <span className="text-accent-red">$</span> {command ?? `cat ./${id}.yaml`}
          </div>
          {actions}
        </div>
        <h2 className="mt-1 text-title break-words text-text">{title}</h2>
        {caption ? <p className="mt-1 text-body text-text-dim">{caption}</p> : null}
      </header>
      {children}
    </section>
  );
}
