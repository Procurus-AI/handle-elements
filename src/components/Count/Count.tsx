import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type CountTone = 'neutral' | 'warning' | 'danger' | 'success';

export interface CountProps extends HTMLAttributes<HTMLSpanElement> {
  /** Neutral by default; use a tone only when the quantity itself is the alarm. */
  tone?: CountTone;
}

/** How many of something. A bare number pill with no dot: it has no state to show (Badge does). */
export function Count({ tone = 'neutral', className, children, ...rest }: CountProps) {
  return (
    <span className={cx('he-count', `he-count--${tone}`, className)} {...rest}>
      {children}
    </span>
  );
}
