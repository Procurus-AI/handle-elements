import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface NavItemProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  icon?: IconName;
  /** The current Area. Sets `aria-current="page"` and the soft-fill pill. */
  active?: boolean;
  /** Renders an `<a>` when given, otherwise a `<button>`. */
  href?: string;
  target?: string;
  rel?: string;
  /** Button only. */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Sidebar Area link (Figma "Nav item"). Flat on bg/app, no border; active is a soft fill pill.
 * Renders an `<a>` when `href` is given, otherwise a `<button>`.
 */
export function NavItem({
  icon,
  active = false,
  href,
  target,
  rel,
  disabled,
  children,
  className,
  ...rest
}: NavItemProps) {
  const classes = cx('he-nav-item', active && 'he-nav-item--active', className);
  const current = active ? 'page' : undefined;
  const content = (
    <>
      {icon && <Icon name={icon} className="he-nav-item__icon" />}
      <span className="he-nav-item__label">{children}</span>
    </>
  );
  if (href !== undefined) {
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
        target={target}
        rel={rel}
        className={classes}
        aria-current={current}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      disabled={disabled}
      className={classes}
      aria-current={current}
    >
      {content}
    </button>
  );
}
