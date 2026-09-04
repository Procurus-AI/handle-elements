import { createElement, type HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type CardStatus = 'ok' | 'warn' | 'error' | 'accent' | 'neutral';

export type CardStatusVariant = 'edge' | 'none';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element — use 'a' (with href via rest props) for link cards. */
  as?: 'div' | 'article' | 'section' | 'a';
  /** Hover lift + pointer cursor. */
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  href?: string;
  /** Status of the thing the card represents (health/attention states). */
  status?: CardStatus;
  /**
   * How `status` is painted. 'edge' (default) recolors the card's OWN 1px border
   * to a desaturated status line — zero added geometry, radius respected by
   * construction. 'none' paints nothing but still exposes `data-status` +
   * --he-card-status so a child dot/pill can carry the meaning.
   *
   * There is no spine variant: a status bar at the edge of a surface is a
   * rejected pattern in this system — `edge` recolours the card's own border for
   * zero added geometry, and `none` leaves `data-status` + --he-card-status for a
   * child dot or pill.
   */
  statusVariant?: CardStatusVariant;
  /** Selected state — ink border, for pickable cards. */
  selected?: boolean;
}

export function Card({
  as = 'div',
  clickable = false,
  padding = 'md',
  status,
  statusVariant = 'edge',
  selected = false,
  className,
  ...rest
}: CardProps) {
  return createElement(as, {
    className: cx(
      'he-card',
      clickable && 'he-card--clickable',
      `he-card--pad-${padding}`,
      status && `he-card--status-${status}`,
      status && `he-card--statusvar-${statusVariant}`,
      selected && 'he-card--selected',
      className,
    ),
    ...(status ? { 'data-status': status } : {}),
    ...rest,
  });
}
