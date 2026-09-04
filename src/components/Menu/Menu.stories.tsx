import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { Modal } from '../Modal/Modal';
import { Menu, MenuFilter, MenuGroup, MenuItem, MenuSeparator, MenuStatic, MenuSub, Popover } from './Menu';

const meta = {
  title: 'Elements/Menu',
  component: Menu,
  args: {
    trigger: <Button variant="secondary">Actions</Button>,
    children: null,
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Actions: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">Actions</Button>} label="Account actions" placement="bottom-end">
      <MenuItem shortcut="⌘O">Open account</MenuItem>
      <MenuItem>Assign owner</MenuItem>
      <MenuItem>Export CSV</MenuItem>
      <MenuSeparator />
      <MenuItem destructive>Archive</MenuItem>
    </Menu>
  ),
};

export const ControlledPopover: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="outline">Details</Button>}
        contentClassName="he-menu-popover"
      >
        <div style={{ display: 'grid', gap: 8, width: 220, padding: 'var(--he-space-3)' }}>
          <strong style={{ fontSize: 'var(--he-body-sm)' }}>Portfolio sync</strong>
          <span style={{ color: 'var(--he-text-dim)', fontSize: 'var(--he-body-sm)' }}>
            Last completed hace 3d.
          </span>
        </div>
      </Popover>
    );
  },
};

/* ------------------------- example: org switcher --------------------------- */

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

/* Two tenants hold an account named "Alfonso de los rios" — the pair that was
 * indistinguishable in the screenshot. Groups are keyed on tenantId and headed
 * by the tenant name, so one heading appears per org; the sublabel
 * (`handle.mx · Owner` vs `handle-qa.mx · Admin`) is what separates the twins. */
const tenants: Tenant[] = [
  {
    tenantId: 'ten_handle_prod',
    name: 'Handle',
    accounts: [
      { id: 'acc_1', name: 'Alfonso de los rios', slug: 'handle.mx', role: 'Owner' },
      { id: 'acc_2', name: 'Mesa de control', slug: 'handle.mx', role: 'Operaciones' },
      { id: 'acc_3', name: 'Renovaciones', slug: 'handle.mx', role: 'Analista' },
    ],
  },
  {
    tenantId: 'ten_handle_qa',
    name: 'Handle QA',
    accounts: [
      { id: 'acc_4', name: 'Alfonso de los rios', slug: 'handle-qa.mx', role: 'Admin' },
      { id: 'acc_5', name: 'Soporte', slug: 'handle-qa.mx', role: 'Soporte' },
    ],
  },
  {
    tenantId: 'ten_acme_qa',
    name: 'Acme Brokers QA',
    accounts: [
      { id: 'acc_6', name: 'poncho', slug: 'acme-qa.mx', role: 'Admin' },
      { id: 'acc_7', name: 'Alfonso DR', slug: 'click-dev.mx', role: 'Owner' },
    ],
  },
];

const allAccounts = tenants.flatMap((tenant) => tenant.accounts);

