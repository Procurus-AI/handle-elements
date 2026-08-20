import type { TimeHTMLAttributes } from 'react';
import {
  formatDateTime,
  formatRelativeTime,
  isValidDate,
  toDateTimeAttribute,
  type DateInput,
  type FormatDateTimeOptions,
  type FormatRelativeTimeOptions,
} from '../../format/time';
import { cx } from '../../lib/cx';

export interface DateTextProps extends Omit<TimeHTMLAttributes<HTMLTimeElement>, 'dateTime'> {
  date: DateInput | null | undefined;
  locale?: string;
  dateStyle?: FormatDateTimeOptions['dateStyle'];
  timeStyle?: FormatDateTimeOptions['timeStyle'];
  timeZone?: string;
  variant?: 'default' | 'muted' | 'mono';
  nullLabel?: string;
}

export interface RelativeTimeProps extends Omit<TimeHTMLAttributes<HTMLTimeElement>, 'dateTime'> {
  date: DateInput | null | undefined;
  now?: FormatRelativeTimeOptions['now'];
  locale?: string;
  absoluteOnHover?: boolean;
  variant?: 'default' | 'muted' | 'mono';
  nullLabel?: string;
}

export function DateText({
  date,
  locale,
  dateStyle,
  timeStyle,
  timeZone,
  variant = 'default',
  nullLabel,
  className,
  title,
  ...rest
}: DateTextProps) {
  const text = formatDateTime(date, { locale, dateStyle, timeStyle, timeZone, nullLabel });
  const valid = isValidDate(date);

  return (
    <time
      dateTime={valid ? toDateTimeAttribute(date) : undefined}
      title={title ?? (valid ? formatDateTime(date, { locale, dateStyle: 'full', timeStyle: 'short', timeZone }) : undefined)}
      className={cx('he-date', `he-date--${variant}`, !valid && 'he-date--empty', className)}
      {...rest}
    >
      {text}
    </time>
  );
}

export function RelativeTime({
  date,
  now,
  locale,
  absoluteOnHover = true,
  variant = 'default',
  nullLabel,
  className,
  title,
  ...rest
}: RelativeTimeProps) {
  const text = formatRelativeTime(date, { now, locale, nullLabel });
  const valid = isValidDate(date);
  const absolute = valid ? formatDateTime(date, { locale, dateStyle: 'full', timeStyle: 'short' }) : undefined;

  return (
    <time
      dateTime={valid ? toDateTimeAttribute(date) : undefined}
      title={title ?? (absoluteOnHover ? absolute : undefined)}
      className={cx('he-date', `he-date--${variant}`, !valid && 'he-date--empty', className)}
      {...rest}
    >
      {text}
    </time>
  );
}
