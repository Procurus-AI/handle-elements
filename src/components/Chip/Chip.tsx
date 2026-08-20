import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type ChipVariant = 'default' | 'mono' | 'dot';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  /** Dot color for the `dot` variant — any CSS color, typically a --he-* token via var(). */
  dotColor?: string;
  size?: 'sm' | 'md';
}

export function Chip({ variant = 'default', dotColor, size = 'md', className, children, ...rest }: ChipProps) {
  return (
    <span
      className={cx('he-chip', `he-chip--${variant}`, size === 'sm' && 'he-chip--sm', className)}
      {...rest}
    >
      {variant === 'dot' && (
        <span className="he-chip__dot" style={dotColor ? { background: dotColor } : undefined} aria-hidden />
      )}
      {children}
    </span>
  );
}
