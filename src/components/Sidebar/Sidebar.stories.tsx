import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar as HeAvatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { Menu, MenuFilter, MenuGroup, MenuItem } from '../Menu/Menu';
import { StatusPill } from '../StatusPill/StatusPill';
import { Sidebar, SidebarFooterItem, SidebarHeader, SidebarItem, SidebarSection } from './Sidebar';

const meta = {
  title: 'Elements/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const stroke = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const icons = {
  brandmark: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden>
      <circle cx="6.5" cy="6" r="3" />
      <circle cx="15.5" cy="16" r="3" />
      <rect x="9.4" y="2.8" width="3.4" height="16.4" rx="1.7" transform="rotate(35 11 11)" />
    </svg>
  ),
  collapse: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="12" height="11" rx="2" {...stroke} />
      <path d="M9.5 2V13" {...stroke} />
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="6" {...stroke} />
      <path d="M7.5 4.8V10.2M4.8 7.5H10.2" {...stroke} />
    </svg>
  ),
  computer: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="12" height="8" rx="1.5" {...stroke} />
      <path d="M5 13H10" {...stroke} />
    </svg>
  ),
  artifacts: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="2" y="2" width="11" height="11" rx="2" {...stroke} />
      <path d="M5.5 9.5L7 6L9.5 9.5" {...stroke} />
      <circle cx="5.4" cy="5.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  customize: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="7.5" r="5.6" {...stroke} />
      <circle cx="7.5" cy="7.5" r="1.6" {...stroke} />
      <path d="M7.5 1.9V4M7.5 11V13.1M1.9 7.5H4M11 7.5H13.1" {...stroke} />
    </svg>
  ),
  folder: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M1.5 4.5C1.5 3.7 2.2 3 3 3H5.5L7 4.5H12C12.8 4.5 13.5 5.2 13.5 6V10.5C13.5 11.3 12.8 12 12 12H3C2.2 12 1.5 11.3 1.5 10.5V4.5Z" {...stroke} />
    </svg>
  ),
  dots: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
      <circle cx="3.5" cy="7.5" r="1" />
      <circle cx="7.5" cy="7.5" r="1" />
      <circle cx="11.5" cy="7.5" r="1" />
    </svg>
  ),
  bell: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 2C5.3 2 4 3.7 4 5.7C4 8.6 2.8 9.5 2.8 9.5H12.2C12.2 9.5 11 8.6 11 5.7C11 3.7 9.7 2 7.5 2Z" {...stroke} />
      <path d="M6.3 11.8C6.5 12.4 7 12.8 7.5 12.8C8 12.8 8.5 12.4 8.7 11.8" {...stroke} />
    </svg>
  ),
};

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--he-radius-full)',
        background: 'var(--he-action)',
        border: '1px solid var(--he-action-border)',
        color: 'var(--he-on-action)',
        fontFamily: 'var(--he-font-display)',
        fontSize: 13,
      }}
    >
      {name[0]}
    </span>
  );
}

export const AppShell: Story = {
  render: () => {
    const [active, setActive] = useState('new');
    const projects = ['AI Agent Builder Research', 'Travel Planner', 'AI Learning', 'New Space', 'Bookmarks'];
    const sessions = [
      'I remember a while back there was a carrier portal…',
      'Find some data points on Q3 loss ratios',
      'Where is the Ryan renewal call doc?',
      'Great coffees to visit in downtown Austin',
      'Ontología de datos',
      'Carrier-Exploration Backend Update',
    ];
    return (
      <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
        <Sidebar
          footer={
            <SidebarFooterItem
              media={<Avatar name="Alfonso" />}
              label="Alfonso de los Ríos"
              sublabel="Pro"
              end={
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {icons.bell}
                  <span
                    style={{
                      position: 'absolute',
                      top: -1,
                      right: -2,
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--he-ok)',
                    }}
                  />
                </span>
              }
            />
          }
        >
          <SidebarHeader>
            <span style={{ color: 'var(--he-text)', display: 'inline-flex' }}>{icons.brandmark}</span>
            <Button variant="ghost" size="icon-sm" aria-label="Collapse sidebar">
              {icons.collapse}
            </Button>
          </SidebarHeader>

          <SidebarItem icon={icons.plus} label="New" active={active === 'new'} onClick={() => setActive('new')} />
          <SidebarItem icon={icons.computer} label="Computer" active={active === 'computer'} onClick={() => setActive('computer')} />
          <SidebarItem icon={icons.artifacts} label="Artifacts" active={active === 'artifacts'} onClick={() => setActive('artifacts')} />
          <SidebarItem icon={icons.customize} label="Customize" active={active === 'customize'} onClick={() => setActive('customize')} />

          <SidebarSection label="Pinned">
            <SidebarItem label="I'm the founder of Handle. I'm thinking about…" />
          </SidebarSection>

          <SidebarSection label="Projects">
            {projects.map((p) => (
              <SidebarItem key={p} icon={icons.folder} label={p} />
            ))}
            <SidebarItem icon={icons.dots} label="Show more" />
          </SidebarSection>

          <SidebarSection label="Sessions">
            {sessions.map((s) => (
              <SidebarItem key={s} label={s} />
            ))}
          </SidebarSection>
        </Sidebar>
        <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
          <h1 style={{ fontFamily: 'var(--he-font-display)', fontWeight: 300, fontSize: 'var(--he-display-2)', margin: 0 }}>
            Content area
          </h1>
        </main>
      </div>
    );
  },
};

