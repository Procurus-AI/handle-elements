/* Pure overlay placement math — no DOM access, so the caller measures and this
 * stays unit-testable (and reusable by Tooltip later). */

export type PopoverSide = 'top' | 'bottom';
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

export function computePosition(i: PositionInput): PositionResult {
  const gutter = i.gutter ?? 8;
  const spaceBelow = i.viewport.height - i.trigger.bottom - i.offset - gutter;
  const spaceAbove = i.trigger.top - i.offset - gutter;

  // Flip only when the preferred side cannot fit AND the other side is strictly
  // roomier, so a menu never jumps sides for no gain.
  let side = i.side;
  const want = side === 'top' ? spaceAbove : spaceBelow;
  const other = side === 'top' ? spaceBelow : spaceAbove;
  if (want < i.content.height && other > want) side = side === 'top' ? 'bottom' : 'top';

  // Floor of 120px: a trigger jammed against an edge still gets a scrollable
  // stub rather than a 0px sliver.
  const maxHeight = Math.max(120, side === 'top' ? spaceAbove : spaceBelow);

  // Deriving top from the CLAMPED height is what keeps a `top` placement glued
  // to its trigger when the list shrinks under a filter.
  const h = Math.min(i.content.height, maxHeight);
  const top = side === 'top' ? i.trigger.top - h - i.offset : i.trigger.bottom + i.offset;

  const maxWidth = i.viewport.width - 2 * gutter;
  const w = Math.min(i.content.width, maxWidth);
  let left =
    i.align === 'center'
      ? i.trigger.left + i.trigger.width / 2 - w / 2
      : i.align === 'end'
        ? i.trigger.right - w
        : i.trigger.left;
  left = Math.max(gutter, Math.min(left, i.viewport.width - w - gutter));

  return {
    top,
    left,
    side,
    maxHeight,
    maxWidth,
    minWidth: i.matchTriggerWidth ? i.trigger.width : undefined,
  };
}
