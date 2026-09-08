import {
  useId,
  type DetailsHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';
import { Avatar } from '../Avatar/Avatar';

export type AgentResponseDensity = 'comfortable' | 'compact';

export interface AgentResponseProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Root landmark. Default `article`. */
  as?: 'article' | 'section' | 'div';
  /** Agent name or richer identity label. */
  agent: ReactNode;
  /** Agent avatar/spark. A string `agent` gets an accent Avatar by default; pass `null` to omit it. */
  avatar?: ReactNode;
  /** Quiet context beside the agent name — usually what ran and when. */
  meta?: ReactNode;
  /** The answer, recommendation, or decision headline. */
  title: ReactNode;
  /** Primary supporting paragraph. */
  summary?: ReactNode;
  /** Lower-priority caveat or provenance note. */
  note?: ReactNode;
  /** Heading level for `title`. Default `h2`. */
  headingAs?: 'h1' | 'h2' | 'h3';
  /** Narrative rhythm. `compact` is intended for persistent workspace answers. */
  density?: AgentResponseDensity;
  /** Actions or provenance after the response body. */
  footer?: ReactNode;
}

/**
 * The agent's narrative answer. It intentionally owns no border, background, or
 * page padding: the response is the primary content, not another card inside it.
 */
export function AgentResponse({
  as: Root = 'article',
  agent,
  avatar,
  meta,
  title,
  summary,
  note,
  headingAs: Heading = 'h2',
  density = 'comfortable',
  footer,
  className,
  children,
  ...rest
}: AgentResponseProps) {
  const titleId = useId();
  const fallbackAvatar =
    avatar === undefined && typeof agent === 'string' ? (
      <Avatar name={agent} size="sm" tone={4} />
    ) : (
      avatar
    );

  return (
    <Root
      className={cx(
        'he-agent-response',
        density === 'compact' && 'he-agent-response--compact',
        className,
      )}
      aria-labelledby={titleId}
      {...rest}
    >
      <header className="he-agent-response__header">
        {fallbackAvatar != null && (
          <span className="he-agent-response__avatar">{fallbackAvatar}</span>
        )}
        <div className="he-agent-response__byline">
          <span className="he-agent-response__agent">{agent}</span>
          {meta != null && (
            <>
              <span className="he-agent-response__separator" aria-hidden>
                ·
              </span>
              <span className="he-agent-response__meta">{meta}</span>
            </>
          )}
        </div>
      </header>

      <Heading id={titleId} className="he-agent-response__title">
        {title}
      </Heading>
      {summary != null && <p className="he-agent-response__summary">{summary}</p>}
      {note != null && <p className="he-agent-response__note">{note}</p>}
      {children != null && <div className="he-agent-response__body">{children}</div>}
      {footer != null && <footer className="he-agent-response__footer">{footer}</footer>}
    </Root>
  );
}

export type FindingTone = 'ok' | 'warn' | 'error' | 'neutral';
export type FindingListDensity = 'comfortable' | 'compact';

export interface FindingListProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional visible heading for the group, e.g. “Qué encontré”. */
  label?: ReactNode;
  /** Accessible name for the underlying list. Falls back to a string `label`. */
  ariaLabel?: string;
  /** Heading level for `label`. Default `h3`. */
  headingAs?: 'h2' | 'h3' | 'h4';
  /** Surface rhythm. `compact` keeps short decision briefs easy to scan. */
  density?: FindingListDensity;
}

/** One quiet surface for the small set of findings that explains an answer. */
export function FindingList({
  label,
  ariaLabel,
  headingAs: Heading = 'h3',
  density = 'comfortable',
  className,
  children,
  ...rest
}: FindingListProps) {
  const labelId = useId();
  const listName = ariaLabel ?? (typeof label === 'string' ? label : undefined);

  return (
    <div
      className={cx(
        'he-finding-list',
        density === 'compact' && 'he-finding-list--compact',
        className,
      )}
      {...rest}
    >
      {label != null && (
        <Heading id={labelId} className="he-finding-list__label">
          {label}
        </Heading>
      )}
      <ul
        className="he-finding-list__items"
        aria-label={ariaLabel ?? (label == null ? listName : undefined)}
        aria-labelledby={ariaLabel == null && label != null ? labelId : undefined}
      >
        {children}
      </ul>
    </div>
  );
}

export interface FindingItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /** Universal state: resolved, agent review, human decision, or information. */
  tone: FindingTone;
  title: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
  /** Localized status announced to assistive technology; the dot alone never carries meaning. */
  statusLabel: string;
}

