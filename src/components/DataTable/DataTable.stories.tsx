import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Drawer } from '../Drawer/Drawer';
import { EmptyState } from '../EmptyState/EmptyState';
import { Container, Grid, Stack } from '../Layout/Layout';
import { Menu, MenuItem, MenuSeparator } from '../Menu/Menu';
import { Money } from '../Money/Money';
import { Pagination } from '../Pagination/Pagination';
import { SearchInput } from '../Input/SearchInput';
import { Sparkline } from '../Sparkline/Sparkline';
import { StatusPill } from '../StatusPill/StatusPill';
import { Switch } from '../Switch/Switch';
import { Text } from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
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
  render: () => (
    <DataTable
      caption="Account pipeline"
      captionHidden
      columns={columns}
      data={ACCOUNTS}
      minTableWidth={680}
      rowKey={(r) => r.name}
      defaultSort={{ key: 'arr', direction: 'desc' }}
    />
  ),
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

// ---- Expandable rows + quiet row actions ----
// A collections book: each policy owns one or more receipts. The row reveals a
// nested receipts table on expand, and hover surfaces the reach-out actions
// (email, WhatsApp, more) without adding chrome to the resting row. Icons are
// inline SVGs — the package ships no icon dependency.

const iconProps = { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none' as const, 'aria-hidden': true };

const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="m3 5 5 3.4L13 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhatsappIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
  </svg>
);

const MoreIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <circle cx="3.5" cy="8" r="1.3" />
    <circle cx="8" cy="8" r="1.3" />
    <circle cx="12.5" cy="8" r="1.3" />
  </svg>
);

interface Receipt {
  coverageStart: string;
  series: string;
  clause: string | null;
  endorsement: string | null;
  premium: number;
  currency: string;
  dueDate: string;
  method: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface Policy {
  id: string;
  client: string;
  policyNo: string;
  insurer: string;
  premium: number;
  currency: string;
  due: 'today' | 'soon' | 'overdue';
  receipts: Receipt[];
}

const receipt = (over: Partial<Receipt> = {}): Receipt => ({
  coverageStart: '10-09-2026',
  series: '7/12',
  clause: null,
  endorsement: null,
  premium: 6090.79,
  currency: 'MXN',
  dueDate: '10-09-2026',
  method: 'Mensual',
  status: 'pending',
  ...over,
});

const POLICIES: Policy[] = [
  {
    id: 'p1',
    client: 'Ana Lucía Flores Lugo',
    policyNo: '722349198',
    insurer: 'GNP',
    premium: 6090.79,
    currency: 'MXN',
    due: 'today',
    receipts: [
      receipt({ series: '7/12', premium: 6090.79 }),
      receipt({ series: '8/12', premium: 6090.79, dueDate: '10-10-2026', status: 'pending' }),
      receipt({ series: '6/12', premium: 6090.79, dueDate: '10-08-2026', status: 'paid' }),
    ],
  },
  {
    id: 'p2',
    client: 'Arturo Gerardo Lozano Brunswick',
    policyNo: '720297951',
    insurer: 'GNP',
    premium: 1942.44,
    currency: 'MXN',
    due: 'today',
    receipts: [receipt({ series: '1/1', premium: 1942.44, method: 'Anual' })],
  },
  {
    id: 'p3',
    client: 'Centro Educativo Nido S.C.',
    policyNo: '717262299',
    insurer: 'GNP',
    premium: 31939.86,
    currency: 'MXN',
    due: 'overdue',
    receipts: [
      receipt({ series: '2/4', premium: 15969.93, method: 'Trimestral', status: 'overdue', dueDate: '01-09-2026' }),
      receipt({ series: '3/4', premium: 15969.93, method: 'Trimestral', dueDate: '01-12-2026' }),
    ],
  },
  {
    id: 'p4',
    client: 'Daniel David Cohen Orozco',
    policyNo: '186007555',
    insurer: 'GNP',
    premium: 3131.9,
    currency: 'MXN',
    due: 'soon',
    receipts: [
      receipt({ series: '4/12', premium: 3131.9, dueDate: '15-09-2026' }),
      receipt({ series: '5/12', premium: 3131.9, dueDate: '15-10-2026' }),
    ],
  },
  {
    id: 'p5',
    client: 'Evaristo Rubio Calderón',
    policyNo: '226911089',
    insurer: 'GNP',
    premium: 713.92,
    currency: 'USD',
    due: 'today',
    receipts: [receipt({ series: '1/1', premium: 713.92, currency: 'USD', method: 'Anual' })],
  },
];

const DUE_META: Record<Policy['due'], { status: 'ok' | 'warn' | 'error'; label: string }> = {
  today: { status: 'warn', label: 'Hoy' },
  soon: { status: 'ok', label: 'Próximo' },
  overdue: { status: 'error', label: 'Vencido' },
};

const RECEIPT_STATUS: Record<Receipt['status'], { status: 'ok' | 'warn' | 'error'; label: string }> = {
  paid: { status: 'ok', label: 'Pagado' },
  pending: { status: 'warn', label: 'Pendiente' },
  overdue: { status: 'error', label: 'Vencido' },
};

/** dd-mm-yyyy → a sortable yyyymmdd number, so date columns sort chronologically. */
const dateSortValue = (d: string): number => {
  const [dd, mm, yyyy] = d.split('-');
  return Number(`${yyyy}${mm}${dd}`);
};

const mono = (v: ReactNode) => <span style={{ fontFamily: 'var(--he-font-mono)' }}>{v}</span>;

// Curated to the columns that carry signal — Cláusula / Endoso are almost always
// empty in this book, so they'd read as a column of dashes. `footer` on Serie and
// Prima total draws the <tfoot> totals row.
const receiptColumns: DataTableColumn<Receipt>[] = [
  {
    key: 'series',
    header: 'Serie',
    sortable: true,
    sortValue: (r) => Number(r.series.split('/')[0]),
    render: (r) => mono(r.series),
    footer: () => 'Total',
  },
  { key: 'coverageStart', header: 'Inicio de vigencia', sortable: true, sortValue: (r) => dateSortValue(r.coverageStart), render: (r) => mono(r.coverageStart) },
  { key: 'dueDate', header: 'Vencimiento', sortable: true, sortValue: (r) => dateSortValue(r.dueDate), render: (r) => mono(r.dueDate) },
  { key: 'method', header: 'Forma de pago', sortable: true, render: (r) => r.method },
  {
    key: 'premium',
    header: 'Prima total',
    sortable: true,
    render: (r) => <Money value={r.premium} currency={r.currency} />,
    footer: (rows) => <Money value={rows.reduce((sum, r) => sum + r.premium, 0)} currency={rows[0]?.currency ?? 'MXN'} />,
  },
  {
    key: 'status',
    header: 'Estatus',
    sortable: true,
    render: (r) => {
      const m = RECEIPT_STATUS[r.status];
      return <StatusPill status={m.status} label={m.label} appearance="soft" withDot={false} />;
    },
  },
];

/** Quiet icon action wrapped in a Tooltip. */
function RowAction({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <Tooltip content={label}>
      <Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick}>
        {children}
      </Button>
    </Tooltip>
  );
}

