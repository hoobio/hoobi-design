import type { ReactNode } from 'react';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';
import { tipAnchor } from './tip.js';

export interface RadioCardOption {
  value: string;
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  disabled?: boolean;
  /** Why the option is unavailable, shown on its card while it is disabled. */
  disabledReason?: string;
  /** Further controls for this option, rendered under its card only while it is selected. */
  detail?: ReactNode;
}

export interface RadioCardsProps {
  /** The visible group label. */
  legend: ReactNode;
  /** Groups the native radios, and is what a form submits the value under. */
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioCardOption[];
  className?: string;
}

/**
 * A fieldset of native radios, each drawn as a card with a title and a line of description.
 * The input is the 20px mark on the card, so arrow keys, form submission and the global
 * focus ring stay the platform's. Selection is a fill plus a check, never an accent ring.
 * An unselected card fills as a field does (chip), which reads on a Card and on a Modal alike.
 */
export function RadioCards({ legend, name, value, onChange, options, className }: RadioCardsProps) {
  return (
    <fieldset className={cx('flex min-w-0 flex-col gap-2', className)}>
      <legend className="mb-2 p-0">
        <FieldLabel>{legend}</FieldLabel>
      </legend>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <div key={o.value} className="flex min-w-0 flex-col gap-2">
            <label
              {...tipAnchor(o.disabled ? o.disabledReason : undefined)}
              className={cx(
                'flex min-h-11 items-start gap-3 rounded-panel px-3 py-2.5 select-none',
                o.disabled && o.disabledReason && 'tip-fixed',
                selected ? 'bg-surface-raised' : 'bg-chip',
                o.disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
                !selected && !o.disabled && 'hover:bg-bg',
              )}
            >
              <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
                <input
                  type="radio"
                  name={name}
                  value={o.value}
                  checked={selected}
                  disabled={o.disabled}
                  onChange={() => {
                    onChange(o.value);
                  }}
                  className="peer size-5 min-h-0 appearance-none rounded-full bg-border checked:bg-text"
                />
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden
                  fill="none"
                  className="pointer-events-none absolute size-5 text-bg opacity-0 peer-checked:opacity-100"
                >
                  <path
                    d="M5 10.25l3.25 3.25L15 6.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-body-strong text-text">{o.title}</span>
                {o.description ? (
                  <span className="text-caption text-text-dim">{o.description}</span>
                ) : null}
              </span>
            </label>
            {selected && o.detail ? o.detail : null}
          </div>
        );
      })}
    </fieldset>
  );
}
