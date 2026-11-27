import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
import { Select } from '../Input/Select';
import { Textarea } from '../Input/Textarea';
import { Radio, RadioGroup } from '../Radio/Radio';
import { Field } from './Field';

const meta = {
  title: 'Molecules/Field',
  component: Field,
  args: { label: 'Correo para códigos', children: <Input placeholder="nombre@empresa.com" /> },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { hint: 'Usamos este correo para recibir los códigos de la aseguradora' },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 360, padding: 16, background: 'var(--he-bg-surface)' }}>
      <Field label="Correo para códigos" hint="Usamos este correo para recibir los códigos de la aseguradora">
        <Input placeholder="nombre@empresa.com" type="email" />
      </Field>
      <Field label="Correo para códigos" required hint="Usamos este correo para recibir los códigos de la aseguradora" error="Escribe un correo válido, por ejemplo nombre@empresa.com">
        <Input defaultValue="nombre@" type="email" />
      </Field>
      <Field label="Aseguradora">
        <Select defaultValue="bupa">
          <option value="bupa">Bupa</option>
          <option value="axa">AXA</option>
        </Select>
      </Field>
    </div>
  ),
};

/** A short form: Field wraps each control; the primary action appears once. */
export const Form: Story = {
  render: () => (
    <form style={{ display: 'grid', gap: 16, maxWidth: 360 }} onSubmit={(event) => event.preventDefault()}>
      <Field label="Correo para códigos" required hint="Usamos este correo para recibir los códigos de la aseguradora">
        <Input type="email" placeholder="nombre@empresa.com" />
      </Field>
      <Field label="Aseguradora">
        <Select defaultValue="bupa">
          <option value="bupa">Bupa</option>
          <option value="axa">AXA</option>
          <option value="mapfre">MAPFRE</option>
        </Select>
      </Field>
      <Field label="Notas">
        <Textarea placeholder="Contexto para el equipo de operaciones" />
      </Field>
      <RadioGroup name="mailbox" aria-label="Buzón" defaultValue="shared">
        <Radio value="shared" label="Buzón compartido de Handle" />
        <Radio value="own" label="Mi propio correo" />
      </RadioGroup>
      <Checkbox label="Leer códigos automáticamente" defaultChecked />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="submit">Guardar</Button>
        <Button variant="ghost">Cancelar</Button>
      </div>
    </form>
  ),
};

export const ErrorLinked: Story = {
  /* Danger text meets AA on a surface, not on the app background. */
  decorators: [
    (Story) => (
      <div style={{ padding: 16, background: 'var(--he-bg-surface)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Correo para códigos',
    error: 'Escribe un correo válido',
    children: <Input defaultValue="nombre@" type="email" />,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Correo para códigos');
    const message = within(canvasElement).getByText('Escribe un correo válido');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input.getAttribute('aria-describedby')).toContain(message.closest('p')!.id);
  },
};
