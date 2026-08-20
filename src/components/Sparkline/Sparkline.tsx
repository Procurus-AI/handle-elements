import type { CSSProperties, HTMLAttributes } from 'react';
import { useId } from 'react';
import { cx } from '../../lib/cx';
import { areaPath, extent, linePath, scaleLinear, type Point } from '../../lib/chart';

export type SparklineTone = 'default' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';

export interface SparklineProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Series values, oldest → newest. */
  data: readonly number[];
  /** Line only, or line with a faint area fill beneath it. */
  variant?: 'line' | 'area';
  tone?: SparklineTone;
  /** Rendered width in px (also the SVG aspect). Height defaults to width / 4. */
  width?: number;
  height?: number;
  /** Round the corners of the trend with a Catmull-Rom spline. */
  smooth?: boolean;
  strokeWidth?: number;
  /** Dot on the most recent point. */
  marker?: boolean;
  /** Fix the value domain instead of deriving it from the data. */
  min?: number;
  max?: number;
  /** Optional dashed reference line at this value (e.g. a target or zero). */
  baseline?: number;
}

const PAD = 2;

export function Sparkline({
  data,
  variant = 'line',
  tone = 'default',
  width = 96,
  height,
  smooth = false,
  strokeWidth = 1.5,
  marker = false,
  min,
  max,
  baseline,
  className,
  style,
  role = 'img',
  ...rest
}: SparklineProps) {
  const h = height ?? Math.round(width / 4);
  const gradId = useId();
  const values = data.filter((v) => Number.isFinite(v));

  const [dMin, dMax] = extent(values);
  const lo = min ?? Math.min(dMin, baseline ?? dMin);
  const hi = max ?? Math.max(dMax, baseline ?? dMax);
  const x = scaleLinear(0, Math.max(1, values.length - 1), PAD, width - PAD);
  const y = scaleLinear(lo, hi, h - PAD, PAD);

  const points: Point[] = values.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = linePath(points, smooth);
  const area = variant === 'area' ? areaPath(points, h - PAD, smooth) : '';
  const last = points[points.length - 1];
  const baseY = baseline != null ? y(baseline) : null;

  return (
    <span
      className={cx('he-sparkline', `he-sparkline--${tone}`, className)}
      style={{ width, height: h, ...style } as CSSProperties}
      role={role}
      {...rest}
    >
      {values.length > 0 && (
        <svg
          className="he-sparkline__svg"
          viewBox={`0 0 ${width} ${h}`}
          width={width}
          height={h}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {variant === 'area' && (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="he-sparkline__grad-top" />
                <stop offset="100%" className="he-sparkline__grad-bottom" />
              </linearGradient>
            </defs>
          )}
          {area && <path d={area} className="he-sparkline__area" fill={`url(#${gradId})`} />}
          {baseY != null && (
            <line
              className="he-sparkline__baseline"
              x1={PAD}
              x2={width - PAD}
              y1={baseY}
              y2={baseY}
            />
          )}
          {line && (
            <path
              d={line}
              className="he-sparkline__line"
              fill="none"
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {marker && last && (
            <circle
              className="he-sparkline__marker"
              cx={last.x}
              cy={last.y}
              r={Math.max(1.5, strokeWidth)}
            />
          )}
        </svg>
      )}
    </span>
  );
}
