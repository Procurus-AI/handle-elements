import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  args: { label: 'Recibir códigos por correo' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="Sin marcar" />
      <Checkbox label="Marcada" defaultChecked />
      <Checkbox label="Indeterminada" indeterminate />
      <Checkbox label="Con error" aria-invalid="true" />
      <Checkbox label="Deshabilitada" disabled />
      <Checkbox label="Marcada y deshabilitada" disabled defaultChecked />
    </div>
  ),
};

/** Parent checkbox goes indeterminate when only some children are selected. */
export const Form: Story = {
  render: () => {
    const [items, setItems] = useState({ bupa: true, axa: false, mapfre: false });
    const values = Object.values(items);
    const all = values.every(Boolean);
    const some = values.some(Boolean);
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        <legend style={{ font: 'var(--he-type-label-md-weight) var(--he-type-label-md-size)/var(--he-type-label-md-line) var(--he-font-sans)', marginBottom: 8 }}>
          Aseguradoras con lectura de códigos
        </legend>
        <Checkbox
          label="Todas"
          checked={all}
          indeterminate={some && !all}
          onChange={(event) =>
            setItems({ bupa: event.target.checked, axa: event.target.checked, mapfre: event.target.checked })
          }
        />
        <div style={{ display: 'grid', gap: 8, paddingLeft: 24 }}>
          <Checkbox label="Bupa" checked={items.bupa} onChange={(e) => setItems({ ...items, bupa: e.target.checked })} />
          <Checkbox label="AXA" checked={items.axa} onChange={(e) => setItems({ ...items, axa: e.target.checked })} />
          <Checkbox label="MAPFRE" checked={items.mapfre} onChange={(e) => setItems({ ...items, mapfre: e.target.checked })} />
        </div>
      </fieldset>
    );
  },
};

export const Toggles: Story = {
  args: { label: 'Acepto recibir avisos', description: 'Puedes cambiarlo cuando quieras.' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: /Acepto recibir avisos/ });
    await expect(box).not.toBeChecked();
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await userEvent.click(box);
    await expect(box).not.toBeChecked();
  },
};
