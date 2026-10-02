// Datos de ejemplo — no hay conexión a ninguna base real. Pensados solo para
// que la demo se vea viva: leads, vendedores, propiedades y su actividad.

const VENDEDORES = [
  { id: 'v1', nombre: 'Lucas Ferrando', telefono: '+5492236111222', activo: true },
  { id: 'v2', nombre: 'Bianca Roldán', telefono: '+5492236222333', activo: true },
  { id: 'v3', nombre: 'Ezequiel Vargas', telefono: '+5492236333444', activo: true },
];

const PROPIEDADES = [
  { id: 'p1', titulo: 'Departamento 2 amb a la calle con balcón', direccion: 'Gascón 2900', zona: 'Plaza Mitre', operacion: 'venta', precio: 140000, moneda: 'USD', estado: 'activa', m2: 48, ambientes: 2, telefono_propietario: '' },
  { id: 'p2', titulo: 'Casa - San José', direccion: 'Matheu 3026', zona: 'San José', operacion: 'venta', precio: 185000, moneda: 'USD', estado: 'activa', m2: 150, ambientes: 4, telefono_propietario: '+5492236999111' },
  { id: 'p3', titulo: 'Casa - San José', direccion: 'Rondeau 4210', zona: 'San José', operacion: 'venta', precio: 169000, moneda: 'USD', estado: 'activa', m2: 132, ambientes: 3, telefono_propietario: '' },
  { id: 'p4', titulo: 'PH 3 amb. Planta alta. Terraza.', direccion: 'Mariano Acosta 1900', zona: 'San Cayetano', operacion: 'venta', precio: 75000, moneda: 'USD', estado: 'activa', m2: 62, ambientes: 3, telefono_propietario: '' },
  { id: 'p5', titulo: 'Departamento en Centro', direccion: 'Córdoba al 1700', zona: 'Centro', operacion: 'alquiler', precio: 450000, moneda: 'ARS', estado: 'activa', m2: 40, ambientes: 1, telefono_propietario: '' },
  { id: 'p6', titulo: 'Chalet 5 ambientes con piscina', direccion: 'El Coyunco, Sierra de los Padres', zona: 'Sierra De Los Padres', operacion: 'venta', precio: 350000, moneda: 'USD', estado: 'activa', m2: 280, ambientes: 5, telefono_propietario: '+5492236888222' },
  { id: 'p7', titulo: 'Local en Macro centro', direccion: 'San Martín al 3300', zona: 'Macrocentro', operacion: 'venta', precio: 248000, moneda: 'USD', estado: 'reservada', m2: 90, ambientes: 1, telefono_propietario: '' },
  { id: 'p8', titulo: 'Terreno en Sierra De Los Padres', direccion: 'Lote en Sierra de Los Padres', zona: 'Sierra De Los Padres', operacion: 'venta', precio: 45000, moneda: 'USD', estado: 'activa', m2: 600, ambientes: 0, telefono_propietario: '' },
];

const LEADS = [
  { id: 'l1', nombre: 'Marcela Ibáñez', tel: '+5492236501122', origen: 'ZonaProp', estado: 'frio', vendedorId: 'v1', primerContacto: diasAtras(0) },
  { id: 'l2', nombre: 'Rodrigo Paz', tel: '+5492236502233', origen: 'WhatsApp', estado: 'tibio', vendedorId: 'v2', primerContacto: diasAtras(0) },
  { id: 'l3', nombre: 'Daniela Sosa', tel: '+5492236503344', origen: 'Instagram', estado: 'caliente', vendedorId: 'v1', primerContacto: diasAtras(1) },
  { id: 'l4', nombre: 'Federico Luna', tel: '+5492236504455', origen: 'ZonaProp', estado: 'cerrado', vendedorId: 'v3', primerContacto: diasAtras(2) },
  { id: 'l5', nombre: 'Sin nombre', tel: '+5492236505566', origen: 'WhatsApp', estado: 'frio', vendedorId: null, primerContacto: diasAtras(2) },
  { id: 'l6', nombre: 'Carolina Reyes', tel: '+5492236506677', origen: 'Instagram', estado: 'tibio', vendedorId: 'v2', primerContacto: diasAtras(3) },
  { id: 'l7', nombre: 'Martín Acosta', tel: '+5492236507788', origen: 'ZonaProp', estado: 'caliente', vendedorId: 'v3', primerContacto: diasAtras(4) },
  { id: 'l8', nombre: 'Julieta Campos', tel: '+5492236508899', origen: 'WhatsApp', estado: 'cerrado', vendedorId: 'v1', primerContacto: diasAtras(5) },
  { id: 'l9', nombre: 'Nicolás Prieto', tel: '+5492236509900', origen: 'Instagram', estado: 'frio', vendedorId: 'v2', primerContacto: diasAtras(6) },
  { id: 'l10', nombre: 'Agustina Rey', tel: '+5492236510011', origen: 'ZonaProp', estado: 'tibio', vendedorId: 'v3', primerContacto: diasAtras(6) },
];

