import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '../Icon/Icon';
import { Segmented } from './Segmented';

const meta = {
  title: 'Molecules/Segmented',
  component: Segmented,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Uno de N a escala de fila: cambia cómo se muestran los mismos datos. Es un control de contenido; vive en la barra de herramientas, nunca en la fila de pestañas. ' +
          'Semántica `role="group"` con `aria-pressed` (no es Tabs: no hay tabpanel). Las flechas mueven el foco entre opciones habilitadas, Inicio y Fin saltan a los extremos, y Espacio o Enter confirman, para que mantener una flecha no cambie de entorno por accidente. ' +
          'La prop `tone` de 0.4.5 se acepta y se ignora: el control de Figma es neutro.',
      },
    },
  },
  args: { options: [], value: '', onChange: () => {}, label: 'Grupo' },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

const viewOptions = [
  { value: 'summary', label: 'Resumen' },
  { value: 'table', label: 'Tabla' },
];

/** Figma board: two segments, the first selected. */
export const Figma: Story = {
  render: () => {
    const [value, setValue] = useState('summary');
    return <Segmented label="Vista" options={viewOptions} value={value} onChange={setValue} />;
  },
};

export const States: Story = {
  render: () => {
    const [a, setA] = useState('live');
    const [b, setB] = useState('month');
    return (
      <div style={{ display: 'grid', gap: 16, width: 320 }}>
        <Segmented
          label="Entorno"
          block
          value={a}
          onChange={setA}
          options={[
            { value: 'live', label: 'Producción' },
            { value: 'staging', label: 'Pruebas', disabled: true },
            { value: 'dev', label: 'Desarrollo', tone: 'warn' },
          ]}
        />
        <Segmented
          label="Periodo"
          size="sm"
          block
          value={b}
          onChange={setB}
          options={[
            { value: 'month', label: 'Mes' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Año' },
          ]}
        />
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState('summary');
    return (
      <Segmented
        label="Vista"
        value={value}
        onChange={setValue}
        options={[
          { value: 'summary', label: 'Resumen', icon: <Icon name="eye" /> },
          { value: 'table', label: 'Tabla', icon: <Icon name="menu" /> },
        ]}
      />
    );
  },
};

export const Keyboard: Story = {
  render: () => {
    const [value, setValue] = useState('summary');
    return (
      <Segmented
        label="Vista"
        value={value}
        onChange={setValue}
        options={[...viewOptions, { value: 'chart', label: 'Gráfica' }]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByRole('button', { name: 'Resumen' });
    const table = canvas.getByRole('button', { name: 'Tabla' });
    summary.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(table).toHaveFocus();
    await expect(summary).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(table).toHaveAttribute('aria-pressed', 'true');
    await expect(summary).toHaveAttribute('aria-pressed', 'false');
  },
};
