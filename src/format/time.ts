export type DateInput = Date | string | number;

export interface FormatDateTimeOptions {
  locale?: string;
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
  timeZone?: string;
  nullLabel?: string;
}

export interface FormatRelativeTimeOptions {
  now?: DateInput;
  locale?: string;
  nullLabel?: string;
}

const DEFAULT_LOCALE = 'es-MX';
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNITS = [
  { limit: MINUTE, size: SECOND, es: 's', en: 's' },
  { limit: HOUR, size: MINUTE, es: 'min', en: 'm' },
  { limit: DAY, size: HOUR, es: 'h', en: 'h' },
  { limit: WEEK, size: DAY, es: 'd', en: 'd' },
  { limit: MONTH, size: WEEK, es: 'sem', en: 'w' },
  { limit: YEAR, size: MONTH, es: 'm', en: 'mo' },
  { limit: Infinity, size: YEAR, es: 'a', en: 'y' },
];

export function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

export function isValidDate(input: DateInput | null | undefined): input is DateInput {
  if (input == null) return false;
  return !Number.isNaN(toDate(input).getTime());
}

export function toDateTimeAttribute(input: DateInput): string | undefined {
  if (!isValidDate(input)) return undefined;
  return toDate(input).toISOString();
}

export function formatDateTime(input: DateInput | null | undefined, options: FormatDateTimeOptions = {}): string {
  const nullLabel = options.nullLabel ?? '—';
  if (!isValidDate(input)) return nullLabel;

  return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
    dateStyle: options.dateStyle ?? 'medium',
    timeStyle: options.timeStyle,
    timeZone: options.timeZone,
  }).format(toDate(input));
}

export function formatRelativeTime(input: DateInput | null | undefined, options: FormatRelativeTimeOptions = {}): string {
  const nullLabel = options.nullLabel ?? '—';
  if (!isValidDate(input)) return nullLabel;

  const now = isValidDate(options.now) ? toDate(options.now) : new Date();
  const diff = toDate(input).getTime() - now.getTime();
  const abs = Math.abs(diff);

  if (abs < 30 * SECOND) {
    return (options.locale ?? DEFAULT_LOCALE).startsWith('es') ? 'ahora' : 'now';
  }

  const unit = UNITS.find((candidate) => abs < candidate.limit) ?? UNITS[UNITS.length - 1];
  const amount = Math.max(1, Math.round(abs / unit.size));
  const es = (options.locale ?? DEFAULT_LOCALE).startsWith('es');
  const suffix = es ? unit.es : unit.en;

  if (diff < 0) return es ? `hace ${amount}${suffix}` : `${amount}${suffix} ago`;
  return es ? `en ${amount}${suffix}` : `in ${amount}${suffix}`;
}
