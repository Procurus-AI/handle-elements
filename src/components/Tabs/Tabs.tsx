import { Fragment, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Badge, type BadgeTone } from '../Badge/Badge';

export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Trailing count badge (e.g. filter tabs: "Necesitan atención 24"). */
  count?: ReactNode;
  /** Tone for the count badge (default neutral). */
  countTone?: BadgeTone;
  /** Start a new group before this tab with a vertical hairline. */
  divider?: boolean;
  /**
   * Caption sitting in that hairline as a filled marker — "Beta", "Preview".
   * Implies `divider`. It labels the group that starts here and runs until the
   * next divider, so those tabs reference it as their accessible description.
   */
  dividerLabel?: ReactNode;
  /** Marker tone. Defaults to `accent` — Borealis fill, midnight text. */
  dividerTone?: BadgeTone;
}

export type TabsVariant = 'underline' | 'pills';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  /** `underline` for page-level nav, `pills` for filter rows. */
  variant?: TabsVariant;
  size?: 'sm' | 'md';
  /**
   * Flow onto a second line instead of scrolling out of view. Use in narrow
   * rails, where the default scroll container hides the last tab with no
   * visible affordance.
   */
  wrap?: boolean;
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'underline',
  size = 'md',
  wrap = false,
  className,
  ...rest
}: TabsProps) {
  const groupId = useId();
  // The marker in scope for the current group, carried forward from the last
  // labelled divider so every tab after it inherits the description.
  let describedBy: string | undefined;

  return (
    <div
      role="tablist"
      className={cx(
        'he-tabs',
        `he-tabs--${variant}`,
        size === 'sm' && 'he-tabs--sm',
        wrap && 'he-tabs--wrap',
        className,
      )}
      {...rest}
    >
      {items.map((item, i) => {
        const hasDivider = item.divider || item.dividerLabel != null;
        if (hasDivider) {
          describedBy = item.dividerLabel != null ? `${groupId}-${i}` : undefined;
        }
        return (
          <Fragment key={item.value}>
            {hasDivider && (
              <span className="he-tabs__divider" role="presentation">
                <span className="he-tabs__rule" aria-hidden="true" />
                {item.dividerLabel != null && (
                  <Badge
                    id={describedBy}
                    size="sm"
                    tone={item.dividerTone ?? 'accent'}
                    className="he-tabs__marker"
                  >
                    {item.dividerLabel}
                  </Badge>
                )}
              </span>
            )}
            <button
              type="button"
              role="tab"
              aria-selected={item.value === value}
              aria-describedby={describedBy}
              disabled={item.disabled}
              className={cx('he-tab', item.value === value && 'he-tab--active')}
              onClick={() => onChange?.(item.value)}
            >
              <span className="he-tab__label">{item.label}</span>
              {item.count != null && (
                <Badge size="sm" tone={item.countTone ?? 'neutral'} className="he-tab__count">
                  {item.count}
                </Badge>
              )}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
