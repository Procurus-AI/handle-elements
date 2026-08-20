import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { BarChart, type BarChartDatum } from './BarChart';

const usd = (v: number) =>
  `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// Collections booked per carrier this month.
const collections: BarChartDatum[] = [
  { label: 'Chubb', value: 482_000 },
  { label: 'The Hartford', value: 361_500 },
  { label: 'Travelers', value: 298_200 },
  { label: 'Liberty Mutual', value: 214_800 },
  { label: 'Nationwide', value: 176_400 },
  { label: 'Hiscox', value: 92_100 },
];

// MRR contribution by broker partner.
const brokers: BarChartDatum[] = [
  { label: 'Marsh McLennan', value: 128 },
  { label: 'Aon', value: 96 },
  { label: 'Gallagher', value: 71 },
  { label: 'Lockton', value: 54 },
  { label: 'HUB International', value: 38 },
];

const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  args: {
    data: collections,
    formatValue: usd,
    barSize: 'md',
    sort: 'none',
    showValue: true,
    'aria-label': 'Collections by carrier, this month',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'accent', 'ok', 'warn', 'error', 'neutral'],
    },
    barSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    sort: { control: 'inline-radio', options: ['none', 'desc', 'asc'] },
    showValue: { control: 'boolean' },
    highlightMax: { control: 'boolean' },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 420 }}>
      <BarChart {...args} />
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 460, display: 'grid', gap: 28 }}>
      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Ranking"
          title="Ranked"
          lede="Highlight leader"
        />
        <BarChart
          data={collections}
          sort="desc"
          highlightMax
          formatValue={usd}
          aria-label="Collections by carrier, ranked"
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Ranking"
          title="MRR by broker"
          lede="Accent fill"
        />
        <BarChart
          data={brokers}
          tone="accent"
          sort="desc"
          formatValue={(v) => `$${v}k`}
          aria-label="MRR by broker partner"
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Ranking"
          title="Per-row tones"
          lede="Thin bars"
        />
        <BarChart
          barSize="sm"
          formatValue={(v) => `${v}%`}
          aria-label="Reconciliation rate by carrier"
          data={[
            { label: 'Chubb', value: 98, tone: 'ok' },
            { label: 'Travelers', value: 91, tone: 'ok' },
            { label: 'Liberty Mutual', value: 74, tone: 'warn' },
            { label: 'Nationwide', value: 63, tone: 'warn' },
            { label: 'Hiscox', value: 41, tone: 'error' },
          ]}
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Ranking"
          title="Chunky bars"
          lede="Hints"
        />
        <BarChart
          barSize="lg"
          tone="neutral"
          formatValue={usd}
          aria-label="Outstanding balance by broker"
          data={[
            { label: 'Marsh McLennan', value: 51_200, hint: '14 open invoices' },
            { label: 'Aon', value: 33_900, hint: '9 open invoices' },
            { label: 'Gallagher', value: 18_400, hint: '4 open invoices' },
          ]}
        />
      </section>
    </Card>
  ),
};
