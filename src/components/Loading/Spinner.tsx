import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading', className, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx('he-spinner', `he-spinner--${size}`, className)}
      {...rest}
    />
  );
}
