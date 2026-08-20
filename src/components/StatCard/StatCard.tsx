import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatCardDeltaDirection = 'up' | 'down' | 'flat';

export type StatCardSize = 'sm' | 'md' | 'lg';

export type StatCardVariant = 'card' | 'plain';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Caption above the value — rendered in mono uppercase. */
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: { value: ReactNode; direction: StatCardDeltaDirection };
  footer?: ReactNode;
  size?: StatCardSize;
  /**
   * `card` (default) is the bordered surface. `plain` strips the border,
   * background, and padding so the stat can nest inside a panel/Card without
   * the cards-in-cards look — e.g. a cluster of mini stats or a hero metric.
   */
  variant?: StatCardVariant;
}

const DELTA_GLYPH: Record<StatCardDeltaDirection, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function StatCard({
  label,
  value,
  unit,
  delta,
  footer,
  size = 'md',
  variant = 'card',
  className,
  ...rest
}: StatCardProps) {
  return (
    <div
      className={cx(
        'he-stat',
        size !== 'md' && `he-stat--${size}`,
        variant === 'plain' && 'he-stat--plain',
        className,
      )}
      {...rest}
    >
      <span className="he-stat__label">{label}</span>
      <div className="he-stat__row">
        <span className="he-stat__value">{value}</span>
        {unit != null && <span className="he-stat__unit">{unit}</span>}
        {delta && (
          <span className={cx('he-stat__delta', `he-stat__delta--${delta.direction}`)}>
            <span aria-hidden>{DELTA_GLYPH[delta.direction]}</span>
            {delta.value}
          </span>
        )}
      </div>
      {footer != null && <div className="he-stat__footer">{footer}</div>}
    </div>
  );
}

export interface StatCardGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed column count. Omit to auto-fit tracks using `minColumnWidth`. */
  columns?: number;
  /** Track min-width when auto-fitting (i.e. when `columns` is omitted). */
  minColumnWidth?: string;
  /**
   * Lines to reserve for each card's label so every value lands on the same
   * baseline even when labels wrap to a different number of lines. `0` disables
   * the reservation. Default `2`.
   */
  labelLines?: number;
}

/**
 * Grid of StatCards that reads as one aligned unit: equal-height cards (footers
 * pinned to the bottom) with labels padded to a shared height so the big values
 * line up across the row. Wrap KPI rows or mini-stat clusters in it.
 */
export function StatCardGroup({
  columns,
  minColumnWidth = '180px',
  labelLines = 2,
  className,
  style,
  ...rest
}: StatCardGroupProps) {
  const gridTemplateColumns = columns
    ? `repeat(${columns}, minmax(0, 1fr))`
    : `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
  const groupStyle = {
    gridTemplateColumns,
    ...(labelLines > 0 ? { '--he-stat-label-min-height': `${(labelLines * 1.35).toFixed(2)}em` } : {}),
    ...style,
  } as CSSProperties;
  return <div className={cx('he-statcard-group', className)} style={groupStyle} {...rest} />;
}
