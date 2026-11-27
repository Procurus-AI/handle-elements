import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ReceiptsPage } from './shared';

/**
 * Figma page 03, "App shell": Registros active, the page header "Recibos" with Ejecutar validación
 * and view tabs with counts, a five-cell stat panel and the receipts table with search, filters
 * and pagination. Fixture data is invented.
 */
const meta = {
  title: 'Pages/App shell',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const page = <ReceiptsPage action={{ label: 'Ejecutar validación', icon: 'play', primary: true }} />;

export const Light: Story = {
  render: () => page,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Recibos' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Registros' })).toHaveAttribute('aria-current', 'page');
  },
};

/** Search filters the table. Kept apart from `Light` so the reference capture shows the full page. */
export const Search: Story = {
  render: () => page,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Buscar recibo o cliente' }), 'Ofelia');
    await expect(canvas.getByText('Ofelia Murillo Rubial')).toBeVisible();
  },
};

/** The same page in the dark theme. The story pins `globals.theme`. */
export const Dark: Story = {
  render: () => page,
  globals: { theme: 'dark' },
};
