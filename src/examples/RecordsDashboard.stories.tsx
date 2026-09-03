import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { ColumnChart } from '../components/ColumnChart/ColumnChart';
import { Composer } from '../components/Composer/Composer';
import { Container, Divider, Grid, Stack } from '../components/Layout/Layout';
import { DateText } from '../components/DateText/DateText';
import { List, ListItem, type ListItemStatus } from '../components/List/List';
import { Meter } from '../components/Meter/Meter';
import { Money } from '../components/Money/Money';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Panel } from '../components/Panel/Panel';
import { Avatar } from '../components/Avatar/Avatar';
import { StatCard, StatCardGroup } from '../components/StatCard/StatCard';
import { StatToggle, StatToggleGroup } from '../components/StatToggle/StatToggle';
import { Tabs } from '../components/Tabs/Tabs';
import { Text } from '../components/Text/Text';
import { Toolbar, ToolbarGroup } from '../components/Toolbar/Toolbar';
import { Timeline, type TimelineEvent, type TimelineMark } from '../components/Timeline/Timeline';
import { Treemap } from '../components/Treemap/Treemap';
import { formatCurrency } from '../format';

/**
 * Full-page composition: the "Handle v2 · Records" home for an insurance brokerage,
 * built end-to-end from Handle Elements with ZERO custom styling — every widget AND
 * every layout/typography decision comes from a library element (Container, Stack,
 * Grid, Divider, Text, PageHeader, Composer, Panel, StatCardGroup, List, Timeline,
 * ColumnChart, Treemap, Tabs…). There is not one inline style or bespoke class here,
 * so the whole view is copy-pasteable into the app and stays on-brand.
 *
 * Density is the point: the greeting is the only large thing on the page. Records are
 * 36px hairline rows inside one bordered surface, status is a 6px dot on the exceptions
 * only (never a spine, never a gradient), and every control is a real control — the
 * Size/Color pills re-drive the treemap, the bucket tiles re-scope the timeline, the
 * month bars re-select the month, the tabs switch the movement list.
 *
 * Numbers are illustrative (non-zero) so every chart renders.
 */
