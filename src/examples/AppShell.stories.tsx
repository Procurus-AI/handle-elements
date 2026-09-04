import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Avatar } from '../components/Avatar/Avatar';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import { DescriptionItem, DescriptionList } from '../components/DescriptionList/DescriptionList';
import { Container, Grid, Stack } from '../components/Layout/Layout';
import { List, ListItem, type ListItemStatus } from '../components/List/List';
import { Menu, MenuGroup, MenuItem, MenuSeparator, MenuStatic, MenuSub } from '../components/Menu/Menu';
import { Modal } from '../components/Modal/Modal';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Panel } from '../components/Panel/Panel';
import { Segmented } from '../components/Segmented/Segmented';
import {
  Sidebar,
  SidebarFooterItem,
  SidebarFooterRow,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from '../components/Sidebar/Sidebar';
import { StatusPill } from '../components/StatusPill/StatusPill';
import { Text } from '../components/Text/Text';
import {
  applyTheme,
  resolveTheme,
  watchResolvedTheme,
  type ThemeMode,
  type ThemePreference,
} from '../lib/theme';

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
 * - The identity block is a `MenuStatic` in the menu's `header` — pinned, outside the
 *   scroll, and NOT a `<MenuItem disabled>`, which would still be in the roving set
 *   and would render the identity at 45% opacity. "Cerrar sesión" is the matching
 *   pinned `footer`, and the popover clips its own rounded corners.
 * - The accounts submenu ships WITHOUT a filter. A level that owns a textbox hands
 *   ArrowLeft to the caret, so filtering costs the back key; for seven accounts under
 *   three headings that is the wrong trade.
 * - Everything that used to float in the rail's `utility` block — Configuración,
 *   Admin, the standalone theme picker — is now a ROW IN THE ACCOUNT MENU, which is
 *   where the reference (Claude's own footer menu) puts it. `utility` keeps only the
 *   Entorno strip, because that is ambient state you must be able to read without
 *   opening anything. The rail lost three unlabelled icon pills and gained a
 *   sublabel that states the theme in words.
 * - Appearance is COMPOSED here, from generic parts: `MenuSub` + three
 *   `MenuItem checked` + three inline SVGs. There is no ThemeSwitch component and
 *   there must not be one — "Claro"/"Oscuro" and the three-option set are product
 *   vocabulary, and a component named after one feature is the wrong layer. The same
 *   `MenuSub` shape carries the account list one row above it.
 * - Notifications stay OUT of the menu, as a bell BESIDE the trigger: unread is state
 *   you must be able to see without opening anything, so the mark is drawn into the
 *   glyph itself. The bell is a second, independent `Menu` — its rows are actions, not
 *   a one-of-N, so it owns no check column — and opening it clears `unread`, which
 *   swaps the glyph and drops the count from the accessible name.
 * - Every control is real: the appearance rows write `data-theme` through
 *   `applyTheme`, so the whole shell inverts; ⇧⌘, really focuses Configuración and
 *   ⌘/ really opens the shortcut dialog; the environment switch drives the ambient
 *   `StatusPill` in the page header — an environment you can misread is a production
 *   hazard, so DEV is never silent. Rows from the reference that would be inert here
 *   (Add account, Upgrade plan, Install apps) are NOT copied: a control that appears
 *   to do nothing is a defect, and a screenshot is not a reason to ship one.
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
 * chevrons Sidebar and Menu draw, so the rail and its menus have a single hand.
 * The three appearance glyphs live here too, with their labels: the library has no
 * opinion about how many theme options an app offers. */
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
  users: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="6" cy="5.4" r="2.6" {...stroke} />
      <path d="M1.9 12.6c0-2.1 1.8-3.5 4.1-3.5s4.1 1.4 4.1 3.5" {...stroke} />
      <path d="M10.2 3.2a2.4 2.4 0 0 1 0 4.5M11.4 9.4c1.1.5 1.8 1.5 1.8 3" {...stroke} />
    </svg>
  ),
  keyboard: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.4" y="3.4" width="12.2" height="8.2" rx="1.8" {...stroke} />
      <path d="M4 6.2h.01M6.4 6.2h.01M8.8 6.2h.01M11.2 6.2h.01M4.8 8.9h5.4" {...stroke} />
    </svg>
  ),
  sun: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="2.9" {...stroke} />
      <path d="M7.5 1.6v1.5M7.5 11.9v1.5M1.6 7.5h1.5M11.9 7.5h1.5M3.3 3.3l1.1 1.1M10.6 10.6l1.1 1.1M11.7 3.3l-1.1 1.1M4.4 10.6l-1.1 1.1" {...stroke} />
    </svg>
  ),
  moon: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M12.4 9.1A5.4 5.4 0 0 1 5.6 2.3a5.5 5.5 0 1 0 6.8 6.8Z" {...stroke} />
    </svg>
  ),
  monitor: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2.4" width="12" height="8.2" rx="1.6" {...stroke} />
      <path d="M5.4 13h4.2" {...stroke} />
    </svg>
  ),
  bell: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 2C5.3 2 4 3.7 4 5.7c0 2.9-1.2 3.8-1.2 3.8h9.4S11 8.6 11 5.7C11 3.7 9.7 2 7.5 2Z" {...stroke} />
      <path d="M6.3 11.8c.2.6.7 1 1.2 1s1-.4 1.2-1" {...stroke} />
    </svg>
  ),
  /* Unread is drawn INSIDE the glyph — one <svg>, so the story needs no positioned
   * wrapper and no inline style object. The surface-coloured outer circle punches the
   * dot out of the bell so it reads as a mark, not as part of the drawing. */
  bellUnread: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 2C5.3 2 4 3.7 4 5.7c0 2.9-1.2 3.8-1.2 3.8h9.4S11 8.6 11 5.7C11 3.7 9.7 2 7.5 2Z" {...stroke} />
      <path d="M6.3 11.8c.2.6.7 1 1.2 1s1-.4 1.2-1" {...stroke} />
      <circle cx="11.6" cy="3.2" r="3.4" fill="var(--he-surface)" />
      <circle cx="11.6" cy="3.2" r="2.4" fill="var(--he-ok)" />
    </svg>
  ),
};

