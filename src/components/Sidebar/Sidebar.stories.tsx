import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Avatar } from '../Avatar/Avatar';
import { Icon } from '../Icon/Icon';
import { DemoSidebar } from '../ListPage/fixtures';
import { Sidebar, SidebarFooterItem, SidebarHeader, SidebarItem, SidebarSection } from './Sidebar';

/**
 * The app's left rail. Standalone it is opaque with a hairline on the right and padding on the
 * scroll region (0.4.5 geometry); inside the App shell, or with `flat`, it is Kevin's flat look
 * on the bg-app canvas: logo, labelled sections of Nav items,
 * then a footer with Configuración, the theme control and the Profile row. A single
 * settings entry: Configuración lives only in the footer. `collapsed` (or the App shell below
 * 960px) turns it into a 56px rail with the Brandmark.
 *
 * `SidebarItem` renders like `NavItem` (it carries the same classes) and adds a trailing `end`
 * slot and `depth` indent.
 */
const meta = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--he-bg-app)', padding: 'var(--he-spacing-4)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const column = (width: number, height = 760) => ({ width, height, display: 'flex' as const });

/** The Figma sidebar: 208 wide, pad 12, current Area "Validación de pagos". */
export const Figma: Story = {
  render: () => (
    <div style={column(208)}>
      <DemoSidebar active="validacion" />
    </div>
  ),
};

/**
 * Standalone defaults, the geometry apps that place the rail themselves depend on: opaque
 * background, border on the right, padding on the scroll region and none on the rail.
 */
export const Standalone: Story = {
  render: () => (
    <div style={column(250, 320)}>
      <Sidebar aria-label="Barra lateral independiente">
        <SidebarSection label="Agentes" collapsible={false}>
          <SidebarItem icon={<Icon name="file-text" />} label="Agente de Cotización" />
        </SidebarSection>
      </Sidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rail = within(canvasElement).getByRole('complementary', { name: 'Barra lateral independiente' });
    const railStyle = getComputedStyle(rail);
    const scroll = getComputedStyle(rail.querySelector('.he-sidebar__scroll')!);
    await expect(railStyle.paddingLeft).toBe('0px');
    await expect(railStyle.borderRightWidth).toBe('1px');
    await expect(railStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(scroll.paddingTop).toBe('8px');
    await expect(scroll.paddingLeft).toBe('16px');
  },
};

/** Nav item states. Hover and focus come from the pointer and keyboard: tab into the list or hover a row. */
export const States: Story = {
  render: () => (
    <div style={column(208, 320)}>
      <Sidebar aria-label="Estados de la barra lateral">
        <SidebarSection label="Estados" collapsible={false}>
          <SidebarItem icon={<Icon name="database" />} label="Por defecto" />
          <SidebarItem icon={<Icon name="shield-check" />} label="Activo" active />
          <SidebarItem icon={<Icon name="phone" />} label="Con contador" end="24" />
          <SidebarItem icon={<Icon name="zap" />} label="Deshabilitado" disabled />
          <SidebarItem icon={<Icon name="file-text" />} label="Nivel anidado" depth={1} />
        </SidebarSection>
      </Sidebar>
    </div>
  ),
};

/** Rail of 56px: only icons, the Brandmark in place of the Wordmark, names in tooltips. */
export const Collapsed: Story = {
  render: () => (
    <div style={column(56)}>
      <DemoSidebar active="registros" collapsed />
    </div>
  ),
};

/** Sections collapse from their label. Figma uses static labels, so `collapsible` is opt-in per section. */
export const Collapsible: Story = {
  render: () => (
    <div style={column(208, 360)}>
      <Sidebar aria-label="Secciones plegables">
        <SidebarHeader />
        <SidebarSection label="Agentes">
          <SidebarItem icon={<Icon name="file-text" />} label="Agente de Cotización" />
          <SidebarItem icon={<Icon name="phone" />} label="Agente de Cobranza" />
        </SidebarSection>
      </Sidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const head = canvas.getByRole('button', { name: 'Agentes' });
    await expect(head).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(head);
    await expect(head).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Agente de Cobranza')).toBeNull();
    await userEvent.click(head);
    await expect(canvas.getByText('Agente de Cobranza')).toBeVisible();
  },
};

/** The Profile row with the stacked glyph used when it opens a list of accounts. */
export const AccountRow: Story = {
  render: () => (
    <div style={column(208, 220)}>
      <Sidebar
        aria-label="Cuenta"
        footer={
          <SidebarFooterItem
            media={<Avatar initials="CR" size="md" role="img" />}
            label="Camila Reyes"
            sublabel="Correduría Sierra Madre"
            chevron="updown"
          />
        }
      >
        <SidebarHeader />
      </Sidebar>
    </div>
  ),
};
