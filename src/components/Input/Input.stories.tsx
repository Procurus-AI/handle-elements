import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../Icon/Icon';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  args: { placeholder: 'Buscar…' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'pill'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const col = { display: 'flex', flexDirection: 'column', gap: 12, padding: 16, maxWidth: 312 } as const;

/** Figma board: default and focus (shown with autofocus) with the leading search icon. */
export const Figma: Story = {
  render: () => (
    <div style={col}>
      <Input icon={<Icon name="search" />} placeholder="Buscar…" aria-label="Buscar" />
      <Input icon={<Icon name="search" />} placeholder="Buscar…" aria-label="Buscar (enfocado)" autoFocus />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={col}>
      <Input placeholder="Normal" aria-label="Normal" />
      <Input defaultValue="Con valor" aria-label="Con valor" />
      <Input placeholder="Con error" aria-label="Con error" aria-invalid="true" />
      <Input placeholder="Deshabilitado" aria-label="Deshabilitado" disabled />
      <Input
        icon={<Icon name="search" />}
        placeholder="Con atajo"
        aria-label="Con atajo"
        end={<span style={{ fontFamily: 'var(--he-font-mono)', fontSize: 11 }}>⌘K</span>}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <Select defaultValue="all" aria-label="Aseguradora">
          <option value="all">Todas las aseguradoras</option>
          <option value="bupa">Bupa</option>
        </Select>
        <Select variant="ghost" defaultValue="q3" aria-label="Periodo">
          <option value="q3">T3 2026</option>
          <option value="q2">T2 2026</option>
        </Select>
      </div>
      <Textarea placeholder="Notas para la renovación…" aria-label="Notas" />
    </div>
  ),
};
