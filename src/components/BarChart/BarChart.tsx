import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { clamp, maxValue } from '../../lib/chart';

export type BarChartTone = 'default' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';

export interface BarChartDatum {
  label: ReactNode;
  value: number;
  /** Per-row tone override; falls back to the chart `tone`. */
  tone?: BarChartTone;
  /** Extra context surfaced via the row's native title tooltip. */
  hint?: ReactNode;
}

export interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Categories to rank, one horizontal bar each. */
  data: BarChartDatum[];
  /** Domain max — bar widths are value/max. Defaults to the largest value. */
  max?: number;
  /** Fill color for every bar unless a row overrides it. */
  tone?: BarChartTone;
  /** Show the mono value label at the end of each row. */
  showValue?: boolean;
  /** Format the trailing value label (e.g. currency, percent). */
  formatValue?: (value: number) => ReactNode;
  /** Reorder rows by value; 'none' preserves input order. */
  sort?: 'none' | 'desc' | 'asc';
  /** Paint the single largest bar in the accent tone. */
  highlightMax?: boolean;
  /** Bar thickness. */
  barSize?: 'sm' | 'md' | 'lg';
}

export function BarChart({
  data,
  max,
  tone = 'default',
  showValue = true,
  formatValue,
  sort = 'none',
  highlightMax = false,
  barSize = 'md',
  className,
  role = 'img',
  ...rest
}: BarChartProps) {
  const rows =
    sort === 'none'
      ? data
      : [...data].sort((a, b) => (sort === 'desc' ? b.value - a.value : a.value - b.value));

  const domain = max ?? maxValue(data.map((d) => d.value));
  // Index of the largest bar, used only when highlightMax is on.
  const peak = highlightMax
    ? data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)
    : -1;

  const format = (v: number): ReactNode => (formatValue ? formatValue(v) : v);

  return (
    <div
      className={cx('he-barchart', `he-barchart--${barSize}`, className)}
      role={role}
      {...rest}
    >
      {rows.map((d, i) => {
        const pct = domain > 0 ? clamp(d.value / domain, 0, 1) * 100 : 0;
        const rowTone = d.tone ?? (highlightMax && d === data[peak] ? 'accent' : tone);
        const valueText = format(d.value);
        const title =
          d.hint != null
            ? undefined
            : typeof d.label === 'string' && typeof valueText === 'string'
              ? `${d.label}: ${valueText}`
              : undefined;
        return (
          <div
            key={i}
            className={cx('he-barchart__row', `he-barchart__row--${rowTone}`)}
            title={title}
          >
            <span className="he-barchart__label">{d.label}</span>
            <div className="he-barchart__track">
              <div
                className="he-barchart__fill"
                style={{ width: `${pct}%` } as CSSProperties}
                role="img"
                aria-label={
                  typeof valueText === 'string' ? String(valueText) : String(d.value)
                }
              />
            </div>
            {showValue && <span className="he-barchart__value">{valueText}</span>}
            {d.hint != null && <span className="he-barchart__hint">{d.hint}</span>}
          </div>
        );
      })}
    </div>
  );
}
