import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../Layout/Layout';
import { Text } from './Text';

const meta = {
  title: 'Elements/Text',
  component: Text,
  args: {
    children: 'El desempeño del agente de cobranza en toda la flota, en un solo lugar.',
  },
  argTypes: {
    as: { control: 'select', options: ['p', 'span', 'div', 'small', 'label'] },
    size: { control: 'inline-radio', options: ['caption', 'sm', 'body', 'heading'] },
    tone: { control: 'inline-radio', options: ['default', 'dim', 'faint'] },
    weight: { control: 'inline-radio', options: ['regular', 'medium'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Scale: Story = {
  render: () => (
    <Stack gap={2}>
      <Text size="heading">Heading — panel title scale</Text>
      <Text size="body">Body — default paragraph copy.</Text>
      <Text size="sm" tone="dim">
        Small dim — captions and helper notes.
      </Text>
      <Text size="caption" tone="faint" mono>
        CAPTION MONO — labels and metadata
      </Text>
    </Stack>
  ),
};
