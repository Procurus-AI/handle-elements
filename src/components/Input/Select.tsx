import type { SelectHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

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
      <Icon name="chevron-down" size={16} className="he-select__chevron" />
    </span>
  );
}
