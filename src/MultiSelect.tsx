import type { HTMLAttributes } from 'react';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { Checkbox } from './Checkbox.js';
import { Popover } from './Popover.js';

export interface MultiSelectOption {
  value: string;
  label: string;
  iconUrl?: string;
}

export interface MultiSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Shown when nothing is selected; defaults to label. */
  placeholder?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
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
        <Button variant="secondary" className="w-full justify-between" {...props}>
          <span className="min-w-0 truncate">{value.length > 0 ? label : (placeholder ?? label)}</span>
          {value.length > 0 ? (
            <Badge tone="accent" size="sm">
              {value.length}
            </Badge>
          ) : null}
        </Button>
      )}
    >
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <Checkbox
            key={option.value}
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
    </Popover>
  );
}
