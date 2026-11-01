import type { ReactNode } from 'react';
import { cx } from './cx.js';
import { tipAnchor } from './tip.js';

export interface FieldLabelProps {
  /** The control's id, when the label is a real <label>. */
  htmlFor?: string;
  children: ReactNode;
  /**
   * What this field means, shown from an (i) on hover. The house answer to helper copy:
   * nobody reads a sentence under every field, so the explanation sits behind an
   * affordance instead, and the line under the control stays free for a validation error.
   */
  info?: string;
  /**
   * Id for the hidden copy of `info`, which the control points `aria-describedby` at.
   * Every field component in this library wires it; pass it if you compose your own.
   */
  infoId?: string;
  /** Right-aligned in the label row: a mono readout, a `set` badge, a clear button. */
  aside?: ReactNode;
  className?: string;
}

/**
 * The one label row every field uses. Caption-sized, dimmed, with an optional (i) and an
 * optional right-hand slot - so a label, its state and its explanation line up the same
 * way in Input, Select, Slider, SecretField, DurationInput and CronInput alike.
 */
export function FieldLabel({ htmlFor, children, info, infoId, aside, className }: FieldLabelProps) {
  const Tag = htmlFor ? 'label' : 'span';
  return (
    <span className={cx('flex items-center justify-between gap-2 text-caption', className)}>
      <Tag htmlFor={htmlFor} className="flex min-w-0 items-center gap-1.5 text-text-dim">
        <span className="min-w-0">{children}</span>
        {info ? <InfoTip text={info} /> : null}
      </Tag>
      {/* OUTSIDE the label element on purpose: text inside <label> becomes part of the
          control's accessible name, so a field called "password" would read as
          "password At least 8 characters". The description is handled by describedby
          instead. */}
      {info && infoId ? (
        <span id={infoId} className="sr-only">
          {info}
        </span>
      ) : null}
      {aside}
    </span>
  );
}

export interface InfoTipProps {
  text: string;
  /** Renders a hidden copy of `text` under this id, for the control's aria-describedby. */
  id?: string;
  className?: string;
}

/**
 * The (i). A decorative glyph, not a button: it takes no tab stop, so Tab from username
 * moves to password next. A hidden span holds the text for screen readers via
 * `aria-describedby`, so removing the glyph from the accessibility tree loses nothing.
 */
export function InfoTip({ text, id, className }: InfoTipProps) {
  return (
    <>
      <span
        role="img"
        aria-hidden
        {...tipAnchor(text, 'above', false)}
        className={cx(
          'tip-fixed inline-flex size-4 shrink-0 items-center justify-center text-text-mute',
          className,
        )}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-4"
        >
          <circle cx="10" cy="10" r="7.25" />
          <path d="M10 9.25v4" />
          <path d="M10 6.6v.05" />
        </svg>
      </span>
      {id ? (
        <span id={id} className="sr-only">
          {text}
        </span>
      ) : null}
    </>
  );
}
