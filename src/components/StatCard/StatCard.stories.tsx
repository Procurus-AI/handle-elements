import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';

const meta = {
  title: 'Elements/StatCard',
  component: StatCard,
  args: {
    label: 'Premium volume',
    value: '$2.4M',
  },
  argTypes: {
    size: { control: 'select', options: ['md', 'lg'] },
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
