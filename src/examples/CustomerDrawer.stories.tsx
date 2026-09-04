import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useRef, useState } from 'react';

import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Composer } from '../components/Composer/Composer';
import { Container } from '../components/Layout/Layout';
import { DataTable, type DataTableColumn } from '../components/DataTable/DataTable';
import { DateText, RelativeTime } from '../components/DateText/DateText';
import { DescriptionItem, DescriptionList } from '../components/DescriptionList/DescriptionList';
import { Drawer } from '../components/Drawer/Drawer';
import { Feed, type FeedItem } from '../components/Feed/Feed';
import { List, ListItem } from '../components/List/List';
import { Money } from '../components/Money/Money';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Section, SectionLink } from '../components/Section/Section';
import { StatusPill, type StatusPillStatus } from '../components/StatusPill/StatusPill';
import { Text } from '../components/Text/Text';

/* ------------------------------------------------------------------ seed
 * One fixed instant drives every relative string, every day heading and every
 * derived date below, so the story renders byte-identically forever. No
 * Math.random, no bare `new Date()` at module scope. */
const NOW = new Date('2026-09-03T18:00:00Z');
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** `d` days (and optional `h` hours) before the pinned NOW. */
const ago = (d: number, h = 0): number => NOW.getTime() - d * DAY - h * HOUR;
/** A LOCAL calendar date. `'2027-01-05'` parses as UTC midnight, so in any
 *  negative-offset zone Intl prints "4 ene" — a real off-by-one in due dates. */
const on = (y: number, m: number, d: number): Date => new Date(y, m - 1, d);

/** Chrome, data and copy are Spanish throughout — this is a Mexican brokerage
 * screen (RFC, MXN, GNP). Mixing an English label into it is the defect. */
const LOCALE = 'es-MX';

/** One MXN amount per fact, declared once and reused by the summary, the
 * hairline rows and the feed, so the three can never disagree.
 *
 * Centavos are NOT optional in a receipts ledger: rounded to whole pesos,
 * $9,221.56 prints as "$9,222" — up 44 centavos — and the pending total silently
 * understates what is owed. `minimumFractionDigits` is the honest default here. */
const mxn = (value: number | null) => (
  <Money value={value} currency="MXN" locale={LOCALE} minimumFractionDigits={2} showCurrencyCode />
);
const fecha = (date: Date) => <DateText date={date} dateStyle="medium" locale={LOCALE} />;

const RENEWAL = on(2027, 7, 5);
const SINCE = on(2026, 7, 5);

const POLICIES = [
  {
    id: 'p1',
    carrier: 'GNP · Gastos médicos mayores',
    number: '619092885',
    premium: 15_566.23,
    term: 'Jul 2026 – Jul 2027',
  },
];

/** The third receipt has no captured amount — `Money value={null}` prints the
 * library's em-dash idiom rather than a fabricated zero. */
const RECEIPTS: {
  id: string;
  number: string;
  amount: number | null;
  due: Date;
  status: StatusPillStatus;
  label: string;
}[] = [
  { id: 'r1', number: '30125559390', amount: 9_221.56, due: on(2027, 1, 5), status: 'neutral', label: 'Cancelado' },
  { id: 'r2', number: '30240242230', amount: 7_783.12, due: on(2027, 1, 5), status: 'warn', label: 'Pendiente' },
  { id: 'r3', number: '30125559110', amount: null, due: on(2026, 7, 5), status: 'neutral', label: 'Cancelado' },
];

const PENDING = RECEIPTS.filter((r) => r.label === 'Pendiente');
const PENDING_TOTAL = PENDING.reduce((sum, r) => sum + (r.amount ?? 0), 0);
const ANNUAL_PREMIUM = POLICIES.reduce((sum, p) => sum + p.premium, 0);
const CARRIERS = [...new Set(POLICIES.map((p) => p.carrier.split(' · ')[0]))];

/** Documents start empty (the Section `empty` slot) and "Agregar documento"
 * pulls from this queue, so the control visibly does something. */
const DOCUMENT_QUEUE = [
  { id: 'd1', name: 'Constancia de situación fiscal', meta: <>PDF · 240 KB · {fecha(on(2026, 8, 25))}</> },
  { id: 'd2', name: 'Solicitud firmada 619092885', meta: <>PDF · 1.1 MB · {fecha(on(2026, 7, 19))}</> },
];

/* ------------------------------------------------------------------ data */

