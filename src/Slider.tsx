import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  /** What the range means, on an (i) beside the label. */
  info?: string;
  /** The live value, mono, at the right of the label row. Format it yourself. */
  valueLabel?: ReactNode;
}

/**
 * The native range input in house clothes. The readout is not decoration: a slider with
 * no number is a control you cannot set deliberately or describe to anyone else.
 */
export function Slider({ label, info, valueLabel, className, id, ...rest }: SliderProps) {
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
          aside={valueLabel ? <span className="font-mono text-text">{valueLabel}</span> : null}
        >
          {label}
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
