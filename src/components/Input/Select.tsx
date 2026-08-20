import type { SelectHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** `pill` matches filter-row dropdowns; `ghost` is a quiet text dropdown. */
  variant?: 'pill' | 'ghost';
  size?: 'sm' | 'md';
  /** className lands on the wrapper; use selectClassName for the field itself. */
  selectClassName?: string;
}

export function Select({ variant = 'pill', size = 'md', className, selectClassName, children, ...rest }: SelectProps) {
  return (
    <span className={cx('he-select', `he-select--${variant}`, `he-select--${size}`, className)}>
      <select className={cx('he-select__field', selectClassName)} {...rest}>
        {children}
      </select>
      <svg
        className="he-select__chevron"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
