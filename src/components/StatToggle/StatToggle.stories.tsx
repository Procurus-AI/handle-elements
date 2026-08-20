import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { StatToggle, StatToggleGroup } from './StatToggle';

const meta = {
  title: 'Elements/StatToggle',
  component: StatToggle,
  args: { label: 'Underwriting', value: 42, active: false },
  argTypes: {
    tone: { control: 'select', options: ['default', 'accent', 'ok', 'warn', 'error'] },
    active: { control: 'boolean' },
    zero: { control: 'boolean' },
  },
} satisfies Meta<typeof StatToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// "Dónde se atora" — where deals get stuck. Click a stage to filter the pipeline.
const stages = [
  { key: 'intake', label: 'Intake', value: 8 },
  { key: 'underwriting', label: 'Underwriting', value: 42, tone: 'warn' as const },
  { key: 'quote', label: 'Quote sent', value: 17 },
  { key: 'binding', label: 'Binding', value: 5, tone: 'ok' as const },
  { key: 'issued', label: 'Issued', value: 0 },
];

export const StuckToggles: Story = {
  render: () => {
    const [selected, setSelected] = useState('underwriting');
    return (
      <Card style={{ width: 620, display: 'grid', gap: 16 }}>
        <PageHeader
          size="section"
          eyebrow="Pipeline"
          title="Dónde se atora"
          lede="Deals by stage — select a bottleneck to filter."
        />
        <StatToggleGroup label="Filter by pipeline stage">
          {stages.map((s) => (
            <StatToggle
              key={s.key}
              label={s.label}
              value={s.value}
              tone={s.tone}
              active={selected === s.key}
              onClick={() => setSelected(s.key)}
            />
          ))}
        </StatToggleGroup>
      </Card>
    );
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <StatToggle label="Default" value={24} />
      <StatToggle label="Active" value={24} active />
      <StatToggle label="Zero" value={0} />
      <StatToggle label="Warn · active" value={42} tone="warn" active />
      <StatToggle label="With hint" value={17} hint="+3 this week" />
    </div>
  ),
};
