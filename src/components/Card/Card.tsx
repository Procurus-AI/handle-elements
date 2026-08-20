import { createElement, type HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element — use 'a' (with href via rest props) for link cards. */
  as?: 'div' | 'article' | 'section' | 'a';
  /** Hover lift + pointer cursor. */
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  href?: string;
}

export function Card({ as = 'div', clickable = false, padding = 'md', className, ...rest }: CardProps) {
  return createElement(as, {
    className: cx('he-card', clickable && 'he-card--clickable', `he-card--pad-${padding}`, className),
    ...rest,
  });
}
