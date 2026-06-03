// ============================================================
// components/FlujoProceso.jsx — Diagrama flujo proceso minero
// Vista gerencial: Mina → Chancado → Molienda → Flotación → Concentraducto
// Click en correa → navega al detalle (VistaCorrea)
// ============================================================
import { useMemo } from 'react';
import { getCorreaStatus } from '../utils/status';

// ── Helpers ──────────────────────────────────────────────────
function statusColor(estado) {
  if (estado === 'critico') return '#c0272d';
  if (estado === 'alerta')  return '#c98b00';
  return '#1e8c4a';
}
function statusBg(estado) {
  if (estado === 'critico') return 'rgba(192,39,45,0.10)';
  if (estado === 'alerta')  return 'rgba(201,139,0,0.10)';
  return 'rgba(30,140,74,0.08)';
}
function statusBorder(estado) {
  if (estado === 'critico') return 'rgba(192,39,45,0.45)';
  if (estado === 'alerta')  return 'rgba(201,139,0,0.45)';
  return 'rgba(30,140,74,0.35)';
}
function statusLabel(estado) {
  if (estado === 'critico') return 'CRÍTICO';
  if (estado === 'alerta')  return 'Alerta';
  return 'Normal';
}

// ── Nodo de proceso (no clickeable, informativo) ──────────────
function NodoProceso({ titulo, subtitulo, color = '#1e6fa5', width = 260 }) {
  return (
    <div style={{ ...S.nodoProceso, width, borderColor: color + '55', background: color + '08' }}>
      <div style={{ ...S.nodoProcesoTitulo, color }}>{titulo}</div>
      {subtitulo && <div style={S.nodoProcesoSub}>{subtitulo}</div>}
    </div>
  );
}

// ── Nodo de correa (clickeable) ───────────────────────────────
function NodoCorrea({ correa, onSelect, critica = false }) {
  const estado  = getCorreaStatus(correa);
  const criticos = Object.values(correa.items).filter(i => i.estado === 'critico').length;
  const alertas  = Object.values(correa.items).filter(i => i.estado === 'alerta').length;

  return (
    <button
      style={{
        ...S.nodoCorrea,
        borderColor:  statusBorder(estado),
        background:   statusBg(estado),
        borderLeft:   `4px solid ${statusColor(estado)}`,
      }}
      onClick={() => onSelect(correa)}
      title={`Ver detalle: ${correa.codigo}`}
    >
      <div style={S.nodoCorreaTop}>
        {critica && <span style={S.critStar} title="Crítica para continuidad">★</span>}
        <span style={{ ...S.nodoCorreaCodigo, color: statusColor(estado) }}>{correa.codigo}</span>
        <span style={{ ...S.estPill, background: statusColor(estado) + '22', color: statusColor(estado), border: `1px solid ${statusColor(estado)}55` }}>
          {correa.numEstaciones} est.
        </span>
      </div>
      <div style={S.nodoCorreaDesc}>{correa.descripcion?.replace('Correa transportadora', 'CV').replace('Correa fierro esponja', 'FE').replace(', area', '·')}</div>
      <div style={S.nodoCorreaBottom}>
        <span style={{ ...S.estadoChip, color: statusColor(estado) }}>
          <span style={{ ...S.dot, background: statusColor(estado) }}/>{statusLabel(estado)}
        </span>
        {criticos > 0 && <span style={S.badgeCrit}>{criticos} crít.</span>}
        {alertas  > 0 && <span style={S.badgeAlert}>{alertas} alert.</span>}
        <span style={S.verDetalle}><i className="bi bi-arrow-right-circle"/></span>
      </div>
    </button>
  );
}

