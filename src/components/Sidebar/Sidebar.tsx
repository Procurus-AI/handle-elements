import {
  createElement,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

/* ---------------------------------- shell ---------------------------------- */

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Any valid CSS width (default 250px). */
  width?: string;
  /** Sticky bottom slot (account row…), separated by a hairline. */
  footer?: ReactNode;
}

export function Sidebar({ width = '250px', footer, className, children, style, ...rest }: SidebarProps) {
  return (
    <aside className={cx('he-sidebar', className)} style={{ width, ...style }} {...rest}>
      <div className="he-sidebar__scroll">{children}</div>
      {footer != null && <div className="he-sidebar__footer">{footer}</div>}
    </aside>
  );
}

/* ---------------------------------- header --------------------------------- */

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...rest }: SidebarHeaderProps) {
  return <div className={cx('he-sidebar__header', className)} {...rest} />;
}

/* ----------------------------------- item ---------------------------------- */

type ItemBaseProps = {
  icon?: ReactNode;
  label: ReactNode;
  /** Trailing slot (count, shortcut, chevron…). */
  end?: ReactNode;
  active?: boolean;
};

export type SidebarItemProps = ItemBaseProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function SidebarItem({ icon, label, end, active = false, className, ...rest }: SidebarItemProps) {
  const isLink = typeof (rest as { href?: string }).href === 'string';
  return createElement(
    isLink ? 'a' : 'button',
    {
      ...(isLink ? {} : { type: 'button' }),
      className: cx('he-sidebar-item', active && 'he-sidebar-item--active', className),
      'aria-current': active ? 'page' : undefined,
      ...rest,
    },
    icon != null && (
      <span key="i" className="he-sidebar-item__icon" aria-hidden>
        {icon}
      </span>
    ),
    <span key="l" className="he-sidebar-item__label">
      {label}
    </span>,
    end != null && (
      <span key="e" className="he-sidebar-item__end">
        {end}
      </span>
    ),
  );
}

/* --------------------------------- section --------------------------------- */

export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  label: ReactNode;
  /** Collapsible via the header chevron (default true). */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarSection({
  label,
  collapsible = true,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className,
  children,
  ...rest
}: SidebarSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    if (!isControlled) setInternalOpen(!open);
    onOpenChange?.(!open);
  };

  return (
    <div className={cx('he-sidebar-section', className)} {...rest}>
      {collapsible ? (
        <button type="button" className="he-sidebar-section__head" onClick={toggle} aria-expanded={open}>
          <span className="he-sidebar-section__label">{label}</span>
          <svg
            className={cx('he-sidebar-section__chevron', !open && 'he-sidebar-section__chevron--closed')}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="he-sidebar-section__head he-sidebar-section__head--static">
          <span className="he-sidebar-section__label">{label}</span>
        </div>
      )}
      {open && <div className="he-sidebar-section__items">{children}</div>}
    </div>
  );
}

/* ---------------------------------- footer --------------------------------- */

export interface SidebarFooterItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading visual (avatar…). */
  media?: ReactNode;
  label: ReactNode;
  /** Dim second line under the label ("Pro", email…). */
  sublabel?: ReactNode;
  end?: ReactNode;
}

export function SidebarFooterItem({ media, label, sublabel, end, className, ...rest }: SidebarFooterItemProps) {
  return (
    <button type="button" className={cx('he-sidebar-account', className)} {...rest}>
      {media != null && <span className="he-sidebar-account__media">{media}</span>}
      <span className="he-sidebar-account__text">
        <span className="he-sidebar-account__label">{label}</span>
        {sublabel != null && <span className="he-sidebar-account__sublabel">{sublabel}</span>}
      </span>
      {end != null && <span className="he-sidebar-account__end">{end}</span>}
    </button>
  );
}
