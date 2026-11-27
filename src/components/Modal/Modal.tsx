import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { cx } from '../../lib/cx';

/** Everything a keyboard can land on; the trap cycles this set inside the panel. */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export type ModalSize = 'sm' | 'md' | 'lg';
export type ConfirmDialogIntent = 'default' | 'destructive';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnScrim?: boolean;
  closeOnEsc?: boolean;
  /** Accessible name when there is no visible `title`. A visible title labels the dialog by reference. */
  ariaLabel?: string;
  /** Accessible name of the header close button. Default `Close`; give it in the screen's own language. */
  closeLabel?: string;
  scrimClassName?: string;
}

export interface ConfirmDialogProps extends Omit<ModalProps, 'footer' | 'children'> {
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** `destructive` renders the confirm action with the destructive button variant. */
  intent?: ConfirmDialogIntent;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  closeOnScrim = true,
  closeOnEsc = true,
  ariaLabel,
  closeLabel = 'Cerrar',
  scrimClassName,
  className,
  onKeyDown,
  children,
  ...rest
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const hasHeader = title != null || description != null;

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

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

  // aria-modal promises the rest of the page is inert, so Tab has to cycle inside
  // the panel. The consumer's own onKeyDown runs first and can preventDefault().
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.offsetParent !== null,
    );
    if (nodes.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cx('he-modal', scrimClassName)}
      onMouseDown={closeOnScrim ? (event) => event.target === event.currentTarget && onClose() : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel == null && title != null ? titleId : undefined}
        tabIndex={-1}
        className={cx('he-modal__panel', `he-modal__panel--${size}`, className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {hasHeader && (
          <div className="he-modal__header">
            <div className="he-modal__titles">
              {title != null && (
                <div className="he-modal__title" id={titleId}>
                  {title}
                </div>
              )}
              {description != null && <div className="he-modal__description">{description}</div>}
            </div>
            <button type="button" className="he-modal__close" onClick={onClose} aria-label={closeLabel}>
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
        {children != null && <div className="he-modal__body">{children}</div>}
        {footer != null && <div className="he-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  intent = 'default',
  onConfirm,
  onCancel,
  onClose,
  children,
  ...rest
}: ConfirmDialogProps) {
  const close = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      {...rest}
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            {cancelLabel}
          </Button>
          <Button
            variant={intent === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
