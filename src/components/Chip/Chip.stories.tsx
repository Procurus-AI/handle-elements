import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Stack } from '../Layout/Layout';
import { Chip } from './Chip';

const meta = {
  title: 'Elements/Chip',
  component: Chip,
  args: { children: 'Quoting' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'mono', 'dot'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip>Renewals</Chip>
      <Chip variant="mono">POL-2941</Chip>
      <Chip variant="dot">Commercial lines</Chip>
      <Chip variant="dot" dotColor="var(--he-error)">
        At risk
      </Chip>
      <Chip size="sm">Small</Chip>
    </div>
  ),
};

/**
 * The remove affordance is a child <button> inside the span, so the chip's label
 * stays unclickable and the root stays non-interactive. Measured: adding the ×
 * does not change the chip's height (24.4px before and after; the pill only grows
 * wider), and `size="sm"` shrinks the button 14 → 12px with it.
 */
export const Removable: Story = {
  render: () => (
    <Stack direction="row" gap={2} wrap align="center">
      <Chip onRemove={() => {}} removeLabel="Remove filter: Ramo · Vida">
        Ramo · Vida
      </Chip>
      <Chip variant="dot" onRemove={() => {}} removeLabel="Remove filter: Estatus Activa">
        Estatus · Activa
      </Chip>
      <Chip size="sm" onRemove={() => {}} removeLabel="Remove filter: Moneda MXN">
        Moneda · MXN
      </Chip>
    </Stack>
  ),
};

/**
 * The applied-filter row the Policies view composes from primitives — no
 * `FilterChips` component required. The trigger is a real <Button> carrying a
 * <Badge> count (keyboard- and AT-correct), and "Clear all" only appears while
 * something is applied.
 */
export const AppliedFilters: Story = {
  render: function AppliedFiltersStory() {
    const [applied, setApplied] = useState<string[]>([
      'Ramo · Vida',
      'Estatus · Activa',
      'Vence · próximos 90 días',
    ]);
    return (
      <Stack direction="row" gap={2} wrap align="center">
        <Button variant="outline" size="sm">
          Filters
          {applied.length > 0 && (
            <Badge tone="accent" size="sm">
              {applied.length}
            </Badge>
          )}
        </Button>
        {applied.map((label) => (
          <Chip
            key={label}
            tone="active"
            onRemove={() => setApplied((prev) => prev.filter((x) => x !== label))}
            removeLabel={`Remove filter: ${label}`}
          >
            {label}
          </Chip>
        ))}
        {applied.length > 0 && (
          <Button variant="link" size="sm" onClick={() => setApplied([])}>
            Clear all
          </Button>
        )}
      </Stack>
    );
  },
};

/** Three meanings, three treatments: legend swatch, neutral tag, applied filter. */
export const Tones: Story = {
  render: () => (
    <Stack direction="row" gap={2} wrap align="center">
      <Chip variant="dot" dotPattern="hatch" plain>
        No metric
      </Chip>
      <Chip>Ramo · Vida</Chip>
      <Chip tone="active" onRemove={() => {}} removeLabel="Remove filter: Ramo · Vida">
        Ramo · Vida
      </Chip>
    </Stack>
  ),
};
