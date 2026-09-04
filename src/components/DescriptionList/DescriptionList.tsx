import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /** Column intent. Collapses to 1 automatically when the tracks would go under 168px. Default 2. */
  columns?: 1 | 2;
  /** `sm` steps the value down to --he-body-sm for very tight rails. Default `md`. */
  size?: 'sm' | 'md';
}

/**
 * Label/value pairs at record-drawer density — the description-list the library
 * was missing. Not StatCardGroup: a KPI tile renders its value in 20px Sentient,
 * which is wrong for a date string or a carrier name.
 */
export function DescriptionList({
  columns = 2,
  size = 'md',
  className,
  children,
  ...rest
}: DescriptionListProps) {
  return (
    <dl className={cx('he-dl', `he-dl--cols-${columns}`, size === 'sm' && 'he-dl--sm', className)} {...rest}>
      {children}
    </dl>
  );
}

export interface DescriptionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  label: ReactNode;
  value?: ReactNode;
  /**
   * Printed when `value` is null/undefined/''. Default '—' — the library's
   * established none idiom (src/format/currency.ts, src/format/time.ts).
   */
  nullLabel?: string;
  /** Span the whole grid width (a long address, a note). */
  wide?: boolean;
}

/**
 * One pair. The `<div>` wrapper inside `<dl>` is valid HTML5 dt/dd grouping and
 * is what makes each pair a single grid cell.
 */
export function DescriptionItem({
  label,
  value,
  nullLabel = '—',
  wide = false,
  className,
  ...rest
}: DescriptionItemProps) {
  const empty = value == null || value === '';

  return (
    <div className={cx('he-dl__item', wide && 'he-dl__item--wide', className)} {...rest}>
      <dt className="he-dl__label">{label}</dt>
      <dd className={cx('he-dl__value', empty && 'he-dl__value--empty')}>{empty ? nullLabel : value}</dd>
    </div>
  );
}
