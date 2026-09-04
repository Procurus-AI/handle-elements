import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import { cx } from '../../lib/cx';

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
  ariaLabel?: string;
  scrimClassName?: string;
}

export interface ConfirmDialogProps extends Omit<ModalProps, 'footer' | 'children'> {
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
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
  scrimClassName,
  className,
  children,
  ...rest
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        className={cx('he-modal__panel', `he-modal__panel--${size}`, className)}
        {...rest}
      >
        {(title != null || description != null) && (
          <div className="he-modal__header">
            {title != null && <div className="he-modal__title">{title}</div>}
            {description != null && <div className="he-modal__description">{description}</div>}
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
