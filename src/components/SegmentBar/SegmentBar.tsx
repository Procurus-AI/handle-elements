import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { seriesColor, sum } from '../../lib/chart';
import { Chip } from '../Chip/Chip';

/**
 * Tone drives a segment's fill. `series` cycles the categorical palette by
 * position (or an explicit `colorIndex`); the rest map to a single semantic
 * token so a segment can carry meaning (a status, an accent) on its own.
 */
export type SegmentTone = 'series' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral' | 'ink';

export interface Segment {
  label: ReactNode;
  value: number;
  /** Fill selector. Defaults to `series` (categorical palette). */
  tone?: SegmentTone;
  /** Override the categorical color slot (1-based, wraps at 6). */
  colorIndex?: number;
}

export interface SegmentBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Parts of the whole, drawn left → right in order. */
  segments: Segment[];
  /**
   * Denominator for the percentages. Defaults to the sum of values. When
   * `total` exceeds the sum, the remainder renders as an empty track tail
   * (e.g. unused capacity).
   */
  total?: number;
  /** Bar thickness. */
  size?: 'sm' | 'md' | 'lg';
  /** Pill ends on the whole bar. */
  rounded?: boolean;
  /** Legend rows beneath the bar: dot + label + value + percent. */
  showLegend?: boolean;
  /** Format the numeric value shown in the legend. */
  formatValue?: (value: number) => ReactNode;
  /** Show the percent-of-total column in the legend. */
  showPercent?: boolean;
  /**
   * Track min-width for the legend's auto-fit columns. The legend is one row
   * per segment by default (`'100%'`), which is right in a narrow card but
   * costs ~28px of height per segment and, across a full-width host, strands a
   * label metres from its own number. Give it a value (e.g. `'220px'`) and the
   * legend flows into as many columns as fit, so a five-part bar reads as one
   * line under a wide bar and reflows to two or three as the host narrows.
   */
  legendMinWidth?: string;
  /** Hairline separators between adjacent segments (track shows through). */
  gap?: boolean;
  /** Describes the whole bar for assistive tech (root is role="img"). */
  'aria-label'?: string;
}

/** Resolve a segment's CSS color from its tone (+ position for `series`). */
function toneColor(tone: SegmentTone | undefined, index: number, colorIndex?: number): string {
  switch (tone) {
    case 'accent':
      return 'var(--he-chart-accent)';
    case 'ok':
      return 'var(--he-chart-pos)';
    case 'warn':
      return 'var(--he-warn)';
    case 'error':
      return 'var(--he-chart-neg)';
    case 'neutral':
      return 'var(--he-neutral)';
    case 'ink':
      return 'var(--he-chart-ink)';
    default:
      return seriesColor(colorIndex ?? index + 1);
  }
}

const defaultFormat = (value: number): ReactNode =>
  Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);

export function SegmentBar({
  segments,
  total,
  size = 'md',
  rounded = true,
  showLegend = true,
  formatValue = defaultFormat,
  showPercent = true,
  legendMinWidth,
  gap = true,
  className,
  role = 'img',
  ...rest
}: SegmentBarProps) {
  const values = segments.map((s) => (Number.isFinite(s.value) && s.value > 0 ? s.value : 0));
  const valueSum = sum(values);
  // Denominator: honor an explicit total that meets or exceeds the sum;
  // otherwise the sum owns 100% and there is no remainder tail.
  const denom = total != null && total > valueSum ? total : valueSum;
  const pct = (v: number): number => (denom > 0 ? (v / denom) * 100 : 0);
  const remainder = Math.max(0, denom - valueSum);

  return (
    <div
      className={cx(
        'he-segmentbar',
        `he-segmentbar--${size}`,
        rounded && 'he-segmentbar--rounded',
        gap && 'he-segmentbar--gap',
        className,
      )}
      role={role}
      {...rest}
    >
      <div className="he-segmentbar__track">
        {segments.map((seg, i) => {
          const value = values[i];
          if (value <= 0) return null;
          const color = toneColor(seg.tone, i, seg.colorIndex);
          const width = pct(value);
          const labelText = typeof seg.label === 'string' ? seg.label : undefined;
          return (
            <div
              key={i}
              className="he-segmentbar__seg"
              style={{ width: `${width}%`, background: color } as CSSProperties}
              title={labelText ? `${labelText} · ${defaultFormat(value)}` : undefined}
            />
          );
        })}
        {/* Empty tail when total > sum: track shows through as unfilled space. */}
        {remainder > 0 && (
          <div
            className="he-segmentbar__seg he-segmentbar__seg--rest"
            style={{ width: `${pct(remainder)}%` }}
          />
        )}
      </div>

      {showLegend && (
        <ul
          className="he-segmentbar__legend"
          style={
            legendMinWidth
              ? ({ '--he-segmentbar-legend-min': legendMinWidth } as CSSProperties)
              : undefined
          }
        >
          {segments.map((seg, i) => {
            const value = values[i];
            const color = toneColor(seg.tone, i, seg.colorIndex);
            return (
              <li className="he-segmentbar__legend-item" key={i}>
                <Chip variant="dot" plain dotColor={color} className="he-segmentbar__legend-chip">
                  {seg.label}
                </Chip>
                <span className="he-segmentbar__value">{formatValue(value)}</span>
                {showPercent && (
                  <span className="he-segmentbar__pct">{Math.round(pct(value))}%</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
