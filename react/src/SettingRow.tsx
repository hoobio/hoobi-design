import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface SettingGroupProps {
  /** Caption-weight title above the list, text only, not a boxed surface. */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingGroup({ title, children, className }: SettingGroupProps) {
  return (
    <section className={cx('flex min-w-0 flex-col gap-2', className)}>
      {title ? <h3 className="pl-0.5 text-caption font-medium text-text-dim">{title}</h3> : null}
      <SettingList>{children}</SettingList>
    </section>
  );
}

export interface SettingListProps {
  children: ReactNode;
  className?: string;
}

/** The one surface: rows on bg-surface, a 1px seam of page background between them. */
export function SettingList({ children, className }: SettingListProps) {
  return (
    <div
      className={cx('flex min-w-0 flex-col gap-px overflow-hidden rounded-panel bg-bg', className)}
    >
      {children}
    </div>
  );
}

export interface SettingRowProps {
  /** Before the words: a status dot (`Badge appearance="text" dot`), an icon. */
  leading?: ReactNode;
  /** Body-sized, sentence case. */
  label: ReactNode;
  /**
   * Caption, inline after the label on the same line and wrapping under it when narrow: a
   * url, "last run 4 min ago", a fact or two. With one the label reserves 96px, so the metas
   * of a list line up.
   */
  meta?: ReactNode;
  /** Caption, dim, under the label. Used only when the label alone is not enough; never restates a value a control on the page already shows. */
  description?: ReactNode;
  /** Flush right: a Switch, a DurationInput, a Select with `hideLabel` (the row IS the label), a status word, a button or two. */
  control?: ReactNode;
  /** Full-width content under the label row: a url field, a secret, a copy field, an opened form. */
  children?: ReactNode;
  /** Id for the label span, for a control's aria-labelledby. */
  id?: string;
  /** Called out by a link: the surface takes the accent tint. Nothing else changes. */
  highlight?: boolean;
  className?: string;
}

/**
 * The list row every settings-shaped screen is made of: leading mark, words, trailing
 * control, optional body underneath. A scheduled task, an upstream connection and a plain
 * setting are the same row with different slots filled.
 */
export function SettingRow({
  leading,
  label,
  meta,
  description,
  control,
  children,
  id,
  highlight,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cx(
        'flex min-w-0 flex-col gap-3 px-4 py-3.5 scroll-mt-4',
        highlight ? 'bg-accent/15' : 'bg-surface',
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        {leading ? <span className="flex shrink-0 items-center">{leading}</span> : null}
        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-0.5">
            <span id={id} className={cx('text-body text-text', meta !== undefined && 'min-w-24')}>
              {label}
            </span>
            {meta ? (
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-0.5 text-caption wrap-anywhere text-text-dim">
                {meta}
              </span>
            ) : null}
          </span>
          {description ? <span className="text-caption text-text-dim">{description}</span> : null}
        </div>
        {control ? <div className="ml-auto flex shrink-0 items-center gap-3">{control}</div> : null}
      </div>
      {children}
    </div>
  );
}
