import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Wrap controls onto multiple rows on narrow widths (default true). */
  wrap?: boolean;
}

/**
 * Horizontal control bar — pair a `SearchInput` and filter `Select`s with a
 * right-aligned `ToolbarGroup align="end"` for a `ResultCount`. Drops into
 * `DataTable`'s `toolbar` slot or sits above a table.
 */
export function Toolbar({ wrap = true, className, children, ...rest }: ToolbarProps) {
  return (
    <div className={cx('he-toolbar', wrap && 'he-toolbar--wrap', className)} role="toolbar" {...rest}>
      {children}
    </div>
  );
}

export interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `end` pushes the group to the far side of the bar. */
  align?: 'start' | 'end';
}

export function ToolbarGroup({ align = 'start', className, ...rest }: ToolbarGroupProps) {
  return (
    <div
      className={cx('he-toolbar__group', align === 'end' && 'he-toolbar__group--end', className)}
      {...rest}
    />
  );
}

export interface ResultCountProps extends HTMLAttributes<HTMLSpanElement> {}

/** Quiet mono count summary, e.g. `<ResultCount>{shown} de {total}</ResultCount>`. */
export function ResultCount({ className, ...rest }: ResultCountProps) {
  return <span className={cx('he-toolbar__count', className)} {...rest} />;
}
