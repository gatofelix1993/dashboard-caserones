// ============================================================
// components/VistaGerencial.jsx — Dashboard KPIs ejecutivos
// Solo lectura — alimentado por inspecciones de inspectores
// Estructura de datos: correas[].items.{estado: ok|alerta|critico}
// ============================================================
import { useMemo } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useRef } from 'react';
import KpiCard       from './KpiCard';
import TendenciaChart from './TendenciaChart';
import { getCorreaStatus } from '../utils/status';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

// ── Donut por estado global de correas ───────────────────────
function DonutEstados({ correas }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const FONT = "'Share Tech Mono', monospace";

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const criticas = correas.filter(c => getCorreaStatus(c) === 'critico').length;
    const alertas  = correas.filter(c => getCorreaStatus(c) === 'alerta').length;
    const normales = correas.filter(c => getCorreaStatus(c) === 'ok').length;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Críticas', 'En alerta', 'Normales'],
        datasets: [{
          data: [criticas, alertas, normales],
          backgroundColor: ['rgba(192,39,45,0.7)', 'rgba(201,139,0,0.7)', 'rgba(30,140,74,0.7)'],
          borderColor:     ['#c0272d', '#c98b00', '#1e8c4a'],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#5a7080', font: { family: FONT, size: 11 }, padding: 12, boxWidth: 12 },
          },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} correas` },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [correas]);

  return (
    <div className="chart-canvas-wrap chart-canvas-wrap--donut">
      <canvas ref={canvasRef} />
    </div>
  );
}

// ── Barras por área ──────────────────────────────────────────
function BarrasPorArea({ correas }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const FONT = "'Share Tech Mono', monospace";

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const areas = [...new Set(correas.map(c => c.area))].sort();
    const criticas = areas.map(a => correas.filter(c => c.area === a && getCorreaStatus(c) === 'critico').length);
    const alertas  = areas.map(a => correas.filter(c => c.area === a && getCorreaStatus(c) === 'alerta').length);
    const normales = areas.map(a => correas.filter(c => c.area === a && getCorreaStatus(c) === 'ok').length);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: areas.map(a => `Área ${a}`),
        datasets: [
          { label: 'Críticas', data: criticas, backgroundColor: 'rgba(192,39,45,0.7)', borderColor: '#c0272d', borderWidth: 1, borderRadius: 3 },
          { label: 'Alerta',   data: alertas,  backgroundColor: 'rgba(201,139,0,0.7)',  borderColor: '#c98b00', borderWidth: 1, borderRadius: 3 },
          { label: 'Normal',   data: normales, backgroundColor: 'rgba(30,140,74,0.7)',  borderColor: '#1e8c4a', borderWidth: 1, borderRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        plugins: {
          legend: {
            labels: { color: '#5a7080', font: { family: FONT, size: 11 }, boxWidth: 12, padding: 14 },
          },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#5a7080', font: { family: FONT, size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { stacked: true, ticks: { color: '#5a7080', font: { family: FONT, size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [correas]);

  return (
    <div className="chart-canvas-wrap chart-canvas-wrap--bar">
      <canvas ref={canvasRef} />
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function VistaGerencial({ data, onLogout, usuario }) {
  const correas = data.correas;

  const stats = useMemo(() => {
    const criticas = correas.filter(c => getCorreaStatus(c) === 'critico').length;
    const alertas  = correas.filter(c => getCorreaStatus(c) === 'alerta').length;
    const normales = correas.filter(c => getCorreaStatus(c) === 'ok').length;
    const total    = correas.length;
    const pctNormal = Math.round((normales / total) * 100);

    // Ítems más críticos globalmente
    const itemsCriticos = {};
    correas.forEach(c => {
      Object.entries(c.items).forEach(([key, val]) => {
        if (!itemsCriticos[key]) itemsCriticos[key] = { critico: 0, alerta: 0 };
        if (val.estado === 'critico') itemsCriticos[key].critico++;
        if (val.estado === 'alerta')  itemsCriticos[key].alerta++;
      });
    });

    // Áreas con más criticidad
    const areas = [...new Set(correas.map(c => c.area))].sort();
    const areaStats = areas.map(area => {
      const lista = correas.filter(c => c.area === area);
      return {
        area,
        total:    lista.length,
        criticas: lista.filter(c => getCorreaStatus(c) === 'critico').length,
        alertas:  lista.filter(c => getCorreaStatus(c) === 'alerta').length,
        normales: lista.filter(c => getCorreaStatus(c) === 'ok').length,
      };
    });

    return { criticas, alertas, normales, total, pctNormal, itemsCriticos, areaStats };
  }, [correas]);

  const ITEM_LABELS = {
    polines: 'Polines', cinta: 'Cinta', raspadores: 'Raspadores',
    protecciones: 'Protecciones', chutes: 'Chutes', poleas: 'Poleas',
    contrapeso: 'Contrapeso', limpieza: 'Limpieza',
  };

  return (
    <div style={S.shell}>
      {/* ── Topbar gerencial ── */}
      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          <div style={S.topbarTitle}>CASERONES</div>
          <div style={S.topbarSep}>|</div>
          <div style={S.topbarSub}>Panel Gerencial</div>
        </div>
        <div style={S.topbarRight}>
          <span style={S.userInfo}>
            <i className="bi bi-person-circle" style={{ fontSize: 16 }}/>
            {usuario?.nombre}
            <span style={S.rolBadge}>Gerente</span>
          </span>
          <button style={S.btnLogout} onClick={onLogout} title="Cerrar sesión">
            <i className="bi bi-box-arrow-right"/>
          </button>
        </div>
      </header>

      <main style={S.main}>
        {/* ── Banner resumen ── */}
        <div style={S.banner}>
          <div>
            <div style={S.bannerTitle}>INSPECCIÓN CINTAS TRANSPORTADORAS</div>
            <div style={S.bannerSub}>Semana N°22 · 28 de mayo 2026 · {stats.total} correas monitoreadas</div>
          </div>
          <div style={S.bannerBadges}>
            {stats.criticas > 0 && <span style={{...S.statBadge, ...S.statCrit}}><i className="bi bi-x-octagon-fill"/> {stats.criticas} Críticas</span>}
            {stats.alertas  > 0 && <span style={{...S.statBadge, ...S.statAlert}}><i className="bi bi-exclamation-triangle-fill"/> {stats.alertas} En alerta</span>}
            <span style={{...S.statBadge, ...S.statOk}}><i className="bi bi-check-circle-fill"/> {stats.normales} Normales</span>
          </div>
        </div>

        {/* ── KPIs fila 1 ── */}
        <div style={S.kpiRow}>
          {[
            { label: 'Operatividad global', value: `${stats.pctNormal}%`, icon: 'bi-activity',        color: stats.pctNormal > 60 ? 'var(--green)' : 'var(--red)', trend: stats.pctNormal > 60 ? '▲ Óptima' : '▼ Revisar' },
            { label: 'Correas críticas',    value: stats.criticas,        icon: 'bi-x-octagon',       color: 'var(--red)',    trend: `de ${stats.total} totales` },
            { label: 'Correas en alerta',   value: stats.alertas,         icon: 'bi-exclamation-triangle', color: 'var(--yellow)', trend: 'requieren atención' },
            { label: 'Correas normales',    value: stats.normales,        icon: 'bi-check-circle',    color: 'var(--green)',  trend: 'sin intervención' },
          ].map(k => (
            <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon}
              accentColor={k.color}
              trend={<span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{k.trend}</span>}
            />
          ))}
        </div>

        {/* ── Gráficos fila 2 ── */}
        <div style={S.chartsRow}>
          <div style={S.chartCard}>
            <div style={S.chartTitle}><i className="bi bi-pie-chart me-2"/>Estado global de correas</div>
            <DonutEstados correas={correas}/>
          </div>
          <div style={{...S.chartCard, flex: 2}}>
            <div style={S.chartTitle}><i className="bi bi-bar-chart-line me-2"/>Correas por área y estado</div>
            <BarrasPorArea correas={correas}/>
          </div>
        </div>

        {/* ── Tendencia mensual ── */}
        <div style={S.chartCard}>
          <div style={S.chartTitle}><i className="bi bi-graph-up me-2"/>Tendencia mensual de intervenciones</div>
          <TendenciaChart data={data.intervencionesMensuales}/>
        </div>

        {/* ── Ítems más críticos ── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Componentes con más hallazgos</div>
          <div style={S.itemsGrid}>
            {Object.entries(stats.itemsCriticos)
              .sort((a, b) => (b[1].critico + b[1].alerta) - (a[1].critico + a[1].alerta))
              .map(([key, val]) => {
                const total = val.critico + val.alerta;
                const pctCrit = Math.round((val.critico / stats.total) * 100);
                return (
                  <div key={key} style={S.itemCard}>
                    <div style={S.itemCardHeader}>
                      <span style={S.itemNombre}>{ITEM_LABELS[key] || key}</span>
                      <span style={{ ...S.itemBadge, ...(val.critico > 0 ? S.badgeCrit : S.badgeAlert) }}>
                        {val.critico > 0 ? `${val.critico} crít.` : `${val.alerta} alert.`}
                      </span>
                    </div>
                    <div style={S.itemBarBg}>
                      <div style={{ ...S.itemBarFill, width: `${Math.min(pctCrit * 2, 100)}%`, background: val.critico > 0 ? '#c0272d' : '#c98b00' }}/>
                    </div>
                    <div style={S.itemStats}>
                      <span style={{ color: '#a01a20' }}>{val.critico} críticos</span>
                      <span style={{ color: '#8a6000' }}>{val.alerta} alertas</span>
                      <span style={{ color: 'var(--text-muted)' }}>{stats.total - total} ok</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ── Tabla resumen por área ── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Resumen por área</div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Área', 'Total correas', 'Críticas', 'En alerta', 'Normales', 'Estado'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.areaStats.map(a => {
                  const peor = a.criticas > 0 ? 'critico' : a.alertas > 0 ? 'alerta' : 'ok';
                  const chipStyle = peor === 'critico' ? S.chipCrit : peor === 'alerta' ? S.chipAlert : S.chipOk;
                  const chipLabel = peor === 'critico' ? 'CRÍTICO' : peor === 'alerta' ? 'ALERTA' : 'NORMAL';
                  return (
                    <tr key={a.area} style={S.tr}>
                      <td style={{...S.td, fontWeight: 700, fontFamily: "'Orbitron',monospace", fontSize: 12, color: '#0d2240'}}>ÁREA {a.area}</td>
                      <td style={{...S.td, textAlign:'center'}}>{a.total}</td>
                      <td style={{...S.td, textAlign:'center', color: a.criticas > 0 ? '#a01a20' : 'var(--text-muted)', fontWeight: a.criticas > 0 ? 700 : 400}}>{a.criticas}</td>
                      <td style={{...S.td, textAlign:'center', color: a.alertas  > 0 ? '#8a6000' : 'var(--text-muted)', fontWeight: a.alertas  > 0 ? 700 : 400}}>{a.alertas}</td>
                      <td style={{...S.td, textAlign:'center', color: '#155a30'}}>{a.normales}</td>
                      <td style={S.td}><span style={{...S.chip, ...chipStyle}}>{chipLabel}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Exportar ── */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 8, paddingBottom: 32 }}>
          <button style={S.btnExport} onClick={() => window.print()}>
            <i className="bi bi-file-earmark-pdf me-2"/>Exportar informe PDF
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const S = {
  shell:   { display:'flex', flexDirection:'column', minHeight:'100dvh', background:'var(--bg-primary)' },
  topbar:  { height: 68, background:'#0d2240', borderBottom:'3px solid #c0272d', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', gap:10, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.18)' },
  topbarLeft: { display:'flex', alignItems:'center', gap:10 },
  topbarTitle:{ fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:900, letterSpacing:3, color:'#c47a2e' },
  topbarSep:  { color:'rgba(255,255,255,0.25)', fontSize:18 },
  topbarSub:  { fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)' },
  topbarRight:{ display:'flex', alignItems:'center', gap:10 },
  userInfo:   { display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.75)', fontFamily:"'Rajdhani',sans-serif", fontSize:15 },
  rolBadge:   { background:'rgba(196,122,46,0.25)', color:'#c47a2e', border:'1px solid rgba(196,122,46,0.4)', borderRadius:4, padding:'2px 8px', fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase' },
  btnLogout:  { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', borderRadius:4, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 },

  main:    { flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 },

  banner:       { background:'#fff', border:'1px solid var(--border-color)', borderLeft:'4px solid #c47a2e', borderRadius:8, padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  bannerTitle:  { fontFamily:"'Orbitron',monospace", fontSize:14, letterSpacing:2, color:'#9a5e1f', fontWeight:700 },
  bannerSub:    { fontFamily:"'Rajdhani',sans-serif", fontSize:14, color:'var(--text-muted)', marginTop:3 },
  bannerBadges: { display:'flex', gap:8, flexWrap:'wrap' },
  statBadge:    { display:'flex', alignItems:'center', gap:6, fontFamily:"'Rajdhani',sans-serif", fontSize:14, fontWeight:700, padding:'6px 14px', borderRadius:20 },
  statCrit:     { background:'rgba(192,39,45,0.1)', color:'#a01a20', border:'1px solid rgba(192,39,45,0.3)' },
  statAlert:    { background:'rgba(201,139,0,0.1)',  color:'#8a6000', border:'1px solid rgba(201,139,0,0.3)' },
  statOk:       { background:'rgba(30,140,74,0.1)',  color:'#155a30', border:'1px solid rgba(30,140,74,0.3)' },

  kpiRow:  { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14 },

  chartsRow:   { display:'flex', gap:16, flexWrap:'wrap' },
  chartCard:   { flex:1, minWidth:280, background:'#fff', border:'1px solid var(--border-color)', borderRadius:8, padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  chartTitle:  { fontFamily:"'Share Tech Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:1.5, color:'var(--text-label)', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center' },

  section:      { background:'#fff', border:'1px solid var(--border-color)', borderRadius:8, padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  sectionTitle: { fontFamily:"'Share Tech Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:1.5, color:'var(--text-label)', textTransform:'uppercase', marginBottom:14, display:'flex', alignItems:'center' },

  itemsGrid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10 },
  itemCard:       { background:'var(--bg-card-deep)', border:'1px solid var(--border-color)', borderRadius:8, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 },
  itemCardHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 },
  itemNombre:     { fontFamily:"'Rajdhani',sans-serif", fontSize:15, fontWeight:700, color:'var(--text-primary)' },
  itemBadge:      { fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4 },
  badgeCrit:      { background:'rgba(192,39,45,0.1)', color:'#a01a20', border:'1px solid rgba(192,39,45,0.3)' },
  badgeAlert:     { background:'rgba(201,139,0,0.1)',  color:'#8a6000', border:'1px solid rgba(201,139,0,0.3)' },
  itemBarBg:      { height:6, background:'var(--border-light)', borderRadius:3, overflow:'hidden' },
  itemBarFill:    { height:'100%', borderRadius:3, transition:'width 0.4s' },
  itemStats:      { display:'flex', justifyContent:'space-between', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:600 },

  tableWrap: { overflowX:'auto', borderRadius:8, border:'1px solid var(--border-color)' },
  table:     { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th:        { fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--text-label)', textTransform:'uppercase', padding:'10px 16px', textAlign:'left', background:'var(--bg-card-deep)', borderBottom:'1px solid var(--border-color)', whiteSpace:'nowrap' },
  tr:        { borderBottom:'1px solid var(--border-light)' },
  td:        { padding:'10px 16px', fontFamily:"'Rajdhani',sans-serif", fontSize:14, color:'var(--text-secondary)' },
  chip:      { display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:4, fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:0.5 },
  chipCrit:  { background:'rgba(192,39,45,0.1)', color:'#a01a20', border:'1px solid rgba(192,39,45,0.3)' },
  chipAlert: { background:'rgba(201,139,0,0.1)',  color:'#7a5000', border:'1px solid rgba(201,139,0,0.3)' },
  chipOk:    { background:'rgba(30,140,74,0.1)',  color:'#155a30', border:'1px solid rgba(30,140,74,0.3)' },

  btnExport: { background:'#c0272d', border:'none', borderRadius:6, padding:'11px 22px', color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', letterSpacing:0.3 },
};
