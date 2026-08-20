import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';

export type DrawerSide = 'right' | 'left';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  /** Edge the panel slides in from. */
  side?: DrawerSide;
  title?: ReactNode;
  /** Sticky footer (actions) pinned to the bottom of the panel. */
  footer?: ReactNode;
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
  title,
  footer,
  width = '420px',
  closeOnScrim = true,
  closeOnEsc = true,
  ariaLabel,
  className,
  scrimClassName,
  children,
  ...rest
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc to close.
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  // Lock body scroll while open, and move focus into the panel.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

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
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        className={cx('he-drawer__panel', className)}
        style={{ width }}
        {...rest}
      >
        <div className="he-drawer__header">
          {title != null && <div className="he-drawer__title">{title}</div>}
          <button type="button" className="he-drawer__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="he-drawer__body">{children}</div>
        {footer != null && <div className="he-drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
