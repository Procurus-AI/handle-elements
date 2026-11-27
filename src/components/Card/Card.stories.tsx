import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge } from '../Badge/Badge';
import { Card, type CardStatus } from './Card';

/**
 * Flat outlined surface: bg-surface, 1px border, corner lg, no shadow. Hover on a clickable card
 * only strengthens the border. `status` recolours the card's own border.
 */
const meta = {
  title: 'Organisms/Card',
  component: Card,
  args: { padding: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['outline', 'soft', 'plain'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = (
  <>
    <div style={{ fontWeight: 500 }}>Seguros Afirme</div>
    <div style={{ color: 'var(--he-text-secondary)', marginTop: 4 }}>3 recibos por confirmar hoy</div>
  </>
);

/** The reference card, with the three surfaces side by side. */
export const Figma: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 'var(--he-spacing-3)', padding: 'var(--he-spacing-4)' }}>
      <Card variant="outline">{body}</Card>
      <Card variant="soft">{body}</Card>
      <Card variant="plain">{body}</Card>
    </div>
  ),
};

const statuses: CardStatus[] = ['ok', 'warn', 'error', 'neutral', 'accent'];

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 'var(--he-spacing-3)', padding: 'var(--he-spacing-4)' }}>
      <Card>{body}</Card>
      <Card clickable>{body}</Card>
      <Card selected>{body}</Card>
      {statuses.map((status) => (
        <Card key={status} status={status}>
          <Badge tone={status === 'accent' ? 'accent' : status}>{status}</Badge>
          <div style={{ marginTop: 8 }}>Borde con estado</div>
        </Card>
      ))}
    </div>
  ),
};

/** A link card: Enter and click both activate it. */
export const Clickable: Story = {
  args: { clickable: true, role: 'button', tabIndex: 0, onClick: fn() },
  render: (args) => <Card {...args}>{body}</Card>,
  play: async ({ canvasElement, args }) => {
    const card = within(canvasElement).getByRole('button');
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
