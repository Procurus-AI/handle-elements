import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { cx } from '../../lib/cx';
import { maxValue, niceScale, seriesColor, sum } from '../../lib/chart';
import { Chip } from '../Chip/Chip';

export type ColumnTone = 'series' | 'ink' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';

export interface ColumnDatum {
  /** X-axis label for this column position (date/category). */
  label: ReactNode;
  /** One value per series; `values[k]` is series k. */
  values: number[];
}

export interface ColumnSeries {
  /** Legend name. */
  name: ReactNode;
  /** Tone override — otherwise the series color ramp is used. */
  tone?: ColumnTone;
  /** Explicit color ramp index (0-based) when `tone` is 'series' / omitted. */
  colorIndex?: number;
}

export interface ColumnChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** One entry per x position. */
  data: ColumnDatum[];
  /** Metadata per series (legend name + optional color). Count may exceed data width. */
  series?: ColumnSeries[];
  /** Stack series vertically within each column instead of grouping side-by-side. */
  stacked?: boolean;
  /** Fix the y-domain max instead of deriving it from a nice scale. */
  max?: number;
  /** Plot height in px (excludes x labels + legend). */
  height?: number;
  /** Horizontal gridlines behind the bars. */
  showGrid?: boolean;
  /** Number of y ticks / gridlines. */
  tickCount?: number;
  /** Legend chips; defaults on when there is more than one series. */
  showLegend?: boolean;
  showXLabels?: boolean;
  showYLabels?: boolean;
  /** Format y ticks and bar tooltips. */
  formatValue?: (v: number) => ReactNode;
  /** Gap between bars within a group, in px. */
  barGap?: number;
  /** Gap between column groups, in px. */
  groupGap?: number;
}

const toneVar: Record<Exclude<ColumnTone, 'series'>, string> = {
  ink: 'var(--he-chart-ink)',
  accent: 'var(--he-chart-accent)',
  ok: 'var(--he-chart-pos)',
  warn: 'var(--he-warn)',
  error: 'var(--he-chart-neg)',
  neutral: 'var(--he-neutral)',
};

function colorFor(meta: ColumnSeries | undefined, index: number): string {
  if (meta?.tone && meta.tone !== 'series') return toneVar[meta.tone];
  return seriesColor((meta?.colorIndex ?? index) + 1);
}

const defaultFormat = (v: number): ReactNode =>
  Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);

export function ColumnChart({
  data,
  series,
  stacked = false,
  max,
  height = 200,
  showGrid = true,
  tickCount = 4,
  showLegend,
  showXLabels = true,
  showYLabels = true,
  formatValue = defaultFormat,
  barGap = 4,
  groupGap = 14,
  className,
  style,
  role = 'img',
  'aria-label': ariaLabel,
  ...rest
}: ColumnChartProps) {
  const titleId = useId();

  // Series count: explicit metadata wins, else derived from the widest row.
  const derivedCount = data.reduce((n, d) => Math.max(n, d.values.length), 0);
  const seriesCount = Math.max(series?.length ?? 0, derivedCount, 1);
  const seriesMeta: (ColumnSeries | undefined)[] = Array.from(
    { length: seriesCount },
    (_, k) => series?.[k],
  );
  const colors = seriesMeta.map((m, k) => colorFor(m, k));

  // Y domain: stacked columns are compared by their totals.
  const columnMagnitude = (values: number[]) =>
    stacked ? sum(values.slice(0, seriesCount)) : maxValue(values.slice(0, seriesCount));
  const dataMax = data.reduce((hi, d) => Math.max(hi, columnMagnitude(d.values)), 0);
  const scale = niceScale(0, max ?? dataMax, tickCount);
  const domainMax = (max ?? scale.max) || 1;
  const ticks = max != null ? niceScale(0, max, tickCount).ticks : scale.ticks;

  const legendOn = showLegend ?? seriesCount > 1;

  const label =
    ariaLabel ??
    `Column chart, ${data.length} ${data.length === 1 ? 'column' : 'columns'}${
      seriesCount > 1 ? `, ${seriesCount} series` : ''
    }`;

  return (
    <div
      className={cx('he-columnchart', stacked && 'he-columnchart--stacked', className)}
      role={role}
      aria-label={label}
      aria-describedby={titleId}
      style={{ '--he-columnchart-h': `${height}px`, ...style } as CSSProperties}
      {...rest}
    >
      <span id={titleId} hidden>
        {label}
      </span>
      <div className="he-columnchart__plot-row">
        {showYLabels && (
          <div className="he-columnchart__ycol" aria-hidden="true">
            {[...ticks].reverse().map((t, i) => (
              <span className="he-columnchart__ylabel" key={i}>
                {formatValue(t)}
              </span>
            ))}
          </div>
        )}
        <div className="he-columnchart__plot">
          {showGrid && (
            <div className="he-columnchart__grid" aria-hidden="true">
              {ticks.map((_, i) => (
                <div className="he-columnchart__gridline" key={i} />
              ))}
            </div>
          )}
          <div className="he-columnchart__groups" style={{ gap: `${groupGap}px` }}>
            {data.map((d, i) => (
              <div className="he-columnchart__group" key={i} style={{ gap: `${barGap}px` }}>
                <div className="he-columnchart__stack">
                  {seriesMeta.map((meta, k) => {
                    const value = d.values[k] ?? 0;
                    if (!(value > 0)) return null;
                    const pct = (value / domainMax) * 100;
                    return (
                      <div
                        className="he-columnchart__bar"
                        key={k}
                        style={{ height: `${pct}%`, background: colors[k] }}
                        title={`${textOf(meta?.name) ?? `Series ${k + 1}`}: ${textOf(
                          formatValue(value),
                        )}`}
                      />
                    );
                  })}
                </div>
                {showXLabels && (
                  <span className="he-columnchart__xlabel">{d.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {legendOn && (
        <div className="he-columnchart__legend">
          {seriesMeta.map((meta, k) => (
            <Chip key={k} variant="dot" plain dotColor={colors[k]}>
              {meta?.name ?? `Series ${k + 1}`}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

/** Best-effort plain text from a ReactNode for title/tooltip attributes. */
function textOf(node: ReactNode): string | undefined {
  if (node == null || node === false || node === true) return undefined;
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).filter(Boolean).join('');
  return undefined;
}
