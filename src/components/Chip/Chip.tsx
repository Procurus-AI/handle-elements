import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type ChipVariant = 'default' | 'mono' | 'dot';
export type ChipDotPattern = 'solid' | 'hatch';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  /** Dot color for the `dot` variant — any CSS color, typically a --he-* token via var(). */
  dotColor?: string;
  /** Dot fill style for the `dot` variant. `hatch` draws a diagonal "no metric" swatch. */
  dotPattern?: ChipDotPattern;
  size?: 'sm' | 'md';
  /** Strip the pill chrome (border/background/padding) — e.g. as a chart legend item. */
  plain?: boolean;
}

export function Chip({
  variant = 'default',
  dotColor,
  dotPattern = 'solid',
  size = 'md',
  plain = false,
  className,
  children,
  ...rest
}: ChipProps) {
  const hatch = dotPattern === 'hatch';
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
        <span
          className={cx('he-chip__dot', hatch && 'he-chip__dot--hatch')}
          // Hatch draws its own fill via CSS; only a solid dot takes the inline color.
          style={!hatch && dotColor ? { background: dotColor } : undefined}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
