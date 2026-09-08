import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatusPillStatus = 'ok' | 'warn' | 'error' | 'neutral' | 'accent';
export type StatusPillAppearance = 'outline' | 'soft';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusPillStatus;
  label: ReactNode;
  withDot?: boolean;
  /** Visual treatment. `soft` uses the status tint with no border. Default `outline`. */
  appearance?: StatusPillAppearance;
}

export function StatusPill({
  status,
  label,
  withDot = true,
  appearance = 'outline',
  className,
  ...rest
}: StatusPillProps) {
  return (
    <span
      className={cx(
        'he-pill',
        `he-pill--${status}`,
        appearance === 'soft' && 'he-pill--soft',
        !withDot && 'he-pill--nodot',
        className,
      )}
      {...rest}
    >
      {withDot && <span className="he-pill__dot" aria-hidden />}
      {label}
    </span>
  );
}
