import {
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

/** Status vocabulary shared by day markers and panel rows (mirrors StatusPill). */
export type CalendarStatus = 'ok' | 'warn' | 'error' | 'neutral' | 'accent';

export interface CalendarMarker {
  status: CalendarStatus;
  label: ReactNode;
  /** Stable React key (defaults to the array index). */
  key?: string | number;
}

export interface CalendarDayContext {
  date: Date;
  /** True when the date belongs to the currently displayed month. */
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Controlled displayed month (any day within it). */
  month?: Date;
  /** Uncontrolled initial month. Defaults to `today`. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Controlled selected day. */
  selected?: Date | null;
  defaultSelected?: Date | null;
  onSelectDay?: (date: Date) => void;
  /** Reference "today" — gets the filled marker. Defaults to now. */
  today?: Date;
  /** 0 = Sunday … 6 = Saturday. Default 0. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** BCP-47 locale for month/weekday names (defaults to the runtime locale). */
  locale?: string;
  /** Markers (dot + label) rendered inside each day cell. */
  markers?: (date: Date) => CalendarMarker[];
  /** Full override of a day cell's inner content. */
  renderDay?: (ctx: CalendarDayContext) => ReactNode;
  /** Render leading/trailing days from adjacent months (default false → blanks). */
  showOutsideDays?: boolean;
  /** Label for the "jump to today" button. Default "Today". */
  todayLabel?: string;
  /** Right-aligned header slot (search, filters, export…). */
  actions?: ReactNode;
  /** Hide the header row entirely. */
  hideHeader?: boolean;
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const ChevronLeft = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
    <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
    <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Calendar({
  month,
  defaultMonth,
  onMonthChange,
  selected,
  defaultSelected = null,
  onSelectDay,
  today,
  weekStartsOn = 0,
  locale,
  markers,
  renderDay,
  showOutsideDays = false,
  todayLabel = 'Today',
  actions,
  hideHeader = false,
  className,
  ...rest
}: CalendarProps) {
  const todayDate = today ?? new Date();

  const isMonthControlled = month !== undefined;
  const [internalMonth, setInternalMonth] = useState(() =>
    startOfMonth(defaultMonth ?? month ?? todayDate),
  );
  const viewMonth = startOfMonth(isMonthControlled ? month! : internalMonth);

  const isSelectionControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<Date | null>(defaultSelected);
  const selectedDate = isSelectionControlled ? selected : internalSelected;

  const changeMonth = (next: Date) => {
    const first = startOfMonth(next);
    if (!isMonthControlled) setInternalMonth(first);
    onMonthChange?.(first);
  };

  const selectDay = (date: Date) => {
    if (!isSelectionControlled) setInternalSelected(date);
    onSelectDay?.(date);
  };

  const { cells, gridStart } = useMemo(() => {
    const firstWeekday = viewMonth.getDay();
    const lead = (firstWeekday - weekStartsOn + 7) % 7;
    const start = addDays(viewMonth, -lead);
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const total = Math.ceil((lead + daysInMonth) / 7) * 7;
    const out: Date[] = [];
    for (let i = 0; i < total; i += 1) out.push(addDays(start, i));
    return { cells: out, gridStart: start };
  }, [viewMonth, weekStartsOn]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(gridStart, i)).replace(/\.$/, ''));
  }, [locale, gridStart]);

  const monthTitle = `${new Intl.DateTimeFormat(locale, { month: 'long' }).format(viewMonth)} ${viewMonth.getFullYear()}`;

  return (
    <div className={cx('he-cal', className)} {...rest}>
      {!hideHeader && (
        <div className="he-cal__header">
          <div className="he-cal__nav">
            <button type="button" className="he-cal__today" onClick={() => changeMonth(todayDate)}>
              {todayLabel}
            </button>
            <div className="he-cal__arrows">
              <button
                type="button"
                className="he-cal__arrow"
                aria-label="Previous month"
                onClick={() => changeMonth(addMonths(viewMonth, -1))}
              >
                {ChevronLeft}
              </button>
              <button
                type="button"
                className="he-cal__arrow"
                aria-label="Next month"
                onClick={() => changeMonth(addMonths(viewMonth, 1))}
              >
                {ChevronRight}
              </button>
            </div>
            <h2 className="he-cal__title">{monthTitle}</h2>
          </div>
          {actions != null && <div className="he-cal__actions">{actions}</div>}
        </div>
      )}

      <div className="he-cal__weekdays" aria-hidden>
        {weekdayLabels.map((label, i) => (
          <div key={i} className="he-cal__weekday">
            {label}
          </div>
        ))}
      </div>

      <div className="he-cal__grid" role="grid">
        {cells.map((date) => {
          const inMonth = date.getMonth() === viewMonth.getMonth();
          if (!inMonth && !showOutsideDays) {
            return <div key={date.toISOString()} className="he-cal__day he-cal__day--blank" role="gridcell" aria-hidden />;
          }

          const isToday = isSameDay(date, todayDate);
          const isSelected = selectedDate != null && isSameDay(date, selectedDate);
          const dayMarkers = markers?.(date) ?? [];

          return (
            <button
              type="button"
              key={date.toISOString()}
              role="gridcell"
              className={cx(
                'he-cal__day',
                !inMonth && 'he-cal__day--outside',
                isToday && 'he-cal__day--today',
                isSelected && 'he-cal__day--selected',
              )}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => selectDay(date)}
            >
              {renderDay ? (
                renderDay({ date, inMonth, isToday, isSelected })
              ) : (
                <>
                  <span className={cx('he-cal__daynum', isToday && 'he-cal__daynum--today')}>
                    {date.getDate()}
                  </span>
                  {dayMarkers.length > 0 && (
                    <ul className="he-cal__markers">
                      {dayMarkers.map((marker, i) => (
                        <li
                          key={marker.key ?? i}
                          className={cx('he-cal__marker', `he-cal__marker--${marker.status}`)}
                        >
                          <span className="he-cal__marker-dot" aria-hidden />
                          <span className="he-cal__marker-label">{marker.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Day detail panel (opens when a day is clicked) ---- */

export interface CalendarPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  /** Sticky footer (e.g. pagination). */
  footer?: ReactNode;
}

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export function CalendarPanel({
  title,
  subtitle,
  onClose,
  closeLabel = 'Close',
  footer,
  className,
  children,
  ...rest
}: CalendarPanelProps) {
  const hasHeader = title != null || subtitle != null || onClose != null;
  return (
    <aside className={cx('he-cal-panel', className)} {...rest}>
      {hasHeader && (
        <header className="he-cal-panel__header">
          <div className="he-cal-panel__heading">
            {title != null && <h3 className="he-cal-panel__title">{title}</h3>}
            {subtitle != null && <p className="he-cal-panel__subtitle">{subtitle}</p>}
          </div>
          {onClose != null && (
            <button type="button" className="he-cal-panel__close" aria-label={closeLabel} onClick={onClose}>
              {CloseIcon}
            </button>
          )}
        </header>
      )}
      <div className="he-cal-panel__body">{children}</div>
      {footer != null && <div className="he-cal-panel__footer">{footer}</div>}
    </aside>
  );
}

export interface CalendarPanelRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  title: ReactNode;
  /** Secondary line under the title. */
  meta?: ReactNode;
  /** Leading status dot. */
  status?: CalendarStatus;
  /** Leading slot before the title (e.g. an Avatar). */
  leading?: ReactNode;
  /** Small trailing count/badge. */
  badge?: ReactNode;
  /** Right-aligned value (e.g. a Money amount). */
  amount?: ReactNode;
  /** Show a leading disclosure chevron. */
  expandable?: boolean;
  /** Rotate the chevron when expandable. */
  expanded?: boolean;
  /** Detail content rendered below the row when `expanded` is true. */
  details?: ReactNode;
}

export function CalendarPanelRow({
  title,
  meta,
  status,
  leading,
  badge,
  amount,
  expandable = false,
  expanded = false,
  details,
  className,
  ...rest
}: CalendarPanelRowProps) {
  const row = (
    <button
      type="button"
      className={cx('he-cal-panel__row', className)}
      aria-expanded={expandable ? expanded : undefined}
      {...rest}
    >
      {expandable && (
        <span className="he-cal-panel__row-chevron" aria-hidden>
          {ChevronRight}
        </span>
      )}
      {status != null && (
        <span className={cx('he-cal-panel__row-dot', `he-cal-panel__row-dot--${status}`)} aria-hidden />
      )}
      {leading != null && <span className="he-cal-panel__row-leading">{leading}</span>}
      <span className="he-cal-panel__row-main">
        <span className="he-cal-panel__row-title">{title}</span>
        {meta != null && <span className="he-cal-panel__row-meta">{meta}</span>}
      </span>
      {badge != null && <span className="he-cal-panel__row-badge">{badge}</span>}
      {amount != null && <span className="he-cal-panel__row-amount">{amount}</span>}
    </button>
  );

  if (details == null) return row;

  return (
    <div className={cx('he-cal-panel__row-shell', expanded && 'he-cal-panel__row-shell--expanded')}>
      {row}
      {expanded && <div className="he-cal-panel__row-details">{details}</div>}
    </div>
  );
}
