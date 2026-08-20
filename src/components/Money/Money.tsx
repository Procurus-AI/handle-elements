import { createElement, type HTMLAttributes } from 'react';
import { formatCurrency, type CurrencyDisplay } from '../../format/currency';
import { cx } from '../../lib/cx';

export type MoneyTone = 'default' | 'muted' | 'positive' | 'negative' | 'auto';

export interface MoneyProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  as?: 'span' | 'div';
  value: number | null | undefined;
  currency?: string;
  locale?: string;
  compact?: boolean;
  currencyDisplay?: CurrencyDisplay;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: Intl.NumberFormatOptions['signDisplay'];
  accounting?: boolean;
  showCurrencyCode?: boolean;
  tone?: MoneyTone;
  nullLabel?: string;
}

function resolveTone(value: number | null | undefined, tone: MoneyTone): Exclude<MoneyTone, 'auto'> {
  if (tone !== 'auto') return tone;
  if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) return 'default';
  return value > 0 ? 'positive' : 'negative';
}

export function Money({
  as = 'span',
  value,
  currency = 'MXN',
  locale,
  compact = false,
  currencyDisplay,
  minimumFractionDigits,
  maximumFractionDigits,
  signDisplay,
  accounting,
  showCurrencyCode = false,
  tone = 'default',
  nullLabel,
  className,
  ...rest
}: MoneyProps) {
  const displayed = formatCurrency(value, {
    currency,
    locale,
    compact,
    currencyDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
    accounting,
    nullLabel,
  });
  const resolvedTone = resolveTone(value, tone);
  const hasValue = typeof value === 'number' && Number.isFinite(value);

  return createElement(
    as,
    {
      className: cx(
        'he-money',
        resolvedTone !== 'default' && `he-money--${resolvedTone}`,
        !hasValue && 'he-money--empty',
        className,
      ),
      ...rest,
    },
    <>
      <span className="he-money__value">{displayed}</span>
      {showCurrencyCode && hasValue && <span className="he-money__code">{currency.toUpperCase()}</span>}
    </>,
  );
}