export function FindingItem({
  tone,
  title,
  detail,
  trailing,
  statusLabel,
  className,
  ...rest
}: FindingItemProps) {
  return (
    <li className={cx('he-finding', `he-finding--${tone}`, className)} {...rest}>
      <span className="he-finding__dot" aria-hidden />
      <span className="he-finding__content">
        <span className="he-sr-only">{statusLabel}: </span>
        <span className="he-finding__title">{title}</span>
        {detail != null && <span className="he-finding__detail">{detail}</span>}
      </span>
      {trailing != null && <span className="he-finding__trailing">{trailing}</span>}
    </li>
  );
}

export interface ActivityTrailStep {
  id: string;
  label: ReactNode;
}

export type ActivityTrailVariant = 'trail' | 'status';

export interface ActivityTrailProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible lead-in for the ordered steps. */
  label: ReactNode;
  steps: readonly ActivityTrailStep[];
  /** Accessible name for the ordered list. Falls back to a string `label`. */
  ariaLabel?: string;
  /**
   * `status` uses a natural-language label and quiet dot separators for compact
   * agent surfaces. Default `trail` preserves the directional narration.
   */
  variant?: ActivityTrailVariant;
  /** Optional decorative mark before the label, primarily for `status`. */
  icon?: ReactNode;
}

/** A compact, wrapping narration of the work an agent completed. */
export function ActivityTrail({
  label,
  steps,
  ariaLabel,
  variant = 'trail',
  icon,
  className,
  ...rest
}: ActivityTrailProps) {
  const labelId = useId();

  return (
    <div
      className={cx(
        'he-activity-trail',
        variant === 'status' && 'he-activity-trail--status',
        className,
      )}
      role={variant === 'status' ? 'status' : undefined}
      aria-live={variant === 'status' ? 'polite' : undefined}
      {...rest}
    >
      {icon != null && (
        <span className="he-activity-trail__icon" aria-hidden>
          {icon}
        </span>
      )}
      <span id={labelId} className="he-activity-trail__label">{label}</span>
      {variant === 'status' && steps.length > 0 && (
        <span className="he-activity-trail__separator" aria-hidden>
          ·
        </span>
      )}
      <ol
        className="he-activity-trail__steps"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel == null ? labelId : undefined}
      >
        {steps.map((step, index) => (
          <li className="he-activity-trail__step" key={step.id}>
            <span className="he-activity-trail__step-label">{step.label}</span>
            {index < steps.length - 1 && (
              <span className="he-activity-trail__arrow" aria-hidden>
                {variant === 'status' ? '·' : '→'}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export interface AgentEvidenceDisclosureProps
  extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'children'> {
  /** Visible disclosure label. Default `Cómo lo verificó Handle`. */
  label?: ReactNode;
  /** Optional context above the facts, such as the scope of the verification. */
  description?: ReactNode;
  /** `AgentEvidenceItem`s or custom `<li>` elements. */
  children: ReactNode;
}

/**
 * A native disclosure for the verifiable facts and sources behind an agent
 * answer. It is evidence provenance, not a transcript of internal reasoning.
 */
export function AgentEvidenceDisclosure({
  label = 'Cómo lo verificó Handle',
  description,
  className,
  children,
  ...rest
}: AgentEvidenceDisclosureProps) {
  const summaryId = useId();

  return (
    <details className={cx('he-agent-evidence', className)} {...rest}>
      <summary id={summaryId} className="he-agent-evidence__summary">
        <EvidenceChevron />
        <span>{label}</span>
      </summary>
      <div className="he-agent-evidence__body">
        {description != null && (
          <p className="he-agent-evidence__description">{description}</p>
        )}
        <ol className="he-agent-evidence__list" aria-labelledby={summaryId}>
          {children}
        </ol>
      </div>
    </details>
  );
}

export interface AgentEvidenceItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Actionable source control — normally a link or button that focuses evidence. */
  citation?: ReactNode;
}

/** One concise verification fact with an optional source action. */
export function AgentEvidenceItem({
  citation,
  className,
  children,
  ...rest
}: AgentEvidenceItemProps) {
  return (
    <li className={cx('he-agent-evidence__item', className)} {...rest}>
      <div className="he-agent-evidence__item-row">
        <div className="he-agent-evidence__fact">{children}</div>
        {citation != null && (
          <span className="he-agent-evidence__citation">{citation}</span>
        )}
      </div>
    </li>
  );
}

function EvidenceChevron() {
  return (
    <svg
      className="he-agent-evidence__chevron"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
