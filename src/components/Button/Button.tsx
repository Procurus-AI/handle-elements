import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `default` is the primary look (accent fill), `outline` and `secondary` share the bordered
   * surface look, `ghost` has no container, `destructive` is a solid danger button and `link` is
   * a text button. One primary button per view.
   */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon, 16px. */
  icon?: IconName;
  /** Shows a spinner in place of the icon, sets `aria-busy` and ignores clicks. */
  loading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'default',
  type = 'button',
  icon,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const leading = loading ? 'loader-circle' : icon;
  return (
    <button
      type={type}
      className={cx(
        'he-btn',
        `he-btn--${variant}`,
        `he-btn--size-${size}`,
        loading && 'he-btn--loading',
        className,
      )}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading && !disabled ? true : undefined}
      {...rest}
      onClick={loading ? (event) => event.preventDefault() : rest.onClick}
    >
      {leading && <Icon name={leading} size={16} className={cx('he-btn__icon', loading && 'he-btn__spinner')} />}
      {children as ReactNode}
    </button>
  );
}
