/* Story fixtures shared by the Sidebar, App shell and List page stories.
 * Invented Spanish data only: no real brokers, insureds or policy numbers. */
import { useState, type ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Badge, type BadgeTone } from '../Badge/Badge';
import { Icon, type IconName } from '../Icon/Icon';
import {
  Sidebar,
  SidebarFooterItem,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from '../Sidebar/Sidebar';
import { ThemeSwitch, type ThemeSwitchValue } from '../ThemeSwitch/ThemeSwitch';
import type { DataTableColumn } from '../DataTable/DataTable';

export type NavKey = 'registros' | 'validacion' | 'chat' | 'cotizacion' | 'conciliador' | 'cobranza' | 'servicio';

interface NavEntry {
  key: NavKey;
  label: string;
  icon: IconName;
}

const REGISTRO: NavEntry[] = [
  { key: 'registros', label: 'Registros', icon: 'database' },
  { key: 'validacion', label: 'Validación de pagos', icon: 'shield-check' },
  { key: 'chat', label: 'Chatea sobre tus recibos', icon: 'message-square-text' },
];

const AGENTES: NavEntry[] = [
  { key: 'cotizacion', label: 'Agente de Cotización', icon: 'file-text' },
  { key: 'conciliador', label: 'Agente Conciliador', icon: 'git-compare-arrows' },
  { key: 'cobranza', label: 'Agente de Cobranza', icon: 'phone' },
  { key: 'servicio', label: 'Servicio de Cotización', icon: 'zap' },
];

const item = (entry: NavEntry, active: NavKey) => (
  <SidebarItem
    key={entry.key}
    icon={<Icon name={entry.icon} />}
    label={entry.label}
    active={entry.key === active}
    onClick={() => undefined}
  />
);

export interface DemoSidebarProps {
  /** Which Area is current. */
  active?: NavKey;
  collapsed?: boolean;
  theme?: ThemeSwitchValue;
}

/** The Figma sidebar: logo, two labelled sections, Configuración, theme control, Profile. */
export function DemoSidebar({ active = 'registros', collapsed = false, theme = 'system' }: DemoSidebarProps) {
  const [mode, setMode] = useState<ThemeSwitchValue>(theme);
  return (
    <Sidebar
      aria-label="Navegación principal"
      as="nav"
      flat
      collapsed={collapsed}
      utility={
        <>
          <SidebarItem icon={<Icon name="settings" />} label="Configuración" onClick={() => undefined} />
          <ThemeSwitch value={mode} onChange={setMode} />
        </>
      }
      footer={
        <SidebarFooterItem
          media={<Avatar initials="CR" size="md" role="img" />}
          label="Camila Reyes"
          sublabel="Handle"
          chevron
        />
      }
    >
      <SidebarHeader />
      <SidebarSection label="Sistema de Registro" collapsible={false}>
        {REGISTRO.map((e) => item(e, active))}
      </SidebarSection>
      <SidebarSection label="Agentes" collapsible={false}>
        {AGENTES.map((e) => item(e, active))}
      </SidebarSection>
    </Sidebar>
  );
}

/* ---------------------------------- receipts ---------------------------------- */

export type ReceiptStatus = 'Pendiente' | 'Pagado' | 'Vencido' | 'Sin conectar';

export interface Receipt {
  id: string;
  cliente: string;
  poliza: string;
  aseguradora: string;
  estado: ReceiptStatus;
  monto: number | null;
  vence: string;
}

export const RECEIPTS: Receipt[] = [
  { id: '80009160423', cliente: 'Juan Pacheco Aranda', poliza: 'AF-4410021', aseguradora: 'Seguros Afirme', estado: 'Pendiente', monto: null, vence: 'en 363 d' },
  { id: '12606458245', cliente: 'Marisol Vega Hinojosa', poliza: 'GN-7782310', aseguradora: 'GNP', estado: 'Pagado', monto: 470.36, vence: 'pagado' },
  { id: '12606454690', cliente: 'Ernesto Quiroz Ledesma', poliza: 'AX-1093348', aseguradora: 'AXA', estado: 'Pendiente', monto: null, vence: 'en 358 d' },
  { id: '001112', cliente: 'Patricia Nava Salcedo', poliza: 'QL-5521907', aseguradora: 'Qualitas', estado: 'Vencido', monto: 24296.33, vence: 'hace 4 d' },
  { id: '590046192', cliente: 'Rodolfo Beltrán Ibarra', poliza: 'MP-3308815', aseguradora: 'Mapfre', estado: 'Sin conectar', monto: null, vence: 'en 120 d' },
  { id: '80009171188', cliente: 'Lucía Ferrer Montoya', poliza: 'AF-4410877', aseguradora: 'Seguros Afirme', estado: 'Pagado', monto: 8120.5, vence: 'pagado' },
  { id: '12606461032', cliente: 'Héctor Zamora Peña', poliza: 'GN-7790012', aseguradora: 'GNP', estado: 'Pendiente', monto: 15342.0, vence: 'en 12 d' },
];

const TONE: Record<ReceiptStatus, BadgeTone> = {
  Pendiente: 'warning',
  Pagado: 'success',
  Vencido: 'danger',
  'Sin conectar': 'idle',
};

export const peso = (value: number | null): ReactNode =>
  value == null ? '—' : value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

/** Table columns of the receipts list: client, carrier, status Badge, numeric amount, due date. */
export const RECEIPT_COLUMNS: DataTableColumn<Receipt>[] = [
  {
    key: 'cliente',
    header: 'Cliente',
    sortable: true,
    render: (r) => (
      <span style={{ display: 'grid' }}>
        <span style={{ fontWeight: 500 }}>{r.cliente}</span>
        <span style={{ color: 'var(--he-text-tertiary)', fontSize: 'var(--he-type-caption-size)' }}>{r.poliza}</span>
      </span>
    ),
  },
  { key: 'aseguradora', header: 'Aseguradora', sortable: true },
  {
    key: 'estado',
    header: 'Estado',
    sortable: true,
    render: (r) => (
      <Badge tone={TONE[r.estado]} dot>
        {r.estado}
      </Badge>
    ),
  },
  { key: 'monto', header: 'Monto', numeric: true, sortable: true, nulls: 'last', render: (r) => peso(r.monto) },
  {
    key: 'vence',
    header: 'Vence',
    render: (r) => <span style={{ color: 'var(--he-text-tertiary)' }}>{r.vence}</span>,
  },
];
