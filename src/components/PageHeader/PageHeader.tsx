import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type PageHeaderSize = 'hero' | 'page' | 'compact' | 'section';
export type PageHeaderAlign = 'start' | 'center';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Rendered as a heading. `page`, `compact` and `hero` use Sentient display type. */
  title: ReactNode;
  /** Caption-scale kicker above the title. */
  eyebrow?: ReactNode;
  /** Secondary context line directly under the title: a date, a count, a status. */
  subtitle?: ReactNode;
  /** Supporting paragraph under the title. */
  lede?: ReactNode;
  /**
   * Right side of the title row: the view's actions. One primary button per view; the
   * other actions are secondary. Centered under the title when `align="center"`.
   */
  aside?: ReactNode;
  /** Row under the title row: pass a `Tabs` (soft fill). */
  tabs?: ReactNode;
  /**
   * `page` (default) is the Figma page header: display title, actions on the right, tabs
   * below, flush with 32px below (0.4.5 spacing; add `inset` for the Figma padding).
   * `compact` is the same at record/workspace density, without margin. `section` titles a panel, card, or chart with an `h2`. `hero` is the centered
   * greeting.
   */
  size?: PageHeaderSize;
  /** Defaults to `center` for `hero`, `start` otherwise. */
  align?: PageHeaderAlign;
  /**
   * Figma padding 24/24/0/24 and no bottom margin, for a header at the top of a shell
   * panel. Off by default so apps that pad their own pages do not get double padding.
   * Only applies to `size="page"`.
   */
  inset?: boolean;
  /** Bottom rule. Off by default for every size (the Figma header has none). */
  divider?: boolean;
  /** Caps the text column: a number (px) or any CSS length. */
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
  tabs,
  size = 'page',
  align,
  divider,
  inset = false,
  measure,
  as,
  className,
  style,
  ...rest
}: PageHeaderProps) {
  const resolvedAlign = align ?? (size === 'hero' ? 'center' : 'start');
  const Heading = as ?? (size === 'section' ? 'h2' : 'h1');
  return (
    <header
      className={cx(
        'he-pagehead',
        `he-pagehead--${size}`,
        resolvedAlign === 'center' && 'he-pagehead--center',
        // 0.4.5 default kept: a page header has a divider unless it is inset in Kevin's shell.
        (divider ?? (size === 'page' && !inset)) && 'he-pagehead--divider',
        inset && size === 'page' && 'he-pagehead--inset',
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
      <div className="he-pagehead__row">
        <div className="he-pagehead__main">
          {eyebrow != null && <span className="he-pagehead__eyebrow">{eyebrow}</span>}
          <Heading className="he-pagehead__title">{title}</Heading>
          {subtitle != null && <p className="he-pagehead__subtitle">{subtitle}</p>}
          {lede != null && <p className="he-pagehead__lede">{lede}</p>}
        </div>
        {aside != null && <div className="he-pagehead__aside">{aside}</div>}
      </div>
      {tabs != null && <div className="he-pagehead__tabs">{tabs}</div>}
    </header>
  );
}
