import { useState } from 'react';
import { cx } from './cx.js';

export type RatingSize = 'sm' | 'md';

export interface RatingProps {
  /** null is unrated. Clicking the current value clears back to null. */
  value: number | null;
  max?: number;
  onChange?: (next: number | null) => void;
  size?: RatingSize;
  /** Stars only, no buttons and no tab stops. Implied when onChange is omitted. */
  readOnly?: boolean;
  /** Names the group for assistive tech: "Raid performance". */
  label?: string;
  className?: string;
}

const SIZES: Record<RatingSize, { box: string; star: string }> = {
  sm: { box: 'size-4', star: 'size-3' },
  md: { box: 'size-5', star: 'size-3.5' },
};

function Star({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cx('shrink-0', className)}>
      <path
        d="M10 2.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L10 14.49l-4.7 2.47.9-5.23-3.8-3.7 5.25-.77z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Rating({
  value,
  max = 5,
  onChange,
  size = 'md',
  readOnly = false,
  label,
  className,
}: RatingProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const sizes = SIZES[size];
  const still = readOnly || !onChange;

  const toneOf = (n: number) => {
    const committed = n <= (value ?? 0);
    if (committed) return 'text-warn';
    return n <= (preview ?? 0) ? 'text-warn/60' : 'text-text-mute';
  };

  if (still) {
    return (
      <span
        role="img"
        aria-label={`${label ? `${label}: ` : ''}${value === null ? 'Unrated' : `${String(value)} of ${String(max)}`}`}
        className={cx('inline-flex items-center', className)}
      >
        {stars.map((n) => (
          <span key={n} className={cx('flex items-center justify-center', sizes.box, toneOf(n))}>
            <Star filled={n <= (value ?? 0)} className={sizes.star} />
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      role="group"
      aria-label={label}
      className={cx('inline-flex items-center', className)}
      onPointerLeave={() => {
        setPreview(null);
      }}
    >
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${String(n)}`}
          aria-pressed={value === n}
          onClick={() => {
            onChange(value === n ? null : n);
          }}
          onPointerEnter={(e) => {
            // Touch reports a pointerenter on tap, which would light the preview tone and
            // leave it lit with no pointerleave to follow.
            if (e.pointerType === 'mouse') setPreview(n);
          }}
          onFocus={() => {
            setPreview(n);
          }}
          onBlur={() => {
            setPreview(null);
          }}
          className={cx(
            'flex items-center justify-center pointer-coarse:size-11',
            sizes.box,
            toneOf(n),
          )}
        >
          <Star filled={n <= (preview ?? value ?? 0)} className={sizes.star} />
        </button>
      ))}
    </span>
  );
}
