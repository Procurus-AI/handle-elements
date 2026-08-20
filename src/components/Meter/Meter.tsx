import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type MeterTone = 'default' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number;
  min?: number;
  max?: number;
  label?: ReactNode;
  valueLabel?: ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: MeterTone;
  indeterminate?: boolean;
}

type MeterStyle = CSSProperties & {
  '--he-meter-value'?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Meter({
  value = 0,
  min = 0,
  max = 100,
  label,
  valueLabel,
  showValue = false,
  size = 'md',
  tone = 'default',
  indeterminate = false,
  className,
  style,
  ...rest
}: MeterProps) {
  const safeMax = max > min ? max : min + 1;
  const boundedValue = clamp(value, min, safeMax);
  const percent = ((boundedValue - min) / (safeMax - min)) * 100;
  const labelText = valueLabel ?? `${Math.round(percent)}%`;

  return (
    <div className={cx('he-meter', `he-meter--${size}`, `he-meter--${tone}`, className)} style={style} {...rest}>
      {(label != null || showValue) && (
        <div className="he-meter__header">
          {label != null && <span className="he-meter__label">{label}</span>}
          {showValue && <span className="he-meter__value">{labelText}</span>}
        </div>
      )}
      <div
        className={cx('he-meter__track', indeterminate && 'he-meter__track--indeterminate')}
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : min}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : boundedValue}
        aria-valuetext={typeof labelText === 'string' ? labelText : undefined}
      >
        <span
          className="he-meter__fill"
          style={{ '--he-meter-value': `${percent}%` } as MeterStyle}
        />
      </div>
    </div>
  );
}

export function ProgressBar(props: MeterProps) {
  return <Meter {...props} />;
}
