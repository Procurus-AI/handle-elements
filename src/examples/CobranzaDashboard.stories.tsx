import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

import { BarChart } from '../components/BarChart/BarChart';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { ColumnChart } from '../components/ColumnChart/ColumnChart';
import { Container, Divider, Grid, Stack } from '../components/Layout/Layout';
import { DataTable, TableCell, type DataTableColumn } from '../components/DataTable/DataTable';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Money } from '../components/Money/Money';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Panel } from '../components/Panel/Panel';
import { RadialGauge } from '../components/RadialGauge/RadialGauge';
import { SearchInput } from '../components/Input/SearchInput';
import { Select } from '../components/Input/Select';
import { Sparkline } from '../components/Sparkline/Sparkline';
import { StatCard, StatCardGroup } from '../components/StatCard/StatCard';
import { StatToggle, StatToggleGroup } from '../components/StatToggle/StatToggle';
import { StatusPill, type StatusPillStatus } from '../components/StatusPill/StatusPill';
import { Tabs } from '../components/Tabs/Tabs';
import { Text } from '../components/Text/Text';
import { Toolbar, ToolbarGroup, ResultCount } from '../components/Toolbar/Toolbar';

/**
 * Full-page composition: the "Cobranza · CompanyWise" fleet dashboard, built end-to-end
 * from Handle Elements with ZERO custom styling — every widget AND every layout/typography
 * decision comes from a library element (Container, Stack, Grid, Divider, Text, Panel,
 * StatCardGroup, charts, DataTable, Tabs, Toolbar, gauge…). Nothing here is an inline style,
 * so the whole view is copy-pasteable into any consuming app and stays on-brand.
 *
 * The numbers are illustrative (non-zero) so the charts render; the real view shows zeros
 * when a segment has no live clients.
 */
