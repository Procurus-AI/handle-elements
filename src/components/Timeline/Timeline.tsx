import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';
import {
  areaPath,
  clamp,
  clusterByProximity,
  extent,
  linePath,
  maxValue,
  packLanes,
  scaleLinear,
  timeTicks,
  type Point,
} from '../../lib/chart';
import { Tooltip } from '../Tooltip/Tooltip';

export type TimelineTone = 'default' | 'accent' | 'ok' | 'warn' | 'error' | 'neutral';
export type TimelineVariant = 'markers' | 'ridge' | 'auto';
/** How colliding events are resolved: stack them, or merge them into one mark. */
export type TimelineClusterMode = 'lane' | 'sum';

export interface TimelineEvent {
  id: string;
  /** Position on the axis. Date | epoch ms | ISO string. */
  date: Date | number | string;
  label: ReactNode;
  /** Magnitude for sizeBy='value' and cluster='sum'. */
  value?: number;
  tone?: TimelineTone;
  /** Extra line in the tooltip / screen-reader list. */
  meta?: ReactNode;
}

export interface TimelineBand {
  from: Date | number | string;
  to: Date | number | string;
  label?: ReactNode;
  tone?: TimelineTone;
}

export interface TimelineMark {
  /** Stable key — the member ids joined by '|'. */
  id: string;
  /** Representative epoch ms (arithmetic mean of member times). */
  time: number;
  /** 0..1 position within [start, end]. */
  t: number;
  events: TimelineEvent[];
  /** Sum of member `value`s; 0 when none carry one. */
  total: number;
  /** Strongest member tone, ranked error > warn > accent > ok > neutral > default. */
  tone: TimelineTone;
  /** Lane assigned by packLanes; 0 = closest to the axis. */
  lane: number;
  /** Rendered diameter in px. */
  size: number;
}

export interface TimelineProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  events: TimelineEvent[];
  /** Domain start. Defaults to the earliest event. */
  start?: Date | number | string;
  /** Domain end. Defaults to the latest event. */
  end?: Date | number | string;
  /** Dashed reference line (e.g. today). */
  now?: Date | number | string;
  /** Faint zone shading, e.g. 0–30 / 31–60 / 61–90 day buckets. */
  bands?: TimelineBand[];
  variant?: TimelineVariant;
  /** 'auto' flips to 'ridge' at or above this many events, or on lane overflow. */
  ridgeThreshold?: number;
  /** 'lane' stacks colliding marks; 'sum' merges them into one mark sized by the summed value. */
  cluster?: TimelineClusterMode;
  /** 'value' makes marker AREA read as magnitude and turns the size legend on. */
  sizeBy?: 'none' | 'value';
  /**
   * Marker field height in px (excludes the axis band). Omit it and the field
   * fits the lanes actually used, so a timeline whose marks never collide is
   * one lane tall instead of reserving `maxLanes` worth of empty tint.
   */
  height?: number;
  laneHeight?: number;
  maxLanes?: number;
  /** Smallest marker diameter in px. */
  markerMin?: number;
  /** Largest marker diameter in px; also the reserve at each end of the axis. */
  markerMax?: number;
  /**
   * Reference width, in px, used to convert px marker sizes into axis fractions
   * for collision packing. Set it to the container's real width: a value ABOVE
   * the real width over-clusters (safe), a value below it under-clusters and
   * lets neighbouring marks overlap. The 720 default is deliberately narrow.
   */
  refWidth?: number;
  /** Minimum px gap between two marks in a lane, at refWidth. */
  minGap?: number;
  tickCount?: number;
  formatTick?: (value: number, index: number) => ReactNode;
  formatValue?: (v: number) => ReactNode;
  /** Size legend. Defaults on whenever `sizeBy` is 'value'. */
  showLegend?: boolean;
  onSelect?: (mark: TimelineMark) => void;
  /** One shared cursor-anchored tooltip, like Treemap's tileTooltip. */
  eventTooltip?: (mark: TimelineMark) => ReactNode;
  'aria-label'?: string;
}

const TONE_RANK: Record<TimelineTone, number> = {
  error: 5,
  warn: 4,
  accent: 3,
  ok: 2,
  neutral: 1,
  default: 0,
};

const toMs = (d: Date | number | string): number =>
  d instanceof Date ? d.getTime() : typeof d === 'number' ? d : Date.parse(d);

