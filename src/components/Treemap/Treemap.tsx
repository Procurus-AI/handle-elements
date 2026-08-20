import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { heatColor, maxValue, seriesColor, squarify, sum, type TreemapRect } from '../../lib/chart';
import { Tooltip } from '../Tooltip/Tooltip';

/** Fixed tones map a tile to a semantic chart color instead of the series cycle. */
export type TreemapTone = 'series' | 'heat' | 'pos' | 'neg' | 'ink' | 'accent';

export interface TreemapDatum {
  label: ReactNode;
  value: number;
  /** Force a semantic color for this tile, overriding `colorMode`. */
  tone?: TreemapTone;
  /** Pick a specific series slot (0-based) instead of the auto cycle. */
  colorIndex?: number;
  /** 0..1 heat intensity; used in `colorMode='heat'` (falls back to value). */
  intensity?: number;
  /** Secondary line shown under the value when the tile is large enough. */
  hint?: ReactNode;
  /** Stable key; falls back to index. */
  id?: string;
  /** Fade this tile without moving it (spotlight / off-filter). */
  dimmed?: boolean;
  /** Explicit CSS fill for this tile — wins over `tone`/`colorMode`. */
  fill?: string;
}

/** Position + size of a tile, handed to `renderTile` so callers can size-gate. */
export interface TreemapTileGeometry {
  /** Position/size as a percentage of the tile's positioning context (region or map). */
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  /** Index of the owning group in grouped mode, or -1 in flat mode. */
  groupIndex: number;
}

/** Render a fully custom tile body. Return `null` to fall back to the built-in body. */
export type RenderTile = (
  datum: TreemapDatum,
  index: number,
  geometry: TreemapTileGeometry,
) => ReactNode;

/** Recompute a datum's color lens at render time (e.g. status vs usage-health). */
export type ColorBy = (
  datum: TreemapDatum,
  index: number,
) => { tone?: TreemapTone; colorIndex?: number; intensity?: number; fill?: string } | void;

/** Return `true` to keep a tile lit; a falsy result dims it. Layout is unaffected. */
export type SpotlightPredicate = (datum: TreemapDatum, index: number) => boolean;

/** One faceted sub-treemap: its own squarify plus a header band. */
export interface TreemapGroup {
  /** Stable key; falls back to index. */
  id?: string;
  /** Header band title. */
  title: ReactNode;
  /** Header summary line, e.g. "Stuck in Deployment · $1.2M · 8 accounts". */
  summary?: ReactNode;
  data: TreemapDatum[];
  /** Override the region's flex weight; defaults to its data total (see `regionSizing`). */
  weight?: number;
}

interface TreemapBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** Container height in px; width is fluid (tiles positioned in %). */
  height?: number;
  /** How untoned tiles are colored. */
  colorMode?: 'series' | 'heat';
  /** Format the value line. Defaults to a compact number. */
  formatValue?: (value: number) => ReactNode;
  /** Gap between tiles in px. */
  gap?: number;
  /** Tiles become buttons; fires with the datum and its (per-group) array index. */
  onSelect?: (datum: TreemapDatum, index: number) => void;
  /** Grouped mode: how region widths are distributed. Default 'value'. */
  regionSizing?: 'value' | 'equal';
  /** Grouped mode: min px width a region collapses to. Default 120. */
  minRegionWidth?: number;
  /** Custom tile body. Built-in label/value/hint stays default when omitted or it returns null. */
  renderTile?: RenderTile;
  /** Recompute tone/fill per datum (color-lens switch). */
  colorBy?: ColorBy;
  /** Tiles failing the predicate are dimmed (kept in place). */
  spotlight?: SpotlightPredicate;
  /** Opt-in cursor-anchored tooltip content per tile; driven by one shared Tooltip. */
  tileTooltip?: (datum: TreemapDatum, index: number) => ReactNode;
}

/** Flat (`data`) OR faceted (`groups`) — exactly one. */
type TreemapDataProps =
  | { data: TreemapDatum[]; groups?: never }
  | { data?: never; groups: TreemapGroup[] };

