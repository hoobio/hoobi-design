import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface SectionProps {
  id: string;
  title: string;
  caption?: string;
  /** Right of the title: a Switch that turns the whole section on, a link out. */
  actions?: ReactNode;
  /**
   * Makes the section its own surface - a settings panel rather than a page heading:
   * bg-surface, panel radius, the subtitle tier, and a scroll margin that matches its
   * own padding so a jump-list lands it flush.
   */
  panel?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  title,
  caption,
  actions,
  panel = false,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cx(panel ? 'scroll-mt-4 rounded-panel bg-surface p-4' : 'scroll-mt-16', className)}
    >
      <header className={panel ? 'mb-4' : 'mb-6'}>
        <div
          className={cx(
            'flex flex-wrap justify-between gap-2',
            panel ? 'items-center' : 'items-baseline',
          )}
        >
          <h2
            className={cx('min-w-0 break-words text-text', panel ? 'text-subtitle' : 'text-title')}
          >
            {title}
          </h2>
          {actions}
        </div>
        {caption ? (
          <p className={cx('mt-1 text-text-dim', panel ? 'text-caption' : 'text-body')}>
            {caption}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
