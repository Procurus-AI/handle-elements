import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  args: { children: 'Etiqueta' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } as const;

/** Figma board: primary, secondary and ghost, with and without the leading icon. */
export const Figma: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, padding: 16, justifyItems: 'start' }}>
      <div style={row}>
        <Button icon="settings">Etiqueta</Button>
        <Button>Etiqueta</Button>
      </div>
      <div style={row}>
        <Button variant="secondary" icon="settings">Etiqueta</Button>
        <Button variant="secondary">Etiqueta</Button>
      </div>
      <div style={row}>
        <Button variant="ghost" icon="settings">Etiqueta</Button>
        <Button variant="ghost">Etiqueta</Button>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['default', 'secondary', 'ghost', 'destructive', 'link'] as const).map((variant) => (
        <div key={variant} style={row}>
          <Button variant={variant}>Normal</Button>
          <Button variant={variant} disabled>Deshabilitado</Button>
          <Button variant={variant} loading>Guardando</Button>
        </div>
      ))}
      <p style={{ margin: 0, font: 'var(--he-type-body-sm-size)/var(--he-type-body-sm-line) var(--he-font-sans)', color: 'var(--he-text-secondary)' }}>
        Hover y presionado: pasa el cursor y mantén pulsado sobre cualquier botón.
      </p>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={row}>
      <Button icon="plus">Agregar póliza</Button>
      <Button variant="secondary" icon="download">Exportar</Button>
      <Button variant="ghost" icon="refresh-cw">Actualizar</Button>
      <Button variant="destructive" icon="trash-2">Eliminar</Button>
      <Button variant="secondary" size="icon" aria-label="Ajustes" icon="settings" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <Button size="xs">Extra pequeño</Button>
      <Button size="sm">Pequeño</Button>
      <Button>Estándar</Button>
      <Button size="lg">Grande</Button>
    </div>
  ),
};

export const Click: Story = {
  args: { onClick: fn(), children: 'Guardar cambios' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Guardar cambios' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
