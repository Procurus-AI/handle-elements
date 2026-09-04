import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';

export type DrawerSide = 'right' | 'left';

/** Everything a keyboard can land on — the trap cycles this set inside the panel. */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  /** Edge the panel slides in from. */
  side?: DrawerSide;
  /** Mono uppercase kicker above the title (context, e.g. the parent group). */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Quiet supporting line under the title — a price, id, or status row. */
  meta?: ReactNode;
  /** Header controls (overflow menu, prev/next) rendered beside close. */
  actions?: ReactNode;
  /** Widens the panel to `expandedWidth`. */
  expanded?: boolean;
  /** When supplied, Drawer renders its own expand toggle first in the action cluster. */
  onToggleExpand?: () => void;
  /** Width used while `expanded`. */
  expandedWidth?: string;
  /**
   * A `<Tabs>` element pinned in its own region below the header — the body
   * scrolls beneath it. Pass the Tabs component directly (use `variant="underline"`)
   * so the drawer stays the layout, not the tab implementation.
   */
  tabs?: ReactNode;
  /**
   * A SECOND COLUMN, revealed beside the body while `expanded`. Collapsed, it
   * simply follows the body. This is what `expanded` is for: measured at 880px
   * without it, one stretched column put a receipt amount ~1000px from its
   * status pill and a sub-head 689px from its own action — the control that
   * promises more room produced emptier rows. Put the record's history here.
   */
  aside?: ReactNode;
  /** Sticky footer (actions) pinned to the bottom of the panel. */
  footer?: ReactNode;
  /** Accessible name for the close control. Default `Close` — pass the screen's
   *  own language, the library will not mix one in for you. */
  closeLabel?: string;
  /** Accessible name for the expand toggle while collapsed. Default `Expand panel`. */
  expandLabel?: string;
  /** Accessible name for the expand toggle while expanded. Default `Collapse panel`. */
  collapseLabel?: string;
  /** Any valid CSS width for the panel (default 420px). */
  width?: string;
  /** Close when the scrim is clicked (default true). */
  closeOnScrim?: boolean;
  /** Close on Escape (default true). */
  closeOnEsc?: boolean;
  /** Accessible label when no visible `title` is given. */
  ariaLabel?: string;
  /** className lands on the panel; use scrimClassName for the backdrop. */
  scrimClassName?: string;
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  eyebrow,
  title,
  meta,
  actions,
  expanded = false,
  onToggleExpand,
  expandedWidth = 'min(880px, calc(100vw - var(--he-space-7)))',
  tabs,
  aside,
  footer,
  closeLabel = 'Close',
  expandLabel = 'Expand panel',
  collapseLabel = 'Collapse panel',
  width = '420px',
  closeOnScrim = true,
  closeOnEsc = true,
  ariaLabel,
  className,
  scrimClassName,
  onKeyDown,
  children,
  ...rest
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const split = expanded && aside != null;

  // Esc to close. No stopPropagation: it cannot stop a sibling document-level
  // handler anyway, and it does kill an app's own window-level Esc listener.
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  // Lock body scroll while open, and move focus into the panel.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      // Hand focus back to whatever opened the dialog. Dropping it on <body>
      // restarts a keyboard user at the top of the document (WCAG 2.4.3).
      if (opener && opener !== document.body && document.contains(opener)) opener.focus();
    };
  }, [open]);

  // Focus trap — `aria-modal="true"` promises the rest of the page is inert,
  // so Tab has to cycle inside the panel. The consumer's own onKeyDown runs
  // first and can preventDefault() to opt out.
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.key !== 'Tab' || e.defaultPrevented) return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null,
    );
    if (nodes.length === 0) {
      e.preventDefault();
      panel.focus();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cx('he-drawer', `he-drawer--${side}`, scrimClassName)}
      onMouseDown={closeOnScrim ? (e) => e.target === e.currentTarget && onClose() : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
        aria-label={title != null ? undefined : ariaLabel}
        tabIndex={-1}
        className={cx('he-drawer__panel', split && 'he-drawer__panel--split', className)}
        style={{ width: expanded ? expandedWidth : width }}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div className="he-drawer__header">
          <div className="he-drawer__heading">
            {eyebrow != null && <span className="he-drawer__eyebrow">{eyebrow}</span>}
            {title != null && (
              <div className="he-drawer__title" id={titleId}>
                {title}
              </div>
            )}
            {meta != null && <div className="he-drawer__meta">{meta}</div>}
          </div>
          <div className="he-drawer__actions">
            {onToggleExpand != null && (
              <button
                type="button"
                className="he-drawer__action"
                onClick={onToggleExpand}
                aria-expanded={expanded}
                aria-label={expanded ? collapseLabel : expandLabel}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d={
                      expanded
                        ? 'M13 3L9.5 6.5M9.5 6.5V3M9.5 6.5H13M3 13L6.5 9.5M6.5 9.5V13M6.5 9.5H3'
                        : 'M9.5 2.5H13.5V6.5M13.5 2.5L9 7M6.5 13.5H2.5V9.5M2.5 13.5L7 9'
                    }
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            {actions}
            <button type="button" className="he-drawer__close" onClick={onClose} aria-label={closeLabel}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {tabs != null && <div className="he-drawer__nav">{tabs}</div>}
        <div className="he-drawer__body">
          {aside == null ? (
            children
          ) : (
            <>
              <div className="he-drawer__main">{children}</div>
              <div className="he-drawer__aside">{aside}</div>
            </>
          )}
        </div>
        {footer != null && <div className="he-drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
