import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './StatusPill';

const meta = {
  title: 'Elements/StatusPill',
  component: StatusPill,
  args: { status: 'ok', label: 'Active' },
  argTypes: {
    status: { control: 'select', options: ['ok', 'warn', 'error', 'neutral', 'accent'] },
    appearance: { control: 'select', options: ['outline', 'soft'] },
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

export const Soft: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <StatusPill appearance="soft" status="ok" label="Resuelto" />
      <StatusPill appearance="soft" status="warn" label="Requiere revisión" />
      <StatusPill appearance="soft" status="error" label="Decisión humana" />
      <StatusPill appearance="soft" status="neutral" label="Informativo" />
      <StatusPill appearance="soft" status="accent" label="Nuevo" />
      <StatusPill appearance="soft" status="ok" label="Sin punto" withDot={false} />
    </div>
  ),
};
