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
  const maximumFractionDigits =
    options.maximumFractionDigits ?? defaultFractionDigits(value, compact);

  return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
    style: 'currency',
    currency: normalizeCurrency(options.currency ?? DEFAULT_CURRENCY),
    currencyDisplay: options.currencyDisplay ?? 'narrowSymbol',
    currencySign: options.accounting ? 'accounting' : 'standard',
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
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
