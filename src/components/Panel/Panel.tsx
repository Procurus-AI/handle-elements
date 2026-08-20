import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Card, type CardProps } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Panel heading, rendered in Sentient display type (section scale). */
  title: ReactNode;
  /** Mono uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** Supporting paragraph under the title. */
  lede?: ReactNode;
  /** Right-aligned slot in the panel head for controls/links. */
  aside?: ReactNode;
  /** Card padding. Defaults to `lg`. */
  padding?: CardProps['padding'];
  /** Heading level for the title. Defaults to `h2`. */
  as?: 'h2' | 'h3';
}

/**
 * A titled surface: a bordered Card with a section-scale PageHeader (eyebrow +
 * serif title + optional lede) and an optional aside for controls. The common
 * "chart/section in a card" pattern, packaged so views don't hand-assemble it.
 */
export function Panel({
  title,
  eyebrow,
  lede,
  aside,
  padding = 'lg',
  as,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Card padding={padding} className={cx('he-panel', className)} {...rest}>
      <div className="he-panel__head">
        <PageHeader size="section" eyebrow={eyebrow} title={title} lede={lede} as={as} />
        {aside != null && <div className="he-panel__aside">{aside}</div>}
      </div>
      {children}
    </Card>
  );
}