/* ------------------------------------------------------------ appearance labels */

/* The three-option set, its Spanish labels and its glyphs live HERE, in the caller.
 * None of it crosses into src/components or src/lib: `MenuSub` is a shape, `MenuItem
 * checked` is a shape, and neither knows what a theme is. */
const THEME_ORDER = ['light', 'dark', 'system'] as const;

const THEME_LABEL: Record<ThemePreference, string> = {
  light: 'Claro',
  dark: 'Oscuro',
  system: 'Sistema',
};

const THEME_ICON: Record<ThemePreference, ReactNode> = {
  light: icons.sun,
  dark: icons.moon,
  system: icons.monitor,
};

/**
 * The rule that keeps the control honest, and the reason System can come back at all.
 * A submenu has TWO reporting surfaces where the old Segmented strip had one: the
 * CHECK reports the PREFERENCE, this sublabel reports the RESOLUTION. Printing only
 * "Sistema" re-hides which theme you are actually in; printing only "Oscuro" hides
 * that it is automatic, so an overnight flip reads as a bug.
 */
function appearanceSublabel(pref: ThemePreference, resolved: ThemeMode): string {
  return pref === 'system' ? `${THEME_LABEL.system} · ${THEME_LABEL[resolved]}` : THEME_LABEL[pref];
}

/* ------------------------------------------------------------------ fixtures */

interface Account {
  id: string;
  name: string;
  slug: string;
  role: string;
  /**
   * The identity header's second line — the one fact that tells two same-named rows
   * apart. It is also the widest string in the menu, so it is what SIZES the panel:
   * the fixture keeps every address 21-24 characters so the appearance sublabel keeps
   * its column no matter which account is current. Measured: `Sistema · Oscuro` is
   * 110.4px in 11.5px IBM Plex Mono, and a 16-character address left a 104px column,
   * i.e. an ellipsis in dark and none in light — a control that lies at sunset.
   */
  email: string;
}

