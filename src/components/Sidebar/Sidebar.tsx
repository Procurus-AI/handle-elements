import {
  createContext,
  createElement,
  useContext,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';
import { Tooltip } from '../Tooltip/Tooltip';

/* Rows need to know the rail is 56px wide: collapsed rows hide their text, so
 * they borrow the label for an aria-label and a right-placed tooltip. */
const SidebarContext = createContext<{ collapsed: boolean }>({ collapsed: false });

/* ---------------------------------- shell ---------------------------------- */

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Landmark element (default `'aside'`). Use `'nav'` when the rail IS the primary
   * navigation — an `<aside>` labelled "Main navigation" exposes a complementary
   * landmark whose name contradicts its role.
   */
  as?: 'aside' | 'nav' | 'div';
  /** Any valid CSS width (default 250px). Ignored while `collapsed`. */
  width?: string;
  /** Icon-only rail: hides labels, ends, and sections; footer keeps only its media. */
  collapsed?: boolean;
  /** Pinned block above the footer (settings rows, theme, environment), separated by a hairline. */
  utility?: ReactNode;
  /** Sticky bottom slot (account row…), separated by a hairline. */
  footer?: ReactNode;
}

export function Sidebar({
  as: Element = 'aside',
  width = '250px',
  collapsed = false,
  utility,
  footer,
  className,
  children,
  style,
  ...rest
}: SidebarProps) {
  return (
    <Element
      className={cx('he-sidebar', collapsed && 'he-sidebar--collapsed', className)}
      style={{ width: collapsed ? undefined : width, ...style }}
      data-collapsed={collapsed || undefined}
      {...rest}
    >
      <SidebarContext.Provider value={{ collapsed }}>
        <div className="he-sidebar__scroll">{children}</div>
        {utility != null && <div className="he-sidebar__utility">{utility}</div>}
        {footer != null && <div className="he-sidebar__footer">{footer}</div>}
      </SidebarContext.Provider>
    </Element>
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
  /** Nesting level — each step indents the row (default 0). */
  depth?: number;
};

export type SidebarItemProps = ItemBaseProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function SidebarItem({ icon, label, end, active = false, depth = 0, className, style, ...rest }: SidebarItemProps) {
  const { collapsed } = useContext(SidebarContext);
  const isLink = typeof (rest as { href?: string }).href === 'string';
  const named = collapsed && typeof label === 'string';
  const element = createElement(
    isLink ? 'a' : 'button',
    {
      ...(isLink ? {} : { type: 'button' }),
      className: cx('he-sidebar-item', active && 'he-sidebar-item--active', className),
      'aria-current': active ? 'page' : undefined,
      'aria-label': named ? (label as string) : undefined,
      style: depth > 0 ? { paddingLeft: `calc(var(--he-space-2) + ${depth} * 18px)`, ...style } : style,
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

  return named ? (
    <Tooltip content={label} placement="right">
      {element}
    </Tooltip>
  ) : (
    element
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
  /** Action slot on the header row (e.g. a ghost "+" button); clicks don't toggle. */
  action?: ReactNode;
}

export function SidebarSection({
  label,
  collapsible = true,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  action,
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
      <div className="he-sidebar-section__row">
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
        {action != null && <span className="he-sidebar-section__action">{action}</span>}
      </div>
      {open && <div className="he-sidebar-section__items">{children}</div>}
    </div>
  );
}

/* ---------------------------------- footer --------------------------------- */

/**
 * A footer row whose FIRST child stretches and whose siblings shrink-wrap — the
 * shape you need to put a second control BESIDE the account trigger.
 *
 * Why it exists is not aesthetic. `.he-popover__trigger` toggles its menu on ANY
 * click inside it, so a second control nested in the account trigger would open the
 * account menu instead of doing its own job; a `<button>` inside `SidebarFooterItem`'s
 * `<button>` is invalid HTML; and the ARIA delegate probe takes the FIRST focusable
 * descendant, so DOM order would decide which control claims `aria-expanded`. A
 * sibling control therefore goes BESIDE the trigger, and this row is what keeps the
 * trigger full-width while it does.
 */
export interface SidebarFooterRowProps extends HTMLAttributes<HTMLDivElement> {}

export function SidebarFooterRow({ className, children, ...rest }: SidebarFooterRowProps) {
  return (
    <div className={cx('he-sidebar-footer-row', className)} {...rest}>
      {children}
    </div>
  );
}

export interface SidebarFooterItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading visual (avatar…). */
  media?: ReactNode;
  label: ReactNode;
  /** Dim second line under the label ("Pro", email…). */
  sublabel?: ReactNode;
  end?: ReactNode;
  /** Popover is open — keeps the hover fill and flips the chevron. Also sets aria-expanded. */
  open?: boolean;
  /**
   * Trailing affordance when `end` is not supplied (default false).
   * `true` = the single chevron that rotates on open ("this expands").
   * `'updown'` = the stacked glyph, which does not rotate ("this opens a list of
   * alternatives") — the honest glyph for a row backed by seven accounts.
   */
  chevron?: boolean | 'updown';
}

export function SidebarFooterItem({
  media,
  label,
  sublabel,
  end,
  open,
  chevron = false,
  className,
  ...rest
}: SidebarFooterItemProps) {
  const { collapsed } = useContext(SidebarContext);
  const named = typeof label === 'string';
  /* Only the collapsed rail needs a borrowed name: on the expanded rail an
   * aria-label would REPLACE the visible text, dropping the sublabel — the org and
   * role that are the only thing telling two identically named accounts apart. */
  const labelled = collapsed && named;
  const trailing = end ?? (chevron === 'updown' ? <UpDownGlyph /> : chevron ? <ChevronGlyph /> : null);

  const button = (
    <button
      type="button"
      className={cx('he-sidebar-account', open && 'he-sidebar-account--open', className)}
      aria-expanded={open}
      aria-label={labelled ? (label as string) : undefined}
      {...rest}
    >
      {media != null && <span className="he-sidebar-account__media">{media}</span>}
      <span className="he-sidebar-account__text">
        <span className="he-sidebar-account__label">{label}</span>
        {sublabel != null && <span className="he-sidebar-account__sublabel">{sublabel}</span>}
      </span>
      {trailing != null && <span className="he-sidebar-account__end">{trailing}</span>}
    </button>
  );

  return labelled ? (
    <Tooltip content={label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

/* Stacked up/down. It is deliberately EXCLUDED from the open rotation: rotating a
 * symmetric glyph 180deg is a no-op that looks like a bug, and the row it marks does
 * not expand in place — it opens a list of alternatives.
 *
 * The 3.2-unit gap between the two baselines is measured, not chosen: at 12px with a
 * 1.4 stroke and ROUND caps, the caps add ~0.7 each, so a 2-unit gap closed the pair
 * into a small diamond ring — screenshotted at 16x before it was widened. */
function UpDownGlyph() {
  return (
    <svg
      className="he-sidebar-account__chevron he-sidebar-account__chevron--static"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.9 4.4 6 2.3 8.1 4.4M3.9 7.6 6 9.7 8.1 7.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Same path as the section chevron above and Select's — one glyph weight per rail. */
function ChevronGlyph() {
  return (
    <svg className="he-sidebar-account__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
