import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';

import { Avatar } from '../components/Avatar/Avatar';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Container, Grid, Stack } from '../components/Layout/Layout';
import { List, ListItem, type ListItemStatus } from '../components/List/List';
import { Menu, MenuFilter, MenuGroup, MenuItem } from '../components/Menu/Menu';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Panel } from '../components/Panel/Panel';
import { Segmented } from '../components/Segmented/Segmented';
import {
  Sidebar,
  SidebarFooterItem,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from '../components/Sidebar/Sidebar';
import { StatusPill } from '../components/StatusPill/StatusPill';
import { Text } from '../components/Text/Text';
import { ThemeSwitch } from '../components/ThemeSwitch/ThemeSwitch';
import { applyTheme, type ThemeMode } from '../lib/theme';

/**
 * The application shell: the rail on the left, a page on the right, built end-to-end
 * from Handle Elements with ZERO custom styling — no inline style objects and no
 * bespoke classes. Even the two-column shell is a library element (`Grid` with an
 * explicit `columns` track), so the whole file is copy-pasteable into the app.
 *
 * The rail is the point of this example. It answers, in one place, every defect the
 * hand-built rail carried:
 *
 * - The organisation switcher marks the current account with a CHECK, never a bar.
 *   There is no spine anywhere in this file (`.he-sidebar-item--active` is a
 *   `--he-surface-2` fill plus weight 500).
 * - Groups are keyed by TENANT ID, so an organisation gets exactly one heading —
 *   the fixture deliberately contains two accounts with the identical display name
 *   "Alfonso de los rios" inside the same tenant (Handle). Grouping by display name
 *   is what printed "HANDLE" twice; grouping by id prints it once and the two rows
 *   stay apart on their mono sublabel (`handle.mx · Propietario` vs
 *   `handle.mx · Facturación`).
 * - Avatars are the library `Avatar` — round, `tone={0}` on every switcher row,
 *   because the automatic tone hashes the name and would hand the two identically
 *   named accounts the same colour AND the same initials: colour carrying nothing.
 * - The filter really filters, "Cerrar sesión" is a pinned footer OUTSIDE the
 *   scrolling list, and the popover clips its own rounded corners.
 * - Configuración / Admin / Tema / Entorno all sit in `Sidebar`'s `utility` block,
 *   so they share the nav rows' left-aligned rhythm instead of floating centered.
 * - Every control is real: the theme switch writes `data-theme` on the document via
 *   `applyTheme`, so the whole shell inverts; the environment switch drives the
 *   ambient `StatusPill` in the page header — an environment you can misread is a
 *   production hazard, so DEV is never silent.
 *
 * Language is consistent per control: the rail's chrome and the page are Spanish.
 * "Live"/"Dev" stay untranslated because they are the deploy targets' names.
 */
const meta = {
  title: 'Examples/App Shell',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ icons */

/* Icons are caller-supplied inline SVGs (the library ships none and takes no icon
 * dependency). One 15-unit grid, one stroke weight — 1.4, round caps — matching the
 * Sidebar chevron and the ThemeSwitch glyphs, so the rail has a single hand. */
const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const icons = {
  brandmark: (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" aria-hidden>
      <circle cx="6.5" cy="6" r="3" />
      <circle cx="15.5" cy="16" r="3" />
      <rect x="9.4" y="2.8" width="3.4" height="16.4" rx="1.7" transform="rotate(35 11 11)" />
    </svg>
  ),
  rail: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="12" height="11" rx="2" {...stroke} />
      <path d="M5.5 2V13" {...stroke} />
    </svg>
  ),
  home: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M2 6.6 7.5 2l5.5 4.6V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.6Z" {...stroke} />
    </svg>
  ),
  receipts: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M3 1.8h9v11.4l-2.2-1.2-2.3 1.2-2.3-1.2L3 13.2V1.8Z" {...stroke} />
      <path d="M5.6 5.2h3.8M5.6 7.9h3.8" {...stroke} />
    </svg>
  ),
  policies: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="2.5" y="1.8" width="10" height="11.4" rx="2" {...stroke} />
      <path d="M5.2 5.4h4.6M5.2 8.1h4.6M5.2 10.6h2.6" {...stroke} />
    </svg>
  ),
  renewals: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M12.6 6.2A5.2 5.2 0 1 0 12.4 9" {...stroke} />
      <path d="M12.9 2.6v3.6H9.3" {...stroke} />
    </svg>
  ),
  reconcile: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M2 4.4h7.2M2 10.6h7.2" {...stroke} />
      <path d="M11 2.6 13 4.4l-2 1.8M11 8.8l2 1.8-2 1.8" {...stroke} />
    </svg>
  ),
  folder: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M1.5 4.5C1.5 3.7 2.2 3 3 3h2.5L7 4.5h5c.8 0 1.5.7 1.5 1.5v4.5c0 .8-.7 1.5-1.5 1.5H3c-.8 0-1.5-.7-1.5-1.5V4.5Z"
        {...stroke}
      />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="5.6" {...stroke} />
      <circle cx="7.5" cy="7.5" r="1.7" {...stroke} />
      <path d="M7.5 1.9V4M7.5 11v2.1M1.9 7.5H4M11 7.5h2.1" {...stroke} />
    </svg>
  ),
  admin: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 1.8 12.4 3.6v4.1c0 3-2.1 4.7-4.9 5.5-2.8-.8-4.9-2.5-4.9-5.5V3.6L7.5 1.8Z" {...stroke} />
      <path d="M5.6 7.6 7 9l2.4-2.6" {...stroke} />
    </svg>
  ),
  clock: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="5.7" {...stroke} />
      <path d="M7.5 4.3v3.4l2.2 1.4" {...stroke} />
    </svg>
  ),
  add: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 3.4v8.2M3.4 7.5h8.2" {...stroke} />
    </svg>
  ),
};

