import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './StatusPill';

const meta = {
  title: 'Elements/StatusPill',
  component: StatusPill,
  args: { status: 'ok', label: 'Active' },
  argTypes: {
    status: { control: 'select', options: ['ok', 'warn', 'error', 'neutral', 'accent'] },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <StatusPill status="ok" label="Active" />
      <StatusPill status="warn" label="Pending" />
      <StatusPill status="error" label="At risk" />
      <StatusPill status="neutral" label="Archived" />
      <StatusPill status="accent" label="New" />
      <StatusPill status="ok" label="No dot" withDot={false} />
    </div>
  ),
};
