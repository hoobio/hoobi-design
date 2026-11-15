import { useId, type ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
}

export interface SegmentedControlProps {
  label: ReactNode;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow. */
  hideLabel?: boolean;
  /** What this field means, on an (i) beside the label. */
  info?: string;
  /** 2 to 4 options. */
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A short, mutually exclusive choice: native radios in a radiogroup, so arrow keys and the focus
 * ring are the platform's. Each radio is invisible and fills its segment; the selected segment
 * is filled, with no accent and no border.
 */
export function SegmentedControl({
  label,
  hideLabel = false,
  info,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SegmentedControlProps) {
  const id = useId();
  const infoId = `${id}-info`;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      <FieldLabel info={info} infoId={infoId} className={hideLabel ? 'sr-only' : undefined}>
        <span id={`${id}-label`}>{label}</span>
      </FieldLabel>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={info ? infoId : undefined}
        className="inline-flex h-8 max-w-full self-start rounded-control bg-chip p-0.5 pointer-coarse:h-11"
      >
        {options.map((o) => (
          <label
            key={o.value}
            className={cx(
              'relative inline-flex min-w-0 items-center justify-center px-3 text-body whitespace-nowrap select-none',
              value === o.value ? 'text-text' : 'text-text-dim',
              disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
            )}
          >
            <input
              type="radio"
              name={id}
              value={o.value}
              checked={value === o.value}
              disabled={disabled}
              onChange={() => {
                onChange(o.value);
              }}
              className="absolute inset-0 min-h-0 appearance-none rounded-control checked:bg-surface-raised"
            />
            <span className="pointer-events-none relative min-w-0 truncate">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
