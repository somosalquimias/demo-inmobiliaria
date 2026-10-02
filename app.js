// Demo estática del panel — sin backend. Todo vive en memoria (los arrays de
// data.js) y se pierde al recargar la página; es intencional, es solo para
// mostrar cómo se ve y se siente el CRM real.

const NAV = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'leads', label: 'Leads' },
  { id: 'vendedores', label: 'Vendedores' },
  { id: 'metricas', label: 'Métricas' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'publicaciones', label: 'Propiedades' },
  { id: 'reportes', label: 'Informes a propietarios' },
  { id: 'tasacion', label: 'Tasación' },
  { id: 'contratos', label: 'Contratos' },
];

const ESTADO_LABEL = { frio: 'Frío', tibio: 'Tibio', caliente: 'Caliente', cerrado: 'Cerrado' };
const ESTADO_PILL = { frio: 'pill pill-muted', tibio: 'pill pill-brass', caliente: 'pill pill-alert', cerrado: 'pill pill-verde' };

const state = {
  tab: 'resumen',
  leadFilter: 'todos',
  selectedLeadId: null,
  accionVisita: null, // { tipo, visita }
  nuevaVisitaAbierta: false,
  tasacion: { zona: 'San José', tipo: 'Casa', m2: 150 },
  reporte: { propiedadId: '', periodo: 30 },
};