const meta = {
  title: 'Examples/Records Dashboard',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ formatters */

const DAY = 86_400_000;
/** The page is pinned to a fixed "today" so the story renders identically every time. */
const NOW = new Date('2026-09-03T12:00:00Z');
const TODAY = Date.UTC(2026, 8, 3);
const day = (n: number): number => TODAY + n * DAY;

const mxn = (v: number): string =>
  formatCurrency(v, { currency: 'MXN', compact: true, currencyDisplay: 'narrowSymbol' });
const int = (v: number): string => v.toLocaleString('en-US');

/* ------------------------------------------------------------------ sample data */

/** Top record objects, with live counts — the same nav strip the app shows.
 * Everything from Customers on is still in beta, so the strip divides there. */
const RECORD_TABS = [
  { value: 'home', label: 'Home' },
  { value: 'receipts', label: 'Receipts', count: int(14_639) },
  { value: 'customers', label: 'Customers', count: int(2_201), dividerLabel: 'Beta' },
  { value: 'policies', label: 'Policies', count: int(4_592) },
  { value: 'commissions', label: 'Commissions', count: int(1_442) },
  { value: 'invoices', label: 'Invoices', count: 0 },
  { value: 'endorsements', label: 'Endorsements', count: 0 },
  { value: 'captures', label: 'Captures' },
];

/** Composer starters. Clicking one drops its text into the field. */
const SUGGESTIONS = [
  { id: 'exp30', label: 'Which policies expire in the next 30 days?', count: 270 },
  { id: 'carrier', label: 'Premium by carrier' },
  { id: 'active', label: 'Active policies and total premium' },
];

type AttentionRow = {
  id: string;
  customer: string;
  policy: string;
  urgency?: ListItemStatus;
  due: string;
};

/** Only the exceptions carry a dot; the rest are quiet rows at the same pitch. */
const ATTENTION: AttentionRow[] = [
  { id: 'a1', customer: 'Modelos Economicos Aho Sapi de C.V.', policy: '687457622', urgency: 'error', due: 'overdue 3d' },
  { id: 'a2', customer: 'Regio Gas S.A. de C.V.', policy: '628515652', urgency: 'error', due: 'overdue 1d' },
  { id: 'a3', customer: 'Juan Manuel Santillan Rodriguez', policy: '688165414', urgency: 'warn', due: 'due in 1d' },
  { id: 'a4', customer: 'Cesar Gabriel Guerra Ramon', policy: '628537110', urgency: 'warn', due: 'due in 1d' },
  { id: 'a5', customer: 'Inovek Monterrey S.A. de C.V.', policy: '570346098', urgency: 'warn', due: 'due in 2d' },
  { id: 'a6', customer: 'Cristina Peña Gonzalez', policy: '688166776', due: 'due in 12d' },
  { id: 'a7', customer: 'Hugo Bernardo Gonzalez Barba', policy: '689357648', due: 'due in 14d' },
  { id: 'a8', customer: 'Omar Antonio Arvayo Castro', policy: '689559003', due: 'due in 15d' },
  { id: 'a9', customer: 'Comercializadora del Valle S.A. de C.V.', policy: '628719044', due: 'due in 18d' },
  { id: 'a10', customer: 'Maria Fernanda Robles Lugo', policy: '688904531', due: 'due in 21d' },
  { id: 'a11', customer: 'Transportes Sierra Alta S. de R.L.', policy: '570992188', due: 'due in 24d' },
];

/** Renewal buckets — MXN + USD exposure and policy counts for the next 90 days.
 * `tone` colors the tile, `band` the matching zone on the timeline; the three
 * bands must be three distinct shades or the axis reads as two buckets. */
const BUCKETS = [
  { id: 'b30', label: '≤ 30 days', from: 0, to: 30, mxn: 13_700_000, usd: 168_200, policies: 270, tone: 'warn' as const, band: 'warn' as const },
  { id: 'b60', label: '31–60 days', from: 30, to: 60, mxn: 18_600_000, usd: 106_200, policies: 335, tone: 'default' as const, band: 'neutral' as const },
  { id: 'b90', label: '61–90 days', from: 60, to: 90, mxn: 16_000_000, usd: 154_500, policies: 306, tone: 'default' as const, band: 'default' as const },
];

/** Premium renewing over the next 90 days: [day offset, premium MXN, account]. */
const RENEWAL_SEED: [number, number, string][] = [
  [2, 1_240_000, 'Grupo Aceros Norte'],
  [2, 380_000, 'Transportes Vega'],
  [3, 96_000, 'Clínica Zamora'],
  [5, 640_000, 'Molinos del Bajío'],
  [6, 210_000, 'Ferretera Anáhuac'],
  [8, 1_850_000, 'Constructora Tepeyac'],
  [8, 145_000, 'Panadería La Espiga'],
  [9, 72_000, 'Óptica Reforma'],
  [12, 520_000, 'Autopartes Lerma'],
  [14, 2_100_000, 'Minera San Rafael'],
  [15, 310_000, 'Textiles Puebla'],
  [17, 88_000, 'Café Xalapa'],
  [19, 460_000, 'Logística Bajío'],
  [21, 1_020_000, 'Hotelera Cancún'],
  [22, 130_000, 'Papelería Juárez'],
  [24, 275_000, 'Agroindustrias Sinaloa'],
  [27, 690_000, 'Química Monterrey'],
  [28, 155_000, 'Distribuidora Colima'],
  [30, 940_000, 'Grupo Educativo Valle'],
  [34, 380_000, 'Refaccionaria Toluca'],
  [36, 1_450_000, 'Naviera Veracruz'],
  [38, 120_000, 'Estudio Dental Roma'],
  [41, 560_000, 'Empaques del Golfo'],
  [44, 230_000, 'Vinos Querétaro'],
  [47, 810_000, 'Aceros Bajío'],
  [49, 190_000, 'Farmacias del Sol'],
  [52, 1_300_000, 'Cementos Altiplano'],
  [55, 260_000, 'Muebles Ocotlán'],
  [58, 430_000, 'Frigoríficos Mérida'],
  [63, 2_400_000, 'Corporativo Santa Fe'],
  [68, 175_000, 'Taller Industrial Nava'],
  [72, 620_000, 'Plásticos Irapuato'],
  [79, 340_000, 'Seguros Agrícolas Tula'],
  [86, 980_000, 'Terminal Portuaria Lázaro'],
];

const RENEWALS: TimelineEvent[] = RENEWAL_SEED.map(([offset, premium, account], i) => ({
  id: `r${i}`,
  date: day(offset),
  label: account,
  value: premium,
  tone: offset <= 30 ? 'warn' : 'default',
  meta: `Renews in ${offset} days`,
}));

/** Policies renewing per month, next 12 months. */
const MONTHS = [
  { label: 'S', name: 'Sep 2026', values: [285] },
  { label: 'O', name: 'Oct 2026', values: [311] },
  { label: 'N', name: 'Nov 2026', values: [330] },
  { label: 'D', name: 'Dec 2026', values: [287] },
  { label: 'J', name: 'Jan 2027', values: [341] },
  { label: 'F', name: 'Feb 2027', values: [314] },
  { label: 'M', name: 'Mar 2027', values: [419] },
  { label: 'A', name: 'Apr 2027', values: [379] },
  { label: 'M', name: 'May 2027', values: [405] },
  { label: 'J', name: 'Jun 2027', values: [761] },
  { label: 'J', name: 'Jul 2027', values: [338] },
  { label: 'A', name: 'Aug 2027', values: [171] },
];

/** The busiest month of the 12 — the one the caption calls out. */
const PEAK_MONTH = MONTHS.reduce((best, m, i) => (m.values[0] > MONTHS[best].values[0] ? i : best), 0);

/**
 * The book, by carrier. Premiums sum to the $246.7M net-premium KPI, policies to
 * the 4,570 active KPI and `renewing` to the 270 renewals ≤30d — the page never
 * contradicts itself. Shares are 0..1 so any of them can drive the heat scale.
 */
const CARRIERS = [
  { id: 'gnp', name: 'GNP', premium: 86_593_000, policies: 2_586, receivable: 2_140_000, renewalShare: 0.61, health: 0.88, receivableShare: 0.34, renewing: 128 },
  { id: 'ana-mx', name: 'ANA Seguros (MX)', premium: 97_602_000, policies: 1_204, receivable: 3_980_000, renewalShare: 0.28, health: 0.72, receivableShare: 0.61, renewing: 71 },
  { id: 'qualitas', name: 'Quálitas', premium: 41_180_000, policies: 512, receivable: 1_260_000, renewalShare: 0.44, health: 0.64, receivableShare: 0.22, renewing: 46 },
  { id: 'hdi', name: 'HDI Seguros', premium: 21_325_000, policies: 268, receivable: 640_000, renewalShare: 0.35, health: 0.81, receivableShare: 0.13, renewing: 25 },
];

const SIZE_ITEMS = [
  { value: 'premium', label: 'Premium' },
  { value: 'policies', label: 'Policies' },
  { value: 'receivable', label: 'Receivable' },
];
const COLOR_ITEMS = [
  { value: 'renewal', label: 'Renewal' },
  { value: 'health', label: 'Health' },
  { value: 'receivable', label: 'Receivable' },
];

type MovementRow = AttentionRow;

/** The side rail, one list per tab. */
const MOVEMENTS: Record<string, MovementRow[]> = {
  renewals: [
    { id: 'm1', customer: 'Modelos Economicos Aho Sapi de C.V.', policy: '687457622', urgency: 'warn', due: 'due in 1d' },
    { id: 'm2', customer: 'Regio Gas S.A. de C.V.', policy: '628515652', urgency: 'warn', due: 'due in 1d' },
    { id: 'm3', customer: 'Juan Manuel Santillan Rodriguez', policy: '688165414', due: 'due in 4d' },
    { id: 'm4', customer: 'Cesar Gabriel Guerra Ramon', policy: '628537110', due: 'due in 6d' },
    { id: 'm5', customer: 'Inovek Monterrey S.A. de C.V.', policy: '570346098', due: 'due in 9d' },
    { id: 'm6', customer: 'Cristina Peña Gonzalez', policy: '688166776', due: 'due in 12d' },
    { id: 'm7', customer: 'Hugo Bernardo Gonzalez Barba', policy: '689357648', due: 'due in 14d' },
    { id: 'm8', customer: 'Omar Antonio Arvayo Castro', policy: '689559003', due: 'due in 15d' },
  ],
  important: [
    { id: 'i1', customer: 'Corporativo Santa Fe', policy: '690114882', urgency: 'error', due: 'cancellation notice' },
    { id: 'i2', customer: 'Minera San Rafael', policy: '628993410', urgency: 'error', due: 'claim reserve up' },
    { id: 'i3', customer: 'Naviera Veracruz', policy: '571220945', urgency: 'warn', due: 'endorsement pending' },
    { id: 'i4', customer: 'Hotelera Cancún', policy: '689003117', urgency: 'warn', due: 'sum insured review' },
    { id: 'i5', customer: 'Grupo Aceros Norte', policy: '687001233', due: 'broker of record' },
    { id: 'i6', customer: 'Cementos Altiplano', policy: '628440871', due: 'quote requested' },
  ],
  collections: [
    { id: 'c1', customer: 'Textiles Puebla', policy: '688330219', urgency: 'warn', due: '46% collected' },
    { id: 'c2', customer: 'Autopartes Lerma', policy: '570881204', urgency: 'warn', due: 'partial payment' },
    { id: 'c3', customer: 'Empaques del Golfo', policy: '689771034', due: 'paid in full' },
    { id: 'c4', customer: 'Vinos Querétaro', policy: '628105577', due: 'paid in full' },
    { id: 'c5', customer: 'Frigoríficos Mérida', policy: '688992001', due: 'installment 3 of 12' },
  ],
  commissions: [
    { id: 'k1', customer: 'ANA Seguros (MX)', policy: '628515652', urgency: 'error', due: 'difference $12.4K' },
    { id: 'k2', customer: 'GNP', policy: '687457622', urgency: 'warn', due: 'difference $3.1K' },
    { id: 'k3', customer: 'Quálitas', policy: '570346098', urgency: 'warn', due: 'difference $1.9K' },
    { id: 'k4', customer: 'HDI Seguros', policy: '689559003', urgency: 'warn', due: 'difference $860' },
    { id: 'k5', customer: 'GNP', policy: '688166776', due: 'statement matched' },
  ],
};

const MOVEMENT_TABS = [
  { value: 'renewals', label: 'Renewals', count: 270, countTone: 'warn' as const },
  { value: 'important', label: 'Important', count: 12 },
  { value: 'collections', label: 'Collections', count: 8 },
  { value: 'commissions', label: 'Commissions', count: 4, countTone: 'error' as const },
];

/** Carrier portals we sync documents from. Three fields, because a 334px rail
 * fits three — a fourth would ellipsise the carrier name, and a half-printed
 * name is worse than no field. */
const SYNCS = [
  { id: 's1', source: 'GNP Portal', ago: '3h ago', result: '12 new' },
  { id: 's2', source: 'ANA Seguros', ago: '9h ago', result: 'no changes' },
  { id: 's3', source: 'Quálitas', ago: '1d ago', result: '4 new' },
  { id: 's4', source: 'HDI Seguros', ago: '1mo ago', result: 'no changes' },
];

/* ------------------------------------------------------------------ the view */

function RecordsView() {
  const [record, setRecord] = useState('home');
  const [query, setQuery] = useState('');
  const [mic, setMic] = useState(false);
  const [bucket, setBucket] = useState<string | null>(null);
  const [mark, setMark] = useState<TimelineMark | null>(null);
  const [month, setMonth] = useState(6);
  const [sizeBy, setSizeBy] = useState('premium');
  const [colorBy, setColorBy] = useState('renewal');
  const [carrier, setCarrier] = useState<string | null>(null);
  const [tab, setTab] = useState('renewals');

  /* Bucket selection re-scopes the timeline window instead of filtering a list. */
  const scope = BUCKETS.find((b) => b.id === bucket) ?? null;
  const from = scope ? scope.from : 0;
  const to = scope ? scope.to : 90;

  const events = useMemo(
    () => RENEWALS.filter((e) => Number(e.date) >= day(from) && Number(e.date) <= day(to)),
    [from, to],
  );
  const bands = useMemo(
    () =>
      (scope ? [scope] : BUCKETS).map((b) => ({
        from: day(b.from),
        to: day(b.to),
        label: b.label,
        tone: b.band,
      })),
    [scope],
  );
  const scopedBuckets = scope ? [scope] : BUCKETS;
  const scopedPolicies = scopedBuckets.reduce((sum, b) => sum + b.policies, 0);
  const scopedExposure = scopedBuckets.reduce((sum, b) => sum + b.mxn, 0);
  /** The timeline plots the largest accounts in the window, not all of them. */
  const plottedPremium = events.reduce((sum, e) => sum + (e.value ?? 0), 0);

  /* Size / Color pills re-drive the treemap: one is the area, the other the heat. */
  const carrierData = useMemo(() => {
    const raw = CARRIERS.map((c) =>
      colorBy === 'health' ? c.health : colorBy === 'receivable' ? c.receivableShare : c.renewalShare,
    );
    /* Spread the metric across the full heat ramp. The raw shares sit inside a
     * narrow band (0.28–0.61), which the ramp's 5 steps round into 2 shades —
     * a color channel that appears to encode nothing and a "Color" control that
     * appears dead. Normalising to the observed range is what makes the choice
     * legible. */
    const lo = Math.min(...raw);
    const hi = Math.max(...raw);
    const spread = (v: number) => (hi > lo ? 0.15 + (0.85 * (v - lo)) / (hi - lo) : 0.6);
    return CARRIERS.map((c, i) => ({
      id: c.id,
      label: c.name,
      value: sizeBy === 'policies' ? c.policies : sizeBy === 'receivable' ? c.receivable : c.premium,
      intensity: spread(raw[i]),
      hint: `${int(c.renewing)} renewing ≤30d`,
    }));
  }, [sizeBy, colorBy]);
  const formatTile = sizeBy === 'policies' ? int : mxn;

  const rows = MOVEMENTS[tab] ?? [];

  return (
    <Container max={1240}>
      <Stack gap={6}>
        {/* ── Record objects ──────────────────────────────────────────────── */}
        <Tabs variant="pills" size="sm" items={RECORD_TABS} value={record} onChange={setRecord} />

        {/* ── 1. Hero: centered greeting + the composer owns its suggestions ─ */}
        <PageHeader
          size="hero"
          title="Good morning, Alfonso"
          subtitle={<DateText date={NOW} dateStyle="full" locale="en-US" />}
          measure={720}
          aside={
            <Composer
              size="lg"
              align="center"
              maxWidth={648}
              placeholder="Ask your records…"
              submitVariant="ghost"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onMic={() => setMic((v) => !v)}
              micActive={mic}
              onSubmit={() => setQuery('')}
              suggestions={SUGGESTIONS}
              onSuggestionSelect={(_s, i) => setQuery(SUGGESTIONS[i].label)}
            />
          }
        />

        {/* ── 2. KPI rail: one surface, hairline dividers, dots not spines ─── */}
        <StatCardGroup variant="rail" columns={6}>
          <StatCard
            tone="warn"
            label="Renewals · 30d"
            value="270"
            footer={<Badge tone="accent">{`${mxn(13_700_000)} MXN exposed`}</Badge>}
          />
          <StatCard
            tone="neutral"
            label="Net premium"
            value={<Money value={246_700_000} currency="MXN" compact showCurrencyCode />}
            footer={<Money value={2_900_000} currency="USD" compact showCurrencyCode />}
          />
          <StatCard tone="neutral" label="Active policies" value={int(4_570)} footer={`of ${int(4_592)}`} />
          {/* No sparkline here: the series is flat at zero, so a chart beside the
              number would either be a dead line or contradict it. */}
          <StatCard tone="ok" label="Overdue" value="0" footer="No overdue receipts" />
          <StatCard
            tone="ok"
            label="Collections"
            value="46%"
            visual={<Meter size="sm" tone="ok" value={46} />}
            footer="of the current cycle"
          />
          <StatCard
            tone="warn"
            label="Commissions"
            value={<Money value={835_000} currency="MXN" compact showCurrencyCode />}
            footer={<Badge tone="warn">4 differences</Badge>}
          />
        </StatCardGroup>

        {/* ── 3. Needs your attention: 11 rows in the old height of 6 ─────── */}
        <Panel
          flush
          title="Needs your attention"
          lede="0 overdue receipts · 270 renewals ≤30d"
          aside={
            <Button variant="link" size="sm">
              View all 270
            </Button>
          }
        >
          <List variant="divided" size="sm" gutter>
            {ATTENTION.map((r) => (
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

        {/* ── 4. Renewals: buckets → timeline → 12 months, no wash, no spine ─ */}
        <Panel
          eyebrow="Next 90 days"
          title="Renewals"
          lede={`${int(scopedPolicies)} policies · ${mxn(scopedExposure)} renewing in the window`}
          aside={
            <Stack direction="row" gap={2} align="center">
              {scope && (
                <Button variant="link" size="sm" onClick={() => setBucket(null)}>
                  Show all 90 days
                </Button>
              )}
              <Button variant="ghost" size="xs">
                Ask
              </Button>
            </Stack>
          }
        >
          <Stack gap={5}>
            <StatToggleGroup columns={3} label="Renewal window">
              {BUCKETS.map((b) => (
                <StatToggle
                  key={b.id}
                  label={b.label}
                  tone={b.tone}
                  active={bucket === b.id}
                  onClick={() => setBucket(bucket === b.id ? null : b.id)}
                  value={<Money value={b.mxn} currency="MXN" compact showCurrencyCode />}
                  hint={
                    <>
                      <Money value={b.usd} currency="USD" compact showCurrencyCode /> · {int(b.policies)} policies
                    </>
                  }
                />
              ))}
            </StatToggleGroup>

            <Timeline
              events={events}
              start={day(from)}
              end={day(to)}
              now={TODAY}
              bands={bands}
              sizeBy="value"
              cluster="sum"
              formatValue={mxn}
              onSelect={setMark}
              eventTooltip={(m) => `${m.events.length} policies · ${mxn(m.total)}`}
            />

            {mark ? (
              <Text size="sm" tone="dim">
                {int(mark.events.length)} renewing on{' '}
                <DateText date={mark.time} dateStyle="medium" locale="en-US" variant="mono" /> · {mxn(mark.total)} ·{' '}
                {mark.events.map((e) => e.label).join(', ')}
              </Text>
            ) : (
              <Text size="sm" tone="dim">
                Bubble area is premium. The {int(events.length)} largest accounts in this window are plotted —{' '}
                {mxn(plottedPremium)} of {mxn(scopedExposure)}. Pick a bubble for the accounts behind it.
              </Text>
            )}

            <Divider />

            <Stack gap={3}>
              <Text size="body" weight="medium">
                Next 12 months
              </Text>
              <ColumnChart
                data={MONTHS}
                series={[{ name: 'Policies renewing', tone: 'ink' }]}
                height={180}
                barMaxWidth={56}
                showValues
                showBaseline
                showYLabels={false}
                highlightIndex={month}
                selectedIndex={month}
                onSelectColumn={(_d, i) => setMonth(i)}
              />
              <Text size="sm" tone="dim">
                {MONTHS[month].name} · {int(MONTHS[month].values[0])} policies renewing
                {month === PEAK_MONTH
                  ? ' — the peak of the next 12 months. Staff it now.'
                  : `. ${MONTHS[PEAK_MONTH].name} is the peak at ${int(MONTHS[PEAK_MONTH].values[0])}.`}
              </Text>
            </Stack>
          </Stack>
        </Panel>

        {/* ── 5 + 6. Book by carrier | movements rail ─────────────────────── */}
        <Grid columns="minmax(0, 2fr) minmax(0, 1fr)" gap={5}>
          <Panel
            title="Your book by carrier"
            aside={
              <Button variant="ghost" size="xs">
                Ask
              </Button>
            }
          >
            <Stack gap={4}>
              {/* Controls sit in a Toolbar so they read as controls, not decoration. */}
              <Toolbar>
                <ToolbarGroup>
                  <Text as="span" size="sm" tone="dim">
                    Size
                  </Text>
                  <Tabs variant="pills" size="sm" items={SIZE_ITEMS} value={sizeBy} onChange={setSizeBy} />
                </ToolbarGroup>
                <ToolbarGroup align="end">
                  <Text as="span" size="sm" tone="dim">
                    Color
                  </Text>
                  <Tabs variant="pills" size="sm" items={COLOR_ITEMS} value={colorBy} onChange={setColorBy} />
                </ToolbarGroup>
              </Toolbar>

              <StatToggleGroup columns={4} label="Carriers">
                {CARRIERS.map((c) => (
                  <StatToggle
                    key={c.id}
                    label={c.name}
                    active={carrier === c.id}
                    onClick={() => setCarrier(carrier === c.id ? null : c.id)}
                    value={<Money value={c.premium} currency="MXN" compact showCurrencyCode />}
                    hint={`${int(c.policies)} policies · ${int(c.renewing)} renewing ≤30d`}
                  />
                ))}
              </StatToggleGroup>

              <Treemap
                data={carrierData}
                height={340}
                colorMode="heat"
                formatValue={formatTile}
                spotlight={carrier ? (d) => d.id === carrier : undefined}
                onSelect={(_d, i) => setCarrier(CARRIERS[i].id)}
                tileTooltip={(_d, i) =>
                  `${CARRIERS[i].name} — ${mxn(CARRIERS[i].premium)} · ${int(CARRIERS[i].policies)} policies · ${int(
                    CARRIERS[i].renewing,
                  )} renewing ≤30d`
                }
              />

              <Text size="sm" tone="dim">
                Area is {SIZE_ITEMS.find((s) => s.value === sizeBy)?.label.toLowerCase()}; shade is{' '}
                {COLOR_ITEMS.find((c) => c.value === colorBy)?.label.toLowerCase()}. Pick a carrier above to spotlight it.
              </Text>
            </Stack>
          </Panel>

          <Stack gap={5}>
            <Panel title="Movements">
              {/* In a narrow rail the tab row gets its own line, as the app does. */}
              <Stack gap={3}>
                <Tabs variant="pills" size="sm" wrap items={MOVEMENT_TABS} value={tab} onChange={setTab} />
                {/* No policy number in this rail: at 334px it would ellipsise to
                    "Policy 6874…", and a half-printed identifier is a wrong one.
                    The wide "Needs your attention" panel above still carries it. */}
                <List variant="divided" size="sm" gutter>
                  {rows.map((m) => (
                    <ListItem key={m.id} href="#" status={m.urgency} primary={m.customer} value={m.due} />
                  ))}
                </List>
              </Stack>
            </Panel>

            <Panel flush title="Latest syncs">
              <List variant="divided" size="sm">
                {SYNCS.map((s) => (
                  <ListItem
                    key={s.id}
                    leading={<Avatar size="sm" name={s.source} />}
                    primary={s.source}
                    meta={s.ago}
                    trailing={<Chip variant="mono" size="sm">{s.result}</Chip>}
                  />
                ))}
              </List>
            </Panel>
          </Stack>
        </Grid>
      </Stack>
    </Container>
  );
}

export const Dashboard: Story = {
  render: () => <RecordsView />,
};
