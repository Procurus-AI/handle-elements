import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Avatar, AvatarStack } from './Avatar';

const meta = {
  title: 'Elements/Avatar',
  component: Avatar,
  args: { name: 'Ariana Rivera' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Inline so the story never depends on the network. A square image is the point:
 * the disc clips it to a circle, and the overlays must survive that clip. */
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
      '<rect width="96" height="96" fill="#123"/>' +
      '<circle cx="48" cy="38" r="18" fill="#8fa"/>' +
      '<rect x="18" y="62" width="60" height="40" rx="20" fill="#8fa"/>' +
    '</svg>',
  );

const members = [
  { id: 1, name: 'Ariana Rivera' },
  { id: 2, name: 'Mateo Chen' },
  { id: 3, name: 'Sarah Okonkwo' },
  { id: 4, name: 'Julia Alvarez' },
  { id: 5, name: 'Nadia Flores' },
  { id: 6, name: 'Diego Ramos' },
];

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Avatar name="Ariana Rivera" size="xs" />
      <Avatar name="Mateo Chen" size="sm" />
      <Avatar name="Sarah Okonkwo" size="md" status="online" />
      <Avatar name="Julia Alvarez" size="lg" status="busy" />
    </div>
  ),
};

export const Stack: Story = {
  render: () => <AvatarStack items={members} max={4} size="md" />,
};

export const Badged: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two overlays on one disc. `status` is the 28% dot on the trailing edge; `badge` is a free slot ' +
          'centred ON the bottom rim. Both live OUTSIDE the disc, which is `overflow: hidden` — as a child of ' +
          'the clipping circle the status dot was sheared to a ~2px sliver, so the first row here is the ' +
          'regression guard: at sm/md/lg it must be a round dot, not a crescent. What the badge MEANS is the ' +
          "app's business — the library ships the slot. A marker that always says \"billing tier\" is product " +
          'vocabulary and belongs in the caller, which is why there is no `plan` prop. The `sm` example is ' +
          'deliberate: a 16px `Badge size="sm"` against a 28px disc is most of the rim, and you should look ' +
          'at it before putting one on a 28px avatar; `xs` (22px) is shown for the same reason. Nothing ' +
          'clips at any size, because the wrapper — not the `overflow: hidden` disc — is the positioning ' +
          'context.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Avatar name="Ariana Rivera" size="xs" status="online" />
        <Avatar name="Ariana Rivera" size="sm" status="online" />
        <Avatar name="Mateo Chen" size="md" status="online" />
        <Avatar name="Sarah Okonkwo" size="lg" status="online" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* xs is 22px: the 16px badge is taller than the rim it sits on. It does not
          * CLIP — the wrapper is not the clipping disc — but it is the size at which
          * you should stop reaching for one. */}
        <Avatar name="Ariana Rivera" size="xs" badge={<Badge size="sm">Pro</Badge>} />
        <Avatar name="Ariana Rivera" size="sm" badge={<Badge size="sm">Pro</Badge>} />
        <Avatar name="Mateo Chen" size="md" badge={<Badge size="sm">Pro</Badge>} />
        <Avatar name="Sarah Okonkwo" size="lg" badge={<Badge size="sm">Pro</Badge>} />
        <Avatar name="Julia Alvarez" size="lg" badge={<Badge size="sm" tone="ok">H</Badge>} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Avatar name="Nadia Flores" size="lg" status="busy" badge={<Badge size="sm">Pro</Badge>} />
        {/* A SQUARE photo: the disc clips it round, the badge is not clipped with it. */}
        <Avatar name="Diego Ramos" size="lg" src={PHOTO} badge={<Badge size="sm">Pro</Badge>} />
      </div>
    </div>
  ),
};
