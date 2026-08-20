import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Rendered as an h1 in Sentient display type. */
  title: ReactNode;
  /** Mono uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** Supporting paragraph under the title. */
  lede?: ReactNode;
  /** Right-aligned slot for actions/controls. */
  aside?: ReactNode;
}

export function PageHeader({ title, eyebrow, lede, aside, className, ...rest }: PageHeaderProps) {
  return (
    <header className={cx('he-pagehead', className)} {...rest}>
      <div className="he-pagehead__main">
        {eyebrow != null && <span className="he-pagehead__eyebrow">{eyebrow}</span>}
        <h1 className="he-pagehead__title">{title}</h1>
        {lede != null && <p className="he-pagehead__lede">{lede}</p>}
      </div>
      {aside != null && <div className="he-pagehead__aside">{aside}</div>}
    </header>
  );
}
