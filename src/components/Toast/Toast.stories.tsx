import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Toast, ToastProvider, useToast, type ToastToneLabels } from './Toast';

const toneLabels: Partial<ToastToneLabels> = {
  neutral: 'Aviso',
  success: 'Listo',
  warning: 'Atención',
  danger: 'Error',
};

const meta = {
  title: 'Molecules/Toast',
  component: Toast,
  args: { title: 'Se guardaron los cambios' },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

function Triggers() {
  const { toast, dismissAll } = useToast();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--he-spacing-2)' }}>
      <Button variant="outline" onClick={() => toast({ title: 'Sincronización en cola' })}>
        Aviso
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            tone: 'success',
            title: 'Se guardaron los cambios',
            description: 'La póliza AUT-4471 ya está al día.',
          })
        }
      >
        Éxito
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            tone: 'warning',
            title: 'Sin datos nuevos',
            description: 'GNP no devolvió recibos en las últimas 72 horas.',
          })
        }
      >
        Advertencia
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            tone: 'danger',
            title: 'No se pudo sincronizar',
            description: 'Las credenciales de Chubb dejaron de funcionar.',
            action: { label: 'Reintentar sincronización', onClick: () => undefined },
          })
        }
      >
        Error
      </Button>
      <Button variant="ghost" onClick={dismissAll}>
        Cerrar todos
      </Button>
    </div>
  );
}

/** Toasts triggered by buttons. `status` for neutral and success, `alert` for danger. */
export const Tones: Story = {
  render: () => (
    <ToastProvider toneLabels={toneLabels} closeLabel="Cerrar notificación" regionLabel="Notificaciones">
      <Triggers />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Éxito' }));
    const status = await body.findByRole('status');
    await expect(status).toBeVisible();
    await expect(status).toHaveTextContent('Se guardaron los cambios');
    await expect(status).toHaveTextContent('Listo');

    await userEvent.click(canvas.getByRole('button', { name: 'Error' }));
    const alert = await body.findByRole('alert');
    await expect(alert).toHaveTextContent('No se pudo sincronizar');
    await expect(alert).toHaveTextContent('Error');

    await userEvent.click(within(status).getByRole('button', { name: 'Cerrar notificación' }));
    await waitFor(() => expect(body.queryByRole('status')).toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar todos' }));
    await waitFor(() => expect(body.queryByRole('alert')).toBeNull());
  },
};

const onRetry = fn();

function OnLoad() {
  const { toast } = useToast();
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast({ tone: 'success', title: 'Se guardaron los cambios', description: 'Los recibos ya están al día.' });
    toast({
      tone: 'danger',
      title: 'No se pudo sincronizar',
      description: 'Las credenciales de Chubb dejaron de funcionar.',
      action: { label: 'Reintentar sincronización', onClick: onRetry },
    });
  }, [toast]);
  return null;
}

/** Stays on screen (no auto-dismiss) so the scan sees the open stack. */
export const Open: Story = {
  render: () => (
    <ToastProvider duration={0} toneLabels={toneLabels} closeLabel="Cerrar notificación" regionLabel="Notificaciones">
      <OnLoad />
      <p style={{ margin: 0 }}>Las notificaciones aparecen abajo a la derecha.</p>
    </ToastProvider>
  ),
  play: async () => {
    const body = within(document.body);
    onRetry.mockClear();
    await expect(await body.findByRole('status')).toBeVisible();
    const alert = await body.findByRole('alert');
    await expect(alert).toBeVisible();
    await userEvent.click(within(alert).getByRole('button', { name: 'Reintentar sincronización' }));
    await expect(onRetry).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(body.queryByRole('alert')).toBeNull());
  },
};

function QuickTrigger() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ tone: 'success', title: 'Se guardaron los cambios' })}>Guardar</Button>;
}

/** Auto-dismiss runs on a short clock here; hovering stops it. */
export const AutoDismiss: Story = {
  name: 'Cierre automático',
  render: () => (
    <ToastProvider duration={1500} toneLabels={toneLabels} closeLabel="Cerrar notificación">
      <QuickTrigger />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Guardar' }));
    const toast = await body.findByRole('status');
    await userEvent.hover(toast);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await expect(body.getByRole('status')).toBeVisible();
    await userEvent.unhover(toast);
    await waitFor(() => expect(body.queryByRole('status')).toBeNull(), { timeout: 4000 });
  },
};

/** Every tone, as the static `Toast` (no timer, no portal). */
export const States: Story = {
  name: 'Estados',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)', maxWidth: 360 }}>
      <Toast tone="neutral" toneLabel="Aviso" title="Sincronización en cola" onClose={() => undefined} closeLabel="Cerrar notificación" />
      <Toast
        tone="success"
        toneLabel="Listo"
        title="Se guardaron los cambios"
        description="La póliza AUT-4471 ya está al día."
        onClose={() => undefined}
        closeLabel="Cerrar notificación"
      />
      <Toast
        tone="warning"
        toneLabel="Atención"
        title="Sin datos nuevos"
        description="GNP no devolvió recibos en las últimas 72 horas."
        onClose={() => undefined}
        closeLabel="Cerrar notificación"
      />
      <Toast
        tone="danger"
        toneLabel="Error"
        title="No se pudo sincronizar"
        description="Las credenciales de Chubb dejaron de funcionar."
        action={{ label: 'Reintentar sincronización', onClick: () => undefined }}
        onClose={() => undefined}
        closeLabel="Cerrar notificación"
      />
    </div>
  ),
};
