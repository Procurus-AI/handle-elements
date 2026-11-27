import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ThemeSwitch, type ThemeSwitchValue } from './ThemeSwitch';

/**
 * Claro / Sistema / Oscuro, as in the App shell sidebar footer. Controlled: the host keeps the
 * value and saves it. `applyToDocument` also sets `data-theme` on `<html>` and follows the OS
 * while the value is `system`; the switch itself never persists anything.
 */
const meta = {
  title: 'Molecules/Theme switch',
  component: ThemeSwitch,
  args: { value: 'system' },
} satisfies Meta<typeof ThemeSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial = 'system' as ThemeSwitchValue, onChange }: { initial?: ThemeSwitchValue; onChange?: (v: ThemeSwitchValue) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <ThemeSwitch
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <ThemeSwitch value="light" />
      <ThemeSwitch value="system" />
      <ThemeSwitch value="dark" />
    </div>
  ),
};

export const Interactive: Story = {
  args: { onChange: fn() },
  render: (args) => <Controlled onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Sistema' })).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Oscuro' }));
    await expect(args.onChange).toHaveBeenLastCalledWith('dark');
    await expect(canvas.getByRole('radio', { name: 'Oscuro' })).toBeChecked();
    canvas.getByRole('radio', { name: 'Oscuro' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(args.onChange).toHaveBeenLastCalledWith('system');
    await expect(canvas.getByRole('radio', { name: 'Sistema' })).toHaveFocus();
  },
};
