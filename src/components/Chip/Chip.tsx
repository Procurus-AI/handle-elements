import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type ChipVariant = 'default' | 'mono' | 'dot';
export type ChipDotPattern = 'solid' | 'hatch';
export type ChipTone = 'neutral' | 'active';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  /** Dot color for the `dot` variant — any CSS color, typically a --he-* token via var(). */
  dotColor?: string;
  /** Dot fill style for the `dot` variant. `hatch` draws a diagonal "no metric" swatch. */
  dotPattern?: ChipDotPattern;
  size?: 'sm' | 'md';
  /** Strip the pill chrome (border/background/padding) — e.g. as a chart legend item. */
  plain?: boolean;
  /** Render a trailing × button. The chip root stays a non-interactive <span>. */
  onRemove?: () => void;
  /** aria-label for the × button. Default 'Remove' — pass something specific, e.g. 'Remove filter: Ramo · Vida'. */
  removeLabel?: string;
  /** `active` marks an APPLIED filter, distinct from the neutral legend chip. */
  tone?: ChipTone;
}

export function Chip({
  variant = 'default',
  dotColor,
  dotPattern = 'solid',
  size = 'md',
  plain = false,
  onRemove,
  removeLabel,
  tone = 'neutral',
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
        tone === 'active' && 'he-chip--active',
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
      {onRemove && (
        // A child button, not an interactive root: the label must stay unclickable.
        <button
          type="button"
          className="he-chip__remove"
          aria-label={removeLabel ?? 'Remove'}
          onClick={onRemove}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