const policyColumns = (showAvatar: boolean): DataTableColumn<Policy>[] => [
  {
    key: 'client',
    header: 'Cliente',
    sortable: true,
    render: (r) => (
      <TableCell
        media={showAvatar ? <Avatar name={r.client} size="sm" /> : undefined}
        primary={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {r.client}
            {r.receipts.length > 1 && (
              <Badge tone="neutral" aria-label={`${r.receipts.length} recibos`}>
                {r.receipts.length}
              </Badge>
            )}
          </span>
        }
      />
    ),
  },
  {
    key: 'policyNo',
    header: 'Póliza',
    sortable: true,
    render: (r) => <span style={{ fontFamily: 'var(--he-font-mono)', color: 'var(--he-text-dim)' }}>{r.policyNo}</span>,
  },
  { key: 'insurer', header: 'Aseguradora', sortable: true, render: (r) => <Chip size="sm">{r.insurer}</Chip> },
  {
    key: 'premium',
    header: 'Prima total',
    sortable: true,
    width: '160px',
    render: (r) => <Money value={r.premium} currency={r.currency} />,
  },
  {
    key: 'due',
    header: 'Vence',
    sortable: true,
    sortValue: (r) => ({ overdue: 0, today: 1, soon: 2 })[r.due],
    width: '120px',
    render: (r) => {
      const m = DUE_META[r.due];
      return <StatusPill status={m.status} label={m.label} appearance="soft" withDot={false} />;
    },
  },
];

/**
 * The screenshot pattern, rebuilt from the kit: a policies table where each row
 * expands to its receipts (a nested `DataTable`) and carries quiet trailing
 * actions that only surface on hover / keyboard focus.
 *
 * - `renderExpanded` adds the leading chevron column and the recessed detail row.
 *   With `onRowClick` unset, the whole row toggles — click anywhere, or focus + Enter.
 * - `rowActions` pins email / WhatsApp / more to the row end, hidden until hover.
 * - `Badge` on the client counts receipts so multi-receipt rows read at a glance.
 */
export const ExpandableWithActions: Story = {
  name: 'Expandable rows + quiet actions',
  render: () => {
    const [expanded, setExpanded] = useState<Array<string | number>>(['p1']);
    const [showAvatar, setShowAvatar] = useState(true);
    return (
      <DataTable
        columns={policyColumns(showAvatar)}
        data={POLICIES}
        rowKey={(r) => r.id}
        caption="Cobranza del día"
        captionHidden
        defaultSort={{ key: 'premium', direction: 'desc' }}
        minTableWidth={760}
        expandLabel="Ver recibos"
        expandedKeys={expanded}
        onExpandedChange={setExpanded}
        toolbar={
          <>
            <Text weight="medium">Cobranza del día</Text>
            <Switch
              checked={showAvatar}
              onCheckedChange={setShowAvatar}
              label="Avatares"
              labelPosition="start"
            />
          </>
        }
        renderExpanded={(r) => (
          <Stack gap={3}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Text size="sm" weight="medium">
                Recibos
              </Text>
              <Badge tone="neutral">{r.receipts.length}</Badge>
            </span>
            <DataTable
              card={false}
              dense
              columns={receiptColumns}
              data={r.receipts}
              rowKey={(rc) => `${r.id}-${rc.series}`}
              defaultSort={{ key: 'dueDate', direction: 'asc' }}
            />
          </Stack>
        )}
        rowActions={(r) => (
          <>
            <RowAction label="Enviar correo">
              <MailIcon />
            </RowAction>
            <RowAction label="Enviar WhatsApp">
              <WhatsappIcon />
            </RowAction>
            <Menu
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Más acciones">
                  <MoreIcon />
                </Button>
              }
              label={`Acciones · ${r.client}`}
              placement="bottom-end"
            >
              <MenuItem>Ver póliza</MenuItem>
              <MenuItem>Copiar número</MenuItem>
              <MenuItem>Registrar pago</MenuItem>
              <MenuSeparator />
              <MenuItem destructive>Marcar incobrable</MenuItem>
            </Menu>
          </>
        )}
      />
    );
  },
};