interface CustomerRow {
  id: string;
  name: string;
  rfc: string | null;
  policies: number;
  premium: number | null;
  renewal: Date | null;
}

/** The Clientes table is CONTEXT — it exists so the drawer is reviewed where it
 * actually lives. Twenty rows so the scroller has something to scroll and
 * `stickyHeader` is provable; two rows carry a null RFC/premium/renewal so the
 * table's own em-dash idiom shows. Values are index-derived from the seed —
 * no Math.random, no bare `new Date()`. */
const ROSTER: [name: string, rfc: string | null][] = [
  ['Zazil Selene Montero Sanchez', 'MOSZ9803301E0'],
  ['Yudel Karren Cordova', 'KACY440403MZ7'],
  ['Yssel Mariana De Gortari Ortiz', 'GOOY751003MS7'],
  ['Yolanda Villarreal Cabriales', null],
  ['Yolanda Silvia Gonzalez Cantu', 'GOCY400310171'],
  ['Yolanda Rosalia Martinez Villarreal', 'MAVY900110A53'],
  ['Yolanda Maria Chapa Zambrano', 'CAZY900108291'],
  ['Yolanda Lizbeth Rivas Medina', null],
  ['Yesmyt Grisell Zapata Camacho', 'ZACY880725RX0'],
  ['Yeon Baek Jung', 'JUYE920520000'],
  ['Yelile Alejandra Guidi Marcos', 'GUMY810319BB9'],
  ['Yazmin Veronica Zavala Urbina', 'ZAUY8701049PA'],
  ['Yazmin Gallegos Cerda', 'GACY801022HK3'],
  ['Yamil Arroniz Burgueño', 'AOBY970706PP9'],
  ['Xochitl Zitlali Hernandez Bartolome', 'HEBX891020L55'],
  ['Xochitl Amelia Valencia Franco', 'VAFX660203E1A'],
  ['Constructora Peninsular SA de CV', 'CPE0304178M9'],
  ['Grupo Textil Del Bajio', 'GTB110922RF6'],
  ['Servicios Logisticos Del Norte', 'SLN140627QA3'],
  ['Refaccionaria Bajio Centro', 'RBC080115UF2'],
];

const CUSTOMERS: CustomerRow[] = ROSTER.map(([name, rfc], i) =>
  // Row 0 IS the fixtured record, so the table cell and the drawer's summary
  // can never print two different premiums for the same customer.
  i === 0
    ? { id: 'c1', name, rfc, policies: POLICIES.length, premium: ANNUAL_PREMIUM, renewal: RENEWAL }
    : {
        id: `c${i + 1}`,
        name,
        rfc,
        policies: rfc == null ? 0 : ((i * 3) % 5) + 1,
        premium: rfc == null ? null : 9_940 + ((i * 37) % 23) * 4_120,
        // Month overflows past 12 roll into 2027, so every renewal is in the
        // FUTURE relative to the pinned NOW — a "próxima renovación" that already
        // happened is a data defect, not a fixture detail.
        renewal: rfc == null ? null : on(2026, 10 + ((i * 7) % 15), ((i * 11) % 27) + 1),
      },
);

/** The one customer with a fixtured detail record. Every row opens the drawer —
 * the header identifies the row you clicked — but the sections below are this
 * record, so the drawer's own numbers always agree with each other. */
const CUSTOMER = CUSTOMERS[0];
const CUSTOMER_UPDATED = ago(34);

/** Eight events across five days. Every `at` is an OCCURRED-at strictly before
 * NOW, so no row can print "en 4 meses" beside "cancelado".
 *
 * No `tone` on any row. Every one of these events already SAYS what it is —
 * "cancelado", "emitido", "renovada por 12 meses" — so a coloured dot beside the
 * word encodes the same fact twice, and five hues were the only chroma on an
 * otherwise monochrome drawer. Feed keeps `tone` for state the words don't carry. */
