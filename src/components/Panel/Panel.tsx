import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Card, type CardProps } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';

/**
 * `content` (default) is a bordered bg-surface panel inside a page (corner lg).
 * `inset` is the main panel of the App shell: bg-panel, 1px bg-subtle border, corner xl,
 * panel elevation.
 */
export type PanelVariant = 'content' | 'inset';

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Panel heading, rendered as a section-scale heading. Without a title (or eyebrow, lede, aside) there is no head. */
  title?: ReactNode;
  /** Caption-scale kicker above the title. */
  eyebrow?: ReactNode;
  /** Supporting paragraph under the title. */
  lede?: ReactNode;
  /** Right-aligned slot in the panel head for controls/links. */
  aside?: ReactNode;
  variant?: PanelVariant;
  /** Panel padding. Defaults to `lg`. */
  padding?: CardProps['padding'];
  /**
   * Bleed the body to the panel's edges so a List/DataTable inside reads as ONE
   * table instead of hairlines inset from the border. The head keeps its padding
   * and the body gains a hairline above it.
   */
  flush?: boolean;
  /** Heading level for the title. Defaults to `h2`. */
  as?: 'h2' | 'h3';
}

const PAD: Record<NonNullable<CardProps['padding']>, string> = {
  none: '0px',
  sm: 'var(--he-spacing-3)',
  md: 'var(--he-spacing-4)',
  lg: 'var(--he-spacing-6)',
};

/**
 * A surface with an optional section head. `content` panels hold tables, stats and
 * charts; the single `inset` panel is the App shell's main area.
 */
export function Panel({
  title,
  eyebrow,
  lede,
  aside,
  variant = 'content',
  padding = 'lg',
  flush = false,
  as,
  className,
  style,
  children,
  ...rest
}: PanelProps) {
  const hasHead = title != null || eyebrow != null || lede != null || aside != null;
  return (
    <Card
      padding={padding}
      className={cx('he-panel', `he-panel--${variant}`, flush && 'he-panel--flush', className)}
      style={{ '--he-panel-pad': PAD[padding], ...style } as CSSProperties}
      {...rest}
    >
      {hasHead && (
        <div className="he-panel__head">
          {(title != null || eyebrow != null || lede != null) && (
            <PageHeader size="section" eyebrow={eyebrow} title={title} lede={lede} as={as} />
          )}
          {aside != null && <div className="he-panel__aside">{aside}</div>}
        </div>
      )}
      <div className="he-panel__body">{children}</div>
    </Card>
  );
}
