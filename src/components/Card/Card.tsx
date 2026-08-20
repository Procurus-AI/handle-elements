import { createElement, type HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type CardStatus = 'ok' | 'warn' | 'error' | 'accent' | 'neutral';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element — use 'a' (with href via rest props) for link cards. */
  as?: 'div' | 'article' | 'section' | 'a';
  /** Hover lift + pointer cursor. */
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  href?: string;
  /** Status accent spine down the left edge (health/attention states). */
  status?: CardStatus;
  /** Selected state — ink border, for pickable cards. */
  selected?: boolean;
}

export function Card({
  as = 'div',
  clickable = false,
  padding = 'md',
  status,
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
      selected && 'he-card--selected',
      className,
    ),
    ...rest,
  });
}
