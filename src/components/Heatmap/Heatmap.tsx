import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { clamp, heatColor, maxValue } from '../../lib/chart';

export interface HeatmapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Grid values as rows of cells. `null`/`NaN` renders a blank cell that is
   * visually distinct from a zero-intensity cell. Rows may be ragged.
   */
  data: (number | null)[][];
  rowLabels?: ReactNode[];
  colLabels?: ReactNode[];
  /** Intensity domain lower bound (default 0). */
  min?: number;
  /** Intensity domain upper bound (default = largest finite value). */
  max?: number;
  /** Cell edge length in px. */
  cellSize?: number;
  /** Gap between cells in px. */
  gap?: number;
  /** Cell corner rounding. */
  radius?: 'sm' | 'md' | 'full';
  /** Cell `title` tooltip text. Only called for finite values. */
  formatValue?: (value: number, row: number, col: number) => string;
  /** Show a "Less ▢▢▢▢▢ More" scale using the five heat steps. */
  showLegend?: boolean;
  /** Render null cells fully transparent instead of a faint outline. */
  hideEmpty?: boolean;
  /** When set, cells become focusable buttons. */
  onCellClick?: (ctx: { row: number; col: number; value: number | null }) => void;
}

const isBlank = (v: number | null): v is null => v == null || !Number.isFinite(v as number);

/** The five heat ramp steps, empty → most intense, for the legend scale. */
const LEGEND_STEPS = [0, 0.25, 0.5, 0.75, 1];

export function Heatmap({
  data,
  rowLabels,
  colLabels,
  min = 0,
  max,
  cellSize = 16,
  gap = 3,
  radius = 'sm',
  formatValue = (value) => `${value}`,
  showLegend = false,
  hideEmpty = false,
  onCellClick,
  className,
  style,
  role = 'img',
  ...rest
}: HeatmapProps) {
  const cols = data.reduce((n, row) => Math.max(n, row.length), 0);

  // Derive the domain max from the finite values when not fixed.
  const lo = min;
  const hi =
    max ??
    Math.max(
      lo + 1,
      maxValue(data.flatMap((row) => row.filter((v): v is number => !isBlank(v)))),
    );
  const span = hi - lo || 1;

  const vars = {
    '--he-heatmap-cell': `${cellSize}px`,
    '--he-heatmap-gap': `${gap}px`,
    '--he-heatmap-cols': cols,
  } as CSSProperties;

  const interactive = Boolean(onCellClick);
  const hasCols = Boolean(colLabels?.length);
  const hasRows = Boolean(rowLabels?.length);

  return (
    <div
      className={cx('he-heatmap', className)}
      style={{ ...vars, ...style }}
      role={role}
      aria-label={rest['aria-label'] ?? 'Heatmap'}
      {...rest}
    >
      <div className="he-heatmap__scroll">
        {hasCols && (
          <div className="he-heatmap__col-labels">
            {hasRows && <span className="he-heatmap__row-label he-heatmap__corner" aria-hidden="true" />}
            {Array.from({ length: cols }, (_, c) => (
              <span key={c} className="he-heatmap__col-label">
                {colLabels?.[c]}
              </span>
            ))}
          </div>
        )}

        <div className="he-heatmap__grid">
          {data.map((row, r) => (
            <div key={r} className="he-heatmap__row">
              {hasRows && <span className="he-heatmap__row-label">{rowLabels?.[r]}</span>}
              {Array.from({ length: cols }, (_, c) => {
                const value = c < row.length ? row[c] : null;
                const blank = isBlank(value);
                const t = blank ? 0 : clamp(((value as number) - lo) / span, 0, 1);
                const title = blank ? undefined : formatValue(value as number, r, c);
                const cellStyle: CSSProperties = blank
                  ? {}
                  : { background: heatColor(t) };

                const cellClass = cx(
                  'he-heatmap__cell',
                  `he-heatmap__cell--${radius}`,
                  blank && 'he-heatmap__cell--empty',
                  blank && hideEmpty && 'he-heatmap__cell--hidden',
                );

                if (interactive) {
                  return (
                    <button
                      key={c}
                      type="button"
                      className={cellClass}
                      style={cellStyle}
                      title={title}
                      aria-label={title ?? 'empty'}
                      onClick={() => onCellClick?.({ row: r, col: c, value: blank ? null : (value as number) })}
                    />
                  );
                }
                return (
                  <div
                    key={c}
                    className={cellClass}
                    style={cellStyle}
                    title={title}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="he-heatmap__legend">
          <span className="he-heatmap__legend-label">Less</span>
          <span className="he-heatmap__legend-scale">
            {LEGEND_STEPS.map((s, i) => (
              <span
                key={i}
                className={cx('he-heatmap__legend-cell', `he-heatmap__legend-cell--${radius}`)}
                style={{ background: heatColor(s) }}
              />
            ))}
          </span>
          <span className="he-heatmap__legend-label">More</span>
        </div>
      )}
    </div>
  );
}
