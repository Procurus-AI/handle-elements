import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from '../Panel/Panel';
import { Stack } from '../Layout/Layout';
import { Text } from '../Text/Text';
import { formatCurrency } from '../../format';
import { Timeline, type TimelineEvent } from './Timeline';

const DAY = 86400000;
const now = new Date();
/** Midnight UTC today — the domain anchor every story shares. */
const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const at = (days: number): number => today + days * DAY;

const mxn = (v: number): string =>
  formatCurrency(v, { currency: 'MXN', compact: true, currencyDisplay: 'narrowSymbol' });

/** Premium renewing over the next 90 days: [day offset, premium, account]. */
const renewalSeed: [number, number, string][] = [
  [2, 1_240_000, 'Grupo Aceros Norte'],
  [2, 380_000, 'Transportes Vega'],
  [3, 96_000, 'Clínica Zamora'],
  [5, 640_000, 'Molinos del Bajío'],
  [6, 210_000, 'Ferretera Anáhuac'],
  [8, 1_850_000, 'Constructora Tepeyac'],
  [8, 145_000, 'Panadería La Espiga'],
  [9, 72_000, 'Óptica Reforma'],
  [12, 520_000, 'Autopartes Lerma'],
  [14, 2_100_000, 'Minera San Rafael'],
  [15, 310_000, 'Textiles Puebla'],
  [17, 88_000, 'Café Xalapa'],
  [19, 460_000, 'Logística Bajío'],
  [21, 1_020_000, 'Hotelera Cancún'],
  [22, 130_000, 'Papelería Juárez'],
  [24, 275_000, 'Agroindustrias Sinaloa'],
  [27, 690_000, 'Química Monterrey'],
  [28, 155_000, 'Distribuidora Colima'],
  [30, 940_000, 'Grupo Educativo Valle'],
  [34, 380_000, 'Refaccionaria Toluca'],
  [36, 1_450_000, 'Naviera Veracruz'],
  [38, 120_000, 'Estudio Dental Roma'],
  [41, 560_000, 'Empaques del Golfo'],
  [44, 230_000, 'Vinos Querétaro'],
  [47, 810_000, 'Aceros Bajío'],
  [49, 190_000, 'Farmacias del Sol'],
  [52, 1_300_000, 'Cementos Altiplano'],
  [55, 260_000, 'Muebles Ocotlán'],
  [58, 430_000, 'Frigoríficos Mérida'],
  [63, 2_400_000, 'Corporativo Santa Fe'],
  [68, 175_000, 'Taller Industrial Nava'],
  [72, 620_000, 'Plásticos Irapuato'],
  [79, 340_000, 'Seguros Agrícolas Tula'],
  [86, 980_000, 'Terminal Portuaria Lázaro'],
];

const renewals: TimelineEvent[] = renewalSeed.map(([day, premium, account], i) => ({
  id: `r${i}`,
  date: at(day),
  label: account,
  value: premium,
  meta: `Renews in ${day} days`,
}));

const buckets = [
  { from: at(0), to: at(30), label: '≤30d', tone: 'warn' as const },
  { from: at(30), to: at(60), label: '31–60d', tone: 'neutral' as const },
  { from: at(60), to: at(90), label: '61–90d', tone: 'default' as const },
];

