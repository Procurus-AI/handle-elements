import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';
import { Container } from '../Layout/Layout';
import { Meter } from '../Meter/Meter';
import { PageHeader } from '../PageHeader/PageHeader';
import { Sparkline } from '../Sparkline/Sparkline';
import { StatCard, StatCardGroup, type StatCardTone } from './StatCard';

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
    tone: { control: 'select', options: [undefined, 'ok', 'warn', 'error', 'accent', 'neutral'] },
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

// The KPI strip as ONE bordered surface: 9 edges for six numbers instead of 24,
// and the recovered gutters become content width.
const KpiRail = ({ columns }: { columns?: number }) => (
  <StatCardGroup variant="rail" columns={columns}>
    <StatCard
      tone="warn"
      label="Renewals · 30 days"
      value="270"
      footer={<Badge tone="accent">$13.7M MXN exposed</Badge>}
    />
    <StatCard tone="neutral" label="Active net premium" value="$246.7M" unit="MXN" />
    <StatCard tone="neutral" label="Active policies" value="4,570" footer="of 4,592" />
    <StatCard
      tone="ok"
      label="Overdue receivable"
      value="0"
      visual={<Sparkline data={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} tone="ok" height={20} />}
    />
    <StatCard tone="ok" label="Collections" value="46%" visual={<Meter size="sm" tone="ok" value={46} />} />
    <StatCard
      tone="warn"
      label="Commissions"
      value="$835K"
      unit="MXN"
      footer={<Badge tone="warn">4 differences</Badge>}
    />
  </StatCardGroup>
);

export const Rail: Story = {
  render: () => <KpiRail columns={6} />,
};

// Narrow viewport: the auto-fit tracks wrap, the 1px gaps become horizontal
// hairlines, and the outer border stays single.
export const RailResponsive: Story = {
  render: () => (
    <Container max={480} padding={0}>
      <KpiRail />
    </Container>
  ),
};

// The dot replaces marking a tile with a coloured bar — 28px² of colour, not 180px².
export const Tones: Story = {
  render: () => (
    <StatCardGroup columns={5}>
      {(['ok', 'warn', 'error', 'accent', 'neutral'] as StatCardTone[]).map((tone) => (
        <StatCard key={tone} tone={tone} label={tone} value="128" footer="last 30 days" />
      ))}
    </StatCardGroup>
  ),
};

// `visual` is the slot for a Sparkline/Meter. `children` is a compile error —
// it used to be silently dropped, so the type now points here instead.
export const Visual: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <StatCard
        label="Collections"
        value="46%"
        delta={{ value: '6 pts', direction: 'up' }}
        visual={<Sparkline data={[28, 31, 30, 35, 39, 38, 42, 46]} variant="area" tone="ok" width={228} height={32} />}
        footer="Trailing 8 weeks"
      />
    </div>
  ),
};
