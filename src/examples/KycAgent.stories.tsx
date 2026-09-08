import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';

import {
  ActivityTrail,
  type ActivityTrailStep,
  AgentEvidenceDisclosure,
  AgentEvidenceItem,
  AgentResponse,
  FindingItem,
  FindingList,
} from '../components/AgentResponse/AgentResponse';
import { AgentWorkspace } from '../components/AgentWorkspace/AgentWorkspace';
import { Avatar } from '../components/Avatar/Avatar';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Composer, type ComposerSuggestion } from '../components/Composer/Composer';
import {
  DataTable,
  TableCell,
  type DataTableColumn,
  type DataTableSort,
} from '../components/DataTable/DataTable';
import { DescriptionItem, DescriptionList } from '../components/DescriptionList/DescriptionList';
import { EvidencePreview } from '../components/EvidencePreview/EvidencePreview';
import { Container, Divider, Grid, Stack } from '../components/Layout/Layout';
import { List, ListItem, type ListItemStatus } from '../components/List/List';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { ReviewConclusion, ReviewWorkspace } from '../components/ReviewWorkspace/ReviewWorkspace';
import { Section } from '../components/Section/Section';
import {
  Sidebar,
  SidebarFooterItem,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
} from '../components/Sidebar/Sidebar';
import { StatusPill } from '../components/StatusPill/StatusPill';
import { Tabs } from '../components/Tabs/Tabs';
import { Text } from '../components/Text/Text';

