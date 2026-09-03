import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  followCursor?: boolean;
  contentClassName?: string;
}

export interface HoverCardProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  openDelay?: number;
  closeDelay?: number;
  width?: CSSProperties['width'];
  contentClassName?: string;
}

interface FloatingPosition {
  top: number;
  left: number;
}

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

function positionFor(anchor: HTMLElement, placement: TooltipPlacement, width = 0, height = 0): FloatingPosition {
  const rect = anchor.getBoundingClientRect();
  const offset = 8;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const gutter = 8;

  let top = rect.top - height - offset;
  let left = rect.left + rect.width / 2 - width / 2;

  if (placement === 'bottom') top = rect.bottom + offset;
  if (placement === 'right') {
    top = rect.top + rect.height / 2 - height / 2;
    left = rect.right + offset;
  }
  if (placement === 'left') {
    top = rect.top + rect.height / 2 - height / 2;
    left = rect.left - width - offset;
  }

  return {
    top: Math.max(gutter, Math.min(top, viewportHeight - height - gutter)),
    left: Math.max(gutter, Math.min(left, viewportWidth - width - gutter)),
  };
}

function useDelayedOpen(openDelay: number, closeDelay: number) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => clear, []);

  return {
    open,
    show: () => {
      clear();
      openTimer.current = setTimeout(() => setOpen(true), openDelay);
    },
    hide: () => {
      clear();
      closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
    },
  };
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 250,
  disabled = false,
  followCursor = false,
  contentClassName,
  className,
  ...rest
}: TooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const floating = useDelayedOpen(delay, 0);
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const updatePosition = (event?: ReactPointerEvent<HTMLSpanElement>) => {
    if (!isBrowser()) return;
    if (followCursor && event) {
      setPosition({ top: event.clientY + 14, left: event.clientX + 14 });
      return;
    }
    if (!anchorRef.current) return;
    setPosition(
      positionFor(
        anchorRef.current,
        placement,
        contentRef.current?.offsetWidth ?? 0,
        contentRef.current?.offsetHeight ?? 0,
      ),
    );
  };

  useEffect(() => {
    if (!floating.open || followCursor) return;
    updatePosition();
  }, [floating.open, followCursor, placement]);

  return (
    <>
      <span
        ref={anchorRef}
        className={cx('he-tooltip-anchor', className)}
        onPointerEnter={(event) => {
          if (disabled) return;
          updatePosition(event);
          floating.show();
        }}
        onPointerMove={(event) => {
          if (floating.open) updatePosition(event);
        }}
        onPointerLeave={floating.hide}
        onFocus={() => {
          if (disabled) return;
          updatePosition();
          floating.show();
        }}
        onBlur={floating.hide}
        {...rest}
      >
        {children}
      </span>
      {/* A shared anchor (charts hand one Tooltip the whole plot) can be hovered
        * with nothing under the cursor — never portal an empty bubble. */}
      {floating.open &&
        content != null &&
        content !== false &&
        isBrowser() &&
        createPortal(
          <div
            ref={contentRef}
            role="tooltip"
            className={cx('he-tooltip', contentClassName)}
            style={
              {
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                visibility: position == null ? 'hidden' : undefined,
              } as CSSProperties
            }
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

export function HoverCard({
  content,
  children,
  placement = 'bottom',
  openDelay = 150,
  closeDelay = 120,
  width = 280,
  contentClassName,
  className,
  ...rest
}: HoverCardProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const floating = useDelayedOpen(openDelay, closeDelay);
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const updatePosition = () => {
    if (!isBrowser() || !anchorRef.current) return;
    setPosition(
      positionFor(
        anchorRef.current,
        placement,
        (contentRef.current?.offsetWidth ?? Number(width)) || 0,
        contentRef.current?.offsetHeight ?? 0,
      ),
    );
  };

  useEffect(() => {
    if (floating.open) updatePosition();
  }, [floating.open, placement, width]);

  return (
    <>
      <span
        ref={anchorRef}
        className={cx('he-hover-card-anchor', className)}
        onPointerEnter={() => {
          updatePosition();
          floating.show();
        }}
        onPointerLeave={floating.hide}
        onFocus={() => {
          updatePosition();
          floating.show();
        }}
        onBlur={floating.hide}
        {...rest}
      >
        {children}
      </span>
      {floating.open &&
        isBrowser() &&
        createPortal(
          <div
            ref={contentRef}
            role="dialog"
            className={cx('he-hover-card', contentClassName)}
            style={
              {
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                width,
                visibility: position == null ? 'hidden' : undefined,
              } as CSSProperties
            }
            onPointerEnter={floating.show}
            onPointerLeave={floating.hide}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
