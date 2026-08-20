import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarStack } from '../Avatar/Avatar';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import { PageHeader } from '../PageHeader/PageHeader';
import { Switch } from '../Switch/Switch';
import { formatCurrency } from '../../format';
import { sum } from '../../lib/chart';
import { Treemap, type TreemapDatum, type TreemapGroup } from './Treemap';

/** MRR by customer (thousands). Varied so tiles range from headline to sliver. */
const mrr: TreemapDatum[] = [
  { label: 'Northwind Freight', value: 42_000, hint: '+8% QoQ' },
  { label: 'Cascade Logistics', value: 31_500, hint: '+3% QoQ' },
  { label: 'Ironclad Cargo', value: 27_800, hint: 'flat' },
  { label: 'Meridian Haul', value: 19_200, hint: '+12% QoQ' },
  { label: 'Summit Carriers', value: 15_600 },
  { label: 'Blue Ridge Move', value: 12_400 },
  { label: 'Delta Transport', value: 9_800 },
  { label: 'Apex Freightways', value: 7_300 },
  { label: 'Harbor Lines', value: 6_100 },
  { label: 'Vantage Cargo', value: 4_400 },
  { label: 'Pine State Haul', value: 3_200 },
  { label: 'Coastal Dispatch', value: 2_100 },
];

