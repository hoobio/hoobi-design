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
      <div className={cx('flex min-w-0 flex-col gap-4 border-l-2 border-surface-raised pl-4', className)}>
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

function TimelineFold({ summary, range, defaultOpen, children }: TimelineFoldProps) {
  return (
    <details className="min-w-0" open={defaultOpen}>
      <summary className="cursor-pointer text-caption text-text-mute">
        {summary}
        {range ? (
          <>
            <span className="px-1.5">·</span>
            <span className="font-mono">{range}</span>
          </>
        ) : null}
      </summary>
      <div className="mt-2 flex flex-col gap-1.5">{children}</div>
    </details>
  );
}

function TimelineEvent({ time, label, note }: TimelineEventProps) {
  return (
    // The time column is fixed so events align across rows (each Event is its own grid), sized
    // snug to "12:58 pm" at caption-small mono; baseline alignment keeps the mono time, the
    // label and the sans note reading as one line of text.
    <div className="grid grid-cols-[3.5rem_auto_minmax(0,1fr)] items-baseline gap-x-2.5 gap-y-0.5 max-sm:grid-cols-[3.5rem_minmax(0,1fr)]">
      <span className="font-mono text-caption-small whitespace-nowrap text-text-mute">{time}</span>
      {label}
      {note ? (
        <span className="text-caption-small text-text-dim break-words max-sm:col-start-2">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function TimelineStep({ time, kind, label, detail, children }: TimelineStepProps) {
  const line = (
    <span className="flex flex-wrap items-baseline gap-x-2 font-mono text-caption-small">
      {time ? <span className="text-text-mute">{time}</span> : null}
      {kind ? <span className="text-text-mute">{kind}</span> : null}
      {label}
    </span>
  );
  return (
    <div className="flex flex-col gap-1">
      {detail ? (
        <details className="min-w-0">
          <summary className="cursor-pointer">{line}</summary>
          <div className="mt-1 text-caption-small text-text-dim">{detail}</div>
        </details>
      ) : (
        <div className="pl-3.5">{line}</div>
      )}
      {children ? <div className="text-caption-small text-text-dim">{children}</div> : null}
    </div>
  );
}

Timeline.Item = TimelineItem;
Timeline.Comment = TimelineComment;
Timeline.Fold = TimelineFold;
Timeline.Event = TimelineEvent;
Timeline.Step = TimelineStep;
