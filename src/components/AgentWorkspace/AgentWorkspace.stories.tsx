import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentWorkspace } from './AgentWorkspace';
import { Button } from '../Button/Button';
import { Composer } from '../Composer/Composer';
import { Container, Stack } from '../Layout/Layout';
import { PageHeader } from '../PageHeader/PageHeader';
import { Sidebar, SidebarHeader, SidebarItem } from '../Sidebar/Sidebar';
import { Text } from '../Text/Text';

const meta = {
  title: 'Components/AgentWorkspace',
  component: AgentWorkspace,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AgentWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    navigation: (
      <Sidebar as="nav" aria-label="Agents">
        <SidebarHeader>
          <Text weight="medium">handle</Text>
        </SidebarHeader>
        <SidebarItem label="Inbox" active />
        <SidebarItem label="Documents" />
      </Sidebar>
    ),
    header: (
      <Stack direction="row" align="center" justify="between">
        <Text size="sm" weight="medium">KYC agent</Text>
        <Button variant="ghost" size="sm">More</Button>
      </Stack>
    ),
    children: (
      <Container max={920} padding={7}>
        <PageHeader title="Two cases need you" lede="The agent is moving everything else forward." />
      </Container>
    ),
    composer: (
      <Composer
        maxWidth={760}
        align="center"
        placeholder="Ask the agent or tell it what to do…"
        onSubmit={() => undefined}
      />
    ),
  },
};
