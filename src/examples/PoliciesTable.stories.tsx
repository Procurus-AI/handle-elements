import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useMemo, useState } from 'react';

import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Chip } from '../components/Chip/Chip';
import {
  DataTable,
  TableCell,
  type DataTableColumn,
  type DataTableSort,
} from '../components/DataTable/DataTable';
import { DateText, RelativeTime } from '../components/DateText/DateText';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { SearchInput } from '../components/Input/SearchInput';
import { Container, Stack } from '../components/Layout/Layout';
import { Menu, MenuItem, MenuSeparator } from '../components/Menu/Menu';
import { Meter } from '../components/Meter/Meter';
import { Money } from '../components/Money/Money';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Pagination, pageRange } from '../components/Pagination/Pagination';
import { SegmentBar } from '../components/SegmentBar/SegmentBar';
import { StatCard, StatCardGroup } from '../components/StatCard/StatCard';
import { StatusPill } from '../components/StatusPill/StatusPill';
import { Text } from '../components/Text/Text';
import { ResultCount, Toolbar, ToolbarGroup } from '../components/Toolbar/Toolbar';
import { formatCurrency } from '../format';

/**
 * "Handle v2 · Policies" — the record index rebuilt as a native Handle Elements
 * view. ZERO custom styling: there is no inline `style` object and no bespoke
 * class in this file. Every layout and typography decision comes from a library
 * element (Container, Stack, Text, PageHeader, StatCardGroup, SegmentBar,
 * Toolbar, DataTable, Pagination), so the screen is copy-pasteable into the app.
 *
 * It answers the screen it replaces rather than copying it. Six defects, six
 * specific fixes:
 *
 *  1. "in 25949d" — a ~71-year horizon printed as confident fact, and because
 *     the table sorted by EXPIRES ascending those rows LED the view. Here any
 *     date more than ten years out (no P&C term runs that long; the longest
 *     legitimate multi-year term is five), any epoch-zero coercion, and any
 *     absent date is one bucket: "No renewal date". It never prints a day
 *     count, it is a first-class number in the rail and a segment in the bar,
 *     and the EXPIRES column carries `nulls="last"` so those rows sit at the
 *     bottom in BOTH directions. A `?? Infinity` sentinel cannot do that — it
 *     is nulls-last ascending and nulls-FIRST descending, so two clicks on the
 *     header bring the bug straight back. `nulls` only governs an ACTIVE sort,
 *     and DataTable's cycle is asc -> desc -> null, so the guarantee is only as
 *     good as the UNSORTED order too: the POLICIES array is therefore emitted
 *     in safe order (dated rows by expiry, suspects last). No reachable state
 *     of this table leads with them — verified by clicking, not asserted here.
 *  2. PREMIUM was "—" on 10 of 14 visible rows while the header advertised
 *     "$246,668,584.62 MXN". Here the premium tile carries a `Meter` showing
 *     exactly what share of the rows in view are priced, and its footer says
 *     the total is a floor. The cell reads "Not captured", never "$0".
 *  3. STATUS was "Active" on every visible row — a whole column spending ~25%
 *     of the table's width to print six identical letters. The column is
 *     conditional (see `statusColumn`): it renders only when the CURRENT result
 *     set actually varies. When it is withheld the constant is stated as a
 *     non-removable Chip in the toolbar, so nothing is hidden.
 *  4. The KPIs were a run-on sentence at full cent precision. They are now six
 *     aligned tiles in ONE bordered rail, printing magnitudes ($1.4M) not
 *     $1,412,338.19 — cents belong on the record detail, where a broker
 *     reconciles against a carrier statement.
 *  5. "Filters" was opaque. Every applied predicate is its own removable Chip
 *     that names its field ("Horizon · Overdue"), never a bare "3 filters" — a
 *     count cannot be audited, and a broker must be able to see WHICH filter is
 *     lying to them. `MenuItem` has no checked state, which is precisely why
 *     the chips are load-bearing rather than decoration.
 *  6. There was no sense of the shape of 4,592 rows. The SegmentBar is that
 *     shape, scoped to what you are actually looking at.
 *
 * ONE SOURCE OF TRUTH. Deliberate deviation from the sketched call: the search
 * text is applied by this view (`visible`) instead of by DataTable's
 * `globalFilter`. DataTable's internal filter is not observable except through
 * an `onFilteredChange` round-trip, and every number above the table — the six
 * tiles, the bar, the ResultCount, the Pagination total — has to be computed
 * from exactly the rows the body shows. Computing them from one memo is what
 * makes the header structurally incapable of drifting from the rows, which was
 * defect 2. Paging still lives INSIDE DataTable (`page`/`pageSize`), because
 * DataTable owns the sort and slicing upstream would sort only the visible page.
 */
