import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type ChipVariant = 'default' | 'mono' | 'dot';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  /** Dot color for the `dot` variant — any CSS color, typically a --he-* token via var(). */
  dotColor?: string;
  size?: 'sm' | 'md';
  /** Strip the pill chrome (border/background/padding) — e.g. as a chart legend item. */
  plain?: boolean;
}

export function Chip({
  variant = 'default',
  dotColor,
  size = 'md',
  plain = false,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cx(
        'he-chip',
        `he-chip--${variant}`,
        size === 'sm' && 'he-chip--sm',
        plain && 'he-chip--plain',
        className,
      )}
      {...rest}
    >
      {variant === 'dot' && (
        <span className="he-chip__dot" style={dotColor ? { background: dotColor } : undefined} aria-hidden />
      )}
      {children}
    </span>
  );
}
