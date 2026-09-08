import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type InboxItemTone = 'ok' | 'warn' | 'error' | 'neutral';
export type InboxListDensity = 'comfortable' | 'compact';

export interface InboxListProps extends HTMLAttributes<HTMLUListElement> {
  /** Removes the shared surface for a lower-priority, background queue. */
  variant?: 'surface' | 'plain';
  /** Row rhythm. `compact` is intended for persistent agent inboxes. */
  density?: InboxListDensity;
}

/** A single prioritized work queue. Rows, not cards, carry the hierarchy. */
export function InboxList({
  variant = 'surface',
  density = 'comfortable',
  className,
  ...rest
}: InboxListProps) {
  return (
    <ul
      className={cx(
        'he-inbox-list',
        `he-inbox-list--${variant}`,
        density === 'compact' && 'he-inbox-list--compact',
        className,
      )}
      {...rest}
    />
  );
}

export interface InboxItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  /** Avatar, document icon or other stable identity mark. */
  leading?: ReactNode;
  /** Person, account or record name. */
  subject: ReactNode;
  /** Contact detail or record identifier. */
  subjectMeta?: ReactNode;
  /** The one reason this item is in the queue. */
  title: ReactNode;
  /** Supporting explanation, kept to one short sentence. */
  description?: ReactNode;
  /** Universal state tone. */
  tone?: InboxItemTone;
  /** Localized state announced before the title; color never carries it alone. */
  statusLabel: string;
  /** Human-readable state label. */
  status?: ReactNode;
  /** Optional context block such as document completion. */
  context?: ReactNode;
  /** Progress value from 0 to 100. Omit to hide the track. */
  progress?: number;
  /** Progress semantics may differ from the queue status. Defaults to `tone`. */
  progressTone?: InboxItemTone;
  /** Accessible name for the progress track. Falls back to string `context`. */
  progressLabel?: string;
  /** The single next action for this item. */
  action?: ReactNode;
  /** Makes the non-action part of the row selectable. */
  onSelect?: () => void;
}

export function InboxItem({
  leading,
  subject,
  subjectMeta,
  title,
  description,
  tone = 'neutral',
  statusLabel,
  status,
  context,
  progress,
  progressTone,
  progressLabel,
  action,
  onSelect,
  className,
  ...rest
}: InboxItemProps) {
  const clamped = progress == null ? undefined : Math.min(100, Math.max(0, progress));
  const content = (
    <>
      <span className="he-inbox-item__identity">
        {leading != null && <span className="he-inbox-item__leading">{leading}</span>}
        <span className="he-inbox-item__subject-wrap">
          <span className="he-inbox-item__subject">{subject}</span>
          {subjectMeta != null && <span className="he-inbox-item__subject-meta">{subjectMeta}</span>}
        </span>
      </span>
      <span className="he-inbox-item__focus">
        <span className="he-inbox-item__title-row">
          <span className="he-inbox-item__sr-only">{statusLabel}: </span>
          <span className={cx('he-inbox-item__dot', `he-inbox-item__dot--${tone}`)} aria-hidden />
          <span className="he-inbox-item__title">{title}</span>
          {status != null && (
            <span className="he-inbox-item__status" aria-hidden>
              {status}
            </span>
          )}
        </span>
        {description != null && <span className="he-inbox-item__description">{description}</span>}
      </span>
      {(context != null || clamped != null) && (
        <span className="he-inbox-item__context">
          {context != null && <span className="he-inbox-item__context-copy">{context}</span>}
          {clamped != null && (
            <span
              className="he-inbox-item__progress"
              role="progressbar"
              aria-label={
                progressLabel ?? (typeof context === 'string' ? context : 'Progress')
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clamped}
            >
              <span
                className={cx(
                  'he-inbox-item__progress-fill',
                  `he-inbox-item__progress-fill--${progressTone ?? tone}`,
                )}
                style={{ width: `${clamped}%` }}
              />
            </span>
          )}
        </span>
      )}
    </>
  );

  return (
    <li className={cx('he-inbox-item', `he-inbox-item--${tone}`, className)} {...rest}>
      {onSelect ? (
        <button type="button" className="he-inbox-item__body" onClick={onSelect}>
          {content}
        </button>
      ) : (
        <div className="he-inbox-item__body">{content}</div>
      )}
      {action != null && <div className="he-inbox-item__action">{action}</div>}
    </li>
  );
}
