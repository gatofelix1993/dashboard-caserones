// ============================================================
// components/VistaGerencial.jsx — Panel ejecutivo gerente
// Vista principal: flujo de proceso minero completo
// Click en correa → navega al detalle (VistaCorrea)
// ============================================================
import { useState, useCallback } from 'react';
import FlujoProceso  from './FlujoProceso';
import VistaCorrea   from './VistaCorrea';
import { getCorreaStatus } from '../utils/status';

export default function VistaGerencial({ data, usuario, onLogout }) {
  const [correaActiva, setCorreaActiva] = useState(null);

  const handleSelectCorrea = useCallback((correa) => {
    const correaConDatos = data.correas.find(c => c.id === correa.id) || correa;
    setCorreaActiva(correaConDatos);
  }, [data.correas]);

  const handleBack = useCallback(() => setCorreaActiva(null), []);

  // Stats rápidos para el topbar
  const criticas = data.correas.filter(c => getCorreaStatus(c) === 'critico').length;
  const alertas  = data.correas.filter(c => getCorreaStatus(c) === 'alerta').length;

  return (
    <div style={S.shell}>

      {/* Topbar */}
      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          {correaActiva && (
            <button style={S.btnBack} onClick={handleBack} title="Volver al flujo">
              <i className="bi bi-arrow-left"/>
            </button>
          )}
          <div style={S.topbarTitle}>CASERONES</div>
          <div style={S.topbarSep}>|</div>
          <div style={S.topbarSub}>
            {correaActiva ? `${correaActiva.codigo} — ${correaActiva.nombre}` : 'Panel Gerencial'}
          </div>
        </div>
        <div style={S.topbarRight}>
          {/* Badges de estado global */}
          {!correaActiva && (
            <div style={S.statBadges}>
              {criticas > 0 && (
                <span style={{ ...S.statBadge, ...S.statCrit }}>
                  <i className="bi bi-x-octagon-fill"/> {criticas} críticas
                </span>
              )}
              {alertas > 0 && (
                <span style={{ ...S.statBadge, ...S.statAlert }}>
                  <i className="bi bi-exclamation-triangle-fill"/> {alertas} alertas
                </span>
              )}
              <span style={{ ...S.statBadge, ...S.statOk }}>
                <i className="bi bi-check-circle-fill"/> {data.correas.length - criticas - alertas} normales
              </span>
            </div>
          )}
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

      {/* Contenido */}
      <main style={S.main}>
        {!correaActiva ? (
          <FlujoProceso
            correas={data.correas}
            onSelectCorrea={handleSelectCorrea}
          />
        ) : (
          // Solo lectura: sin botón de nueva inspección
          <VistaCorrea
            correa={correaActiva}
            onBack={handleBack}
            onNuevaInspeccion={null}
            onInformeUnitario={null}
            soloLectura
          />
        )}
      </main>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────
const S = {
  shell: { display:'flex', flexDirection:'column', minHeight:'100dvh', background:'var(--bg-primary)' },
  topbar: { height:68, background:'#0d2240', borderBottom:'3px solid #c0272d', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', gap:10, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.18)', flexWrap:'wrap' },
  topbarLeft:  { display:'flex', alignItems:'center', gap:10 },
  topbarTitle: { fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:900, letterSpacing:3, color:'#c47a2e' },
  topbarSep:   { color:'rgba(255,255,255,0.25)', fontSize:18 },
  topbarSub:   { fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)' },
  topbarRight: { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' },
  statBadges:  { display:'flex', gap:8, flexWrap:'wrap' },
  statBadge:   { display:'flex', alignItems:'center', gap:6, fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, padding:'5px 12px', borderRadius:20 },
  statCrit:    { background:'rgba(192,39,45,0.25)',  color:'#ffaaaa', border:'1px solid rgba(192,39,45,0.5)' },
  statAlert:   { background:'rgba(201,139,0,0.25)',  color:'#ffd080', border:'1px solid rgba(201,139,0,0.5)' },
  statOk:      { background:'rgba(30,140,74,0.20)',  color:'#80ffb0', border:'1px solid rgba(30,140,74,0.4)' },
  userInfo:    { display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.75)', fontFamily:"'Rajdhani',sans-serif", fontSize:15 },
  rolBadge:    { background:'rgba(196,122,46,0.25)', color:'#c47a2e', border:'1px solid rgba(196,122,46,0.4)', borderRadius:4, padding:'2px 8px', fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase' },
  btnLogout:   { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', borderRadius:4, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 },
  btnBack:     { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.8)', borderRadius:4, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 },
  main:  { flex:1, overflowY:'auto', padding:'20px 24px' },
};
