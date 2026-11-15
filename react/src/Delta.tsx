import { Badge } from './Badge.js';
import { cx } from './cx.js';

export interface DeltaProps {
  /** The signed change. */
  value: number;
  /** Formats the magnitude, sign excluded. Defaults to the number as given. */
  format?: (abs: number) => string;
  /** Printed after the magnitude: `%`. */
  suffix?: string;
  /** Lower is better: a fall is a gain and a rise is a loss. */
  invert?: boolean;
  className?: string;
}

/**
 * A Badge for a signed change. The sign is always printed: `+`, the real minus `−` (U+2212),
 * and `±` at zero. Success for a gain, danger for a loss, neutral at zero.
 */
export function Delta({
  value,
  format = String,
  suffix = '',
  invert = false,
  className,
}: DeltaProps) {
  const abs = Math.abs(value);
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  const good = invert ? value < 0 : value > 0;
  const tone = value === 0 ? 'neutral' : good ? 'success' : 'danger';
  return (
    <Badge tone={tone} className={cx('tabular-nums', className)}>
      {sign}
      {format(abs)}
      {suffix}
    </Badge>
  );
}
