export type CurrencyDisplay = 'symbol' | 'narrowSymbol' | 'code' | 'name';

export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  compact?: boolean;
  currencyDisplay?: CurrencyDisplay;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: Intl.NumberFormatOptions['signDisplay'];
  accounting?: boolean;
  nullLabel?: string;
}

export interface MoneyValue {
  value: number;
  currency: string;
}

const DEFAULT_CURRENCY = 'MXN';
const DEFAULT_LOCALE = 'en-US';

function normalizeCurrency(currency: string): string {
  return currency.trim().toUpperCase();
}

function defaultFractionDigits(value: number, compact: boolean): number {
  if (compact) return 1;
  return Number.isInteger(value) || Math.abs(value) >= 100 ? 0 : 2;
}

export function formatCurrency(value: number | null | undefined, options: FormatCurrencyOptions = {}): string {
  const nullLabel = options.nullLabel ?? '—';
  if (value == null || !Number.isFinite(value)) return nullLabel;

  const compact = options.compact ?? false;
  // The default maximum is derived from the VALUE (whole pesos for integers and
  // anything over 100), so asking only for a minimum used to throw:
  // Intl rejects minimumFractionDigits > maximumFractionDigits, and
  // `<Money value={15566.23} minimumFractionDigits={2} />` took the whole render
  // down with a RangeError. A requested minimum raises the derived maximum, and
  // an explicit maximum wins over the minimum rather than throwing.
  const requestedMin = options.minimumFractionDigits ?? 0;
  const maximumFractionDigits =
    options.maximumFractionDigits ?? Math.max(defaultFractionDigits(value, compact), requestedMin);
  const minimumFractionDigits = Math.min(requestedMin, maximumFractionDigits);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    style: 'currency',
    currency: normalizeCurrency(options.currency ?? DEFAULT_CURRENCY),
    currencyDisplay: options.currencyDisplay ?? 'narrowSymbol',
    currencySign: options.accounting ? 'accounting' : 'standard',
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: options.signDisplay,
  }).format(value);
}

export function assertSingleCurrency(values: readonly MoneyValue[], label = 'money values'): string | null {
  let currency: string | null = null;

  for (const item of values) {
    const next = normalizeCurrency(item.currency);
    if (currency == null) {
      currency = next;
      continue;
    }
    if (next !== currency) {
      throw new RangeError(`Cannot combine ${label} across currencies: ${currency}, ${next}`);
    }
  }

  return currency;
}

export function sumMoney(values: readonly MoneyValue[]): MoneyValue | null {
  const currency = assertSingleCurrency(values);
  if (currency == null) return null;

  return {
    currency,
    value: values.reduce((total, item) => total + item.value, 0),
  };
}