/* ------------------------------------------------------------------ fixtures */

interface Account {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface Tenant {
  tenantId: string;
  name: string;
  accounts: Account[];
}

/**
 * Seven accounts across three organisations. The fixture reproduces the screenshot's
 * bug on purpose: `acc_handle_owner` and `acc_handle_billing` carry the SAME display
 * name inside the SAME tenant. Group by `tenantId` and Handle gets one heading with
 * two rows; group by `name` — what the hand-built popover did — and you get the two
 * "HANDLE" headings that explained nothing.
 */
const TENANTS: Tenant[] = [
  {
    tenantId: 'ten_handle',
    name: 'Handle',
    accounts: [
      { id: 'acc_handle_owner', name: 'Alfonso de los rios', slug: 'handle.mx', role: 'Propietario' },
      { id: 'acc_handle_billing', name: 'Alfonso de los rios', slug: 'handle.mx', role: 'Facturación' },
      { id: 'acc_handle_mesa', name: 'Mesa de control', slug: 'handle.mx', role: 'Operaciones' },
    ],
  },
  {
    tenantId: 'ten_handle_qa',
    name: 'Handle QA',
    accounts: [
      { id: 'acc_qa_admin', name: 'Alfonso de los Rios', slug: 'handle-qa.mx', role: 'Admin' },
      { id: 'acc_qa_support', name: 'Soporte QA', slug: 'handle-qa.mx', role: 'Soporte' },
    ],
  },
  {
    tenantId: 'ten_click',
    name: 'Click Seguros',
    accounts: [
      { id: 'acc_click_owner', name: 'Poncho', slug: 'click.mx', role: 'Propietario' },
      { id: 'acc_click_renov', name: 'Renovaciones', slug: 'click.mx', role: 'Analista' },
    ],
  },
];

const ALL_ACCOUNTS = TENANTS.flatMap((t) => t.accounts);
const TENANT_OF = new Map(TENANTS.flatMap((t) => t.accounts.map((a) => [a.id, t] as const)));

const NAV = [
  { value: 'inicio', label: 'Inicio', icon: icons.home },
  { value: 'recibos', label: 'Recibos', icon: icons.receipts, end: '142' },
  { value: 'polizas', label: 'Pólizas', icon: icons.policies },
  { value: 'renovaciones', label: 'Renovaciones', icon: icons.renewals, end: '270' },
  { value: 'conciliacion', label: 'Conciliación', icon: icons.reconcile },
];

const SPACES = ['Cartera comercial', 'Autos flotilla', 'Vida y gastos médicos'];

/* A rail with three rows and 300px of nothing under them is loose where it should be
 * dense. Recently opened records fill it with something worth clicking. */
const RECENT = [
  'Grupo Aceros Norte',
  'Minera San Rafael',
  'Corporativo Santa Fe',
  'Hotelera Cancún',
  'Naviera Veracruz',
];

type ReceiptRow = {
  id: string;
  customer: string;
  policy: string;
  status?: ListItemStatus;
  due: string;
};

const RECEIPTS: ReceiptRow[] = [
  { id: 'r1', customer: 'Modelos Economicos Aho Sapi de C.V.', policy: '687457622', status: 'error', due: 'vencido 3d' },
  { id: 'r2', customer: 'Regio Gas S.A. de C.V.', policy: '628515652', status: 'error', due: 'vencido 1d' },
  { id: 'r3', customer: 'Juan Manuel Santillán Rodríguez', policy: '688165414', status: 'warn', due: 'vence en 1d' },
  { id: 'r4', customer: 'César Gabriel Guerra Ramón', policy: '628537110', status: 'warn', due: 'vence en 2d' },
  { id: 'r5', customer: 'Inovek Monterrey S.A. de C.V.', policy: '570346098', due: 'vence en 12d' },
  { id: 'r6', customer: 'Cristina Peña González', policy: '688166776', due: 'vence en 14d' },
  { id: 'r7', customer: 'Hugo Bernardo González Barba', policy: '689357648', due: 'vence en 18d' },
  { id: 'r8', customer: 'Omar Antonio Arvayo Castro', policy: '689559003', due: 'vence en 21d' },
  { id: 'r9', customer: 'Comercializadora del Valle S.A. de C.V.', policy: '628719044', due: 'vence en 24d' },
  { id: 'r10', customer: 'María Fernanda Robles Lugo', policy: '688904531', due: 'vence en 26d' },
  { id: 'r11', customer: 'Transportes Sierra Alta S. de R.L.', policy: '570992188', due: 'vence en 29d' },
  { id: 'r12', customer: 'Constructora Tepeyac S.A. de C.V.', policy: '687330214', due: 'vence en 31d' },
  { id: 'r13', customer: 'Molinos del Bajío S.A. de C.V.', policy: '628901337', due: 'vence en 34d' },
  { id: 'r14', customer: 'Clínica Zamora S.C.', policy: '689774120', due: 'vence en 38d' },
];

/* Three fields, because a 332px rail fits three — and the ago/result strings are
 * kept short for the same reason: "HDI Seg… hace 1 …" is a half-printed row, which
 * is worse than a shorter word. */
const SYNCS = [
  { id: 's1', source: 'GNP', ago: '3 h', result: '12 nuevos' },
  { id: 's2', source: 'ANA Seguros', ago: '9 h', result: 'sin cambios' },
  { id: 's3', source: 'Quálitas', ago: '1 d', result: '4 nuevos' },
  { id: 's4', source: 'HDI', ago: '1 mes', result: 'sin cambios' },
];

const ENV_OPTIONS = [
  { value: 'live' as const, label: 'Live' },
  /* The only toned segment: a 6px dot at bullet scale, no band, no wash. Dev is the
   * state you must not mistake for production, so it is the one that is marked. */
  { value: 'dev' as const, label: 'Dev', tone: 'warn' as const },
];

/* ------------------------------------------------------------------ the shell */

function AppShellView({ startCollapsed = false }: { startCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const [nav, setNav] = useState('recibos');
  const [space, setSpace] = useState<string | null>(null);
  const [env, setEnv] = useState<'live' | 'dev'>('live');
  const [mode, setMode] = useState<ThemeMode>(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light',
  );

  /* switcher state */
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [currentId, setCurrentId] = useState('acc_handle_owner');

  const current = ALL_ACCOUNTS.find((a) => a.id === currentId) as Account;
  const currentTenant = TENANT_OF.get(currentId) as Tenant;

  /* The filter is a real filter: it narrows accounts and drops tenants that end up
   * empty, so no heading survives without rows under it. */
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TENANTS.map((tenant) => ({
      ...tenant,
      accounts: tenant.accounts.filter(
        (a) => !needle || `${a.name} ${a.slug} ${a.role} ${tenant.name}`.toLowerCase().includes(needle),
      ),
    })).filter((tenant) => tenant.accounts.length > 0);
  }, [query]);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    applyTheme(next);
  };

  /* A real host owns `data-theme` alone, and the `useState` above is the whole
   * recipe. Storybook is a SECOND writer of the same attribute (its theme
   * toolbar), so the story mirrors external writes back into state — otherwise the
   * switch would sit on "Claro" while the shell renders dark, and a control that
   * misreports itself is worse than no control. Delete this effect when you copy
   * the file into the app. */
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setMode(html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    sync();
    return () => observer.disconnect();
  }, []);

  const switcher = (
    <Menu
      label="Cuentas"
      placement="top-start"
      matchTriggerWidth={!collapsed}
      open={open}
      /* Clear the query on every close. A filter that survives the popover turns
       * the NEXT open into "Sin resultados" for a string the user typed minutes
       * ago — an empty switcher with no explanation. */
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
      header={
        <MenuFilter
          value={query}
          onValueChange={setQuery}
          label="Filtrar organizaciones"
          placeholder="Filtrar organizaciones…"
        />
      }
      footer={
        <MenuItem destructive onSelect={() => setOpen(false)}>
          Cerrar sesión
        </MenuItem>
      }
      trigger={
        <SidebarFooterItem
          open={open}
          chevron
          media={<Avatar size="sm" tone={0} name={current.name} />}
          label={current.name}
          sublabel={`${currentTenant.name} · ${current.role}`}
        />
      }
    >
      {groups.length === 0 ? (
        <EmptyState size="sm" title="Sin resultados" hint={`Nada coincide con “${query.trim()}”.`} />
      ) : (
        groups.map((tenant) => (
          /* One heading per ORGANISATION, keyed by tenantId — never by display name. */
          <MenuGroup key={tenant.tenantId} label={tenant.name}>
            {tenant.accounts.map((account) => (
              <MenuItem
                key={account.id}
                checked={account.id === currentId}
                media={<Avatar size="sm" tone={0} name={account.name} />}
                sublabel={`${account.slug} · ${account.role}`}
                onSelect={() => setCurrentId(account.id)}
              >
                {account.name}
              </MenuItem>
            ))}
          </MenuGroup>
        ))
      )}
    </Menu>
  );

  return (
    /* The shell itself is a library element: an explicit two-track Grid with no gap.
     * The rail track is the Sidebar's own width so the two never disagree. */
    <Grid columns={`${collapsed ? '56px' : '250px'} minmax(0, 1fr)`} gap={0}>
      <Sidebar
        as="nav"
        collapsed={collapsed}
        aria-label="Navegación principal"
        utility={
          <>
            {/* Settings rows first, so the theme and environment controls inherit
             * their left edge instead of floating centered under them. */}
            <SidebarItem
              icon={icons.settings}
              label="Configuración"
              active={nav === 'configuracion'}
              onClick={() => setNav('configuracion')}
            />
            <SidebarItem icon={icons.admin} label="Admin" active={nav === 'admin'} onClick={() => setNav('admin')} />
            <ThemeSwitch
              value={mode}
              onChange={setTheme}
              label="Tema"
              labels={{ light: 'Claro', dark: 'Oscuro' }}
              iconOnly={collapsed}
            />
            {/* Collapsed, this becomes the same single toggle ThemeSwitch uses —
             * the tone dot and the tooltip carry the environment. Hiding it
             * instead would leave no indication anywhere on a 56px rail of
             * whether you are pointed at production. */}
            <Segmented<'live' | 'dev'>
              label="Entorno"
              block
              value={env}
              onChange={setEnv}
              options={ENV_OPTIONS}
              iconOnly={collapsed}
            />
          </>
        }
        footer={switcher}
      >
        <SidebarHeader>
          <Stack direction="row" gap={2} align="center">
            {icons.brandmark}
            {!collapsed && (
              <Text as="span" size="body" weight="medium">
                handle
              </Text>
            )}
          </Stack>
          <Button
            variant="ghost"
            size="xs"
            aria-label={collapsed ? 'Expandir la barra lateral' : 'Colapsar la barra lateral'}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((v) => !v)}
          >
            {icons.rail}
          </Button>
        </SidebarHeader>

        {NAV.map((item) => (
          <SidebarItem
            key={item.value}
            icon={item.icon}
            label={item.label}
            end={item.end}
            active={nav === item.value}
            onClick={() => setNav(item.value)}
          />
        ))}

        <SidebarSection
          label="Espacios"
          action={
            <Button variant="ghost" size="xs" aria-label="Nuevo espacio">
              {icons.add}
            </Button>
          }
        >
          {SPACES.map((name) => (
            <SidebarItem
              key={name}
              icon={icons.folder}
              label={name}
              active={space === name}
              onClick={() => setSpace(name)}
            />
          ))}
        </SidebarSection>

        <SidebarSection label="Recientes" defaultOpen>
          {RECENT.map((name) => (
            /* Iconed like every other row: one text column down the whole rail. */
            <SidebarItem
              key={name}
              icon={icons.clock}
              label={name}
              active={space === name}
              onClick={() => setSpace(name)}
            />
          ))}
        </SidebarSection>
      </Sidebar>

      <Container max={1080}>
        <Stack gap={5}>
          <PageHeader
            title="Recibos"
            subtitle={`${currentTenant.name} · ${current.slug}`}
            lede="Cobranza de la cartera activa. Los recibos vencidos encabezan la lista."
            aside={
              <Stack direction="row" gap={2} align="center">
                {/* The environment switch is never silent: Dev states itself here. */}
                <StatusPill
                  status={env === 'dev' ? 'warn' : 'ok'}
                  label={env === 'dev' ? 'Entorno Dev' : 'Entorno Live'}
                />
                <Button variant="secondary" size="sm">
                  Exportar
                </Button>
                <Button size="sm">Registrar pago</Button>
              </Stack>
            }
          />

          <Grid columns="minmax(0, 2fr) minmax(0, 1fr)" gap={5}>
            <Panel
              flush
              title="Por cobrar"
              lede={`${RECEIPTS.length} recibos · 2 vencidos`}
              aside={
                <Button variant="link" size="sm">
                  Ver los 142
                </Button>
              }
            >
              <List variant="divided" size="sm" gutter>
                {RECEIPTS.map((r) => (
                  <ListItem
                    key={r.id}
                    href="#"
                    status={r.status}
                    primary={r.customer}
                    meta={`Póliza ${r.policy}`}
                    value={r.due}
                  />
                ))}
              </List>
            </Panel>

            <Panel flush title="Últimas sincronizaciones">
              <List variant="divided" size="sm">
                {SYNCS.map((s) => (
                  <ListItem
                    key={s.id}
                    leading={<Avatar size="sm" name={s.source} />}
                    primary={s.source}
                    meta={s.ago}
                    trailing={
                      <Chip variant="mono" size="sm">
                        {s.result}
                      </Chip>
                    }
                  />
                ))}
              </List>
            </Panel>
          </Grid>
        </Stack>
      </Container>
    </Grid>
  );
}

/* ------------------------------------------------------------------ stories */

export const Shell: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The rail in situ. Open the account row at the bottom: the current account is marked with a check (no ' +
          'spine, no full-bleed fill), Handle prints ONE heading even though two of its accounts share the display ' +
          'name "Alfonso de los rios", the filter narrows live, and "Cerrar sesión" is pinned outside the scroll ' +
          'region. Configuración, Admin, Tema and Entorno share the nav rows\' left edge in the `utility` block. ' +
          'The theme switch writes `data-theme` on <html> through `applyTheme`, so the whole shell inverts; the ' +
          'environment switch drives the StatusPill in the page header. The rail button in the brand header ' +
          'collapses the rail to 56px.',
      },
    },
  },
  render: () => <AppShellView />,
};

export const CollapsedRail: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same shell on the 56px rail. Rows keep their accessible name and gain a right-placed Tooltip, the ' +
          'ThemeSwitch becomes one ghost icon button whose name carries the action ("Tema: Claro → Oscuro"), and ' +
          'the switcher popover opens beside the rail instead of matching its width. Use the rail button in the ' +
          'header to expand.',
      },
    },
  },
  render: () => <AppShellView startCollapsed />,
};
