import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppShell } from '../components/AppShell/AppShell';
import { Button } from '../components/Button/Button';
import { CarrierStatusCard } from '../components/CarrierStatusCard/CarrierStatusCard';
import { ChoiceCard, ChoiceCardGroup } from '../components/ChoiceCard/ChoiceCard';
import { Count } from '../components/Count/Count';
import { Drawer } from '../components/Drawer/Drawer';
import { Field } from '../components/Field/Field';
import { FilterChip } from '../components/FilterChip/FilterChip';
import { Input } from '../components/Input/Input';
import { NavItem } from '../components/NavItem/NavItem';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Stepper } from '../components/Stepper/Stepper';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { CARRIERS, CARRIER_GROUPS, CODE_STEPS, SETTINGS_INDEX, type CarrierSetting } from './fixtures';
import { PagesSidebar } from './shared';

/**
 * PROPOSAL. There is no Figma frame or PRD for this screen yet; it answers the team's pain
 * points and is not part of the fidelity check.
 *
 * - One entry point: a single Configuración item in the sidebar footer, with a left index
 *   (Pendientes first, then Aseguradoras, Cobranza, Equipo).
 * - Carriers are grouped by what the person has to do: Requieren atención, Al día, Sin conectar.
 * - Choosing a card opens a drawer with one decision per step: Credenciales, Códigos de
 *   verificación (Conectar bandeja de correo, recomendado, or Reenviar correos) and Confirmación.
 * - Status words say what is confirmed and what is still running ("Inicio de sesión confirmado,
 *   validación en curso"), never a bare "Error" or "Conectado".
 */
