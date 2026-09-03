import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { Container, Divider, Grid, Stack } from './Layout';

const meta = {
  title: 'Elements/Layout',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children }: { children?: React.ReactNode }) => (
  <Card padding="md">
    {children ?? 'Box'}
  </Card>
);

export const StackVertical: Story = {
  render: () => (
    <Stack gap={3}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
};

export const StackRow: Story = {
  render: () => (
    <Stack direction="row" gap={3} align="center" justify="between">
      <Box>Left</Box>
      <Box>Right</Box>
    </Stack>
  ),
};

export const GridColumns: Story = {
  render: () => (
    <Grid columns={3} gap={4}>
      <Box />
      <Box />
      <Box />
    </Grid>
  ),
};

export const SplitWithDivider: Story = {
  render: () => (
    <Grid columns="1fr 1px 1fr" gap={5}>
      <Box>A</Box>
      <Divider orientation="vertical" />
      <Box>B</Box>
    </Grid>
  ),
};

export const Centered: Story = {
  render: () => (
    <Container max={640}>
      <Box>Centered container</Box>
    </Container>
  ),
};
