/* Fixtures for the Pages stories. Invented Spanish data only: no real customers, policies or
 * receipt numbers. Data only: JSX lives in shared.tsx. */

/** `$103,708.44` — the Figma amount format (no currency code; the unit goes in the label). */
export const money = (value: number | null): string =>
  value == null
    ? '—'
    : value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', currencyDisplay: 'narrowSymbol' });

/* ------------------------------ Registros · Recibos ------------------------------ */

export type ReceiptStatus = 'Pendiente' | 'Pagado' | 'Vencido' | 'Sin conectar';

export interface ReceiptRow {
  /** Receipt number: a machine identifier, shown in the mono text style. */
  numero: string;
  cliente: string;
  estado: ReceiptStatus;
  monto: number | null;
  vence: string;
}

export const REGISTROS_TABS = [
  { value: 'inicio', label: 'Inicio' },
  { value: 'recibos', label: 'Recibos', count: '53,938' },
  { value: 'clientes', label: 'Clientes', count: '19,076' },
  { value: 'polizas', label: 'Pólizas', count: '28,925' },
  { value: 'capturas', label: 'Capturas' },
];

export const RECEIPT_STATS = [
  { label: 'Recibos', value: '53,938', tone: 'neutral' },
  { label: 'Vencidos', value: '30', tone: 'danger' },
  { label: 'Monto vencido', value: '$103,708.44', tone: 'danger' },
  { label: 'Monto pagado', value: '$112,601,918.79', tone: 'success' },
  { label: 'Pagados', value: '21,609', tone: 'success' },
] as const;

export const RECEIPT_ROWS: ReceiptRow[] = [
  { numero: '80009160423', cliente: 'Esteban Roldán Ocampo', estado: 'Pendiente', monto: null, vence: 'en 363 d' },
  { numero: '12606458245', cliente: 'David Tovar Fragoso', estado: 'Pagado', monto: 470.36, vence: 'pagado' },
  { numero: '12606454690', cliente: 'Noemí Hernani Escobedo', estado: 'Pendiente', monto: null, vence: 'en 358 d' },
  { numero: '001112', cliente: 'Iván Iduarte Fernández', estado: 'Vencido', monto: 24296.33, vence: 'hace 4 d' },
  { numero: '590046192', cliente: 'José Mora Gonzaga', estado: 'Sin conectar', monto: null, vence: '—' },
  { numero: '12606177138', cliente: 'Ofelia Murillo Rubial', estado: 'Pagado', monto: 609.21, vence: 'pagado' },
  { numero: '80009160422', cliente: 'Virginia Villalba Marín', estado: 'Pendiente', monto: 1057.7, vence: 'en 329 d' },
  { numero: '80009171188', cliente: 'Lucía Ferrer Montoya', estado: 'Pagado', monto: 8120.5, vence: 'pagado' },
  { numero: '12606461032', cliente: 'Héctor Zamora Peña', estado: 'Pendiente', monto: 15342, vence: 'en 12 d' },
  { numero: '590046301', cliente: 'Rodolfo Beltrán Ibarra', estado: 'Vencido', monto: 3188.9, vence: 'hace 11 d' },
];

/* --------------------------- Validación de pagos · Pendientes --------------------------- */

export const VALIDACION_TABS = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'pagados', label: 'Pagados' },
  { value: 'cancelados', label: 'Cancelados' },
  { value: 'calendario', label: 'Calendario' },
];

export const SYNC_CARRIERS: { name: string; state: 'warning' }[] = [
  { name: 'Chubb', state: 'warning' },
  { name: 'AXA', state: 'warning' },
  { name: 'Plan Seguro', state: 'warning' },
  { name: 'SMNYL', state: 'warning' },
];

export const PAYMENT_STATS = [
  { label: 'Corte de hoy', value: '0%', tone: 'neutral', detail: '$0.00 MXN / $493,981.11 MXN', progress: 0 },
  { label: 'Confirmado hoy', value: '$0.00 MXN', tone: 'success', detail: '69 confirmados hoy' },
  { label: 'Restante hoy', value: '$493,981.11 MXN', tone: 'warning', detail: '48 por confirmar hoy' },
  { label: 'Cobrado este mes', value: '$1,267,473.02 MXN', tone: 'success', detail: '154 recibos confirmados' },
] as const;

export interface AgingCard {
  id: string;
  label: string;
  tone: 'warning' | 'neutral' | 'danger';
  mxn: string;
  usd?: string;
  polizas: string;
}

export const AGING_CARDS: AgingCard[] = [
  { id: '7', label: 'Próximos 7 días', tone: 'warning', mxn: '$1,932,324.73', usd: '$2,592.15', polizas: '202 pólizas' },
  { id: '30', label: 'Próximos 30 días', tone: 'neutral', mxn: '$3,473,315.48', polizas: '483 pólizas' },
  { id: 'vencidos', label: 'Vencidos', tone: 'danger', mxn: '$9,637,480.40', usd: '$49,930.55', polizas: '1,080 pólizas' },
];