const meta = {
  title: 'Examples/Cobranza Dashboard',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ sample data */

const WEEKS = Array.from({ length: 12 }, (_, i) => `S${i + 1}`);
const contactByChannel = WEEKS.map((label, i) => ({
  label,
  values: [
    18 + Math.round(10 * Math.sin(i / 2)), // Llamadas
    9 + Math.round(6 * Math.cos(i / 3)), //  Correos
    5 + Math.round(4 * Math.sin(i / 1.7)), // WhatsApp
  ],
}));

const recovered = [4, 9, 12, 15, 21, 24, 30, 41, 52, 60, 74, 91]; // cumulative USD (k)

const hourly = Array.from({ length: 12 }, (_, i) => ({
  label: `${i * 2}h`,
  values: [
    i >= 4 && i <= 9 ? 6 + Math.round(8 * Math.sin((i - 4) / 2)) : 1, // Contestadas
    i >= 4 && i <= 9 ? 3 + Math.round(4 * Math.cos((i - 4) / 2)) : 1, // Sin respuesta
  ],
}));

const CALL_OUTCOMES = [
  { label: 'Contactadas', value: 742, tone: 'ok' as const },
  { label: 'No contestó', value: 402, tone: 'neutral' as const },
  { label: 'Buzón', value: 88, tone: 'neutral' as const },
  { label: 'Colgó', value: 31, tone: 'warn' as const },
  { label: 'Otra persona', value: 15, tone: 'warn' as const },
  { label: 'Falló', value: 6, tone: 'error' as const },
];
const OUTCOMES_DEFAULT = 3; // rows shown before "Ver más"

type Client = {
  id: string;
  name: string;
  org: string;
  health: StatusPillStatus;
  healthLabel: string;
  calls: number;
  promises: number;
  attention: number; // %
  recovered: number;
  book: number;
  signals: { label: string; tone: 'warn' | 'error' | 'neutral' | 'accent' }[];
  mrr: number;
};

const CLIENTS: Client[] = [
  {
    id: 'c1', name: 'Aurora Retail', org: 'aurora', health: 'error', healthLabel: 'Crítico',
    calls: 0, promises: 0, attention: 0, recovered: 0, book: 128_400,
    signals: [{ label: 'Nunca corrió', tone: 'neutral' }], mrr: 1_200,
  },
  {
    id: 'c2', name: 'Delta Logística', org: 'delta', health: 'warn', healthLabel: 'En riesgo',
    calls: 214, promises: 31, attention: 42, recovered: 18_900, book: 96_100,
    signals: [{ label: 'Corridas atoradas', tone: 'error' }, { label: 'Pagos por verificar', tone: 'warn' }], mrr: 2_400,
  },
  {
    id: 'c3', name: 'Nimbus SaaS', org: 'nimbus', health: 'ok', healthLabel: 'Sano',
    calls: 512, promises: 88, attention: 71, recovered: 74_300, book: 61_500,
    signals: [], mrr: 4_100,
  },
  {
    id: 'c4', name: 'Puerto Verde', org: 'puerto', health: 'warn', healthLabel: 'En riesgo',
    calls: 143, promises: 12, attention: 38, recovered: 9_200, book: 154_800,
    signals: [{ label: 'Intentos agotados', tone: 'warn' }], mrr: 1_900,
  },
  {
    id: 'c5', name: 'Sol Naciente', org: 'sol', health: 'ok', healthLabel: 'Sano',
    calls: 388, promises: 64, attention: 66, recovered: 52_700, book: 40_200,
    signals: [], mrr: 3_300,
  },
  {
    id: 'c6', name: 'Vértice Capital', org: 'vertice', health: 'error', healthLabel: 'Crítico',
    calls: 27, promises: 2, attention: 11, recovered: 1_400, book: 212_600,
    signals: [{ label: 'Sin a quién contactar', tone: 'error' }, { label: 'Escalaciones', tone: 'warn' }], mrr: 5_600,
  },
];

const RANKING_TABS = [
  { value: 'todos', label: 'Todos', count: 27 },
  { value: 'atencion', label: 'Necesitan atención', count: 24, countTone: 'warn' as const },
  { value: 'activos', label: 'Activos · 7d', count: 11, countTone: 'ok' as const },
  { value: 'inactivos', label: 'Inactivos', count: 4 },
  { value: 'nunca', label: 'Nunca corrió', count: 12 },
  { value: 'pago', label: 'De pago', count: 11, countTone: 'accent' as const },
];

const usd = (v: number) => <Money value={v} currency="USD" compact />;
const int = (v: number) => v.toLocaleString('es-MX');

/* ------------------------------------------------------------------ the view */

function CobranzaView() {
  const [window, setWindow] = useState('90');
  const [tab, setTab] = useState('atencion');
  const [query, setQuery] = useState('');
  const [signal, setSignal] = useState('');
  const [showAllOutcomes, setShowAllOutcomes] = useState(false);

  const outcomeRows = showAllOutcomes ? CALL_OUTCOMES : CALL_OUTCOMES.slice(0, OUTCOMES_DEFAULT);
  const hiddenOutcomes = CALL_OUTCOMES.length - OUTCOMES_DEFAULT;

  const columns = useMemo<DataTableColumn<Client>[]>(
    () => [
      {
        key: 'name',
        header: 'Cliente',
        sortable: true,
        sortValue: (r) => r.name,
        render: (r) => <TableCell primary={r.name} secondary={`org · ${r.org}`} />,
      },
      {
        key: 'health',
        header: 'Salud',
        render: (r) => <StatusPill status={r.health} label={r.healthLabel} />,
      },
      { key: 'calls', header: 'Llamadas', align: 'end', sortable: true, sortValue: (r) => r.calls,
        render: (r) => <TableCell mono align="end" primary={int(r.calls)} /> },
      { key: 'promises', header: 'Promesas', align: 'end', sortable: true, sortValue: (r) => r.promises,
        render: (r) => <TableCell mono align="end" primary={r.promises} /> },
      { key: 'attention', header: 'Atención', align: 'end', sortable: true, sortValue: (r) => r.attention,
        render: (r) => <TableCell mono align="end" primary={`${r.attention}%`} /> },
      { key: 'recovered', header: 'Recuperado', align: 'end', sortable: true, sortValue: (r) => r.recovered,
        render: (r) => <TableCell align="end" primary={usd(r.recovered)} /> },
      { key: 'book', header: 'Cartera', align: 'end', sortable: true, sortValue: (r) => r.book,
        render: (r) => <TableCell align="end" primary={usd(r.book)} /> },
      {
        key: 'signals',
        header: 'Señales',
        render: (r) =>
          r.signals.length ? (
            <Stack direction="row" gap={1} wrap>
              {r.signals.map((s) => (
                <Badge key={s.label} tone={s.tone} size="sm">
                  {s.label}
                </Badge>
              ))}
            </Stack>
          ) : (
            <Text as="span" tone="faint">—</Text>
          ),
      },
      { key: 'mrr', header: 'MRR', align: 'end', sortable: true, sortValue: (r) => r.mrr,
        render: (r) => <TableCell align="end" primary={usd(r.mrr)} /> },
    ],
    [],
  );

  return (
    <Container max={1120}>
      <Stack gap={5}>
        {/* ── Page header: full-width lede; window controls on their own row ── */}
        <Stack gap={4}>
          <PageHeader
            eyebrow="Product · Cobranza"
            title="Cobranza · CompanyWise"
            lede="El desempeño del agente de cobranza en toda la flota — cada cliente que lo tiene live, en un solo lugar. Elige la ventana (Hoy / 7 / 30 / 90 días) y un segmento: todo el tablero — KPIs, gráficas, paneles y ranking — se re-calcula junto. Los montos están normalizados a USD; la tasa de recuperación es por-org. Haz clic en cualquier fila para el detalle del cliente."
          />
          <Stack direction="row" justify="between" align="center" wrap gap={3}>
            <Tabs
              variant="pills"
              size="sm"
              value={window}
              onChange={setWindow}
              items={[
                { value: 'hoy', label: 'Hoy' },
                { value: '7', label: '7 días' },
                { value: '30', label: '30 días' },
                { value: '90', label: '90 días' },
              ]}
            />
            <Stack direction="row" gap={2}>
              <Chip>Datos al 19 ago</Chip>
              <Chip variant="mono">USD · FX aprox. 2026-08</Chip>
            </Stack>
          </Stack>
        </Stack>

        {/* ── KPI row — StatCardGroup aligns labels, values and footers ────── */}
        <StatCardGroup columns={6}>
          <StatCard label="Clientes en segmento" value="24" footer="de 27 · 3 inactivos o sin correr" />
          <StatCard label="Llamadas · 90 días" value="1,284" footer="847 contactos · 402 correos · 190 WhatsApp" />
          <StatCard label="Promesas de pago" value="197" footer="sobre llamadas atendidas en la ventana" />
          <StatCard label="Recuperado · USD" value="$156K" delta={{ value: '18%', direction: 'up' }} footer="tasa de recuperación 34%" />
          <StatCard label="Cartera activa · USD" value="$693K" footer="libro actual, ponderado por monto" />
          <StatCard label="Tasa de atención" value="58%" delta={{ value: '4pts', direction: 'up' }} footer="42% de llamadas sin respuesta" />
        </StatCardGroup>

        {/* ── Contact activity + cumulative recovered ───────────────────── */}
        <Grid columns={2}>
          <Panel eyebrow="Contacto" title="Actividad de contacto por canal · 90 días">
            <ColumnChart
              height={200}
              data={contactByChannel}
              series={[
                { name: 'Llamadas', colorIndex: 0 },
                { name: 'Correos', colorIndex: 1 },
                { name: 'WhatsApp', colorIndex: 2 },
              ]}
              showLegend
            />
          </Panel>
          <Panel eyebrow="Dinero" title="Recuperado acumulado · USD">
            <Stack gap={4}>
              <Sparkline data={recovered} variant="area" tone="ok" width={440} height={200} marker smooth />
              <Text size="sm" tone="dim">
                Montos normalizados a USD (FX aprox. al 2026-08, ARS/MXN/…). La tasa de recuperación es por-org y comparable.
              </Text>
            </Stack>
          </Panel>
        </Grid>

        {/* ── Contact outcomes + aging book ─────────────────────────────── */}
        <Grid columns={2}>
          <Panel eyebrow="Contacto" title="Resultados de contacto · 90 días">
            <BarChart
              data={[
                { label: 'Atendidas', value: 742, tone: 'ok' },
                { label: 'Sin respuesta', value: 531, tone: 'neutral' },
                { label: 'Promesas', value: 197, tone: 'accent' },
                { label: 'Pagadas', value: 121, tone: 'ok' },
                { label: 'Escaladas', value: 34, tone: 'warn' },
                { label: 'Pago por verificar', value: 22, tone: 'warn' },
                { label: 'Cancelación por verificar', value: 8, tone: 'error' },
              ]}
              formatValue={int}
            />
          </Panel>
          <Panel eyebrow="Cartera" title="Cartera por antigüedad · USD (actual)">
            <BarChart
              data={[
                { label: 'Por vencer', value: 254_000, tone: 'ok' },
                { label: '0–14 días', value: 198_000, tone: 'neutral' },
                { label: '15–30 días', value: 143_000, tone: 'warn' },
                { label: '+30 días', value: 98_000, tone: 'error' },
              ]}
              formatValue={(v) => `$${Math.round(v / 1000)}k`}
            />
          </Panel>
        </Grid>

        {/* ── Where it gets stuck — uniform StatToggle grid ─────────────── */}
        <Panel
          eyebrow="Dónde se atora"
          title="Cuellos operativos del libro actual"
          aside={
            <Stack direction="row" gap={2} align="center">
              <Button variant="link" size="sm">
                limpiar filtro
              </Button>
              <Text as="span" size="sm" tone="dim">
                · Necesitan atención · Corrida atorada
              </Text>
            </Stack>
          }
        >
          <StatToggleGroup columns={4}>
            <StatToggle label="Inactivos" value={4} />
            <StatToggle label="Corridas colgadas" value={2} tone="warn" />
            <StatToggle label="Corridas atoradas" value={6} tone="error" active />
            <StatToggle label="Sin a quién contactar" value={3} tone="warn" />
            <StatToggle label="Sin datos de contacto" value={1} />
            <StatToggle label="Intentos agotados" value={5} tone="warn" />
            <StatToggle label="Pagos por verificar" value={9} tone="accent" />
            <StatToggle label="No contestan (tasa)" value="42%" hint="del total de llamadas" />
          </StatToggleGroup>
        </Panel>

        {/* ── Call reach: gauge + collapsible outcomes | hour-of-day ────── */}
        <Panel eyebrow="Alcance de llamadas · 90d" title="¿Con quién conecta el agente?">
          <Grid columns="minmax(240px, 1fr) 1px 1.4fr" gap={6}>
            <Stack gap={5}>
              <Stack gap={2} align="center">
                <RadialGauge value={58} variant="gauge" size={140} thickness={12} tone="ok" label="Tasa de contacto" />
                <Text size="sm" tone="dim" align="center">
                  1,284 llamadas · 742 conectaron
                </Text>
              </Stack>
              <Stack gap={2}>
                <BarChart data={outcomeRows} barSize="sm" formatValue={int} />
                {hiddenOutcomes > 0 && (
                  <Button variant="link" size="sm" onClick={() => setShowAllOutcomes((v) => !v)}>
                    {showAllOutcomes ? 'Ver menos' : `Ver más (${hiddenOutcomes})`}
                  </Button>
                )}
              </Stack>
            </Stack>

            <Divider orientation="vertical" />

            <Stack gap={3}>
              <Text size="body" weight="medium">
                ¿A qué hora contestan? (hora MX)
              </Text>
              <ColumnChart
                height={190}
                data={hourly}
                stacked
                series={[
                  { name: 'Contestadas', tone: 'ok' },
                  { name: 'Sin respuesta', tone: 'neutral' },
                ]}
                showLegend
              />
              <Text size="sm" tone="dim">
                El agente concentra el 68% de las llamadas en 4 horas y solo usa 6 horas del día. Ampliar la ventana
                horaria y probar tardes es la palanca de recuperación más grande.
              </Text>
            </Stack>
          </Grid>
        </Panel>

        {/* ── Agent quality + team bottlenecks (aligned StatCardGroups) ─── */}
        <Grid columns={2}>
          <Panel eyebrow="Calidad del agente" title="Qué tan bien cobra">
            <StatCardGroup columns={3}>
              <StatCard variant="plain" label="Conversión a promesa" value="197/742" />
              <StatCard variant="plain" label="Borradores rechazados" value="12/540" />
              <StatCard variant="plain" label="Feedback 👍 / 👎" value="88 / 9" />
            </StatCardGroup>
          </Panel>
          <Panel eyebrow="Cuellos de botella del equipo" title="Trabajo humano pendiente">
            <Stack gap={4}>
              <StatCardGroup columns={3}>
                <StatCard variant="plain" label="Pagos por verificar" value="9" />
                <StatCard variant="plain" label="Escalaciones abiertas" value="5" />
                <StatCard variant="plain" label="Aprobaciones pendientes" value="3" />
              </StatCardGroup>
              <Text size="sm" tone="dim">
                Pago o cancelación que el cliente afirma pero un humano no ha verificado, escalaciones abiertas, y (en
                orgs supervisados) borradores esperando aprobación. Es trabajo del equipo, no del agente.
              </Text>
            </Stack>
          </Panel>
        </Grid>

        {/* ── Opportunity areas ─────────────────────────────────────────── */}
        <Panel eyebrow="Áreas de oportunidad · 90 días" title="Dónde empujar primero">
          <StatCardGroup columns={3}>
            <StatCard variant="plain" label="Menor tasa de atención" value="Vértice Capital" footer="11% · 27 llamadas" />
            <StatCard variant="plain" label="Menor recuperación" value="Puerto Verde" footer="$9.2k de $154.8k" />
            <StatCard variant="plain" label="Menor conversión a promesa" value="Aurora Retail" footer="0 promesas · nunca corrió" />
          </StatCardGroup>
        </Panel>

        {/* ── Ranking: tabs + toolbar + table ───────────────────────────── */}
        <Stack gap={4}>
          <Tabs items={RANKING_TABS} value={tab} onChange={setTab} />
          <Toolbar>
            <SearchInput
              grow
              placeholder="Buscar cliente u org…"
              value={query}
              onValueChange={setQuery}
            />
            <Select value={signal} onChange={(e) => setSignal(e.target.value)}>
              <option value="">Cualquier señal</option>
              <option value="atorada">Corrida atorada</option>
              <option value="verificar">Pagos por verificar</option>
              <option value="contacto">Sin a quién contactar</option>
            </Select>
            <Select defaultValue="salud">
              <option value="salud">Salud (peor primero)</option>
              <option value="recuperado">Más recuperado</option>
              <option value="cartera">Mayor cartera</option>
              <option value="mrr">Mayor MRR</option>
            </Select>
            <ToolbarGroup align="end">
              <ResultCount>{`${CLIENTS.length} de 27`}</ResultCount>
            </ToolbarGroup>
          </Toolbar>
          <DataTable
            columns={columns}
            data={CLIENTS}
            rowKey={(r) => r.id}
            globalFilter={query}
            filterKeys={['name', 'org']}
            defaultSort={{ key: 'health', direction: 'asc' }}
            onRowClick={() => {}}
            emptyState={
              <EmptyState title="Ningún cliente coincide con el filtro." hint="Prueba otra ventana o limpia los filtros." />
            }
          />
        </Stack>
      </Stack>
    </Container>
  );
}

export const Dashboard: Story = {
  render: () => <CobranzaView />,
};
