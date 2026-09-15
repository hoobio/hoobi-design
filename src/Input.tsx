import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  /** What this field means, on an (i) beside the label. Shown on hover and keyboard focus. */
  info?: string;
  /**
   * @deprecated Use `info`. Explanations belong in a tooltip, not a caption: a sentence
   * under every field goes unread and pushes the form apart. Still renders, so 0.19.0
   * consumers keep working.
   */
  hint?: ReactNode;
  /** Validation failure, the thing that belongs under the control. */
  error?: ReactNode;
  /** For a url, an id, a key - anything read character by character. */
  mono?: boolean;
  /** Right-aligned in the label row: a badge, a readout, a small action. */
  aside?: ReactNode;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow, where the row shows the words. */
  hideLabel?: boolean;
}

export function Input({
  label,
  info,
  hint,
  error,
  mono = false,
  aside,
  hideLabel = false,
  className,
  id,
  ...rest
}: InputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const infoId = `${inputId}-info`;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      {label || aside ? (
        <FieldLabel
          htmlFor={inputId}
          info={info}
          infoId={infoId}
          aside={aside}
          className={hideLabel ? 'sr-only' : undefined}
        >
          {label}
        </FieldLabel>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={info ? infoId : undefined}
        className={cx(
          'h-8 w-full min-w-0 rounded-control border bg-chip px-2.5 text-body text-text placeholder:text-text-mute',
          mono && 'font-mono',
          error ? 'border-danger' : 'border-transparent',
        )}
        {...rest}
      />
      {error ? <p className="text-caption text-danger">{error}</p> : null}
      {!error && hint ? <p className="text-caption text-text-mute">{hint}</p> : null}
    </div>
  );
}