/* ------------------------- example: collapsible rail ------------------------ */

export const CollapsibleRail: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState('new');
    return (
      <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
        <Sidebar
          collapsed={collapsed}
          footer={<SidebarFooterItem media={<Avatar name="Alfonso" />} label="Alfonso de los Ríos" sublabel="Pro" />}
        >
          <SidebarHeader>
            <span style={{ color: 'var(--he-text)', display: 'inline-flex' }}>{icons.brandmark}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed(!collapsed)}
            >
              {icons.collapse}
            </Button>
          </SidebarHeader>
          <SidebarItem icon={icons.plus} label="New" active={active === 'new'} onClick={() => setActive('new')} />
          <SidebarItem icon={icons.computer} label="Computer" active={active === 'computer'} onClick={() => setActive('computer')} />
          <SidebarItem icon={icons.artifacts} label="Artifacts" active={active === 'artifacts'} onClick={() => setActive('artifacts')} />
          <SidebarSection label="Projects">
            <SidebarItem icon={icons.folder} label="Travel Planner" />
            <SidebarItem icon={icons.folder} label="AI Learning" />
          </SidebarSection>
        </Sidebar>
        <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
          <p style={{ color: 'var(--he-text-dim)' }}>Click the panel icon to collapse to an icon-only rail.</p>
        </main>
      </div>
    );
  },
};

/* --------------------- example: ops console (data-heavy) -------------------- */

export const OpsConsole: Story = {
  render: () => {
    const [active, setActive] = useState('renewals');
    const count = (n: number) => (
      <span style={{ fontFamily: 'var(--he-font-mono)', fontSize: 10.5 }}>{n}</span>
    );
    return (
      <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
        <Sidebar
          width="280px"
          footer={
            <>
              <SidebarItem icon={icons.customize} label="Settings" />
              <SidebarFooterItem media={<Avatar name="Poncho" />} label="poncho@delosrioscapital.com" sublabel="Admin" />
            </>
          }
        >
          <SidebarHeader>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--he-text)' }}>
              {icons.brandmark}
              <span style={{ fontFamily: 'var(--he-font-display)', fontSize: 17 }}>handle</span>
            </span>
          </SidebarHeader>

          <SidebarItem icon={icons.plus} label="Quoting" end={count(12)} active={active === 'quoting'} onClick={() => setActive('quoting')} />
          <SidebarItem
            icon={icons.artifacts}
            label="Renewals"
            end={<StatusPill status="error" label="8 at risk" />}
            active={active === 'renewals'}
            onClick={() => setActive('renewals')}
          />
          <SidebarItem icon={icons.computer} label="Reconciliation" end={count(3)} active={active === 'recon'} onClick={() => setActive('recon')} />

          <SidebarSection
            label="Carriers"
            action={
              <Button variant="ghost" size="icon-xs" aria-label="Add carrier">
                +
              </Button>
            }
          >
            <SidebarItem icon={icons.folder} label="Chubb" />
            <SidebarItem icon={icons.folder} label="Travelers" active />
            <SidebarItem label="Commercial lines" depth={1} />
            <SidebarItem label="Personal lines" depth={1} end={count(41)} />
            <SidebarItem icon={icons.folder} label="Hartford" />
          </SidebarSection>

          <SidebarSection label="Saved views" defaultOpen={false}>
            <SidebarItem label="Overdue > 60 days" />
            <SidebarItem label="Q3 bind queue" />
          </SidebarSection>
        </Sidebar>
        <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
          <p style={{ color: 'var(--he-text-dim)' }}>
            Counts, pills, nested rows, section actions, closed-by-default sections, multi-row footer.
          </p>
        </main>
      </div>
    );
  },
};

/* --------------------------- example: minimal list -------------------------- */

