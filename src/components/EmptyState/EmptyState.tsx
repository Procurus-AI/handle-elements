import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center';
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
  size = 'md',
  align = 'center',
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={cx('he-empty', `he-empty--${size}`, `he-empty--${align}`, className)} {...rest}>
      {icon != null && <div className="he-empty__icon">{icon}</div>}
      <div className="he-empty__content">
        <div className="he-empty__title">{title}</div>
        {hint != null && <div className="he-empty__hint">{hint}</div>}
      </div>
      {action != null && <div className="he-empty__action">{action}</div>}
    </div>
  );
}
