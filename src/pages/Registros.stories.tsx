import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReceiptsPage } from './shared';

/**
 * Figma page 07, "Registros · Recibos": the receipts list with a rule under the header and
 * "Validador de pagos" as a secondary action. Same building blocks as Pages/App shell.
 */
const meta = {
  title: 'Pages/Registros',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recibos: Story = {
  render: () => <ReceiptsPage divided action={{ label: 'Validador de pagos', icon: 'shield-check', primary: false }} />,
};
