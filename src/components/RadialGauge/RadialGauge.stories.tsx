import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { RadialGauge } from './RadialGauge';

const meta = {
  title: 'Charts/RadialGauge',
  component: RadialGauge,
  args: {
    value: 68,
    variant: 'ring',
    label: 'Collections rate',
    size: 140,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ring', 'gauge'] },
    tone: { control: 'select', options: ['default', 'accent', 'ok', 'warn', 'error', 'neutral'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: { type: 'range', min: 64, max: 240, step: 4 } },
    thickness: { control: { type: 'range', min: 2, max: 24, step: 1 } },
    rounded: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
} satisfies Meta<typeof RadialGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const RingVsGauge: Story = {
  render: () => (
    <Card style={{ display: 'flex', gap: 40, alignItems: 'center', padding: 32 }}>
      <RadialGauge variant="ring" value={82} label="Reconciliation coverage" size={150} />
      <RadialGauge variant="gauge" value={82} label="Reconciliation coverage" size={150} />
    </Card>
  ),
};

export const Tones: Story = {
  render: () => (
    <Card
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 36,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <RadialGauge value={94} tone="ok" label="Collection rate" size={140} />
      <RadialGauge value={72} tone="warn" label="Capacity used" size={140} />
      <RadialGauge value={38} tone="error" label="Reconciled" size={140} />
      <RadialGauge value={61} tone="accent" label="Coverage" size={140} />
      <RadialGauge value={50} tone="neutral" label="Neutral" size={140} />
    </Card>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Card style={{ display: 'flex', gap: 32, alignItems: 'center', padding: 32 }}>
      <RadialGauge value={76} size={64} thickness={6} />
      <RadialGauge value={76} size={96} thickness={8} label="Small" />
      <RadialGauge value={76} size={160} label="Large" />
    </Card>
  ),
};

export const CustomValueLabel: Story = {
  render: () => (
    <Card style={{ display: 'flex', gap: 40, alignItems: 'center', padding: 32 }}>
      <RadialGauge
        variant="gauge"
        value={62}
        max={100}
        tone="accent"
        valueLabel="$1.2M"
        label="Collected this month"
        size={160}
      />
      <RadialGauge
        variant="ring"
        value={88}
        tone="ok"
        valueLabel="88 / 100"
        label="Invoices matched"
        size={160}
        thickness={8}
      />
    </Card>
  ),
};
