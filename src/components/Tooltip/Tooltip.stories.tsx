import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Money } from '../Money/Money';
import { StatusPill } from '../StatusPill/StatusPill';
import { Tooltip, HoverCard } from './Tooltip';

const meta = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  args: {
    content: 'Contenido del tooltip',
    children: <Button variant="secondary">Pasa el cursor</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The tooltip opens on focus, so the play function shows it on load, checks the
 * description link, dismisses it with Escape and leaves it open for the scan.
 */
export const Open: Story = {
  render: () => (
    <div style={{ padding: 'var(--he-spacing-12) var(--he-spacing-8)' }}>
      <Tooltip content="Incluye movimientos pendientes, presentados y liquidados." delay={0} placement="bottom">
        <Button variant="secondary">Base del monto</Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Base del monto' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tip = await body.findByRole('tooltip');
    await expect(tip).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-describedby', tip.id);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('tooltip')).toBeNull());
    await expect(trigger).not.toHaveAttribute('aria-describedby');
    await expect(trigger).toHaveFocus();

    // Hover shows it again and leaves it open for the accessibility scan.
    await userEvent.hover(trigger);
    await expect(await body.findByRole('tooltip')).toBeVisible();
  },
};

export const CursorFollowing: Story = {
  name: 'Sigue el cursor',
  render: () => (
    <Tooltip content="Esta tarjeta sigue el cursor en tiras de calor densas." followCursor>
      <span style={{ padding: 'var(--he-spacing-2)', borderBottom: '1px dotted var(--he-border-strong)' }}>
        Exposición del 19 de agosto
      </span>
    </Tooltip>
  ),
};

export const HoverCardStory: Story = {
  name: 'HoverCard',
  render: () => (
    <div style={{ padding: 'var(--he-spacing-8)' }}>
      <HoverCard
        openDelay={0}
        label="Northwind Capital"
        content={
          <div>
            <div className="he-hover-card__header">
              <span className="he-hover-card__eyebrow">Cuenta de cartera</span>
              <div className="he-hover-card__title-row">
                <span className="he-hover-card__title">Northwind Capital</span>
                <StatusPill status="ok" label="Pagado" />
              </div>
            </div>
            <div className="he-hover-card__body">
              <div>
                <div className="he-hover-card__label">Capital comprometido</div>
                <div className="he-hover-card__metric-row">
                  <Money className="he-hover-card__value" value={128400} currency="MXN" />
                  <Chip size="sm">MXN</Chip>
                </div>
              </div>
              <div className="he-hover-card__meta">
                <span>3 vehículos activos</span>
                <span>Actualizado hace 3 días</span>
              </div>
            </div>
          </div>
        }
      >
        <Button variant="secondary">Northwind Capital</Button>
      </HoverCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Northwind Capital' });
    await userEvent.hover(trigger);
    await expect(await body.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await userEvent.unhover(trigger);
    // Leave it open for the accessibility scan.
    await userEvent.hover(trigger);
    await expect(await body.findByRole('dialog')).toBeVisible();
  },
};

/** A Fragment child cannot take props: the description goes on the anchor span. */
export const FragmentChild: Story = {
  name: 'Hijo Fragment',
  render: () => (
    <div style={{ padding: 'var(--he-spacing-12) var(--he-spacing-8)' }}>
      <Tooltip content="Descripción del grupo." delay={0}>
        <>
          <Button variant="secondary">Uno</Button>
          <Button variant="secondary">Dos</Button>
        </>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.tab();
    const tip = await body.findByRole('tooltip');
    const anchor = canvasElement.querySelector('.he-tooltip-anchor');
    await expect(anchor).toHaveAttribute('aria-describedby', tip.id);
  },
};