// seguimientos: el historial de eventos por lead/propiedad (igual que en la app real)
const SEGUIMIENTOS = [
  { id: 's1', leadId: 'l3', propiedadId: 'p2', vendedorId: 'v1', evento: 'visita_agendada', fechaVisita: hoyA(16, 0), detalle: null },
  { id: 's2', leadId: 'l7', propiedadId: 'p6', vendedorId: 'v3', evento: 'visita_agendada', fechaVisita: hoyA(18, 30), detalle: null },
  { id: 's3', leadId: 'l4', propiedadId: 'p4', vendedorId: 'v3', evento: 'visita_realizada', fechaVisita: diasAtras(1), detalle: null },
  { id: 's4', leadId: 'l4', propiedadId: 'p4', vendedorId: 'v3', evento: 'feedback', fechaVisita: null, detalle: 'Le gustó la terraza, pide un descuento del 5%.' },
  { id: 's5', leadId: 'l8', propiedadId: 'p1', vendedorId: 'v1', evento: 'visita_realizada', fechaVisita: diasAtras(3), detalle: null },
  { id: 's6', leadId: 'l8', propiedadId: 'p1', vendedorId: 'v1', evento: 'feedback', fechaVisita: null, detalle: 'Muy interesada, vuelve con la familia el sábado.' },
  { id: 's7', leadId: 'l6', propiedadId: 'p2', vendedorId: 'v2', evento: 'visita_agendada', fechaVisita: sumarDias(1, 11, 0), detalle: null },
  { id: 's8', leadId: 'l10', propiedadId: 'p7', vendedorId: 'v3', evento: 'visita_realizada', fechaVisita: diasAtras(6), detalle: null },
  { id: 's9', leadId: 'l4', propiedadId: null, vendedorId: 'v3', evento: 'cierre', fechaVisita: null, detalle: null },
  { id: 's10', leadId: 'l8', propiedadId: null, vendedorId: 'v1', evento: 'cierre', fechaVisita: null, detalle: null },
  { id: 's11', leadId: 'l1', propiedadId: null, vendedorId: 'v1', evento: 'derivado', fechaVisita: null, detalle: null },
  { id: 's12', leadId: 'l2', propiedadId: null, vendedorId: 'v2', evento: 'derivado', fechaVisita: null, detalle: null },
];

// Comparables de ejemplo para el estimador de Tasación (simula cierres + portal).
const COMPARABLES = [
  { zona: 'San José', tipo: 'Casa', m2: 140, valorUsd: 178000 },
  { zona: 'San José', tipo: 'Casa', m2: 160, valorUsd: 198000 },
  { zona: 'San José', tipo: 'Casa', m2: 128, valorUsd: 162000 },
  { zona: 'San José', tipo: 'Casa', m2: 150, valorUsd: 186000 },
  { zona: 'Centro', tipo: 'Departamento', m2: 45, valorUsd: 64000 },
  { zona: 'Centro', tipo: 'Departamento', m2: 38, valorUsd: 55000 },
  { zona: 'Centro', tipo: 'Departamento', m2: 52, valorUsd: 71000 },
  { zona: 'Playa Grande', tipo: 'Departamento', m2: 60, valorUsd: 98000 },
  { zona: 'Playa Grande', tipo: 'Departamento', m2: 72, valorUsd: 118000 },
  { zona: 'Sierra De Los Padres', tipo: 'Chalet', m2: 260, valorUsd: 330000 },
  { zona: 'Sierra De Los Padres', tipo: 'Chalet', m2: 300, valorUsd: 365000 },
  { zona: 'Constitución', tipo: 'Departamento', m2: 50, valorUsd: 68000 },
  { zona: 'Constitución', tipo: 'PH', m2: 70, valorUsd: 82000 },
];

function diasAtras(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function sumarDias(n, h, m) { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, m, 0, 0); return d.toISOString(); }
function hoyA(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); }
