import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { Treemap, type TreemapDatum } from './Treemap';

/** MRR by customer (thousands). Varied so tiles range from headline to sliver. */
const mrr: TreemapDatum[] = [
  { label: 'Northwind Freight', value: 42_000, hint: '+8% QoQ' },
  { label: 'Cascade Logistics', value: 31_500, hint: '+3% QoQ' },
  { label: 'Ironclad Cargo', value: 27_800, hint: 'flat' },
  { label: 'Meridian Haul', value: 19_200, hint: '+12% QoQ' },
  { label: 'Summit Carriers', value: 15_600 },
  { label: 'Blue Ridge Move', value: 12_400 },
  { label: 'Delta Transport', value: 9_800 },
  { label: 'Apex Freightways', value: 7_300 },
  { label: 'Harbor Lines', value: 6_100 },
  { label: 'Vantage Cargo', value: 4_400 },
  { label: 'Pine State Haul', value: 3_200 },
  { label: 'Coastal Dispatch', value: 2_100 },
];

const usd = (v: number) => `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;

const meta = {
  title: 'Charts/Treemap',
  component: Treemap,
  args: { data: mrr, height: 340, colorMode: 'series', gap: 2, formatValue: usd },
  argTypes: {
    colorMode: { control: 'inline-radio', options: ['series', 'heat'] },
    height: { control: { type: 'range', min: 160, max: 520, step: 20 } },
    gap: { control: { type: 'range', min: 0, max: 8, step: 1 } },
  },
} satisfies Meta<typeof Treemap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Growth/health as heat intensity (0..1), independent of tile size. */
const health: TreemapDatum[] = mrr.map((d, i) => ({
  ...d,
  intensity: [0.9, 0.35, 0.5, 0.95, 0.7, 0.2, 0.6, 0.8, 0.3, 0.55, 0.15, 0.45][i],
}));

/** Carrier book of business by written premium (thousands). */
const premium: TreemapDatum[] = [
  { label: 'Sentinel Mutual', value: 88_000, hint: 'Property' },
  { label: 'Cornerstone P&C', value: 54_000, hint: 'Auto' },
  { label: 'Granite Underwriters', value: 33_500, hint: 'Cargo' },
  { label: 'Evergreen Specialty', value: 21_000, hint: 'Liability' },
];

const clickable: TreemapDatum[] = mrr.slice(0, 8).map((d) => ({ ...d, id: String(d.label) }));

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 640, display: 'grid', gap: 24 }}>
      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader size="section" eyebrow="Hierarchy" title="MRR by customer" lede="series" />
        <Treemap data={mrr} height={300} formatValue={usd} />
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader
          size="section"
          eyebrow="Hierarchy"
          title="Account health"
          lede="heat (colored by growth intensity)"
        />
        <Treemap data={health} height={300} colorMode="heat" formatValue={usd} />
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader size="section" eyebrow="Hierarchy" title="Carrier premium" lede="with hints" />
        <Treemap data={premium} height={220} formatValue={usd} />
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader
          size="section"
          eyebrow="Hierarchy"
          title="Clickable"
          lede="logs the selected customer"
        />
        <Treemap
          data={clickable}
          height={260}
          formatValue={usd}
          // eslint-disable-next-line no-console
          onSelect={(d, i) => console.log('selected', i, d.label, d.value)}
        />
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader
          size="section"
          eyebrow="Hierarchy"
          title="Fixed tones"
          lede="pos / neg / accent / ink"
        />
        <Treemap
          height={180}
          formatValue={usd}
          data={[
            { label: 'Won', value: 40_000, tone: 'pos', hint: 'net new' },
            { label: 'Churned', value: 14_000, tone: 'neg', hint: 'lost' },
            { label: 'Expansion', value: 22_000, tone: 'accent', hint: 'upsell' },
            { label: 'Renewals', value: 30_000, tone: 'ink', hint: 'retained' },
          ]}
        />
      </section>
    </Card>
  ),
};
