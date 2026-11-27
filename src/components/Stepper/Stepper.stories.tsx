import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { ChoiceCard, ChoiceCardGroup } from '../ChoiceCard/ChoiceCard';
import { Input } from '../Input/Input';
import { Stepper, type StepperStep } from './Stepper';

/**
 * One decision per step, for credential and MFA flows. The current step is a soft fill with
 * `aria-current="step"`; completed steps show a check. There is no Figma board: it is derived
 * from Tab and Nav item (soft fill, Label/md) with status/success for complete.
 */
const meta = {
  title: 'Molecules/Stepper',
  component: Stepper,
  args: { current: 1, steps: [] },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const STEPS: StepperStep[] = [
  { label: 'Credenciales', description: 'Usuario y contraseña del portal' },
  { label: 'Códigos de verificación', description: 'Cómo recibimos el código' },
  { label: 'Confirmación' },
];

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, width: 560 }}>
      <Stepper aria-label="Pasos, en el primero" steps={STEPS} current={0} />
      <Stepper aria-label="Pasos, en el segundo" steps={STEPS} current={1} />
      <Stepper aria-label="Pasos, en el último" steps={STEPS} current={2} />
      <Stepper aria-label="Pasos, horizontal" steps={STEPS} current={1} orientation="horizontal" />
    </div>
  ),
};

const COPY = ['Escribe las credenciales con las que entras al portal de la aseguradora.', '', 'Revisa los datos y conecta la aseguradora.'];

/** The flow this component exists for: three steps, one decision each. */
export const ConectarAseguradora: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const [mode, setMode] = useState<string | undefined>('bandeja');
    return (
      <div style={{ width: 520 }}>
        <Stepper aria-label="Conectar aseguradora" steps={STEPS} current={step}>
          {step === 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <p style={{ margin: 0, font: 'var(--he-type-body-sm-size)/var(--he-type-body-sm-line) var(--he-font-sans)' }}>{COPY[0]}</p>
              <Input aria-label="Usuario del portal" placeholder="Usuario" />
              <Input aria-label="Contraseña del portal" type="password" placeholder="Contraseña" />
            </div>
          )}
          {step === 1 && (
            <ChoiceCardGroup label="¿Cómo recibimos el código de verificación?" value={mode} onChange={setMode}>
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
            </ChoiceCardGroup>
          )}
          {step === 2 && (
            <p style={{ margin: 0, font: 'var(--he-type-body-sm-size)/var(--he-type-body-sm-line) var(--he-font-sans)' }}>{COPY[2]}</p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Atrás
              </Button>
            )}
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>Continuar</Button>
            ) : (
              <Button>Conectar</Button>
            )}
          </div>
        </Stepper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Credenciales').closest('li')).toHaveAttribute('aria-current', 'step');
    await userEvent.click(canvas.getByRole('button', { name: 'Continuar' }));
    await expect(canvas.getByText('Códigos de verificación').closest('li')).toHaveAttribute('aria-current', 'step');
    await expect(canvas.getByRole('radio', { name: /Conectar bandeja/ })).toBeChecked();
  },
};
