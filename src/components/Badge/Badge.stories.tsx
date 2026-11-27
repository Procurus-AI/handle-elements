import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from './Badge';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  args: { children: 'Pagado', tone: 'success', dot: true },
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'danger', 'idle', 'accent', 'ok', 'warn', 'error', 'neutral'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: 'flex', gap: 'var(--he-spacing-3)', alignItems: 'center', flexWrap: 'wrap' } as const;

export const Playground: Story = {};

/** Figma board: four tones, each with its dot. */
export const Figma: Story = {
  render: () => (
    <div style={{ ...row, padding: 'var(--he-spacing-4)' }}>
      <Badge tone="success" dot>Pagado</Badge>
      <Badge tone="warning" dot>Pendiente</Badge>
      <Badge tone="danger" dot>Vencido</Badge>
      <Badge tone="idle" dot>Sin conectar</Badge>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)' }}>
      <div style={row}>
        <Badge tone="success" dot>Pagado</Badge>
        <Badge tone="warning" dot>Pendiente</Badge>
        <Badge tone="danger" dot>Vencido</Badge>
        <Badge tone="idle" dot>Sin conectar</Badge>
      </div>
      <div style={row}>
        <Badge tone="success">Pagado</Badge>
        <Badge tone="warning">Pendiente</Badge>
        <Badge tone="danger">Vencido</Badge>
        <Badge tone="idle">Sin conectar</Badge>
      </div>
      <div style={row}>
        <Badge size="sm" tone="success" dot>Pagado</Badge>
        <Badge size="sm" tone="idle">Etiqueta</Badge>
        <Badge tone="accent">Nuevo</Badge>
      </div>
    </div>
  ),
};

/** Nombres de tono de la 0.4.5 (ok, warn, error, neutral) siguen funcionando y pintan el estilo nuevo. */
export const LegacyTones: Story = {
  render: () => (
    <div style={row}>
      <Badge tone="ok">ok</Badge>
      <Badge tone="warn">warn</Badge>
      <Badge tone="error">error</Badge>
      <Badge tone="neutral">neutral</Badge>
    </div>
  ),
  /** Both class generations are emitted, so consumer CSS keyed on 0.4.5 names keeps matching. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('ok')).toHaveClass('he-badge--ok', 'he-badge--success');
    await expect(canvas.getByText('warn')).toHaveClass('he-badge--warn', 'he-badge--warning');
    await expect(canvas.getByText('error')).toHaveClass('he-badge--error', 'he-badge--danger');
    await expect(canvas.getByText('neutral')).toHaveClass('he-badge--neutral', 'he-badge--idle');
  },
};
