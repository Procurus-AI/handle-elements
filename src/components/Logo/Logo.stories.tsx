import type { Meta, StoryObj } from '@storybook/react-vite';
import { Brandmark, Wordmark, type LogoTone } from './Logo';

const meta = {
  title: 'Atoms/Logo',
  component: Wordmark,
  argTypes: { tone: { control: 'select', options: ['default', 'inverse', 'accent'] } },
} satisfies Meta<typeof Wordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

const tones: LogoTone[] = ['default', 'inverse', 'accent'];

// Inverse and accent sit on a Midnight swatch, as on the Figma board.
const swatch = (tone: LogoTone) =>
  tone === 'default'
    ? { padding: 'var(--he-spacing-4)' }
    : {
        padding: 'var(--he-spacing-4)',
        background: 'var(--he-bg-inverse)',
        borderRadius: 'var(--he-corner-md)',
      };

export const Playground: Story = {
  args: { tone: 'default' },
};

export const Figma: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--he-spacing-8)', flexWrap: 'wrap' }}>
      {[
        { label: 'Wordmark', Logo: Wordmark },
        { label: 'Brandmark', Logo: Brandmark },
      ].map(({ label, Logo }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--he-spacing-4)' }}>
          <span style={{ fontSize: 12, color: 'var(--he-text-secondary)' }}>{label}</span>
          {tones.map((tone) => (
            <div key={tone} style={swatch(tone)}>
              <Logo tone={tone} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--he-spacing-6)' }}>
      {[14, 18, 24, 32, 48].map((h) => (
        <Wordmark key={h} height={h} />
      ))}
      {[16, 24, 32, 48].map((h) => (
        <Brandmark key={h} height={h} />
      ))}
    </div>
  ),
};