const fmtDay = (value: number): string =>
  new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);

/* Fallback field height for the density ridge, which is a continuous band
 * rather than a set of lanes and so has no lane count to fit. */
const RIDGE_HEIGHT = 96;

const defaultFormat = (v: number): ReactNode =>
  Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);

/**
 * Events placed on a real, proportional time axis: x is elapsed time, marker
 * area is magnitude, and collisions are resolved by a pure first-fit lane
 * packer. Beyond `ridgeThreshold` events the marks degrade to a density ridge
 * rather than piling up into an unreadable blob.
 */
export function Timeline({
  events,
  start,
  end,
  now,
  bands,
  variant = 'auto',
  ridgeThreshold = 40,
  cluster = 'lane',
  sizeBy = 'none',
  height,
  laneHeight = 18,
  maxLanes = 4,
  markerMin = 10,
  markerMax = 22,
  refWidth = 720,
  minGap = 4,
  tickCount = 6,
  formatTick,
  formatValue = defaultFormat,
  showLegend,
  onSelect,
  eventTooltip,
  className,
  style,
  role,
  'aria-label': ariaLabel,
  ...rest
}: TimelineProps): ReactElement {
  const listId = useId();
  const [hovered, setHovered] = useState<TimelineMark | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const markRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ---- domain -------------------------------------------------------------
  const times = events.map((e) => toMs(e.date));
  const [lo, hi] = extent(times);
  const startMs = start != null ? toMs(start) : lo;
  const endMs = end != null ? toMs(end) : hi;
  const toT = scaleLinear(startMs, endMs, 0, 1);
  const indexed = events
    .map((event, i) => ({ event, time: times[i], t: clamp(toT(times[i]), 0, 1) }))
    .sort((a, b) => a.time - b.time);

  // ---- marks --------------------------------------------------------------
  const threshold = (markerMax + minGap) / refWidth;
  const groups =
    cluster === 'sum'
      ? clusterByProximity(indexed, (e) => e.t, threshold)
      : indexed.map((e) => [e]);

  const grouped = groups.map((members) => {
    const total = members.reduce((acc, m) => acc + (m.event.value ?? 0), 0);
    const tone = members.reduce<TimelineTone>((best, m) => {
      const t = m.event.tone ?? 'default';
      return TONE_RANK[t] > TONE_RANK[best] ? t : best;
    }, 'default');
    return {
      id: members.map((m) => m.event.id).join('|'),
      time: members.reduce((acc, m) => acc + m.time, 0) / members.length,
      t: members.reduce((acc, m) => acc + m.t, 0) / members.length,
      events: members.map((m) => m.event),
      total,
      tone,
    };
  });

  // Square-root so AREA, not radius, is proportional to value.
  const vMax = maxValue(grouped.map((m) => m.total));
  const sizeFor = (total: number): number =>
    sizeBy === 'value' && vMax > 0
      ? markerMin + (markerMax - markerMin) * Math.sqrt(clamp(total, 0, vMax) / vMax)
      : markerMin;

  const sized = grouped.map((m) => ({ ...m, size: sizeFor(m.total) }));
  const packed = packLanes(
    sized.map((m) => ({ t: m.t, halfWidth: m.size / 2 / refWidth })),
    { minGap: minGap / refWidth, maxLanes },
  );
  const marks: TimelineMark[] = sized.map((m, i) => ({ ...m, lane: packed.lanes[i] }));

  const resolved: Exclude<TimelineVariant, 'auto'> =
    variant === 'auto'
      ? events.length >= ridgeThreshold || packed.overflow
        ? 'ridge'
        : 'markers'
      : variant;

  // Field height. A mark sits centered on its lane line at
  // `laneHeight * lane + laneHeight / 2` from the bottom, so the topmost lane
  // needs half the largest marker above its line. Reserving `maxLanes` when the
  // packer only used one leaves a slab of empty band tint above the marks —
  // the thing that makes a sparse timeline read as a colored wash.
  const lanesUsed = marks.length > 0 ? Math.max(...marks.map((m) => m.lane)) + 1 : 1;
  const maxMarkSize = marks.length > 0 ? Math.max(...marks.map((m) => m.size)) : markerMin;
  // A lane must be at least as tall as the largest marker it carries, or the
  // lane-0 mark — centered at laneHeight/2 — hangs below the field and over the
  // axis. `laneHeight` is therefore a minimum, not a fixed value.
  const laneH = Math.max(laneHeight, Math.ceil(maxMarkSize));
  const fieldHeight = height ?? (resolved === 'ridge' ? RIDGE_HEIGHT : lanesUsed * laneH);

  // ---- axis ---------------------------------------------------------------
  const ticks = timeTicks(startMs, endMs, tickCount);
  const toPct = scaleLinear(startMs, endMs, 0, 100);

  // A clamped `now` would assert that today is the first (or last) day of a
  // window that may start weeks from today. Outside the domain it is not drawn.
  const nowMs = now != null ? toMs(now) : null;
  const showNow =
    nowMs != null &&
    Number.isFinite(nowMs) &&
    nowMs >= Math.min(startMs, endMs) &&
    nowMs <= Math.max(startMs, endMs);

  // ---- accessible summary -------------------------------------------------
  const peak = marks.reduce<TimelineMark | null>(
    (best, m) => (best == null || m.events.length > best.events.length ? m : best),
    null,
  );
  const label =
    ariaLabel ??
    `Timeline, ${events.length} ${events.length === 1 ? 'event' : 'events'} between ${fmtDay(
      startMs,
    )} and ${fmtDay(endMs)}${
      peak && peak.events.length > 1
        ? `; heaviest ${fmtDay(peak.time)}, ${peak.events.length} events`
        : ''
    }`;

  // Band labels render in a strip above the field, which has to be reserved.
  const hasBandLabels = (bands ?? []).some((b) => b.label != null);

  const legendOn = (showLegend ?? sizeBy === 'value') && vMax > 0 && marks.length > 0;
  const clickable = Boolean(onSelect);

  const onMarkKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = marks.length - 1;
    const next =
      e.key === 'ArrowRight' ? Math.min(last, i + 1)
      : e.key === 'ArrowLeft' ? Math.max(0, i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setFocusIndex(next);
    markRefs.current[next]?.focus();
  };

  const plot = (
    <div className="he-timeline__plot">
      <div
        className="he-timeline__field"
        onPointerLeave={eventTooltip ? () => setHovered(null) : undefined}
      >
        {bands != null && bands.length > 0 && (
          <div className="he-timeline__bands" aria-hidden="true">
            {bands.map((band, i) => {
              const from = clamp(toPct(toMs(band.from)), 0, 100);
              const to = clamp(toPct(toMs(band.to)), 0, 100);
              return (
                <div
                  key={i}
                  className={cx('he-timeline__band', `he-timeline__band--${band.tone ?? 'default'}`)}
                  style={{ left: `${from}%`, width: `${Math.max(0, to - from)}%` }}
                >
                  {band.label != null && (
                    <span className="he-timeline__band-label">{band.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showNow && (
          <div
            className="he-timeline__now"
            style={{ left: `${toPct(nowMs)}%` }}
            aria-hidden="true"
          />
        )}

        {resolved === 'ridge' ? (
          <Ridge events={indexed} refWidth={refWidth} />
        ) : (
          marks.map((mark, i) => {
            const markStyle: CSSProperties = {
              left: `${mark.t * 100}%`,
              bottom: `calc(var(--he-timeline-lane-h) * ${mark.lane} + var(--he-timeline-lane-h) / 2)`,
              width: `${mark.size}px`,
              height: `${mark.size}px`,
            };
            const count =
              cluster === 'sum' && mark.events.length > 1 && mark.size >= 18 ? (
                <span className="he-timeline__mark-count">{mark.events.length}</span>
              ) : null;
            const markClass = cx(
              'he-timeline__mark',
              `he-timeline__mark--${mark.tone}`,
              clickable && 'he-timeline__mark--clickable',
            );
            if (!clickable) {
              return (
                <div
                  key={mark.id}
                  className={markClass}
                  style={markStyle}
                  onPointerEnter={eventTooltip ? () => setHovered(mark) : undefined}
                  onPointerLeave={eventTooltip ? () => setHovered(null) : undefined}
                >
                  {count}
                </div>
              );
            }
            const n = mark.events.length;
            return (
              <button
                key={mark.id}
                type="button"
                ref={(node) => {
                  markRefs.current[i] = node;
                }}
                className={markClass}
                style={markStyle}
                tabIndex={i === Math.min(focusIndex, marks.length - 1) ? 0 : -1}
                aria-label={`${fmtDay(mark.time)}, ${n} ${n === 1 ? 'event' : 'events'}${
                  mark.total ? `, ${textOf(formatValue(mark.total)) ?? ''}` : ''
                }`}
                onClick={() => {
                  setFocusIndex(i);
                  onSelect?.(mark);
                }}
                onFocus={() => setFocusIndex(i)}
                onKeyDown={(e) => onMarkKeyDown(e, i)}
                onPointerEnter={eventTooltip ? () => setHovered(mark) : undefined}
                onPointerLeave={eventTooltip ? () => setHovered(null) : undefined}
              >
                {count}
              </button>
            );
          })
        )}

        {resolved === 'ridge' && <div className="he-timeline__ridge-base" aria-hidden="true" />}
      </div>

      <div className="he-timeline__axis" aria-hidden="true">
        <div className="he-timeline__rule" />
        {ticks.map((tick, i) => (
          <span
            key={tick.value}
            className={cx('he-timeline__tick', tick.major && 'he-timeline__tick--major')}
            style={{ left: `${clamp(toPct(tick.value), 0, 100)}%` }}
          >
            <span className="he-timeline__tick-stem" />
            <span className="he-timeline__tick-label">{formatTick?.(tick.value, i) ?? tick.label}</span>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={cx('he-timeline', hasBandLabels && 'he-timeline--bandlabels', className)}
      role={role ?? (clickable ? 'group' : 'img')}
      aria-label={label}
      aria-describedby={listId}
      style={
        {
          '--he-timeline-h': `${fieldHeight}px`,
          '--he-timeline-lane-h': `${laneH}px`,
          '--he-timeline-marker-max': `${markerMax}px`,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <ul id={listId} className="he-timeline__sr">
        {indexed.map(({ event, time }) => (
          <li key={event.id}>
            {fmtDay(time)}
            {' · '}
            {event.label}
            {event.value != null && (
              <>
                {' · '}
                {formatValue(event.value)}
              </>
            )}
            {event.meta != null && (
              <>
                {' · '}
                {event.meta}
              </>
            )}
          </li>
        ))}
      </ul>

      {eventTooltip ? (
        <Tooltip
          className="he-timeline__tip-anchor"
          followCursor
          delay={0}
          contentClassName="he-timeline__tip"
          content={hovered ? eventTooltip(hovered) : null}
        >
          {plot}
        </Tooltip>
      ) : (
        plot
      )}

      {legendOn && (
        <div className="he-timeline__legend">
          {legendStops(marks).map((v) => (
            <span className="he-timeline__legend-item" key={v}>
              <span
                className="he-timeline__legend-disc"
                style={{ width: `${sizeFor(v)}px`, height: `${sizeFor(v)}px` }}
                aria-hidden="true"
              />
              <span className="he-timeline__legend-label">{formatValue(v)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Median and max mark total — the two reference areas the legend prints. */
function legendStops(marks: readonly TimelineMark[]): number[] {
  const totals = marks.map((m) => m.total).sort((a, b) => a - b);
  const median = totals[Math.floor((totals.length - 1) / 2)] ?? 0;
  const max = totals[totals.length - 1] ?? 0;
  return median > 0 && median !== max ? [median, max] : [max];
}

interface RidgeProps {
  events: readonly { event: TimelineEvent; t: number }[];
  refWidth: number;
}

/** Density degradation: fixed-width bins so the shape never depends on layout. */
function Ridge({ events, refWidth }: RidgeProps): ReactElement {
  const bins = clamp(Math.round(refWidth / 12), 12, 60);
  const weights = new Array<number>(bins).fill(0);
  for (const { event, t } of events) {
    weights[clamp(Math.floor(t * bins), 0, bins - 1)] += event.value ?? 1;
  }
  const peak = maxValue(weights) || 1;
  const points: Point[] = weights.map((w, i) => ({
    x: ((i + 0.5) / bins) * 100,
    y: 100 - (w / peak) * 100,
  }));
  return (
    <svg
      className="he-timeline__ridge"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="he-timeline__ridge-fill" d={areaPath(points, 100, true)} />
      <path className="he-timeline__ridge-line" d={linePath(points, true)} />
    </svg>
  );
}

/** Best-effort plain text from a ReactNode for aria-label attributes. */
function textOf(node: ReactNode): string | undefined {
  if (node == null || node === false || node === true) return undefined;
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).filter(Boolean).join('');
  return undefined;
}
