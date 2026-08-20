import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import { Sparkline } from './Sparkline';

const weekly = [12, 14, 13, 18, 16, 22, 20, 26, 24, 30, 28, 34];
const volatile = [40, 8, 52, 20, 60, 15, 48, 30, 62, 24, 70, 35];

const meta = {
  title: 'Charts/Sparkline',
  component: Sparkline,
  args: { data: weekly, width: 120, variant: 'line' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'area'] },
    tone: { control: 'select', options: ['default', 'accent', 'ok', 'warn', 'error', 'neutral'] },
    smooth: { control: 'boolean' },
    marker: { control: 'boolean' },
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Inline: Story = {
  render: () => (
    <p style={{ fontFamily: 'var(--he-font-sans)', fontSize: 15, maxWidth: 420 }}>
      Weekly reconciliations climbed to 34{' '}
      <Sparkline data={weekly} width={72} tone="ok" marker /> — up 18% over the quarter.
    </p>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 360, display: 'grid', gap: 18 }}>
      <Row label="Line"><Sparkline data={weekly} width={140} /></Row>
      <Row label="Area"><Sparkline data={weekly} width={140} variant="area" /></Row>
      <Row label="Smooth"><Sparkline data={weekly} width={140} variant="area" smooth marker /></Row>
      <Row label="Accent"><Sparkline data={weekly} width={140} variant="area" tone="accent" marker /></Row>
      <Row label="Volatile"><Sparkline data={volatile} width={140} tone="warn" baseline={35} /></Row>
      <Row label="Loss"><Sparkline data={[...weekly].reverse()} width={140} tone="error" variant="area" /></Row>
    </Card>
  ),
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <Chip variant="mono" size="sm">{label}</Chip>
      {children}
    </div>
  );
}
