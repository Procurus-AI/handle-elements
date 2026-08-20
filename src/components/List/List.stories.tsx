import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { PageHeader } from '../PageHeader/PageHeader';
import { List, ListItem } from './List';

const meta = {
  title: 'Elements/List',
  component: List,
  argTypes: {
    variant: { control: 'inline-radio', options: ['divided', 'plain'] },
    dense: { control: 'boolean' },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

// Ranked reasons a payment stalled (reason → count).
const reasons = [
  { label: 'Missing PO number', count: 148 },
  { label: 'Disputed amount', count: 92 },
  { label: 'Awaiting approval', count: 63 },
  { label: 'Wrong remit-to', count: 41 },
  { label: 'Duplicate invoice', count: 12 },
];

export const ReasonList: Story = {
  render: (args) => (
    <Card style={{ width: 420, display: 'grid', gap: 12 }}>
      <PageHeader size="section" eyebrow="Blockers" title="Why payments stall" />
      <List {...args}>
        {reasons.map((r, i) => (
          <ListItem key={r.label} rank={i + 1} primary={r.label} value={r.count} />
        ))}
      </List>
    </Card>
  ),
};

// Top opportunities (label + secondary → amount), clickable to drill in.
const opps = [
  { name: 'Northwind Freight', owner: 'A. Ruiz', amount: '$42.0k' },
  { name: 'Cascade Logistics', owner: 'M. Chen', amount: '$31.5k' },
  { name: 'Ironclad Cargo', owner: 'A. Ruiz', amount: '$27.8k' },
  { name: 'Meridian Haul', owner: 'J. Okafor', amount: '$19.2k' },
];

export const OppList: Story = {
  render: () => (
    <Card style={{ width: 420, display: 'grid', gap: 12 }}>
      <PageHeader size="section" eyebrow="Pipeline" title="Top opportunities" />
      <List>
        {opps.map((o, i) => (
          <ListItem
            key={o.name}
            rank={i + 1}
            primary={o.name}
            secondary={`Owner · ${o.owner}`}
            value={o.amount}
            trailing={<Chevron />}
            onSelect={() => {}}
          />
        ))}
      </List>
    </Card>
  ),
};

export const Plain: Story = {
  render: () => (
    <Card style={{ width: 360 }}>
      <List variant="plain" dense>
        <ListItem primary="Reconciliations" value="1,284" />
        <ListItem primary="Overdue receipts" value="37" />
        <ListItem primary="Avg. days to bind" value="6.1" />
      </List>
    </Card>
  ),
};

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
