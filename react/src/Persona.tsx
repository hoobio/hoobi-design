import type { HTMLAttributes } from 'react';
import { cx } from './cx.js';

export type PersonaTone = 'accent' | 'neutral';

export interface PersonaProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  tone?: PersonaTone;
}

const TONES: Record<PersonaTone, { fill: string; text: string; avatar: string }> = {
  accent: { fill: 'bg-accent-blue/10', text: 'text-accent-blue', avatar: 'bg-accent-blue/20' },
  neutral: { fill: 'bg-surface-raised', text: 'text-text-dim', avatar: 'bg-chip' },
};

/** An inline identity chip: an initial in a small circle, then the name. */
export function Persona({ name, tone = 'neutral', className, ...rest }: PersonaProps) {
  const t = TONES[tone];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-chip py-0.5 pr-1.5 pl-0.5 text-caption whitespace-nowrap',
        t.fill,
        t.text,
        className,
      )}
      {...rest}
    >
      <span
        className={cx(
          'flex size-4 shrink-0 items-center justify-center rounded-full text-caption-small font-semibold',
          t.avatar,
        )}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      {name}
    </span>
  );
}
