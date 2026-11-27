import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatCellTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface StatCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode;
  /** The metric, e.g. `$103,708.44`. */
  value: ReactNode;
  /** Small line under the value. */
  detail?: ReactNode;
  /** Colours the dot before the label. */
  tone?: StatCellTone;
}

/** One metric in a stat panel. 88px tall and borderless: the panel (StatStrip) supplies the border. */
export function StatCell({ label, value, detail, tone = 'neutral', className, ...rest }: StatCellProps) {
  return (
    <div className={cx('he-stat-cell', `he-stat-cell--${tone}`, className)} {...rest}>
      <span className="he-stat-cell__label">
        <span className="he-stat-cell__dot" aria-hidden />
        {label}
      </span>
      <span className="he-stat-cell__value">{value}</span>
      {detail != null && <span className="he-stat-cell__detail">{detail}</span>}
    </div>
  );
}

export type StatStripProps = HTMLAttributes<HTMLDivElement>;

/** Bordered panel that lays StatCells side by side with dividers. */
export function StatStrip({ className, ...rest }: StatStripProps) {
  return <div role="group" className={cx('he-stat-strip', className)} {...rest} />;
}
