import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Sparkline, type SparklineTone } from '../Sparkline/Sparkline';

export interface TrendGridItem {
  /** Entity name shown above the sparkline. */
  label: ReactNode;
  /** Series values, oldest → newest. */
  data: number[];
  /** Current value; defaults to the last data point (mono). */
  value?: ReactNode;
  /** Explicit % change. If omitted, auto-computed from first → last of `data`. */
  delta?: number;
  /** Override the delta text (e.g. "+3 pts"). Arrow + sign class still apply. */
  deltaLabel?: ReactNode;
  /** Force a sparkline tone; otherwise derived from delta sign when auto. */
  tone?: SparklineTone;
  /** Stable key for the cell. */
  id?: string;
}

export interface TrendGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  items: TrendGridItem[];
  /** Force a fixed column count. Defaults to responsive auto-fill. */
  columns?: number;
  /** Min cell width (px) for the auto-fill minmax. */
  minCellWidth?: number;
  /** Sparkline style passed to each cell. */
  variant?: 'line' | 'area';
  smooth?: boolean;
  sparkHeight?: number;
  /** Render the value + delta footer. */
  showDelta?: boolean;
  /**
   * 'auto' colors the delta by sign and, for items without an explicit tone,
   * tints the sparkline by sign (up → ok, down → error). 'none' stays neutral.
   */
  deltaTone?: 'auto' | 'none';
  /** When set, cells become keyboard-accessible buttons that lift on hover. */
  onSelect?: (item: TrendGridItem, index: number) => void;
}

/** % change from first to last finite value; null when it can't be computed. */
function autoDelta(data: number[]): number | null {
  const values = data.filter((v) => Number.isFinite(v));
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

/** Last finite value, or null. */
function lastValue(data: number[]): number | null {
  for (let i = data.length - 1; i >= 0; i--) {
    if (Number.isFinite(data[i])) return data[i];
  }
  return null;
}

function Arrow({ dir }: { dir: 'up' | 'down' | 'flat' }) {
  if (dir === 'flat') {
    return (
      <svg className="he-trendgrid__arrow" viewBox="0 0 8 8" width="8" height="8" aria-hidden="true">
        <path d="M1 4 H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  const d = dir === 'up' ? 'M4 1 L7 6 H1 Z' : 'M4 7 L1 2 H7 Z';
  return (
    <svg className="he-trendgrid__arrow" viewBox="0 0 8 8" width="8" height="8" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function TrendGrid({
  items,
  columns,
  minCellWidth = 140,
  variant = 'area',
  smooth = true,
  sparkHeight = 32,
  showDelta = true,
  deltaTone = 'auto',
  onSelect,
  className,
  style,
  ...rest
}: TrendGridProps) {
  const interactive = typeof onSelect === 'function';

  const gridStyle: CSSProperties = {
    ...(columns != null
      ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
      : { ['--he-trendgrid-min' as string]: `${minCellWidth}px` }),
    ...style,
  };

  return (
    <div
      className={cx('he-trendgrid', columns == null && 'he-trendgrid--auto', className)}
      style={gridStyle}
      {...rest}
    >
      {items.map((item, i) => {
        const delta = item.delta ?? autoDelta(item.data);
        const dir: 'up' | 'down' | 'flat' =
          delta == null || Math.round(delta) === 0 ? 'flat' : delta > 0 ? 'up' : 'down';

        const tone: SparklineTone =
          item.tone ??
          (deltaTone === 'auto'
            ? dir === 'up'
              ? 'ok'
              : dir === 'down'
                ? 'error'
                : 'neutral'
            : 'default');

        const value = item.value ?? (lastValue(item.data)?.toLocaleString() ?? '—');

        const deltaText =
          item.deltaLabel ?? (delta == null ? null : `${Math.abs(Math.round(delta))}%`);

        const spark = (
          <Sparkline
            className="he-trendgrid__sparkline"
            data={item.data}
            variant={variant}
            smooth={smooth}
            tone={tone}
            width={200}
            height={sparkHeight}
          />
        );

        const foot = showDelta && (
          <div className="he-trendgrid__foot">
            <span className="he-trendgrid__value">{value}</span>
            {deltaText != null && (
              <span
                className={cx(
                  'he-trendgrid__delta',
                  deltaTone === 'auto' && dir === 'up' && 'he-trendgrid__delta--up',
                  deltaTone === 'auto' && dir === 'down' && 'he-trendgrid__delta--down',
                )}
              >
                <Arrow dir={dir} />
                {deltaText}
              </span>
            )}
          </div>
        );

        const body = (
          <>
            <div className="he-trendgrid__head">
              <span className="he-trendgrid__label">{item.label}</span>
            </div>
            <div className="he-trendgrid__spark">{spark}</div>
            {foot}
          </>
        );

        const key = item.id ?? i;

        if (interactive) {
          return (
            <button
              key={key}
              type="button"
              className="he-trendgrid__cell he-trendgrid__cell--button"
              onClick={() => onSelect?.(item, i)}
            >
              {body}
            </button>
          );
        }

        return (
          <div key={key} className="he-trendgrid__cell">
            {body}
          </div>
        );
      })}
    </div>
  );
}
