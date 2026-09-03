import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatToggleTone = 'default' | 'accent' | 'ok' | 'warn' | 'error';

export interface StatToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Mono uppercase caption (e.g. the bucket / stage name). */
  label: ReactNode;
  /** The metric — a count or amount, shown large and tabular. */
  value: ReactNode;
  /** Selected state. Reflected as `aria-pressed`. */
  active?: boolean;
  /**
   * Muted "empty" state. Auto-detected when `value` is 0 or "0"; pass explicitly
   * to force it. A zero toggle stays clickable but reads as inactive/empty.
   */
  zero?: boolean;
  /**
   * Urgency of the bucket, shown as a small dot on the label. Selection is
   * carried by the tile's fill, not by tone, so a tone reads the same whether
   * or not the tile is active.
   */
  tone?: StatToggleTone;
  /** Optional supporting caption under the value. */
  hint?: ReactNode;
}

function isZeroValue(value: ReactNode): boolean {
  return value === 0 || value === '0';
}

export function StatToggle({
  label,
  value,
  active = false,
  zero,
  tone = 'default',
  hint,
  className,
  type,
  ...rest
}: StatToggleProps) {
  const isZero = zero ?? isZeroValue(value);
  return (
    <button
      type={type ?? 'button'}
      className={cx(
        'he-stattoggle',
        `he-stattoggle--${tone}`,
        active && 'he-stattoggle--active',
        isZero && 'he-stattoggle--zero',
        className,
      )}
      aria-pressed={active}
      {...rest}
    >
      <span className="he-stattoggle__value">{value}</span>
      <span className="he-stattoggle__label">
        {tone !== 'default' && <span className="he-stattoggle__dot" aria-hidden />}
        {label}
      </span>
      {hint != null && <span className="he-stattoggle__hint">{hint}</span>}
    </button>
  );
}

export interface StatToggleGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the group of toggles. */
  label?: string;
  /** Wrap onto multiple rows instead of scrolling. */
  wrap?: boolean;
  /**
   * Lay tiles out in a uniform N-column grid (equal widths, aligned rows)
   * instead of a flex row. Takes precedence over `wrap`.
   */
  columns?: number;
}

/** Row of StatToggles — a filter/segmented control of stat buckets. */
export function StatToggleGroup({
  label,
  wrap = false,
  columns,
  className,
  children,
  style,
  ...rest
}: StatToggleGroupProps) {
  const isGrid = columns != null && columns > 0;
  return (
    <div
      className={cx(
        'he-stattoggle-group',
        isGrid ? 'he-stattoggle-group--grid' : wrap && 'he-stattoggle-group--wrap',
        className,
      )}
      role="group"
      aria-label={label}
      style={isGrid ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  );
}
