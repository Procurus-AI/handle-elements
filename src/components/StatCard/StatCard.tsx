import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

export type StatCardDeltaDirection = 'up' | 'down' | 'flat';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Caption above the value — rendered in mono uppercase. */
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: { value: ReactNode; direction: StatCardDeltaDirection };
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

const DELTA_GLYPH: Record<StatCardDeltaDirection, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function StatCard({ label, value, unit, delta, footer, size = 'md', className, ...rest }: StatCardProps) {
  return (
    <div className={cx('he-stat', size === 'lg' && 'he-stat--lg', className)} {...rest}>
      <span className="he-stat__label">{label}</span>
      <div className="he-stat__row">
        <span className="he-stat__value">{value}</span>
        {unit != null && <span className="he-stat__unit">{unit}</span>}
        {delta && (
          <span className={cx('he-stat__delta', `he-stat__delta--${delta.direction}`)}>
            <span aria-hidden>{DELTA_GLYPH[delta.direction]}</span>
            {delta.value}
          </span>
        )}
      </div>
      {footer != null && <div className="he-stat__footer">{footer}</div>}
    </div>
  );
}
