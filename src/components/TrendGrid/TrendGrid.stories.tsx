import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { TrendGrid, type TrendGridItem } from './TrendGrid';

// Per-product weekly usage (sessions, in thousands) — oldest → newest.
const products: TrendGridItem[] = [
  { label: 'Reconcile', data: [12, 14, 13, 18, 17, 22, 21, 26] },
  { label: 'Recoveries', data: [40, 38, 42, 39, 44, 41, 48, 52] },
  { label: 'Statements', data: [22, 24, 23, 21, 20, 19, 18, 17] },
  { label: 'Payments', data: [8, 9, 11, 10, 13, 15, 14, 19] },
  { label: 'Ledger', data: [30, 31, 29, 33, 34, 33, 36, 38] },
  { label: 'Alerts', data: [50, 44, 46, 40, 38, 35, 33, 30] },
];

// Per-carrier recovery rate (%) over the last 8 weeks.
const carriers: TrendGridItem[] = [
  { label: 'Aegis Mutual', data: [61, 63, 62, 66, 68, 70, 72, 75], value: '75%' },
  { label: 'Northwind', data: [58, 57, 59, 56, 55, 54, 52, 51], value: '51%' },
  { label: 'Harbor P&C', data: [44, 46, 48, 47, 50, 53, 55, 58], value: '58%' },
  { label: 'Sterling Re', data: [70, 71, 70, 72, 71, 73, 74, 74], value: '74%' },
];

// Per-broker activity (deals touched / week) with explicit deltas.
const brokers: TrendGridItem[] = [
  { label: 'M. Okonkwo', data: [18, 20, 19, 24, 26, 28, 27, 31], delta: 14, value: '31' },
  { label: 'S. Alvarez', data: [42, 40, 41, 38, 37, 35, 34, 33], delta: -9, value: '33' },
  { label: 'J. Park', data: [12, 13, 15, 14, 16, 18, 17, 20], delta: 22, value: '20' },
  { label: 'R. Devi', data: [28, 28, 29, 28, 27, 28, 29, 28], delta: 0, value: '28' },
];

const meta = {
  title: 'Charts/TrendGrid',
  component: TrendGrid,
  parameters: { layout: 'padded' },
  args: {
    items: products,
    variant: 'area',
    smooth: true,
    showDelta: true,
    deltaTone: 'auto',
    sparkHeight: 32,
    minCellWidth: 140,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'area'] },
    deltaTone: { control: 'inline-radio', options: ['auto', 'none'] },
    smooth: { control: 'boolean' },
    showDelta: { control: 'boolean' },
    columns: { control: { type: 'number', min: 1, max: 6 } },
    sparkHeight: { control: { type: 'range', min: 20, max: 64, step: 2 } },
    minCellWidth: { control: { type: 'range', min: 100, max: 240, step: 10 } },
  },
} satisfies Meta<typeof TrendGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
      <Card>
        <section style={{ display: 'grid', gap: 20 }}>
          <PageHeader
            size="section"
            eyebrow="Small multiples"
            title="Product usage — weekly trend"
            lede="Auto-computed delta, colored by sign."
          />
          <TrendGrid items={products} />
        </section>
      </Card>

      <Card>
        <section style={{ display: 'grid', gap: 20 }}>
          <PageHeader
            size="section"
            eyebrow="Small multiples"
            title="Carrier recovery rate"
            lede="Fixed two-column layout."
          />
          <TrendGrid items={carriers} columns={2} />
        </section>
      </Card>

      <Card>
        <section style={{ display: 'grid', gap: 20 }}>
          <PageHeader
            size="section"
            eyebrow="Small multiples"
            title="Broker activity — deals / week"
            lede="Clickable cells (lift on hover, keyboard accessible)."
          />
          <TrendGrid
            items={brokers}
            onSelect={(item, i) => console.log('selected', item.label, i)}
          />
        </section>
      </Card>

      <Card>
        <section style={{ display: 'grid', gap: 20 }}>
          <PageHeader
            size="section"
            eyebrow="Small multiples"
            title="Product usage — line variant"
            lede="Line sparklines, neutral delta tone."
          />
          <TrendGrid items={products} variant="line" deltaTone="none" />
        </section>
      </Card>
    </div>
  ),
};
