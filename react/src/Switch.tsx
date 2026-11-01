import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx.js';
import { InfoTip } from './FieldLabel.js';

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'children' | 'type'
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Text beside the track. Without one, pass aria-label. */
  label?: ReactNode;
  /**
   * What turning it on does, on an (i) that always follows the LABEL TEXT - never the track,
   * exactly as FieldLabel places it for an input. Ignored without a `label`: an (i) floating
   * beside a bare track names nothing.
   */
  info?: string;
  /**
   * 'start'   - track then label, sized to its content. The inline form.
   * 'between' - a full-width settings row: the words left, the track flush right. The label
   *             sits outside the button and is wired with aria-labelledby, because a
   *             sentence-long hit target that also has to hold an (i) is not one button.
   */
  align?: 'start' | 'between';
  /** Prints On / Off before the track, the WinUI ToggleSwitch content. For a switch whose label describes what it does but not its current state. */
  stateLabel?: boolean;
}

/**
 * The master on/off. A button with role="switch", not a checkbox: this is a setting that
 * takes effect on its own, where Checkbox is a value in a set.
 *
 * The label wraps. A settings row reads "Auto-approve when the reporter is the requester",
 * and a control that does not wrap sets a 355px floor on the page.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  info,
  align = 'start',
  stateLabel = false,
  className,
  disabled,
  onClick,
  ...rest
}: SwitchProps) {
  const labelId = useId();
  const infoId = `${labelId}-info`;
  const between = align === 'between';
  // An (i) beside a bare track has nothing to explain: it depends on the words it annotates.
  // Inline after the last word, not a flex sibling: a wrapped label's flex sibling ends up
  // pinned beside the track, which is the one place the (i) must never be.
  const tip =
    label && info ? (
      <InfoTip text={info} id={infoId} className={between ? 'ml-1.5 align-text-bottom' : 'mt-2'} />
    ) : null;

  const track = (
    <span
      className={cx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-standard',
        checked ? 'bg-accent' : 'bg-border',
      )}
    >
      <span
        className={cx(
          'absolute top-0.75 size-3.5 rounded-full bg-on-accent transition-[left] duration-150 ease-decelerate',
          checked ? 'left-4.75' : 'left-0.75',
        )}
      />
    </span>
  );

  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={between && label ? labelId : undefined}
      aria-describedby={tip ? infoId : undefined}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onCheckedChange(!checked);
      }}
      className={cx(
        'inline-flex min-w-0 items-start gap-2.5 border-0 bg-transparent p-0 text-left text-body text-text disabled:pointer-events-none disabled:opacity-50',
        between ? 'mt-0.5 shrink-0' : label ? 'py-1.5' : 'h-5',
        stateLabel && 'items-center',
        !between && !tip && className,
      )}
      {...rest}
    >
      {stateLabel ? (
        <span className="text-caption text-text-dim" aria-hidden>
          {checked ? 'On' : 'Off'}
        </span>
      ) : null}
      {track}
      {!between && label ? <span className="min-w-0">{label}</span> : null}
    </button>
  );

  if (between && label) {
    return (
      <div className={cx('flex w-full min-w-0 items-start justify-between gap-3', className)}>
        {/* labelledby points at the words alone: the (i)'s hidden text is a sibling, so
            aria-describedby reads it once instead of it being included twice in the label. */}
        <span className="min-w-0 py-1.5 text-body text-text">
          <span id={labelId}>{label}</span>
          {tip}
        </span>
        {button}
      </div>
    );
  }

  if (!tip) return button;
  return (
    <span className={cx('inline-flex min-w-0 items-start gap-1.5', className)}>
      {button}
      {tip}
    </span>
  );
}