interface Tenant {
  tenantId: string;
  name: string;
  /**
   * What the marker on the identity avatar says. It lives on the TENANT, not on the
   * account, and deliberately not on `canAdmin`: a plan and a permission are two
   * different facts, and a badge that silently means "you are an admin" is the kind
   * of conflation nobody catches until it is wrong. Switch to Click Seguros and the
   * badge really changes.
   */
  plan: string;
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
    plan: 'Pro',
    accounts: [
      { id: 'acc_handle_owner', name: 'Alfonso de los rios', slug: 'handle.mx', role: 'Propietario', email: 'alfonso@handle.com.mx' },
      { id: 'acc_handle_billing', name: 'Alfonso de los rios', slug: 'handle.mx', role: 'Facturación', email: 'facturacion@handle.com.mx' },
      { id: 'acc_handle_mesa', name: 'Mesa de control', slug: 'handle.mx', role: 'Operaciones', email: 'mesa.control@handle.mx' },
    ],
  },
  {
    tenantId: 'ten_handle_qa',
    name: 'Handle QA',
    plan: 'Pro',
    accounts: [
      { id: 'acc_qa_admin', name: 'Alfonso de los Rios', slug: 'handle-qa.mx', role: 'Admin', email: 'alfonso@handle-qa.com.mx' },
      { id: 'acc_qa_support', name: 'Soporte QA', slug: 'handle-qa.mx', role: 'Soporte', email: 'soporte@handle-qa.com.mx' },
    ],
  },
  {
    tenantId: 'ten_click',
    name: 'Click Seguros',
    plan: 'Free',
    accounts: [
      { id: 'acc_click_owner', name: 'Poncho', slug: 'click.mx', role: 'Propietario', email: 'poncho@clickseguros.mx' },
      { id: 'acc_click_renov', name: 'Renovaciones', slug: 'click.mx', role: 'Analista', email: 'renovaciones@click.mx' },
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

/* The role gate. Two of the seven accounts can see the Admin row; switch to
 * "Mesa de control" and it disappears — a menu that shows a row you cannot use is a
 * menu that taught you nothing. */
const ADMIN_ROLES = new Set(['Propietario', 'Admin']);

/* Three menu rows, one Modal. Each row opens a panel that prints REAL current state —
 * a row that only sets a variable nothing renders is the "appears to do nothing"
 * defect one indirection removed, which is exactly what happened when Configuración
 * moved out of the rail and kept setting a nav value with no row left to highlight. */
type Dialog = 'configuracion' | 'admin' | 'atajos';

const DIALOGS: Record<Dialog, { title: string; lede: string }> = {
  configuracion: { title: 'Configuración', lede: 'La cuenta con la que estás trabajando ahora.' },
  admin: { title: 'Admin', lede: 'Solo para propietarios y administradores.' },
  atajos: { title: 'Atajos de teclado', lede: 'Disponibles en cualquier pantalla.' },
};

/* Every key listed here is really registered in the effect below. A shortcut sheet
 * that documents a combination nothing handles is worse than no sheet. */
const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: '⇧⌘,', action: 'Configuración' },
  { keys: '⌘/', action: 'Atajos de teclado' },
];

/* The bell is a real control or it is decoration. Three alerts, and opening the menu
 * clears the unread mark — which is why the mark is drawn in the SVG rather than
 * hardcoded: the glyph swaps when `unread` reaches zero. Notifications stay OUT of the
 * account menu because unread is state you must see WITHOUT opening anything. */
