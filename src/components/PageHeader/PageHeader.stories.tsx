import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Tabs } from '../Tabs/Tabs';
import { PageHeader } from './PageHeader';

/**
 * Sentient page title with the view's actions on the right and a Tabs row under it
 * (padding 24/24/0/24, gap 16). One primary button per view.
 */
const meta = {
  title: 'Organisms/Page header',
  component: PageHeader,
  args: { title: 'Validación de pagos' },
  argTypes: { size: { control: 'select', options: ['page', 'compact', 'section', 'hero'] } },
  decorators: [
    (Story) => (
      <div style={{ width: 1000, background: 'var(--he-bg-panel)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const VIEWS = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'pagados', label: 'Pagados' },
  { value: 'cancelados', label: 'Cancelados' },
  { value: 'calendario', label: 'Calendario' },
];

function WithTabs() {
  const [view, setView] = useState('pendientes');
  return (
    <PageHeader
      title="Validación de pagos"
      aside={
        <>
          <Button variant="secondary" icon="settings">Configuración</Button>
          <Button variant="secondary" icon="history">Actividad</Button>
          <Button icon="play">Ejecutar validación</Button>
        </>
      }
      tabs={<Tabs aria-label="Vistas" items={VIEWS} value={view} onChange={setView} />}
    />
  );
}

/** The Figma header: title, two secondary actions and one primary, Tabs below. */
export const Figma: Story = { render: () => <WithTabs /> };

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-6)' }}>
      <PageHeader title="Recibos" aside={<Button>Ejecutar validación</Button>} />
      <PageHeader size="compact" title="Póliza AF-4410021" subtitle="Juan Pacheco Aranda · Seguros Afirme" aside={<Button variant="secondary">Editar</Button>} />
      <PageHeader size="section" title="Resultados de contacto" lede="Últimos 90 días." />
      <PageHeader size="hero" title="Buenos días, Camila" lede="Tienes 48 recibos por confirmar hoy." />
      <PageHeader title="Con regla inferior" divider />
    </div>
  ),
};
