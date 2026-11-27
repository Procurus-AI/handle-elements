import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { figmaIconNames, icons, type IconName } from './icons';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  args: { name: 'search', size: 16 },
  argTypes: {
    name: { control: 'select', options: Object.keys(icons) },
    size: { control: 'select', options: [12, 14, 16, 20, 24] },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
  gap: 'var(--he-spacing-4)',
} as const;

const cell = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--he-spacing-2)',
  fontSize: 12,
  color: 'var(--he-text-secondary)',
} as const;

function IconGrid({ names }: { names: readonly IconName[] }) {
  return (
    <div style={grid}>
      {names.map((n) => (
        <div key={n} style={cell}>
          <Icon name={n} />
          <span>{n}</span>
        </div>
      ))}
    </div>
  );
}

export const Playground: Story = {};

export const Figma: Story = {
  render: () => <IconGrid names={figmaIconNames} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--he-spacing-4)' }}>
      {([12, 14, 16, 20, 24] as const).map((s) => (
        <div key={s} style={{ ...cell, flexDirection: 'column' }}>
          <Icon name="settings" size={s} />
          <span>{s}px</span>
        </div>
      ))}
    </div>
  ),
};

export const All: Story = {
  render: () => <IconGrid names={Object.keys(icons) as IconName[]} />,
};

export const OnAccent: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--he-spacing-2)',
        padding: 'var(--he-spacing-4)',
        background: 'var(--he-bg-inverse)',
        color: 'var(--he-text-inverse)',
        borderRadius: 'var(--he-corner-md)',
        width: 'fit-content',
      }}
    >
      <Icon name="circle-check" style={{ color: 'currentColor' }} />
      <span>Pago conciliado</span>
    </div>
  ),
};
