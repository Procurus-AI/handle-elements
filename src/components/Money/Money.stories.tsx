import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Money } from './Money';
import { assertSingleCurrency, formatCurrency, sumMoney, type MoneyValue } from '../../format';

const meta = {
  title: 'Elements/Money',
  component: Money,
  args: { value: 128400, currency: 'MXN' },
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

const amounts: MoneyValue[] = [
  { value: 128400, currency: 'MXN' },
  { value: 94200, currency: 'MXN' },
  { value: 210050, currency: 'MXN' },
];

export const Playground: Story = {};

export const FinanceRows: Story = {
  render: () => {
    const total = sumMoney(amounts);
    assertSingleCurrency(amounts);

    return (
      <Card padding="none" style={{ maxWidth: 480 }}>
        <div style={{ padding: 'var(--he-space-4)', borderBottom: '1px solid var(--he-border)' }}>
          <span style={{ fontSize: 'var(--he-body-sm)', fontWeight: 600 }}>Capital calls</span>
        </div>
        <div style={{ display: 'grid' }}>
          {amounts.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--he-space-4)',
                padding: 'var(--he-space-3) var(--he-space-4)',
                borderBottom: '1px solid var(--he-border)',
              }}
            >
              <span style={{ color: 'var(--he-text-dim)' }}>Commitment {index + 1}</span>
              <Money value={item.value} currency={item.currency} showCurrencyCode />
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 'var(--he-space-4)',
              padding: 'var(--he-space-4)',
            }}
          >
            <strong>Total</strong>
            <Money value={total?.value} currency={total?.currency} showCurrencyCode />
          </div>
        </div>
      </Card>
    );
  },
};

export const Formats: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
      <Money value={128400} currency="MXN" showCurrencyCode />
      <Money value={128400} currency="USD" locale="en-US" showCurrencyCode />
      <Money value={1284000} currency="MXN" compact />
      <Money value={-4200} currency="MXN" tone="auto" accounting />
      <span>{formatCurrency(12.45, { currency: 'MXN' })}</span>
    </div>
  ),
};
