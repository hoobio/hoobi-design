import type { ReactNode } from 'react';
import { cx } from './cx.js';

export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info';

export interface TimelineProps {
  children: ReactNode;
  className?: string;
  /** A bare neutral rail with no Timeline.Item chrome - for a feed whose beats already carry their own layout. */
  plain?: boolean;
}

export interface TimelineItemProps {
  /** Rail colour. */
  tone?: TimelineTone;
  /** Dense metadata shown above/beside the content - a timestamp. */
  time?: ReactNode;
  /** Badges or labels on the item's head row, beside the time. */
  head?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface TimelineCommentProps {
  /** Caller styles it - a name, a Persona, an author badge. */
  author: ReactNode;
  time?: string;
  /** The body reads as the point rather than a quote. Default false. */
  emphasis?: boolean;
  children?: ReactNode;
}

export interface TimelineFoldProps {
  /** What is collapsed - "7 status changes and 11 agent steps". */
  summary: ReactNode;
  /** e.g. "10:50 am - 11:28 am". */
  range?: string;
  defaultOpen?: boolean;
  /** Controlled open state; pair with onOpenChange. A permalink can then reopen this fold. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A static, unique name for the fold, so its state has an address. */
  id?: string;
  children?: ReactNode;
}

export interface TimelineEventProps {
  time?: string;
  /** Caller passes e.g. a Badge appearance="text". */
  label: ReactNode;
  note?: ReactNode;
}

export interface TimelineStepProps {
  time?: string;
  /** e.g. 'call' / 'result' - mono, muted. */
  kind?: string;
  /** Mono; caller colours it. */
  label: ReactNode;
  /** Folded behind a nested "detail" <details> when present. */
  detail?: ReactNode;
  /** Controlled open state of the detail; pair with onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A static, unique name for the step, so its state has an address. */
  id?: string;
  /** Alternative body under the line, plain caption-small dim text. */
  children?: ReactNode;
}

const RAILS: Record<TimelineTone, string> = {
  neutral: 'border-border',
  accent: 'border-accent',
  success: 'border-success',
  warn: 'border-warn',
  danger: 'border-danger',
  info: 'border-info',
};

export function Timeline({ children, className, plain = false }: TimelineProps) {
  if (plain) {
    return (
      <div
        className={cx(
          'flex min-w-0 flex-col gap-4 border-l-2 border-surface-raised pl-4',
          className,
        )}
      >
        {children}
      </div>
    );
  }
  return <ol className={cx('flex min-w-0 flex-col gap-3', className)}>{children}</ol>;
}

function TimelineItem({ tone = 'neutral', time, head, children, className }: TimelineItemProps) {
  return (
    <li className={cx('min-w-0 border-l-2 pl-3', RAILS[tone], className)}>
      {time || head ? (
        <div className="flex flex-col gap-x-3 gap-y-1 sm:flex-row sm:flex-wrap sm:items-baseline">
          {time ? <span className="font-mono text-caption text-text-mute">{time}</span> : null}
          {head}
        </div>
      ) : null}
      {children ? <div className="min-w-0 text-body break-words text-text">{children}</div> : null}
    </li>
  );
}

function TimelineComment({ author, time, emphasis = false, children }: TimelineCommentProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="flex flex-wrap items-baseline gap-x-2">
        {author}
        {time ? <span className="font-mono text-caption text-text-mute">{time}</span> : null}
      </span>
      <div
        className={cx(
          'rounded-panel bg-surface px-3.5 py-2.5 text-body break-words whitespace-pre-wrap',
          emphasis ? 'text-text' : 'text-text-dim',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Our own chevron, not the browser's ::marker: that box has no fixed width and no rotation. */
function Chevron() {
  return (
    <span aria-hidden className="flex shrink-0 items-center self-stretch">
      <svg
        viewBox="0 0 12 12"
        fill="none"
        className="size-3 transition-transform duration-150 ease-standard group-open:rotate-90"
      >
        <path
          d="M4.5 2.5L8 6l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// display:flex on a summary drops the ::marker in every engine but WebKit, which keeps its own.
const SUMMARY = 'flex cursor-pointer items-baseline gap-x-2 [&::-webkit-details-marker]:hidden';

function TimelineFold({
  summary,
  range,
  defaultOpen,
  open,
  onOpenChange,
  id,
  children,
}: TimelineFoldProps) {
  return (
    <details
      id={id}
      className="group min-w-0"
      open={open ?? defaultOpen}
      onToggle={(e) => onOpenChange?.(e.currentTarget.open)}
    >
      <summary className={cx(SUMMARY, 'text-caption text-text-mute')}>
        <Chevron />
        <span className="min-w-0">
          {summary}
          {range ? (
            <>
              <span className="px-1.5">·</span>
              <span className="font-mono">{range}</span>
            </>
          ) : null}
        </span>
      </summary>
      {/* Indented under the chevron: what a fold hides is a level below what names it. */}
      <div className="mt-2 flex flex-col gap-1.5 pl-5">{children}</div>
    </details>
  );
}

function TimelineEvent({ time, label, note }: TimelineEventProps) {
  return (
    // Each Event is its own grid, so the time cell carries the column width itself: 8ch of its
    // own mono, exactly "12:58 pm", which aligns every row with no slack. Baseline alignment
    // keeps the mono time, the label and the sans note reading as one line of text.
    <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-2 gap-y-0.5 max-sm:grid-cols-[auto_minmax(0,1fr)]">
      <span className="min-w-[8ch] font-mono text-caption-small whitespace-nowrap text-text-mute">
        {time}
      </span>
      {/* Sized here, not by the consumer: an Event is one dense line, whatever label it gets. */}
      <span className="min-w-0 text-caption-small">{label}</span>
      {note ? (
        <span className="text-caption-small text-text-dim break-words max-sm:col-start-2">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function TimelineStep({
  time,
  kind,
  label,
  detail,
  open,
  onOpenChange,
  id,
  children,
}: TimelineStepProps) {
  // The chevron sits beside the thing it expands - after the time and kind, before the label -
  // so the line's left edge stays on the same column as a Step with nothing to expand.
  const line = (chevron: boolean) => (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-mono text-caption-small">
      {/* The same 8ch column as an Event's time, so the two kinds of row share it. */}
      {time ? <span className="min-w-[8ch] text-text-mute">{time}</span> : null}
      {kind ? <span className="text-text-mute">{kind}</span> : null}
      {chevron ? <Chevron /> : null}
      {label}
    </span>
  );
  return (
    <div className="flex flex-col gap-1">
      {detail ? (
        <details
          id={id}
          className="group min-w-0"
          open={open}
          onToggle={(e) => onOpenChange?.(e.currentTarget.open)}
        >
          <summary className={cx(SUMMARY, 'gap-x-0')}>{line(true)}</summary>
          {/* A tier in from the line: a stamped payload must not read as the next event. */}
          <div className="mt-1 pl-5 text-caption-small text-text-dim">{detail}</div>
        </details>
      ) : (
        line(false)
      )}
      {children ? <div className="pl-5 text-caption-small text-text-dim">{children}</div> : null}
    </div>
  );
}

Timeline.Item = TimelineItem;
Timeline.Comment = TimelineComment;
Timeline.Fold = TimelineFold;
Timeline.Event = TimelineEvent;
Timeline.Step = TimelineStep;
