import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Money } from '../Money/Money';
import { StatCard } from '../StatCard/StatCard';
import { StatusPill } from '../StatusPill/StatusPill';
import { Tabs } from '../Tabs/Tabs';
import { Drawer } from './Drawer';

const meta = {
  title: 'Organisms/Drawer',
  component: Drawer,
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left'] },
  },
  args: { open: false, onClose: () => {} },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opens on load from a focused trigger, so the open state is what axe scans. */
function OpenOnLoad({
  label,
  children,
}: {
  label: string;
  children: (props: { open: boolean; close: () => void }) => ReactNode;
}) {
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
        {label}
      </button>
      {children({ open, close: () => setOpen(false) })}
    </>
  );
}

function ReceiptBody() {
  return (
    <>
      <p style={{ marginTop: 0, color: 'var(--he-text-secondary)' }}>
        Emitido el 12 feb · Vence el 12 mar · Póliza AUT-4471
      </p>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <StatCard label="Monto" value={<Money value={18240} currency="MXN" />} />
        <StatCard label="Días abierto" value="19" footer="Escala a los 30 días" />
      </div>
    </>
  );
}

export const Open: Story = {
  render: () => (
    <OpenOnLoad label="Ver recibo">
      {({ open, close }) => (
        <Drawer
          open={open}
          onClose={close}
          closeLabel="Cerrar"
          eyebrow="Recibo"
          title="Recibo 30125559390"
          meta={<StatusPill status="warn" label="Pendiente" />}
          footer={
            <>
              <Button variant="ghost" onClick={close}>
                Cancelar
              </Button>
              <Button onClick={close}>Reintentar sincronización</Button>
            </>
          }
        >
          <ReceiptBody />
        </Drawer>
      )}
    </OpenOnLoad>
  ),
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const canvas = within(canvasElement);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName('Recibo 30125559390');
    // Focus trap: Shift+Tab from the panel wraps to the last control.
    await userEvent.tab({ shift: true });
    await expect(within(dialog).getByRole('button', { name: 'Reintentar sincronización' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    const trigger = canvas.getByRole('button', { name: 'Ver recibo' });
    await expect(trigger).toHaveFocus();
    // Leave it open so the accessibility scan sees the open state.
    await userEvent.click(trigger);
    await expect(await body.findByRole('dialog')).toBeVisible();
  },
};

/** Left side, no visible title: the panel is named by `ariaLabel`. */
export const LeftNoTitle: Story = {
  name: 'Left side, no title',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir filtros
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side="left"
          width="320px"
          ariaLabel="Filtros"
          closeLabel="Cerrar"
        >
          <p style={{ marginTop: 0, color: 'var(--he-text-secondary)' }}>
            El contenido del panel se desplaza sin mover la página.
          </p>
        </Drawer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir filtros' }));
    await expect(await within(document.body).findByRole('dialog', { name: 'Filtros' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(within(canvasElement).getByRole('button', { name: 'Abrir filtros' })).toHaveFocus();
  },
};

/**
 * Structured header (`eyebrow` + `title` + `meta`) and a `tabs` bar pinned under the
 * header. The `underline` Tabs variant stays accepted and renders the soft-fill style.
 */
export const WithTabs: Story = {
  name: 'Encabezado y pestañas',
  render: () => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('resumen');
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir cuenta</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          closeLabel="Cerrar"
          width="460px"
          eyebrow="Onboarding detenido"
          title="Protec"
          meta={
            <span style={{ fontWeight: 500, color: 'var(--he-text-primary)' }}>
              <Money as="span" value={2000} currency="USD" /> al mes
            </span>
          }
          tabs={
            <Tabs
              variant="underline"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'resumen', label: 'Resumen' },
                { value: 'pendientes', label: 'Pendientes' },
                { value: 'historial', label: 'Historial' },
              ]}
            />
          }
          footer={
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cerrar cuenta
            </Button>
          }
        >
          {tab === 'resumen' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <StatCard label="Prima anual" value={<Money value={24000} currency="USD" compact />} />
              <StatCard label="Pendientes" value="2" footer="1 error · 1 solicitud" />
            </div>
          )}
          {tab === 'pendientes' && <p style={{ color: 'var(--he-text-secondary)' }}>Primero el más urgente.</p>}
          {tab === 'historial' && <p style={{ color: 'var(--he-text-secondary)' }}>Cambios recientes.</p>}
        </Drawer>
      </>
    );
  },
};

/** The header is a flex sibling of the scroller, so it never scrolls away; controls sit at the trailing edge. */
export const WithActions: Story = {
  name: 'Acciones en el encabezado',
  render: () => {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir registro</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          closeLabel="Cerrar"
          expandLabel="Ampliar panel"
          collapseLabel="Reducir panel"
          width="480px"
          eyebrow="Cliente"
          title="Zazil Selene Montero Sanchez"
          meta={<StatusPill status="ok" label="Pagado" />}
          expanded={expanded}
          onToggleExpand={() => setExpanded((value) => !value)}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Preguntar por este cliente
            </Button>
          }
        >
          {Array.from({ length: 24 }, (_, index) => (
            <p key={index} style={{ marginTop: index === 0 ? 0 : 16, color: 'var(--he-text-secondary)' }}>
              {index + 1}. Correspondencia de renovación, historial de endosos y notas de pago de este
              registro. El encabezado no se mueve al desplazar el cuerpo.
            </p>
          ))}
        </Drawer>
      </>
    );
  },
};
