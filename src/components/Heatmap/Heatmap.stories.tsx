import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { Heatmap } from './Heatmap';

// Cohort retention: rows = signup month, cols = months since signup (0..5),
// values = % of that cohort still active. Later cohorts have fewer periods.
const cohortRows = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const cohortCols = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
const cohort: (number | null)[][] = [
  [100, 82, 74, 68, 61, 58],
  [100, 79, 70, 64, 59, null],
  [100, 85, 77, 71, null, null],
  [100, 80, 72, null, null, null],
  [100, 88, null, null, null, null],
  [100, null, null, null, null, null],
];

// Calendar-style activity: 7 rows (Mon..Sun) × 12 weeks of reconciliations/day.
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const activity: (number | null)[][] = days.map((_, d) =>
  Array.from({ length: 12 }, (_, w) => {
    // Weekdays busy, weekends quiet; a light deterministic wobble per week.
    const weekend = d >= 5;
    const base = weekend ? 2 : 14;
    const wobble = ((w * 7 + d * 3) % 9) - 4;
    return Math.max(0, base + wobble);
  }),
);

const meta = {
  title: 'Charts/Heatmap',
  component: Heatmap,
  args: {
    data: cohort,
    rowLabels: cohortRows,
    colLabels: cohortCols,
    showLegend: true,
    cellSize: 30,
    radius: 'sm',
    formatValue: (v: number, r: number) => `${cohortRows[r]} cohort · ${v}% retained`,
  },
  argTypes: {
    radius: { control: 'inline-radio', options: ['sm', 'md', 'full'] },
    cellSize: { control: { type: 'range', min: 8, max: 40, step: 1 } },
    gap: { control: { type: 'range', min: 0, max: 8, step: 1 } },
    showLegend: { control: 'boolean' },
    hideEmpty: { control: 'boolean' },
  },
} satisfies Meta<typeof Heatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 520, display: 'grid', gap: 28 }}>
      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader
          size="section"
          eyebrow="Intensity"
          title="Activity"
          lede="Reconciliations / day, last 12 weeks"
        />
        <Heatmap
          data={activity}
          rowLabels={days}
          cellSize={15}
          gap={3}
          radius="sm"
          max={18}
          aria-label="Reconciliations per weekday over 12 weeks"
          formatValue={(v, r) => `${days[r]}: ${v} reconciliations`}
        />
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader
          size="section"
          eyebrow="Intensity"
          title="Cohort retention"
          lede="% active by month since signup"
        />
        <Heatmap
          data={cohort}
          rowLabels={cohortRows}
          colLabels={cohortCols}
          cellSize={30}
          gap={3}
          radius="sm"
          showLegend
          aria-label="Cohort retention heatmap"
          formatValue={(v, r) => `${cohortRows[r]} cohort · ${v}% retained`}
        />
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <PageHeader
          size="section"
          eyebrow="Intensity"
          title="Compact"
          lede="Collections activity"
        />
        <Heatmap
          data={activity}
          cellSize={9}
          gap={2}
          radius="sm"
          max={18}
          aria-label="Compact collections activity"
        />
      </section>
    </Card>
  ),
};
