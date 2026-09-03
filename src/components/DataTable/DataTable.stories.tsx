import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Drawer } from '../Drawer/Drawer';
import { EmptyState } from '../EmptyState/EmptyState';
import { Container, Grid, Stack } from '../Layout/Layout';
import { Money } from '../Money/Money';
import { Pagination } from '../Pagination/Pagination';
import { SearchInput } from '../Input/SearchInput';
import { Sparkline } from '../Sparkline/Sparkline';
import { StatusPill } from '../StatusPill/StatusPill';
import { Text } from '../Text/Text';
import { Toolbar, ToolbarGroup, ResultCount } from '../Toolbar/Toolbar';
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

export const Filterable: Story = {
  name: 'Filterable (SearchInput + globalFilter + ResultCount)',
  render: () => {
    const [q, setQ] = useState('');
    const [shown, setShown] = useState(ACCOUNTS.length);
    return (
      <DataTable
        columns={columns}
        data={ACCOUNTS}
        rowKey={(r) => r.name}
        defaultSort={{ key: 'arr', direction: 'desc' }}
        globalFilter={q}
        filterKeys={['name', 'owner', 'stage']}
        onFilteredChange={(rows) => setShown(rows.length)}
        emptyState="Sin resultados para tu búsqueda."
        toolbar={
          <Toolbar>
            <SearchInput
              value={q}
              onValueChange={setQ}
              placeholder="Buscar cuenta u owner…"
              style={{ maxWidth: 260 }}
            />
            <ToolbarGroup align="end">
              <ResultCount>
                {shown} de {ACCOUNTS.length}
              </ResultCount>
            </ToolbarGroup>
          </Toolbar>
        }
      />
    );
  },
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

// ---- Sticky header / footer / nulls / fixed widths ----
// A 50-row book built off the ACCOUNTS shape, so these stories exercise scroll
// and paging without inventing a second data model.
const LONG: Account[] = Array.from({ length: 50 }, (_, i) => {
  const seed = ACCOUNTS[i % ACCOUNTS.length];
  return {
    name: `${seed.name} ${String(i + 1).padStart(2, '0')}`,
    owner: seed.owner,
    arr: seed.arr + i * 1300,
    stage: seed.stage,
    status: seed.status,
  };
});

/**
 * `stickyHeader` + `maxHeight`: the header pins while 50 rows scroll under it,
 * and the card's rounded frame stays unbroken.
 *
 * Measured (1440×900, dense, 50 rows at 43px): scroller clientHeight 520,
 * scrollHeight 2205 — a 1685px scroll range. The `th` viewport top read 25 at
 * `scrollTop` 0, 900 and 1685, always identical to the scroller's own top: it
 * is genuinely pinned, and the card's `overflow: hidden` does not break it.
 * `position` resolves to `sticky` and the header hairline is an inset shadow,
 * not the collapsed table border (which would scroll out from under it).
 */
export const StickyScrolling: Story = {
  name: 'Sticky header (stickyHeader + maxHeight)',
  render: () => (
    <DataTable
      dense
      stickyHeader
      maxHeight={520}
      columns={columns}
      data={LONG}
      rowKey={(r) => r.name}
      defaultSort={{ key: 'arr', direction: 'desc' }}
    />
  ),
};

/**
 * The `footer` slot sits inside the card frame but OUTSIDE the `maxHeight`
 * scroller, so the pagination stays visible while the body scrolls.
 */
export const WithFooter: Story = {
  name: 'Footer (Pagination inside the card frame)',
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <DataTable
        dense
        stickyHeader
        maxHeight={520}
        columns={columns}
        data={LONG}
        rowKey={(r) => r.name}
        defaultSort={{ key: 'arr', direction: 'desc' }}
        footer={
          <Pagination
            dense
            page={page}
            pageSize={50}
            total={4592}
            onPageChange={setPage}
            pageSizeOptions={[]}
          />
        }
      />
    );
  },
};

// ---- nulls: the bug the Policies screenshot ships ----
interface Renewal {
  policy: string;
  customer: string;
  /** null = the feed carried no expiry. Nothing downstream may pretend otherwise. */
  expires: number | null;
}

