import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { StatusPill } from '../StatusPill/StatusPill';
import { DataTable, type DataTableColumn } from './DataTable';

const meta = {
  title: 'Elements/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  args: { columns: [], data: [] },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Account {
  name: string;
  owner: string;
  arr: number;
  stage: string;
  status: 'ok' | 'warn' | 'error';
}

const ACCOUNTS: Account[] = [
  { name: 'Northwind Capital', owner: 'A. Rivera', arr: 128000, stage: 'Closed', status: 'ok' },
  { name: 'Borealis Ventures', owner: 'M. Chen', arr: 94500, stage: 'Negotiation', status: 'warn' },
  { name: 'Midnight Holdings', owner: 'S. Okonkwo', arr: 210000, stage: 'Discovery', status: 'ok' },
  { name: 'Sandstone Partners', owner: 'J. Alvarez', arr: 41200, stage: 'Stalled', status: 'error' },
  { name: 'Meridian Group', owner: 'A. Rivera', arr: 156000, stage: 'Proposal', status: 'ok' },
];

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const columns: DataTableColumn<Account>[] = [
  { key: 'name', header: 'Account', sortable: true, render: (r) => <strong>{r.name}</strong> },
  { key: 'owner', header: 'Owner', sortable: true },
  {
    key: 'stage',
    header: 'Stage',
    sortable: true,
    render: (r) => <Chip>{r.stage}</Chip>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <StatusPill
        status={r.status}
        label={r.status === 'ok' ? 'Healthy' : r.status === 'warn' ? 'At risk' : 'Stalled'}
      />
    ),
  },
  {
    key: 'arr',
    header: 'ARR',
    sortable: true,
    align: 'end',
    width: '140px',
    render: (r) => <span style={{ fontFamily: 'var(--he-font-mono)' }}>{usd(r.arr)}</span>,
  },
];

export const Playground: Story = {
  render: () => <DataTable columns={columns} data={ACCOUNTS} rowKey={(r) => r.name} defaultSort={{ key: 'arr', direction: 'desc' }} />,
};

export const WithToolbar: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={ACCOUNTS}
      rowKey={(r) => r.name}
      onRowClick={(r) => window.alert(`Open ${r.name}`)}
      toolbar={
        <>
          <strong style={{ fontFamily: 'var(--he-font-display)', fontSize: 'var(--he-heading)' }}>Pipeline</strong>
          <Button size="sm" variant="secondary">
            Export
          </Button>
        </>
      }
    />
  ),
};

export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} emptyState="No accounts match your filters." />,
};

export const Plain: Story = {
  name: 'Without card wrapper',
  render: () => <DataTable card={false} columns={columns} data={ACCOUNTS} rowKey={(r) => r.name} />,
};
