import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem } from '../List/List';
import { Money } from '../Money/Money';
import { Panel } from '../Panel/Panel';
import { StatusPill } from '../StatusPill/StatusPill';
import { Section, SectionLink } from './Section';

/**
 * `Section` is a borderless titled block — a heading, an optional count and an
 * optional trailing action. It is deliberately NOT a surface: dropping one
 * inside a Panel or a Drawer adds no border, no background and no padding, so
 * grouping content never turns into cards inside cards.
 *
 * Omit `count` when the number is already restated by the section's own
 * children — a "Related entities 4" over a "Policies 1" and a "Receipts 3"
 * prints the same fact three times.
 */
const meta = {
  title: 'Elements/Section',
  component: Section,
  argTypes: {
    tier: { control: 'inline-radio', options: ['section', 'sub'] },
    count: { control: 'text' },
    flush: { control: 'boolean' },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

// Drawer width, so density is what is being reviewed.
const COL: React.CSSProperties = { width: 480 };

const policies = [
  { id: 'p1', name: 'Auto residente · HDI Seguros', meta: 'Policy 687457622', value: 'Vigente' },
];

const receipts = [
  { id: 'r1', name: 'Recibo 3 de 4', meta: 'Vence 12 mar', value: '$4,820.00' },
  { id: 'r2', name: 'Recibo 2 de 4', meta: 'Pagado 12 dic', value: '$4,820.00' },
  { id: 'r3', name: 'Recibo 1 de 4', meta: 'Pagado 12 sep', value: '$4,820.00' },
];

export const Playground: Story = {
  args: {
    title: 'Portfolio summary',
    count: 6,
    tier: 'section',
    children: 'Anything can live in the body — the Section itself paints nothing.',
  },
  render: (args) => (
    <div style={COL}>
      <Section {...args} />
    </div>
  ),
};

// The two tiers in one shot: 32px between top-level sections, 24px between the
// nested ones, 12px/8px head → body.
export const Tiers: Story = {
  args: { title: 'Related entities' },
  render: () => (
    <div style={COL}>
      <Section title="Related entities">
        <Section
          tier="sub"
          title="Policies"
          count={policies.length}
          action={<SectionLink href="#">View in Policies</SectionLink>}
        >
          <List variant="divided" size="sm">
            {policies.map((p) => (
              <ListItem key={p.id} primary={p.name} meta={p.meta} value={p.value} />
            ))}
          </List>
        </Section>
        <Section
          tier="sub"
          title="Receipts"
          count={receipts.length}
          action={<SectionLink href="#">View in Receipts</SectionLink>}
        >
          <List variant="divided" size="sm">
            {receipts.map((r) => (
              <ListItem key={r.id} primary={r.name} meta={r.meta} value={r.value} />
            ))}
          </List>
        </Section>
      </Section>
    </div>
  ),
};

// `flush` reads --he-bleed-pad, the one hook every bleedable surface republishes
// at its own boundary (Drawer's body, and Panel from its own padding) — so the
// same Section bleeds correctly inside a drawer, inside a `padding="sm"` Panel,
// or inside both, with no cross-component selectors. The Panel here is NOT
// flush: a surface bleeds once, and two bleeds pull the rows 23px past the
// card's border on each side. The second Panel is `padding="sm"`, which is the
// case that used to overhang.
export const WithFlushList: Story = {
  args: { title: 'Related entities' },
  render: () => (
    <div style={COL}>
      <Panel title="Related entities">
        <Section
          tier="sub"
          title="Receipts"
          count={receipts.length}
          action={<SectionLink href="#">View in Receipts</SectionLink>}
          flush
        >
          <List variant="divided" size="sm">
            {receipts.map((r) => (
              <ListItem
                key={r.id}
                href="#"
                primary={r.name}
                meta={r.meta}
                value={<Money value={4820} currency="MXN" />}
                trailing={<StatusPill status="warn" label="Pendiente" />}
              />
            ))}
          </List>
        </Section>
      </Panel>

      <Panel title="Receipts" padding="sm">
        <Section tier="sub" title="Receipts" count={receipts.length} flush>
          <List variant="divided" size="sm">
            {receipts.map((r) => (
              <ListItem key={r.id} href="#" primary={r.name} meta={r.meta} />
            ))}
          </List>
        </Section>
      </Panel>
    </div>
  ),
};

// A SectionLink that has run out of work goes faint and drops the pointer. The
// live one beside it is the control: a disabled action that hovers to full ink
// is a control that looks live and does nothing.
export const DisabledAction: Story = {
  args: { title: 'Documents' },
  render: () => (
    <div style={COL}>
      <Section
        title="Documents"
        action={<SectionLink glyph="none">Add document</SectionLink>}
        empty="No documents."
      />
      <Section
        title="Documents"
        count={2}
        action={
          <SectionLink glyph="none" disabled>
            Add document
          </SectionLink>
        }
        empty="Everything on file."
      />
    </div>
  ),
};

// `empty` is one dim line — not an EmptyState, which measures 51.5px against a
// ~20px line and would out-shout the section it sits under.
export const Empty: Story = {
  args: { title: 'Documents' },
  render: () => (
    <div style={COL}>
      <Section
        title="Documents"
        action={<SectionLink glyph="none">Add document</SectionLink>}
        empty="No documents."
      />
    </div>
  ),
};
