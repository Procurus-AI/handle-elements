import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type FilterChipTone = 'neutral' | 'success' | 'warning' | 'idle';

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode;
  /** How many items match. Shown after the label. */
  count?: ReactNode;
  /** `neutral` has no dot; the other tones add a status dot. */
  tone?: FilterChipTone;
  /** Applied filter. Reflected as `aria-pressed`. */
  active?: boolean;
}

/** Filters a set by status and shows how many match. A toggle button. */
export function FilterChip({
  label,
  count,
  tone = 'neutral',
  active = false,
  className,
  type,
  ...rest
}: FilterChipProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cx('he-filter-chip', `he-filter-chip--${tone}`, active && 'he-filter-chip--active', className)}
      aria-pressed={active}
      {...rest}
    >
      {tone !== 'neutral' && <span className="he-filter-chip__dot" aria-hidden />}
      <span className="he-filter-chip__label">{label}</span>
      {count != null && <span className="he-filter-chip__count">{count}</span>}
    </button>
  );
}
