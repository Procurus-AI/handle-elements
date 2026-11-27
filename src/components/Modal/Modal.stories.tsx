import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Money } from '../Money/Money';
import { ConfirmDialog, Modal, type ModalSize } from './Modal';

const meta = {
  title: 'Organisms/Modal',
  component: Modal,
  args: {
    open: false,
    onClose: () => {},
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Same content for every story: the portals Figma frame, in Spanish. */
function PortalStatusBody() {
  return (
    <div style={{ display: 'grid', gap: 'var(--he-spacing-3)' }}>
      <div className="he-modal__summary">
        <div className="he-modal__summary-row">
          <span className="he-modal__summary-label">Credenciales en revisión</span>
          <span className="he-modal__summary-value">5 de 12</span>
        </div>
        <div className="he-modal__summary-row">
          <span className="he-modal__summary-label">Monto pendiente</span>
          <Money value={1842000} currency="MXN" />
        </div>
      </div>
      <div className="he-modal__option-list">
        <div className="he-modal__option he-modal__option--selected">
          <span className="he-modal__option-mark" aria-hidden />
          <span className="he-modal__option-text">
            <span className="he-modal__option-title">Reintentar con las credenciales actuales</span>
            <span className="he-modal__option-hint">Usa el último acceso válido de cada portal.</span>
          </span>
          <Chip size="sm">Recomendado</Chip>
        </div>
        <div className="he-modal__option">
          <span className="he-modal__option-mark" aria-hidden />
          <span className="he-modal__option-text">
            <span className="he-modal__option-title">Esperar al siguiente ciclo</span>
            <span className="he-modal__option-hint">La próxima sincronización corre en 3 horas.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function PortalStatusModal({
  open,
  onClose,
  size,
}: {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size={size}
      title="Estado de portales"
      description="Estamos revisando 5 credenciales · 1 sin datos nuevos"
      closeLabel="Cerrar"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>Reintentar sincronización</Button>
        </>
      }
    >
      <PortalStatusBody />
    </Modal>
  );
}

/** Opens on load from a focused trigger, so the open state is what axe scans. */
function OpenOnLoad({ children }: { children: (props: { open: boolean; close: () => void }) => ReactNode }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    trigger.current?.focus();
    setOpen(true);
  }, []);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="he-btn he-btn--default he-btn--size-default"
        onClick={() => setOpen(true)}
      >
        Ver estado de portales
      </button>
      {children({ open, close: () => setOpen(false) })}
    </>
  );
}

export const Open: Story = {
  render: () => (
    <OpenOnLoad>{({ open, close }) => <PortalStatusModal open={open} onClose={close} />}</OpenOnLoad>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const canvas = within(canvasElement);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName('Estado de portales');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    const trigger = canvas.getByRole('button', { name: 'Ver estado de portales' });
    await expect(trigger).toHaveFocus();
    // Leave it open so the accessibility scan sees the open state.
    await userEvent.click(trigger);
    await expect(await body.findByRole('dialog')).toBeVisible();
  },
};

export const FocusTrap: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Ver estado de portales</Button>
        <PortalStatusModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Ver estado de portales' }));
    const dialog = await body.findByRole('dialog');
    const close = within(dialog).getByRole('button', { name: 'Cerrar' });
    const retry = within(dialog).getByRole('button', { name: 'Reintentar sincronización' });
    retry.focus();
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(retry).toHaveFocus();
    await userEvent.click(retry);
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};

export const Confirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Archivar cuenta
        </Button>
        {done && <p role="status">Se guardaron los cambios</p>}
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setDone(true)}
          intent="destructive"
          title="¿Archivar esta cuenta?"
          description="Sale de las vistas activas de la cartera."
          confirmLabel="Archivar"
          cancelLabel="Cancelar"
          closeLabel="Cerrar"
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Archivar cuenta' }));
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName('¿Archivar esta cuenta?');
    await expect(within(dialog).getByRole('button', { name: 'Archivar' })).toHaveClass('he-btn--destructive');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Archivar' }));
    await expect(await within(canvasElement).findByRole('status')).toHaveTextContent('Se guardaron los cambios');
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<ModalSize | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 'var(--he-spacing-2)' }}>
          {(['sm', 'md', 'lg'] as const).map((value) => (
            <Button key={value} variant="outline" onClick={() => setSize(value)}>
              Tamaño {value}
            </Button>
          ))}
        </div>
        <PortalStatusModal open={size !== null} onClose={() => setSize(null)} size={size ?? 'md'} />
      </>
    );
  },
};
