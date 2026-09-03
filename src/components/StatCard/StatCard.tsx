import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatCardDeltaDirection = 'up' | 'down' | 'flat';

export type StatCardSize = 'sm' | 'md' | 'lg';

export type StatCardVariant = 'card' | 'plain';

export type StatCardTone = 'ok' | 'warn' | 'error' | 'accent' | 'neutral';

export type StatCardGroupVariant = 'grid' | 'rail';

/** `children` is omitted on purpose — use `visual` (or `footer`) for extra content. */
export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Caption above the value — rendered in mono uppercase. */
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: { value: ReactNode; direction: StatCardDeltaDirection };
  /**
   * 6px status dot before the label — the direct replacement for wrapping a KPI
   * tile in a spined Card. Inside a rail, set `tone` on every tile or none: a
   * mixed row shifts untoned labels left by 14px.
   */
  tone?: StatCardTone;
  /** Slot between the value row and the footer — a Sparkline or a `<Meter size="sm">`. */
  visual?: ReactNode;
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
  tone,
  visual,
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
      {...(tone ? { 'data-tone': tone } : {})}
      {...rest}
    >
      <span className="he-stat__label">
        {tone && <span className={cx('he-stat__dot', `he-stat__dot--${tone}`)} aria-hidden />}
        {label}
      </span>
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
      {visual != null && <div className="he-stat__visual">{visual}</div>}
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
   * `grid` (default) is today's row of bordered tiles. `rail` collapses them into
   * ONE bordered surface with interior hairlines — 9 edges instead of 24 for a
   * six-number KPI strip, and the recovered gutters become content width.
   */
  variant?: StatCardGroupVariant;
  /**
   * Lines to reserve for each card's label so every value lands on the same
   * baseline even when labels wrap to a different number of lines. `0` disables
   * the reservation. Defaults to `2` in a grid and `1` in a rail (rail tiles are
   * a single-line-label idiom, where the second line burns ~14px per tile).
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
  variant = 'grid',
  labelLines,
  className,
  style,
  ...rest
}: StatCardGroupProps) {
  const resolvedLabelLines = labelLines ?? (variant === 'rail' ? 1 : 2);
  const gridTemplateColumns = columns
    ? `repeat(${columns}, minmax(0, 1fr))`
    : `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
  const groupStyle = {
    gridTemplateColumns,
    ...(resolvedLabelLines > 0
      ? { '--he-stat-label-min-height': `${(resolvedLabelLines * 1.35).toFixed(2)}em` }
      : {}),
    ...style,
  } as CSSProperties;
  return (
    <div
      className={cx('he-statcard-group', variant === 'rail' && 'he-statcard-group--rail', className)}
      style={groupStyle}
      {...rest}
    />
  );
}
