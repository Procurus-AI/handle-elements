import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs, type TabItem } from './Tabs';

/**
 * Selects a view inside an area. Sits under the page title, never in a top bar.
 * The active tab is a soft fill, never a border. `variant="underline"` and `"pills"` are
 * still accepted so 0.x code compiles, and both render this same Figma style.
 * Keyboard: Left/Right move and select, Home/End jump to the ends; only the selected tab
 * is a tab stop.
 */
const meta = {
  title: 'Molecules/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pills'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const VIEWS: TabItem[] = [
  { value: 'todos', label: 'Todos', count: '1,234' },
  { value: 'pendientes', label: 'Pendientes', count: 24 },
  { value: 'pagados', label: 'Pagados' },
  { value: 'archivados', label: 'Archivados', disabled: true },
];

const RECORD_ITEMS: TabItem[] = [
  { value: 'inicio', label: 'Inicio' },
  { value: 'recibos', label: 'Recibos', count: '14,639' },
  { value: 'clientes', label: 'Clientes', count: '2,201', dividerLabel: 'Beta' },
  { value: 'polizas', label: 'Pólizas', count: '4,592' },
  { value: 'capturas', label: 'Capturas' },
];

function Controlled({ items = VIEWS, ...props }: Partial<React.ComponentProps<typeof Tabs>>) {
  const [value, setValue] = useState(items[0].value);
  return <Tabs {...props} items={items} value={value} onChange={setValue} />;
}

/** The Figma board: default and active, with and without a count. */
export const Figma: Story = {
  args: { items: VIEWS, value: 'todos' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, width: 'fit-content' }}>
      <Tabs
        aria-label="Con conteo"
        items={[{ value: 'a', label: 'Vista', count: '1,234' }, { value: 'b', label: 'Vista', count: '1,234' }]}
        value="b"
      />
      <Tabs
        aria-label="Sin conteo"
        items={[{ value: 'a', label: 'Vista' }, { value: 'b', label: 'Vista' }]}
        value="b"
      />
    </div>
  ),
};

export const States: Story = {
  args: { items: VIEWS, value: 'todos' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Controlled aria-label="Vistas" />
      <Controlled aria-label="Vistas, compacto" size="sm" />
      <Controlled aria-label="Vistas, variante pills" variant="pills" />
    </div>
  ),
};

/** In a narrow rail `wrap` flows the last tab onto a second line instead of scrolling. */
export const Wrap: Story = {
  args: { items: VIEWS, value: 'todos' },
  render: () => (
    <div style={{ width: 240 }}>
      <Controlled aria-label="Vistas en una columna angosta" wrap />
    </div>
  ),
};

/** `dividerLabel` splits the strip into groups and captions the break; the marker describes
 * every tab after it. `divider` alone gives the hairline with no caption. */
export const GroupDivider: Story = {
  args: { items: RECORD_ITEMS, value: 'inicio' },
  render: () => <Controlled aria-label="Objetos" items={RECORD_ITEMS} />,
};

export const KeyboardNavigation: Story = {
  args: { items: VIEWS, value: 'todos' },
  render: () => <Controlled aria-label="Vistas" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const todos = canvas.getByRole('tab', { name: /Todos/ });
    todos.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: /Pendientes/ })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tab', { name: /Pendientes/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: /Pagados/ })).toHaveAttribute('aria-selected', 'true');
    // Archivados is disabled: ArrowRight wraps to the first tab.
    await userEvent.keyboard('{ArrowRight}');
    await expect(todos).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: /Pagados/ })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(todos).toHaveFocus();
    await expect(canvas.getByRole('tab', { name: /Pendientes/ })).toHaveAttribute('tabindex', '-1');
  },
};
