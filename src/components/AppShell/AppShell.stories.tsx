import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../Button/Button';
import { DemoSidebar } from '../ListPage/fixtures';
import { PageHeader } from '../PageHeader/PageHeader';
import { Panel } from '../Panel/Panel';
import { StatCell, StatStrip } from '../StatCell/StatCell';
import { AppShell } from './AppShell';

/**
 * The application frame: bg-app canvas (pad 8/8/8/0, gap 8), a fixed 208px sidebar, and the main
 * area as the inset Panel, which scrolls vertically inside. Below 960px the sidebar becomes the
 * 56px Brandmark rail. The shell takes its container's height (100dvh by default).
 */
const meta = {
  title: 'Templates/App shell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { sidebar: <DemoSidebar />, children: null },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <>
    <PageHeader inset title="Recibos" aside={<Button icon="play">Ejecutar validación</Button>} />
    <div style={{ padding: '20px var(--he-spacing-6) var(--he-spacing-6)', display: 'grid', gap: 'var(--he-spacing-3)' }}>
      <StatStrip aria-label="Resumen de recibos">
        <StatCell label="Recibos" value="53,938" />
        <StatCell label="Vencidos" value="30" tone="danger" />
        <StatCell label="Monto vencido" value="$103,708.44" tone="danger" />
        <StatCell label="Pagados" value="21,609" tone="success" />
      </StatStrip>
      <Panel title="Resumen por aseguradora" padding="md">
        <p style={{ margin: 0, color: 'var(--he-text-secondary)' }}>
          Seguros Afirme, GNP, AXA, Qualitas y Mapfre sincronizaron hoy.
        </p>
      </Panel>
    </div>
  </>
);

/** The Figma board, 1440x900: sidebar, inset panel with the page header and stats. */
export const Figma: Story = {
  render: (args) => (
    <AppShell {...args} style={{ height: 900, width: 1440 }}>
      {content}
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    // Inside the shell a Sidebar placed as-is gets Kevin's flat rail.
    const rail = getComputedStyle(canvasElement.querySelector('.he-sidebar')!);
    await expect(rail.paddingLeft).toBe('12px');
    await expect(rail.borderRightWidth).toBe('0px');
    await expect(getComputedStyle(canvasElement.querySelector('.he-sidebar__scroll')!).paddingLeft).toBe('0px');
  },
};

/**
 * Collapsed rail: the same shell with `collapsed` on the Sidebar. Below 960px the shell applies the
 * same rail by itself, with no props.
 */
export const States: Story = {
  render: (args) => (
    <AppShell {...args} sidebar={<DemoSidebar active="registros" collapsed />} style={{ height: 560 }}>
      {content}
    </AppShell>
  ),
};
