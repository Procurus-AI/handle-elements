import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Radio, RadioGroup } from './Radio';

const meta = {
  title: 'Atoms/Radio',
  component: Radio,
  args: { label: 'Correo personal', name: 'demo', value: 'a' },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Radio name="s1" label="Sin marcar" />
      <Radio name="s2" label="Marcada" defaultChecked />
      <Radio name="s3" label="Deshabilitada" disabled />
      <Radio name="s4" label="Marcada y deshabilitada" disabled defaultChecked />
    </div>
  ),
};

export const Group: Story = {
  render: () => {
    const [value, setValue] = useState('shared');
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <span id="mailbox-label" style={{ font: 'var(--he-type-label-md-weight) var(--he-type-label-md-size)/var(--he-type-label-md-line) var(--he-font-sans)' }}>
          Buzón para códigos
        </span>
        <RadioGroup name="mailbox" aria-labelledby="mailbox-label" value={value} onValueChange={setValue}>
          <Radio value="shared" label="Buzón compartido de Handle" description="Recomendado para la mayoría de las cuentas." />
          <Radio value="own" label="Mi propio correo" />
          <Radio value="off" label="No leer códigos" disabled />
        </RadioGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const own = canvas.getByRole('radio', { name: /Mi propio correo/ });
    await userEvent.click(own);
    await expect(own).toBeChecked();
    await expect(canvas.getByRole('radio', { name: /Buzón compartido/ })).not.toBeChecked();
  },
};
