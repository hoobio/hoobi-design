import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  /** What the range means, on an (i) beside the label. */
  info?: string;
  /** The live value at the right of the label row. Format it yourself. */
  valueLabel?: ReactNode;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow. The readout stays. */
  hideLabel?: boolean;
}

/**
 * The native range input, styled to match the library. The readout is not decoration: a
 * slider with no number is a control you cannot set deliberately or describe to anyone else.
 */
export function Slider({
  label,
  info,
  valueLabel,
  hideLabel = false,
  className,
  id,
  ...rest
}: SliderProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const infoId = `${inputId}-info`;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label || valueLabel ? (
        <FieldLabel
          htmlFor={inputId}
          info={info}
          infoId={infoId}
          aside={valueLabel ? <span className="text-text tabular-nums">{valueLabel}</span> : null}
        >
          <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
        </FieldLabel>
      ) : null}
      <input
        id={inputId}
        type="range"
        aria-describedby={info ? infoId : undefined}
        className="m-0 h-8 w-full accent-accent"
        {...rest}
      />
    </div>
  );
}
