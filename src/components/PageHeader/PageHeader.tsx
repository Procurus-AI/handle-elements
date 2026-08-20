import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type PageHeaderSize = 'page' | 'section';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Rendered as a heading in Sentient display type. */
  title: ReactNode;
  /** Mono uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** Supporting paragraph under the title. */
  lede?: ReactNode;
  /** Right-aligned slot for actions/controls. */
  aside?: ReactNode;
  /**
   * `page` (default) is the full page-scale header. `section` is the lighter
   * variant for titling a panel, card, or chart within a page: smaller title,
   * no divider, tighter spacing, and an `h2` heading level.
   */
  size?: PageHeaderSize;
  /** Heading level override (defaults: page → h1, section → h2). */
  as?: 'h1' | 'h2' | 'h3';
}

export function PageHeader({
  title,
  eyebrow,
  lede,
  aside,
  size = 'page',
  as,
  className,
  ...rest
}: PageHeaderProps) {
  const Heading = as ?? (size === 'section' ? 'h2' : 'h1');
  return (
    <header className={cx('he-pagehead', `he-pagehead--${size}`, className)} {...rest}>
      <div className="he-pagehead__main">
        {eyebrow != null && <span className="he-pagehead__eyebrow">{eyebrow}</span>}
        <Heading className="he-pagehead__title">{title}</Heading>
        {lede != null && <p className="he-pagehead__lede">{lede}</p>}
      </div>
      {aside != null && <div className="he-pagehead__aside">{aside}</div>}
    </header>
  );
}
