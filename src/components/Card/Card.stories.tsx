import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid, Stack } from '../Layout/Layout';
import { StatusPill } from '../StatusPill/StatusPill';
import { Card, type CardStatus, type CardStatusVariant } from './Card';

/**
 * `statusVariant` defaults to `edge`: `status` recolors the card's own 1px
 * border instead of drawing a bar. There is no spine variant. A status bar at
 * the edge of a surface is a rejected pattern here; `edge` recolours the card's
 * own 1px border, and `none` exposes `data-status` so a child dot or StatusPill
 * carries the meaning.
 */
const meta = {
  title: 'Elements/Card',
  component: Card,
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    as: { control: 'select', options: ['div', 'article', 'section', 'a'] },
    status: { control: 'select', options: [undefined, 'ok', 'warn', 'error', 'accent', 'neutral'] },
    statusVariant: { control: 'inline-radio', options: ['edge', 'none'] },
    selected: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUSES: readonly (readonly [CardStatus, string, string])[] = [
  ['ok', 'Al día', 'Recovery on track'],
  ['warn', 'Necesita atención', '24 cuentas en riesgo'],
  ['error', 'Atorado', 'Escalación abierta'],
  ['accent', 'Destacado', 'Mejor recuperación del mes'],
  ['neutral', 'Sin señal', 'Nunca corrió'],
];

export const Playground: Story = {
  args: {
    children: 'A quiet surface for grouped content.',
    padding: 'md',
  },
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {STATUSES.map(([status, title, sub]) => (
        <Card key={status} status={status}>
          <strong>{title}</strong>
          <p style={{ margin: '6px 0 0', color: 'var(--he-text-dim)', fontSize: 13 }}>{sub}</p>
        </Card>
      ))}
      <Card status="warn" selected clickable tabIndex={0}>
        <strong>Selected + warn</strong>
        <p style={{ margin: '6px 0 0', color: 'var(--he-text-dim)', fontSize: 13 }}>
          Ink border wins over the status edge.
        </p>
      </Card>
    </div>
  ),
};
Status.storyName = 'Status — edge (default)';

// Both treatments side by side. `none` is the pattern the attention rows want:
// the pill already states the status, so the card stays quiet.
export const StatusVariants: Story = {
  render: () => (
    <Grid columns={2} gap={4}>
      {(['edge', 'none'] as const).map((variant: CardStatusVariant) => (
        <Stack key={variant} gap={3}>
          <span
            style={{
              fontFamily: 'var(--he-font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 'var(--he-tracking-caps)',
              color: 'var(--he-text-faint)',
            }}
          >
            {variant}
          </span>
          {STATUSES.map(([status, title]) => (
            <Card key={status} status={status} statusVariant={variant} padding="sm">
              {variant === 'none' ? (
                <Stack direction="row" gap={2} align="center" justify="between">
                  <strong style={{ fontSize: 13 }}>{title}</strong>
                  <StatusPill status={status} label={status} />
                </Stack>
              ) : (
                <strong style={{ fontSize: 13 }}>{title}</strong>
              )}
            </Card>
          ))}
        </Stack>
      ))}
    </Grid>
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
