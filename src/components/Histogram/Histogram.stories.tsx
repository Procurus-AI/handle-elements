import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { Histogram, type HistogramBin } from './Histogram';

// Calls placed by the collections team, by hour of day (bimodal: a morning push
// and a heavier late-afternoon block before end of business).
const callsByHour: HistogramBin[] = [
  { label: '12a', value: 0 },
  { label: '1a', value: 0 },
  { label: '2a', value: 0 },
  { label: '3a', value: 0 },
  { label: '4a', value: 0 },
  { label: '5a', value: 1 },
  { label: '6a', value: 4 },
  { label: '7a', value: 12 },
  { label: '8a', value: 34 },
  { label: '9a', value: 58 },
  { label: '10a', value: 71 },
  { label: '11a', value: 63 },
  { label: '12p', value: 39 },
  { label: '1p', value: 44 },
  { label: '2p', value: 67 },
  { label: '3p', value: 82 },
  { label: '4p', value: 96 },
  { label: '5p', value: 74 },
  { label: '6p', value: 31 },
  { label: '7p', value: 12 },
  { label: '8p', value: 5 },
  { label: '9p', value: 2 },
  { label: '10p', value: 1 },
  { label: '11p', value: 0 },
];

// Days-to-pay across recently cleared invoices — right-skewed around net-30.
const daysToPay = [
  2, 3, 5, 7, 8, 9, 11, 12, 12, 14, 15, 16, 18, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 28,
  29, 29, 30, 30, 30, 30, 31, 31, 32, 33, 34, 35, 37, 38, 40, 41, 44, 46, 48, 52, 55, 58, 61, 67,
  74, 82, 90,
];

// Invoice sizes, in dollars, for a single billing cycle.
const invoiceAmounts = [
  120, 240, 310, 450, 480, 520, 610, 640, 720, 780, 810, 890, 950, 980, 1020, 1100, 1180, 1250,
  1340, 1420, 1510, 1680, 1820, 1990, 2240, 2610, 3050, 3480, 4120, 5300,
];

const meta = {
  title: 'Charts/Histogram',
  component: Histogram,
  args: {
    bins: callsByHour,
    height: 180,
    highlightPeak: true,
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'accent', 'ok', 'warn', 'error', 'neutral'],
    },
    highlightPeak: { control: 'boolean' },
    showValues: { control: 'boolean' },
    height: { control: { type: 'range', min: 80, max: 320, step: 20 } },
    labelEvery: { control: { type: 'number', min: 1 } },
  },
} satisfies Meta<typeof Histogram>;

export default meta;
type Story = StoryObj<typeof meta>;

// Calls-by-hour-of-day, 24 bins, bimodal, peak highlighted.
export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 560, display: 'grid', gap: 28 }}>
      <Section
        title="Calls by hour of day"
        caption="Pre-binned, 24 buckets — peak at 4pm before end of business"
      >
        <Histogram bins={callsByHour} height={150} />
      </Section>

      <Section
        title="Days to pay"
        caption="Raw values auto-binned — right-skewed around net-30"
      >
        <Histogram values={daysToPay} binCount={14} tone="neutral" />
      </Section>

      <Section title="Invoice size" caption="Accent tone, peak highlight off">
        <Histogram values={invoiceAmounts} binCount={12} tone="accent" highlightPeak={false} />
      </Section>

      <Section title="Calls by hour" caption="Compact with values printed above bars">
        <Histogram
          bins={callsByHour.slice(6, 20)}
          height={130}
          showValues
          labelEvery={2}
          formatValue={(v) => (v > 0 ? v : '')}
        />
      </Section>
    </Card>
  ),
};

// Titles/subtitles come from the design-system PageHeader — no bespoke markup.
function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: 'grid', gap: 14 }}>
      <PageHeader size="section" eyebrow="Distribution" title={title} lede={caption} />
      {children}
    </section>
  );
}
