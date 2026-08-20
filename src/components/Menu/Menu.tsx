import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
  matchTriggerWidth?: boolean;
  closeOnOutside?: boolean;
  closeOnEsc?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
}

export interface MenuProps extends Omit<PopoverProps, 'children'> {
  children: ReactNode;
  label?: string;
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  shortcut?: ReactNode;
  destructive?: boolean;
  onSelect?: () => void;
}

export interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

interface Position {
  top: number;
  left: number;
  minWidth?: number;
}

const MenuContext = createContext<{ close: () => void } | null>(null);

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

function getPosition(
  trigger: HTMLElement,
  content: HTMLElement | null,
  placement: PopoverPlacement,
  offset: number,
  matchTriggerWidth: boolean,
): Position {
  const rect = trigger.getBoundingClientRect();
  const contentWidth = content?.offsetWidth ?? rect.width;
  const contentHeight = content?.offsetHeight ?? 0;
  const side = placement.startsWith('top') ? 'top' : 'bottom';
  const align = placement.endsWith('start') ? 'start' : placement.endsWith('end') ? 'end' : 'center';
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const gutter = 8;

  let top = side === 'top' ? rect.top - contentHeight - offset : rect.bottom + offset;
  let left = rect.left;

  if (align === 'center') left = rect.left + rect.width / 2 - contentWidth / 2;
  if (align === 'end') left = rect.right - contentWidth;

  left = Math.max(gutter, Math.min(left, viewportWidth - contentWidth - gutter));
  top = Math.max(gutter, Math.min(top, viewportHeight - contentHeight - gutter));

  return { top, left, minWidth: matchTriggerWidth ? rect.width : undefined };
}

export function Popover({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 8,
  matchTriggerWidth = false,
  closeOnOutside = true,
  closeOnEsc = true,
  disabled = false,
  triggerClassName,
  contentClassName,
  className,
  ...rest
}: PopoverProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<Position | null>(null);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (disabled) return;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    setPosition(getPosition(triggerRef.current, contentRef.current, placement, offset, matchTriggerWidth));
  };

  useLayoutEffect(() => {
    if (!currentOpen || !isBrowser()) return;
    updatePosition();
  }, [currentOpen, placement, offset, matchTriggerWidth]);

  useEffect(() => {
    if (!currentOpen || !isBrowser()) return;
    const onUpdate = () => updatePosition();
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true);
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, [currentOpen, placement, offset, matchTriggerWidth]);

  useEffect(() => {
    if (!currentOpen || !isBrowser()) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!closeOnOutside) return;
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [currentOpen, closeOnOutside, closeOnEsc]);

  return (
    <>
      <span
        ref={triggerRef}
        className={cx('he-popover__trigger', disabled && 'he-popover__trigger--disabled', triggerClassName)}
        onClick={() => setOpen(!currentOpen)}
        aria-expanded={currentOpen}
      >
        {trigger}
      </span>
      {currentOpen &&
        isBrowser() &&
        createPortal(
          <div
            ref={contentRef}
            className={cx('he-popover', contentClassName, className)}
            style={
              {
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                minWidth: position?.minWidth,
                visibility: position == null ? 'hidden' : undefined,
              } as CSSProperties
            }
            {...rest}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

export function Menu({
  children,
  label,
  open,
  defaultOpen,
  onOpenChange,
  contentClassName,
  ...rest
}: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Popover
      open={currentOpen}
      defaultOpen={defaultOpen}
      onOpenChange={setOpen}
      contentClassName={cx('he-menu-popover', contentClassName)}
      {...rest}
    >
      <MenuContext.Provider value={{ close: () => setOpen(false) }}>
        <div className="he-menu" role="menu" aria-label={label}>
          {children}
        </div>
      </MenuContext.Provider>
    </Popover>
  );
}

export function MenuItem({
  inset = false,
  shortcut,
  destructive = false,
  className,
  children,
  onClick,
  onSelect,
  ...rest
}: MenuItemProps) {
  const menu = useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        'he-menu__item',
        inset && 'he-menu__item--inset',
        destructive && 'he-menu__item--destructive',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || rest.disabled) return;
        onSelect?.();
        menu?.close();
      }}
      {...rest}
    >
      <span className="he-menu__item-label">{children}</span>
      {shortcut != null && <span className="he-menu__shortcut">{shortcut}</span>}
    </button>
  );
}

export function MenuSeparator({ className, ...rest }: MenuSeparatorProps) {
  return <div role="separator" className={cx('he-menu__separator', className)} {...rest} />;
}

export const Dropdown = Menu;