const NOTIFICATIONS = [
  { id: 'n1', title: 'Recibo vencido', meta: 'Regio Gas · póliza 628515652 · hace 2 h' },
  { id: 'n2', title: 'Conciliación lista', meta: 'GNP · 12 movimientos nuevos · hace 3 h' },
  { id: 'n3', title: 'Renovación en 5 días', meta: 'Minera San Rafael · hace 1 d' },
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
  const [dialog, setDialog] = useState<Dialog | null>(null);

  /* switcher state */
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState('acc_handle_owner');

  /* notifications state */
  const [bell, setBell] = useState(false);
  const [unread, setUnread] = useState(NOTIFICATIONS.length);

  const current = ALL_ACCOUNTS.find((a) => a.id === currentId) as Account;
  const currentTenant = TENANT_OF.get(currentId) as Tenant;
  const canAdmin = ADMIN_ROLES.has(current.role);

  /* ---------------------------------------------------------------- theme */

  /* Three states, and the two facts do not compete: `pref` is what you CHOSE and
   * carries the check, `resolved` is what you are actually LOOKING AT and carries the
   * sublabel. `resolved` has to be state rather than a render-time `resolveTheme(pref)`
   * call, because the sunset flip must re-render the sublabel with no user action. */
  const [pref, setPref] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ThemeMode>(() => resolveTheme('system'));

  useEffect(() => {
    const next = resolveTheme(pref);
    setResolved(next);
    applyTheme(next);
    /* `getPreference` is a CALLBACK on purpose: read at EVENT time, one subscription
     * set up once stays correct, and pinning simply stops the callbacks. The
     * value-taking shape invites a `[]` dep array that captures a stale 'system' and
     * follows the OS forever after you pinned. */
    return watchResolvedTheme(
      () => pref,
      (mode) => {
        setResolved(mode);
        applyTheme(mode);
      },
    );
  }, [pref]);

  /* Storybook's theme toolbar is a SECOND writer of `data-theme`. Mirroring its write
   * back as a PIN is the only reading that leaves both controls truthful — a toolbar
   * flip IS an explicit choice, which is exactly what a pin is. Without it the menu
   * would sit on "Sistema · Oscuro" while the shell renders light, and a control that
   * misreports itself is worse than no control. Delete this when you copy the file. */
  useEffect(() => {
    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      const seen: ThemeMode = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setPref((p) => (resolveTheme(p) === seen ? p : seen));
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  /* ------------------------------------------------------------ shortcuts */

  /* Closing the menu is part of the action, not a side effect of it: the panel the
   * row opens must not appear behind the menu that opened it. */
  const openDialog = useCallback((next: Dialog) => {
    setOpen(false);
    setDialog(next);
  }, []);

  /* The two rows that print a shortcut really answer it. A menu row that displays
   * ⇧⌘, and a key combination that does nothing are two separate lies. `event.code`
   * is the fallback because a shifted comma reports a different `key` on several
   * layouts. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.shiftKey && (event.key === ',' || event.code === 'Comma')) {
        event.preventDefault();
        openDialog('configuracion');
      } else if (!event.shiftKey && event.key === '/') {
        event.preventDefault();
        openDialog('atajos');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openDialog]);

  /* Each panel prints live state, so every row visibly answers. */
  const dialogRows: { label: string; value: ReactNode }[] =
    dialog === 'configuracion'
      ? [
          { label: 'Cuenta', value: current.name },
          { label: 'Correo', value: current.email },
          { label: 'Organización', value: currentTenant.name },
          { label: 'Rol', value: current.role },
          { label: 'Apariencia', value: appearanceSublabel(pref, resolved) },
          { label: 'Entorno', value: env === 'dev' ? 'Dev' : 'Live' },
        ]
      : dialog === 'admin'
        ? [
            { label: 'Organización', value: currentTenant.name },
            { label: 'Plan', value: currentTenant.plan },
            {
              label: 'Tenant',
              value: (
                <Chip variant="mono" size="sm">
                  {currentTenant.tenantId}
                </Chip>
              ),
            },
            { label: 'Cuentas', value: String(currentTenant.accounts.length) },
            { label: 'Tu rol', value: current.role },
          ]
        : dialog === 'atajos'
          ? SHORTCUTS.map((sc) => ({
              label: sc.action,
              value: (
                <Chip variant="mono" size="sm">
                  {sc.keys}
                </Chip>
              ),
            }))
          : [];

  /* --------------------------------------------------------- account menu */

  const accountMenu = (
    <Menu
      label="Cuenta"
      placement="top-start"
      open={open}
      onOpenChange={setOpen}
      /* Not interactive: it states WHO YOU ARE. `MenuStatic`, never
       * `<MenuItem disabled>` — a disabled menuitem is still in the roving set and
       * drops to 45% opacity, so the identity would read as unavailable. */
      header={
        <MenuStatic
          media={
            <Avatar
              size="sm"
              tone={0}
              name={current.name}
              /* The library ships an overlay SLOT on the avatar's rim; what a marker
                * MEANS is the app's business, so the word comes from the fixture. */
              badge={<Badge size="sm">{currentTenant.plan}</Badge>}
            />
          }
          sublabel={current.email}
        >
          {current.name}
        </MenuStatic>
      }
      /* `inset` reserves the same media column every other row has, so the footer
       * label lines up with the rest instead of hanging 27px to its left. */
      footer={
        <MenuItem destructive inset onSelect={() => setOpen(false)}>
          Cerrar sesión
        </MenuItem>
      }
      trigger={
        <SidebarFooterItem
          open={open}
          /* Stacked, not a rotating chevron: this row does not expand in place, it
           * offers seven alternatives. */
          chevron="updown"
          media={<Avatar size="sm" tone={0} name={current.name} />}
          label={current.name}
          sublabel={`${currentTenant.name} · ${current.role}`}
        />
      }
    >
      {/* Deliberately NO MenuFilter on this submenu. A level with a textbox hands
        * ArrowLeft to the caret, so a filtered submenu costs you the back key — for
        * seven accounts under three headings that is a bad trade. */}
      {/* The sublabel carries the ROLE as well as the organisation, because that is the
        * pair the submenu actually sets: two Handle accounts share the display name and
        * differ only on it, so "Handle" alone would be ambiguous in exactly the place
        * the fixture is ambiguous. */}
      <MenuSub
        label="Cambiar cuenta"
        media={icons.users}
        sublabel={`${currentTenant.name} · ${current.role}`}
      >
        {TENANTS.map((tenant) => (
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
        ))}
      </MenuSub>

      <MenuSeparator />

      <MenuItem media={icons.settings} shortcut="⇧⌘," onSelect={() => openDialog('configuracion')}>
        Configuración
      </MenuItem>
      {/* Role-gated, not disabled: switch to "Mesa de control" and the row is gone.
        * A disabled row still occupies the roving set and still teaches nothing. */}
      {canAdmin && (
        <MenuItem media={icons.admin} onSelect={() => openDialog('admin')}>
          Admin
        </MenuItem>
      )}

      <MenuSeparator />

      {/* The migration from ThemeSwitch, in full: a generic MenuSub, three generic
        * checked MenuItems, and three SVGs that live in this file. */}
      <MenuSub
        label="Apariencia"
        media={THEME_ICON[pref]}
        sublabel={appearanceSublabel(pref, resolved)}
      >
        {THEME_ORDER.map((option) => (
          <MenuItem
            key={option}
            media={THEME_ICON[option]}
            /* The check goes on the stored PREFERENCE, never on the resolved theme —
              * otherwise "Sistema" could never carry one. */
            checked={pref === option}
            onSelect={() => setPref(option)}
          >
            {THEME_LABEL[option]}
          </MenuItem>
        ))}
      </MenuSub>

      <MenuSeparator />

      <MenuItem media={icons.keyboard} shortcut="⌘/" onSelect={() => openDialog('atajos')}>
        Atajos de teclado
      </MenuItem>
    </Menu>
  );

  /* --------------------------------------------------- notifications menu */

  /* Its own popover, not a submenu of the account menu: these are ACTIONS, not a
   * one-of-N, so there is no check column to own, and the unread mark has to be
   * readable with everything closed. Opening marks them read — the glyph loses its dot
   * and the accessible name loses its count, so the control visibly answers. */
  const notificationsMenu = (
    <Menu
      label="Notificaciones"
      placement="top-start"
      open={bell}
      onOpenChange={(next) => {
        setBell(next);
        if (next) setUnread(0);
      }}
      footer={<MenuItem onSelect={() => setBell(false)}>Ver todas</MenuItem>}
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : 'Notificaciones'}
        >
          {unread > 0 ? icons.bellUnread : icons.bell}
        </Button>
      }
    >
      {NOTIFICATIONS.map((note) => (
        <MenuItem key={note.id} sublabel={note.meta} onSelect={() => setBell(false)}>
          {note.title}
        </MenuItem>
      ))}
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
        /* ONE control left in the utility block. Configuración, Admin and the theme
         * picker all moved into the account menu, where the reference puts them and
         * where each gets a label instead of an unlabelled icon pill. Entorno stays
         * because it is AMBIENT: you must be able to read whether you are pointed at
         * production without opening anything. Collapsed it becomes a single toggle
         * whose tone dot and tooltip still carry the environment. */
        utility={
          <Segmented<'live' | 'dev'>
            label="Entorno"
            block
            value={env}
            onChange={setEnv}
            options={ENV_OPTIONS}
            iconOnly={collapsed}
          />
        }
        /* The bell is a SIBLING of the account trigger, never its `end` slot: the
         * trigger wrapper toggles the menu on any click inside itself, a button
         * inside a button is invalid HTML, and the ARIA delegate probe takes the
         * first focusable descendant. `SidebarFooterRow` is what keeps the trigger
         * full-width beside it; on the 56px rail the two stack. */
        footer={
          <SidebarFooterRow>
            {accountMenu}
            {notificationsMenu}
          </SidebarFooterRow>
        }
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

      {/* One Modal, three panels — opened by the three settings rows and by ⇧⌘, / ⌘/.
        * Each prints live state, so no row in the menu is decoration. */}
      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        size="sm"
        title={dialog ? DIALOGS[dialog].title : undefined}
        description={dialog ? DIALOGS[dialog].lede : undefined}
      >
        <DescriptionList columns={1}>
          {dialogRows.map((row) => (
            <DescriptionItem key={row.label} label={row.label} value={row.value} />
          ))}
        </DescriptionList>
      </Modal>
    </Grid>
  );
}

