import {
  createElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export type ListVariant = 'divided' | 'plain';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** `divided` (default) draws hairlines between rows; `plain` has none. */
  variant?: ListVariant;
  /** Tighter row padding. */
  dense?: boolean;
}

/**
 * Minimal list primitive — a `<ul>` of `ListItem`s. Covers ranked label→value
 * lists (reasons, opportunities, leaderboards) as well as plain rows.
 */
export function List({ variant = 'divided', dense = false, className, children, ...rest }: ListProps) {
  return (
    <ul
      className={cx('he-list', `he-list--${variant}`, dense && 'he-list--dense', className)}
      {...rest}
    >
      {children}
    </ul>
  );
}

export interface ListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'onSelect' | 'value'> {
  /** Leading slot — a dot, icon, or avatar. Overrides `rank` when both are set. */
  leading?: ReactNode;
  /** Convenience: render a mono rank badge (e.g. 1, 2, 3) in the leading slot. */
  rank?: number;
  /** Primary label. Falls back to `children`. */
  primary?: ReactNode;
  /** Secondary line under the primary label. */
  secondary?: ReactNode;
  /** Trailing value, right-aligned and tabular (e.g. a count or amount). */
  value?: ReactNode;
  /** Extra trailing node after the value (delta, chevron, menu…). */
  trailing?: ReactNode;
  /** Selected state (only meaningful for interactive rows). */
  active?: boolean;
  /** Makes the row a button. Ignored when `href` is set. */
  onSelect?: () => void;
  /** Makes the row a link. */
  href?: string;
}

export function ListItem({
  leading,
  rank,
  primary,
  secondary,
  value,
  trailing,
  active = false,
  onSelect,
  href,
  className,
  children,
  ...rest
}: ListItemProps) {
  const interactive = href != null || typeof onSelect === 'function';
  const lead =
    leading ??
    (rank != null ? <span className="he-list__rank">{rank}</span> : null);

  const inner = (
    <>
      {lead != null && <span className="he-list__leading">{lead}</span>}
      <span className="he-list__content">
        <span className="he-list__primary">{primary ?? children}</span>
        {secondary != null && <span className="he-list__secondary">{secondary}</span>}
      </span>
      {value != null && <span className="he-list__value">{value}</span>}
      {trailing != null && <span className="he-list__trailing">{trailing}</span>}
    </>
  );

  let rowNode: ReactNode;
  if (href != null) {
    rowNode = createElement(
      'a',
      { className: 'he-list__row', href } as AnchorHTMLAttributes<HTMLAnchorElement>,
      inner,
    );
  } else if (interactive) {
    rowNode = (
      <button type="button" className="he-list__row" onClick={onSelect} aria-pressed={active}>
        {inner}
      </button>
    );
  } else {
    rowNode = <div className="he-list__row">{inner}</div>;
  }

  return (
    <li
      className={cx(
        'he-list__item',
        interactive && 'he-list__item--interactive',
        active && 'he-list__item--active',
        className,
      )}
      {...rest}
    >
      {rowNode}
    </li>
  );
}