export const Minimal: Story = {
  render: () => (
    <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
      <Sidebar width="220px">
        <SidebarHeader>
          <span style={{ fontFamily: 'var(--he-font-display)', fontSize: 17 }}>handle</span>
        </SidebarHeader>
        <SidebarItem label="Overview" href="#overview" active />
        <SidebarItem label="Policies" href="#policies" />
        <SidebarItem label="Clients" href="#clients" />
        <SidebarItem label="Billing" href="#billing" />
      </Sidebar>
      <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
        <p style={{ color: 'var(--he-text-dim)' }}>No sections, no footer, anchor navigation — just rows.</p>
      </main>
    </div>
  ),
};

/* ---------------------- example: account switcher (canonical) --------------- */

interface SwitcherAccount {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface SwitcherTenant {
  tenantId: string;
  name: string;
  accounts: SwitcherAccount[];
}

/* The screenshot's failure case, kept as a fixture: two accounts whose names
 * differ only in a capital R, sitting in two different tenants. Grouping by
 * tenantId (not by the account name) puts each under exactly one heading, and
 * the two tenants carry names that tell them apart — which is what the repeated
 * "HANDLE" heading failed to do. */
const tenants: SwitcherTenant[] = [
  {
    tenantId: 'ten_handle_prod',
    name: 'Handle',
    accounts: [
      { id: 'acc_1', name: 'Alfonso de los rios', slug: 'handle.mx', role: 'Owner' },
      { id: 'acc_2', name: 'Mesa de control', slug: 'handle.mx', role: 'Operaciones' },
    ],
  },
  {
    tenantId: 'ten_handle_qa',
    name: 'Handle QA',
    accounts: [{ id: 'acc_3', name: 'Alfonso de los Rios', slug: 'handle-qa.mx', role: 'Admin' }],
  },
  {
    tenantId: 'ten_acme_qa',
    name: 'Acme Brokers QA',
    accounts: [
      { id: 'acc_4', name: 'poncho', slug: 'acme-qa.mx', role: 'Admin' },
      { id: 'acc_5', name: 'Renovaciones', slug: 'acme-qa.mx', role: 'Analista' },
    ],
  },
  {
    tenantId: 'ten_click_dev',
    name: 'Click Seguros Dev',
    accounts: [
      { id: 'acc_6', name: 'Alfonso DR', slug: 'click-dev.mx', role: 'Owner' },
      { id: 'acc_7', name: 'Soporte', slug: 'click-dev.mx', role: 'Soporte' },
    ],
  },
];

function useSwitcher() {
  const [rawOpen, setRawOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [currentId, setCurrentId] = useState('acc_1');
  const open = rawOpen;
  /* The query is scoped to one opening. Letting it survive means the next open
   * shows "Sin resultados" for a string the user has long forgotten typing. */
  const setOpen = (next: boolean) => {
    setRawOpen(next);
    if (!next) setQuery('');
  };
  const needle = query.trim().toLowerCase();
  const groups = tenants
    .map((tenant) => ({
      ...tenant,
      accounts: tenant.accounts.filter((a) => !needle || `${a.name} ${a.slug} ${a.role}`.toLowerCase().includes(needle)),
    }))
    .filter((tenant) => tenant.accounts.length > 0);
  const current = tenants.flatMap((t) => t.accounts).find((a) => a.id === currentId) as SwitcherAccount;
  return { open, setOpen, query, setQuery, currentId, setCurrentId, groups, current };
}

export const AccountSwitcher: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The canonical organisation switcher — copy this rather than hand-building one. Three rules the library ' +
          'cannot enforce for you: (1) group by TENANT ID, never by display name — grouping on the name is what ' +
          'printed one heading per row instead of one per organisation, and give tenants names that tell them ' +
          'apart ("Handle" / "Handle QA"), because two identical headings explain nothing; (2) one heading per ' +
          'group, and no heading at all when there is only one group; (3) `tone={0}` on every switcher Avatar — ' +
          'the automatic tone hashes the name, so the two accounts called "Alfonso de los rios" would get the same ' +
          'tone AND the same "AR" initials, which is colour that carries no information. Those two rows stay ' +
          'distinguishable through their group and sublabel (`Handle · handle.mx · Owner` vs `Handle QA · ' +
          'handle-qa.mx · Admin`), and the current one is marked with a check, never a bar.',
      },
    },
  },
  render: () => {
    const s = useSwitcher();
    return (
      <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
        <Sidebar
          footer={
            <Menu
              label="Cuentas"
              placement="top-start"
              matchTriggerWidth
              open={s.open}
              onOpenChange={s.setOpen}
              header={
                <MenuFilter
                  value={s.query}
                  onValueChange={s.setQuery}
                  label="Filtrar organizaciones"
                  placeholder="Filtrar organizaciones…"
                />
              }
              footer={
                <MenuItem destructive onSelect={() => undefined}>
                  Cerrar sesión
                </MenuItem>
              }
              trigger={
                <SidebarFooterItem
                  open={s.open}
                  chevron
                  media={<HeAvatar size="sm" tone={0} name={s.current.name} />}
                  label={s.current.name}
                  sublabel={`${s.current.slug} · ${s.current.role}`}
                />
              }
            >
              {s.groups.length === 0 ? (
                <EmptyState size="sm" title="Sin resultados" hint={`Nada coincide con “${s.query.trim()}”.`} />
              ) : (
                s.groups.map((tenant) => (
                <MenuGroup key={tenant.tenantId} label={tenant.name}>
                  {tenant.accounts.map((account) => (
                    <MenuItem
                      key={account.id}
                      checked={account.id === s.currentId}
                      media={<HeAvatar size="sm" tone={0} name={account.name} />}
                      sublabel={`${account.slug} · ${account.role}`}
                      onSelect={() => s.setCurrentId(account.id)}
                    >
                      {account.name}
                    </MenuItem>
                  ))}
                  </MenuGroup>
                ))
              )}
            </Menu>
          }
        >
          <SidebarHeader>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--he-text)' }}>
              {icons.brandmark}
              <span style={{ fontFamily: 'var(--he-font-display)', fontSize: 17 }}>handle</span>
            </span>
          </SidebarHeader>
          <SidebarItem icon={icons.plus} label="Cotizaciones" active />
          <SidebarItem icon={icons.artifacts} label="Renovaciones" />
          <SidebarItem icon={icons.computer} label="Conciliación" />
        </Sidebar>
        <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
          <p style={{ color: 'var(--he-text-dim)' }}>Click the account row to open the switcher.</p>
        </main>
      </div>
    );
  },
};

