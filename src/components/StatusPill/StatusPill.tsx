import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatusPillStatus = 'ok' | 'warn' | 'error' | 'neutral' | 'accent';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusPillStatus;
  label: ReactNode;
  withDot?: boolean;
}

export function StatusPill({ status, label, withDot = true, className, ...rest }: StatusPillProps) {
  return (
    <span className={cx('he-pill', `he-pill--${status}`, className)} {...rest}>
      {withDot && <span className="he-pill__dot" aria-hidden />}
      {label}
    </span>
  );
}
