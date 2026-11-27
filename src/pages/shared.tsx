/* Building blocks shared by the page stories. Library components only; the few styles they
 * cannot express live in pages.css. */
import { useState } from 'react';
import { Avatar } from '../components/Avatar/Avatar';
import { Badge, type BadgeTone } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { CarrierChip } from '../components/CarrierChip/CarrierChip';
import { Count } from '../components/Count/Count';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';
import { Icon, type IconName } from '../components/Icon/Icon';
import { SearchInput } from '../components/Input/SearchInput';
import { ListPage } from '../components/ListPage/ListPage';
import { Pagination } from '../components/Pagination/Pagination';
import {
  Sidebar,
  SidebarFooterItem,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from '../components/Sidebar/Sidebar';
import { StatCell, StatStrip, type StatCellProps } from '../components/StatCell/StatCell';
import { Tabs } from '../components/Tabs/Tabs';
import { Text } from '../components/Text/Text';
import { ThemeSwitch, type ThemeSwitchValue } from '../components/ThemeSwitch/ThemeSwitch';
import { ResultCount } from '../components/Toolbar/Toolbar';
import {
  money,
  PAYMENT_ROWS,
  RECEIPT_ROWS,
  RECEIPT_STATS,
  REGISTROS_TABS,
  type PaymentRow,
  type ReceiptRow,
  type ReceiptStatus,
} from './fixtures';
import './pages.css';

/* --------------------------------- sidebar --------------------------------- */

export type PageNav = 'registros' | 'validacion' | 'chat' | 'cotizacion' | 'conciliador' | 'cobranza' | 'servicio' | 'configuracion';

const SISTEMA: { key: PageNav; label: string; icon: IconName }[] = [
  { key: 'registros', label: 'Registros', icon: 'database' },
  { key: 'validacion', label: 'Validación de pagos', icon: 'shield-check' },
  { key: 'chat', label: 'Chatea sobre tus recibos', icon: 'message-square-text' },
];

const AGENTES: { key: PageNav; label: string; icon: IconName }[] = [
  { key: 'cotizacion', label: 'Agente de Cotización', icon: 'file-text' },
  { key: 'conciliador', label: 'Agente Conciliador', icon: 'git-compare-arrows' },
  { key: 'cobranza', label: 'Agente de Cobranza', icon: 'phone' },
  { key: 'servicio', label: 'Servicio de Cotización', icon: 'zap' },
];

/** The Figma sidebar. `configuracion` marks the single settings entry in the footer. */
export function PagesSidebar({ active }: { active: PageNav }) {
  const [theme, setTheme] = useState<ThemeSwitchValue>('system');
  const entry = (e: (typeof SISTEMA)[number]) => (
    <SidebarItem key={e.key} icon={<Icon name={e.icon} />} label={e.label} active={e.key === active} />
  );
  return (
    <Sidebar
      as="nav"
      aria-label="Navegación principal"
      utility={
        <>
          <SidebarItem icon={<Icon name="settings" />} label="Configuración" active={active === 'configuracion'} />
          <ThemeSwitch value={theme} onChange={setTheme} />
        </>
      }
      footer={
        <SidebarFooterItem
          media={<Avatar initials="CR" size="md" role="img" aria-label="Camila Reyes" />}
          label="Camila Reyes"
          sublabel="Handle"
          chevron
        />
      }
    >
      <SidebarHeader />
      <SidebarSection label="Sistema de Registro" collapsible={false}>
        {SISTEMA.map(entry)}
      </SidebarSection>
      <SidebarSection label="Agentes" collapsible={false}>
        {AGENTES.map(entry)}
      </SidebarSection>
    </Sidebar>
  );
}

/* ---------------------------------- helpers ---------------------------------- */

const BADGE_TONE: Record<ReceiptStatus, BadgeTone> = {
  Pendiente: 'warning',
  Pagado: 'success',
  Vencido: 'danger',
  'Sin conectar': 'idle',
};

type Stat = { label: string; value: string; tone: StatCellProps['tone']; detail?: string; progress?: number };

export function StatPanel({ label, stats }: { label: string; stats: readonly Stat[] }) {
  return (
    <StatStrip aria-label={label}>
      {stats.map((s) => (
        <StatCell
          key={s.label}
          label={s.label}
          value={s.value}
          tone={s.tone}
          detail={
            s.progress == null ? (
              s.detail
            ) : (
              <>
                <span className="pg-progress" role="presentation">
                  <span style={{ width: `${s.progress}%` }} />
                </span>
                {s.detail}
              </>
            )
          }
        />
      ))}
    </StatStrip>
  );
}

const SEARCH_BOX = { width: 300 } as const;

/* ------------------------- Recibos (App shell and Registros) ------------------------- */

const RECEIPT_COLUMNS: DataTableColumn<ReceiptRow>[] = [
  {
    key: 'numero',
    header: 'No. Recibo',
    sortable: true,
    width: '240px',
    render: (r) => (
      <Text as="span" variant="mono-sm" weight="medium">
        {r.numero}
      </Text>
    ),
  },
  { key: 'cliente', header: 'Cliente', sortable: true, width: '320px' },
  {
    key: 'estado',
    header: 'Estado',
    sortable: true,
    width: '160px',
    render: (r) => (
      <Badge tone={BADGE_TONE[r.estado]} dot>
        {r.estado}
      </Badge>
    ),
  },
  { key: 'monto', header: 'Monto', numeric: true, sortable: true, nulls: 'last', width: '200px', render: (r) => money(r.monto) },
  {
    key: 'vence',
    header: 'Vence',
    sortable: true,
    render: (r) => <Text as="span" tone="tertiary">{r.vence}</Text>,
  },
];

export interface ReceiptsPageProps {
  /** Label of the header action. Page 03 says "Ejecutar validación", page 07 "Validador de pagos". */
  action: { label: string; icon: IconName; primary: boolean };
  /** Page 07 draws a rule under the header. */
  divided?: boolean;
}

/** The receipts list: Registros active, tabs with counts, five stats, search, table, pagination. */
export function ReceiptsPage({ action, divided = false }: ReceiptsPageProps) {
  const [tab, setTab] = useState('recibos');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  return (
    <ListPage
      className={divided ? 'pg-divided' : undefined}
      sidebar={<PagesSidebar active="registros" />}
      title="Recibos"
      actions={
        <Button variant={action.primary ? 'default' : 'secondary'} icon={action.icon}>
          {action.label}
        </Button>
      }
      tabs={
        <Tabs
          aria-label="Vistas de registros"
          items={REGISTROS_TABS}
          value={tab}
          onChange={setTab}
        />
      }
      stats={<StatPanel label="Resumen de recibos" stats={RECEIPT_STATS} />}
      toolbar={
        <>
          <div style={SEARCH_BOX}>
            <SearchInput
              grow
              variant="default"
              aria-label="Buscar recibo o cliente"
              placeholder="Buscar recibo o cliente…"
              value={query}
              onValueChange={setQuery}
            />
          </div>
          <Button variant="secondary" icon="sliders-horizontal">
            Filtros
          </Button>
        </>
      }
      toolbarEnd={<ResultCount>53,938 registros</ResultCount>}
      pagination={<Pagination page={page} pageSize={10} total={53938} onPageChange={setPage} />}
      tableLabel="Tabla de recibos"
    >
      <DataTable
        card={false}
        caption="Recibos"
        captionHidden
        columns={RECEIPT_COLUMNS}
        data={RECEIPT_ROWS}
        globalFilter={query}
        filterKeys={['numero', 'cliente']}
        rowKey={(r) => r.numero}
      />
    </ListPage>
  );
}

/* ------------------------------ Validación de pagos ------------------------------ */

const PAYMENT_COLUMNS: DataTableColumn<PaymentRow>[] = [
  {
    key: 'cliente',
    header: 'Cliente',
    sortable: true,
    width: '330px',
    render: (r) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--he-spacing-2)' }}>
        <Text as="span" weight="medium">
          {r.cliente}
        </Text>
        {r.recibos > 1 && <Count aria-label={`${r.recibos} recibos`}>{r.recibos}</Count>}
      </span>
    ),
  },
  { key: 'poliza', header: 'Póliza', width: '190px', render: (r) => <Text as="span" variant="mono-sm" tone="secondary">{r.poliza}</Text> },
  { key: 'aseguradora', header: 'Aseguradora', sortable: true, width: '170px' },
  { key: 'prima', header: 'Prima total', numeric: true, sortable: true, width: '190px', render: (r) => money(r.prima) },
  {
    key: 'limite',
    header: 'Límite de pago',
    render: (r) => (
      <Badge tone={r.limite.tone} dot>
        {r.limite.label}
      </Badge>
    ),
  },
];

export const paymentColumns = PAYMENT_COLUMNS;
export const paymentRows = PAYMENT_ROWS;

export function SyncNotice() {
  return (
    <section className="pg-notice" aria-label="Estado de sincronización">
      <div className="pg-notice__body">
        <p className="pg-notice__title">
          <span className="pg-notice__dot" aria-hidden />
          Estamos revisando 4 credenciales · 1 sin datos nuevos
        </p>
        <div className="pg-notice__carriers">
          <CarrierChip name="Chubb" state="warning" />
          <CarrierChip name="AXA" state="warning" />
          <CarrierChip name="Plan Seguro" state="warning" />
          <CarrierChip name="SMNYL" state="warning" />
          <span className="pg-notice__more">+1 más</span>
        </div>
      </div>
      <Button variant="link">Ver detalle</Button>
    </section>
  );
}

export function PaymentDetail({ row }: { row: PaymentRow }) {
  if (row.recibos < 2) return null;
  return (
    <ul className="pg-detail" aria-label={`Recibos de ${row.cliente}`}>
      {Array.from({ length: row.recibos }, (_, i) => (
        <li key={i}>
          Recibo {i + 1} de {row.recibos} · {money(row.prima / row.recibos)}
        </li>
      ))}
    </ul>
  );
}
