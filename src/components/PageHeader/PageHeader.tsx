import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type PageHeaderSize = 'hero' | 'page' | 'section';
export type PageHeaderAlign = 'start' | 'center';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Rendered as a heading in Sentient display type. */
  title: ReactNode;
  /** Mono uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** Dim context line directly under the title — a date, a count, a status. */
  subtitle?: ReactNode;
  /** Supporting paragraph under the title. */
  lede?: ReactNode;
  /** Right-aligned slot for actions/controls; centered under the title when `align="center"`. */
  aside?: ReactNode;
  /**
   * `page` (default) is the full page-scale header. `section` is the lighter
   * variant for titling a panel, card, or chart within a page: smaller title,
   * no divider, tighter spacing, and an `h2` heading level. `hero` is the
   * centered greeting: display-scale title, centered by default, no divider.
   */
  size?: PageHeaderSize;
  /** Defaults to `center` for `hero`, `start` otherwise. */
  align?: PageHeaderAlign;
  /** Bottom rule. Defaults to `true` for `page`, `false` for `hero`/`section`. */
  divider?: boolean;
  /** Caps the text column — a number (px) or any CSS length. */
  measure?: number | string;
  /** Heading level override (defaults: hero → h1, page → h1, section → h2). */
  as?: 'h1' | 'h2' | 'h3';
}

export function PageHeader({
  title,
  eyebrow,
  subtitle,
  lede,
  aside,
  size = 'page',
  align,
  divider,
  measure,
  as,
  className,
  style,
  ...rest
}: PageHeaderProps) {
  const resolvedAlign = align ?? (size === 'hero' ? 'center' : 'start');
  const resolvedDivider = divider ?? size === 'page';
  const Heading = as ?? (size === 'section' ? 'h2' : 'h1');
  return (
    <header
      className={cx(
        'he-pagehead',
        `he-pagehead--${size}`,
        resolvedAlign === 'center' && 'he-pagehead--center',
        resolvedDivider ? 'he-pagehead--divider' : 'he-pagehead--nodivider',
        className,
      )}
      style={
        {
          '--he-pagehead-measure':
            measure == null ? undefined : typeof measure === 'number' ? `${measure}px` : measure,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <div className="he-pagehead__main">
        {eyebrow != null && <span className="he-pagehead__eyebrow">{eyebrow}</span>}
        <Heading className="he-pagehead__title">{title}</Heading>
        {subtitle != null && <p className="he-pagehead__subtitle">{subtitle}</p>}
        {lede != null && <p className="he-pagehead__lede">{lede}</p>}
      </div>
      {aside != null && <div className="he-pagehead__aside">{aside}</div>}
    </header>
  );
}
