import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type ReviewWorkspaceVariant = 'default' | 'contained';

export interface ReviewWorkspaceProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Layout geometry. `contained` keeps the three-pane review useful inside a
   * narrower application stage, while the default preserves the wider rails.
   */
  variant?: ReviewWorkspaceVariant;
  /** Master-list or navigation content. */
  navigation: ReactNode;
  /** Document, record, or evidence content. */
  children: ReactNode;
  /** Contextual conclusions, controls, or review content. */
  inspector: ReactNode;
  /** Accessible name for the navigation landmark. */
  navigationLabel?: string;
  /** Accessible name for the central document region. */
  documentLabel?: string;
  /** Accessible name for the inspector landmark. */
  inspectorLabel?: string;
}

/**
 * Full-height review shell with one quiet divider between each pane. The three
 * slots deliberately own no inner padding, so lists can stay flush while each
 * product chooses the right reading measure for its document content.
 */
export function ReviewWorkspace({
  variant = 'default',
  navigation,
  children,
  inspector,
  navigationLabel,
  documentLabel,
  inspectorLabel,
  className,
  ...rest
}: ReviewWorkspaceProps) {
  return (
    <div
      className={cx(
        'he-review-workspace',
        variant === 'contained' && 'he-review-workspace--contained',
        className,
      )}
      {...rest}
    >
      <div className="he-review-workspace__layout">
        <nav
          className="he-review-workspace__pane he-review-workspace__navigation"
          aria-label={navigationLabel}
        >
          {navigation}
        </nav>
        <section
          className="he-review-workspace__pane he-review-workspace__document"
          aria-label={documentLabel}
        >
          {children}
        </section>
        <aside
          className="he-review-workspace__pane he-review-workspace__inspector"
          aria-label={inspectorLabel}
        >
          {inspector}
        </aside>
      </div>
    </div>
  );
}

export interface ReviewConclusionFact {
  /** Stable identity for the row. */
  id: string | number;
  label: ReactNode;
  value: ReactNode;
}

export interface ReviewConclusionProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Root landmark. Default `section`. */
  as?: 'section' | 'article' | 'div';
  /** Quiet category or issue count above the conclusion. */
  eyebrow?: ReactNode;
  /** The agent's concise conclusion. */
  title: ReactNode;
  /** Confidence, provenance, or last-updated context. */
  meta?: ReactNode;
  /** One short explanation of what matters and why. */
  summary?: ReactNode;
  /** The single recommended next step. */
  primaryAction?: ReactNode;
  /** Compact semantic key/value rows. */
  facts?: readonly ReviewConclusionFact[];
  /** Accessible name for the facts list. */
  factsLabel?: string;
  /** Heading level for `title`. Default `h2`. */
  headingAs?: 'h2' | 'h3' | 'h4';
}

/**
 * Borderless conclusion for a review inspector. It keeps the agent's answer,
 * one action and a few supporting facts legible inside a 272–304px rail without
 * introducing another card surface.
 */
export function ReviewConclusion({
  as: Root = 'section',
  eyebrow,
  title,
  meta,
  summary,
  primaryAction,
  facts = [],
  factsLabel,
  headingAs: Heading = 'h2',
  className,
  ...rest
}: ReviewConclusionProps) {
  const titleId = useId();

  return (
    <Root
      className={cx('he-review-conclusion', className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <header className="he-review-conclusion__header">
        {eyebrow != null && (
          <span className="he-review-conclusion__eyebrow">{eyebrow}</span>
        )}
        <Heading id={titleId} className="he-review-conclusion__title">
          {title}
        </Heading>
        {meta != null && <p className="he-review-conclusion__meta">{meta}</p>}
      </header>
      {summary != null && <p className="he-review-conclusion__summary">{summary}</p>}
      {primaryAction != null && (
        <div className="he-review-conclusion__action">{primaryAction}</div>
      )}
      {facts.length > 0 && (
        <dl className="he-review-conclusion__facts" aria-label={factsLabel}>
          {facts.map((fact) => (
            <div className="he-review-conclusion__fact" key={fact.id}>
              <dt className="he-review-conclusion__fact-label">{fact.label}</dt>
              <dd className="he-review-conclusion__fact-value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Root>
  );
}