/* ------------------------------------------------------------------ stories */

export const Shell: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The rail in situ. Open the account row at the bottom (the stacked up/down glyph, not a chevron — it ' +
          'offers alternatives, it does not expand in place). The menu is the reference structure: a MenuStatic ' +
          'identity header with the plan badge on the avatar rim, then bands separated by hairlines — Cambiar ' +
          'cuenta, Configuración (⇧⌘,) and the role-gated Admin, Apariencia, Atajos de teclado (⌘/), with Cerrar ' +
          'sesión pinned in the footer. Both submenus open on ArrowRight/hover and close on ArrowLeft/Escape, one ' +
          'level per press. Apariencia is composed from generic parts and reports two different facts at once: the ' +
          'CHECK is your preference, the sublabel is the theme you are actually in ("Sistema · Claro"). Selecting ' +
          'Oscuro writes `data-theme` through `applyTheme` and closes the WHOLE tree. Both shortcuts are really ' +
          'bound. The current account is marked with a check — no spine, no bar, no full-bleed fill — and Handle ' +
          'prints ONE heading even though two of its accounts share the display name "Alfonso de los rios". Only ' +
          'Entorno is left in the `utility` block, because it is ambient state. The bell beside the trigger is a ' +
          'separate menu: it carries the unread mark inside its own glyph, and opening it clears the count and ' +
          'swaps the glyph. The rail button in the brand header collapses the rail to 56px.',
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
          'The same shell on the 56px rail. Rows keep their accessible name and gain a right-placed Tooltip; the ' +
          'Entorno strip becomes one toggle whose tone dot and tooltip still state the environment; and the ' +
          'account trigger and the notification bell STACK rather than shrink — two controls do not fit side by ' +
          'side at 56px, and hiding the bell would leave unread state unreadable. The account menu itself is ' +
          'unchanged, submenus included, and opens beside the rail. Use the rail button in the header to expand.',
      },
    },
  },
  render: () => <AppShellView startCollapsed />,
};
