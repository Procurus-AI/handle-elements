import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { DescriptionItem, DescriptionList } from '../DescriptionList/DescriptionList';
import { Divider, Stack } from '../Layout/Layout';
import { Text } from '../Text/Text';
import { EvidencePreview } from './EvidencePreview';

const meta = {
  title: 'Elements/Evidence Preview',
  component: EvidencePreview,
  args: {
    title: 'DOC-20260221-WA0027.pdf',
    meta: 'INE · WhatsApp · página 1 de 2',
    caption: 'Archivo original recibido el 21 feb 2026. La evidencia no ha sido modificada.',
    pagePadding: 'lg',
    children: 'Document evidence',
  },
  argTypes: {
    pagePadding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof EvidencePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

function MockIdentityDocument() {
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Text size="caption" mono tone="faint">INSTITUTO NACIONAL ELECTORAL</Text>
        <Text size="heading" weight="medium">Credencial para votar</Text>
        <Badge tone="neutral">Muestra de evidencia</Badge>
      </Stack>
      <Divider />
      <DescriptionList>
        <DescriptionItem label="Nombre" value="Rafael Alvarez Ballesteros" wide />
        <DescriptionItem label="CURP" value="AABR980618HVZLLF06" />
        <DescriptionItem label="Clave elector" value="ALBLRF98061830H400" />
        <DescriptionItem label="Vigencia" value="2020–2030" />
        <DescriptionItem label="Sección" value="1842" />
      </DescriptionList>
      <Divider />
      <Text size="sm" tone="dim">
        Esta representación demuestra que el visor acepta cualquier contenido; la lectura y validación pertenecen al consumidor.
      </Text>
    </Stack>
  );
}

export const Document: Story = {
  render: (args) => (
    <div style={{ maxWidth: 980 }}>
      <EvidencePreview
        {...args}
        toolbar={
          <>
            <Button variant="ghost" size="icon-xs" aria-label="Alejar">−</Button>
            <Text as="span" size="caption" mono tone="dim">100%</Text>
            <Button variant="ghost" size="icon-xs" aria-label="Acercar">+</Button>
          </>
        }
        toolbarLabel="Controles del documento"
        actions={<Button variant="ghost" size="sm">Abrir original</Button>}
        documentLabel="Vista previa de la INE"
      >
        <MockIdentityDocument />
      </EvidencePreview>
    </div>
  ),
};

export const EvidenceOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <EvidencePreview
        title="Recorte OCR · Vigencia"
        meta="Página 1 · confianza 92%"
        pageWidth={520}
        pagePadding="md"
        documentLabel="Recorte del campo vigencia"
      >
        <Stack gap={3}>
          <Text size="caption" mono tone="faint">VIGENCIA</Text>
          <Text size="heading" weight="medium">2020–2030</Text>
          <Text size="sm" tone="dim">Texto extraído de la esquina inferior derecha.</Text>
        </Stack>
      </EvidencePreview>
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <EvidencePreview
        title="DOC-20260221-WA0027.pdf"
        meta="INE · 1 problema"
        actions={<Button variant="ghost" size="xs">Abrir</Button>}
        toolbar={
          <>
            <Button variant="ghost" size="icon-xs" aria-label="Página anterior">←</Button>
            <Text as="span" size="caption" mono tone="dim">1 / 2</Text>
            <Button variant="ghost" size="icon-xs" aria-label="Página siguiente">→</Button>
          </>
        }
        toolbarLabel="Navegación de páginas"
        pagePadding="md"
      >
        <MockIdentityDocument />
      </EvidencePreview>
    </div>
  ),
};
