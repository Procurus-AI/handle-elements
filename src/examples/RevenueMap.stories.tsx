import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';

import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { Container, Divider, Grid, Stack } from '../components/Layout/Layout';
import { Drawer } from '../components/Drawer/Drawer';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Money } from '../components/Money/Money';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Select } from '../components/Input/Select';
import { StatusPill } from '../components/StatusPill/StatusPill';
import { Tabs } from '../components/Tabs/Tabs';
import { Text } from '../components/Text/Text';
import { Toolbar, ToolbarGroup } from '../components/Toolbar/Toolbar';
import { Treemap, type TreemapDatum } from '../components/Treemap/Treemap';

/**
 * "Revenue Map" — a pipeline board rebuilt from another app entirely with Handle
 * Elements and ZERO custom styling. Every account is a treemap tile sized by its
 * monthly revenue and colored by health: `pos` (green · active), `neg` (pink · at
 * risk), `ink` (dark · no metric). Clicking any tile opens a `Drawer` with that
 * account's triage detail — badges, tabs, enabled products, and outstanding
 * items — all composed from library elements. Nothing here is an inline style.
 *
 * Numbers are illustrative; stage totals match the source snapshot ($30,145 / $14,455).
 */
const meta = {
  title: 'Examples/Revenue Map',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ sample data */

type Health = 'active' | 'risk' | 'none';

/** Map account health → a Treemap tone (green / pink / dark). */
const TONE: Record<Health, TreemapDatum['tone']> = {
  active: 'pos',
  risk: 'neg',
  none: 'ink',
};

type ItemKind = 'bug' | 'request';
type Priority = 'high' | 'med' | 'low';

type Item = {
  kind: ItemKind;
  priority: Priority;
  status?: string;
  title: string;
  body: string;
  product: string;
  date: string;
};

type Account = {
  label: string;
  value: number;
  health: Health;
  owner: string;
  type: 'customer' | 'lead';
  note: string;
  enabled: { name: string; live: boolean }[];
  notEnabled?: string;
  items: Item[];
};

const toTile = (a: Account): TreemapDatum => ({
  id: a.label,
  label: a.label,
  value: a.value,
  tone: TONE[a.health],
  hint: a.owner,
});

/** The one fully-authored account, matching the reference drawer screenshot. */
const INVENTA_ITEMS: Item[] = [
  {
    kind: 'bug', priority: 'high', status: 'In progress', date: 'May 19',
    title: 'Validator reports full of errors, low portal progress',
    body:
      'The daily payment-validator reports showed many errors and very little portal progress (screenshots May 13 and May 18). Handle’s engineer is investigating; by May 19 the customer noted fewer errors, so it’s actively being worked but not yet confirmed resolved.',
    product: 'Payment Validation',
  },
  {
    kind: 'request', priority: 'high', date: 'Jun 2',
    title: 'Feed validator output into COPSIS system',
    body:
      'Pablo asked how to feed what the payment-validator already produces directly into their COPSIS core system. Raised Jun 2; Handle responded only by proposing a call, so it remains open.',
    product: 'Payment Validation',
  },
  {
    kind: 'request', priority: 'med', date: 'Jun 2',
    title: 'Split new business vs renewals, identify by line',
    body:
      'Brian asked that the validator output separate new business from renewals and identify each policy by ramo (line of business). Raised as still-pending on Jun 2, the latest message.',
    product: 'Payment Validation',
  },
  {
    kind: 'request', priority: 'med', date: 'May 8',
    title: 'Monthly deliverable summary for finance',
    body:
      'Requested a monthly deliverable summary the finance team can reconcile against Close. Logged May 8; scoped but not yet scheduled.',
    product: 'System of Record',
  },
  {
    kind: 'request', priority: 'low', date: 'Apr 24',
    title: 'Read-only seats for two analysts',
    body:
      'Asked for read-only access for two analysts so they can pull reports without a Handle seat. Low priority, parked.',
    product: 'System of Record',
  },
];

/** Synthesize a plausible outstanding-items list for the non-authored accounts. */
const genericItems = (a: Account): Item[] => {
  if (a.health === 'active') return [];
  if (a.health === 'none') {
    return [
      {
        kind: 'request', priority: 'low', date: 'May 2',
        title: 'No usage metric this cycle',
        body: 'Workspace reported no usage, so health can’t be scored. Check the metrics feed is connected.',
        product: 'System of Record',
      },
    ];
  }
  return [
    {
      kind: 'bug', priority: 'high', status: 'In progress', date: 'Jun 1',
      title: 'Validator errors block go-live',
      body: 'Daily reports came back with errors last week. Engineer is investigating; not yet confirmed resolved.',
      product: 'Payment Validation',
    },
    {
      kind: 'request', priority: 'med', date: 'May 26',
      title: 'Feed output into their core system',
      body: 'Wants validator output piped into their core system. Waiting on a scoping call.',
      product: 'System of Record',
    },
  ];
};

const account = (
  label: string, value: number, health: Health, owner: string,
  extra: Partial<Account> = {},
): Account => {
  const base: Account = {
    label, value, health, owner,
    type: extra.type ?? 'customer',
    note: extra.note ?? (health === 'active' ? 'On track' : health === 'none' ? 'No metric' : 'Credentials pending'),
    enabled: extra.enabled ?? [
      { name: 'Payment Validation', live: health !== 'none' },
      { name: 'System of Record', live: false },
    ],
    notEnabled: 'notEnabled' in extra ? extra.notEnabled : 'Quoting Agent (Onboarding)',
    items: [],
  };
  base.items = extra.items ?? genericItems(base);
  return base;
};

/** Stage 1 — accounts that signed but stalled before going live. */
const ONBOARDING: Account[] = [
  account('Pimsa Seguros', 4_500, 'active', 'Lucía'),
  account('Andres y Cía.', 4_000, 'active', 'Marco'),
  account('DEXTRA Broker Group', 2_100, 'risk', 'Ana'),
  account('Protec', 2_000, 'risk', 'Marco'),
  account('Chapa', 1_490, 'risk', 'Ana'),
  account('Kiims', 1_460, 'active', 'Lucía'),
  account('Asegúrate con Sentido', 1_200, 'active', 'Bruno'),
  account('Ambar Seguros', 1_100, 'active', 'Bruno'),
  account('Amexus', 940, 'active', 'Lucía'),
  account('Tienda Axa', 876, 'active', 'Marco'),
  account('We Care Seguros', 850, 'risk', 'Ana'),
  account('Munos', 800, 'risk', 'Bruno'),
  account('Toda La Diferencia', 750, 'risk', 'Lucía'),
  account('RAVEL', 713, 'risk', 'Marco'),
  account('MR Seguros', 700, 'active', 'Bruno'),
  account('Inventa Seguros', 1_000, 'risk', 'Ana', {
    note: 'Credentials pending',
    enabled: [
      { name: 'Payment Validation', live: true },
      { name: 'System of Record', live: false },
    ],
    notEnabled: 'Quoting Agent (Onboarding)',
    items: INVENTA_ITEMS,
  }),
  account('solución2', 650, 'none', 'Lucía'),
  account('Créser Consultores', 600, 'active', 'Marco'),
  account('Línea Insurance', 566, 'active', 'Bruno'),
];

/** Stage 2 — live accounts whose deployment stalled mid-rollout. */
const DEPLOYMENT: Account[] = [
  account('Interesse', 2_850, 'risk', 'Ana'),
  account('Seguro Inteligente', 2_500, 'active', 'Bruno'),
  account('Tourist Broker Correduría (ES)', 1_750, 'risk', 'Marco'),
  account('Prevento', 1_500, 'none', 'Lucía'),
  account('CAE Insurance Broker', 1_000, 'active', 'Ana'),
  account('Sofinova', 900, 'active', 'Bruno'),
  account('910 Seguros', 800, 'risk', 'Marco'),
  account('Click Seguros', 750, 'active', 'Lucía'),
  account('PASAP', 705, 'risk', 'Ana'),
  account('IDP Broker', 650, 'active', 'Bruno'),
  account('Iris Seguros', 600, 'active', 'Marco'),
  account('Segoro', 450, 'risk', 'Lucía'),
];

const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

const STAGE_LABEL: Record<Health, string> = {
  active: 'On track',
  risk: 'Onboarding-blocked',
  none: 'No metric',
};

/** Hard state → the single status-pill color. */
const HEALTH_STATUS = { active: 'ok', risk: 'error', none: 'neutral' } as const;

/** Priority reads as one colored dot — no pill chrome. */
const PRIORITY_DOT = {
  high: 'var(--he-error)',
  med: 'var(--he-warn)',
  low: 'var(--he-text-faint)',
} as const;
const PRIORITY_LABEL = { high: 'High', med: 'Med', low: 'Low' } as const;

/** Each product gets a stable swatch from the restrained series palette. */
const PRODUCT_DOT: Record<string, string> = {
  'Payment Validation': 'var(--he-series-1)',
  'System of Record': 'var(--he-series-2)',
  'Quoting Agent (Onboarding)': 'var(--he-series-3)',
};
const productDot = (name: string) => PRODUCT_DOT[name] ?? 'var(--he-series-5)';

/* ------------------------------------------------------------------ drawer body */

/** Mono uppercase section kicker. */
function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap={2}>
      <Text as="span" size="caption" tone="faint" mono>
        {label}
      </Text>
      {children}
    </Stack>
  );
}

