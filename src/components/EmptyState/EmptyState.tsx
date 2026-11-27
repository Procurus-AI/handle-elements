import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  /** The fix: what to change to get results. */
  hint?: ReactNode;
  /** Alias of `hint` (Figma calls it the body). `hint` wins when both are set. */
  body?: ReactNode;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center';
}

/** Shown inside a table panel when filters return nothing. The title states the fact, the body the fix. */
export function EmptyState({
  icon,
  title,
  hint,
  body,
  action,
  size = 'md',
  align = 'center',
  className,
  ...rest
}: EmptyStateProps) {
  const fix = hint ?? body;
  return (
    <div className={cx('he-empty', `he-empty--${size}`, `he-empty--${align}`, className)} {...rest}>
      {icon != null && <div className="he-empty__icon">{icon}</div>}
      <div className="he-empty__content">
        <div className="he-empty__title">{title}</div>
        {fix != null && <div className="he-empty__hint">{fix}</div>}
      </div>
      {action != null && <div className="he-empty__action">{action}</div>}
    </div>
  );
}
