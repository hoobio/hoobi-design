import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** CSS image (a poster url(...)): renders the mirage-hero band behind the header. */
  mirage?: string;
  /** Typically an <img>; sized into a fixed 44x66 slot regardless of the child's own dimensions. */
  thumb?: ReactNode;
  title: ReactNode;
  /** A text-caption text-text-dim line under the title. */
  meta?: ReactNode;
  /** Right-aligned, beside the title row. */
  actions?: ReactNode;
  /** Centred on the title row from lg up, like a WinUI title bar control; wraps inline below lg. */
  center?: ReactNode;
  /** Rendered above the title row - a Breadcrumbs trail. */
  crumbs?: ReactNode;
}

/**
 * The head of a detail page: optional mirage band, crumbs, a thumb/title/meta row
 * and right-aligned actions. `.mirage-lift` on the text-bearing content lifts the
 * muted tones so they stay readable over the mirage band; harmless when there is none.
 */
export function PageHeader({
  mirage,
  thumb,
  title,
  meta,
  actions,
  center,
  crumbs,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <div {...rest} className={cx('flex flex-col gap-4', className)}>
      {mirage ? (
        <div
          aria-hidden
          className="mirage-hero"
          style={{ '--mirage-image': mirage } as CSSProperties}
        />
      ) : null}
      <div className="mirage-lift flex flex-col gap-4">
        {crumbs}
        <div className="relative flex flex-wrap items-center gap-4">
          {thumb ? (
            <div className="h-[66px] w-11 shrink-0 overflow-hidden rounded-control">{thumb}</div>
          ) : null}
          {/* A real basis, not flex-1: with basis 0 the title block has no minimum width, so on a
              phone it squeezes to a few words beside the actions instead of wrapping them below. */}
          <div className="flex min-w-0 grow basis-60 flex-col gap-1">
            <h2 className="text-subtitle break-words text-text">{title}</h2>
            {meta ? <p className="text-caption text-text-dim">{meta}</p> : null}
          </div>
          {center ? (
            <div className="flex flex-col items-center gap-0.5 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-1/2">
              {center}
            </div>
          ) : null}
          {actions ? <span className="flex shrink-0 items-center gap-3">{actions}</span> : null}
        </div>
      </div>
    </div>
  );
}
