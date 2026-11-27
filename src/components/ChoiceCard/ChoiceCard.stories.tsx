import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ChoiceCard, ChoiceCardGroup } from './ChoiceCard';

/**
 * A selectable card for one choice out of a few, such as how Handle gets a verification code.
 * A radiogroup: arrow keys move and select. The selected card takes the focus border, like
 * Carrier status card. There is no Figma board.
 */
const meta = {
  title: 'Molecules/Choice card',
  component: ChoiceCard,
  args: { value: 'bandeja', title: 'Conectar bandeja' },
} satisfies Meta<typeof ChoiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function Choices({ initial }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: 440 }}>
      <ChoiceCardGroup label="¿Cómo recibimos el código de verificación?" value={value} onChange={setValue}>
        <ChoiceCard
          value="bandeja"
          recommended
          icon="inbox"
          title="Conectar bandeja"
          description="Leemos el código directamente del correo que recibe la aseguradora."
        />
        <ChoiceCard
          value="reenvio"
          icon="mail"
          title="Reenviar correos"
          description="Reenvías los correos de la aseguradora a una dirección de Handle."
        />
        <ChoiceCard value="manual" icon="key-round" title="Escribir el código a mano" description="Te lo pedimos en cada inicio de sesión." disabled />
      </ChoiceCardGroup>
    </div>
  );
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Choices initial="bandeja" />
      <Choices />
    </div>
  ),
};

/** The value names a disabled card: the first enabled card must still be a tab stop. */
export const DisabledSelection: Story = {
  render: () => <Choices initial="manual" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: /Conectar bandeja/ })).toHaveAttribute('tabindex', '0');
    await expect(canvas.getByRole('radio', { name: /Reenviar correos/ })).toHaveAttribute('tabindex', '-1');
  },
};

export const KeyboardNavigation: Story = {
  render: () => <Choices initial="bandeja" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bandeja = canvas.getByRole('radio', { name: /Conectar bandeja/ });
    const reenvio = canvas.getByRole('radio', { name: /Reenviar correos/ });
    await expect(bandeja).toBeChecked();
    bandeja.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(reenvio).toBeChecked();
    await expect(reenvio).toHaveFocus();
    // The third card is disabled, so ArrowDown wraps back to the first.
    await userEvent.keyboard('{ArrowDown}');
    await expect(bandeja).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(reenvio).toBeChecked();
    await expect(bandeja).toHaveAttribute('tabindex', '-1');
  },
};
