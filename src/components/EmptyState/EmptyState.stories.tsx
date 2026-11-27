import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { EmptyState } from './EmptyState';

/**
 * Shown inside a table panel when filters return nothing. The title states the fact, the body
 * states the fix, and there is at most one action.
 */
const meta = {
  title: 'Molecules/Empty state',
  component: EmptyState,
  args: {
    title: 'Sin recibos que coincidan',
    hint: 'Ajusta los filtros o el término de búsqueda para ver resultados.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Figma board: 600x200 panel. */
export const Figma: Story = {
  args: { icon: <Icon name="inbox" size={24} /> },
  render: (args) => (
    <div style={{ width: 600, height: 200, display: 'flex' }}>
      <EmptyState {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 16,
        width: 880,
        background: 'var(--he-bg-surface)',
      }}
    >
      <EmptyState size="sm" icon={<Icon name="search" size={24} />} title="Sin resultados" hint="Prueba con otro término." />
      <EmptyState
        icon={<Icon name="inbox" size={24} />}
        title="Sin recibos que coincidan"
        hint="Ajusta los filtros o el término de búsqueda para ver resultados."
        action={<Button variant="secondary">Limpiar filtros</Button>}
      />
      <EmptyState align="start" size="sm" title="Sin pólizas" hint="Conecta una aseguradora para traerlas." />
      <EmptyState size="sm" title="Nada por aquí" />
    </div>
  ),
};
