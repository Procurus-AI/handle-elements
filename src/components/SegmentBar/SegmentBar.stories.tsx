import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { SegmentBar } from './SegmentBar';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// Premium split by line of business (categorical series colors).
const premium = [
  { label: 'Property', value: 4200000 },
  { label: 'Casualty', value: 2600000 },
  { label: 'Marine', value: 1400000 },
  { label: 'Aviation', value: 800000 },
];

// Collections status → status tones.
const collections = [
  { label: 'Paid', value: 68, tone: 'ok' as const },
  { label: 'Pending', value: 22, tone: 'warn' as const },
  { label: 'Overdue', value: 10, tone: 'error' as const },
];

const meta = {
  title: 'Charts/SegmentBar',
  component: SegmentBar,
  args: {
    segments: premium,
    size: 'md',
    rounded: true,
    showLegend: true,
    showPercent: true,
    gap: true,
    formatValue: usd,
    'aria-label': 'Gross written premium by line of business',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    rounded: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    showPercent: { control: 'boolean' },
    gap: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
} satisfies Meta<typeof SegmentBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 420, display: 'grid', gap: 28 }}>
      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader size="section" eyebrow="Composition" title="Series palette" />
        <SegmentBar
          segments={premium}
          formatValue={usd}
          aria-label="Premium by line of business"
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader size="section" eyebrow="Composition" title="Status tones" />
        <SegmentBar
          segments={collections}
          formatValue={(n) => `${n}%`}
          aria-label="Collections status"
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Composition"
          title="Remaining capacity"
          lede="Total exceeds the sum"
        />
        <SegmentBar
          segments={[
            { label: 'Bound', value: 62, tone: 'accent' },
            { label: 'Quoted', value: 18, tone: 'neutral' },
          ]}
          total={100}
          formatValue={(n) => `${n}M`}
          aria-label="Capacity utilization out of 100M"
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader size="section" eyebrow="Composition" title="Thin, no legend" />
        <SegmentBar segments={premium} size="sm" showLegend={false} aria-label="Premium mix" />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Composition"
          title="Large, square ends, no gaps"
        />
        <SegmentBar
          segments={collections}
          size="lg"
          rounded={false}
          gap={false}
          formatValue={(n) => `${n}%`}
          aria-label="Collections status"
        />
      </section>
    </Card>
  ),
};