export interface PaymentRow {
  id: string;
  cliente: string;
  /** More than one receipt: a Count after the name and an expandable row. */
  recibos: number;
  poliza: string;
  aseguradora: string;
  prima: number;
  limite: { label: string; tone: 'idle' | 'danger' };
}

export const PAYMENT_ROWS: PaymentRow[] = [
  { id: 'p1', cliente: 'Andrés Garza Lozano', recibos: 1, poliza: '3101-02910344-02', aseguradora: 'Afirme', prima: 2310.4, limite: { label: 'en 3 días', tone: 'idle' } },
  { id: 'p2', cliente: 'Cecilia Zúñiga Ordaz', recibos: 1, poliza: '3101-02658412-02', aseguradora: 'Afirme', prima: 1564.67, limite: { label: 'en 3 días', tone: 'idle' } },
  { id: 'p3', cliente: 'Cintia Castañeda Ibarra', recibos: 2, poliza: '3101-03062263-00', aseguradora: 'Afirme', prima: 588.63, limite: { label: 'Vencido', tone: 'danger' } },
  { id: 'p4', cliente: 'Cinthya Guerrero Espino', recibos: 1, poliza: '3101-02749871-01', aseguradora: 'Afirme', prima: 621.24, limite: { label: 'en 5 días', tone: 'idle' } },
  { id: 'p5', cliente: 'Mauricio Pineda Lara', recibos: 3, poliza: '3101-02117650-00', aseguradora: 'Afirme', prima: 4905.12, limite: { label: 'en 6 días', tone: 'idle' } },
  { id: 'p6', cliente: 'Renata Solís Archundia', recibos: 1, poliza: 'GN-7790012-03', aseguradora: 'GNP', prima: 15342, limite: { label: 'en 7 días', tone: 'idle' } },
];

/* ------------------------ Propuestas · Configuración · Aseguradoras ------------------------ */

export type CarrierGroup = 'atencion' | 'aldia' | 'sin-conectar';

export interface CarrierSetting {
  id: string;
  name: string;
  group: CarrierGroup;
  /** Honest status wording: says what is confirmed and what is still running. */
  status: string;
  tone: 'success' | 'warning' | 'idle';
  credentials: string;
  lastSync: string;
}

export const CARRIERS: CarrierSetting[] = [
  { id: 'chubb', name: 'Chubb', group: 'atencion', status: 'Falta código de verificación', tone: 'warning', credentials: 'Guardadas', lastSync: 'Hace 3 días' },
  { id: 'axa', name: 'AXA', group: 'atencion', status: 'Inicio de sesión confirmado, validación en curso', tone: 'warning', credentials: 'Guardadas', lastSync: 'Hace 1 día' },
  { id: 'smnyl', name: 'SMNYL', group: 'atencion', status: 'Contraseña rechazada', tone: 'warning', credentials: 'Por actualizar', lastSync: 'Hace 6 días' },
  { id: 'gnp', name: 'GNP', group: 'aldia', status: 'Al día', tone: 'success', credentials: 'Guardadas', lastSync: 'Hoy, 06:12' },
  { id: 'qualitas', name: 'Qualitas', group: 'aldia', status: 'Al día', tone: 'success', credentials: 'Guardadas', lastSync: 'Hoy, 06:40' },
  { id: 'afirme', name: 'Seguros Afirme', group: 'aldia', status: 'Al día', tone: 'success', credentials: 'Guardadas', lastSync: 'Hoy, 05:58' },
  { id: 'mapfre', name: 'Mapfre', group: 'sin-conectar', status: 'Sin conectar', tone: 'idle', credentials: 'Sin credenciales', lastSync: 'Nunca' },
  { id: 'hdi', name: 'HDI', group: 'sin-conectar', status: 'Sin conectar', tone: 'idle', credentials: 'Sin credenciales', lastSync: 'Nunca' },
];

export const CARRIER_GROUPS: { id: CarrierGroup; label: string }[] = [
  { id: 'atencion', label: 'Requieren atención' },
  { id: 'aldia', label: 'Al día' },
  { id: 'sin-conectar', label: 'Sin conectar' },
];

export const SETTINGS_INDEX = [
  { id: 'pendientes', label: 'Pendientes', count: 3 },
  { id: 'aseguradoras', label: 'Aseguradoras' },
  { id: 'cobranza', label: 'Cobranza' },
  { id: 'equipo', label: 'Equipo' },
];

export const CODE_STEPS = [
  { label: 'Credenciales', description: 'Usuario y contraseña del portal' },
  { label: 'Códigos de verificación', description: 'Cómo recibimos el código' },
  { label: 'Confirmación' },
];