export type TreemapProps = TreemapBaseProps & TreemapDataProps;

/** Below these tile dimensions (% of the map) the value / hint are hidden. */
const HIDE_VALUE_W = 12;
const HIDE_VALUE_H = 8;
const HIDE_LABEL_W = 7;
const HIDE_LABEL_H = 5;

const defaultFormat = (v: number): string =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);

/** Resolve the fill CSS value and a text-contrast modifier for one tile. */
function tileColor(
  datum: TreemapDatum,
  index: number,
  colorMode: 'series' | 'heat',
  heat: number,
): { fill: string; textClass: string } {
  const tone = datum.tone ?? (colorMode === 'heat' ? 'heat' : 'series');
  switch (tone) {
    case 'heat':
      // Light green ramp on both themes → dark text reads on it.
      return { fill: heatColor(heat), textClass: 'he-treemap__tile--heat-text' };
    case 'pos':
      return { fill: 'var(--he-chart-pos)', textClass: 'he-treemap__tile--light-text' };
    case 'neg':
      return { fill: 'var(--he-chart-neg)', textClass: 'he-treemap__tile--light-text' };
    case 'ink':
      // Ink follows --he-text, which inverts by theme; pair with inverse text.
      return { fill: 'var(--he-chart-ink)', textClass: 'he-treemap__tile--ink-text' };
    case 'accent':
      // Borealis green → midnight text (--he-on-accent).
      return { fill: 'var(--he-chart-accent)', textClass: 'he-treemap__tile--on-accent-text' };
    case 'series':
    default:
      return {
        fill: seriesColor(datum.colorIndex ?? index),
        textClass: 'he-treemap__tile--series-text',
      };
  }
}

interface TileFieldProps {
  colorMode: 'series' | 'heat';
  formatValue: (value: number) => ReactNode;
  onSelect?: (datum: TreemapDatum, index: number) => void;
  renderTile?: RenderTile;
  colorBy?: ColorBy;
  spotlight?: SpotlightPredicate;
  /** When set, tiles report hover so the shared tooltip can follow the cursor. */
  onHover?: (datum: TreemapDatum, index: number) => void;
}

/** Render the absolutely-positioned tiles for one squarified rect list. */
function renderTiles(
  rects: TreemapRect<{ datum: TreemapDatum; index: number }>[],
  maxVal: number,
  groupIndex: number,
  fields: TileFieldProps,
): ReactNode {
  const { colorMode, formatValue, onSelect, renderTile, colorBy, spotlight, onHover } = fields;

  return rects.map((rect) => {
    const { datum, index } = rect.item;

    // Color lens: recompute tone/fill/intensity, then fall back to the base color logic.
    const lens = colorBy?.(datum, index);
    const eff: TreemapDatum = lens ? { ...datum, ...lens } : datum;
    const heat = eff.intensity ?? eff.value / maxVal;
    const { fill, textClass } = eff.fill
      ? { fill: eff.fill, textClass: 'he-treemap__tile--custom-fill' }
      : tileColor(eff, index, colorMode, heat);

    // Spotlight: fade non-matching tiles in place (layout untouched).
    const dim = datum.dimmed || (spotlight ? !spotlight(datum, index) : false);

    const showValue = rect.width >= HIDE_VALUE_W && rect.height >= HIDE_VALUE_H;
    const showLabel = rect.width >= HIDE_LABEL_W && rect.height >= HIDE_LABEL_H;
    const showHint =
      datum.hint != null && rect.width >= HIDE_VALUE_W && rect.height >= HIDE_VALUE_H * 1.6;

    const posStyle: CSSProperties = {
      left: `${rect.x}%`,
      top: `${rect.y}%`,
      width: `${rect.width}%`,
      height: `${rect.height}%`,
      background: fill,
    };

    const geometry: TreemapTileGeometry = {
      xPct: rect.x,
      yPct: rect.y,
      widthPct: rect.width,
      heightPct: rect.height,
      groupIndex,
    };
    const custom = renderTile?.(datum, index, geometry);

    const inner =
      custom != null ? (
        <span className="he-treemap__tile-inner he-treemap__tile-inner--custom">{custom}</span>
      ) : (
        <span className="he-treemap__tile-inner">
          {showLabel && <span className="he-treemap__label">{datum.label}</span>}
          {showValue && <span className="he-treemap__value">{formatValue(datum.value)}</span>}
          {showHint && <span className="he-treemap__hint">{datum.hint}</span>}
        </span>
      );

    const cls = cx(
      'he-treemap__tile',
      textClass,
      onSelect && 'he-treemap__tile--clickable',
      dim && 'he-treemap__tile--dimmed',
    );
    // Only set on enter — tile→tile transitions update in one step, and the shared
    // tooltip hides via the wrapper anchor's own pointerleave.
    const onPointerEnter = onHover ? () => onHover(datum, index) : undefined;

    return onSelect ? (
      <button
        key={datum.id ?? index}
        type="button"
        className={cls}
        style={posStyle}
        onClick={() => onSelect(datum, index)}
        onPointerEnter={onPointerEnter}
      >
        {inner}
      </button>
    ) : (
      <div key={datum.id ?? index} className={cls} style={posStyle} onPointerEnter={onPointerEnter}>
        {inner}
      </div>
    );
  });
}