/**
 * One outstanding item as a clean row — no box, no status spine, no badge stack.
 * A single priority-colored dot carries urgency; the rest is quiet mono meta.
 */
function OutstandingItem({ item }: { item: Item }) {
  return (
    <Stack gap={1}>
      <Stack direction="row" justify="between" align="baseline" gap={3}>
        <Text weight="medium" size="sm">
          {item.title}
        </Text>
        <Text as="span" size="caption" tone="faint" mono>
          {item.date}
        </Text>
      </Stack>
      <Text size="sm" tone="dim">
        {item.body}
      </Text>
      <Stack direction="row" gap={2} align="center">
        <Chip variant="dot" plain dotColor={PRIORITY_DOT[item.priority]}>
          {PRIORITY_LABEL[item.priority]}
        </Chip>
        <Text as="span" size="caption" tone="faint" mono>
          {item.kind.toUpperCase()} · {item.product}
          {item.status ? ` · ${item.status}` : ''}
        </Text>
      </Stack>
    </Stack>
  );
}

const DRAWER_TABS = [
  { value: 'deliverable', label: 'Sold vs deliverable' },
  { value: 'triage', label: 'Triage' },
  { value: 'close', label: 'Close context' },
];

function AccountDrawer({
  selection,
  onClose,
}: {
  selection: { account: Account; group: string } | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState('deliverable');
  const a = selection?.account ?? null;

  return (
    <Drawer
      open={a != null}
      onClose={onClose}
      width="460px"
      eyebrow={selection?.group}
      title={a?.label ?? ''}
      meta={
        a && (
          <>
            <Text as="span" size="body" weight="medium" tone="default">
              <Money as="span" value={a.value} currency="USD" /> /mo
            </Text>
            <StatusPill status={HEALTH_STATUS[a.health]} label={STAGE_LABEL[a.health]} />
            <Text as="span" size="sm" tone="faint" mono>
              {a.type.toUpperCase()}
            </Text>
          </>
        )
      }
      tabs={<Tabs variant="underline" items={DRAWER_TABS} value={tab} onChange={setTab} />}
      footer={
        a && (
          <Button variant="secondary" size="sm">
            Close lead ↗
          </Button>
        )
      }
    >
      {a && tab === 'deliverable' && (
        <Stack gap={5}>
          <Text size="sm" tone="dim">
            Not audited yet — the sold-vs-deliverable audit has only covered the pilot accounts so
            far. Running it reads this lead’s contracts and proposals from Close and fills in this tab
            with what was actually sold.
          </Text>

          <Section label="Enabled in workspace">
            <Stack direction="row" gap={4} wrap>
              {a.enabled.map((p) => (
                <Chip key={p.name} variant="dot" plain dotColor={productDot(p.name)}>
                  {p.name}
                  {p.live ? ' · Live' : ''}
                </Chip>
              ))}
              {a.notEnabled && (
                <Chip variant="dot" plain dotPattern="hatch">
                  {a.notEnabled} · not enabled
                </Chip>
              )}
            </Stack>
          </Section>

          <Section
            label={`Outstanding · ${a.items.length} item${a.items.length === 1 ? '' : 's'}`}
          >
            {a.items.length ? (
              <Stack gap={4}>
                {a.items.map((item, i) => (
                  <Stack key={item.title} gap={4}>
                    {i > 0 && <Divider />}
                    <OutstandingItem item={item} />
                  </Stack>
                ))}
              </Stack>
            ) : (
              <EmptyState
                title="Nothing outstanding"
                hint="No open bugs or requests for this account."
              />
            )}
          </Section>
        </Stack>
      )}

      {a && tab === 'triage' && (
        <Stack gap={4}>
          <Section label="Status">
            <StatusPill status={HEALTH_STATUS[a.health]} label={a.note} />
          </Section>
          <Section label="Owner">
            <Text size="sm">{a.owner}</Text>
          </Section>
          <Text size="sm" tone="dim">
            {a.items.length} open item{a.items.length === 1 ? '' : 's'}. Work the highest-priority bug
            first, then confirm the customer sees fewer errors before moving the account out of
            blocked.
          </Text>
        </Stack>
      )}

      {a && tab === 'close' && (
        <Stack gap={4}>
          <Section label="Synced from Close">
            <Text size="sm" tone="dim">
              This {a.type} is at {usd(a.value)}/mo with status “{a.note}”. The paper trail —
              contracts, proposals, latest thread — is what the deliverable audit reads to reconcile
              sold vs enabled.
            </Text>
          </Section>
        </Stack>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ the view */

function RevenueMapView() {
  const [product, setProduct] = useState('all');
  const [owner, setOwner] = useState('all');
  const [view, setView] = useState('map');
  const [colorBy, setColorBy] = useState('health');
  const [selected, setSelected] = useState<{ account: Account; group: string } | null>(null);

  return (
    <Container max={1320}>
      <Stack gap={4}>
        {/* ── Header + controls ──────────────────────────────────────────── */}
        <PageHeader
          eyebrow="Product · Pipeline"
          title="Revenue Map"
          lede="Every stuck account as a tile sized by monthly revenue and colored by health. Two stages, two squarified maps — the biggest books surface first. Click any tile to open its triage detail."
          aside={
            <Stack direction="row" gap={2} align="center">
              <Chip variant="dot">Snapshot · 7w ago</Chip>
              <Button variant="secondary" size="sm">
                Refresh
              </Button>
            </Stack>
          }
        />

        <Toolbar>
          <Text as="label" size="sm" tone="dim">
            Product
          </Text>
          <Select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="all">All products</option>
            <option value="broker">Broker Suite</option>
            <option value="claims">Claims</option>
          </Select>
          <Text as="label" size="sm" tone="dim">
            Owner
          </Text>
          <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="all">All owners</option>
            <option value="lucia">Lucía</option>
            <option value="marco">Marco</option>
            <option value="ana">Ana</option>
            <option value="bruno">Bruno</option>
          </Select>
          <Tabs
            variant="pills"
            size="sm"
            value={view}
            onChange={setView}
            items={[
              { value: 'table', label: 'Table' },
              { value: 'map', label: 'Map' },
            ]}
          />
          <ToolbarGroup align="end">
            <Text as="span" size="sm" tone="dim">
              Total
            </Text>
            <Money as="span" value={44_600} currency="USD" />
            <Text as="span" size="sm" tone="dim">
              · 47 accounts
            </Text>
          </ToolbarGroup>
        </Toolbar>

        {/* ── The two stages, side by side ───────────────────────────────── */}
        <Grid columns="1.7fr 1fr" gap={4}>
          <Stack gap={3}>
            <PageHeader
              size="section"
              title="Stuck in onboarding"
              aside={
                <Text as="span" size="sm" tone="dim" mono>
                  $30,145 · 28 accounts
                </Text>
              }
            />
            <Treemap
              data={ONBOARDING.map(toTile)}
              height={440}
              gap={3}
              formatValue={usd}
              onSelect={(_d, i) => setSelected({ account: ONBOARDING[i], group: 'Stuck in onboarding' })}
            />
          </Stack>

          <Stack gap={3}>
            <PageHeader
              size="section"
              title="Stuck in deployment"
              aside={
                <Text as="span" size="sm" tone="dim" mono>
                  $14,455 · 19 accounts
                </Text>
              }
            />
            <Treemap
              data={DEPLOYMENT.map(toTile)}
              height={440}
              gap={3}
              formatValue={usd}
              onSelect={(_d, i) => setSelected({ account: DEPLOYMENT[i], group: 'Stuck in deployment' })}
            />
          </Stack>
        </Grid>

        <Divider />

        {/* ── Legend / color-by controls ─────────────────────────────────── */}
        <Stack direction="row" justify="between" align="center" wrap gap={3}>
          <Stack direction="row" align="center" wrap gap={3}>
            <Text as="span" size="sm" tone="dim">
              Color by
            </Text>
            <Tabs
              variant="pills"
              size="sm"
              value={colorBy}
              onChange={setColorBy}
              items={[
                { value: 'status', label: 'Status' },
                { value: 'health', label: 'Health' },
              ]}
            />
            <StatusPill status="ok" label="Active · 18 · $19,953" />
            <StatusPill status="error" label="At risk · 19 · $19,559" />
            <StatusPill status="neutral" label="No metric · 10 · $5,088" />
          </Stack>
          <Text as="span" size="sm" mono>
            At-risk $19,559/mo
          </Text>
        </Stack>
      </Stack>

      <AccountDrawer selection={selected} onClose={() => setSelected(null)} />
    </Container>
  );
}

export const Board: Story = {
  render: () => <RevenueMapView />,
};
