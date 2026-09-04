/* Pure overlay placement math — no DOM access, so the caller measures and this
 * stays unit-testable (and reusable by Tooltip later). */

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface PositionInput {
  trigger: Rect;
  content: { width: number; height: number };
  viewport: { width: number; height: number };
  side: PopoverSide;
  align: PopoverAlign;
  offset: number;
  /**
   * Shift along the ALIGN axis. The submenu nudges up by its own 4px block
   * padding so its FIRST ROW box lines up with the parent ROW box (measured
   * 4.5px on the reference).
   */
  crossOffset?: number;
  gutter?: number;
  matchTriggerWidth?: boolean;
}

export interface PositionResult {
  top: number;
  left: number;
  /** Side AFTER the flip decision — not necessarily the requested one. */
  side: PopoverSide;
  maxHeight: number;
  maxWidth: number;
  minWidth?: number;
}

const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const;

export function computePosition(i: PositionInput): PositionResult {
  const gutter = i.gutter ?? 8;
  const cross = i.crossOffset ?? 0;
  const horizontal = i.side === 'left' || i.side === 'right';

  const room = {
    top: i.trigger.top - i.offset - gutter,
    bottom: i.viewport.height - i.trigger.bottom - i.offset - gutter,
    left: i.trigger.left - i.offset - gutter,
    right: i.viewport.width - i.trigger.right - i.offset - gutter,
  };

  // Flip only when the preferred side cannot fit AND the other side is strictly
  // roomier, so a menu never jumps sides for no gain. The flip test compares the
  // axis-appropriate dimension — content.width for left/right, content.height
  // for top/bottom. Comparing height against horizontal room is how a side
  // placement silently runs off screen.
  const need = horizontal ? i.content.width : i.content.height;
  let side = i.side;
  if (room[side] < need && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];

  // Floor of 120px: a trigger jammed against an edge still gets a scrollable
  // stub rather than a 0px sliver. A side placement does not have to clear its
  // own trigger, so its height budget comes from the VIEWPORT, not from `room`.
  const maxHeight = Math.max(120, horizontal ? i.viewport.height - 2 * gutter : room[side]);
  const maxWidth = horizontal ? Math.max(160, room[side]) : i.viewport.width - 2 * gutter;

  // Deriving top from the CLAMPED height is what keeps a `top` placement glued
  // to its trigger when the list shrinks under a filter.
  const h = Math.min(i.content.height, maxHeight);
  const w = Math.min(i.content.width, maxWidth);

  let top: number;
  let left: number;

  if (horizontal) {
    left = side === 'left' ? i.trigger.left - w - i.offset : i.trigger.right + i.offset;
    top =
      i.align === 'center'
        ? i.trigger.top + i.trigger.height / 2 - h / 2
        : i.align === 'end'
          ? i.trigger.bottom - h
          : i.trigger.top;
    top += cross;
    // A side panel is anchored to a ROW, which can sit anywhere down the
    // viewport, so BOTH axes clamp: it slides up rather than running off screen.
    top = Math.max(gutter, Math.min(top, i.viewport.height - h - gutter));
    left = Math.max(gutter, Math.min(left, i.viewport.width - w - gutter));
  } else {
    top = side === 'top' ? i.trigger.top - h - i.offset : i.trigger.bottom + i.offset;
    left =
      i.align === 'center'
        ? i.trigger.left + i.trigger.width / 2 - w / 2
        : i.align === 'end'
          ? i.trigger.right - w
          : i.trigger.left;
    left += cross;
    left = Math.max(gutter, Math.min(left, i.viewport.width - w - gutter));
  }

  return {
    top,
    left,
    side,
    maxHeight,
    maxWidth,
    minWidth: i.matchTriggerWidth ? i.trigger.width : undefined,
  };
}
