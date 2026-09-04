import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/* FLIP, never clamp, along the main axis. Clamping a `top` tooltip on a short
 * viewport parks the bubble in the 8px gutter — i.e. straddling its own anchor.
 * The cross axis is still clamped: sliding sideways can't cover the anchor. */
function positionFor(anchor: HTMLElement, placement: TooltipPlacement, width = 0, height = 0): FloatingPosition {
  const rect = anchor.getBoundingClientRect();
  const offset = 8;
  const gutter = 8;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  const room: Record<TooltipPlacement, number> = {
    top: rect.top - gutter - offset,
    bottom: viewportHeight - rect.bottom - gutter - offset,
    left: rect.left - gutter - offset,
    right: viewportWidth - rect.right - gutter - offset,
  };
  const needed = placement === 'top' || placement === 'bottom' ? height : width;
  const flipped = OPPOSITE[placement];
  const side =
    room[placement] >= needed || room[placement] >= room[flipped] ? placement : flipped;

  let top: number;
  let left: number;
  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? rect.top - height - offset : rect.bottom + offset;
    left = rect.left + rect.width / 2 - width / 2;
  } else {
    top = rect.top + rect.height / 2 - height / 2;
    left = side === 'left' ? rect.left - width - offset : rect.right + offset;
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
  const delays = useRef({ openDelay, closeDelay });
  delays.current = { openDelay, closeDelay };

  const clear = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => clear, [clear]);

  const show = useCallback(() => {
    clear();
    openTimer.current = setTimeout(() => setOpen(true), delays.current.openDelay);
  }, [clear]);

  const hide = useCallback(() => {
    clear();
    closeTimer.current = setTimeout(() => setOpen(false), delays.current.closeDelay);
  }, [clear]);

  return { open, show, hide };
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
  const { hide } = floating;
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  /* NEVER position from an unmeasured bubble. `positionFor` subtracts the bubble's
   * own height for `top`/`left`/`right`, so a height of 0 on pointerEnter (the
   * portal does not exist yet) put a top-placed tooltip 8px above the ANCHOR's top
   * edge — i.e. straddling the anchor, under the cursor. Because the bubble is
   * portalled to <body> it is not a descendant of the anchor, so the anchor
   * immediately took pointerleave, the tooltip unmounted, pointerenter fired
   * again… and a `placement="top"` tooltip never became visible at all. Staying
   * `null` keeps it `visibility: hidden` for exactly one frame, until the
   * post-mount effect measures the real box. */
  const updatePosition = (event?: ReactPointerEvent<HTMLSpanElement>) => {
    if (!isBrowser()) return;
    if (followCursor && event) {
      setPosition({ top: event.clientY + 14, left: event.clientX + 14 });
      return;
    }
    const anchor = anchorRef.current;
    const bubble = contentRef.current;
    if (!anchor) return;
    if (!bubble) {
      setPosition(null);
      return;
    }
    setPosition(positionFor(anchor, placement, bubble.offsetWidth, bubble.offsetHeight));
  };

  useLayoutEffect(() => {
    if (!floating.open || followCursor) return;
    updatePosition();
  }, [floating.open, followCursor, placement]);

  /* WCAG 1.4.13: hover/focus content must be dismissible without moving focus. On
   * the collapsed rail the tooltip is the row's only visible name, so it has to be
   * possible to get it out of the way. */
  useEffect(() => {
    if (!floating.open || !isBrowser()) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [floating.open, hide]);

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

  // Same rule as Tooltip: measure first, position second (see the note above).
  const updatePosition = () => {
    const anchor = anchorRef.current;
    const bubble = contentRef.current;
    if (!isBrowser() || !anchor) return;
    if (!bubble) {
      setPosition(null);
      return;
    }
    setPosition(positionFor(anchor, placement, bubble.offsetWidth, bubble.offsetHeight));
  };

  useLayoutEffect(() => {
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
