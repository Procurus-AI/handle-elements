import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { heatColor, maxValue, seriesColor, squarify } from '../../lib/chart';

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
}

export interface TreemapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  data: TreemapDatum[];
  /** Container height in px; width is fluid (tiles positioned in %). */
  height?: number;
  /** How untoned tiles are colored. */
  colorMode?: 'series' | 'heat';
  /** Format the value line. Defaults to a compact number. */
  formatValue?: (value: number) => ReactNode;
  /** Gap between tiles in px. */
  gap?: number;
  /** Tiles become buttons; fires with the datum and its data-array index. */
  onSelect?: (datum: TreemapDatum, index: number) => void;
}

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

export function Treemap({
  data,
  height = 320,
  colorMode = 'series',
  formatValue = defaultFormat,
  gap = 2,
  onSelect,
  className,
  style,
  ...rest
}: TreemapProps) {
  // Keep a stable index back to `data` before squarify sorts/filters.
  const indexed = data.map((datum, index) => ({ datum, index }));
  const rects = squarify(indexed, (n) => n.datum.value, 100, 100);
  const maxVal = maxValue(data.map((d) => d.value)) || 1;

  return (
    <div
      className={cx('he-treemap', className)}
      style={{ height, '--he-treemap-gap': `${gap}px`, ...style } as CSSProperties}
      role="group"
      {...rest}
    >
      {rects.map((rect) => {
        const { datum, index } = rect.item;
        const heat = datum.intensity ?? datum.value / maxVal;
        const { fill, textClass } = tileColor(datum, index, colorMode, heat);
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

        const inner = (
          <span className="he-treemap__tile-inner">
            {showLabel && <span className="he-treemap__label">{datum.label}</span>}
            {showValue && <span className="he-treemap__value">{formatValue(datum.value)}</span>}
            {showHint && <span className="he-treemap__hint">{datum.hint}</span>}
          </span>
        );

        const cls = cx('he-treemap__tile', textClass, onSelect && 'he-treemap__tile--clickable');

        return onSelect ? (
          <button
            key={datum.id ?? index}
            type="button"
            className={cls}
            style={posStyle}
            onClick={() => onSelect(datum, index)}
          >
            {inner}
          </button>
        ) : (
          <div key={datum.id ?? index} className={cls} style={posStyle}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
