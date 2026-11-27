import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Menu, MenuGroup, MenuItem, MenuSeparator, MenuStatic, MenuSub, Popover } from './Menu';

const meta = {
  title: 'Molecules/Menu',
  component: Menu,
  args: {
    trigger: <Button variant="secondary">Acciones</Button>,
    children: null,
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const onSelect = fn();

/** Opens on load (`defaultOpen`), so the open state is what axe scans. */
export const Open: Story = {
  render: () => (
    <Menu
      defaultOpen
      trigger={<Button variant="secondary">Acciones de la cuenta</Button>}
      label="Acciones de la cuenta"
      placement="bottom-start"
    >
      <MenuItem shortcut="⌘O" onSelect={onSelect}>
        Abrir cuenta
      </MenuItem>
      <MenuItem onSelect={onSelect}>Reintentar sincronización</MenuItem>
      <MenuItem disabled>Duplicar</MenuItem>
      <MenuItem onSelect={onSelect}>Exportar CSV</MenuItem>
      <MenuSeparator />
      <MenuItem destructive onSelect={onSelect}>
        Archivar
      </MenuItem>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Acciones de la cuenta' });
    const menu = await body.findByRole('menu', { name: 'Acciones de la cuenta' });
    await expect(menu).toBeVisible();
    await waitFor(() => expect(menu).toHaveFocus());

    // Arrow keys move the highlight (aria-activedescendant); Home and End jump to the ends.
    const active = () => menu.getAttribute('aria-activedescendant');
    const first = active();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(active()).not.toBe(first));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(body.getByRole('menuitem', { name: 'Archivar' })).toHaveAttribute('id', active() ?? ''));
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(body.getByRole('menuitem', { name: /Abrir cuenta/ })).toHaveAttribute('id', active() ?? ''));

    // Escape closes the menu and returns focus to the trigger.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    await expect(trigger).toHaveFocus();

    // Reopen from the keyboard and leave it open for the accessibility scan.
    await userEvent.keyboard('{ArrowDown}');
    await expect(await body.findByRole('menu')).toBeVisible();
  },
};

export const Actions: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">Acciones</Button>} label="Acciones" placement="bottom-end">
      <MenuGroup label="Cuenta">
        <MenuItem media={<Icon name="refresh-cw" size={14} />} onSelect={onSelect}>
          Reintentar sincronización
        </MenuItem>
        <MenuItem media={<Icon name="copy" size={14} />} onSelect={onSelect}>
          Copiar identificador
        </MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuItem destructive media={<Icon name="trash-2" size={14} />} onSelect={onSelect}>
        Archivar cuenta
      </MenuItem>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    onSelect.mockClear();
    const trigger = within(canvasElement).getByRole('button', { name: 'Acciones' });
    await userEvent.click(trigger);
    await body.findByRole('menu', { name: 'Acciones' });
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
  },
};

const densities = ['Compacta', 'Cómoda', 'Amplia'] as const;
const sortFields = ['Nombre', 'Creación', 'Actualización'] as const;

/** A submenu is one primitive (`MenuSub`); the sublabel reports the current value. */
export const Submenu: Story = {
  render: () => {
    const [density, setDensity] = useState<(typeof densities)[number]>('Cómoda');
    const [field, setField] = useState<(typeof sortFields)[number]>('Actualización');
    return (
      <Menu
        trigger={<Button variant="outline">Opciones de vista</Button>}
        label="Opciones de vista"
        header={
          <MenuStatic media={<Avatar size="sm" tone={0} name="Ana Torres" />} sublabel="ana@handle.mx">
            Ana Torres
          </MenuStatic>
        }
      >
        <MenuItem shortcut="⌘R">Recargar</MenuItem>
        <MenuSeparator />
        <MenuSub label="Densidad" media={<Icon name="menu" size={14} />} sublabel={density}>
          {densities.map((value) => (
            <MenuItem key={value} checked={density === value} onSelect={() => setDensity(value)}>
              {value}
            </MenuItem>
          ))}
        </MenuSub>
        <MenuSub label="Ordenar por" media={<Icon name="sliders-horizontal" size={14} />} sublabel={field}>
          {sortFields.map((value) => (
            <MenuItem key={value} checked={field === value} onSelect={() => setField(value)}>
              {value}
            </MenuItem>
          ))}
        </MenuSub>
      </Menu>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Opciones de vista' }));
    await body.findByRole('menu', { name: 'Opciones de vista' });
    const trigger = body.getByRole('menuitem', { name: /Densidad/ });
    await userEvent.hover(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
  },
};

export const ControlledPopover: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="outline">Detalle</Button>}
        triggerHasPopup="dialog"
        contentClassName="he-menu-popover"
      >
        <div style={{ display: 'grid', gap: 8, width: 220, padding: 'var(--he-spacing-3)' }}>
          <strong style={{ fontSize: 'var(--he-type-body-sm-size)' }}>Sincronización de cartera</strong>
          <span style={{ color: 'var(--he-text-secondary)', fontSize: 'var(--he-type-body-sm-size)' }}>
            Última vez hace 3 días.
          </span>
        </div>
      </Popover>
    );
  },
};
