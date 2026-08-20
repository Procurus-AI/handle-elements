import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Quiet neutral by default; status tones tint bg + text. */
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}

/** Small count / status pill — e.g. a filter-tab count or a sidebar counter. */
export function Badge({ tone = 'neutral', size = 'md', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx('he-badge', `he-badge--${tone}`, size === 'sm' && 'he-badge--sm', className)}
      {...rest}
    >
      {children}
    </span>
  );
}
