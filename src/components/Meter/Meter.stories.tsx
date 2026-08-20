import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Meter, ProgressBar } from './Meter';

const meta = {
  title: 'Elements/Meter',
  component: Meter,
  args: { value: 64, label: 'Funded', showValue: true },
  argTypes: {
    tone: { control: 'select', options: ['default', 'accent', 'ok', 'warn', 'error', 'neutral'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Pipeline: Story = {
  render: () => (
    <Card style={{ width: 420 }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <Meter label="Committed" value={82} showValue tone="ok" />
        <Meter label="At risk" value={28} showValue tone="warn" />
        <ProgressBar label="Syncing" indeterminate tone="neutral" />
      </div>
    </Card>
  ),
};
