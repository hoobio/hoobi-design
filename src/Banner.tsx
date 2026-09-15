import type { ReactNode } from 'react';
import { Card, type CardTone } from './Card.js';

export interface BannerProps {
  tone?: CardTone;
  /** e.g. a Badge appearance="text" - the one-look answer. */
  headline: ReactNode;
  /** Raw machine string (a plan action, a status code), right-aligned on the headline row. */
  code?: ReactNode;
  /** The body: sentences, quotes, rendered between the headline and the chips. */
  children?: ReactNode;
  /** A row of dense facts under the body. */
  chips?: ReactNode;
  /** A row of buttons under the chips. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The one-look-answer banner: a headline (an outcome), the reasoning, then dense
 * facts and actions. Built on Card, using the same tone fills.
 */
export function Banner({ tone, headline, code, children, chips, actions, className }: BannerProps) {
  return (
    <Card tone={tone} className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        {headline}
        {code ? <span className="font-mono text-caption text-text-mute">{code}</span> : null}
      </div>
      {children}
      {chips ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption">{chips}</div>
      ) : null}
      {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
    </Card>
  );
}