const meta = {
  title: 'Examples/KYC Agent',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type View = 'inbox' | 'summary' | 'documents';
type GlyphName =
  | 'arrow-left'
  | 'case'
  | 'check'
  | 'chevron'
  | 'document'
  | 'home'
  | 'more'
  | 'person'
  | 'plus'
  | 'shield'
  | 'spark';

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.45,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function Glyph({ name, size = 15 }: { name: GlyphName; size?: number }) {
  const paths: Record<GlyphName, ReactNode> = {
    'arrow-left': <path d="M12.2 7.5H2.8M6.2 3.9 2.6 7.5l3.6 3.6" {...stroke} />,
    case: (
      <>
        <rect x="2" y="3.4" width="11" height="9" rx="2" {...stroke} />
        <path d="M5.4 3.4V2.2h4.2v1.2M2 7h11" {...stroke} />
      </>
    ),
    check: <path d="m2.8 7.7 3 3 6.5-6.5" {...stroke} />,
    chevron: <path d="m5.7 3.6 3.9 3.9-3.9 3.9" {...stroke} />,
    document: (
      <>
        <path d="M3 1.8h5.8L12 5v8.2H3z" {...stroke} />
        <path d="M8.8 1.8V5H12M5.2 8h4.6M5.2 10.5h3.3" {...stroke} />
      </>
    ),
    home: (
      <>
        <path d="m2 6.5 5.5-4.4L13 6.5v6H2z" {...stroke} />
        <path d="M5.7 12.5V8.3h3.6v4.2" {...stroke} />
      </>
    ),
    more: (
      <>
        <circle cx="3.3" cy="7.5" r=".8" fill="currentColor" />
        <circle cx="7.5" cy="7.5" r=".8" fill="currentColor" />
        <circle cx="11.7" cy="7.5" r=".8" fill="currentColor" />
      </>
    ),
    person: (
      <>
        <circle cx="7.5" cy="5" r="2.6" {...stroke} />
        <path d="M2.7 12.7c.3-2.4 2.2-3.8 4.8-3.8s4.5 1.4 4.8 3.8" {...stroke} />
      </>
    ),
    plus: (
      <>
        <circle cx="7.5" cy="7.5" r="5.8" {...stroke} />
        <path d="M7.5 4.8v5.4M4.8 7.5h5.4" {...stroke} />
      </>
    ),
    shield: (
      <>
        <path d="M7.5 1.7 12 3.4v3.8c0 2.8-1.9 4.6-4.5 5.7C4.9 11.8 3 10 3 7.2V3.4z" {...stroke} />
        <path d="m5.3 7.3 1.4 1.4 3-3" {...stroke} />
      </>
    ),
    spark: <path d="M7.5 1.7c.3 3.5 2.1 5.3 5.5 5.8-3.4.4-5.2 2.3-5.5 5.8-.4-3.5-2.2-5.4-5.5-5.8 3.3-.5 5.1-2.3 5.5-5.8Z" {...stroke} />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" aria-hidden>
      {paths[name]}
    </svg>
  );
}

function HandleBrand() {
  return (
    <Stack direction="row" gap={2} align="center">
      <Glyph name="spark" size={19} />
      <Text as="span" size="heading" weight="medium">handle</Text>
    </Stack>
  );
}

const DOCUMENTS = [
  {
    id: 'ine',
    file: 'DOC-20260221-WA0027.pdf',
    name: 'INE',
    channel: 'WhatsApp · página 1 de 1',
    confidence: 92,
    issues: 1,
    owner: 'RAFAEL ALVAREZ BALLESTEROS',
    reference: 'AABR980618HVZLLF06',
    secondary: 'ALBLRF98061830H400',
    date: '2020 – 2030',
  },
  {
    id: 'curp',
    file: 'DOC-20260221-WA0029.pdf',
    name: 'CURP',
    channel: 'WhatsApp · página 1 de 1',
    confidence: 99,
    issues: 0,
    owner: 'RAFAEL ALVAREZ BALLESTEROS',
    reference: 'AABR980618HVZLLF06',
    secondary: 'Verificado con RENAPO',
    date: '18 JUN 1998',
  },
  {
    id: 'address',
    file: 'DOC-20260221-WA0030.pdf',
    name: 'Comprobante de domicilio',
    channel: 'WhatsApp · página 1 de 2',
    confidence: 96,
    issues: 0,
    owner: 'RAFAEL ALVAREZ BALLESTEROS',
    reference: 'Av. Fundidora 501, Monterrey',
    secondary: 'CFE · 0088127601',
    date: '21 AGO 2026',
  },
  {
    id: 'tax',
    file: 'DOC-20260221-WA0028.pdf',
    name: 'Constancia fiscal',
    channel: 'WhatsApp · página 1 de 3',
    confidence: 94,
    issues: 0,
    owner: 'RAFAEL ALVAREZ BALLESTEROS',
    reference: 'AABR9806189Q3',
    secondary: 'Persona física',
    date: '03 SEP 2026',
  },
] as const;

type DocumentRecord = (typeof DOCUMENTS)[number];

const COMMANDS: Record<View, ComposerSuggestion[]> = {
  inbox: [
    { id: 'review', label: 'Revisa los documentos' },
    { id: 'need', label: '¿Qué necesita de mí?' },
    { id: 'request', label: 'Pide el documento faltante' },
  ],
  summary: [
    { id: 'why', label: '¿Por qué está bloqueado?' },
    { id: 'review', label: 'Revisa los documentos' },
    { id: 'validity', label: 'Compara la vigencia' },
  ],
  documents: [
    { id: 'explain', label: 'Explica esta alerta' },
    { id: 'original', label: 'Abre el original' },
    { id: 'reanalyze', label: 'Reanaliza la INE' },
  ],
};

const TRAILS: Record<View, ActivityTrailStep[]> = {
  inbox: [
    { id: 'reviewed', label: 'revisó 6 expedientes' },
    { id: 'prioritized', label: 'priorizó 2 decisiones' },
    { id: 'working', label: 'mantiene 4 en curso' },
  ],
  summary: [
    { id: 'read', label: 'revisó 4 documentos' },
    { id: 'found', label: 'aisló 1 excepción' },
    { id: 'blocked', label: 'detuvo el envío' },
  ],
  documents: [
    { id: 'read', label: 'leyó la INE' },
    { id: 'compared', label: 'comparó 4 campos' },
    { id: 'isolated', label: 'aisló 1 excepción' },
  ],
};

function KycSidebar({
  view,
  onNavigate,
  onStartCommand,
}: {
  view: View;
  onNavigate: (view: View) => void;
  onStartCommand: (command: string) => void;
}) {
  return (
    <Sidebar
      as="nav"
      width="224px"
      aria-label="Navegación principal"
      footer={
        <SidebarFooterItem label="Alfonso de los Ríos" sublabel="Handle" />
      }
    >
      <SidebarHeader>
        <HandleBrand />
      </SidebarHeader>

      <SidebarItem
        icon={<Glyph name="home" />}
        label="Inicio"
        onClick={() => onNavigate('inbox')}
      />

      <SidebarSection label="Agentes" collapsible={false}>
        <SidebarItem
          icon={<Glyph name="shield" />}
          label="KYC / Artículo 492"
          active
          onClick={() => onNavigate('inbox')}
        />
        <SidebarItem icon={<Glyph name="document" />} label="Cotización" disabled />
        <SidebarItem icon={<Glyph name="check" />} label="Validador de pagos" disabled />
        <SidebarItem icon={<Glyph name="case" />} label="Conciliación" disabled />
      </SidebarSection>

      <SidebarSection label="Más agentes" defaultOpen={false}>
        <SidebarItem icon={<Glyph name="document" />} label="Siniestros" disabled />
        <SidebarItem icon={<Glyph name="person" />} label="Feedback" disabled />
        <SidebarItem icon={<Glyph name="case" />} label="Recepción documental" disabled />
      </SidebarSection>

      <SidebarSection
        label="Expedientes"
        collapsible={false}
        actionVisibility="always"
        action={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Nuevo expediente"
            onClick={() => onStartCommand('Inicia un expediente KYC nuevo')}
          >
            <Glyph name="plus" />
          </Button>
        }
      >
        <SidebarItem
          icon={<Glyph name="person" />}
          label="Rafael Alvarez"
          end="1 alerta"
          revealEndOnHover
          active={view !== 'inbox'}
          onClick={() => onNavigate('summary')}
        />
        <SidebarItem
          icon={<Glyph name="person" />}
          label="Juan Pablo Ramos"
          end="Falta INE"
          revealEndOnHover
          onClick={() => onStartCommand('Muéstrame el expediente de Juan Pablo Ramos')}
        />
      </SidebarSection>
    </Sidebar>
  );
}

function WorkspaceTopbar() {
  return (
    <Stack direction="row" gap={3} align="center" justify="between">
      <Stack direction="row" gap={2} align="center">
        <Glyph name="spark" size={17} />
        <Text as="span" size="sm" weight="medium">Perlita</Text>
      </Stack>
      <StatusPill status="neutral" appearance="soft" label="En marcha" />
    </Stack>
  );
}

interface RecordHeaderProps {
  view: Extract<View, 'summary' | 'documents'>;
  resolved: boolean;
  onNavigate: (view: View) => void;
}

function RecordHeader({ view, resolved, onNavigate }: RecordHeaderProps) {
  return (
    <Stack gap={2}>
      <Grid columns="auto minmax(0, 1fr)" gap={4} align="center">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Volver al inbox"
          onClick={() => onNavigate('inbox')}
        >
          <Glyph name="arrow-left" />
        </Button>
        <PageHeader
          size="compact"
          divider={false}
          eyebrow="Expediente KYC · Artículo 492"
          title="Rafael Alvarez Ballesteros"
          subtitle="Revisado por Perlita · perlita@kyc.run"
          aside={
            <StatusPill
              status={resolved ? 'ok' : 'error'}
              appearance="soft"
              label={resolved ? 'Listo para continuar' : 'Necesita tu decisión'}
            />
          }
        />
      </Grid>
      <Tabs
        size="sm"
        value={view}
        onChange={(next) => onNavigate(next as View)}
        items={[
          { value: 'summary', label: 'Resumen' },
          { value: 'documents', label: 'Documentos', count: 4 },
        ]}
      />
    </Stack>
  );
}

interface CommandDockProps {
  view: View;
  value: string;
  lastCommand?: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

function CommandDock({
  view,
  value,
  lastCommand,
  inputRef,
  onValueChange,
  onSubmit,
}: CommandDockProps) {
  const steps = lastCommand
    ? [
        ...TRAILS[view],
        {
          id: 'command',
          label: `${lastCommand.trim().startsWith('¿') ? 'respondió a' : 'ejecutó'} “${lastCommand}”`,
        },
      ]
    : TRAILS[view];

  return (
    <Composer
      variant="dock"
      size="sm"
      inputRef={inputRef}
      value={value}
      onChange={(event) => onValueChange(event.currentTarget.value)}
      onSubmit={onSubmit}
      submitDisabled={!value.trim()}
      submitLabel="Enviar a Handle"
      aria-label="Comandos para Handle"
      placeholder="Pregúntale a Handle o indica qué hacer…"
      activity={
        view !== 'summary' || lastCommand ? (
          <ActivityTrail
            variant="status"
            icon={<Glyph name="spark" size={13} />}
            label="Handle"
            steps={view === 'summary' ? steps.slice(-1) : steps}
          />
        ) : undefined
      }
      suggestions={COMMANDS[view]}
      suggestionsLabel="Acciones sugeridas"
      onSuggestionSelect={(suggestion) => {
        onValueChange(String(suggestion.label));
        inputRef.current?.focus();
      }}
      align="center"
      maxWidth={760}
    />
  );
}

interface InboxViewProps {
  resolved: boolean;
  onNavigate: (view: View) => void;
  onStartCommand: (command: string) => void;
}

function InboxView({ resolved, onNavigate, onStartCommand }: InboxViewProps) {
  type QueueFilter = 'all' | 'attention' | 'moving';
  type QueueTone = 'ok' | 'warn' | 'error' | 'neutral';
  interface QueueRow {
    id: string;
    subject: string;
    updated: string;
    title: string;
    description: string;
    impactRank: number;
    tone: QueueTone;
    status: string;
    documents: string;
    documentsReceived: number;
    documentMeta: string;
    group: Exclude<QueueFilter, 'all'>;
    action?: string;
  }

  const [filter, setFilter] = useState<QueueFilter>('all');
  const rows: QueueRow[] = [
    {
      id: 'juan',
      subject: 'Juan Pablo Ramos',
      updated: 'Hace 6 días',
      title: 'Falta un documento obligatorio',
      description: 'No recibimos la INE; Handle ya preparó la solicitud.',
      impactRank: 100,
      tone: 'error',
      status: 'Necesita de ti',
      documents: '0 de 4',
      documentsReceived: 0,
      documentMeta: 'INE pendiente',
      group: 'attention',
      action: 'Solicitar INE',
    },
    {
      id: 'rafael',
      subject: 'Rafael Alvarez',
      updated: 'Hace 2 min',
      title: resolved ? 'Vigencia confirmada; listo para preparar' : 'La vigencia de la INE no pudo validarse',
      description: resolved
        ? 'Handle guardó la decisión junto con la evidencia.'
        : 'Los otros 12 controles ya están resueltos.',
      impactRank: resolved ? 55 : 90,
      tone: resolved ? 'ok' : 'error',
      status: resolved ? 'Resuelto' : 'Necesita de ti',
      documents: '4 de 4',
      documentsReceived: 4,
      documentMeta: resolved ? 'Verificados' : '1 excepción',
      group: resolved ? 'moving' : 'attention',
    },
    {
      id: 'camtom',
      subject: 'Camtom Technologies',
      updated: 'Hoy, 07:34',
      title: 'Paquete listo para enviar',
      description: 'Handle completó la validación sin excepciones.',
      impactRank: 50,
      tone: 'ok',
      status: 'Listo',
      documents: '4 de 4',
      documentsReceived: 4,
      documentMeta: 'Verificados',
      group: 'moving',
    },
    {
      id: 'raul',
      subject: 'Raúl García',
      updated: 'Ayer, 18:12',
      title: 'Esperando respuesta del cliente',
      description: 'Handle solicitó el comprobante de domicilio.',
      impactRank: 40,
      tone: 'neutral',
      status: 'Esperando',
      documents: '3 de 4',
      documentsReceived: 3,
      documentMeta: 'Seguimiento 1/3',
      group: 'moving',
    },
    {
      id: 'mariana',
      subject: 'Mariana Ortiz',
      updated: 'Ayer, 16:48',
      title: 'Analizando constancia fiscal',
      description: 'Handle está contrastando RFC y régimen fiscal.',
      impactRank: 30,
      tone: 'warn',
      status: 'Analizando',
      documents: '3 de 4',
      documentsReceived: 3,
      documentMeta: '12 controles',
      group: 'moving',
    },
    {
      id: 'diego',
      subject: 'Diego Salazar',
      updated: 'Ayer, 14:05',
      title: 'Esperando reemplazo de archivo',
      description: 'Handle pidió una copia legible del comprobante.',
      impactRank: 20,
      tone: 'neutral',
      status: 'Esperando',
      documents: '3 de 4',
      documentsReceived: 3,
      documentMeta: 'Seguimiento 2/3',
      group: 'moving',
    },
  ];

  const statusMap: Record<QueueTone, 'ok' | 'warn' | 'error' | 'neutral'> = {
    ok: 'ok',
    warn: 'warn',
    error: 'error',
    neutral: 'neutral',
  };
  const columns: DataTableColumn<QueueRow>[] = [
    {
      key: 'subject',
      header: 'Expediente',
      sortable: true,
      width: '20%',
      truncate: true,
      render: (row) => (
        <TableCell primary={row.subject} secondary={row.updated} />
      ),
    },
    {
      key: 'title',
      header: 'Lo que encontró Handle',
      sortable: true,
      sortValue: (row) => row.impactRank,
      width: '34%',
      truncate: true,
      render: (row) => (
        <TableCell
          primary={row.title}
          secondary={row.description}
        />
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '15%',
      render: (row) => (
        <StatusPill status={statusMap[row.tone]} appearance="soft" label={row.status} />
      ),
    },
    {
      key: 'documents',
      header: 'Documentos',
      sortable: true,
      sortValue: (row) => row.documentsReceived,
      width: '14%',
      render: (row) => (
        <TableCell primary={row.documents} secondary={row.documentMeta} mono />
      ),
    },
    {
      key: 'action',
      header: '',
      width: '17%',
      align: 'end',
      render: (row) =>
        row.action ? (
          <Button
            size="sm"
            onClick={() => {
              onStartCommand('Redacta la solicitud de INE para Juan Pablo Ramos');
            }}
          >
            {row.action}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Abrir expediente de ${row.subject}`}
            onClick={() => {
              row.id === 'rafael'
                ? onNavigate('summary')
                : onStartCommand(`Muéstrame el expediente de ${row.subject}`);
            }}
          >
            <Glyph name="chevron" />
          </Button>
        ),
    },
  ];

  const visibleRows = filter === 'all' ? rows : rows.filter((row) => row.group === filter);
  const attentionCount = rows.filter((row) => row.group === 'attention').length;
  const movingCount = rows.length - attentionCount;
  const [sort, setSort] = useState<DataTableSort | null>({ key: 'title', direction: 'desc' });
  const sortLabel =
    sort == null
      ? 'Orden original'
      : sort.key === 'subject'
        ? `Expediente ${sort.direction === 'asc' ? 'A–Z' : 'Z–A'}`
        : sort.key === 'status'
          ? `Estado ${sort.direction === 'asc' ? 'A–Z' : 'Z–A'}`
        : sort.key === 'documents'
          ? `Documentos ${sort.direction === 'asc' ? '↑' : '↓'}`
          : `Impacto ${sort.direction === 'asc' ? '↑' : '↓'}`;

  return (
    <Container max={960} padding={5}>
      <Stack gap={4}>
        <PageHeader
          size="compact"
          divider={false}
          eyebrow="Tu bandeja inteligente"
          title="KYC Agent / Perlita"
          subtitle="perlita@kyc.run"
          lede={
            resolved
              ? '1 expediente necesita de ti · Handle trabaja en 4 · 2 están listos para continuar.'
              : '2 expedientes necesitan de ti · Handle trabaja en 4 · 1 está listo para enviar.'
          }
          aside={
            <Button variant="secondary" onClick={() => onStartCommand('Inicia un expediente KYC nuevo')}>
              Nuevo expediente
            </Button>
          }
        />
        <DataTable
          caption="Expedientes del agente KYC"
          captionHidden
          columns={columns}
          data={visibleRows}
          rowKey={(row) => row.id}
          dense
          layout="fixed"
          minTableWidth={720}
          toolbar={
            <>
              <Tabs
                variant="pills"
                size="sm"
                value={filter}
                onChange={(next) => setFilter(next as QueueFilter)}
                items={[
                  { value: 'all', label: 'Todo', count: rows.length },
                  { value: 'attention', label: 'Necesitan de ti', count: attentionCount },
                  { value: 'moving', label: 'En movimiento', count: movingCount },
                ]}
              />
              <Text as="span" size="caption" tone="faint">
                Orden: {sortLabel}
              </Text>
            </>
          }
          sort={sort}
          onSortChange={setSort}
        />
      </Stack>
    </Container>
  );
}

interface SummaryViewProps {
  resolved: boolean;
  onNavigate: (view: View) => void;
  onReviewIne: () => void;
}

function SummaryView({ resolved, onNavigate, onReviewIne }: SummaryViewProps) {
  return (
    <Container max={780} padding={5}>
      <AgentResponse
        density="compact"
        headingAs="h1"
        agent="Handle"
        avatar={<Glyph name="spark" size={18} />}
        meta="revisó 4 documentos en 18 s · hace 2 min"
        title={resolved ? 'Confirmé la excepción. Ya puede continuar.' : 'Encontré una excepción antes de enviarlo.'}
        summary={
          resolved
            ? 'Guardé tu confirmación de vigencia junto con la evidencia. Las 13 comprobaciones del expediente ya pasaron.'
            : 'Revisé los cuatro documentos de Rafael. Nombre, CURP y clave coinciden; solo necesito que confirmes la vigencia de la INE.'
        }
        note={
          resolved
            ? 'El expediente y su historial de revisión están listos para preparar el paquete final.'
            : 'Detuve el envío automáticamente para que no tengas que revisar el resto del expediente.'
        }
        footer={
          <Card variant="soft" padding="sm" style={{ width: '100%' }}>
            <Stack direction="row" gap={4} align="center" justify="between" wrap>
              <Stack gap={1}>
                <Text as="span" size="caption" mono tone="faint">
                  LO QUE NECESITO DE TI
                </Text>
                <Text as="span" weight="medium">
                  {resolved ? 'Continuar con el paquete final' : 'Confirma la vigencia 2020–2030'}
                </Text>
                <Text as="span" size="sm" tone="dim">
                  {resolved ? 'No quedan excepciones abiertas.' : 'Es la única decisión pendiente.'}
                </Text>
              </Stack>
              <Button onClick={resolved ? () => onNavigate('inbox') : onReviewIne}>
                {resolved ? 'Continuar' : 'Confirmar vigencia'}
                <Glyph name="chevron" />
              </Button>
            </Stack>
          </Card>
        }
      >
        <Stack gap={4}>
          <ActivityTrail
            label="Lo que hice"
            steps={
              resolved
                ? [
                    { id: 'read', label: 'Leí 4 archivos' },
                    { id: 'checked', label: 'Comprobé 13 datos' },
                    { id: 'saved', label: 'Guardé tu decisión' },
                  ]
                : [
                    { id: 'read', label: 'Leí 4 archivos' },
                    { id: 'checked', label: 'Comprobé 13 datos' },
                    { id: 'isolated', label: 'Aislé 1 excepción' },
                    { id: 'stopped', label: 'Detuve el envío' },
                  ]
            }
          />
          <FindingList density="compact" label={resolved ? 'Resultado' : 'La excepción'}>
            <FindingItem
              tone={resolved ? 'ok' : 'error'}
              statusLabel={resolved ? 'Resuelto' : 'Decisión humana'}
              title={resolved ? 'INE · vigencia confirmada' : 'INE · vigencia sin referencia'}
              detail={
                resolved
                  ? 'Válida hasta 2030; la decisión quedó vinculada al archivo original.'
                  : 'El documento indica 2020–2030, pero no encontré una fecha contra la cual validarla.'
              }
              trailing={
                <Button variant="link" size="sm" onClick={onReviewIne}>
                  INE · pág. 1
                </Button>
              }
            />
            <FindingItem
              tone="ok"
              statusLabel="Resuelto"
              title={resolved ? '13 de 13 comprobaciones pasaron' : '12 de 13 comprobaciones pasaron'}
              detail="Nombre, CURP, clave de elector y cobertura documental están consistentes."
            />
          </FindingList>
          <AgentEvidenceDisclosure description="Hechos verificables y fuentes usadas para esta conclusión.">
            <AgentEvidenceItem
              citation={
                <Button variant="link" size="sm" onClick={onReviewIne}>
                  1 · INE, pág. 1
                </Button>
              }
            >
              Leí la vigencia 2020–2030 directamente en la credencial.
            </AgentEvidenceItem>
            <AgentEvidenceItem
              citation={
                <Button variant="link" size="sm" onClick={onReviewIne}>
                  2 · INE, pág. 1
                </Button>
              }
            >
              Contrasté nombre, CURP y clave de elector con el expediente.
            </AgentEvidenceItem>
            <AgentEvidenceItem
              citation={
                <Button variant="link" size="sm" onClick={onReviewIne}>
                  3 · Expediente
                </Button>
              }
            >
              No encontré una fecha de referencia con la cual validar la vigencia.
            </AgentEvidenceItem>
          </AgentEvidenceDisclosure>
        </Stack>
      </AgentResponse>
    </Container>
  );
}

function DocumentNavigation({
  selectedId,
  resolved,
  onSelect,
}: {
  selectedId: string;
  resolved: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Container padding={4}>
      <Section title="Documentos" count="4">
        <List variant="plain" size="sm" gutter>
          {DOCUMENTS.map((document) => (
            <ListItem
              key={document.id}
              primary={document.name}
              secondary={`${
                document.issues && !(document.id === 'ine' && resolved)
                  ? 'Necesita tu decisión · '
                  : ''
              }${document.file}`}
              status={
                document.issues && !(document.id === 'ine' && resolved)
                  ? ('error' as ListItemStatus)
                  : undefined
              }
              active={selectedId === document.id}
              onSelect={() => onSelect(document.id)}
            />
          ))}
        </List>
      </Section>
    </Container>
  );
}

/** A code-native facsimile: the viewer shows the source itself while the
 * inspector remains the only place that interprets it. */
function IneFacsimile({ resolved }: { resolved: boolean }) {
  return (
    <svg
      viewBox="0 0 760 470"
      width="100%"
      style={{ display: 'block', height: 'auto' }}
      role="img"
      aria-label="Vista de la credencial INE de Rafael Alvarez con la vigencia resaltada"
    >
      <rect width="760" height="470" fill="var(--he-surface)" />
      <rect width="760" height="76" fill="var(--he-surface-2)" />
      <path d="M42 38h18m-9-9v18" stroke="var(--he-text)" strokeWidth="2" strokeLinecap="round" />
      <text x="72" y="43" fill="var(--he-text)" fontFamily="var(--he-font-sans)" fontSize="17" fontWeight="600">
        INSTITUTO NACIONAL ELECTORAL
      </text>
      <text x="718" y="42" fill="var(--he-text-faint)" fontFamily="var(--he-font-mono)" fontSize="11" textAnchor="end">
        CREDENCIAL PARA VOTAR
      </text>

      <rect x="42" y="112" width="166" height="208" rx="10" fill="var(--he-neutral-bg)" />
      <circle cx="125" cy="177" r="38" fill="var(--he-border-strong)" />
      <path d="M71 287c5-52 28-78 54-78s49 26 54 78" fill="var(--he-border-strong)" />
      <rect x="58" y="337" width="134" height="8" rx="4" fill="var(--he-border)" />
      <rect x="75" y="357" width="100" height="7" rx="3.5" fill="var(--he-border)" />

      <text x="244" y="120" fill="var(--he-text-faint)" fontFamily="var(--he-font-mono)" fontSize="11" letterSpacing="2">
        NOMBRE
      </text>
      <text x="244" y="149" fill="var(--he-text)" fontFamily="var(--he-font-sans)" fontSize="22" fontWeight="600">
        ALVAREZ BALLESTEROS
      </text>
      <text x="244" y="176" fill="var(--he-text)" fontFamily="var(--he-font-sans)" fontSize="22" fontWeight="600">
        RAFAEL
      </text>

      <text x="244" y="221" fill="var(--he-text-faint)" fontFamily="var(--he-font-mono)" fontSize="11" letterSpacing="2">
        CURP
      </text>
      <text x="244" y="247" fill="var(--he-text)" fontFamily="var(--he-font-sans)" fontSize="17">
        AABR980618HVZLLF06
      </text>

      <text x="244" y="286" fill="var(--he-text-faint)" fontFamily="var(--he-font-mono)" fontSize="11" letterSpacing="2">
        CLAVE DE ELECTOR
      </text>
      <text x="244" y="312" fill="var(--he-text)" fontFamily="var(--he-font-sans)" fontSize="17">
        ALBLRF98061830H400
      </text>

      <rect
        x="463"
        y="340"
        width="247"
        height="76"
        rx="10"
        fill={resolved ? 'var(--he-ok-bg)' : 'var(--he-error-bg)'}
      />
      <circle cx="485" cy="363" r="4" fill={resolved ? 'var(--he-ok)' : 'var(--he-error)'} />
      <text
        x="499"
        y="367"
        fill={resolved ? 'var(--he-ok)' : 'var(--he-error)'}
        fontFamily="var(--he-font-mono)"
        fontSize="11"
        letterSpacing="1.4"
      >
        {resolved ? 'VIGENCIA CONFIRMADA' : 'VIGENCIA POR CONFIRMAR'}
      </text>
      <text x="484" y="399" fill="var(--he-text)" fontFamily="var(--he-font-sans)" fontSize="20" fontWeight="600">
        2020 – 2030
      </text>

      <g fill="var(--he-text)" opacity="0.78">
        <rect x="620" y="112" width="18" height="18" />
        <rect x="642" y="112" width="8" height="8" />
        <rect x="655" y="112" width="18" height="18" />
        <rect x="677" y="112" width="8" height="18" />
        <rect x="690" y="112" width="20" height="8" />
        <rect x="620" y="134" width="8" height="18" />
        <rect x="633" y="134" width="18" height="8" />
        <rect x="655" y="134" width="8" height="18" />
        <rect x="668" y="134" width="18" height="18" />
        <rect x="690" y="134" width="20" height="18" />
        <rect x="620" y="156" width="18" height="8" />
        <rect x="642" y="156" width="18" height="18" />
        <rect x="664" y="156" width="8" height="8" />
        <rect x="677" y="156" width="8" height="18" />
        <rect x="690" y="156" width="20" height="8" />
      </g>

      <path d="M42 438h668" stroke="var(--he-border)" />
      <text x="42" y="455" fill="var(--he-text-faint)" fontFamily="var(--he-font-mono)" fontSize="10" letterSpacing="1.2">
        MUESTRA DIGITAL · DATOS FICTICIOS PARA REVISIÓN
      </text>
    </svg>
  );
}

function DocumentArtifact({ document, resolved }: { document: DocumentRecord; resolved: boolean }) {
  return (
    <Stack gap={5}>
      <Stack direction="row" gap={4} align="center" justify="between">
        <Stack gap={1}>
          <Text as="span" size="caption" mono tone="faint">EVIDENCIA DIGITAL</Text>
          <Text as="span" size="heading" weight="medium">{document.name}</Text>
        </Stack>
        <Badge tone="accent">
          {document.id === 'ine' ? 'INE' : document.id === 'curp' ? 'CURP' : 'PDF'}
        </Badge>
      </Stack>
      <Divider />
      <Grid columns="72px minmax(0, 1fr)" gap={5} align="start">
        <Avatar name={document.owner} initials="RA" tone={0} size="lg" />
        <DescriptionList columns={1}>
          <DescriptionItem label="Titular" value={document.owner} />
          <DescriptionItem label={document.id === 'ine' ? 'CURP' : 'Referencia'} value={document.reference} />
        </DescriptionList>
      </Grid>
      <DescriptionList columns={2}>
        <DescriptionItem label={document.id === 'ine' ? 'Clave de elector' : 'Clasificación'} value={document.secondary} />
        <DescriptionItem label={document.id === 'ine' ? 'Vigencia' : 'Fecha del documento'} value={document.date} />
      </DescriptionList>
      {document.id === 'ine' && (
        <Card variant="soft" padding="sm">
          <Stack direction="row" gap={3} align="center" justify="between" wrap>
            <Text as="span" size="sm" weight="medium">Vigencia · 2020–2030</Text>
            <StatusPill
              status={resolved ? 'ok' : 'error'}
              appearance="soft"
              label={resolved ? 'Confirmada' : 'Por confirmar'}
            />
          </Stack>
        </Card>
      )}
      <Text size="caption" tone="faint" mono>FUENTE · {document.file}</Text>
    </Stack>
  );
}

function DocumentEvidence({ document, resolved }: { document: DocumentRecord; resolved: boolean }) {
  return (
    <Container id={`kyc-evidence-${document.id}`} max={760} padding={4}>
      <EvidencePreview
        title={`${document.name} · archivo original`}
        meta={document.channel}
        pagePadding={document.id === 'ine' ? 'none' : 'lg'}
      >
        {document.id === 'ine' ? (
          <IneFacsimile resolved={resolved} />
        ) : (
          <DocumentArtifact document={document} resolved={resolved} />
        )}
      </EvidencePreview>
    </Container>
  );
}

interface DocumentInspectorProps {
  document: DocumentRecord;
  resolved: boolean;
  onResolve: () => void;
  onShowEvidence: () => void;
  onNavigate: (view: View) => void;
}

function DocumentInspector({
  document,
  resolved,
  onResolve,
  onShowEvidence,
  onNavigate,
}: DocumentInspectorProps) {
  const issue = document.id === 'ine' && !resolved;
  const facts =
    document.id === 'ine'
      ? [
          { id: 'validity', label: 'Vigencia', value: '2020 – 2030' },
          {
            id: 'reference',
            label: 'Referencia',
            value: issue ? 'No disponible' : 'Confirmada',
          },
          { id: 'checks', label: 'Otros campos', value: '3 verificados' },
          {
            id: 'source',
            label: 'Fuente',
            value: (
              <Button variant="link" size="xs" onClick={onShowEvidence}>
                INE · pág. 1
              </Button>
            ),
          },
        ]
      : [
          { id: 'owner', label: 'Titular', value: document.owner },
          { id: 'reference', label: 'Referencia', value: document.reference },
          { id: 'date', label: 'Fecha', value: document.date },
          { id: 'checks', label: 'Estado', value: 'Verificado' },
        ];

  return (
    <ReviewConclusion
      eyebrow="Conclusión de Handle"
      title={`${document.name} identificada`}
      meta={`${document.confidence}% de confianza · ${issue ? 'Necesita tu decisión' : 'Verificado'}`}
      summary={
        issue
          ? 'No hay una fecha de referencia confiable para validar la vigencia extraída.'
          : 'Handle clasificó el documento y no encontró excepciones pendientes.'
      }
      primaryAction={
        issue ? (
          <Button onClick={onResolve}>Confirmar vigencia</Button>
        ) : (
          <Button variant="secondary" onClick={() => onNavigate('summary')}>
            Volver al resumen
          </Button>
        )
      }
      facts={facts}
      factsLabel="Datos usados para la conclusión"
    />
  );
}

interface DocumentsViewProps {
  selectedDocument: string;
  resolved: boolean;
  onSelectDocument: (id: string) => void;
  onResolve: () => void;
  onNavigate: (view: View) => void;
}

function DocumentsView({
  selectedDocument,
  resolved,
  onSelectDocument,
  onResolve,
  onNavigate,
}: DocumentsViewProps) {
  const document = DOCUMENTS.find((item) => item.id === selectedDocument) ?? DOCUMENTS[0];

  return (
    <ReviewWorkspace
      variant="contained"
      navigationLabel="Lista de documentos"
      documentLabel="Evidencia seleccionada"
      inspectorLabel="Conclusiones de Handle"
      navigation={
        <DocumentNavigation selectedId={document.id} resolved={resolved} onSelect={onSelectDocument} />
      }
      inspector={
        <DocumentInspector
          document={document}
          resolved={resolved}
          onResolve={onResolve}
          onShowEvidence={() =>
            globalThis.document
              .getElementById(`kyc-evidence-${document.id}`)
              ?.scrollIntoView({ block: 'start' })
          }
          onNavigate={onNavigate}
        />
      }
    >
      <DocumentEvidence document={document} resolved={resolved} />
    </ReviewWorkspace>
  );
}

function KycAgentExperience({ initialView }: { initialView: View }) {
  const [view, setView] = useState<View>(initialView);
  const [selectedDocument, setSelectedDocument] = useState('ine');
  const [resolved, setResolved] = useState(false);
  const [command, setCommand] = useState('');
  const [lastCommand, setLastCommand] = useState<string>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startCommand = (nextCommand: string) => {
    setCommand(nextCommand);
    requestAnimationFrame(() => requestAnimationFrame(() => inputRef.current?.focus()));
  };

  const submitCommand = () => {
    const next = command.trim();
    if (!next) return;
    setLastCommand(next);
    setCommand('');
  };

  const header =
    view === 'inbox' ? (
      <WorkspaceTopbar />
    ) : (
      <RecordHeader view={view} resolved={resolved} onNavigate={setView} />
    );

  return (
    <AgentWorkspace
      navigation={<KycSidebar view={view} onNavigate={setView} onStartCommand={startCommand} />}
      header={header}
      mobileNavigationLabel="Abrir navegación"
      mobileNavigationCloseLabel="Cerrar navegación"
      mainLabel={
        view === 'inbox'
          ? 'Inbox del Agente KYC'
          : view === 'summary'
            ? 'Resumen del expediente'
            : 'Revisión de documentos'
      }
      composer={
        <CommandDock
          view={view}
          value={command}
          lastCommand={lastCommand}
          inputRef={inputRef}
          onValueChange={setCommand}
          onSubmit={submitCommand}
        />
      }
    >
      {view === 'inbox' ? (
        <InboxView resolved={resolved} onNavigate={setView} onStartCommand={startCommand} />
      ) : view === 'summary' ? (
        <SummaryView
          resolved={resolved}
          onNavigate={setView}
          onReviewIne={() => {
            setSelectedDocument('ine');
            setView('documents');
          }}
        />
      ) : (
        <DocumentsView
          selectedDocument={selectedDocument}
          resolved={resolved}
          onSelectDocument={setSelectedDocument}
          onResolve={() => setResolved(true)}
          onNavigate={setView}
        />
      )}
    </AgentWorkspace>
  );
}

export const IntelligentInbox: Story = {
  name: '01 · Inbox inteligente',
  render: () => <KycAgentExperience initialView="inbox" />,
};

export const AgentSummary: Story = {
  name: '02 · Respuesta del agente',
  render: () => <KycAgentExperience initialView="summary" />,
};

export const DocumentReview: Story = {
  name: '03 · Revisión documental',
  render: () => <KycAgentExperience initialView="documents" />,
};
