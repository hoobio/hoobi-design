import type { HTMLAttributes, ReactNode } from 'react';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { Checkbox } from './Checkbox.js';
import { cx } from './cx.js';
import { ChevronIcon } from './icons.js';
import { Popover } from './Popover.js';

export interface MultiSelectOption {
  value: string;
  label: ReactNode;
  iconUrl?: string;
}

export interface MultiSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Shown when nothing is selected; defaults to label. */
  placeholder?: string;
  /** Rendered at the bottom of the open panel, below the options, above nothing else. For an action such as a manage link. */
  footer?: ReactNode;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  footer,
  className,
  ...rest
}: MultiSelectProps) {
  const toggle = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    const known = options.filter((o) => next.includes(o.value)).map((o) => o.value);
    const unknown = next.filter((v) => !options.some((o) => o.value === v));
    onChange([...known, ...unknown]);
  };

  return (
    <Popover
      label={label}
      className={className}
      {...rest}
      trigger={(props) => (
        <button
          type="button"
          className="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-control bg-chip pr-2.5 pl-3 text-body text-text"
          {...props}
        >
          <span className="min-w-0 truncate">{value.length > 0 ? label : (placeholder ?? label)}</span>
          <span className="flex shrink-0 items-center gap-1.5">
            {value.length > 0 ? (
              <Badge tone="accent" size="sm">
                {value.length}
              </Badge>
            ) : null}
            <ChevronIcon
              className={cx(
                'size-3 text-text-mute transition-transform duration-150 ease-standard',
                props['aria-expanded'] ? '-rotate-90' : 'rotate-90',
              )}
            />
          </span>
        </button>
      )}
    >
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            className="w-full rounded-control px-2.5 hover:bg-surface"
            checked={value.includes(option.value)}
            onChange={() => {
              toggle(option.value);
            }}
            label={
              option.iconUrl ? (
                <span className="inline-flex items-center gap-2">
                  <img src={option.iconUrl} alt="" className="size-4 shrink-0" />
                  {option.label}
                </span>
              ) : (
                option.label
              )
            }
          />
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          disabled={value.length === 0}
          onClick={() => {
            onChange([]);
          }}
        >
          Clear
        </Button>
      </div>
      {footer ? <div className="border-t border-bg px-2.5 pt-2">{footer}</div> : null}
    </Popover>
  );
}