function fmtMoney(v, moneda) { return `${moneda || 'ARS'} ${Number(v).toLocaleString('es-AR')}`; }
function fmtFechaCorta(iso) { return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }); }
function fmtHora(iso) { return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
function nombreLead(id) { return LEADS.find((l) => l.id === id)?.nombre ?? 'Sin cliente'; }
function nombrePropiedad(id) { return PROPIEDADES.find((p) => p.id === id)?.titulo ?? 'Sin propiedad'; }
function nombreVendedor(id) { return VENDEDORES.find((v) => v.id === id)?.nombre ?? 'Sin asignar'; }

function setTab(tab) { state.tab = tab; state.selectedLeadId = null; render(); }
function render() { document.getElementById('root').innerHTML = renderApp(); afterRender(); }

// ---------- layout ----------

function renderApp() {
  return `
    <div class="banner-demo">
      Demo con datos de ejemplo — no hay conexión a ninguna base real.
    </div>
    <div class="app">
      <aside style="width:216px;border-right:1px solid var(--line);border-top:3px solid var(--verde);padding:20px 14px;flex-shrink:0;position:sticky;top:0;align-self:flex-start;height:calc(100vh - 30px);overflow-y:auto;">
        <div style="margin:-20px -46px 22px"><img src="logo.jpg" alt="De Gennaro Propiedades" style="width:100%;height:auto;display:block" /></div>
        <nav class="flex flex-col gap-1">
          ${NAV.map((n) => `<div class="navlink ${state.tab === n.id ? 'active' : ''}" data-tab="${n.id}">${n.label}</div>`).join('')}
        </nav>
        <div style="margin-top:28px;padding:12px 10px;border-top:1px solid var(--line)">
          <div class="eyebrow" style="margin-bottom:6px">Fuentes de datos</div>
          <div style="font-size:11.5px;color:var(--ink-soft);line-height:1.5">
            <div><span class="dot"></span> Tokko (solo lectura)</div>
            <div style="margin-top:3px"><span class="dot" style="background:var(--brass)"></span> Datos propios de la plataforma</div>
          </div>
        </div>
      </aside>
      <main style="flex:1;min-width:0">
        <div class="flex items-center justify-end" style="padding:16px 28px;border-bottom:1px solid var(--line)">
          <div class="flex items-center gap-4">
            <div style="font-size:12.5px;color:var(--ink-soft)">Tokko sincronizado hace 2 min</div>
            <div class="flex items-center gap-2" style="font-size:12.5px"><span class="dot"></span>Agente activo</div>
          </div>
        </div>
        <div style="padding:26px 28px 60px">${renderTab()}</div>
      </main>
    </div>
    ${renderModales()}
  `;
}

function renderTab() {
  switch (state.tab) {
    case 'resumen': return renderResumen();
    case 'leads': return renderLeads();
    case 'vendedores': return renderVendedores();
    case 'metricas': return renderMetricas();
    case 'agenda': return renderAgenda();
    case 'publicaciones': return renderPropiedades();
    case 'reportes': return renderInformes();
    case 'tasacion': return renderTasacion();
    case 'contratos': return renderContratos();
    default: return '';
  }
}

// ---------- Resumen ----------

function renderResumen() {
  const hace7 = Date.now() - 7 * 86400000;
  const eventos = { derivado: 0, visita_agendada: 0, visita_realizada: 0, cierre: 0 };
  for (const s of SEGUIMIENTOS) {
    const f = s.fechaVisita || diasAtras(0);
    if (new Date(f).getTime() >= hace7 && s.evento in eventos) eventos[s.evento] += 1;
  }
  const leadsHoy = LEADS.filter((l) => fmtFechaCorta(l.primerContacto) === fmtFechaCorta(diasAtras(0))).length;
  const activas = PROPIEDADES.filter((p) => p.estado === 'activa').length;
  const porVendedor = {};
  for (const l of LEADS) {
    if (!l.vendedorId) continue;
    porVendedor[l.vendedorId] = porVendedor[l.vendedorId] || { total: 0, cerrados: 0 };
    porVendedor[l.vendedorId].total++;
    if (l.estado === 'cerrado') porVendedor[l.vendedorId].cerrados++;
  }
  const topId = Object.keys(porVendedor).sort((a, b) => porVendedor[b].cerrados - porVendedor[a].cerrados)[0];
  const top = topId ? { nombre: nombreVendedor(topId), ...porVendedor[topId] } : null;

  return `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="display" style="font-size:26px;font-weight:600;margin:0">Resumen operativo</h1>
        <p style="color:var(--ink-soft);font-size:13.5px;margin-top:4px">${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="grid grid-cols-4 gap-4">
        ${kpi('Leads nuevos hoy', leadsHoy, 'vs. ayer', 'var(--verde)')}
        ${kpi('Visitas agendadas (7d)', eventos.visita_agendada, 'registradas por el equipo')}
        ${kpi('Propiedades activas', activas, 'publicadas en la plataforma')}
        ${top ? kpi('Vendedor top', top.nombre, `${top.cerrados} cierres · ${Math.round((top.cerrados / top.total) * 100)}% conversión`, 'var(--brass)') : ''}
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="card p-5" style="grid-column:span 2">
          <span class="eyebrow">Leads captados — últimos 7 días</span>
          <div style="height:160px;margin-top:10px"><canvas id="chartLeads"></canvas></div>
        </div>
        <div class="card p-5">
          <span class="eyebrow">Actividad — últimos 7 días</span>
          <div class="flex flex-col gap-3" style="margin-top:12px">
            <div class="flex justify-between text-sm"><span>Visitas agendadas</span><span class="mono">${eventos.visita_agendada}</span></div>
            <div class="flex justify-between text-sm"><span>Visitas realizadas</span><span class="mono">${eventos.visita_realizada}</span></div>
            <div class="flex justify-between text-sm"><span>Derivados a asesor</span><span class="mono">${eventos.derivado}</span></div>
            <div class="flex justify-between text-sm"><span>Cierres</span><span class="mono">${eventos.cierre}</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function kpi(label, value, sub, accent) {
  const esTexto = typeof value === 'string';
  return `
    <div class="card p-4" style="border-top:2px solid ${accent || 'var(--line)'}">
      <div class="eyebrow">${label}</div>
      <div class="mono" style="font-family:'IBM Plex Mono',monospace;font-size:${esTexto ? '16px' : '26px'};font-weight:500;margin-top:6px;word-break:break-word">${value}</div>
      <div style="font-size:11.5px;color:var(--ink-soft);margin-top:4px">${sub}</div>
    </div>
  `;
}

function drawChart() {
  const canvas = document.getElementById('chartLeads');
  if (!canvas || typeof Chart === 'undefined') return;
  const dias = Array.from({ length: 7 }, (_, i) => diasAtras(6 - i));
  const data = dias.map((d) => LEADS.filter((l) => fmtFechaCorta(l.primerContacto) === fmtFechaCorta(d)).length);
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: dias.map((d) => new Date(d).toLocaleDateString('es-AR', { weekday: 'short' })),
      datasets: [{ data, borderColor: '#B9832E', backgroundColor: 'rgba(185,131,46,0.2)', fill: true, tension: 0.35 }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

// ---------- Leads ----------

function renderLeads() {
  const filtrados = state.leadFilter === 'todos' ? LEADS : LEADS.filter((l) => l.estado === state.leadFilter);
  const seleccionado = LEADS.find((l) => l.id === state.selectedLeadId);
  return `
    <div class="flex flex-col gap-4">
      <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Leads</h1>
      <div class="flex items-center gap-1">
        ${['todos', 'frio', 'tibio', 'caliente', 'cerrado'].map((f) => `<span class="chip ${state.leadFilter === f ? 'active' : ''}" data-leadfilter="${f}">${f === 'todos' ? 'Todos' : ESTADO_LABEL[f]}</span>`).join('')}
      </div>
      <div class="card" style="overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th class="th">Nombre</th><th class="th">Teléfono</th><th class="th">Origen</th><th class="th">Estado</th><th class="th">Vendedor</th></tr></thead>
          <tbody>
            ${filtrados.map((l) => `
              <tr class="row" data-lead="${l.id}">
                <td class="td" style="font-weight:500">${l.nombre}</td>
                <td class="td mono">${l.tel}</td>
                <td class="td">${l.origen}</td>
                <td class="td"><span class="${ESTADO_PILL[l.estado]}">${ESTADO_LABEL[l.estado]}</span></td>
                <td class="td">${nombreVendedor(l.vendedorId)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${seleccionado ? renderLeadDrawer(seleccionado) : ''}
    </div>
  `;
}

function renderLeadDrawer(l) {
  const historial = SEGUIMIENTOS.filter((s) => s.leadId === l.id).sort((a, b) => new Date(b.fechaVisita || 0) - new Date(a.fechaVisita || 0));
  return `
    <div class="card p-5 flex flex-col gap-3" style="max-width:420px">
      <div class="flex items-center justify-between">
        <h2 class="display" style="font-size:18px;font-weight:600;margin:0">${l.nombre}</h2>
        <span style="cursor:pointer;color:var(--ink-soft)" data-closelead="1">✕</span>
      </div>
      <div style="font-size:13px;color:var(--ink-soft)">${l.tel} · ${l.origen} · ${nombreVendedor(l.vendedorId)}</div>
      <div class="flex gap-2">
        ${Object.keys(ESTADO_LABEL).map((e) => `<button class="btn ${l.estado === e ? 'btn-primary' : ''}" data-cambiarestado="${l.id}|${e}">${ESTADO_LABEL[e]}</button>`).join('')}
      </div>
      <div style="border-top:1px solid var(--line);padding-top:10px">
        <span class="eyebrow">Historial</span>
        <div class="flex flex-col gap-2" style="margin-top:8px">
          ${historial.length ? historial.map((s) => `<div style="font-size:12.5px"><span class="mono" style="color:var(--ink-soft)">${s.fechaVisita ? fmtFechaCorta(s.fechaVisita) : '—'}</span> · ${s.evento}${s.detalle ? ' · ' + s.detalle : ''}</div>`).join('') : '<div style="font-size:12.5px;color:var(--ink-soft)">Sin eventos todavía.</div>'}
        </div>
      </div>
    </div>
  `;
}

// ---------- Vendedores ----------

function renderVendedores() {
  return `
    <div class="flex flex-col gap-5">
      <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Vendedores</h1>
      <div class="card" style="overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th class="th">Vendedor</th><th class="th">Teléfono (WhatsApp)</th><th class="th">Estado</th></tr></thead>
          <tbody>
            ${VENDEDORES.map((v) => `
              <tr class="row">
                <td class="td" style="font-weight:500">${v.nombre}</td>
                <td class="td mono">${v.telefono}</td>
                <td class="td"><span class="chip" style="color:${v.activo ? 'var(--verde)' : 'var(--ink-soft)'}">${v.activo ? 'Activo' : 'Inactivo'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------- Métricas ----------

function renderMetricas() {
  const filas = VENDEDORES.map((v) => {
    const leads = LEADS.filter((l) => l.vendedorId === v.id);
    const visitas = SEGUIMIENTOS.filter((s) => s.vendedorId === v.id && s.evento === 'visita_realizada').length;
    const cierres = leads.filter((l) => l.estado === 'cerrado').length;
    const conversion = leads.length ? Math.round((cierres / leads.length) * 100) : 0;
    return { nombre: v.nombre, leads: leads.length, visitas, cierres, conversion };
  });
  return `
    <div class="flex flex-col gap-5">
      <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Métricas por vendedor</h1>
      <div class="card" style="overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th class="th">Vendedor</th><th class="th">Leads</th><th class="th">Visitas</th><th class="th">Cierres</th><th class="th">Conversión</th></tr></thead>
          <tbody>
            ${filas.map((f) => `
              <tr class="row">
                <td class="td" style="font-weight:500">${f.nombre}</td>
                <td class="td mono">${f.leads}</td>
                <td class="td mono">${f.visitas}</td>
                <td class="td mono">${f.cierres}</td>
                <td class="td mono">${f.conversion}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------- Agenda ----------

function visitasConsolidadas() {
  const hijosPorPadre = {};
  for (const s of SEGUIMIENTOS) {
    if (s.visitaPadreId) (hijosPorPadre[s.visitaPadreId] = hijosPorPadre[s.visitaPadreId] || []).push(s);
  }
  const raices = SEGUIMIENTOS.filter((s) => ['visita_agendada', 'visita_realizada', 'visita_cancelada'].includes(s.evento) && !s.visitaPadreId);
  return raices.map((r) => {
    const hijos = hijosPorPadre[r.id] || [];
    const ultimo = hijos.length ? hijos[hijos.length - 1] : r;
    return { ...r, evento: ultimo.evento };
  }).sort((a, b) => new Date(a.fechaVisita || '9999') - new Date(b.fechaVisita || '9999'));
}

function renderAgenda() {
  const visitas = visitasConsolidadas();
  const conFecha = visitas.filter((v) => v.fechaVisita);
  const sinFecha = visitas.filter((v) => !v.fechaVisita);
  return `
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Agenda de visitas</h1>
        <button class="btn btn-primary" data-nuevavisita="1">+ Nueva visita</button>
      </div>
      <div class="flex flex-col gap-2">
        ${conFecha.map((v) => renderVisitaItem(v)).join('') || '<div class="card p-4" style="font-size:13px;color:var(--ink-soft)">No hay visitas agendadas.</div>'}
      </div>
      ${sinFecha.length ? `
        <div class="flex flex-col gap-2">
          <span class="eyebrow">Sin fecha asignada</span>
          ${sinFecha.map((v) => renderVisitaItem(v)).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderVisitaItem(v) {
  const estadoColor = v.evento === 'visita_realizada' ? 'var(--verde)' : v.evento === 'visita_cancelada' ? 'var(--ink-soft)' : '#92651f';
  const estadoBg = v.evento === 'visita_realizada' ? 'rgba(58,107,84,0.12)' : v.evento === 'visita_cancelada' ? 'rgba(120,120,120,0.12)' : 'rgba(185,131,46,0.12)';
  const tachado = v.evento === 'visita_cancelada' ? 'line-through' : 'none';
  return `
    <div class="card p-3 flex items-center justify-between">
      <div>
        <div style="font-weight:500;font-size:13px;text-decoration:${tachado}">
          ${v.fechaVisita ? `<span class="mono">${fmtFechaCorta(v.fechaVisita)} ${fmtHora(v.fechaVisita)}</span> · ` : ''}${nombreLead(v.leadId)}
        </div>
        <div style="font-size:12px;color:var(--ink-soft)">${nombrePropiedad(v.propiedadId)} · ${nombreVendedor(v.vendedorId)}</div>
      </div>
      <div class="flex items-center gap-2">
        <span class="pill" style="background:${estadoBg};color:${estadoColor}">${v.evento.replace('visita_', '')}</span>
        ${v.evento === 'visita_agendada' ? `
          <button class="btn" style="font-size:12px" data-accionvisita="realizada|${v.id}">Marcar realizada</button>
          <button class="btn" style="font-size:12px" data-accionvisita="reagendar|${v.id}">Reagendar</button>
          <button class="btn" style="font-size:12px" data-accionvisita="cancelar|${v.id}">Cancelar</button>
        ` : ''}
      </div>
    </div>
  `;
}

// ---------- Propiedades ----------

const OP_LABEL = { venta: 'Venta', alquiler: 'Alquiler' };
const ESTADO_PROP_LABEL = { activa: 'Activa', reservada: 'Reservada' };

function renderPropiedades() {
  return `
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Propiedades</h1>
        <span style="font-size:12px;color:var(--ink-soft)">Origen: Tokko · solo lectura</span>
      </div>
      <div class="grid grid-cols-3 gap-4">
        ${PROPIEDADES.map((p) => `
          <div class="card p-4 flex flex-col gap-3">
            <div>
              <div style="font-weight:500;font-size:13.5px">${p.titulo}</div>
              <div style="font-size:12px;color:var(--ink-soft);margin-top:2px">${p.direccion} · ${p.zona} · ${OP_LABEL[p.operacion]}</div>
            </div>
            <div class="mono" style="font-size:15px;font-weight:500">${fmtMoney(p.precio, p.moneda)}</div>
            <div class="flex items-center gap-2" style="font-size:11px;border-top:1px solid var(--line);padding-top:10px">
              <span class="pill ${p.estado === 'activa' ? 'pill-verde' : 'pill-brass'}">${ESTADO_PROP_LABEL[p.estado]}</span>
              <span style="color:var(--ink-soft)">En Tokko</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ---------- Informes a propietarios ----------

function renderInformes() {
  const propiedad = PROPIEDADES.find((p) => p.id === state.reporte.propiedadId);
  const desde = new Date(Date.now() - state.reporte.periodo * 86400000);
  const hasta = new Date();
  let actividad = null;
  if (propiedad) {
    const segs = SEGUIMIENTOS.filter((s) => s.propiedadId === propiedad.id);
    actividad = {
      consultas: segs.length,
      visitas: segs.filter((s) => s.evento === 'visita_realizada').length,
      feedback: segs.filter((s) => s.evento === 'feedback' && s.detalle).map((s) => s.detalle),
    };
  }
  return `
    <div class="flex flex-col gap-4" style="max-width:600px">
      <div>
        <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Informes a propietarios</h1>
        <p style="font-size:12.5px;color:var(--ink-soft);margin-top:4px">Actividad de una propiedad en el período elegido, descargable en PDF</p>
      </div>
      <div class="card p-5 flex flex-col gap-4">
        <div>
          <label class="eyebrow">Propiedad</label>
          <select class="btn" style="width:100%;margin-top:6px;justify-content:space-between" data-reporteprop="1">
            <option value="">Elegir una propiedad…</option>
            ${PROPIEDADES.map((p) => `<option value="${p.id}" ${state.reporte.propiedadId === p.id ? 'selected' : ''}>${p.titulo} · ${p.direccion}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="eyebrow">Período analizado</label>
          <div class="flex gap-2" style="margin-top:6px">
            ${[30, 60, 90].map((d) => `<span class="chip ${state.reporte.periodo === d ? 'active' : ''}" data-reporteperiodo="${d}">Últimos ${d} días</span>`).join('')}
          </div>
        </div>
      </div>
      ${propiedad ? `
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex items-baseline justify-between" style="border-bottom:1px solid var(--line);padding-bottom:10px">
            <span style="font-weight:500">${propiedad.titulo} · ${propiedad.direccion}</span>
            <span style="font-size:11px;color:var(--ink-soft)">${fmtFechaCorta(desde)} al ${fmtFechaCorta(hasta)}</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div><div class="eyebrow" style="font-size:10px">Consultas</div><div class="mono" style="font-size:16px">${actividad.consultas}</div></div>
            <div><div class="eyebrow" style="font-size:10px">Visitas</div><div class="mono" style="font-size:16px">${actividad.visitas}</div></div>
            <div><div class="eyebrow" style="font-size:10px">Consulta → visita</div><div class="mono" style="font-size:16px">${actividad.consultas ? Math.round((actividad.visitas / actividad.consultas) * 100) : 0}%</div></div>
          </div>
          <div>
            <span class="eyebrow">Comentarios de interesados</span>
            ${actividad.feedback.length ? `<ul style="margin:8px 0 0;padding-left:18px;font-size:12.5px;color:var(--ink-soft);line-height:1.7">${actividad.feedback.map((f) => `<li>${f}</li>`).join('')}</ul>` : '<p style="font-size:12.5px;color:var(--ink-soft);margin-top:8px">Sin comentarios registrados en este período.</p>'}
          </div>
          <button class="btn btn-primary" style="align-self:flex-start" data-descargarinforme="1">Descargar PDF</button>
        </div>
      ` : ''}
    </div>
  `;
}

function descargarInformePDF() {
  const propiedad = PROPIEDADES.find((p) => p.id === state.reporte.propiedadId);
  if (!propiedad || typeof window.jspdf === 'undefined') return;
  const segs = SEGUIMIENTOS.filter((s) => s.propiedadId === propiedad.id);
  const consultas = segs.length;
  const visitas = segs.filter((s) => s.evento === 'visita_realizada').length;
  const feedback = segs.filter((s) => s.evento === 'feedback' && s.detalle).map((s) => s.detalle);
  const tasa = consultas ? Math.round((visitas / consultas) * 100) : 0;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10); doc.setTextColor(90, 90, 90);
  doc.text('Informe de actividad (demo)', pageWidth - 14, 18, { align: 'right' });
  let y = 36;
  doc.setDrawColor(220, 220, 220); doc.line(14, y, pageWidth - 14, y); y += 10;
  doc.setFontSize(13); doc.setTextColor(20, 20, 20); doc.text(propiedad.titulo, 14, y); y += 6;
  doc.setFontSize(10.5); doc.setTextColor(90, 90, 90); doc.text(propiedad.direccion, 14, y); y += 10;
  doc.setFillColor(246, 246, 243); doc.rect(14, y, pageWidth - 28, 26, 'F');
  doc.setFontSize(9); doc.setTextColor(90, 90, 90);
  doc.text('CONSULTAS', 20, y + 8); doc.text('VISITAS', 20 + (pageWidth - 28) / 3, y + 8); doc.text('TASA', 20 + 2 * (pageWidth - 28) / 3, y + 8);
  doc.setFontSize(16); doc.setTextColor(20, 20, 20);
  doc.text(String(consultas), 20, y + 18); doc.text(String(visitas), 20 + (pageWidth - 28) / 3, y + 18); doc.text(`${tasa}%`, 20 + 2 * (pageWidth - 28) / 3, y + 18);
  y += 36;
  doc.setFontSize(10.5); doc.setTextColor(20, 20, 20); doc.text('Comentarios de interesados', 14, y); y += 7;
  doc.setFontSize(9.5); doc.setTextColor(90, 90, 90);
  if (feedback.length) feedback.forEach((f) => { const l = doc.splitTextToSize(`• ${f}`, pageWidth - 28); doc.text(l, 14, y); y += l.length * 5 + 2; });
  else doc.text('Sin comentarios registrados en este período.', 14, y);
  doc.save(`informe-demo-${propiedad.id}.pdf`);
}

// ---------- Tasación ----------

function estimarValor({ zona, tipo, m2 }) {
  let candidatos = COMPARABLES.filter((c) => c.zona === zona);
  if (!candidatos.length) candidatos = COMPARABLES.filter((c) => c.tipo === tipo);
  if (!candidatos.length) candidatos = COMPARABLES;
  const scored = candidatos
    .map((c) => ({ ...c, peso: Math.max(0, 1 - Math.abs(c.m2 - m2) / Math.max(c.m2, m2)), valorPorM2: c.valorUsd / c.m2 }))
    .filter((c) => c.peso > 0)
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 5);
  if (!scored.length) return null;
  const sumaPeso = scored.reduce((s, c) => s + c.peso, 0);
  const promedioM2 = scored.reduce((s, c) => s + c.valorPorM2 * c.peso, 0) / sumaPeso;
  const estimado = promedioM2 * m2;
  const confianza = Math.round((sumaPeso / scored.length) * 100);
  return { low: Math.round(estimado * 0.92), high: Math.round(estimado * 1.08), comparables: scored, confianza };
}

function renderTasacion() {
  const zonas = [...new Set(COMPARABLES.map((c) => c.zona))];
  const t = state.tasacion;
  const est = estimarValor(t);
  return `
    <div class="flex flex-col gap-5" style="max-width:600px">
      <div>
        <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Tasación</h1>
        <p style="font-size:13px;color:var(--ink-soft);margin:4px 0 0">Comparables de ejemplo — no reemplaza una tasación profesional.</p>
      </div>
      <div class="card p-5 flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="eyebrow">Tipo de propiedad</label>
            <select class="btn" style="width:100%;margin-top:6px;justify-content:space-between" data-tasaciontipo="1">
              ${['Casa', 'Departamento', 'PH', 'Chalet'].map((x) => `<option ${t.tipo === x ? 'selected' : ''}>${x}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="eyebrow">Zona</label>
            <select class="btn" style="width:100%;margin-top:6px;justify-content:space-between" data-tasacionzona="1">
              ${zonas.map((z) => `<option ${t.zona === z ? 'selected' : ''}>${z}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <label class="eyebrow">Superficie (m²)</label>
          <input type="number" class="btn" style="width:100%;margin-top:6px" value="${t.m2}" data-tasacionm2="1" />
        </div>
      </div>
      ${est ? `
        <div class="card p-5 flex flex-col gap-4">
          <div style="background:#F6F6F3;border-radius:8px;padding:16px">
            <div class="eyebrow">Valor estimado</div>
            <div class="display" style="font-size:22px;font-weight:600;margin-top:6px">USD ${est.low.toLocaleString('es-AR')} – ${est.high.toLocaleString('es-AR')}</div>
            <div style="font-size:11.5px;color:var(--ink-soft);margin-top:4px">Confianza ${est.confianza}/100</div>
          </div>
          <div>
            <span class="eyebrow">Comparables utilizados</span>
            <div class="flex flex-col gap-1" style="margin-top:8px">
              ${est.comparables.map((c) => `<div style="font-size:12.5px;display:flex;justify-content:space-between"><span>${c.tipo} · ${c.zona} · ${c.m2} m²</span><span class="mono">USD ${c.valorUsd.toLocaleString('es-AR')}</span></div>`).join('')}
            </div>
          </div>
        </div>
      ` : `<div class="card p-5" style="font-size:13px;color:var(--ink-soft)">No hay comparables para esa combinación en los datos de ejemplo.</div>`}
    </div>
  `;
}

// ---------- Contratos ----------

const contratoState = { locador: '', locatario: '', propiedad: '', monto: '', moneda: 'ARS', meses: 24, fechaInicio: new Date().toISOString().slice(0, 10) };

function renderContratos() {
  const c = contratoState;
  const completo = c.locador && c.locatario && c.propiedad && c.monto;
  return `
    <div class="flex flex-col gap-5" style="max-width:600px">
      <div>
        <h1 class="display" style="font-size:24px;font-weight:600;margin:0">Contratos</h1>
        <p style="font-size:13px;color:var(--ink-soft);margin:4px 0 0">Generador de contrato de locación — versión simplificada para la demo.</p>
      </div>
      <div class="card p-5 flex flex-col gap-3">
        ${campoContrato('locador', 'Locador (propietario)', c.locador)}
        ${campoContrato('locatario', 'Locatario (inquilino)', c.locatario)}
        ${campoContrato('propiedad', 'Dirección de la propiedad', c.propiedad)}
        <div class="grid grid-cols-2 gap-3">
          ${campoContrato('monto', 'Monto mensual', c.monto, 'number')}
          <div>
            <label class="eyebrow">Moneda</label>
            <select class="btn" style="width:100%;margin-top:6px" data-contratomoneda="1">
              ${['ARS', 'USD'].map((m) => `<option ${c.moneda === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${campoContrato('meses', 'Duración (meses)', c.meses, 'number')}
          ${campoContrato('fechaInicio', 'Fecha de inicio', c.fechaInicio, 'date')}
        </div>
      </div>
      ${completo ? `
        <div class="card p-5 flex flex-col gap-3">
          <span class="eyebrow">Vista previa</span>
          <div id="contratoPreview" style="font-size:12.5px;line-height:1.7;color:var(--ink)">${textoContrato(c).replace(/\n/g, '<br/>')}</div>
          <button class="btn btn-primary" style="align-self:flex-start" data-descargarcontrato="1">Descargar PDF</button>
        </div>
      ` : `<div class="card p-4" style="font-size:13px;color:var(--ink-soft)">Completá los campos para ver la vista previa.</div>`}
    </div>
  `;
}

function campoContrato(campo, label, valor, type) {
  return `
    <div>
      <label class="eyebrow">${label}</label>
      <input type="${type || 'text'}" class="btn" style="width:100%;margin-top:6px" value="${valor}" data-contratocampo="${campo}" />
    </div>
  `;
}

function textoContrato(c) {
  const inicio = new Date(`${c.fechaInicio}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Entre ${c.locador || '[locador]'}, en adelante EL LOCADOR, y ${c.locatario || '[locatario]'}, en adelante EL LOCATARIO, se acuerda la locación del inmueble sito en ${c.propiedad || '[dirección]'}, por el término de ${c.meses} meses a partir del ${inicio}, por un canon locativo mensual de ${c.moneda} ${Number(c.monto || 0).toLocaleString('es-AR')}.\n\nEste texto es una vista previa simplificada para la demo — el generador real incluye cláusulas completas, garantía, medio de pago e inventario.`;
}

function descargarContratoPDF() {
  if (typeof window.jspdf === 'undefined') return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(14); doc.setTextColor(20, 20, 20); doc.text('Contrato de locación (demo)', 14, 20);
  doc.setFontSize(10); doc.setTextColor(70, 70, 70);
  const lineas = doc.splitTextToSize(textoContrato(contratoState), pageWidth - 28);
  doc.text(lineas, 14, 34);
  doc.save('contrato-demo.pdf');
}

// ---------- modales ----------

function renderModales() {
  let html = '';
  if (state.nuevaVisitaAbierta) {
    html += `
      <div class="modal-backdrop" data-cerrarmodal="1">
        <div class="card p-5 flex flex-col gap-4" style="width:100%;max-width:420px" data-stop="1">
          <h2 class="display" style="font-size:19px;font-weight:600;margin:0">Nueva visita</h2>
          <select class="btn" id="nvLead"><option value="">Elegí un lead</option>${LEADS.map((l) => `<option value="${l.id}">${l.nombre} · ${l.tel}</option>`).join('')}</select>
          <select class="btn" id="nvProp"><option value="">Propiedad (opcional)</option>${PROPIEDADES.map((p) => `<option value="${p.id}">${p.titulo} · ${p.direccion}</option>`).join('')}</select>
          <input type="datetime-local" class="btn" id="nvFecha" />
          <button class="btn btn-primary" style="align-self:flex-start" data-guardarvisita="1">Agendar visita</button>
        </div>
      </div>
    `;
  }
  if (state.accionVisita) {
    const { tipo, visita } = state.accionVisita;
    const titulo = tipo === 'realizada' ? 'Marcar visita realizada' : tipo === 'cancelar' ? 'Cancelar visita' : 'Reagendar visita';
    html += `
      <div class="modal-backdrop" data-cerraraccion="1">
        <div class="card p-5 flex flex-col gap-4" style="width:100%;max-width:420px" data-stop="1">
          <h2 class="display" style="font-size:19px;font-weight:600;margin:0">${titulo}</h2>
          <div style="font-size:13px;color:var(--ink-soft)">${nombreLead(visita.leadId)} · ${nombrePropiedad(visita.propiedadId)}</div>
          ${tipo === 'realizada' ? '<textarea class="btn" id="accFeedback" placeholder="Feedback del interesado (opcional)" style="width:100%;min-height:80px"></textarea>' : ''}
          ${tipo === 'cancelar' ? '<p style="font-size:13px;margin:0">Se va a marcar como cancelada. ¿Confirmás?</p>' : ''}
          ${tipo === 'reagendar' ? '<input type="datetime-local" class="btn" id="accFecha" style="width:100%" />' : ''}
          <button class="btn btn-primary" style="align-self:flex-start" data-confirmaraccion="1">Confirmar</button>
        </div>
      </div>
    `;
  }
  return html;
}

// ---------- eventos ----------

function afterRender() {
  drawChart();
  const root = document.getElementById('root');
  root.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => setTab(el.dataset.tab)));
  root.querySelectorAll('[data-leadfilter]').forEach((el) => el.addEventListener('click', () => { state.leadFilter = el.dataset.leadfilter; render(); }));
  root.querySelectorAll('[data-lead]').forEach((el) => el.addEventListener('click', () => { state.selectedLeadId = el.dataset.lead; render(); }));
  root.querySelectorAll('[data-closelead]').forEach((el) => el.addEventListener('click', () => { state.selectedLeadId = null; render(); }));
  root.querySelectorAll('[data-cambiarestado]').forEach((el) => el.addEventListener('click', () => {
    const [id, estado] = el.dataset.cambiarestado.split('|');
    const lead = LEADS.find((l) => l.id === id);
    if (lead) lead.estado = estado;
    render();
  }));

  root.querySelectorAll('[data-nuevavisita]').forEach((el) => el.addEventListener('click', () => { state.nuevaVisitaAbierta = true; render(); }));
  root.querySelectorAll('[data-cerrarmodal]').forEach((el) => el.addEventListener('click', (e) => { if (e.target === el) { state.nuevaVisitaAbierta = false; render(); } }));
  root.querySelectorAll('[data-guardarvisita]').forEach((el) => el.addEventListener('click', () => {
    const leadId = document.getElementById('nvLead').value;
    const propiedadId = document.getElementById('nvProp').value || null;
    const fecha = document.getElementById('nvFecha').value;
    if (!leadId || !fecha) return;
    const lead = LEADS.find((l) => l.id === leadId);
    SEGUIMIENTOS.push({ id: 's' + Date.now(), leadId, propiedadId, vendedorId: lead?.vendedorId || 'v1', evento: 'visita_agendada', fechaVisita: new Date(fecha).toISOString(), detalle: null });
    state.nuevaVisitaAbierta = false;
    render();
  }));

  root.querySelectorAll('[data-accionvisita]').forEach((el) => el.addEventListener('click', () => {
    const [tipo, id] = el.dataset.accionvisita.split('|');
    const visita = visitasConsolidadas().find((v) => v.id === id);
    state.accionVisita = { tipo, visita };
    render();
  }));
  root.querySelectorAll('[data-cerraraccion]').forEach((el) => el.addEventListener('click', (e) => { if (e.target === el) { state.accionVisita = null; render(); } }));
  root.querySelectorAll('[data-confirmaraccion]').forEach((el) => el.addEventListener('click', () => {
    const { tipo, visita } = state.accionVisita;
    const base = { id: 's' + Date.now(), leadId: visita.leadId, propiedadId: visita.propiedadId, vendedorId: visita.vendedorId, visitaPadreId: visita.id };
    if (tipo === 'realizada') {
      SEGUIMIENTOS.push({ ...base, evento: 'visita_realizada', fechaVisita: visita.fechaVisita, detalle: null });
      const feedback = document.getElementById('accFeedback')?.value?.trim();
      if (feedback) SEGUIMIENTOS.push({ ...base, id: 's' + (Date.now() + 1), evento: 'feedback', fechaVisita: null, detalle: feedback });
    } else if (tipo === 'cancelar') {
      SEGUIMIENTOS.push({ ...base, evento: 'visita_cancelada', fechaVisita: null, detalle: null });
    } else if (tipo === 'reagendar') {
      const nuevaFecha = document.getElementById('accFecha')?.value;
      if (!nuevaFecha) return;
      SEGUIMIENTOS.push({ ...base, evento: 'visita_cancelada', fechaVisita: null, detalle: 'Reagendada' });
      SEGUIMIENTOS.push({ id: 's' + (Date.now() + 1), leadId: visita.leadId, propiedadId: visita.propiedadId, vendedorId: visita.vendedorId, evento: 'visita_agendada', fechaVisita: new Date(nuevaFecha).toISOString(), detalle: null });
    }
    state.accionVisita = null;
    render();
  }));

  root.querySelectorAll('[data-reporteprop]').forEach((el) => el.addEventListener('change', () => { state.reporte.propiedadId = el.value; render(); }));
  root.querySelectorAll('[data-reporteperiodo]').forEach((el) => el.addEventListener('click', () => { state.reporte.periodo = Number(el.dataset.reporteperiodo); render(); }));
  root.querySelectorAll('[data-descargarinforme]').forEach((el) => el.addEventListener('click', descargarInformePDF));

  root.querySelectorAll('[data-tasaciontipo]').forEach((el) => el.addEventListener('change', () => { state.tasacion.tipo = el.value; render(); }));
  root.querySelectorAll('[data-tasacionzona]').forEach((el) => el.addEventListener('change', () => { state.tasacion.zona = el.value; render(); }));
  root.querySelectorAll('[data-tasacionm2]').forEach((el) => el.addEventListener('input', () => { state.tasacion.m2 = Number(el.value) || 0; render(); }));

  root.querySelectorAll('[data-contratocampo]').forEach((el) => el.addEventListener('input', () => { contratoState[el.dataset.contratocampo] = el.value; render(); }));
  root.querySelectorAll('[data-contratomoneda]').forEach((el) => el.addEventListener('change', () => { contratoState.moneda = el.value; render(); }));
  root.querySelectorAll('[data-descargarcontrato]').forEach((el) => el.addEventListener('click', descargarContratoPDF));
}

render();
