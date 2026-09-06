import { useId, useState, type ReactNode } from 'react';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { cx } from './cx.js';
import { FieldLabel } from './FieldLabel.js';
import { CopyIcon, EyeIcon, EyeOffIcon, LockIcon } from './icons.js';
import { tipAnchor } from './tip.js';
import { useCopy } from './copy.js';

export type SecretFieldVariant = 'write-only' | 'reveal' | 'hidden';

/** Wording only, for translation. There is no slot here for explaining what a secret is. */
export interface SecretFieldLabels {
  /** The lock and badge tooltip. */
  stored: string;
  set: string;
  clear: string;
  reveal: string;
  hide: string;
  copy: string;
  copied: string;
  regenerate: string;
  rotate: string;
  /** Shown once a draft would overwrite a stored value. */
  replaces: string;
  /** Placeholder when nothing is stored yet. */
  empty: string;
}

const DEFAULT_LABELS: SecretFieldLabels = {
  stored: 'Stored. Enter a new value to replace it.',
  set: 'set',
  clear: 'clear',
  reveal: 'Reveal value',
  hide: 'Hide value',
  copy: 'copy',
  copied: 'copied',
  regenerate: 'regenerate',
  rotate: 'rotate',
  replaces: 'Replaces the stored value on save.',
  empty: 'paste a value',
};

export interface SecretFieldProps {
  /**
   * 'write-only' - a stored value that can be replaced but never read back.
   * 'reveal'     - a value the server can hand back: masked, with an eye toggle and copy.
   * 'hidden'     - a value nobody ever sees, only rotates.
   */
  variant?: SecretFieldVariant;
  label: ReactNode;
  /** True when a value is stored server-side. */
  set?: boolean;
  /** write-only: the draft that replaces the stored value on save. */
  value?: string;
  onChange?: (value: string) => void;
  /** write-only: discards the stored value. Destructive - put a ActionDialog in front of it. */
  onClear?: () => void;
  /** reveal: the real value. Masked until the eye is pressed; also what copy puts on the clipboard. */
  revealedValue?: string;
  /** reveal: issues a new value. Irrecoverable - put a ActionDialog in front of it. */
  onRegenerate?: () => void;
  /** hidden: replaces the stored value. Irrecoverable - put a ActionDialog in front of it. */
  onRotate?: () => void;
  /** Validation failure. The only prose that renders under the control. */
  error?: ReactNode;
  /** A short value-dependent readout, e.g. after a rotate. */
  note?: ReactNode;
  /** Wording overrides for translation. Not a slot for helper copy. */
  labels?: Partial<SecretFieldLabels>;
  disabled?: boolean;
  /** The label is read to screen readers but not drawn: for a control inside a SettingRow. */
  hideLabel?: boolean;
  id?: string;
  className?: string;
}

const MASK = '•'.repeat(16);

/**
 * A secret, shown as what can be done to it rather than explained in a sentence. The lock
 * and the dots ARE the statement that something is stored and cannot be read back; the
 * tooltip carries the words, on hover and keyboard focus only. There is deliberately no
 * prop for a caption under the field.
 *
 * Every mutating callback fires immediately and unconfirmed: clearing, regenerating and
 * rotating are destructive, so the CONSUMER puts a ActionDialog in front of them. This
 * component holds no arm state.
 */