// ── Grupo de correas FE en paralelo ──────────────────────────
function GrupoFE({ correas, onSelect }) {
  const totalCrit = correas.filter(c => getCorreaStatus(c) === 'critico').length;
  const totalAlert = correas.filter(c => getCorreaStatus(c) === 'alerta').length;
  const peorEstado = totalCrit > 0 ? 'critico' : totalAlert > 0 ? 'alerta' : 'ok';
  const totalEst = correas.reduce((a, c) => a + c.numEstaciones, 0);

  return (
    <div style={{ ...S.grupoFE, borderColor: statusBorder(peorEstado), background: statusBg(peorEstado) }}>
      <div style={S.grupoFEHeader}>
        <span style={{ ...S.grupoFETitulo, color: statusColor(peorEstado) }}>
          FE-001…FE-{String(correas.length).padStart(3,'0')} · Área {correas[0]?.area}
        </span>
        <span style={{ ...S.estPill, background: statusColor(peorEstado)+'22', color: statusColor(peorEstado), border:`1px solid ${statusColor(peorEstado)}55` }}>
          {totalEst} est.
        </span>
      </div>
      <div style={S.grupoFESub}>
        {correas.length} correas FE
        {totalCrit > 0 && <span style={S.badgeCrit}>{totalCrit} CRÍTICAS</span>}
        {totalAlert > 0 && <span style={S.badgeAlert}>{totalAlert} alertas</span>}
        · {Math.round(correas.reduce((a,c)=>a+c.numEstaciones,0)/correas.length)}-{Math.max(...correas.map(c=>c.numEstaciones))} est. c/u
      </div>
      <div style={S.grupoFEGrid}>
        {correas.map(c => {
          const est = getCorreaStatus(c);
          return (
            <button key={c.id} style={{ ...S.grupoFEItem, borderColor: statusBorder(est), background: '#fff', color: statusColor(est) }} onClick={() => onSelect(c)}>
              <span style={S.grupoFEItemCodigo}>{c.codigo.split('-').slice(1).join('-')}</span>
              <span style={{ ...S.dot, background: statusColor(est), width:7, height:7 }}/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Flecha ────────────────────────────────────────────────────
function Flecha({ horizontal = false, dashed = false, label = '' }) {
  return (
    <div style={{ ...S.flechaWrap, flexDirection: horizontal ? 'row' : 'column', alignItems: 'center' }}>
      {label && <span style={S.flechaLabel}>{label}</span>}
      <div style={{
        ...S.flechaLinea,
        width:  horizontal ? 40 : 2,
        height: horizontal ? 2  : 28,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: dashed ? '#c98b00' : 'var(--border-color)',
        borderWidth: horizontal ? '0 0 2px 0' : '0 0 0 2px',
      }}/>
      <div style={{ ...S.flechaPunta, transform: horizontal ? 'rotate(-90deg)' : 'none' }}>▼</div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function FlujoProceso({ correas, onSelectCorrea }) {
  const byId = useMemo(() => Object.fromEntries(correas.map(c => [c.id, c])), [correas]);

  const get = (id) => byId[id] || {
    id, codigo: id, nombre: id, area: id.split('-')[0],
    numEstaciones: 0, items: {}, descripcion: id, historial: [],
    color: '#888',
  };

  const fe2200 = correas.filter(c => c.area === '2200' && c.tipo === 'FE');
  const cv023  = get('3300-CV-023');
  const cv024  = get('3300-CV-024');
  const cv025  = get('3300-CV-025');
  const cv026  = get('3300-CV-026');
  const cv027  = get('3300-CV-027');

  // Stats globales
  const totalEst   = correas.reduce((a,c) => a + c.numEstaciones, 0);
  const totalCrit  = correas.filter(c => getCorreaStatus(c) === 'critico').length;
  const totalAlert = correas.filter(c => getCorreaStatus(c) === 'alerta').length;

  return (
    <div style={S.shell}>

      {/* Leyenda */}
      <div style={S.leyenda}>
        <span style={S.leyendaItem}><span style={{ ...S.dot, background:'#c0272d', width:10, height:10 }}/> Crítico</span>
        <span style={S.leyendaItem}><span style={{ ...S.dot, background:'#c98b00', width:10, height:10 }}/> Alerta</span>
        <span style={S.leyendaItem}><span style={{ ...S.dot, background:'#1e8c4a', width:10, height:10 }}/> Normal</span>
        <span style={{ ...S.leyendaItem, color:'#c98b00', fontStyle:'italic' }}>- - ▶ Carga circulante</span>
        <span style={S.leyendaItem}><span style={{ color:'#c0272d', fontWeight:700 }}>★</span> Crítica para continuidad</span>
        <span style={S.leyendaItem}>[N] = Nº estaciones de polines · clic para ver detalle</span>
      </div>

      {/* Diagrama */}
      <div style={S.diagrama}>

        {/* 1. Mina */}
        <NodoProceso titulo="Mina rajo abierto" subtitulo="4.600 m.s.n.m · 4.000 t/h" color="#5a7080"/>
        <Flecha/>

        {/* 2. CV-001 área 2100 */}
        <NodoCorrea correa={get('2100-CV-001')} onSelect={onSelectCorrea}/>
        <Flecha/>

        {/* 3. Chancado primario */}
        <NodoProceso titulo="Chancado primario" subtitulo="Trituradora giratoria" color="#5a7080"/>

        {/* Split via CV / via FE */}
        <div style={S.splitRow}>
          <div style={S.splitCol}>
            <div style={S.splitLabel}>via CV</div>
            <Flecha/>
            <NodoCorrea correa={get('2200-CV-001')} onSelect={onSelectCorrea} critica/>
          </div>
          <div style={S.splitCol}>
            <div style={S.splitLabel}>via FE</div>
            <Flecha/>
            <GrupoFE correas={fe2200} onSelect={onSelectCorrea}/>
          </div>
        </div>

        <Flecha/>

        {/* 4. Molienda SAG */}
        <div style={S.moliendaRow}>
          <div style={S.moliendaBox}>
            <div style={{ ...S.nodoProcesoTitulo, color:'#1e6fa5', fontSize:15 }}>Molienda SAG + molino bolas</div>
            <div style={S.nodoProcesoSub}>Alimentado por CV-001 + FE-001…006</div>
            <div style={{ ...S.nodoProcesoSub, color:'#1e6fa5' }}>Genera pebbles → recirculan ↑</div>
          </div>
          {/* Carga circulante */}
          <div style={S.cargaCirculante}>
            <div style={S.cargaCirculanteLabel}>CARGA CIRCULANTE</div>
            <NodoCorrea correa={get('3300-CV-021')} onSelect={onSelectCorrea} critica/>
          </div>
        </div>

        <Flecha/>

        {/* 5. CV-022 principal */}
        <NodoCorrea correa={get('3300-CV-022')} onSelect={onSelectCorrea} critica/>
        <Flecha/>

        {/* 6. Harnero */}
        <NodoProceso titulo="Harnero · clasificación" subtitulo="Finos → 5 rutas paralelas a flotación · Pebbles → recirculan ↑" color="#1e6fa5"/>
        <Flecha/>

        {/* 7. 5 correas paralelas CV-023..027 */}
        <div style={S.paralelas}>
          {[cv023, cv024, cv025, cv026, cv027].map(c => (
            <NodoCorrea key={c.id} correa={c} onSelect={onSelectCorrea}/>
          ))}
        </div>
        <Flecha/>

        {/* 8. Flotación */}
        <NodoProceso titulo="Flotación Rougher + Cleaner" subtitulo="Recupera Cu y Mo · colas a relave" color="#1e6fa5"/>
        <Flecha/>

        {/* 9. CV-001 y CV-002 área 5300 */}
        <div style={S.paralelasDos}>
          <NodoCorrea correa={get('5300-CV-001')} onSelect={onSelectCorrea}/>
          <NodoCorrea correa={get('5300-CV-002')} onSelect={onSelectCorrea}/>
        </div>
        <Flecha/>

        {/* 10. Separación Cu/Mo */}
        <NodoProceso titulo="Separación Cu / Mo" subtitulo="Flotación + espesamiento + filtrado" color="#1e6fa5"/>
        <Flecha/>

        {/* 11. CV-001 área 7200 */}
        <NodoCorrea correa={get('7200-CV-001')} onSelect={onSelectCorrea}/>
        <Flecha/>

        {/* 12. Concentraducto */}
        <NodoProceso titulo="Concentraducto · Punta Chungo" subtitulo="120 km · exportación a Japón" color="#5a7080"/>

        {/* Footer stats */}
        <div style={S.footer}>
          Total sistema: <strong>{totalEst}</strong> estaciones de polines monitoreadas · semana 22 · 28-05-2026
          {totalCrit > 0 && <> · <span style={{ color:'#c0272d', fontWeight:700 }}>{totalCrit} correas críticas</span></>}
          {totalAlert > 0 && <> · <span style={{ color:'#c98b00', fontWeight:700 }}>{totalAlert} en alerta</span></>}
        </div>
      </div>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────
const S = {
  shell:   { width:'100%', display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 8px 32px' },

  leyenda: { display:'flex', flexWrap:'wrap', gap:'12px 24px', marginBottom:20, padding:'10px 16px', background:'#fff', border:'1px solid var(--border-color)', borderRadius:8, fontSize:12, fontFamily:"'Rajdhani',sans-serif", color:'var(--text-muted)', alignItems:'center' },
  leyendaItem: { display:'flex', alignItems:'center', gap:6 },

  diagrama: { display:'flex', flexDirection:'column', alignItems:'center', gap:0, width:'100%', maxWidth:780 },

  // Nodo proceso
  nodoProceso:      { border:'1px solid', borderRadius:8, padding:'12px 20px', textAlign:'center', margin:'0 auto' },
  nodoProcesoTitulo:{ fontFamily:"'Rajdhani',sans-serif", fontSize:15, fontWeight:700, marginBottom:2 },
  nodoProcesoSub:   { fontFamily:"'Rajdhani',sans-serif", fontSize:12, color:'var(--text-muted)' },

  // Nodo correa
  nodoCorrea:       { border:'1px solid', borderRadius:8, padding:'10px 14px', width:280, textAlign:'left', cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s', background:'#fff', margin:'0 auto', display:'flex', flexDirection:'column', gap:6 },
  nodoCorreaTop:    { display:'flex', alignItems:'center', gap:6 },
  nodoCorreaCodigo: { fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, flex:1 },
  nodoCorreaDesc:   { fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:'var(--text-muted)', lineHeight:1.3 },
  nodoCorreaBottom: { display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' },
  critStar:         { color:'#c0272d', fontSize:14, fontWeight:700, flexShrink:0 },
  estPill:          { fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, flexShrink:0 },
  estadoChip:       { display:'flex', alignItems:'center', gap:4, fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700 },
  dot:              { width:6, height:6, borderRadius:'50%', display:'inline-block', flexShrink:0 },
  badgeCrit:        { fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'rgba(192,39,45,0.1)', color:'#a01a20', border:'1px solid rgba(192,39,45,0.3)' },
  badgeAlert:       { fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'rgba(201,139,0,0.1)',  color:'#7a5000', border:'1px solid rgba(201,139,0,0.3)' },
  verDetalle:       { marginLeft:'auto', color:'var(--text-muted)', fontSize:14 },

  // Grupo FE
  grupoFE:       { border:'1px solid', borderRadius:8, padding:'12px 14px', width:280, margin:'0 auto', display:'flex', flexDirection:'column', gap:8 },
  grupoFEHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 },
  grupoFETitulo: { fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700 },
  grupoFESub:    { fontFamily:"'Rajdhani',sans-serif", fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' },
  grupoFEGrid:   { display:'flex', gap:6, flexWrap:'wrap' },
  grupoFEItem:   { border:'1px solid', borderRadius:6, padding:'4px 10px', fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5, background:'#fff' },
  grupoFEItemCodigo: { fontFamily:"'Share Tech Mono',monospace", fontSize:11 },

  // Split CV / FE
  splitRow:  { display:'flex', gap:40, alignItems:'flex-start', width:'100%', justifyContent:'center', margin:'0' },
  splitCol:  { display:'flex', flexDirection:'column', alignItems:'center', gap:0 },
  splitLabel:{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--text-muted)', letterSpacing:1, padding:'4px 0' },

  // Molienda + carga circulante
  moliendaRow:          { display:'flex', gap:24, alignItems:'center', justifyContent:'center', width:'100%' },
  moliendaBox:          { border:'1px solid rgba(30,111,165,0.3)', borderRadius:8, padding:'12px 20px', textAlign:'center', background:'rgba(30,111,165,0.05)', minWidth:260 },
  cargaCirculante:      { display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  cargaCirculanteLabel: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'#c98b00', letterSpacing:1, fontWeight:700, border:'1px dashed #c98b00', borderRadius:4, padding:'3px 8px', background:'rgba(201,139,0,0.06)' },

  // Correas paralelas (5 rutas)
  paralelas:    { display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', width:'100%' },
  paralelasDos: { display:'flex', gap:24, justifyContent:'center', width:'100%' },

  // Flecha
  flechaWrap:  { display:'flex', flexDirection:'column', alignItems:'center', gap:0, height:36, justifyContent:'center' },
  flechaLinea: { borderStyle:'solid', borderColor:'var(--border-color)' },
  flechaPunta: { color:'var(--border-color)', fontSize:10, lineHeight:1, marginTop:-2 },
  flechaLabel: { fontFamily:"'Rajdhani',sans-serif", fontSize:10, color:'var(--text-muted)' },

  footer: { marginTop:24, fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:'var(--text-muted)', textAlign:'center', borderTop:'1px solid var(--border-color)', paddingTop:14, width:'100%' },
};
