import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card } from '../Card/Card';
import { Switch } from './Switch';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  args: { label: 'Incluir ganancias realizadas', defaultChecked: true },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Settings: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Card style={{ display: 'grid', gap: 18, maxWidth: 420 }}>
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          label="Datos de mercado en vivo"
          description="Actualiza precios y posiciones mientras la página está abierta."
        />
        <Switch label="Resumen por correo" description="Envía un resumen diario." />
        <Switch label="Control bloqueado" disabled defaultChecked />
      </Card>
    );
  },
};
