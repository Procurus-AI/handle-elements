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
  /** Accent used by the active indicator (and value in status tones). */
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
      <span className="he-stattoggle__label">{label}</span>
      {hint != null && <span className="he-stattoggle__hint">{hint}</span>}
    </button>
  );
}

export interface StatToggleGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the group of toggles. */
  label?: string;
  /** Wrap onto multiple rows instead of scrolling. */
  wrap?: boolean;
}

/** Row of StatToggles — a filter/segmented control of stat buckets. */
export function StatToggleGroup({
  label,
  wrap = false,
  className,
  children,
  ...rest
}: StatToggleGroupProps) {
  return (
    <div
      className={cx('he-stattoggle-group', wrap && 'he-stattoggle-group--wrap', className)}
      role="group"
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  );
}