const meta = {
  title: 'Pages/Propuestas/Configuración · Aseguradoras',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Propuesta, sin Figma ni PRD todavía. Una sola entrada de Configuración en el pie de la barra lateral, un índice a la izquierda, tarjetas de aseguradoras agrupadas por estado y un panel lateral con un paso por decisión.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Filter = 'todas' | CarrierSetting['group'];

function CarrierFlow({ carrier, step, onStep, onClose }: { carrier: CarrierSetting; step: number; onStep: (n: number) => void; onClose: () => void }) {
  const [mode, setMode] = useState<string | undefined>('bandeja');
  const last = step === CODE_STEPS.length - 1;
  return (
    <Stepper aria-label={`Conectar ${carrier.name}`} steps={CODE_STEPS} current={step}>
      <div className="pg-flow">
        {step === 0 && (
          <>
            <p className="pg-flow__note">Usa el usuario y la contraseña con los que entras al portal de {carrier.name}.</p>
            <div className="pg-flow__fields">
              <Field label="Usuario del portal">
                <Input defaultValue="" placeholder="Usuario" autoComplete="off" />
              </Field>
              <Field label="Contraseña del portal" hint="Se guarda cifrada y solo la usa Handle para iniciar sesión.">
                <Input type="password" placeholder="Contraseña" autoComplete="off" />
              </Field>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            {carrier.tone === 'warning' && (
              <p className="pg-flow__status" role="status">
                {carrier.status}
              </p>
            )}
            <ChoiceCardGroup label="¿Cómo recibimos el código de verificación?" value={mode} onChange={setMode}>
              <ChoiceCard
                value="bandeja"
                icon="inbox"
                recommended
                title="Conectar bandeja de correo"
                description="Leemos solo los códigos de la aseguradora. No hay que hacer nada después."
              />
              <ChoiceCard
                value="reenvio"
                icon="mail"
                title="Reenviar correos"
                description="Reenvías los correos de la aseguradora a una dirección de Handle."
              />
            </ChoiceCardGroup>
          </>
        )}
        {step === 2 && (
          <p className="pg-flow__note">
            Vamos a iniciar sesión en {carrier.name} con estos datos
            {mode === 'bandeja' ? ' y a leer los códigos de tu bandeja' : ' y a esperar los correos reenviados'}. Te avisamos cuando el
            inicio de sesión esté confirmado y cuando termine la validación.
          </p>
        )}
        <div className="pg-flow__footer">
          <Button variant="ghost" onClick={step === 0 ? onClose : () => onStep(step - 1)}>
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          <Button onClick={last ? onClose : () => onStep(step + 1)}>{last ? 'Conectar' : 'Continuar'}</Button>
        </div>
      </div>
    </Stepper>
  );
}

function Page({ initialOpen }: { initialOpen?: string }) {
  const [filter, setFilter] = useState<Filter>('todas');
  const [openId, setOpenId] = useState<string | null>(initialOpen ?? null);
  const [step, setStep] = useState(initialOpen ? 1 : 0);
  const carrier = CARRIERS.find((c) => c.id === openId) ?? null;
  const close = () => setOpenId(null);
  const countOf = (g: Filter) => (g === 'todas' ? CARRIERS.length : CARRIERS.filter((c) => c.group === g).length);

  return (
    <AppShell sidebar={<PagesSidebar active="configuracion" />}>
      <PageHeader title="Configuración" />
      <div className="pg-settings">
        <nav className="pg-settings__index" aria-label="Secciones de configuración">
          {SETTINGS_INDEX.map((s) => (
            <NavItem key={s.id} active={s.id === 'aseguradoras'}>
              {s.label}
              {s.count != null && (
                <>
                  {' '}
                  <Count tone="warning">{s.count}</Count>
                </>
              )}
            </NavItem>
          ))}
        </nav>
        <div className="pg-settings__main">
          <p className="pg-settings__intro">
            Conecta cada aseguradora una sola vez. Las que necesitan algo de ti aparecen primero.
          </p>
          <Toolbar aria-label="Filtrar aseguradoras">
            <FilterChip label="Todas" count={countOf('todas')} active={filter === 'todas'} onClick={() => setFilter('todas')} />
            {CARRIER_GROUPS.map((g) => (
              <FilterChip
                key={g.id}
                label={g.label}
                count={countOf(g.id)}
                tone={g.id === 'atencion' ? 'warning' : g.id === 'aldia' ? 'success' : 'idle'}
                active={filter === g.id}
                onClick={() => setFilter(g.id)}
              />
            ))}
          </Toolbar>
          {CARRIER_GROUPS.filter((g) => filter === 'todas' || filter === g.id).map((g) => (
            <section key={g.id} className="pg-group" aria-labelledby={`pg-group-${g.id}`}>
              <h2 id={`pg-group-${g.id}`} className="pg-group__head">
                {g.label}
                <Count>{countOf(g.id)}</Count>
              </h2>
              <div className="pg-group__grid">
                {CARRIERS.filter((c) => c.group === g.id).map((c) => (
                  <CarrierStatusCard
                    key={c.id}
                    name={c.name}
                    status={c.status}
                    tone={c.tone}
                    credentials={c.credentials}
                    lastSync={c.lastSync}
                    selected={openId === c.id}
                    onClick={() => {
                      setStep(0);
                      setOpenId(c.id);
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <Drawer
        open={carrier != null}
        onClose={close}
        closeLabel="Cerrar"
        eyebrow="Aseguradora"
        title={carrier?.name ?? ''}
        ariaLabel={carrier ? undefined : 'Aseguradora'}
      >
        {carrier && <CarrierFlow carrier={carrier} step={step} onStep={setStep} onClose={close} />}
      </Drawer>
    </AppShell>
  );
}

/** Closed: carriers grouped by what needs doing. Choosing a card opens the drawer. */
export const Aseguradoras: Story = {
  render: () => <Page />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: /Requieren atención/ })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /AXA/ }));
    const dialog = await within(document.body).findByRole('dialog', { name: 'AXA' });
    await expect(within(dialog).getByText('Credenciales', { selector: '.he-stepper__label' })).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Continuar' }));
    await expect(within(dialog).getByRole('radio', { name: /Conectar bandeja de correo/ })).toBeChecked();
    await expect(within(dialog).getByRole('status')).toHaveTextContent('Inicio de sesión confirmado, validación en curso');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
  },
};

/** The drawer at step 2, where the decision is how the verification code reaches Handle. */
export const CodigosDeVerificacion: Story = {
  name: 'Códigos de verificación',
  render: () => <Page initialOpen="axa" />,
};
