import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

/** v1 tones are `success | warning | danger | idle`; the 0.4.5 names stay accepted. */
export type BadgeTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'error' | 'success' | 'warning' | 'danger' | 'idle';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status tone. `neutral` = `idle`, `ok` = `success`, `warn` = `warning`, `error` = `danger`. Default `idle`. */
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  /** Leading status dot (Figma `Dot`). Off by default: without it the badge is a plain label pill. */
  dot?: boolean;
}

const CANONICAL: Record<BadgeTone, 'success' | 'warning' | 'danger' | 'idle' | 'accent'> = {
  neutral: 'idle',
  idle: 'idle',
  ok: 'success',
  success: 'success',
  warn: 'warning',
  warning: 'warning',
  error: 'danger',
  danger: 'danger',
  accent: 'accent',
};

/** Status pill: tinted fill, text and dot in one hue, no border. For bare numbers use Count. */
export function Badge({ tone = 'neutral', size = 'md', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx('he-badge', `he-badge--${CANONICAL[tone]}`, size === 'sm' && 'he-badge--sm', className)}
      {...rest}
    >
      {dot && <span className="he-badge__dot" aria-hidden />}
      {children}
    </span>
  );
}