/* --------------------- example: switcher on the 56px rail ------------------- */

export const CollapsedRailSwitcher: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same switcher on the collapsed rail: the trigger keeps its accessible name (the label becomes ' +
          '`aria-label` plus a right-placed Tooltip when the text is hidden), and the popover opens beside the ' +
          '56px rail instead of matching its width.',
      },
    },
  },
  render: () => {
    const s = useSwitcher();
    return (
      <div style={{ display: 'flex', height: '100vh', margin: -16 }}>
        <Sidebar
          collapsed
          footer={
            <Menu
              label="Cuentas"
              placement="top-start"
              open={s.open}
              onOpenChange={s.setOpen}
              header={
                <MenuFilter
                  value={s.query}
                  onValueChange={s.setQuery}
                  label="Filtrar organizaciones"
                  placeholder="Filtrar organizaciones…"
                />
              }
              footer={
                <MenuItem destructive onSelect={() => undefined}>
                  Cerrar sesión
                </MenuItem>
              }
              trigger={
                <SidebarFooterItem
                  open={s.open}
                  chevron
                  media={<HeAvatar size="sm" tone={0} name={s.current.name} />}
                  label={s.current.name}
                  sublabel={`${s.current.slug} · ${s.current.role}`}
                />
              }
            >
              {s.groups.length === 0 ? (
                <EmptyState size="sm" title="Sin resultados" hint={`Nada coincide con “${s.query.trim()}”.`} />
              ) : (
                s.groups.map((tenant) => (
                <MenuGroup key={tenant.tenantId} label={tenant.name}>
                  {tenant.accounts.map((account) => (
                    <MenuItem
                      key={account.id}
                      checked={account.id === s.currentId}
                      media={<HeAvatar size="sm" tone={0} name={account.name} />}
                      sublabel={`${account.slug} · ${account.role}`}
                      onSelect={() => s.setCurrentId(account.id)}
                    >
                      {account.name}
                    </MenuItem>
                  ))}
                  </MenuGroup>
                ))
              )}
            </Menu>
          }
        >
          <SidebarHeader>
            <span style={{ color: 'var(--he-text)', display: 'inline-flex' }}>{icons.brandmark}</span>
          </SidebarHeader>
          <SidebarItem icon={icons.plus} label="Cotizaciones" active />
          <SidebarItem icon={icons.artifacts} label="Renovaciones" />
          <SidebarItem icon={icons.computer} label="Conciliación" />
        </Sidebar>
        <main style={{ flex: 1, background: 'var(--he-surface)', padding: 40 }}>
          <p style={{ color: 'var(--he-text-dim)' }}>Hover a rail row for its name; click the avatar to switch.</p>
        </main>
      </div>
    );
  },
};
