import { Fragment, useId, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Badge, type BadgeTone } from '../Badge/Badge';

export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Trailing count (Caption, tertiary, no dot), e.g. "Necesitan atención 24". */
  count?: ReactNode;
  /** @deprecated Kept for 0.x callers. The Figma count has no tone and ignores it. */
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
  /** Both variants render the Figma style (soft fill, no border). Kept for 0.x callers. */
  variant?: TabsVariant;
  size?: 'sm' | 'md';
  /**
   * Flow onto a second line instead of scrolling out of view. Use in narrow
   * rails, where the default scroll container hides the last tab with no
   * visible affordance.
   */
  wrap?: boolean;
}

const enabledTabs = (list: HTMLElement) =>
  Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));

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
  // Roving tabindex: the selected tab is the one tab stop; with no match, the first enabled tab.
  const stopValue = items.some((i) => i.value === value && !i.disabled)
    ? value
    : items.find((i) => !i.disabled)?.value;

  // Arrow keys move focus and select (automatic activation); Home/End jump to the ends.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const tabs = enabledTabs(event.currentTarget);
    const at = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0 || tabs.length === 0) return;
    const next =
      event.key === 'ArrowRight'
        ? tabs[(at + 1) % tabs.length]
        : event.key === 'ArrowLeft'
          ? tabs[(at - 1 + tabs.length) % tabs.length]
          : event.key === 'Home'
            ? tabs[0]
            : event.key === 'End'
              ? tabs[tabs.length - 1]
              : null;
    if (!next) return;
    event.preventDefault();
    next.focus();
    next.click();
  };
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
      onKeyDown={onKeyDown}
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
              tabIndex={item.value === stopValue ? 0 : -1}
              disabled={item.disabled}
              className={cx('he-tab', item.value === value && 'he-tab--active')}
              onClick={() => onChange?.(item.value)}
            >
              <span className="he-tab__label">{item.label}</span>
              {item.count != null && (
                <span className="he-tab__count">{item.count}</span>
              )}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