export function SecretField({
  variant = 'write-only',
  label,
  set = false,
  value = '',
  onChange,
  onClear,
  revealedValue,
  onRegenerate,
  onRotate,
  error,
  note,
  labels,
  disabled = false,
  hideLabel = false,
  id,
  className,
}: SecretFieldProps) {
  const t = labels ? { ...DEFAULT_LABELS, ...labels } : DEFAULT_LABELS;
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const [revealed, setRevealed] = useState(false);
  const { copied, copy } = useCopy();

  const lock = (
    <span
      {...tipAnchor(t.stored)}
      className="tip-fixed inline-flex shrink-0 items-center text-text-mute"
    >
      <LockIcon className="size-4" />
    </span>
  );

  const setBadge = set ? (
    <Badge size="sm" tone="success" dot tooltip={t.stored}>
      {t.set}
    </Badge>
  ) : null;

  const under = (
    <>
      {error ? <p className="text-caption text-danger">{error}</p> : null}
      {note ? <p className="text-caption text-success">{note}</p> : null}
    </>
  );

  if (variant === 'reveal') {
    return (
      <div className={cx('flex min-w-0 flex-col gap-2', className)}>
        <FieldLabel aside={setBadge} className={hideLabel ? 'sr-only' : undefined}>
          {label}
        </FieldLabel>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 min-w-60 flex-1 items-center overflow-hidden rounded-control border border-transparent bg-chip pointer-coarse:h-11">
            <code
              className={cx(
                'min-w-0 flex-1 truncate px-2.5 font-mono text-body text-text',
                !revealed && 'tracking-widest',
              )}
            >
              {revealed ? (revealedValue ?? '') : MASK.repeat(2)}
            </code>
            <button
              type="button"
              onClick={() => {
                setRevealed(!revealed);
              }}
              aria-pressed={revealed}
              aria-label={revealed ? t.hide : t.reveal}
              className="flex h-full w-8 shrink-0 items-center justify-center border-0 border-l border-bg bg-transparent text-text-dim hover:bg-surface-raised hover:text-text"
            >
              {revealed ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </button>
          </div>
          <Button
            onClick={() => {
              copy(revealedValue ?? '');
            }}
            disabled={disabled || !revealedValue}
          >
            <CopyIcon className="size-4" />
            {copied ? t.copied : t.copy}
          </Button>
          {onRegenerate ? (
            <Button variant="ghost" onClick={onRegenerate} disabled={disabled}>
              {t.regenerate}
            </Button>
          ) : null}
        </div>
        {under}
      </div>
    );
  }

  if (variant === 'hidden') {
    return (
      <div className={cx('flex min-w-0 flex-wrap items-center justify-between gap-3', className)}>
        <span className="flex min-w-0 items-center gap-2 text-body text-text">
          {lock}
          <span className={cx('min-w-0 truncate', hideLabel && 'sr-only')}>{label}</span>
          {setBadge}
        </span>
        {onRotate ? (
          <Button onClick={onRotate} disabled={disabled}>
            {t.rotate}
          </Button>
        ) : null}
        <div className="w-full empty:hidden">{under}</div>
      </div>
    );
  }

  const aside = (
    <span className="flex shrink-0 items-center gap-2">
      {setBadge}
      {set && onClear ? (
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="h-4.5 rounded-control border-0 bg-transparent px-1 text-caption text-text-dim hover:text-danger disabled:pointer-events-none disabled:opacity-50"
        >
          {t.clear}
        </button>
      ) : null}
    </span>
  );

  // With the label hidden there is no label row to hold the badge and clear, so they ride inside the field: an empty row above the input read as a layout bug.
  return (
    <div className={cx('flex min-w-0 flex-col gap-1', className)}>
      <FieldLabel
        htmlFor={inputId}
        aside={hideLabel ? undefined : aside}
        className={hideLabel ? 'sr-only' : undefined}
      >
        {label}
      </FieldLabel>
      <div
        className={cx(
          'flex h-8 items-center rounded-control border bg-chip pointer-coarse:h-11',
          error ? 'border-danger' : 'border-transparent',
        )}
      >
        <span className="flex h-full shrink-0 items-center pl-2.5">{lock}</span>
        <input
          id={inputId}
          type="password"
          autoComplete="new-password"
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          placeholder={set ? MASK : t.empty}
          className={cx(
            'h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-body text-text placeholder:text-text-mute',
            set && 'placeholder:tracking-widest',
          )}
        />
        {hideLabel ? <span className="flex h-full items-center pr-2">{aside}</span> : null}
      </div>
      {set && value ? <p className="text-caption text-warn">{t.replaces}</p> : null}
      {under}
    </div>
  );
}
