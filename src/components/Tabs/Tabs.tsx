import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Badge, type BadgeTone } from '../Badge/Badge';

export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Trailing count badge (e.g. filter tabs: "Necesitan atención 24"). */
  count?: ReactNode;
  /** Tone for the count badge (default neutral). */
  countTone?: BadgeTone;
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
          <span className="he-tab__label">{item.label}</span>
          {item.count != null && (
            <Badge size="sm" tone={item.countTone ?? 'neutral'} className="he-tab__count">
              {item.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