export function Treemap({
  data,
  groups,
  height = 320,
  colorMode = 'series',
  formatValue = defaultFormat,
  gap = 2,
  onSelect,
  regionSizing = 'value',
  minRegionWidth = 120,
  renderTile,
  colorBy,
  spotlight,
  tileTooltip,
  className,
  style,
  ...rest
}: TreemapProps) {
  const [hovered, setHovered] = useState<{ datum: TreemapDatum; index: number } | null>(null);
  const onHover = tileTooltip ? (datum: TreemapDatum, index: number) => setHovered({ datum, index }) : undefined;
  const fields: TileFieldProps = {
    colorMode,
    formatValue,
    onSelect,
    renderTile,
    colorBy,
    spotlight,
    onHover,
  };

  const rootStyle = { height, '--he-treemap-gap': `${gap}px`, ...style } as CSSProperties;

  const body =
    groups != null ? (
      <div className={cx('he-treemap', 'he-treemap--grouped', className)} style={rootStyle} role="group" {...rest}>
        {groups.map((group, gi) => {
          const total = sum(group.data.map((d) => d.value));
          const weight = regionSizing === 'equal' ? 1 : group.weight ?? (total || 1);
          // Keep a stable index back to the group's data before squarify sorts/filters.
          const indexed = group.data.map((datum, index) => ({ datum, index }));
          const rects = squarify(indexed, (n) => n.datum.value, 100, 100);
          const regionMax = maxValue(group.data.map((d) => d.value)) || 1;
          return (
            <div
              key={group.id ?? gi}
              className="he-treemap__region"
              style={{ flexGrow: weight, flexBasis: 0, minWidth: minRegionWidth }}
            >
              <div className="he-treemap__region-header">
                <span className="he-treemap__region-title">{group.title}</span>
                {group.summary != null && (
                  <span className="he-treemap__region-summary">{group.summary}</span>
                )}
              </div>
              <div className="he-treemap__region-body">{renderTiles(rects, regionMax, gi, fields)}</div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className={cx('he-treemap', className)} style={rootStyle} role="group" {...rest}>
        {renderTiles(
          squarify(
            (data ?? []).map((datum, index) => ({ datum, index })),
            (n) => n.datum.value,
            100,
            100,
          ),
          maxValue((data ?? []).map((d) => d.value)) || 1,
          -1,
          fields,
        )}
      </div>
    );

  if (!tileTooltip) return body;

  // One shared cursor-anchored tooltip for the whole field (no per-tile portals).
  return (
    <Tooltip
      className="he-treemap-tip-anchor"
      contentClassName="he-treemap__tip"
      followCursor
      delay={0}
      content={hovered ? tileTooltip(hovered.datum, hovered.index) : null}
    >
      {body}
    </Tooltip>
  );
}
