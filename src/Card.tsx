import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.js';

export type CardTone = 'info' | 'success' | 'warn' | 'danger';

const TONE_FILLS: Record<CardTone, string> = {
  info: 'bg-info/15',
  success: 'bg-success/15',
  warn: 'bg-warn/15',
  danger: 'bg-danger/15',
};

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  /**
   * Mirage backdrop scoped to this card: any CSS image (a poster url(...)),
   * blurred and tinted towards surface-raised. The layer becomes the fill.
   */
  mirage?: string;
  /**
   * Tints the whole card as a solid semantic fill instead of surface-raised
   * (e.g. a triage banner). Ignored when `mirage` is also set.
   */
  tone?: CardTone;
  /**
   * false makes this a sliced card: the body runs flush to the edges so content that
   * bleeds its own hairlines (DescriptionList, a full-width list) can actually reach
   * them, and the title becomes its own section above a hairline of page background.
   */
  padded?: boolean;
}

export function Card({
  title,
  actions,
  mirage,
  tone,
  padded = true,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const header =
    title || actions ? (
      <div
        className={cx(
          'flex items-baseline justify-between gap-3',
          padded ? 'mb-3' : 'border-b border-bg px-4 py-3',
        )}
      >
        {title ? <h3 className="text-body-strong text-text">{title}</h3> : <span />}
        {actions}
      </div>
    ) : null;

  return (
    <div
      className={cx(
        'rounded-panel',
        padded ? 'p-4' : 'overflow-hidden',
        mirage ? 'mirage-scoped' : tone ? TONE_FILLS[tone] : 'bg-surface-raised',
        className,
      )}
      // --pad is what a Divider inside cancels to reach the edges, so the card states its
      // own padding rather than every rule having to guess it.
      style={
        {
          ...style,
          '--pad': padded ? '16px' : '0px',
          ...(mirage ? { '--mirage-image': mirage } : null),
        } as CSSProperties
      }
      {...rest}
    >
      {header}
      {children}
    </div>
  );
}
