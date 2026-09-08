import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Stack } from '../Layout/Layout';
import { StatusPill } from '../StatusPill/StatusPill';
import { Text } from '../Text/Text';
import {
  ActivityTrail,
  AgentEvidenceDisclosure,
  AgentEvidenceItem,
  AgentResponse,
  FindingItem,
  FindingList,
} from './AgentResponse';

const meta = {
  title: 'Elements/Agent Response',
  component: AgentResponse,
  args: {
    agent: 'Handle',
    meta: 'revisó el expediente · hace 2 min',
    title: 'Todavía no está listo para enviarse',
    summary:
      'El expediente está completo, pero la vigencia de la INE necesita confirmarse antes de marcarlo como verificado.',
  },
} satisfies Meta<typeof AgentResponse>;

export default meta;
type Story = StoryObj<typeof meta>;

const activity = [
  { id: 'documents', label: 'Revisé 4 documentos' },
  { id: 'alerts', label: 'Encontré 3 alertas' },
  { id: 'compare', label: 'Comparé CURP e INE' },
  { id: 'fix', label: 'Preparé una corrección' },
];

const handleMark = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 1.7c.3 3.5 2.1 5.3 5.5 5.8-3.4.4-5.2 2.3-5.5 5.8-.4-3.5-2.2-5.4-5.5-5.8 3.3-.5 5.1-2.3 5.5-5.8Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

/** Natural-language activity treatment for compact agent docks. */
export const StatusActivity: Story = {
  render: () => (
    <ActivityTrail
      variant="status"
      icon={handleMark}
      label="Handle"
      steps={activity.slice(0, 3)}
    />
  ),
};

export const Decision: Story = {
  render: (args) => (
    <div style={{ maxWidth: 760 }}>
      <AgentResponse
        {...args}
        note="La conclusión se basa en la última extracción OCR disponible."
        footer={
          <>
            <Button>Reanalizar documentos</Button>
            <Button variant="ghost">Ver evidencia</Button>
          </>
        }
      >
        <FindingList label="Qué encontré">
          <FindingItem
            tone="error"
            statusLabel="Requiere decisión humana"
            title="La vigencia de la INE necesita confirmación"
            detail="La fecha extraída no pudo contrastarse con una referencia confiable."
            trailing={<Button variant="ghost" size="xs">Revisar INE</Button>}
          />
          <FindingItem
            tone="warn"
            statusLabel="El agente necesita revisar"
            title="3 campos no pudieron validarse"
            detail="Handle puede intentar una extracción nueva antes de pedir intervención."
          />
          <FindingItem
            tone="ok"
            statusLabel="Resuelto"
            title="4 de 4 documentos recibidos"
            trailing={<StatusPill status="ok" appearance="soft" label="Completo" />}
          />
        </FindingList>
        <ActivityTrail label="Actividad de Handle" steps={activity} />
      </AgentResponse>
    </div>
  ),
};

export const FourUniversalTones: Story = {
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <FindingList label="Estados universales">
        <FindingItem tone="ok" statusLabel="Resuelto" title="Documento verificado" detail="No necesita otra acción." />
        <FindingItem tone="warn" statusLabel="El agente necesita revisar" title="Extracción con baja confianza" detail="Handle volverá a analizar la imagen." />
        <FindingItem tone="error" statusLabel="Requiere decisión humana" title="Los nombres no coinciden" detail="Confirma qué fuente debe prevalecer." />
        <FindingItem tone="neutral" statusLabel="Informativo" title="Archivo recibido por WhatsApp" detail="PDF de dos páginas · hace 8 min." />
      </FindingList>
    </div>
  ),
};

export const Compact: Story = {
  render: (args) => (
    <div style={{ maxWidth: 390 }}>
      <AgentResponse
        {...args}
        headingAs="h1"
        footer={<Button>Revisar INE</Button>}
      >
        <FindingList label="Qué encontré">
          <FindingItem
            tone="error"
            statusLabel="Requiere decisión humana"
            title="La vigencia necesita confirmación"
            trailing={<Button variant="ghost" size="xs">Abrir</Button>}
          />
        </FindingList>
        <ActivityTrail label="Handle" steps={activity.slice(0, 3)} />
      </AgentResponse>
    </div>
  ),
};

/** A persistent-workspace answer with one finding surface and a full-width next step. */
export const CompactDecision: Story = {
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <AgentResponse
        density="compact"
        agent="Handle"
        meta="reviewed 4 documents · 2 min ago"
        title="One confirmation is needed before sending"
        summary="The identity data is consistent; only the INE validity could not be confirmed."
        footer={
          <Card variant="soft" padding="sm">
            <Stack direction="row" gap={3} align="center" justify="between" wrap>
              <Stack gap={1}>
                <Text as="span" size="caption" mono tone="faint">HANDLE RECOMMENDS</Text>
                <Text as="span" weight="medium">Review the INE validity</Text>
              </Stack>
              <Button size="sm">Review validity</Button>
            </Stack>
          </Card>
        }
      >
        <FindingList density="compact" label="What I found">
          <FindingItem
            tone="error"
            statusLabel="Human decision"
            title="Validity · 2020–2030"
            detail="There is no reference date to compare it with."
          />
          <FindingItem
            tone="ok"
            statusLabel="Resolved"
            title="7 remaining checks passed"
          />
        </FindingList>
      </AgentResponse>
    </div>
  ),
};

/** Verifiable facts and source actions — never a transcript of model reasoning. */
export const VerifiableEvidence: Story = {
  render: (args) => (
    <div style={{ maxWidth: 680 }}>
      <AgentResponse {...args}>
        <FindingList density="compact" label="Qué encontré">
          <FindingItem
            tone="error"
            statusLabel="Necesita tu decisión"
            title="La vigencia de la INE no tiene una fecha de referencia"
            detail="El resto de los datos de identidad es consistente."
          />
        </FindingList>
        <AgentEvidenceDisclosure description="Comprobaciones y fuentes utilizadas para sustentar esta conclusión.">
          <AgentEvidenceItem
            citation={
              <Button variant="link" size="xs" onClick={() => {}}>
                INE · pág. 1
              </Button>
            }
          >
            La INE contiene el rango “2020–2030”, pero no una fecha exacta que pueda contrastarse.
          </AgentEvidenceItem>
          <AgentEvidenceItem
            citation={
              <Button variant="link" size="xs" onClick={() => {}}>
                CURP
              </Button>
            }
          >
            Nombre, CURP y clave de elector coinciden entre los documentos recibidos.
          </AgentEvidenceItem>
          <AgentEvidenceItem
            citation={
              <Button variant="link" size="xs" onClick={() => {}}>
                Expediente
              </Button>
            }
          >
            Los cuatro documentos obligatorios están presentes.
          </AgentEvidenceItem>
        </AgentEvidenceDisclosure>
      </AgentResponse>
    </div>
  ),
};
