import {
  createElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export type ListVariant = 'divided' | 'plain';

export type ListSize = 'md' | 'sm';

export type ListItemStatus = 'ok' | 'warn' | 'error' | 'accent' | 'neutral';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** `divided` (default) draws hairlines between rows; `plain` has none. */
  variant?: ListVariant;
  /** Tighter row padding. */
  dense?: boolean;
  /** Row density. 'md' (default) is today's rhythm; 'sm' is the 36px compact row. */
  size?: ListSize;
  /** Reserve the leading gutter so rows WITHOUT a dot/rank still align with rows that have one. */
  gutter?: boolean;
}

/**
 * Minimal list primitive — a `<ul>` of `ListItem`s. Covers ranked label→value
 * lists (reasons, opportunities, leaderboards) as well as plain rows.
 */
export function List({
  variant = 'divided',
  dense = false,
  size = 'md',
  gutter = false,
  className,
  children,
  ...rest
}: ListProps) {
  return (
    <ul
      className={cx(
        'he-list',
        `he-list--${variant}`,
        dense && 'he-list--dense',
        size === 'sm' && 'he-list--sm',
        gutter && 'he-list--gutter',
        className,
      )}
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
  /** Status dot in the leading slot. Ignored when `leading` or `rank` is set. */
  status?: ListItemStatus;
  /** Primary label. Falls back to `children`. */
  primary?: ReactNode;
  /** Inline metadata rendered on the SAME line as `primary` (mono, dim). */
  meta?: ReactNode;
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
  status,
  primary,
  meta,
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
    (rank != null ? (
      <span className="he-list__rank">{rank}</span>
    ) : status != null ? (
      <span className={cx('he-list__dot', `he-list__dot--${status}`)} aria-hidden />
    ) : null);

  const inner = (
    <>
      {lead != null && <span className="he-list__leading">{lead}</span>}
      <span className="he-list__content">
        {meta != null ? (
          <span className="he-list__line">
            <span className="he-list__primary">{primary ?? children}</span>
            <span className="he-list__meta">{meta}</span>
          </span>
        ) : (
          <span className="he-list__primary">{primary ?? children}</span>
        )}
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