const meta = {
  title: 'Examples/Policies',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ clock */

const DAY = 86_400_000;
/** Pinned "today" — nothing here calls `new Date()`, so the story renders identically forever. */
const NOW = Date.UTC(2026, 8, 3);
/** Ten years. Past this a date is a maturity, a typo or a null coercion — never an expiry. */
const SUSPECT_DAYS = 3650;
/** Anything at or below this is an epoch-zero coercion wearing a date's clothes. */
const EPOCH_FLOOR = Date.UTC(1971, 0, 1);

/* ------------------------------------------------------------------ formatters */

/** The chrome of this view is English, so the values are too: `src/format`
 *  defaults to es-MX, which had the table printing "hace 4sem" under a header
 *  reading "Expires". One screen, one language — swap this single constant to
 *  'es-MX' and the dates follow the labels. */
const LOCALE = 'en-US';

const int = (v: number): string => v.toLocaleString(LOCALE);
const mxn = (v: number): string =>
  formatCurrency(v, { locale: LOCALE, currency: 'MXN', compact: true, currencyDisplay: 'narrowSymbol' });

/* ------------------------------------------------------------------ model */

type Ramo = 'Vida' | 'Autos' | 'Daños' | 'GMM';
type Carrier = 'GNP' | 'ANA Seguros' | 'Quálitas' | 'HDI';
type Status = 'active' | 'lapsed' | 'cancelled';

type Policy = {
  id: string;
  policy: string;
  customer: string;
  carrier: Carrier;
  ramo: Ramo;
  status: Status;
  /** `null` = never captured. NOT zero — a zero premium is a real, different fact. */
  premium: number | null;
  /** Epoch ms; `null` when the feed carried no expiry at all. */
  expiresAt: number | null;
};

const STATUS_LABEL: Record<Status, string> = {
  active: 'Active',
  lapsed: 'Lapsed',
  cancelled: 'Cancelled',
};

/* ------------------------------------------------------------------ data */

/**
 * Deterministic 32-bit LCG. Nothing in this file touches `Math.random` or
 * `new Date()`, so the 120 rows below are byte-identical on every reload.
 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * The first fifteen customers are the screenshot's own pathology: one extended
 * family's Vida policies, which the feed dated 2078–2097 (a maturity-at-age-99,
 * not an expiry) or left undated entirely, and which were never priced.
 */
const SUSPECT_NAMES = [
  'Evaristo Rubio Calderón',
  'Gonzalo Rubio Calderón',
  'María Graciela Calderón Rojas',
  'Graciela Calderón de Rubio',
  'Graciela María Rubio Calderón',
  'Florencia Rubio Calderón',
  'Ana Gabriela López Benavides',
  'Adriana María Villarreal Salazar',
  'Agustín Domínguez Aquino',
  'Laura Alicia González Villarreal',
  'Gibrán Jesús Calderón De la Mora',
  'Rosa María Treviño Cantú',
  'Jorge Alberto Salinas Vela',
  'Cristina Peña González',
  'Hugo Bernardo González Barba',
];

const FIRST = [
  'Juan Manuel', 'María Fernanda', 'César Gabriel', 'Omar Antonio', 'Silvia',
  'Ricardo', 'Patricia', 'Alejandro', 'Mónica', 'Rodrigo',
  'Verónica', 'Ernesto', 'Diana', 'Sergio', 'Claudia',
  'Andrés', 'Gabriela', 'Emilio', 'Regina', 'Hugo',
];

const LAST = [
  'Santillán Rodríguez', 'Robles Lugo', 'Guerra Ramón', 'Arvayo Castro',
  'Lozano Garza', 'Cavazos Elizondo', 'Del Bosque Ayala', 'Martínez Zúñiga',
  'Ibarra Quiroga', 'Serna Maldonado', 'Fuentes Berlanga', 'Escamilla Ponce',
  'Nájera Contreras',
];

const COMPANIES = [
  'Modelos Económicos Aho S.A.P.I. de C.V.',
  'Regio Gas S.A. de C.V.',
  'Inovek Monterrey S.A. de C.V.',
  'Comercializadora del Valle S.A. de C.V.',
  'Transportes Sierra Alta S. de R.L.',
  'Aceros y Perfiles del Norte S.A. de C.V.',
  'Grupo Constructor Anáhuac S.A. de C.V.',
  'Clínica Zamora S.C.',
  'Alimentos Selectos de Occidente S.A. de C.V.',
  'Dileo Sapi de C.V.',
  'Servicios Logísticos Cumbres S.A. de C.V.',
  'Refacciones Industriales Rivera S.A. de C.V.',
  'Plásticos Tecnificados del Bajío S.A. de C.V.',
  'Autotransportes Villarreal S.A. de C.V.',
  // Two deliberately long razones sociales — corporate names in this market
  // really do run this far. They are what `truncate` + `layout="fixed"` exist
  // for: without both, one of these widens the column and pushes the two
  // right-hand numeric columns off the card. Measured at 13px in the shipped
  // fallback face, the first is 562px against a 475px cell (it ellipsises even
  // at the widest layout) and the second is 424px (it fits until the
  // conditional STATUS column appears and takes the cell to 351px).
  'Comercializadora y Distribuidora de Productos Agropecuarios del Noreste de México S.A.P.I. de C.V.',
  'Inmobiliaria y Desarrolladora Patrimonial Monterrey Poniente S.A. de C.V.',
];

/** Plausible annual premium band per line of business, in MXN. */
const PREMIUM_BAND: Record<Ramo, [number, number]> = {
  Vida: [9_000, 180_000],
  Autos: [6_500, 42_000],
  Daños: [28_000, 1_400_000],
  GMM: [18_000, 260_000],
};

const RAMO_CYCLE: Ramo[] = ['Autos', 'Daños', 'GMM', 'Autos', 'Vida', 'Daños', 'Autos', 'GMM'];

/**
 * Days from `NOW` for row `i`. The distribution deliberately reproduces the
 * screenshot's pathologies so the fixes are provable rather than asserted:
 * 10 far-future rows + 5 undated rows (the "in 25949d" case), a cluster of 18
 * renewing inside 30 days, and 7 already past due.
 */
function offsetFor(i: number): number | null {
  if (i < 10) return 19_000 + i * 780; // 52–67 years out: maturity dates, not expiries
  if (i < 15) return null; // the feed carried no expiry at all
  if (i < 33) return Math.round(1 + (i - 15) * 1.6); // 1–29 days — the renewal cluster
  if (i < 40) return -(2 + (i - 33) * 4); // 2–30 days past due
  if (i < 62) return Math.round(33 + (i - 40) * 2.6); // 31–90 days
  if (i < 95) return 95 + (i - 62) * 8; // 91–365 days
  return 400 + (i - 95) * 30; // beyond a year, still a credible multi-year term
}

/**
 * 120 policies for a Monterrey brokerage. Module-level and fully deterministic.
 *
 * The array is emitted in SAFE ORDER — every dated policy by expiry ascending,
 * then the undated/suspect ones — because DataTable's sort is tri-state
 * (asc -> desc -> null) and the cleared state falls back to source order. A
 * column's `nulls: 'last'` only governs an ACTIVE sort, so without this the
 * third click on any sortable header put the fifteen suspect rows back at the
 * top of the view: exactly the pathology of the screen this replaces, two
 * clicks away. Now no reachable state leads with them.
 */
const POLICIES: Policy[] = (() => {
  const rnd = lcg(20_260_903);
  const rows = Array.from({ length: 120 }, (_, i): Policy => {
    const draw = rnd();
    const folio = 100_000_000 + Math.floor(rnd() * 899_999_999);
    // The feed mixes plain carrier folios with alphanumeric ones (N3S3016141).
    const policy =
      i % 6 === 4 ? `N${1 + (i % 3)}${['S', 'XL', 'SL'][i % 3]}${String(folio).slice(0, 6)}` : String(folio);

    const ramo: Ramo = i < 15 ? 'Vida' : RAMO_CYCLE[i % RAMO_CYCLE.length];
    const carrier: Carrier =
      ramo === 'Autos'
        ? i % 2 === 1
          ? 'Quálitas'
          : 'ANA Seguros'
        : ramo === 'Daños'
          ? i % 3 === 0
            ? 'GNP'
            : 'HDI'
          : ramo === 'Vida' && i % 4 === 1
            ? 'HDI'
            : 'GNP';

    // The only five non-Active rows in the book (4.2%) all sit in the overdue
    // bucket — which is what makes the conditional STATUS column demonstrable:
    // withheld at rest, present the moment you filter to Overdue.
    const status: Status =
      i === 33 || i === 35 || i === 37 ? 'lapsed' : i === 34 || i === 38 ? 'cancelled' : 'active';

    const [lo, hi] = PREMIUM_BAND[ramo];
    // Row 10 is the screenshot's one priced-but-implausibly-dated policy: a
    // premium does not make a 2049 expiry credible.
    const premium =
      i === 10 ? 145_600 : i < 15 || (i * 3) % 5 < 2 ? null : Math.round((lo + draw * (hi - lo)) * 100) / 100;

    const offset = offsetFor(i);
    const customer =
      i < 15
        ? SUSPECT_NAMES[i]
        : i % 3 === 2
          ? COMPANIES[i % COMPANIES.length]
          : `${FIRST[i % FIRST.length]} ${LAST[(i * 5) % LAST.length]}`;

    return {
      id: `pol-${i}`,
      policy,
      customer,
      carrier,
      ramo,
      status,
      premium,
      expiresAt: offset == null ? null : NOW + offset * DAY,
    };
  });
  return rows.sort((a, b) => {
    const sa = isSuspect(a);
    const sb = isSuspect(b);
    if (sa !== sb) return sa ? 1 : -1;
    if (sa) return 0;
    return (a.expiresAt as number) - (b.expiresAt as number);
  });
})();

/* ------------------------------------------------------- data-quality rule */

function daysOut(p: Policy): number | null {
  if (p.expiresAt == null || !Number.isFinite(p.expiresAt)) return null;
  return Math.round((p.expiresAt - NOW) / DAY);
}

/**
 * A date this view refuses to state as an expiry. The value may well be a real
 * Vida maturity — it is simply not a renewal date, and a renewals index must
 * not present it as one.
 */
function isSuspect(p: Policy): boolean {
  if (p.expiresAt == null || !Number.isFinite(p.expiresAt)) return true;
  if (p.expiresAt <= EPOCH_FLOOR) return true;
  return (daysOut(p) ?? 0) > SUSPECT_DAYS;
}

type Horizon = 'overdue' | 'd30' | 'd90' | 'far' | 'unknown';

function horizonOf(p: Policy): Horizon {
  if (isSuspect(p)) return 'unknown';
  const h = daysOut(p) as number;
  if (h < 0) return 'overdue';
  if (h <= 30) return 'd30';
  if (h <= 90) return 'd90';
  return 'far';
}

/**
 * One line per row so `dense` row height never varies.
 *  · NEAR (≤ 400 days): the absolute date is the fact a broker schedules
 *    against; the faint relative is the redundant pressure hint. `RelativeTime`
 *    is structurally incapable of emitting "in 25949d" — `formatRelativeTime`'s
 *    unit ladder only reaches the 'd' bucket below one week — so every such
 *    string in the old screen was app code bypassing `src/format`.
 *  · FAR: date only. Shortening "in 8274d" to "in 23y" would not be more
 *    useful, only less obviously broken.
 *  · SUSPECT: a quiet neutral StatusPill — a 6px faint dot with a dim label, so
 *    it reads as a STATE the record is in, not a date the system is asserting.
 *    The raw value survives beside it in muted mono (and in DateText's `title`
 *    and `dateTime`), so nothing is hidden and nobody has to trust our judgement.
 */
function renderExpiry(p: Policy) {
  if (isSuspect(p)) {
    return (
      <TableCell
        primary={<StatusPill status="neutral" label="No renewal date" />}
        // Prefixed, because "No renewal date  9 Sep 2078" reads as the cell
        // denying a date it then prints. The feed's value is evidence, not an
        // expiry, and the label is what makes that difference visible.
        trailing={
          <DateText
            date={p.expiresAt}
            locale={LOCALE}
            variant="muted"
            dateStyle="medium"
            nullLabel="not in feed"
            title={
              p.expiresAt == null
                ? 'The feed carried no expiry for this policy.'
                : 'Value carried by the feed. Kept visible as evidence — it is not treated as a renewal date.'
            }
          />
        }
      />
    );
  }
  const h = daysOut(p) as number;
  return (
    <TableCell
      mono
      primary={<DateText date={p.expiresAt} locale={LOCALE} variant="mono" dateStyle="medium" />}
      trailing={
        h > 400 ? undefined : (
          <RelativeTime date={p.expiresAt} now={NOW} locale={LOCALE} variant="muted" />
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ facets */

type FacetGroup = 'horizon' | 'ramo' | 'status' | 'premium';

type Facet = {
  id: string;
  group: FacetGroup;
  label: string;
  test: (p: Policy) => boolean;
};

const GROUP_LABEL: Record<FacetGroup, string> = {
  horizon: 'Horizon',
  ramo: 'Ramo',
  status: 'Status',
  premium: 'Premium',
};

/** Horizon labels are the SAME words the SegmentBar legend uses — chart, menu,
 *  chips and rail all speak one language. */
const FACETS: Facet[] = [
  { id: 'h.overdue', group: 'horizon', label: 'Overdue', test: (p) => horizonOf(p) === 'overdue' },
  { id: 'h.d30', group: 'horizon', label: 'Renews ≤ 30 days', test: (p) => horizonOf(p) === 'd30' },
  { id: 'h.d90', group: 'horizon', label: '31–90 days', test: (p) => horizonOf(p) === 'd90' },
  { id: 'h.far', group: 'horizon', label: 'Beyond 90 days', test: (p) => horizonOf(p) === 'far' },
  { id: 'h.unknown', group: 'horizon', label: 'No renewal date', test: (p) => horizonOf(p) === 'unknown' },
  { id: 'r.vida', group: 'ramo', label: 'Vida', test: (p) => p.ramo === 'Vida' },
  { id: 'r.autos', group: 'ramo', label: 'Autos', test: (p) => p.ramo === 'Autos' },
  { id: 'r.danos', group: 'ramo', label: 'Daños', test: (p) => p.ramo === 'Daños' },
  { id: 'r.gmm', group: 'ramo', label: 'GMM', test: (p) => p.ramo === 'GMM' },
  { id: 's.active', group: 'status', label: 'Active', test: (p) => p.status === 'active' },
  { id: 's.lapsed', group: 'status', label: 'Lapsed', test: (p) => p.status === 'lapsed' },
  { id: 's.cancelled', group: 'status', label: 'Cancelled', test: (p) => p.status === 'cancelled' },
  { id: 'p.yes', group: 'premium', label: 'On record', test: (p) => p.premium != null },
  { id: 'p.no', group: 'premium', label: 'Not captured', test: (p) => p.premium == null },
];

const FACET_BY_ID = new Map(FACETS.map((f) => [f.id, f]));

/**
 * The count beside each menu item is the facet's size in the WHOLE book — a
 * stable number you can pick from. What your combination actually yields is the
 * ResultCount, which is why both are on screen at once.
 */
const FACET_COUNTS: Record<string, number> = Object.fromEntries(
  FACETS.map((f) => [f.id, POLICIES.filter(f.test).length]),
);

const chipLabel = (f: Facet): string => `${GROUP_LABEL[f.group]} · ${f.label}`;

/* ------------------------------------------------------------------ icon */

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Upload glyph — inline SVG, the repo's icon idiom (no icon dependency). */
const uploadGlyph = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden focusable="false">
    <path d="M7.5 9.4V2.2" {...stroke} />
    <path d="M4.7 5L7.5 2.2 10.3 5" {...stroke} />
    <path d="M2.3 9.9v1.4c0 .7.6 1.3 1.3 1.3h7.8c.7 0 1.3-.6 1.3-1.3V9.9" {...stroke} />
  </svg>
);

/* ------------------------------------------------------------------ view */

function PoliciesView() {
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSort | null>({ key: 'expires', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const toggleFacet = useCallback((id: string) => {
    setApplied((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setPage(1);
  }, []);

  /** OR inside a facet group, AND across groups — the standard facet contract. */
  const scoped = useMemo(() => {
    if (applied.length === 0) return POLICIES;
    const groups = new Map<FacetGroup, Facet[]>();
    for (const id of applied) {
      const f = FACET_BY_ID.get(id);
      if (!f) continue;
      const list = groups.get(f.group);
      if (list) list.push(f);
      else groups.set(f.group, [f]);
    }
    const sets = [...groups.values()];
    return POLICIES.filter((p) => sets.every((fs) => fs.some((f) => f.test(p))));
  }, [applied]);

  /**
   * The one set every number on this page is derived from — the rail, the bar,
   * the ResultCount, the Pagination total and the table body all read THIS.
   * Search covers `carrier` even though there is no carrier column, so typing
   * "Quálitas" works; it deliberately does not search the formatted premium,
   * because "$94,086" is a rendering, not a field.
   */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter(
      (p) =>
        p.policy.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.carrier.toLowerCase().includes(q) ||
        p.ramo.toLowerCase().includes(q),
    );
  }, [scoped, query]);

  /**
   * KPI rail arithmetic. EVERY tile is computed over `visible`; only the
   * FOOTERS carry a global denominator. That rule is the fix for defect 2 — a
   * headline that ignores your filter is the same lie as a headline that
   * advertises $246M over rows that read "—". You never have to wonder whether
   * a number on this page counts the rows underneath it: it always does.
   */
  const kpi = useMemo(() => {
    const n = visible.length;
    let active = 0;
    let lapsed = 0;
    let cancelled = 0;
    let priced = 0;
    let premiumSum = 0;
    let overdue = 0;
    let overdueMxn = 0;
    let soon = 0;
    let soonMxn = 0;
    let unknown = 0;
    const horizon: Record<Horizon, number> = { overdue: 0, d30: 0, d90: 0, far: 0, unknown: 0 };

    for (const p of visible) {
      if (p.status === 'active') active += 1;
      else if (p.status === 'lapsed') lapsed += 1;
      else cancelled += 1;

      if (p.premium != null) {
        priced += 1;
        premiumSum += p.premium;
      }

      const h = horizonOf(p);
      horizon[h] += 1;
      if (h === 'overdue') {
        overdue += 1;
        overdueMxn += p.premium ?? 0;
      }
      if (h === 'd30') {
        soon += 1;
        soonMxn += p.premium ?? 0;
      }
      if (h === 'unknown') unknown += 1;
    }

    return {
      n,
      active,
      lapsed,
      cancelled,
      priced,
      premiumSum,
      coverage: n === 0 ? 0 : Math.round((priced / n) * 100),
      overdue,
      overdueMxn,
      soon,
      soonMxn,
      unknown,
      unknownPct: n === 0 ? 0 : Math.round((unknown / n) * 100),
      horizon,
    };
  }, [visible]);

  /**
   * Conditional STATUS column. It renders only when the CURRENT result set has
   * ≥2 distinct statuses AND the minority covers ≥5% of the rows. The 5% floor
   * rather than a bare ">1 distinct value" is what stops one cancelled policy on
   * page 3 from resurrecting a dead column across the whole index. When the
   * column is withheld, `note` states the constant it stands for, so the fact is
   * never lost — only the 120px of whitespace is.
   */
  const statusColumn = useMemo(() => {
    if (visible.length === 0) return { show: false, note: null as string | null };
    const counts = new Map<Status, number>();
    for (const p of visible) counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
    let top: Status = 'active';
    let topCount = 0;
    for (const [s, c] of counts) if (c > topCount) [top, topCount] = [s, c];
    const minorityShare = (visible.length - topCount) / visible.length;
    if (counts.size >= 2 && minorityShare >= 0.05) return { show: true, note: null };
    return {
      show: false,
      note:
        counts.size === 1
          ? `Status · ${STATUS_LABEL[top]} on all ${int(visible.length)}`
          : `Status · ${STATUS_LABEL[top]} on ${int(topCount)} of ${int(visible.length)}`,
    };
  }, [visible]);

  /** `pageRange` owns the clamping, so removing a filter can never strand you on page 3. */
  const { page: safePage } = pageRange(page, pageSize, visible.length);

  const columns = useMemo<DataTableColumn<Policy>[]>(() => {
    const base: DataTableColumn<Policy>[] = [
      {
        // The old screen gave this 391px to print 73px of digits.
        // Every non-fluid column is a PERCENTAGE, not a px slab. With rigid
        // px widths the whole viewport delta came out of the one fluid column:
        // at 900px Customer was squeezed to 158px (37 of 50 names ellipsised)
        // while Expires still held 256px to print a date. Shares make every
        // column give width back together. (`min(132px, 13%)` reads better but
        // Chrome's fixed-table algorithm ignores a min()/calc() column width
        // and falls back to equal distribution — measured 235px on all five.)
        key: 'policy',
        header: 'Policy no.',
        width: '11%',
        sortable: true,
        render: (r) => <TableCell mono primary={r.policy} />,
      },
      {
        // No width: takes all the slack, deliberately. The two longest razones
        // sociales measure 562px and 424px at 13px, so the wide-layout width is
        // the tail this column exists to print, not dead space — capping it
        // would only move the slack to a column that has nothing to say.
        // Single line — a `secondary` costs
        // +12.6px on every row and defeats `dense`. Carrier is a search term
        // and a fact in the drawer, not a column.
        key: 'customer',
        header: 'Customer',
        sortable: true,
        truncate: true,
        render: (r) => <TableCell primary={r.customer} />,
      },
      {
        // RAMO takes STATUS's old seat: it has real distinct values, it is the
        // axis brokers filter on, and it is the field that EXPLAINS both the
        // 2090s expiries and the missing premiums — defects 1 and 2 are one
        // product-line problem, and this column names it.
        key: 'ramo',
        header: 'Ramo',
        width: '10%',
        sortable: true,
        // Deliberately NOT `variant="mono"`. That variant is styled with
        // `--he-text-faint` (measured 2.51:1 on light at 10.5px) because it is
        // the library's quiet-metadata idiom — a legend swatch, a unit tag. Ramo
        // is a load-bearing data value, so it takes the default chip's
        // `--he-text-dim` (5.64:1) instead.
        render: (r) => <Chip size="sm">{r.ramo}</Chip>,
      },
      {
        key: 'premium',
        header: 'Premium',
        width: '13%',
        align: 'end',
        sortable: true,
        nulls: 'last', // neither a highest- nor a lowest-premium sort leads with blanks
        sortValue: (r) => r.premium,
        render: (r) => (
          <TableCell
            align="end"
            primary={
              <Money value={r.premium} locale={LOCALE} currency="MXN" nullLabel="Not captured" />
            }
          />
        ),
      },
      {
        key: 'expires',
        header: 'Expires',
        width: '19%',
        sortable: true,
        nulls: 'last',
        // Suspect ⇒ null ⇒ the nulls rule owns it, in BOTH directions. This is
        // the whole reason `DataTableColumn.nulls` exists.
        sortValue: (r) => (isSuspect(r) ? null : r.expiresAt),
        render: renderExpiry,
      },
    ];
    if (!statusColumn.show) return base;
    // Appended, never inserted: a column that appears must not also be a column
    // that moves everything else.
    return [
      ...base,
      {
        key: 'status',
        header: 'Status',
        width: '11%',
        sortable: true,
        render: (r) => (
          <StatusPill
            status={r.status === 'active' ? 'ok' : r.status === 'lapsed' ? 'warn' : 'neutral'}
            label={STATUS_LABEL[r.status]}
          />
        ),
      },
    ];
  }, [statusColumn.show]);

  const appliedFacets = applied
    .map((id) => FACET_BY_ID.get(id))
    .filter((f): f is Facet => f != null);

  const facetGroups: FacetGroup[] = ['horizon', 'ramo', 'status', 'premium'];

  return (
    <Container max={1240}>
      <Stack gap={5}>
        {/* ── 1. Header ─────────────────────────────────────────────────────
            `size="page"`, not `hero`: this is a record index, not a greeting.
            The subtitle is a <p>, so it carries inline nodes only — and it is
            deliberately the old screen's run-on KPI line demoted to what it
            actually is: provenance. The scannable numbers are the rail below.
            `showCurrencyCode` fixes two `$` signs meaning different currencies. */}
        <PageHeader
          title="Policies"
          subtitle={
            <>
              Monterrey book · 4 carriers ·{' '}
              <Money
                value={POLICIES.reduce((t, p) => t + (p.premium ?? 0), 0)}
                locale={LOCALE}
                currency="MXN"
                compact
                showCurrencyCode
              />{' '}
              captured to date · feed synced 3 Sep 2026
            </>
          }
          aside={
            <Button variant="outline" size="sm" onClick={() => console.log('alta por documento')}>
              {uploadGlyph}
              Alta por documento
            </Button>
          }
        />

        {/* ── 2. KPI rail ───────────────────────────────────────────────────
            ONE bordered surface with interior hairlines (variant="rail") — 9
            edges instead of 24 for six numbers. Every value is the FILTERED
            set; every footer is the global context. Magnitudes, never cents.

            `minColumnWidth`, never a hard `columns={6}`: a fixed six-track rail
            does not collapse, it only narrows, and at 900px the tiles measured
            233px tall with the labels wrapping to one, two and three lines —
            three different value baselines in a single rail, which destroys the
            scannability that replacing the run-on KPI sentence was for. 192px
            is the narrowest track on which every label still fits one line
            (the longest measures 138.3px inside the rail's 48px of inset), so
            "Premium on record" is now just "Premium" — its footer already says
            the total is a floor. The strip holds six tracks down to 1240px and
            then WRAPS to five and four, each row internally baseline-aligned,
            instead of growing three baselines inside one row. The 1px grid gap
            over --he-border keeps drawing the hairlines when it wraps. */}
        <StatCardGroup variant="rail" minColumnWidth="192px">
          <StatCard
            tone="neutral"
            label="Policies"
            value={int(kpi.n)}
            footer={`of ${int(POLICIES.length)} in the book`}
          />
          <StatCard
            tone="ok"
            label="Active"
            value={int(kpi.active)}
            footer={`${int(kpi.lapsed)} lapsed · ${int(kpi.cancelled)} cancelled`}
          />
          <StatCard
            tone="neutral"
            label="Premium"
            value={
              <Money value={kpi.premiumSum} locale={LOCALE} currency="MXN" compact showCurrencyCode />
            }
            // The coverage gap, stated by the library rather than left invisible:
            // this bar is how much of what you are reading is actually priced.
            visual={
              <Meter
                size="sm"
                value={kpi.coverage}
                tone={kpi.coverage < 70 ? 'warn' : 'ok'}
                aria-label="Share of visible policies with a premium on record"
              />
            }
            footer={`priced on ${int(kpi.priced)} of ${int(kpi.n)} — a floor, not a total`}
          />
          <StatCard
            tone="error"
            label="Overdue"
            value={int(kpi.overdue)}
            footer={kpi.overdueMxn > 0 ? `${mxn(kpi.overdueMxn)} priced` : 'none priced'}
          />
          <StatCard
            tone="warn"
            label="Renews ≤ 30 days"
            value={int(kpi.soon)}
            footer={kpi.soonMxn > 0 ? `${mxn(kpi.soonMxn)} priced` : 'none priced'}
          />
          <StatCard
            tone="warn"
            label="No renewal date"
            value={int(kpi.unknown)}
            footer={`${kpi.unknownPct}% · never shown as a date`}
          />
        </StatCardGroup>

        {/* ── 5. Distribution ───────────────────────────────────────────────
            Placed above the table because it is what tells you how to read the
            rows. One bar, ~40px with its legend: the renewal-horizon shape of
            exactly the rows in view, plus the unknowns as a real segment rather
            than something that leaks out of a sort order. A ColumnChart of the
            same data measures 218px — five policies' worth of screen to say the
            same thing. Its legend words are the Filters menu's words.

            The 250-word gloss that used to sit beside this bar is gone. It cost
            172px of the 662px that stood between the top of the viewport and
            the first data row — six rows of a record index, on a screen whose
            job is rows — to restate what the "NO RENEWAL DATE / never shown as
            a date" tile and this bar's own last segment already say. Its one
            unique claim (that those rows never lead the table) is now enforced
            by the source order and by `nulls: 'last'` rather than asserted in
            prose. Suppressed entirely at zero results, where an empty track
            over five "0 · 0%" legend rows says nothing the EmptyState does not. */}
        {kpi.n > 0 && (
          <Stack gap={2}>
            <Text as="span" size="caption" tone="dim">
              Renewal horizon · {int(kpi.n)} {kpi.n === 1 ? 'policy' : 'policies'} in view ·
              undated rows are a bucket here, never a date
            </Text>
            <SegmentBar
              size="sm"
              rounded
              showLegend
              showPercent
              /* Auto-fit legend columns: five one-per-row legend items cost
                 137px of height under an 8px bar, and across a 1176px host they
                 put every label a full page-width from its own number. At 220px
                 the five read as one line here and reflow to two or three as
                 the view narrows. */
              legendMinWidth="220px"
              formatValue={(v) => int(v)}
              aria-label="Policies in view by renewal horizon"
              segments={[
                { label: 'Overdue', value: kpi.horizon.overdue, tone: 'error' },
                { label: 'Renews ≤ 30 days', value: kpi.horizon.d30, tone: 'warn' },
                { label: '31–90 days', value: kpi.horizon.d90, tone: 'accent' },
                /* Salience follows urgency, not size: 'Beyond 90 days' is the
                   biggest and least actionable bucket, so it takes the quiet
                   neutral fill, and the data-quality bucket takes the ink. The
                   reverse gave the nothing-to-do-here segment the highest
                   contrast on the page in both themes. */
                { label: 'Beyond 90 days', value: kpi.horizon.far, tone: 'neutral' },
                { label: 'No renewal date', value: kpi.horizon.unknown, tone: 'ink' },
              ]}
            />
          </Stack>
        )}

        {/* ── 4. Table (with 3. control row and 6. footer inside the frame) ── */}
        <DataTable
          dense
          card
          stickyHeader
          maxHeight={560}
          layout="fixed"
          columns={columns}
          data={visible}
          rowKey={(r) => r.id}
          /* The primary action of a record index is opening the record. Without
             it the rows are inert: no pointer, no hover affordance, no keyboard
             target. In the app this opens the policy Drawer. */
          onRowClick={(r) => console.log('open policy', r.policy, r.customer)}
          page={safePage}
          pageSize={pageSize}
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            setPage(1);
          }}
          /* ── 3. Control row ────────────────────────────────────────────────
             ONE <Toolbar> child: the slot is space-between, so two children
             would split to the edges. Toolbar wraps, so the chips take a second
             line when the row fills — the table's top edge moving as you filter
             IS the feedback. */
          toolbar={
            <Toolbar>
              <SearchInput
                grow
                debounceMs={150}
                placeholder="Search policy no., customer, carrier or ramo…"
                value={query}
                onValueChange={(v) => {
                  setQuery(v);
                  setPage(1);
                }}
              />

              <Menu
                placement="bottom-start"
                label="Filters"
                trigger={
                  <Button variant="outline" size="sm">
                    Filters
                    {applied.length > 0 && (
                      <Badge tone="accent" size="sm">
                        {applied.length}
                      </Badge>
                    )}
                  </Button>
                }
              >
                {facetGroups.map((group, gi) => (
                  <div key={group}>
                    {gi > 0 && <MenuSeparator />}
                    {FACETS.filter((f) => f.group === group).map((f) => (
                      <MenuItem
                        key={f.id}
                        shortcut={int(FACET_COUNTS[f.id])}
                        onSelect={() => toggleFacet(f.id)}
                      >
                        {applied.includes(f.id) ? `✓ ${f.label}` : f.label}
                      </MenuItem>
                    ))}
                  </div>
                ))}
              </Menu>

              {/* One chip per predicate, each naming its field. Never a bare
                  "3 filters": a count cannot be audited. */}
              <ToolbarGroup>
                {appliedFacets.map((f) => (
                  <Chip
                    key={f.id}
                    tone="active"
                    removeLabel={`Remove filter: ${chipLabel(f)}`}
                    onRemove={() => toggleFacet(f.id)}
                  >
                    {chipLabel(f)}
                  </Chip>
                ))}
                {applied.length > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setApplied([]);
                      setPage(1);
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </ToolbarGroup>

              {/* The end of the bar is where READOUTS live — things you read,
                  not things you operate. The status note belongs here rather
                  than among the chips: it carries no ×, because it is not a
                  filter, it is the constant the withheld STATUS column stands
                  for. The missing affordance is the difference. */}
              <ToolbarGroup align="end">
                {statusColumn.note && <Chip size="sm">{statusColumn.note}</Chip>}
                {/* The denominator is what makes a filtered count honest. */}
                <ResultCount>
                  {int(visible.length)} of {int(POLICIES.length)}
                </ResultCount>
                <Menu
                  placement="bottom-end"
                  label="More actions"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="More actions">
                      ⋯
                    </Button>
                  }
                >
                  <MenuItem
                    shortcut={int(visible.length)}
                    onSelect={() => console.log('export', visible.length, 'rows')}
                  >
                    Export filtered rows (CSV)
                  </MenuItem>
                  <MenuItem onSelect={() => console.log('export page', safePage)}>
                    Export current page
                  </MenuItem>
                  <MenuSeparator />
                  {/* Deliberately a dialog, not a checklist: MenuItem cannot
                      render a checked state, and a list that cannot show what is
                      on is worse than no list. */}
                  <MenuItem onSelect={() => console.log('open column settings')}>
                    Column settings…
                  </MenuItem>
                </Menu>
              </ToolbarGroup>
            </Toolbar>
          }
          /* ── 6. Footer ─────────────────────────────────────────────────────
             INSIDE the card frame and OUTSIDE the maxHeight scroller, so it
             stays put while the body scrolls under the pinned header. `total`
             is the filtered count, so the range readout can never contradict
             the ResultCount above it. */
          footer={
            <Pagination
              dense
              page={safePage}
              pageSize={pageSize}
              total={visible.length}
              pageSizeOptions={[25, 50, 100]}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          }
          emptyState={
            <EmptyState
              size="sm"
              title="No policy matches these filters."
              hint="Clear a chip, or search by policy number, customer, carrier or ramo."
            />
          }
        />
      </Stack>
    </Container>
  );
}

export const Index: Story = {
  render: () => <PoliciesView />,
};