export const OrgSwitcher: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'The full recipe: one heading per TENANT ID (never per display name), `tone={0}` avatars so colour ' +
          'carries no false signal, a sublabel that separates the two accounts sharing a name, and the current ' +
          'account marked with a check on a quiet fill — `role="menuitemradio"` with `aria-checked`, no spine. ' +
          'The filter lives in `header` because a textbox is not a valid child of `role="menu"`; "Cerrar sesión" ' +
          'lives in `footer`, pinned outside the scroll box.',
      },
    },
  },
  render: () => {
    const [query, setQuery] = useState('');
    const [currentId, setCurrentId] = useState('acc_1');
    const needle = query.trim().toLowerCase();
    const groups = tenants
      .map((tenant) => ({
        ...tenant,
        accounts: tenant.accounts.filter(
          (account) => !needle || `${account.name} ${account.slug} ${account.role}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((tenant) => tenant.accounts.length > 0);
    const current = allAccounts.find((account) => account.id === currentId) as Account;

    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100vh', padding: 16 }}>
        <Menu
          label="Cuentas"
          placement="top-start"
          /* The query belongs to one opening — see AppShell.stories.tsx. */
          onOpenChange={(next) => {
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
            <MenuItem destructive onSelect={() => undefined}>
              Cerrar sesión
            </MenuItem>
          }
          trigger={
            <Button variant="outline">
              {current.name} · {current.slug}
            </Button>
          }
        >
          {groups.length === 0 ? (
            <EmptyState size="sm" title="Sin resultados" hint={`Nada coincide con “${query}”.`} />
          ) : (
            groups.map((tenant) => (
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
      </div>
    );
  },
};

/* ------------------------- example: viewport flip -------------------------- */

export const NearViewportEdge: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '`placement="bottom-start"` on a trigger pinned to the bottom of the viewport: the menu flips upward ' +
          'rather than covering its own trigger. The flip only fires when the preferred side cannot fit AND the ' +
          'other side is strictly roomier, so a menu never jumps sides for no gain.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: '100vh', padding: 16 }}>
      <Menu trigger={<Button variant="outline">Bottom-anchored</Button>} label="Acciones" placement="bottom-start">
        <MenuItem>Abrir cuenta</MenuItem>
        <MenuItem>Asignar responsable</MenuItem>
        <MenuItem>Exportar CSV</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Archivar</MenuItem>
      </Menu>
    </div>
  ),
};

/* --------------------------- example: overflow ----------------------------- */

export const Overflowing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Thirty rows against a bounded popover: the list scrolls inside `.he-menu__scroll` while the footer ' +
          'stays pinned. `scrollbar-gutter: stable` reserves the bar, so no row fill ever runs underneath it.',
      },
    },
  },
  render: () => (
    <Menu
      trigger={<Button variant="outline">30 pólizas</Button>}
      label="Pólizas"
      footer={<MenuItem>Ver todas</MenuItem>}
    >
      {Array.from({ length: 30 }, (_, index) => (
        <MenuItem key={index} shortcut={`P-${100 + index}`}>{`Póliza ${100 + index}`}</MenuItem>
      ))}
    </Menu>
  ),
};

/* --------------------------- docs: keyboard --------------------------------- */

const keyboardContract: [string, string][] = [
  ['Tab', 'reaches the trigger once — the trigger is a real control, not a bare span'],
  ['Enter / Space / ↓ / ↑', 'open the menu; ↓ seeds the first row, ↑ the last, otherwise the checked row'],
  ['↓ / ↑ / Home / End', 'move the highlight (aria-activedescendant); it wraps'],
  ['a–z', 'type-ahead when there is no filter; when a MenuFilter is present, typing filters instead'],
  ['Enter', 'selects the highlighted row, closes, and returns focus to the trigger'],
  ['Escape', 'closes and returns focus to the trigger — and does not close an enclosing Modal'],
  ['Tab (while open)', 'closes and returns focus to the trigger; the next Tab then moves on naturally'],
  ['\u2192', "opens the highlighted row's submenu and lands on its checked row, or its first"],
  ['\u2190', 'closes the innermost submenu and returns the highlight to its parent row'],
];

export const Keyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The whole surface is reachable without a mouse. Focus stays on one holder — the menu root, or the ' +
          'filter input when there is one — and the highlight rides `aria-activedescendant`, so there is exactly ' +
          'one roving mechanism. Rows are `tabIndex={-1}`: they never take DOM focus.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <Menu trigger={<Button variant="outline">Probar teclado</Button>} label="Acciones">
        <MenuItem>Abrir cuenta</MenuItem>
        <MenuItem>Asignar responsable</MenuItem>
        <MenuItem disabled>Duplicar (deshabilitado)</MenuItem>
        <MenuItem>Exportar CSV</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Archivar</MenuItem>
      </Menu>
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: 0, maxWidth: 640 }}>
        {keyboardContract.map(([keys, effect]) => (
          <Fragment key={keys}>
            <dt style={{ fontFamily: 'var(--he-font-mono)', fontSize: 'var(--he-caption)', whiteSpace: 'nowrap' }}>
              {keys}
            </dt>
            <dd style={{ margin: 0, color: 'var(--he-text-dim)', fontSize: 'var(--he-body-sm)' }}>{effect}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  ),
};

/* --------------------------- example: inside a modal ------------------------ */

export const InsideModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Escape is handled on the popover content, which stops propagation — so one Escape closes the menu and ' +
          'leaves the dialog open. A second Escape closes the dialog.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Abrir diálogo
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Reasignar renovación"
          description="Escape cierra primero el menú, no el diálogo."
          footer={
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          }
        >
          <Menu trigger={<Button variant="outline">Responsable</Button>} label="Responsables">
            <MenuItem checked>Alfonso de los rios</MenuItem>
            <MenuItem checked={false}>Mesa de control</MenuItem>
            <MenuItem checked={false}>Renovaciones</MenuItem>
          </Menu>
        </Modal>
      </>
    );
  },
};

/* --------------------------- example: submenus ------------------------------ */

/* Story-local glyphs: the library ships shapes, so the icons a caller hangs on a
 * row live with the caller. 15px to match MenuFilter's search glyph. */
const RowsGlyph = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M2.6 4.2h9.8M2.6 7.5h9.8M2.6 10.8h9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const SortGlyph = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M4.4 2.8v9.4M2.4 10.2l2 2 2-2M10.6 12.2V2.8M8.6 4.8l2-2 2 2"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const densities = ['Compact', 'Comfortable', 'Spacious'] as const;
const sortFields = ['Name', 'Created', 'Updated'] as const;
const sortDirections = ['Ascending', 'Descending'] as const;

export const Submenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A submenu is one primitive — `MenuSub` — and every option is a child, so the label, the icons and the ' +
          'option set belong to the caller. Two invariants a caller must respect. (1) The TRIGGER sublabel reports ' +
          'the CURRENT VALUE of whatever the submenu sets, so the row is readable without opening it. (2) A submenu ' +
          'is the right shape only for a MUTUALLY EXCLUSIVE, closed set of 2–5 options whose value fits the ' +
          'sublabel column (~146px): the check marks the choice, `role="menuitemradio"`. A list of independent ' +
          'toggles is a Switch list, not a submenu. "Sort by" nests one level deeper to show the owner chain holds ' +
          'at arbitrary depth — each surface names its parent and gets its own z-index.',
      },
    },
  },
  render: () => {
    const [density, setDensity] = useState<(typeof densities)[number]>('Comfortable');
    const [field, setField] = useState<(typeof sortFields)[number]>('Updated');
    const [direction, setDirection] = useState<(typeof sortDirections)[number]>('Descending');

    return (
      <Menu
        trigger={<Button variant="outline">View options</Button>}
        label="View options"
        header={
          <MenuStatic media={<Avatar size="sm" tone={0} name="Sample User" />} sublabel="user@example.com">
            Sample User
          </MenuStatic>
        }
      >
        <MenuItem shortcut="⌘R">Reload</MenuItem>
        <MenuSeparator />
        <MenuSub label="Density" media={RowsGlyph} sublabel={density}>
          {densities.map((value) => (
            <MenuItem key={value} checked={density === value} onSelect={() => setDensity(value)}>
              {value}
            </MenuItem>
          ))}
        </MenuSub>
        <MenuSub label="Sort by" media={SortGlyph} sublabel={`${field} · ${direction}`}>
          <MenuGroup label="Field">
            {sortFields.map((value) => (
              <MenuItem key={value} checked={field === value} onSelect={() => setField(value)}>
                {value}
              </MenuItem>
            ))}
          </MenuGroup>
          <MenuSeparator />
          <MenuSub label="Direction" sublabel={direction}>
            {sortDirections.map((value) => (
              <MenuItem key={value} checked={direction === value} onSelect={() => setDirection(value)}>
                {value}
              </MenuItem>
            ))}
          </MenuSub>
        </MenuSub>
      </Menu>
    );
  },
};

/* --------------------------- docs: submenu keyboard ------------------------- */

const submenuContract: [string, string][] = [
  ['\u2192', 'opens the highlighted sub-trigger and lands on its checked row, or its first'],
  ['Enter / Space', 'on a sub-trigger: identical to \u2192 — it never selects the row and never closes'],
  ['\u2192 (non-sub row)', 'nothing happens, and the key is still swallowed so it cannot drive an ancestor'],
  ['\u2190', 'closes the innermost submenu; focus and the highlight return to its parent row'],
  ['\u2190 (root level)', 'no-op, and still swallowed'],
  ['\u2193 / \u2191 / Home / End', "move the CHILD's highlight only; the parent's aria-activedescendant does not move"],
  ['a–z', 'type-ahead runs in the innermost surface only'],
  ['Escape', 'peels exactly one level; the last one returns focus to the original trigger'],
  ['Tab', 'closes the WHOLE tree and returns focus to the root trigger'],
  ['Enter (leaf)', 'runs onSelect, then closes the whole tree — a leaf two levels down closes the root'],
];

export const SubmenuKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three levels, one roving mechanism per surface. Every level highlights with its own ' +
          '`aria-activedescendant` and holds DOM focus on its own `.he-menu` root; the parent keeps the ' +
          'sub-trigger highlighted (and filled, never spined) for as long as the child is open. ← and → always ' +
          'stop propagating, whether or not they act — they are the only navigation keys that would otherwise ' +
          'leak up through the portal to an ancestor menu.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <Menu trigger={<Button variant="outline">Probar submenús</Button>} label="Nivel 1">
        <MenuItem>Plain row</MenuItem>
        <MenuItem disabled>Disabled row</MenuItem>
        <MenuSeparator />
        <MenuSub label="Density" media={RowsGlyph} sublabel="Comfortable">
          <MenuItem checked={false}>Compact</MenuItem>
          <MenuItem checked>Comfortable</MenuItem>
          <MenuItem checked={false}>Spacious</MenuItem>
        </MenuSub>
        <MenuSub label="Sort by" media={SortGlyph} sublabel="Updated">
          <MenuItem checked={false}>Name</MenuItem>
          <MenuItem checked>Updated</MenuItem>
          <MenuSub label="Direction" sublabel="Descending">
            <MenuItem checked={false}>Ascending</MenuItem>
            <MenuItem checked>Descending</MenuItem>
          </MenuSub>
        </MenuSub>
        <MenuItem>Last row</MenuItem>
      </Menu>
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: 0, maxWidth: 640 }}>
        {submenuContract.map(([keys, effect]) => (
          <Fragment key={keys}>
            <dt style={{ fontFamily: 'var(--he-font-mono)', fontSize: 'var(--he-caption)', whiteSpace: 'nowrap' }}>
              {keys}
            </dt>
            <dd style={{ margin: 0, color: 'var(--he-text-dim)', fontSize: 'var(--he-body-sm)' }}>{effect}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  ),
};
