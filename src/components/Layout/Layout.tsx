import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

/** Spacing step. Keeps the 0.x numbering (1..7) and maps it onto the 4px scale
 * `--he-spacing-*`: 1=4, 2=8, 3=12, 4=16, 5=24, 6=32, 7=48 px. `0` collapses the gap. */
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const SPACING_STEP = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 8, 7: 12 } as const;

const spaceVar = (n?: Space): string | undefined =>
  n == null ? undefined : n === 0 ? '0' : `var(--he-spacing-${SPACING_STEP[n]})`;

const ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

const JUSTIFY = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
} as const;

/* ------------------------------------------------------------------ Stack */

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Main axis. Default `column`. */
  direction?: 'row' | 'column';
  /** Gap between children on the spacing scale. Default `4`. */
  gap?: Space;
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
}

/** Flexbox stack — the workhorse for vertical rhythm and inline rows. */
export function Stack({
  direction = 'column',
  gap = 4,
  align,
  justify,
  wrap = false,
  className,
  style,
  ...rest
}: StackProps) {
  return (
    <div
      className={cx('he-stack', direction === 'row' && 'he-stack--row', wrap && 'he-stack--wrap', className)}
      style={
        {
          '--he-stack-gap': spaceVar(gap),
          alignItems: align ? ALIGN[align] : undefined,
          justifyContent: justify ? JUSTIFY[justify] : undefined,
          ...style,
        } as CSSProperties
      }
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ Grid */

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of equal columns, or a raw `grid-template-columns` string. */
  columns?: number | string;
  /** Auto-fit tracks of at least this width (used when `columns` is omitted). */
  minColumnWidth?: string;
  /** Gap on the spacing scale. Default `4`. */
  gap?: Space;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/** CSS grid with token gaps — for KPI rows, two-up panels, split layouts. */
export function Grid({
  columns,
  minColumnWidth,
  gap = 4,
  align,
  className,
  style,
  ...rest
}: GridProps) {
  const gridTemplateColumns =
    typeof columns === 'number'
      ? `repeat(${columns}, minmax(0, 1fr))`
      : (columns ?? (minColumnWidth ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` : undefined));
  return (
    <div
      className={cx('he-grid', className)}
      style={
        {
          '--he-grid-gap': spaceVar(gap),
          gridTemplateColumns,
          alignItems: align ? ALIGN[align] : undefined,
          ...style,
        } as CSSProperties
      }
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ Divider */

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

/** A hairline rule in the `--he-border` color. Horizontal or vertical. */
export function Divider({ orientation = 'horizontal', className, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx('he-divider', `he-divider--${orientation}`, className)}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ Container */

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max content width — a number (px) or any CSS length. Default `70rem`. */
  max?: number | string;
  /** Inner padding on the spacing scale. Default `6`. */
  padding?: Space;
}

/** Centered page/section width wrapper. */
export function Container({ max, padding = 6, className, style, ...rest }: ContainerProps) {
  return (
    <div
      className={cx('he-container', className)}
      style={
        {
          '--he-container-max': max == null ? undefined : typeof max === 'number' ? `${max}px` : max,
          '--he-container-pad': spaceVar(padding),
          ...style,
        } as CSSProperties
      }
      {...rest}
    />
  );
}
