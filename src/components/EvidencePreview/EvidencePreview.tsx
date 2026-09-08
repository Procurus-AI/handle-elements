import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type EvidencePreviewPadding = 'none' | 'sm' | 'md' | 'lg';

type EvidencePreviewStyle = CSSProperties & {
  '--he-evidence-page-width'?: string;
};

export interface EvidencePreviewProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** Quiet source, classification, or pagination metadata under the title. */
  meta?: ReactNode;
  /** Controls that act on the viewport, e.g. zoom or page navigation. */
  toolbar?: ReactNode;
  /** File-level actions, e.g. download or open original. */
  actions?: ReactNode;
  /** Accessible name for `toolbar`. Default `Document controls`. */
  toolbarLabel?: string;
  /** Caption or provenance note below the canvas. */
  caption?: ReactNode;
  /** Accessible name for the scrollable document viewport. Falls back to a string `title`. */
  documentLabel?: string;
  /** Width cap for the centred page — a number (px) or any CSS length. Default 720px. */
  pageWidth?: number | string;
  /** Padding inside the document page. Default `none`, for full-bleed media. */
  pagePadding?: EvidencePreviewPadding;
  /** Heading level for the preview title. Default `h3`. */
  headingAs?: 'h2' | 'h3' | 'h4';
  children: ReactNode;
}

/**
 * A quiet frame around caller-provided evidence. It does not parse files or own
 * viewer state: consumers can render an image, iframe, PDF, or structured OCR
 * evidence as `children` and supply real controls through the toolbar slots.
 */
export function EvidencePreview({
  title,
  meta,
  toolbar,
  actions,
  toolbarLabel = 'Document controls',
  caption,
  documentLabel,
  pageWidth = 720,
  pagePadding = 'none',
  headingAs: Heading = 'h3',
  className,
  children,
  style,
  ...rest
}: EvidencePreviewProps) {
  const titleId = useId();
  const captionId = useId();
  const resolvedDocumentLabel =
    documentLabel ?? (typeof title === 'string' ? title : 'Document preview');
  const resolvedPageWidth = typeof pageWidth === 'number' ? `${pageWidth}px` : pageWidth;

  return (
    <figure
      className={cx('he-evidence-preview', className)}
      aria-labelledby={titleId}
      style={{ '--he-evidence-page-width': resolvedPageWidth, ...style } as EvidencePreviewStyle}
      {...rest}
    >
      <header className="he-evidence-preview__header">
        <div className="he-evidence-preview__identity">
          <Heading id={titleId} className="he-evidence-preview__title">
            {title}
          </Heading>
          {meta != null && <div className="he-evidence-preview__meta">{meta}</div>}
        </div>
        {actions != null && <div className="he-evidence-preview__actions">{actions}</div>}
      </header>

      {toolbar != null && (
        <div className="he-evidence-preview__toolbar" role="toolbar" aria-label={toolbarLabel}>
          {toolbar}
        </div>
      )}

      <div
        className="he-evidence-preview__canvas"
        role="region"
        tabIndex={0}
        aria-label={resolvedDocumentLabel}
        aria-describedby={caption != null ? captionId : undefined}
      >
        <div
          className={cx(
            'he-evidence-preview__page',
            `he-evidence-preview__page--pad-${pagePadding}`,
          )}
          role="document"
        >
          {children}
        </div>
      </div>

      {caption != null && (
        <figcaption id={captionId} className="he-evidence-preview__caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
