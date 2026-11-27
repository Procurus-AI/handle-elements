import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NavItem } from './NavItem';

/**
 * Sidebar Area link. Sits flat on bg/app, no border. The active item is a soft fill pill and
 * carries `aria-current="page"`. Renders an `<a>` with `href`, a `<button>` without.
 */
const meta = {
  title: 'Molecules/Nav item',
  component: NavItem,
  decorators: [
    (Story) => (
      <div style={{ width: 184, padding: 16, background: 'var(--he-bg-app)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Figma board: default and active. */
export const Figma: Story = {
  args: { icon: 'database', children: 'Área' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <NavItem icon="database">Área</NavItem>
      <NavItem icon="database" active>
        Área
      </NavItem>
    </div>
  ),
};

export const States: Story = {
  args: { icon: 'inbox', children: 'Bandeja' },
  render: () => (
    <nav aria-label="Áreas" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <NavItem icon="receipt" active href="#recibos">
        Recibos
      </NavItem>
      <NavItem icon="inbox" href="#bandeja">
        Bandeja
      </NavItem>
      <NavItem icon="settings">Configuración</NavItem>
      <NavItem icon="lock" disabled>
        Bloqueado
      </NavItem>
    </nav>
  ),
};

export const Interaction: Story = {
  args: { icon: 'settings', children: 'Configuración', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const item = within(canvasElement).getByRole('button', { name: 'Configuración' });
    await userEvent.click(item);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(item).not.toHaveAttribute('aria-current');
  },
};

export const ActiveLink: Story = {
  args: { icon: 'receipt', children: 'Recibos', href: '#recibos', active: true },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Recibos' });
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
};