const ACTIVITY: FeedItem[] = [
  {
    id: 'a1',
    at: ago(2),
    kind: 'Recibo',
    title: 'Recibo 30125559390 cancelado',
    meta: <>GNP · {mxn(RECEIPTS[0].amount)} · cancelado</>,
    href: '#recibo-30125559390',
  },
  {
    id: 'a2',
    at: ago(2, 5),
    actor: { name: 'Marina Escalante' },
    title: 'Hablé con la clienta sobre el recibo cancelado.',
    body: 'Pidió reexpedirlo contra la misma CLABE; queda pendiente confirmar con GNP antes del corte.',
  },
  {
    id: 'a3',
    at: ago(4),
    kind: 'Recibo',
    title: 'Recibo 30240242230 emitido',
    meta: <>GNP · {mxn(RECEIPTS[1].amount)} · vence {fecha(RECEIPTS[1].due)}</>,
    href: '#recibo-30240242230',
  },
  {
    // No `kind` and no `actor`: the feed falls back to time + title alone.
    id: 'a4',
    at: ago(4, 6),
    title: 'Se detectó un duplicado de carrier y se agrupó con el registro maestro.',
    meta: 'Automático',
  },
  {
    id: 'a5',
    at: ago(9),
    kind: 'Póliza',
    title: 'Póliza 619092885 renovada por 12 meses',
    meta: <>GNP · próxima renovación {fecha(RENEWAL)}</>,
    href: '#poliza-619092885',
  },
  {
    id: 'a6',
    at: ago(9, 3),
    actor: { name: 'Hugo Barrera' },
    title: 'Subí la constancia 2026; la aseguradora la aceptó el mismo día.',
  },
  {
    id: 'a7',
    at: ago(23),
    kind: 'Recibo',
    title: 'Recibo 30125559110 cancelado',
    meta: 'GNP · sin monto capturado',
    href: '#recibo-30125559110',
  },
  {
    id: 'a8',
    at: SINCE.getTime() + 10 * HOUR,
    kind: 'Cliente',
    title: 'Cliente dado de alta',
    meta: 'MOSZ9803301E0 · persona física',
  },
];

const COPY_GLYPH = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <rect x="4.25" y="4.25" width="6.25" height="6.25" rx="1.25" stroke="currentColor" strokeWidth="1.15" />
    <path
      d="M8 2.75A1.25 1.25 0 0 0 6.75 1.5h-4.5A1.25 1.25 0 0 0 1 2.75v4.5A1.25 1.25 0 0 0 2.25 8.5"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
    />
  </svg>
);

