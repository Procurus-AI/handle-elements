/* Hover intent for nested surfaces. A submenu that opens on the pointer's first
 * pixel is a menu that opens by accident; one that closes the instant the
 * pointer leaves the row cannot be reached diagonally. 120ms / 200ms, restarted
 * while the pointer is over either surface.
 *
 * Deliberately state-free: the open state lives in Popover, and the same
 * submenu must also be opened SYNCHRONOUSLY by ArrowRight. Tooltip's private
 * `useDelayedOpen` owns its own `open` state and therefore cannot be reused. */

import { useCallback, useEffect, useRef } from 'react';

export interface HoverIntent {
  /** Schedule the open. `immediate` fires it synchronously — used when a sibling surface is already open, so hovering a different trigger swaps with no lag. */
  enter: (immediate?: boolean) => void;
  /** Schedule the close. */
  leave: () => void;
  /** Cancel both timers — the pointer is over one of the surfaces. */
  cancel: () => void;
}

export function useHoverIntent(
  handlers: { onOpen: () => void; onClose: () => void },
  delays: { open: number; close: number },
): HoverIntent {
  // One timer: an open and a close can never be pending at once, because
  // starting either clears the other.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest-value refs so the returned callbacks are stable identities that
  // never call a stale closure.
  const latest = useRef({ handlers, delays });
  latest.current = { handlers, delays };

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const enter = useCallback(
    (immediate = false) => {
      cancel();
      if (immediate) return latest.current.handlers.onOpen();
      timer.current = setTimeout(() => latest.current.handlers.onOpen(), latest.current.delays.open);
    },
    [cancel],
  );

  const leave = useCallback(() => {
    cancel();
    timer.current = setTimeout(() => latest.current.handlers.onClose(), latest.current.delays.close);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return { enter, leave, cancel };
}
