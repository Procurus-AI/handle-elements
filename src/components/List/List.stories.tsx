import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Grid, Stack } from '../Layout/Layout';
import { PageHeader } from '../PageHeader/PageHeader';
import { Panel } from '../Panel/Panel';
import { List, ListItem, type ListItemStatus } from './List';

const meta = {
  title: 'Elements/List',
  component: List,
  argTypes: {
    variant: { control: 'inline-radio', options: ['divided', 'plain'] },
    dense: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    gutter: { control: 'boolean' },
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

// Renewals/receipts that need a human today. Only the exceptions carry a dot —
// that is the point of the leading slot, and `gutter` keeps the rest aligned.
const attention: { id: string; customer: string; policy: string; due: string; urgency?: ListItemStatus }[] = [
  { id: 'a1', customer: 'Modelos Economicos Aho Sapi de C.V.', policy: '687457622', due: 'overdue', urgency: 'error' },
  { id: 'a2', customer: 'Regio Gas S.A. de C.V.', policy: '628515652', due: 'overdue', urgency: 'error' },
  { id: 'a3', customer: 'Juan Manuel Santillan Rodriguez', policy: '688165414', due: 'due in 1d', urgency: 'warn' },
  { id: 'a4', customer: 'Cesar Gabriel Guerra Ramon', policy: '628537110', due: 'due in 1d', urgency: 'warn' },
  { id: 'a5', customer: 'Inovek Monterrey S.A. de C.V.', policy: '570346098', due: 'due in 1d', urgency: 'warn' },
  { id: 'a6', customer: 'Cristina Peña Gonzalez', policy: '628537221', due: 'due in 4d' },
  { id: 'a7', customer: 'Transportes del Bajío S.A.', policy: '570349911', due: 'due in 6d' },
  { id: 'a8', customer: 'Grupo Alimenticio Norte', policy: '687451188', due: 'due in 9d' },
  { id: 'a9', customer: 'Maria Fernanda Olvera', policy: '628530077', due: 'due in 12d' },
  { id: 'a10', customer: 'Constructora Peninsular S.A.P.I.', policy: '570341402', due: 'due in 18d' },
  { id: 'a11', customer: 'Refacciones Industriales Meza', policy: '687459630', due: 'due in 23d' },
];

// The six fat status Cards from the dashboard hero, rebuilt with zero custom
// styling: one flush Panel, one compact List, 11 rows in the same vertical space.
export const NeedsYourAttention: Story = {
  render: () => (
    <Panel flush title="Needs your attention" lede="0 overdue receipts · 270 renewals ≤30d">
      <List variant="divided" size="sm" gutter>
        {attention.map((r) => (
          <ListItem
            key={r.id}
            href="#"
            status={r.urgency}
            primary={r.customer}
            meta={`Policy ${r.policy}`}
            value={r.due}
          />
        ))}
      </List>
    </Panel>
  ),
};

// 67px → 36px, same data, side by side.
export const Density: Story = {
  render: () => (
    <Grid columns={3} gap={4}>
      {([
        ['default', {}],
        ['dense', { dense: true }],
        ['size="sm" gutter', { size: 'sm', gutter: true }],
      ] as const).map(([caption, props]) => (
        <Stack key={caption} gap={2}>
          <Caption>{caption}</Caption>
          <Card padding="sm">
            <List variant="divided" {...props}>
              {attention.map((r) => (
                <ListItem
                  key={r.id}
                  status={r.urgency}
                  primary={r.customer}
                  meta={`Policy ${r.policy}`}
                  value={r.due}
                />
              ))}
            </List>
          </Card>
        </Stack>
      ))}
    </Grid>
  ),
};

// `meta` is the one-line slot; `secondary` is always a second line.
export const InlineMeta: Story = {
  render: () => (
    <Grid columns={2} gap={4}>
      <Stack gap={2}>
        <Caption>meta — one line</Caption>
        <Card padding="sm">
          <List size="sm" gutter>
            {attention.slice(0, 5).map((r) => (
              <ListItem key={r.id} status={r.urgency} primary={r.customer} meta={`Policy ${r.policy}`} value={r.due} />
            ))}
          </List>
        </Card>
      </Stack>
      <Stack gap={2}>
        <Caption>secondary — two lines</Caption>
        <Card padding="sm">
          <List size="sm" gutter>
            {attention.slice(0, 5).map((r) => (
              <ListItem
                key={r.id}
                status={r.urgency}
                primary={r.customer}
                secondary={`Policy ${r.policy}`}
                value={r.due}
              />
            ))}
          </List>
        </Card>
      </Stack>
    </Grid>
  ),
};

/**
 * The two sanctioned ways to mark a row, side by side.
 *
 * **Selection is a FILL** (`active`) — a `--he-surface-2` wash plus a weight step
 * on the primary. There is no spine, no bar and no accent edge anywhere in this
 * library; that pattern has been rejected four times and this story is the
 * anchor that keeps it out. **A current choice is a CHECK** in `trailing`.
 */
export const ActiveRow: Story = {
  render: () => (
    <Grid columns={2} gap={4}>
      <Stack gap={2}>
        <Caption>selection — a fill</Caption>
        <Card padding="sm">
          <List size="sm">
            {attention.slice(0, 4).map((r, i) => (
              <ListItem
                key={r.id}
                active={i === 1}
                onSelect={() => {}}
                primary={r.customer}
                secondary={`Policy ${r.policy}`}
                value={r.due}
              />
            ))}
          </List>
        </Card>
      </Stack>
      <Stack gap={2}>
        <Caption>current choice — a check</Caption>
        <Card padding="sm">
          <List size="sm">
            {['Todos los clientes', 'Solo mis clientes', 'Sin pólizas activas'].map((label, i) => (
              <ListItem
                key={label}
                onSelect={() => {}}
                primary={label}
                trailing={i === 1 ? <Check /> : undefined}
              />
            ))}
          </List>
        </Card>
      </Stack>
    </Grid>
  ),
};

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--he-font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 'var(--he-tracking-caps)',
        color: 'var(--he-text-faint)',
      }}
    >
      {children}
    </span>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
