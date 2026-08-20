import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { ColumnChart, type ColumnDatum } from './ColumnChart';

// Daily reconciliations cleared, Mon–Fri across two weeks.
const daily: ColumnDatum[] = [
  { label: '08/04', values: [18] },
  { label: '08/05', values: [24] },
  { label: '08/06', values: [21] },
  { label: '08/07', values: [30] },
  { label: '08/08', values: [27] },
  { label: '08/11', values: [22] },
  { label: '08/12', values: [33] },
  { label: '08/13', values: [29] },
  { label: '08/14', values: [38] },
  { label: '08/15', values: [31] },
];

// Weekly collections funnel: accounts contacted vs. amounts recovered.
const weekly: ColumnDatum[] = [
  { label: 'W1', values: [64, 22] },
  { label: 'W2', values: [71, 28] },
  { label: 'W3', values: [58, 31] },
  { label: 'W4', values: [83, 40] },
  { label: 'W5', values: [77, 46] },
  { label: 'W6', values: [92, 55] },
];

const funnel = [
  { name: 'Contacted' },
  { name: 'Recovered', tone: 'ok' as const },
];

const meta = {
  title: 'Charts/ColumnChart',
  component: ColumnChart,
  args: {
    data: daily,
    height: 200,
    stacked: false,
    showGrid: true,
    tickCount: 4,
  },
  argTypes: {
    stacked: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    showXLabels: { control: 'boolean' },
    showYLabels: { control: 'boolean' },
    tickCount: { control: { type: 'number', min: 2, max: 8 } },
    height: { control: { type: 'number', min: 80, max: 400 } },
  },
} satisfies Meta<typeof ColumnChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 480, display: 'grid', gap: 28 }}>
      <Panel label="Grouped — contacted vs. recovered">
        <ColumnChart data={weekly} series={funnel} height={200} />
      </Panel>

      <Panel label="Stacked — same weekly funnel">
        <ColumnChart data={weekly} series={funnel} stacked height={200} />
      </Panel>

      <Panel label="Single series — daily reconciliations (accent)">
        <ColumnChart
          data={daily}
          series={[{ name: 'Reconciliations', tone: 'accent' }]}
          height={180}
        />
      </Panel>

      <Panel label="Compact — no legend, no y labels">
        <ColumnChart
          data={daily}
          series={[{ name: 'Cleared', tone: 'ink' }]}
          height={96}
          showLegend={false}
          showYLabels={false}
          showGrid={false}
        />
      </Panel>
    </Card>
  ),
};

// Titles/subtitles come from the design-system PageHeader — no bespoke markup.
function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  const [title, lede] = label.split(/\s*[—·]\s*/, 2);
  return (
    <section style={{ display: 'grid', gap: 14 }}>
      <PageHeader size="section" eyebrow="Time series" title={title} lede={lede} />
      {children}
    </section>
  );
}
