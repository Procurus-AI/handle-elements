import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { StatCard } from './StatCard';

const meta = {
  title: 'Elements/StatCard',
  component: StatCard,
  args: {
    label: 'Premium volume',
    value: '$2.4M',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['card', 'plain'] },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      <StatCard label="Policies in force" value="1,284" delta={{ value: '4.2%', direction: 'up' }} />
      <StatCard label="Overdue receipts" value="37" delta={{ value: '12', direction: 'down' }} />
      <StatCard label="Avg. days to bind" value="6.1" unit="days" delta={{ value: '0', direction: 'flat' }} />
      <StatCard
        label="Renewal rate"
        value="93%"
        size="lg"
        footer="Trailing 12 months across all carriers"
      />
    </div>
  ),
};

// Borderless stats nested inside a panel Card — no cards-in-cards. A hero metric
// (reachRate) plus a cluster of mini stats (Calidad / Cuellos).
export const NestedInPanel: Story = {
  render: () => (
    <Card style={{ width: 520, display: 'grid', gap: 20 }}>
      <PageHeader size="section" eyebrow="Cobranza" title="Alcance semanal" />
      <StatCard variant="plain" size="lg" label="Reach rate" value="72%" delta={{ value: '6 pts', direction: 'up' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <StatCard variant="plain" size="sm" label="Calidad" value="4.6" unit="/5" />
        <StatCard variant="plain" size="sm" label="Cuellos" value="12" delta={{ value: '3', direction: 'down' }} />
        <StatCard variant="plain" size="sm" label="Reintentos" value="88%" />
      </div>
    </Card>
  ),
};
