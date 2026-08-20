import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Drawer } from '../Drawer/Drawer';
import { EmptyState } from '../EmptyState/EmptyState';
import { Money } from '../Money/Money';
import { Sparkline } from '../Sparkline/Sparkline';
import { StatusPill } from '../StatusPill/StatusPill';
import { DataTable, TableCell, type DataTableColumn } from './DataTable';

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
    render: (r) => <Money value={r.arr} currency="MXN" />,
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
          <span style={{ fontSize: 'var(--he-body-sm)', fontWeight: 600, color: 'var(--he-text-dim)' }}>
            Pipeline
          </span>
          <Button size="sm" variant="secondary">
            Export
          </Button>
        </>
      }
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyState={<EmptyState size="sm" title="No accounts match your filters." hint="Try a broader saved view." />}
    />
  ),
};

export const Plain: Story = {
  name: 'Without card wrapper',
  render: () => <DataTable card={false} columns={columns} data={ACCOUNTS} rowKey={(r) => r.name} />,
};

// ---- Leaderboard: nested cells + row-click-to-drawer ----
interface Broker {
  rank: number;
  name: string;
  region: string;
  recovered: number;
  trend: number[];
  rate: number;
}

const BROKERS: Broker[] = [
  { rank: 1, name: 'Aegis Mutual', region: 'Bajío', recovered: 482000, rate: 0.91, trend: [12, 14, 15, 19, 22, 26] },
  { rank: 2, name: 'Northwind Freight', region: 'Norte', recovered: 421000, rate: 0.84, trend: [20, 18, 17, 16, 15, 14] },
  { rank: 3, name: 'Harbor P&C', region: 'Occidente', recovered: 388000, rate: 0.79, trend: [8, 10, 12, 14, 18, 21] },
  { rank: 4, name: 'Sterling Re', region: 'Sureste', recovered: 296000, rate: 0.74, trend: [14, 13, 15, 14, 16, 17] },
];

const leaderColumns: DataTableColumn<Broker>[] = [
  {
    key: 'name',
    header: 'Broker',
    sortable: true,
    render: (r) => (
      <TableCell
        media={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--he-font-mono)', color: 'var(--he-text-faint)', minWidth: '2ch', textAlign: 'right' }}>
            {r.rank}
          </span>
          <Avatar name={r.name} size="sm" />
        </span>}
        primary={r.name}
        secondary={`Región · ${r.region}`}
      />
    ),
  },
  {
    key: 'trend',
    header: '6-mo trend',
    width: '120px',
    render: (r) => <Sparkline data={r.trend} width={96} variant="area" tone={r.trend.at(-1)! >= r.trend[0] ? 'ok' : 'error'} />,
  },
  {
    key: 'rate',
    header: 'Recovery rate',
    sortable: true,
    align: 'end',
    render: (r) => <span style={{ fontFamily: 'var(--he-font-mono)' }}>{Math.round(r.rate * 100)}%</span>,
  },
  {
    key: 'recovered',
    header: 'Recovered',
    sortable: true,
    align: 'end',
    width: '150px',
    render: (r) => <Money value={r.recovered} currency="MXN" />,
  },
];

export const Leaderboard: Story = {
  name: 'Leaderboard (nested cells + row → drawer)',
  render: () => {
    const [open, setOpen] = useState<Broker | null>(null);
    return (
      <>
        <DataTable
          columns={leaderColumns}
          data={BROKERS}
          rowKey={(r) => r.name}
          defaultSort={{ key: 'recovered', direction: 'desc' }}
          onRowClick={(r) => setOpen(r)}
        />
        <Drawer open={open != null} onClose={() => setOpen(null)} title={open?.name}>
          {open && (
            <div style={{ display: 'grid', gap: 16 }}>
              <span style={{ fontFamily: 'var(--he-font-mono)', fontSize: 'var(--he-caption)', color: 'var(--he-text-dim)' }}>
                Región · {open.region}
              </span>
              <Sparkline data={open.trend} width={280} height={64} variant="area" tone="ok" marker />
              <p style={{ fontSize: 'var(--he-body-sm)', color: 'var(--he-text-dim)' }}>
                Recovery rate {Math.round(open.rate * 100)}% · click a row (or focus + Enter) to open this drawer.
              </p>
            </div>
          )}
        </Drawer>
      </>
    );
  },
};
