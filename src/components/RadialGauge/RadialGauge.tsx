import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { arcPath, circumference, clamp } from '../../lib/chart';

export type GaugeTone = 'default' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';

export interface RadialGaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  min?: number;
  max?: number;
  /** `ring` = full 360° donut; `gauge` = 270° bottom-open speedometer. */
  variant?: 'ring' | 'gauge';
  /** Rendered width/height in px. */
  size?: number;
  /** Value-arc stroke width in px. */
  thickness?: number;
  /** Track stroke width in px; defaults to `thickness`. */
  trackWidth?: number;
  tone?: GaugeTone;
  /** Text below the centered number. */
  label?: ReactNode;
  /** Overrides the centered number (default `${Math.round(percent)}%`). */
  valueLabel?: ReactNode;
  showValue?: boolean;
  /** Round the stroke caps. */
  rounded?: boolean;
}

/** The gauge variant sweeps 270°, from -135° to +135° (bottom-open). */
const GAUGE_START = -135;
const GAUGE_END = 135;
const GAUGE_SWEEP = GAUGE_END - GAUGE_START;

type GaugeStyle = CSSProperties & {
  '--he-gauge-dash'?: string;
  '--he-gauge-offset'?: string;
};

type GaugeRootStyle = CSSProperties & {
  '--he-gauge-number-size'?: string;
};

export function RadialGauge({
  value,
  min = 0,
  max = 100,
  variant = 'ring',
  size = 120,
  thickness = 10,
  trackWidth,
  tone = 'default',
  label,
  valueLabel,
  showValue = true,
  rounded = true,
  className,
  style,
  ...rest
}: RadialGaugeProps) {
  const safeMax = max > min ? max : min + 1;
  const bounded = clamp(value, min, safeMax);
  const fraction = (bounded - min) / (safeMax - min);
  const percent = fraction * 100;

  const track = trackWidth ?? thickness;
  const cx0 = size / 2;
  const cy0 = size / 2;
  // Radius accounts for the thickest of the two strokes so nothing clips.
  const r = size / 2 - Math.max(thickness, track) / 2;

  // Scale the centered number with the gauge so it stays proportional.
  const numberSize = Math.max(13, Math.round(size * (variant === 'gauge' ? 0.19 : 0.2)));
  const numberText = valueLabel ?? `${Math.round(percent)}%`;
  const valueText = typeof numberText === 'string' ? numberText : `${Math.round(percent)}%`;
  const caps = rounded ? 'round' : 'butt';

  let trackNode: ReactNode;
  let valueNode: ReactNode;

  if (variant === 'ring') {
    // Full circle drawn as a stroked <circle>; the value arc is the same
    // circle with a dash pattern revealing `fraction` of the circumference.
    const c = circumference(r);
    const dash = `${c} ${c}`;
    const offset = c * (1 - fraction);
    trackNode = (
      <circle
        className="he-gauge__track"
        cx={cx0}
        cy={cy0}
        r={r}
        fill="none"
        strokeWidth={track}
      />
    );
    valueNode = (
      <circle
        className="he-gauge__value"
        cx={cx0}
        cy={cy0}
        r={r}
        fill="none"
        strokeWidth={thickness}
        strokeLinecap={caps}
        // Start the sweep at 12 o'clock, going clockwise.
        transform={`rotate(-90 ${cx0} ${cy0})`}
        style={
          {
            '--he-gauge-dash': dash,
            '--he-gauge-offset': `${offset}`,
          } as GaugeStyle
        }
      />
    );
  } else {
    const trackPath = arcPath(cx0, cy0, r, GAUGE_START, GAUGE_END);
    const valuePath = arcPath(cx0, cy0, r, GAUGE_START, GAUGE_START + GAUGE_SWEEP * fraction);
    // Dash the value arc so it can animate on mount / value change.
    const c = circumference(r);
    trackNode = (
      <path
        className="he-gauge__track"
        d={trackPath}
        fill="none"
        strokeWidth={track}
        strokeLinecap={caps}
      />
    );
    valueNode = (
      <path
        className="he-gauge__value"
        d={valuePath}
        fill="none"
        strokeWidth={thickness}
        strokeLinecap={caps}
        style={
          {
            '--he-gauge-dash': `${c} ${c}`,
            '--he-gauge-offset': '0',
          } as GaugeStyle
        }
      />
    );
  }

  return (
    <div
      className={cx('he-gauge', `he-gauge--${variant}`, `he-gauge--${tone}`, className)}
      style={
        {
          width: size,
          height: size,
          '--he-gauge-number-size': `${numberSize}px`,
          ...style,
        } as GaugeRootStyle
      }
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={bounded}
      aria-valuetext={valueText}
      {...rest}
    >
      <svg
        className="he-gauge__svg"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
      >
        {trackNode}
        {valueNode}
      </svg>
      {(showValue || label != null) && (
        <div className="he-gauge__center">
          {showValue && <span className="he-gauge__number">{numberText}</span>}
          {label != null && <span className="he-gauge__label">{label}</span>}
        </div>
      )}
    </div>
  );
}
