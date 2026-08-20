import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { clamp, extent, maxValue } from '../../lib/chart';

export type HistogramTone = 'default' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';

export interface HistogramBin {
  label: ReactNode;
  value: number;
}

export interface HistogramProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Pre-binned data: one entry per contiguous bucket. Provide this OR `values`. */
  bins?: readonly HistogramBin[];
  /** Raw values to bucket into `binCount` equal-width bins. Provide this OR `bins`. */
  values?: readonly number[];
  /** Number of equal-width buckets when using `values`. */
  binCount?: number;
  /** Fix the y domain instead of deriving it from the data. */
  max?: number;
  /** Plot height in px (excludes x-axis labels). */
  height?: number;
  tone?: HistogramTone;
  /** Render the tallest bin in the accent fill. */
  highlightPeak?: boolean;
  /** Print the value above each bar. */
  showValues?: boolean;
  /** Show every Nth x-axis label. Defaults to ~8 labels max. */
  labelEvery?: number;
  /** Format bar values (tooltip + optional printed value). */
  formatValue?: (v: number) => ReactNode;
}

const DEFAULT_BIN_COUNT = 12;
const MAX_LABELS = 8;

/** Bucket raw values into `binCount` equal-width bins with numeric range labels. */
function binValues(values: readonly number[], binCount: number): HistogramBin[] {
  const finite = values.filter((v) => Number.isFinite(v));
  const count = Math.max(1, Math.floor(binCount));
  if (finite.length === 0) {
    return Array.from({ length: count }, (_, i) => ({ label: String(i), value: 0 }));
  }
  const [lo, hi] = extent(finite);
  const span = hi - lo;
  // Degenerate range: a single occupied bucket.
  if (span === 0) {
    return [{ label: formatRange(lo, hi), value: finite.length }];
  }
  const width = span / count;
  const counts = new Array<number>(count).fill(0);
  for (const v of finite) {
    const idx = clamp(Math.floor((v - lo) / width), 0, count - 1);
    counts[idx] += 1;
  }
  return counts.map((c, i) => ({
    label: formatRange(lo + i * width, lo + (i + 1) * width),
    value: c,
  }));
}

/** Compact numeric range label, e.g. "0–5" or "12.5". */
function formatRange(lo: number, hi: number): string {
  const l = trimNum(lo);
  const h = trimNum(hi);
  return l === h ? l : `${l}–${h}`;
}

function trimNum(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return String(Number.isInteger(rounded) ? rounded : rounded.toFixed(1));
}

export function Histogram({
  bins,
  values,
  binCount = DEFAULT_BIN_COUNT,
  max,
  height = 160,
  tone = 'default',
  highlightPeak = true,
  showValues = false,
  labelEvery,
  formatValue,
  className,
  style,
  role = 'img',
  'aria-label': ariaLabel,
  ...rest
}: HistogramProps) {
  const resolved: HistogramBin[] = bins
    ? bins.slice()
    : values
      ? binValues(values, binCount)
      : [];

  const nums = resolved.map((b) => (Number.isFinite(b.value) ? b.value : 0));
  const domainMax = max ?? maxValue(nums);
  const peakIndex = highlightPeak && domainMax > 0 ? nums.indexOf(Math.max(...nums)) : -1;

  const every = labelEvery ?? Math.max(1, Math.ceil(resolved.length / MAX_LABELS));
  const fmt = (v: number): ReactNode => (formatValue ? formatValue(v) : v);
  const fmtText = (v: number): string => {
    const out = fmt(v);
    return typeof out === 'string' || typeof out === 'number' ? String(out) : String(v);
  };

  const computedLabel =
    ariaLabel ?? `Distribution across ${resolved.length} bins, peak ${domainMax}`;

  return (
    <div
      className={cx('he-histogram', `he-histogram--${tone}`, className)}
      style={{ '--he-histogram-h': `${height}px`, ...style } as CSSProperties}
      role={role}
      aria-label={computedLabel}
      {...rest}
    >
      <div className="he-histogram__plot" style={{ height }}>
        {resolved.map((bin, i) => {
          const v = Number.isFinite(bin.value) ? bin.value : 0;
          const pct = domainMax > 0 ? clamp((v / domainMax) * 100, 0, 100) : 0;
          const isPeak = i === peakIndex;
          const title =
            typeof bin.label === 'string' || typeof bin.label === 'number'
              ? `${bin.label}: ${fmtText(v)}`
              : fmtText(v);
          return (
            <div key={i} className="he-histogram__bin">
              {showValues && (
                <span className="he-histogram__value" aria-hidden="true">
                  {fmt(v)}
                </span>
              )}
              <div
                className={cx('he-histogram__bar', isPeak && 'he-histogram__bar--peak')}
                style={{ height: `${pct}%` }}
                title={title}
              />
            </div>
          );
        })}
      </div>
      <div className="he-histogram__xaxis" aria-hidden="true">
        {resolved.map((bin, i) => (
          <span key={i} className="he-histogram__xlabel">
            {i % every === 0 ? bin.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
