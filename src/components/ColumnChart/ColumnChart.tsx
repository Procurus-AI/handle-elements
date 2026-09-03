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
  /** Per-column tone override — wins over the series tone. */
  tone?: ColumnTone;
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
  /** Accent this column index (wins over `datum.tone` and the series tone). */
  highlightIndex?: number;
  /** Fade the non-highlighted columns. */
  dimOthers?: boolean;
  /** Print one mono value label above each column. No-op for grouped multi-series. */
  showValues?: boolean;
  /** Max bar width in px. Defaults to the 22px cap; pass ~56 for a wide 12-month block. */
  barMaxWidth?: number;
  /** Draw an explicit axis rule under the plot even when `showGrid` is false. */
  showBaseline?: boolean;
  /** Promote each column to a <button>. */
  onSelectColumn?: (datum: ColumnDatum, index: number) => void;
  selectedIndex?: number;
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
  highlightIndex,
  dimOthers = false,
  showValues = false,
  barMaxWidth,
  showBaseline = false,
  onSelectColumn,
  selectedIndex,
  className,
  style,
  role,
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

  // Tone resolution per bar: highlight wins, then the datum, then the series.
  const toneAt = (d: ColumnDatum, i: number, k: number): ColumnTone =>
    highlightIndex === i ? 'accent' : d.tone ?? seriesMeta[k]?.tone ?? 'series';
  const barColor = (tone: ColumnTone, k: number): string =>
    tone === 'series' ? colors[k] : toneVar[tone];

  const label =
    ariaLabel ??
    `Column chart, ${data.length} ${data.length === 1 ? 'column' : 'columns'}${
      seriesCount > 1 ? `, ${seriesCount} series` : ''
    }`;

  return (
    <div
      className={cx(
        'he-columnchart',
        stacked && 'he-columnchart--stacked',
        showValues && 'he-columnchart--values',
        showXLabels && 'he-columnchart--xlabels',
        showBaseline && 'he-columnchart--baseline',
        className,
      )}
      role={role ?? (onSelectColumn ? 'group' : 'img')}
      aria-label={label}
      aria-describedby={titleId}
      style={
        {
          '--he-columnchart-h': `${height}px`,
          ...(barMaxWidth != null ? { '--he-columnchart-bar-max': `${barMaxWidth}px` } : null),
          ...style,
        } as CSSProperties
      }
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
            {data.map((d, i) => {
              // One label per column only where a single number is unambiguous.
              const magnitude = stacked
                ? sum(d.values.slice(0, seriesCount))
                : seriesCount === 1
                  ? d.values[0] ?? 0
                  : null;
              const body = (
                <>
                  <div className="he-columnchart__stack">
                    {seriesMeta.map((meta, k) => {
                      const value = d.values[k] ?? 0;
                      if (!(value > 0)) return null;
                      const pct = (value / domainMax) * 100;
                      const tone = toneAt(d, i, k);
                      return (
                        <div
                          className={cx(
                            'he-columnchart__bar',
                            tone === 'accent' && 'he-columnchart__bar--accent',
                          )}
                          key={k}
                          style={{ height: `${pct}%`, background: barColor(tone, k) }}
                          title={`${textOf(meta?.name) ?? `Series ${k + 1}`}: ${textOf(
                            formatValue(value),
                          )}`}
                        />
                      );
                    })}
                    {showValues && magnitude != null && (
                      <span
                        className="he-columnchart__value"
                        style={{ bottom: `${(magnitude / domainMax) * 100}%` }}
                      >
                        {formatValue(magnitude)}
                      </span>
                    )}
                  </div>
                  {showXLabels && <span className="he-columnchart__xlabel">{d.label}</span>}
                </>
              );
              const groupClass = cx(
                'he-columnchart__group',
                dimOthers && highlightIndex != null && highlightIndex !== i && 'he-columnchart__group--dim',
              );
              return onSelectColumn ? (
                <button
                  type="button"
                  key={i}
                  className={cx(
                    groupClass,
                    'he-columnchart__group--clickable',
                    selectedIndex === i && 'he-columnchart__group--selected',
                  )}
                  onClick={() => onSelectColumn(d, i)}
                  aria-pressed={selectedIndex === i}
                  aria-label={`${textOf(d.label) ?? `Column ${i + 1}`}${
                    magnitude != null ? `, ${textOf(formatValue(magnitude)) ?? ''}` : ''
                  }`}
                  style={{ gap: `${barGap}px` }}
                >
                  {body}
                </button>
              ) : (
                <div className={groupClass} key={i} style={{ gap: `${barGap}px` }}>
                  {body}
                </div>
              );
            })}
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
