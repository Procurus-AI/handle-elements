import { useRef, useState, type HTMLAttributes, type ReactNode, type SyntheticEvent } from 'react';
import { cx } from '../../lib/cx';

export type ReviewFieldTone = 'ok' | 'warn' | 'error' | 'neutral';

export interface ReviewFieldListProps extends HTMLAttributes<HTMLDListElement> {}

/** Semantic list for extracted fields and their review state. */
export function ReviewFieldList({ className, ...rest }: ReviewFieldListProps) {
  return <dl className={cx('he-review-fields', className)} {...rest} />;
}

export interface ReviewFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  value: ReactNode;
  /** Universal review state. */
  tone: ReviewFieldTone;
  /** Human-readable state next to the value; the tone alone is only visual. */
  statusLabel: ReactNode;
  /** One concise interpretation of the extracted value. */
  summary?: ReactNode;
  /** Source, confidence, timestamp, or other low-priority provenance. */
  meta?: ReactNode;
  /** Content revealed through a native, keyboard-accessible `details` element. */
  evidence?: ReactNode;
  /** Label for the evidence disclosure. Default `Evidence`. */
  evidenceLabel?: ReactNode;
  /**
   * Initial native disclosure state. When omitted, warning and error evidence
   * starts open while correct and neutral evidence stays compact.
   */
  defaultEvidenceOpen?: boolean;
  /** Controlled disclosure state. Leave undefined to use native `details` state. */
  evidenceOpen?: boolean;
  onEvidenceOpenChange?: (open: boolean) => void;
  /** On open, reveal the full comparison inside the nearest scroll container. */
  scrollEvidenceOnOpen?: boolean;
  /** Inline controls such as “Review” or an overflow menu. */
  actions?: ReactNode;
}

/**
 * One extracted datum. Correct values remain a compact label/value line;
 * exceptions put their explanation and evidence directly beneath that line.
 */
export function ReviewField({
  label,
  value,
  tone,
  statusLabel,
  summary,
  meta,
  evidence,
  evidenceLabel = 'Evidence',
  defaultEvidenceOpen,
  evidenceOpen,
  onEvidenceOpenChange,
  scrollEvidenceOnOpen = false,
  actions,
  className,
  ...rest
}: ReviewFieldProps) {
  const evidenceRef = useRef<HTMLDetailsElement>(null);
  const [internalEvidenceOpen, setInternalEvidenceOpen] = useState(
    () => defaultEvidenceOpen ?? (tone === 'warn' || tone === 'error'),
  );
  const isEvidenceControlled = evidenceOpen != null;
  const disclosureOpen = isEvidenceControlled ? evidenceOpen : internalEvidenceOpen;

  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const nextOpen = event.currentTarget.open;
    if (!isEvidenceControlled) setInternalEvidenceOpen(nextOpen);
    onEvidenceOpenChange?.(nextOpen);
    if (nextOpen && scrollEvidenceOnOpen) {
      requestAnimationFrame(() => evidenceRef.current?.scrollIntoView({ block: 'nearest' }));
    }
  };

  return (
    <div className={cx('he-review-field', `he-review-field--${tone}`, className)} {...rest}>
      <dt className="he-review-field__term">
        <span className="he-review-field__dot" aria-hidden />
        <span>{label}</span>
      </dt>
      <dd className="he-review-field__definition">
        <div className="he-review-field__line">
          <span className="he-review-field__value">{value}</span>
          {statusLabel != null && <span className="he-review-field__status">{statusLabel}</span>}
          {actions != null && <span className="he-review-field__actions">{actions}</span>}
        </div>
        {summary != null && <p className="he-review-field__summary">{summary}</p>}
        {meta != null && <span className="he-review-field__meta">{meta}</span>}
        {evidence != null && (
          <details
            ref={evidenceRef}
            className="he-review-field__evidence"
            open={disclosureOpen}
            onToggle={handleToggle}
          >
            <summary className="he-review-field__evidence-toggle">
              <Chevron />
              <span>{evidenceLabel}</span>
            </summary>
            <div className="he-review-field__evidence-body">{evidence}</div>
          </details>
        )}
      </dd>
    </div>
  );
}

function Chevron() {
  return (
    <svg className="he-review-field__chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