const usd = (v: number) => `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;

const meta = {
  title: 'Charts/Treemap',
  component: Treemap,
  args: { data: mrr, height: 340, colorMode: 'series', gap: 2, formatValue: usd },
  argTypes: {
    colorMode: { control: 'inline-radio', options: ['series', 'heat'] },
    height: { control: { type: 'range', min: 160, max: 520, step: 20 } },
    gap: { control: { type: 'range', min: 0, max: 8, step: 1 } },
  },
} satisfies Meta<typeof Treemap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Growth/health as heat intensity (0..1), independent of tile size. */
const health: TreemapDatum[] = mrr.map((d, i) => ({
  ...d,
  intensity: [0.9, 0.35, 0.5, 0.95, 0.7, 0.2, 0.6, 0.8, 0.3, 0.55, 0.15, 0.45][i],
}));

/** Carrier book of business by written premium (thousands). */
const premium: TreemapDatum[] = [
  { label: 'Sentinel Mutual', value: 88_000, hint: 'Property' },
  { label: 'Cornerstone P&C', value: 54_000, hint: 'Auto' },
  { label: 'Granite Underwriters', value: 33_500, hint: 'Cargo' },
  { label: 'Evergreen Specialty', value: 21_000, hint: 'Liability' },
];

const clickable: TreemapDatum[] = mrr.slice(0, 8).map((d) => ({ ...d, id: String(d.label) }));

export const Gallery: Story = {
  render: () => (
    <Card style={{ width: 640, display: 'grid', gap: 24 }}>
      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader size="section" eyebrow="Hierarchy" title="MRR by customer" lede="series" />
        <Treemap data={mrr} height={300} formatValue={usd} />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Hierarchy"
          title="Account health"
          lede="heat (colored by growth intensity)"
        />
        <Treemap data={health} height={300} colorMode="heat" formatValue={usd} />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader size="section" eyebrow="Hierarchy" title="Carrier premium" lede="with hints" />
        <Treemap data={premium} height={220} formatValue={usd} />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Hierarchy"
          title="Clickable"
          lede="logs the selected customer"
        />
        <Treemap
          data={clickable}
          height={260}
          formatValue={usd}
          // eslint-disable-next-line no-console
          onSelect={(d, i) => console.log('selected', i, d.label, d.value)}
        />
      </section>

      <section style={{ display: 'grid', gap: 20 }}>
        <PageHeader
          size="section"
          eyebrow="Hierarchy"
          title="Fixed tones"
          lede="pos / neg / accent / ink"
        />
        <Treemap
          height={180}
          formatValue={usd}
          data={[
            { label: 'Won', value: 40_000, tone: 'pos', hint: 'net new' },
            { label: 'Churned', value: 14_000, tone: 'neg', hint: 'lost' },
            { label: 'Expansion', value: 22_000, tone: 'accent', hint: 'upsell' },
            { label: 'Renewals', value: 30_000, tone: 'ink', hint: 'retained' },
          ]}
        />
      </section>
    </Card>
  ),
};

// ── Customer map (Perplexity-style) fixtures ───────────────────────────────
// Accounts carry a delivery status (→ tone), a usage-health score (→ intensity),
// an owner roster, and a motion label — enough to drive every new capability.
type AccountStatus = 'deploy' | 'healthy' | 'risk';

interface Account extends TreemapDatum {
  status: AccountStatus;
  owners: string[];
  motion: string;
}

/** Delivery status → the same muted tones the flat map already uses. */
const STATUS_TONE: Record<AccountStatus, TreemapDatum['tone']> = {
  deploy: 'ink',
  healthy: 'pos',
  risk: 'neg',
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  deploy: 'Stuck in Deployment',
  healthy: 'Healthy',
  risk: 'At Risk',
};

const account = (
  name: string,
  mrr: number,
  status: AccountStatus,
  usage: number,
  motion: string,
  owners: string[],
): Account => ({
  id: name,
  label: name,
  value: mrr,
  tone: STATUS_TONE[status],
  intensity: usage,
  hint: motion,
  status,
  owners,
  motion,
});

const accounts: Account[] = [
  account('Northwind', 42_000, 'deploy', 0.28, 'Growth', ['Ana Ruiz', 'Leo Park']),
  account('Cascade', 31_500, 'deploy', 0.34, 'Growth', ['Mia Chen']),
  account('Ironclad', 27_800, 'healthy', 0.82, 'Enterprise', ['Sam Vega', 'Jo Kerr', 'Ted Nash']),
  account('Meridian', 19_200, 'healthy', 0.9, 'Growth', ['Ana Ruiz']),
  account('Summit', 15_600, 'risk', 0.19, 'Enterprise', ['Leo Park', 'Mia Chen']),
  account('Blue Ridge', 12_400, 'healthy', 0.71, 'Growth', ['Jo Kerr']),
  account('Delta', 9_800, 'deploy', 0.4, 'Growth', ['Ted Nash']),
  account('Apex', 7_300, 'risk', 0.24, 'Enterprise', ['Sam Vega']),
  account('Harbor', 6_100, 'healthy', 0.66, 'Growth', ['Ana Ruiz', 'Jo Kerr']),
  account('Vantage', 4_400, 'risk', 0.31, 'Growth', ['Mia Chen']),
  account('Pine State', 3_200, 'deploy', 0.22, 'Enterprise', ['Leo Park']),
  account('Coastal', 2_100, 'healthy', 0.58, 'Growth', ['Ted Nash']),
];

const asUsd = (v: number) => formatCurrency(v, { currency: 'USD', compact: true });

/** Split the roster into one region per delivery status, with a summary band. */
const statusGroups: TreemapGroup[] = (['deploy', 'healthy', 'risk'] as AccountStatus[]).map(
  (status) => {
    const rows = accounts.filter((a) => a.status === status);
    const total = sum(rows.map((a) => a.value));
    return {
      id: status,
      title: STATUS_LABEL[status],
      summary: `${asUsd(total)} · ${rows.length} accounts`,
      data: rows,
    };
  },
);

/** Grouped/faceted regions, each squarified on its own, sized by book value. */
export const Grouped: Story = {
  render: () => (
    <Card style={{ width: 720, display: 'grid', gap: 24 }}>
      <section style={{ display: 'grid', gap: 16 }}>
        <PageHeader
          size="section"
          eyebrow="Customer map"
          title="Book by delivery status"
          lede="regions sized by value"
        />
        <Treemap groups={statusGroups} height={300} formatValue={asUsd} />
      </section>
      <section style={{ display: 'grid', gap: 16 }}>
        <PageHeader
          size="section"
          eyebrow="Customer map"
          title="Equal columns"
          lede="regionSizing='equal'"
        />
        <Treemap groups={statusGroups} height={240} regionSizing="equal" formatValue={asUsd} />
      </section>
    </Card>
  ),
};

/** A `renderTile` slot: owner avatars + a motion chip, size-gated with the built-in fallback. */
export const CustomTiles: Story = {
  render: () => (
    <Card style={{ width: 720, display: 'grid', gap: 16 }}>
      <PageHeader
        size="section"
        eyebrow="Customer map"
        title="Rich tiles"
        lede="owners + motion, falling back to the built-in body on slivers"
      />
      <Treemap
        groups={statusGroups}
        height={340}
        formatValue={asUsd}
        renderTile={(datum, _index, geometry) => {
          // Only the largest tiles get the full treatment; the rest use the default.
          if (geometry.widthPct < 16 || geometry.heightPct < 22) return null;
          const acc = datum as Account;
          return (
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                // Shrink children to content so the motion chip doesn't stretch full-width.
                alignItems: 'flex-start',
                gap: 4,
                padding: '10px 12px',
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {acc.label}
              </span>
              <span style={{ fontFamily: 'var(--he-font-mono)', fontSize: 11, opacity: 0.82 }}>
                {asUsd(acc.value)}
              </span>
              {/* Bottom band: compact motion chip on the left, owners pinned right. */}
              <span
                style={{
                  width: '100%',
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <Chip variant="dot" size="sm" dotColor="var(--he-accent)">
                  {acc.motion}
                </Chip>
                <AvatarStack size="xs" items={acc.owners.map((name) => ({ id: name, name }))} />
              </span>
            </span>
          );
        }}
      />
    </Card>
  ),
};

/** Spotlight: fade off-filter tiles in place while the layout stays put. */
export const Spotlight: Story = {
  render: function SpotlightStory() {
    const [enterpriseOnly, setEnterpriseOnly] = useState(true);
    return (
      <Card style={{ width: 720, display: 'grid', gap: 16 }}>
        <PageHeader
          size="section"
          eyebrow="Customer map"
          title="Spotlight enterprise"
          lede="non-matching tiles fade in place"
        />
        <Switch
          checked={enterpriseOnly}
          onCheckedChange={setEnterpriseOnly}
          label="Spotlight Enterprise motion"
        />
        <Treemap
          groups={statusGroups}
          height={300}
          formatValue={asUsd}
          spotlight={
            enterpriseOnly ? (d) => (d as Account).motion === 'Enterprise' : undefined
          }
        />
      </Card>
    );
  },
};

const LENS_LABEL = { status: 'Delivery status', usage: 'Usage health' } as const;

/** Color lens: recolor every tile through `colorBy` without touching the layout. */
export const ColorLens: Story = {
  render: function ColorLensStory() {
    const [lens, setLens] = useState<'status' | 'usage'>('status');
    return (
      <Card style={{ width: 720, display: 'grid', gap: 16 }}>
        <PageHeader
          size="section"
          eyebrow="Customer map"
          title="Color lens"
          lede="status vs usage-health"
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['status', 'usage'] as const).map((key) => (
            <Chip
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => setLens(key)}
              style={{
                cursor: 'pointer',
                background: lens === key ? 'var(--he-action)' : undefined,
                color: lens === key ? 'var(--he-on-action)' : undefined,
              }}
            >
              {LENS_LABEL[key]}
            </Chip>
          ))}
        </div>
        <Treemap
          groups={statusGroups}
          height={300}
          formatValue={asUsd}
          // Usage lens overrides tone → heat ramp; status lens leaves each datum's tone.
          colorBy={lens === 'usage' ? () => ({ tone: 'heat' }) : undefined}
        />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Chip variant="dot" plain dotColor="var(--he-chart-pos)">
            Healthy
          </Chip>
          <Chip variant="dot" plain dotColor="var(--he-chart-neg)">
            At risk
          </Chip>
          <Chip variant="dot" plain dotColor="var(--he-chart-ink)">
            In deployment
          </Chip>
          <Chip variant="dot" plain dotPattern="hatch">
            No metric
          </Chip>
        </div>
      </Card>
    );
  },
};
