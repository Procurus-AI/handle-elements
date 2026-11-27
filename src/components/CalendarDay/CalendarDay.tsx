import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

/** Event line tone; mirrors the status dot colours. `accent` is the brand mark, not a status. */
export type CalendarDayEventStatus = 'ok' | 'warn' | 'error' | 'neutral' | 'accent';

export interface CalendarDayEvent {
  status: CalendarDayEventStatus;
  label: ReactNode;
  /** Stable React key (defaults to the array index). */
  key?: string | number;
}

export interface CalendarDayProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The date number. Omit for the `empty` state. */
  day?: ReactNode;
  /** Today is a filled circle on the date number, never a filled cell. */
  today?: boolean;
  /** No date: a blank cell that keeps the grid whole. */
  empty?: boolean;
  /** Day from an adjacent month: the number is tertiary. */
  outside?: boolean;
  selected?: boolean;
  /** Event lines: status dot plus label. */
  events?: CalendarDayEvent[];
}

/** One cell of the month grid (Figma "Calendar day"). */
export function CalendarDay({
  day,
  today = false,
  empty = false,
  outside = false,
  selected = false,
  events,
  className,
  children,
  type = 'button',
  ...rest
}: CalendarDayProps) {
  /* A blank cell has no date and nothing to press: a disabled nameless button
   * fails button-name, so it renders as a hidden placeholder instead. */
  if (empty) {
    return (
      <div
        className={cx('he-calendar-day', 'he-calendar-day--empty', className)}
        style={rest.style}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type={type}
      className={cx(
        'he-calendar-day',
        today && 'he-calendar-day--today',
        outside && 'he-calendar-day--outside',
        selected && 'he-calendar-day--selected',
        className,
      )}
      aria-pressed={selected}
      aria-current={today ? 'date' : undefined}
      {...rest}
    >
      {children ?? (
        <>
          {!empty && day != null && (
            <span className="he-calendar-day__head">
              <span className="he-calendar-day__num">{day}</span>
            </span>
          )}
          {!empty && events != null && events.length > 0 && (
            <ul className="he-calendar-day__events">
              {events.map((event, i) => (
                <li
                  key={event.key ?? i}
                  className={cx('he-calendar-day__event', `he-calendar-day__event--${event.status}`)}
                >
                  <span className="he-calendar-day__dot" aria-hidden="true" />
                  <span className="he-calendar-day__label">{event.label}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </button>
  );
}
