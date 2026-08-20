import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export type TabsVariant = 'underline' | 'pills';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  /** `underline` for page-level nav, `pills` for filter rows. */
  variant?: TabsVariant;
  size?: 'sm' | 'md';
}

export function Tabs({ items, value, onChange, variant = 'underline', size = 'md', className, ...rest }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cx('he-tabs', `he-tabs--${variant}`, size === 'sm' && 'he-tabs--sm', className)}
      {...rest}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          disabled={item.disabled}
          className={cx('he-tab', item.value === value && 'he-tab--active')}
          onClick={() => onChange?.(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