const meta = {
  title: 'Examples/Customer Drawer',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The canonical **record-detail drawer** — a customer opened over the Clientes
 * table — assembled entirely from library elements. Zero inline styles, zero
 * bespoke classes, zero hand-built headings.
 *
 * What it replaces, item for item:
 *
 * | Hand-assembled drawer | Here |
 * | --- | --- |
 * | Four bordered cards (one policy + three receipts) stacked inside a panel that is already a bordered surface — cards inside cards | Two `Section flush` + `List variant="divided"` blocks: hairline rows bled to the drawer's own inset, 3 rules instead of 16 card edges and 4 radii |
 * | Six hand-assembled heading shapes (heading + count + right-aligned action) | Six `<Section>`; `tier="sub"` is the mono-caps sub-head |
 * | Six label/value pairs hand-built in two columns | One `<DescriptionList columns={2}>` |
 * | A horizontal `Timeline` misused as record history, with a 76px two-line time column | `<Feed groupBy="day">` — a day heading, then the clock time per row (a relative label under a day heading restates the heading), and monochrome dots: every event here already says "cancelado"/"emitido" in words |
 * | A borderless "Agregar comentario…" placeholder that does nothing | `<Composer size="sm">` with a real submit that posts into the feed |
 * | ~61px of empty header bar, with the record's name ~140px down the *scrolling* body | Header holds eyebrow + name + status + RFC + updated-at; it is a flex sibling of the scroller, so it never scrolls away |
 * | The name in the sans face | `.he-drawer__title` is Sentient, the brand display face — as is the page title behind it, because that view goes through `PageHeader` |
 * | A bare copy icon | A labelled `Button variant="ghost" size="xs"` that carries the RFC and confirms with "Copiado" |
 * | "Preguntar sobre este cliente" as a weak text link | A real `Button variant="secondary"` pinned in the footer, which drafts the question **and scrolls the composer into view and focuses it** — a draft that lands off-screen is a control that did nothing |
 * | An expand toggle that just stretched every row (a receipt amount ~1000px from its status pill) | `Drawer aside` — expanding reveals the activity feed as a **second column**, so the width buys density instead of slack |
 * | `$9,222 MXN` for a `$9,221.56` receipt | `minimumFractionDigits={2}` on the one shared `mxn()` helper, table column included |
 * | "Entidades relacionadas 4" | No count — 1 and 3 are already stated by the two sub-heads directly below it |
 * | A 2px Borealis spine on the selected table row | `isRowSelected` → a `--he-surface-2` fill plus a weight step on the first cell. **This is the sanctioned selected-row idiom**: no accent bar, no edge spine, in DataTable, List or Sidebar |
 *
 * Interactions are real: rows open the drawer, the expand toggle widens it,
 * "Agregar documento" flips the empty state into hairline rows, the copy control
 * writes the RFC to the clipboard, the footer button drafts a question into the
 * composer, and posting a comment prepends it to the feed.
 */
export const Default: Story = {
  render: () => {
    const [openId, setOpenId] = useState<string | null>(CUSTOMER.id);
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [documents, setDocuments] = useState<typeof DOCUMENT_QUEUE>([]);
    const [comment, setComment] = useState('');
    const [posted, setPosted] = useState<FeedItem[]>([]);
    const composerRef = useRef<HTMLTextAreaElement>(null);

    const row = useMemo(() => CUSTOMERS.find((c) => c.id === openId) ?? null, [openId]);
    const activity = useMemo(() => [...posted, ...ACTIVITY], [posted]);

    /** A real clipboard write, and the label confirms it — a copy control that
     *  gives no feedback reads as a control that does nothing. */
    const copyRfc = (rfc: string) => {
      void navigator.clipboard?.writeText(rfc).catch(() => undefined);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    };

    const addDocument = () => setDocuments(DOCUMENT_QUEUE.slice(0, documents.length + 1));

    const postComment = () => {
      const text = comment.trim();
      if (text === '') return;
      setPosted((prev) => [
        // Stamped with the SAME pinned instant the Feed is given as `now`. Using
        // the wall clock here made a just-posted comment read "en 5h" — a feed
        // must never print a future relative time for something that happened.
        { id: `nota-${prev.length + 1}`, at: NOW, actor: { name: 'Marina Escalante' }, title: text },
        ...prev,
      ]);
      setComment('');
    };

    /** Drafts the question AND lands it. Writing into a composer ~900px down an
     *  unscrolled panel changed nothing on screen — measured: scrollTop stayed 0,
     *  the textarea never took focus, and its rect was outside the scroller's.
     *  The drawer's one primary action appeared to do nothing. */
    const askAboutCustomer = () => {
      setComment('¿Por qué se canceló el recibo 30125559390?');
      // After paint, so the composer has the drafted value when we scroll to it.
      requestAnimationFrame(() => {
        const input = composerRef.current;
        if (input == null) return;
        input.focus({ preventScroll: true });
        input.setSelectionRange(input.value.length, input.value.length);
        input.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    };

    const columns: DataTableColumn<CustomerRow>[] = [
      { key: 'name', header: 'Cliente', sortable: true, truncate: true },
      {
        key: 'rfc',
        header: 'RFC',
        sortable: true,
        nulls: 'last',
        render: (r) =>
          r.rfc ?? (
            <Text as="span" tone="faint">
              —
            </Text>
          ),
      },
      { key: 'policies', header: 'Pólizas', align: 'end', sortable: true },
      {
        key: 'premium',
        header: 'Prima anual',
        align: 'end',
        sortable: true,
        nulls: 'last',
        // Same precision as the drawer's summary, or the same customer prints two
        // different annual premiums one click apart.
        render: (r) => (
          <Money value={r.premium} currency="MXN" locale={LOCALE} minimumFractionDigits={2} />
        ),
      },
      {
        key: 'renewal',
        header: 'Próxima renovación',
        align: 'end',
        sortable: true,
        nulls: 'last',
        render: (r) => <DateText date={r.renewal} dateStyle="medium" locale={LOCALE} />,
      },
    ];

    return (
      <Container>
        <PageHeader
          eyebrow="Registros"
          title="Clientes"
          subtitle={
            <>
              <strong>2,201</strong> clientes · los registros de carrier duplicados se agrupan
            </>
          }
        />

        <DataTable
          columns={columns}
          data={CUSTOMERS}
          rowKey={(r) => r.id}
          onRowClick={(r) => setOpenId(r.id)}
          isRowSelected={(r) => r.id === openId}
          stickyHeader
          maxHeight="calc(100vh - 260px)"
        />

        <Drawer
          open={row != null}
          onClose={() => setOpenId(null)}
          width="480px"
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          eyebrow="Cliente"
          title={row?.name}
          closeLabel="Cerrar"
          expandLabel="Ampliar panel"
          collapseLabel="Reducir panel"
          meta={
            <>
              {/* A Mexican RFC is 12 characters for a company, 13 for a person. */}
              {row?.rfc != null && <Badge>{row.rfc.length === 12 ? 'Persona moral' : 'Persona física'}</Badge>}
              {row?.rfc != null ? (
                <Button variant="ghost" size="xs" onClick={() => copyRfc(row.rfc as string)} aria-live="polite">
                  {copied ? 'Copiado' : row.rfc}
                  {COPY_GLYPH}
                </Button>
              ) : (
                <Text as="span" size="sm" tone="faint">
                  Sin RFC
                </Text>
              )}
              <span>
                Actualizado <RelativeTime date={CUSTOMER_UPDATED} now={NOW} locale={LOCALE} />
              </span>
            </>
          }
          footer={
            <Button variant="secondary" size="sm" onClick={askAboutCustomer}>
              Preguntar sobre este cliente
            </Button>
          }
          aside={
            <Section title="Actividad del cliente" count={activity.length}>
              <Feed
                items={activity}
                groupBy="day"
                locale={LOCALE}
                now={NOW}
                ariaLabel="Actividad del cliente"
                empty="Sin actividad."
                compose={
                  <Composer
                    size="sm"
                    inputRef={composerRef}
                    placeholder="Agregar un comentario…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onSubmit={postComment}
                    submitDisabled={comment.trim() === ''}
                    submitLabel="Publicar comentario"
                  />
                }
              />
            </Section>
          }
        >
          <Section title="Resumen de cartera">
            <DescriptionList columns={2}>
              <DescriptionItem label="Prima anual" value={mxn(ANNUAL_PREMIUM)} />
              <DescriptionItem label="Pólizas" value={`${POLICIES.length} activa`} />
              <DescriptionItem
                label="Próxima renovación"
                value={
                  <>
                    {fecha(RENEWAL)} · {CARRIERS[0]}
                  </>
                }
              />
              <DescriptionItem
                label="Recibos pendientes"
                value={
                  <>
                    {PENDING.length} · {mxn(PENDING_TOTAL)}
                  </>
                }
              />
              <DescriptionItem label="Aseguradoras" value={CARRIERS.join(' · ')} />
              <DescriptionItem label="Cliente desde" value={fecha(SINCE)} />
            </DescriptionList>
          </Section>

          <Section
            title="Documentos"
            count={documents.length > 0 ? documents.length : undefined}
            action={
              <SectionLink
                glyph="none"
                onClick={addDocument}
                disabled={documents.length === DOCUMENT_QUEUE.length}
              >
                Agregar documento
              </SectionLink>
            }
            empty="Sin documentos."
            flush
          >
            {documents.length > 0 && (
              <List variant="divided" size="sm">
                {documents.map((d) => (
                  <ListItem key={d.id} href="#documento" primary={d.name} secondary={d.meta} />
                ))}
              </List>
            )}
          </Section>

          {/* No count here: 1 + 3 is already stated by the two sub-heads below. */}
          <Section title="Entidades relacionadas">
            <Section
              tier="sub"
              title="Pólizas"
              count={POLICIES.length}
              action={<SectionLink href="#polizas">Ver en Pólizas</SectionLink>}
              flush
            >
              <List variant="divided" size="sm">
                {POLICIES.map((p) => (
                  <ListItem
                    key={p.id}
                    href="#poliza"
                    primary={p.carrier}
                    meta={p.number}
                    secondary={
                      <>
                        {mxn(p.premium)} · {p.term}
                      </>
                    }
                    trailing={<StatusPill status="ok" label="Activa" />}
                  />
                ))}
              </List>
            </Section>

            <Section
              tier="sub"
              title="Recibos"
              count={RECEIPTS.length}
              action={<SectionLink href="#recibos">Ver en Recibos</SectionLink>}
              flush
            >
              <List variant="divided" size="sm">
                {/* Folio as the headline, amount in the trailing value slot. Leading
                  * with the amount made the uncaptured receipt's headline an em dash —
                  * a row that reads as broken — and .he-list__primary's 8ch floor then
                  * stepped its folio 19px out of line with the two rows above it. */}
                {RECEIPTS.map((r) => (
                  <ListItem
                    key={r.id}
                    href="#recibo"
                    primary={r.number}
                    secondary={<>Vence {fecha(r.due)}</>}
                    value={mxn(r.amount)}
                    trailing={<StatusPill status={r.status} label={r.label} />}
                  />
                ))}
              </List>
            </Section>

            <Text size="caption" tone="faint">
              Las comisiones y los endosos viven dentro de cada póliza.
            </Text>
          </Section>
        </Drawer>
      </Container>
    );
  },
};
