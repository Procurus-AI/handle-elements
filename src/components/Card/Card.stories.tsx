import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Elements/Card',
  component: Card,
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    as: { control: 'select', options: ['div', 'article', 'section', 'a'] },
    status: { control: 'select', options: [undefined, 'ok', 'warn', 'error', 'accent', 'neutral'] },
    selected: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'A quiet surface for grouped content.',
    padding: 'md',
  },
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {([
        ['ok', 'Al día', 'Recovery on track'],
        ['warn', 'Necesita atención', '24 cuentas en riesgo'],
        ['error', 'Atorado', 'Escalación abierta'],
        ['accent', 'Destacado', 'Mejor recuperación del mes'],
        ['neutral', 'Sin señal', 'Nunca corrió'],
      ] as const).map(([status, title, sub]) => (
        <Card key={status} status={status}>
          <strong>{title}</strong>
          <p style={{ margin: '6px 0 0', color: 'var(--he-text-dim)', fontSize: 13 }}>{sub}</p>
        </Card>
      ))}
      <Card status="warn" selected clickable tabIndex={0}>
        <strong>Selected + warn</strong>
        <p style={{ margin: '6px 0 0', color: 'var(--he-text-dim)', fontSize: 13 }}>
          Ink border + status spine.
        </p>
      </Card>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      <Card clickable tabIndex={0}>
        <strong>Hover me</strong>
        <p style={{ margin: '8px 0 0', color: 'var(--he-text-dim)', fontSize: 13 }}>
          Lifts on hover — never darkens.
        </p>
      </Card>
      <Card as="a" href="#" clickable>
        <strong>Link card</strong>
        <p style={{ margin: '8px 0 0', color: 'var(--he-text-dim)', fontSize: 13 }}>
          Rendered as an anchor.
        </p>
      </Card>
    </div>
  ),
};
