import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Composer } from '../Composer/Composer';
import { Container } from '../Layout/Layout';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Elements/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: 'Operations',
    title: 'Renewals',
    lede: 'Every policy approaching its renewal window, ranked by premium at stake and how much of the workflow Handle can run without you.',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: {
    aside: (
      <>
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button size="sm">New renewal</Button>
      </>
    ),
  },
};

/** The centered greeting — display title plus a dim date line, no consumer CSS. */
export const Hero: Story = {
  render: () => (
    <Container max={1240}>
      <PageHeader
        size="hero"
        title="Good morning, Alfonso"
        subtitle="Thursday, September 3, 2026"
        measure={720}
      />
    </Container>
  ),
};

/** `aside` hosts the composer and centers under the title when the header is centered. */
export const HeroWithComposer: Story = {
  render: () => (
    <Container max={1240}>
      <PageHeader
        size="hero"
        title="Good morning, Alfonso"
        subtitle="Thursday, September 3, 2026"
        measure={720}
        aside={
          <Composer
            size="lg"
            align="center"
            maxWidth={648}
            placeholder="Ask your records…"
            submitVariant="ghost"
            onMic={() => {}}
            onSubmit={() => {}}
            suggestions={[
              { id: 'exp30', label: 'Which policies expire in the next 30 days?', count: 270 },
              { id: 'carrier', label: 'Premium by carrier' },
              { id: 'active', label: 'Active policies and total premium' },
            ]}
            onSuggestionSelect={() => {}}
          />
        }
      />
    </Container>
  ),
};

/** The page-scale title survives without the rule under it. */
export const PageNoDivider: Story = {
  render: () => (
    <Container max={1240}>
      <PageHeader
        title="Records"
        divider={false}
        lede="Every policy, receipt and endorsement Handle has synced from your carriers."
      />
    </Container>
  ),
};