const meta = {
  title: 'Charts/Timeline',
  component: Timeline,
  args: {
    events: renewals,
    start: at(0),
    end: at(90),
    now: at(0),
    bands: buckets,
    sizeBy: 'value',
    cluster: 'sum',
    height: 110,
    formatValue: mxn,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['auto', 'markers', 'ridge'] },
    cluster: { control: 'inline-radio', options: ['lane', 'sum'] },
    sizeBy: { control: 'inline-radio', options: ['none', 'value'] },
    height: { control: { type: 'range', min: 60, max: 200, step: 2 } },
    laneHeight: { control: { type: 'range', min: 12, max: 32, step: 1 } },
    showLegend: { control: 'boolean' },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The renewals strip, rebuilt. x is proportional to elapsed time (the old strip
 * spaced 7/7/16/30-day gaps at an identical pitch), same-day policies merge into
 * one mark whose AREA is premium, and the size legend states what area means.
 */
export const Renewals: Story = {
  render: (args) => (
    <Panel
      title="Renewals"
      eyebrow="Next 90 days"
      lede="Marker area is premium; the dashed line is today."
    >
      <Timeline
        {...args}
        onSelect={(mark) => console.log(mark.events.map((e) => e.label))}
        eventTooltip={(mark) => `${mark.events.length} policies · ${mxn(mark.total)}`}
      />
    </Panel>
  ),
};

const cramped: TimelineEvent[] = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i}`,
  // Twelve policies inside a 3-day window — every one of them collides.
  date: at(1 + (i % 4) * 0.7 + Math.floor(i / 4) * 0.15),
  label: `Policy ${i + 1}`,
  value: 100_000 + i * 40_000,
}));

/** Greedy first-fit packing: deterministic lanes, every marker centered on its line. */
export const Collisions: Story = {
  render: () => (
    <Panel title="Collisions" eyebrow="cluster=lane" lede="Twelve renewals inside three days.">
      <Timeline
        events={cramped}
        start={at(0)}
        end={at(6)}
        cluster="lane"
        sizeBy="value"
        height={110}
        formatValue={mxn}
      />
    </Panel>
  ),
};

// Deterministic pseudo-random spread — stories must render identically on the
// server, on hydration and in a snapshot, so never Math.random here.
const lcg = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const rand = lcg(7);
const dense: TimelineEvent[] = Array.from({ length: 400 }, (_, i) => {
  const skew = rand() ** 2;
  return { id: `d${i}`, date: at(Math.round(skew * 365)), label: `Policy ${i + 1}` };
});

/** Past `ridgeThreshold`, marks would be a blob — the variant degrades to density. */
export const Ridge: Story = {
  render: () => (
    <Panel title="Twelve months" eyebrow="variant=auto" lede="400 events — auto-flips to the ridge.">
      <Timeline events={dense} start={at(0)} end={at(365)} height={110} />
    </Panel>
  ),
};

const tones: TimelineEvent[] = (['default', 'accent', 'ok', 'warn', 'error', 'neutral'] as const).map(
  (tone, i) => ({ id: tone, date: at(i * 15), label: tone, tone }),
);

/** Accent is a fill, so it gets the authored --he-accent-line ring instead of a halo. */
export const Tones: Story = {
  render: () => (
    <Panel title="Tones" eyebrow="Status" lede="Tone is a class; the class sets --he-timeline-mark.">
      <Timeline events={tones} start={at(0)} end={at(90)} height={64} />
    </Panel>
  ),
};

/** A size encoding without a legend is unreadable — hence the default. */
export const SizeLegend: Story = {
  render: (args) => (
    <Stack gap={5}>
      <Panel title="With legend" eyebrow="showLegend" lede="Default whenever sizeBy='value'.">
        <Timeline {...args} showLegend />
      </Panel>
      <Panel title="Without legend" eyebrow="showLegend={false}" lede="Area now means nothing.">
        <Timeline {...args} showLegend={false} />
      </Panel>
    </Stack>
  ),
};

/** Marks become buttons in date order: Arrow keys walk them, Home/End jump to the ends. */
export const Interactive: Story = {
  render: (args) => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <Panel title="Select a renewal" eyebrow="onSelect" lede="Tab in, then ←/→, Home, End.">
        <Stack gap={4}>
          <Timeline {...args} onSelect={(mark) => setPicked(mark.events.map((e) => e.label).join(', '))} />
          <Text size="sm" tone="dim">
            {picked ?? 'Nothing selected yet.'}
          </Text>
        </Stack>
      </Panel>
    );
  },
};

/** Empty state: the axis still resolves, so the panel does not collapse. */
export const Empty: Story = {
  render: () => (
    <Panel title="No renewals" eyebrow="Next 90 days" lede="Domain comes from the props, not the data.">
      <Timeline events={[]} start={at(0)} end={at(90)} bands={buckets} height={110} />
    </Panel>
  ),
};

/** Same composition on Midnight — the halo follows --he-surface in both themes. */
export const Dark: Story = {
  globals: { theme: 'dark' },
  render: (args) => (
    <Panel title="Renewals" eyebrow="Next 90 days" lede="Dark theme via html[data-theme='dark'].">
      <Timeline {...args} eventTooltip={(mark) => `${mark.events.length} policies · ${mxn(mark.total)}`} />
    </Panel>
  ),
};