const RENEWALS: Renewal[] = [
  { policy: '136041316', customer: 'Evaristo Rubio Calderon', expires: null },
  { policy: '135919983', customer: 'Gonzalo Rubio Calderon', expires: null },
  { policy: '740107602', customer: 'Dileo Sapi de C.V.', expires: 2026 },
  { policy: '739801322', customer: 'Regio Gas S.A. de C.V.', expires: 2026 },
  { policy: 'N1XL343890', customer: 'Gibran Calderon De la Mora', expires: 2093 },
  { policy: '100613512', customer: 'Maria Graciela Calderon Rojas', expires: 2095 },
];

const nullsColumns = (nulls: 'auto' | 'last'): DataTableColumn<Renewal>[] => [
  { key: 'policy', header: 'Policy no.', width: '140px' },
  { key: 'customer', header: 'Customer', truncate: true },
  {
    key: 'expires',
    header: 'Expires',
    sortable: true,
    align: 'end',
    width: '110px',
    nulls,
    sortValue: (r) => r.expires,
    render: (r) => (r.expires == null ? <Chip size="sm">Not on file</Chip> : String(r.expires)),
  },
];

/**
 * Regression test for the defect the Policies screenshot ships: rows with no
 * expiry lead a table sorted by EXPIRES.
 *
 * Click "Expires" on both tables, asc then desc. `auto` (today's behaviour)
 * flips the two "Not on file" rows from the top to the bottom; `nulls="last"`
 * keeps them at the bottom in BOTH directions. No `sortValue` sentinel can do
 * this — `r.expires ?? Infinity` is nulls-last on asc and nulls-FIRST on desc.
 */
export const NullsLast: Story = {
  name: 'nulls="last" (empty values never lead)',
  render: () => (
    <Grid columns={2} gap={5}>
      <Stack gap={3}>
        <Text size="sm" weight="medium">
          nulls="auto" — today
        </Text>
        <DataTable
          dense
          columns={nullsColumns('auto')}
          data={RENEWALS}
          rowKey={(r) => r.policy}
          defaultSort={{ key: 'expires', direction: 'asc' }}
        />
      </Stack>
      <Stack gap={3}>
        <Text size="sm" weight="medium">
          nulls="last"
        </Text>
        <DataTable
          dense
          columns={nullsColumns('last')}
          data={RENEWALS}
          rowKey={(r) => r.policy}
          defaultSort={{ key: 'expires', direction: 'asc' }}
        />
      </Stack>
    </Grid>
  ),
};

// ---- fixed widths + truncation ----
const LONG_NAME = 'Comercializadora y Distribuidora de Refacciones Automotrices del Noreste, S.A. de C.V.';

const WIDE: Account[] = [
  { ...ACCOUNTS[0], name: LONG_NAME },
  ...ACCOUNTS.slice(1),
];

const fixedColumns: DataTableColumn<Account>[] = [
  { key: 'owner', header: 'Owner', width: '120px' },
  { key: 'name', header: 'Account', truncate: true },
  { key: 'stage', header: 'Stage', width: '150px', render: (r) => <Chip size="sm">{r.stage}</Chip> },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (r) => (
      <StatusPill
        status={r.status}
        label={r.status === 'ok' ? 'Healthy' : r.status === 'warn' ? 'At risk' : 'Stalled'}
      />
    ),
  },
  { key: 'arr', header: 'ARR', align: 'end', width: '140px', render: (r) => <Money value={r.arr} currency="MXN" /> },
];

/**
 * `layout="fixed"` makes `width` binding. Measured in a 654px content column:
 * fixed renders 120/150/120/140 exactly and hands the remaining 124px to the one
 * unset column, so the 85-character account name ellipsises (cell scrollWidth
 * 534 vs clientWidth 124) and the table does not overflow — scrollWidth 654 ===
 * clientWidth 654. The `auto` copy underneath is the control: there the same
 * `width` values are only hints, the name column claims 534px and the table
 * overflows its scroller by 200px.
 *
 * The narrow `Container` is the point — at full width every column fits and the
 * two layouts are indistinguishable.
 */
export const FixedWidths: Story = {
  name: 'layout="fixed" + truncate',
  render: () => (
    <Container max={720}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Text size="sm" weight="medium">
            layout="fixed" — width is binding, the name ellipsises
          </Text>
          <DataTable dense layout="fixed" columns={fixedColumns} data={WIDE} rowKey={(r) => r.name} />
        </Stack>
        <Stack gap={3}>
          <Text size="sm" weight="medium">
            layout="auto" — the same columns, the table overflows
          </Text>
          <DataTable dense columns={fixedColumns} data={WIDE} rowKey={(r) => r.name} />
        </Stack>
      </Stack>
    </Container>
  ),
};
