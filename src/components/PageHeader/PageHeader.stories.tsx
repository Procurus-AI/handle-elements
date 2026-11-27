import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Tabs } from '../Tabs/Tabs';
import { PageHeader } from './PageHeader';

/**
 * Sentient page title with the view's actions on the right and a Tabs row under it (gap 16).
 * Flush by default, as in 0.4.5; `inset` adds the Figma padding 24/24/0/24 for a header at the
 * top of a shell panel. One primary button per view.
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
      inset
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

/** Flush by default (no padding, 32px below); `inset` swaps that for the Figma padding. */
export const Inset: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-6)' }}>
      <PageHeader title="Sin relleno" />
      <PageHeader inset title="Con relleno" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const flush = canvas.getByRole('heading', { name: 'Sin relleno' }).closest('header')!;
    const inset = canvas.getByRole('heading', { name: 'Con relleno' }).closest('header')!;
    await expect(getComputedStyle(flush).paddingLeft).toBe('0px');
    await expect(getComputedStyle(flush).paddingTop).toBe('0px');
    await expect(getComputedStyle(flush).marginBottom).toBe('32px');
    await expect(getComputedStyle(inset).paddingLeft).toBe('24px');
    await expect(getComputedStyle(inset).paddingTop).toBe('24px');
    await expect(getComputedStyle(inset).marginBottom).toBe('0px');
  },
};

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
