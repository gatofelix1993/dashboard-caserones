// ============================================================
// components/VistaCorrea.jsx — v4.1 tema claro
// Vista detalle correa — mobile-first — solo lectura gerente
// ============================================================
import { useState, useMemo } from 'react';
import { getCorreaStatus } from '../utils/status';
import { ITEMS_CONFIG } from '../data/constants';

const FU = "'Rajdhani', sans-serif";
const FM = "'Share Tech Mono', monospace";
const FT = "'Orbitron', monospace";

function sc(e) { return e==='critico'?'#c0272d':e==='alerta'?'#c98b00':'#1e8c4a'; }
function sb(e) { return e==='critico'?'rgba(192,39,45,0.09)':e==='alerta'?'rgba(201,139,0,0.08)':'rgba(30,140,74,0.07)'; }
function sl(e) { return e==='critico'?'CRÍTICO':e==='alerta'?'ALERTA':'NORMAL'; }

// ── Datos mock ───────────────────────────────────────────────
function generarDatosMock(correa) {
  const seed = correa.codigo.charCodeAt(0) + correa.numEstaciones;
  const est  = getCorreaStatus(correa);

  const estacionesFalla = (correa.estaciones || [])
    .map(e => {
      const polines = [
        { pos: 'Izquierdo', ...e.izquierdo },
        { pos: 'Central',   ...e.central   },
        { pos: 'Derecho',   ...e.derecho   },
      ].filter(p => p.estado !== 'ok');
      return polines.length > 0 ? { numero: e.numero, polines } : null;
    })
    .filter(Boolean);

  // Helpers deterministas
  const sapCode = (b) => `1${String((seed * b * 7 + 49297) % 90000000 + 10000000)}`;
  const stockOf = (b) => ((seed * b + 49297) % 4 === 0) ? 0 : ((seed * b + 49297) % 15) + 1;
  const entrega = (b) => {
    const m = ((seed * b) % 6) + 1;
    const d = ((seed * b) % 20) + 5;
    return `2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  };

  // 7 componentes con repuesto (sin limpieza)
  const repuestos = [
    { key:'polines',      label:'Polines de carga HD-150',         descripcion:'Polín de carga HD-150, Ø150mm, L=1200mm',          sap:sapCode(3),  unidad:'un.',       stock:stockOf(3),  rack:`B-${(seed%9)+1}` },
    { key:'cinta',        label:'Cinta transportadora EP-500/4',   descripcion:'Cinta EP-500/4, cubierta 8+3mm, ancho 1200mm',      sap:sapCode(7),  unidad:'m lineales',stock:stockOf(7),  rack:`C-${(seed%6)+1}` },
    { key:'raspadores',   label:'Palmetas raspador primario',       descripcion:'Palmeta poliuretano 70 Shore A, 150×200mm',         sap:sapCode(11), unidad:'un.',       stock:stockOf(11), rack:`A-${(seed%5)+1}` },
    { key:'protecciones', label:'Cubiertas de protección lateral',  descripcion:'Cubierta HDPE calibre 8mm, kit completo',           sap:sapCode(13), unidad:'un.',       stock:stockOf(13), rack:`D-${(seed%4)+1}` },
    { key:'chutes',       label:'Revestimiento chute de carga',     descripcion:'Revestimiento caucho 60 Shore A, 500×500mm',        sap:sapCode(17), unidad:'un.',       stock:stockOf(17), rack:`D-${(seed%3)+2}` },
    { key:'poleas',       label:'Revestimiento de polea',           descripcion:'Revestimiento cerámico Ø630mm, espesor 12mm',       sap:sapCode(19), unidad:'un.',       stock:stockOf(19), rack:`E-${(seed%5)+1}` },
    { key:'contrapeso',   label:'Contrapeso tensor',                descripcion:'Contrapeso fundición gris, 250 kg c/u',             sap:sapCode(23), unidad:'un.',       stock:stockOf(23), rack:`F-${(seed%3)+1}` },
  ].map(r => ({
    ...r,
    disponible:      r.stock > 0,
    ubicacion:       r.stock > 0 ? `Bodega Central · Rack ${r.rack}` : 'Sin stock',
    proximaEntrega:  r.stock === 0 ? entrega(r.sap.charCodeAt(0)) : null,
  }));

  return {
    observacion: correa.items?.polines?.notas || correa.items?.cinta?.notas || 'Sin observaciones registradas.',

    imagenes: est === 'ok' ? [] : [
      { id:1, titulo:`${correa.codigo} — Polín con falla`,  fecha:correa.ultimaInspeccion, inspector:correa.responsable, descripcion:'Polín con desgaste severo en manto.' },
      { id:2, titulo:`${correa.codigo} — Detalle cinta`,    fecha:correa.ultimaInspeccion, inspector:correa.responsable, descripcion:'Sector de cinta con exposición de carcasa textil.' },
    ],

    repuestos,

    reparacion: {
      estimadoHoras: est==='critico' ? (seed%6)+4 : (seed%4)+1,
      hh:            est==='critico' ? (seed%3)+2 : 1,
      requiereParo:  est==='critico',
      prioridad:     est==='critico' ? 'INMEDIATA' : est==='alerta' ? 'PROGRAMADA' : 'RUTINA',
      aviso:         correa.items?.cinta?.notas?.match(/\d{8,}/)?.[0] || null,
    },

    disponibilidad: {
      mttr:       est==='critico' ? (seed%5)+4 : (seed%3)+1,
      mtbf:       (seed%120)+80,
      porcentaje: est==='critico' ? (88+seed%6).toFixed(1) : est==='alerta' ? (92+seed%5).toFixed(1) : (96+seed%4).toFixed(1),
      objetivo:   '95.0',
    },

    historialMantencion: [
      { componente:'Polines de carga',     fecha:`2026-0${(seed%3)+1}-${String(seed%20+1).padStart(2,'0')}`,                              tipo:'Reemplazo',  responsable:correa.responsable },
      { componente:'Cinta transportadora', fecha:`2025-${String((seed%6)+7).padStart(2,'0')}-${String(seed%25+1).padStart(2,'0')}`,        tipo:'Inspección', responsable:correa.responsable },
      { componente:'Raspadores',           fecha:`2026-0${(seed%2)+1}-${String(seed%15+5).padStart(2,'0')}`,                              tipo:'Ajuste',     responsable:correa.responsable },
      { componente:'Poleas',               fecha:`2025-${String((seed%4)+9).padStart(2,'0')}-${String(seed%20+3).padStart(2,'0')}`,        tipo:'Inspección', responsable:correa.responsable },
    ],

    recurrencia: {
      total30d: est==='critico' ? (seed%5)+3 : est==='alerta' ? (seed%3)+1 : 0,
      porComponente: [
        { componente:'Polines',    fallas: est==='critico' ? (seed%4)+2 : (seed%2) },
        { componente:'Cinta',      fallas: est==='critico' ? (seed%3)+1 : (seed%2) },
        { componente:'Raspadores', fallas: seed%2 },
        { componente:'Poleas',     fallas: seed%2 },
      ],
    },

    estacionesFalla,
  };
}

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ══════════════════════════════════════════════════════════════

function EstadoBadge({ est, grande=false }) {
  const col = sc(est);
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:sb(est), border:`1.5px solid ${col}55`,
      borderRadius:20, padding: grande ? '5px 14px' : '3px 10px',
      fontFamily:FU, fontSize: grande ? 14 : 11, fontWeight:700, color:col,
    }}>
      <span style={{width:grande?8:6, height:grande?8:6, borderRadius:'50%', background:col, display:'inline-block'}}/>
      {sl(est)}
    </span>
  );
}

function SeccionCard({ titulo, icono, children, color='#1e6fa5', colapsable=false, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{background:'#fff', border:'1px solid #dde3ec', borderRadius:12, overflow:'hidden', marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
      <button onClick={()=>colapsable&&setOpen(o=>!o)} style={{
        width:'100%', background:color+'0d', borderLeft:`4px solid ${color}`,
        border:'none', borderBottom: open ? `1px solid ${color}22` : 'none',
        padding:'12px 16px', cursor:colapsable?'pointer':'default',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, textAlign:'left',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <i className={`bi ${icono}`} style={{fontSize:16, color}}/>
          <span style={{fontFamily:FU, fontSize:15, fontWeight:700, color}}>{titulo}</span>
        </div>
        {colapsable && <i className={`bi bi-chevron-${open?'up':'down'}`} style={{color:'#8a9aaa', fontSize:14}}/>}
      </button>
      {open && <div style={{padding:'14px 16px'}}>{children}</div>}
    </div>
  );
}

function FilaDato({ label, valor, color, mono=false, badge=false }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #edf1f7'}}>
      <span style={{fontFamily:FU, fontSize:13, color:'#6a7a8a'}}>{label}</span>
      {badge
        ? <EstadoBadge est={valor}/>
        : <span style={{fontFamily:mono?FM:FU, fontSize:13, fontWeight:700, color:color||'#2a3a4a'}}>{valor}</span>
      }
    </div>
  );
}

// ── Tarjeta de repuesto por componente ───────────────────────
function TarjetaRepuesto({ rep }) {
  const col = rep.disponible ? '#1e8c4a' : '#c0272d';
  return (
    <div style={{
      background: rep.disponible ? 'rgba(30,140,74,0.05)' : 'rgba(192,39,45,0.05)',
      border:`1px solid ${col}33`, borderRadius:10, padding:'12px 14px', marginBottom:10,
    }}>
      {/* Encabezado: nombre + badge stock */}
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8}}>
        <div style={{fontFamily:FU, fontSize:13, fontWeight:700, color:'#2a3a4a', lineHeight:1.3}}>
          {rep.label}
        </div>
        <span style={{
          flexShrink:0, fontFamily:FM, fontSize:11, fontWeight:700,
          color:col, background:col+'15', border:`1px solid ${col}44`,
          borderRadius:20, padding:'2px 10px', whiteSpace:'nowrap',
        }}>
          {rep.disponible ? `${rep.stock} ${rep.unidad}` : 'Sin stock'}
        </span>
      </div>
      {/* Descripción */}
      <div style={{fontFamily:FU, fontSize:11, color:'#6a7a8a', marginBottom:8}}>{rep.descripcion}</div>
      {/* Datos: SAP + ubicación + entrega */}
      <div style={{display:'flex', flexDirection:'column', gap:4}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <span style={{fontFamily:FU, fontSize:11, color:'#8a9aaa'}}>Código SAP</span>
          <span style={{fontFamily:FM, fontSize:11, color:'#1e6fa5', fontWeight:700}}>{rep.sap}</span>
        </div>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <span style={{fontFamily:FU, fontSize:11, color:'#8a9aaa'}}>Ubicación</span>
          <span style={{fontFamily:FM, fontSize:11, color:rep.disponible?'#2a3a4a':'#c0272d', fontWeight:700}}>{rep.ubicacion}</span>
        </div>
        {!rep.disponible && rep.proximaEntrega && (
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span style={{fontFamily:FU, fontSize:11, color:'#8a9aaa'}}>Próxima entrega</span>
            <span style={{fontFamily:FM, fontSize:11, color:'#c98b00', fontWeight:700}}>{rep.proximaEntrega}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PolinFalla({ estacion }) {
  return (
    <div style={{background:'#f8f9fb', border:'1px solid #dde3ec', borderRadius:10, padding:'10px 12px', marginBottom:8}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
        <span style={{fontFamily:FM, fontSize:11, fontWeight:700, color:'#c98b00', background:'rgba(201,139,0,0.10)', border:'1px solid rgba(201,139,0,0.3)', borderRadius:6, padding:'3px 10px'}}>
          EST. {estacion.numero}
        </span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:6}}>
        {estacion.polines.map((p,i)=>{
          const col = sc(p.estado);
          return (
            <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:sb(p.estado), border:`1px solid ${col}44`, borderRadius:8, padding:'8px 12px'}}>
              <div>
                <div style={{fontFamily:FU, fontSize:13, fontWeight:700, color:col}}>Polín {p.pos}</div>
                <div style={{fontFamily:FM, fontSize:10, color:'#8a9aaa', marginTop:2}}>
                  {p.horas ? `${p.horas} hrs` : ''}{p.temp ? ` · ${p.temp}°C` : ''}{p.vibracion ? ` · ${p.vibracion} mm/s` : ''}
                </div>
              </div>
              <EstadoBadge est={p.estado}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImagenPlaceholder({ img }) {
  return (
    <div style={{background:'#f8f9fb', border:'1px solid #dde3ec', borderRadius:10, overflow:'hidden', marginBottom:10}}>
      <div style={{width:'100%', aspectRatio:'16/9', background:'#edf1f7', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8}}>
        <i className="bi bi-image" style={{fontSize:40, color:'#cdd5df'}}/>
        <span style={{fontFamily:FU, fontSize:12, color:'#8a9aaa'}}>Imagen pendiente de sincronización</span>
      </div>
      <div style={{padding:'10px 12px'}}>
        <div style={{fontFamily:FU, fontSize:13, fontWeight:700, color:'#2a3a4a'}}>{img.titulo}</div>
        <div style={{display:'flex', gap:12, marginTop:6, flexWrap:'wrap'}}>
          <span style={{fontFamily:FM, fontSize:10, color:'#8a9aaa'}}><i className="bi bi-calendar3"/> {img.fecha}</span>
          <span style={{fontFamily:FM, fontSize:10, color:'#8a9aaa'}}><i className="bi bi-person"/> {img.inspector}</span>
        </div>
        {img.descripcion && <div style={{fontFamily:FU, fontSize:12, color:'#6a7a8a', marginTop:6, lineHeight:1.5}}>{img.descripcion}</div>}
      </div>
    </div>
  );
}

function BarraRecurrencia({ label, fallas, max }) {
  const pct = max > 0 ? (fallas/max)*100 : 0;
  const col = fallas===0 ? '#1e8c4a' : fallas<=1 ? '#c98b00' : '#c0272d';
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
        <span style={{fontFamily:FU, fontSize:13, color:'#6a7a8a'}}>{label}</span>
        <span style={{fontFamily:FM, fontSize:12, fontWeight:700, color:col}}>{fallas} falla{fallas!==1?'s':''}</span>
      </div>
      <div style={{background:'#edf1f7', borderRadius:4, height:7}}>
        <div style={{width:`${pct}%`, background:col, borderRadius:4, height:7, transition:'width 0.4s'}}/>
      </div>
    </div>
  );
}

function IndicadorDisponibilidad({ valor, objetivo }) {
  const num = parseFloat(valor); const obj = parseFloat(objetivo);
  const col = num>=obj ? '#1e8c4a' : num>=obj-3 ? '#c98b00' : '#c0272d';
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:8}}>
        <span style={{fontFamily:FT, fontSize:30, fontWeight:700, color:col}}>{valor}%</span>
        <span style={{fontFamily:FU, fontSize:12, color:'#8a9aaa'}}>Objetivo: {objetivo}%</span>
      </div>
      <div style={{background:'#edf1f7', borderRadius:6, height:10, marginBottom:8}}>
        <div style={{width:`${Math.min(num,100)}%`, background:col, borderRadius:6, height:10}}/>
      </div>
      <span style={{fontFamily:FU, fontSize:12, color:col, fontWeight:700}}>
        {num>=obj ? `+${(num-obj).toFixed(1)}% sobre objetivo` : `${(obj-num).toFixed(1)}% bajo objetivo`}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function VistaCorrea({ correa, onBack, soloLectura=false }) {
  const [tabActiva, setTabActiva] = useState('estado');
  const est  = getCorreaStatus(correa);
  const col  = sc(est);
  const mock = useMemo(() => generarDatosMock(correa), [correa]);

  const compProblemas = ITEMS_CONFIG.filter(item => correa.items[item.key] && correa.items[item.key].estado !== 'ok');
  const compCriticos  = compProblemas.filter(item => correa.items[item.key].estado === 'critico');

  // Cuántos repuestos tienen stock
  const repConStock = mock.repuestos.filter(r => r.disponible).length;

  const TABS = [
    { id:'estado',     icon:'bi-speedometer2',   label:'Estado'     },
    { id:'polines',    icon:'bi-grid-3x3',        label:'Polines'    },
    { id:'inspeccion', icon:'bi-clipboard-check', label:'Inspección' },
    { id:'historial',  icon:'bi-clock-history',   label:'Historial'  },
  ];

  return (
    <div style={{background:'var(--bg-primary, #f4f6fa)', minHeight:'100dvh', display:'flex', flexDirection:'column'}}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{background:'#fff', borderBottom:`3px solid ${col}`, padding:'14px 16px 0', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
          {onBack && (
            <button onClick={onBack} style={{background:'#f4f6fa', border:'1px solid #dde3ec', borderRadius:8, width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#4a5a6a', fontSize:18, flexShrink:0}}>
              <i className="bi bi-arrow-left"/>
            </button>
          )}
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <span style={{fontFamily:FT, fontSize:15, fontWeight:700, color:col}}>{correa.codigo}</span>
              <EstadoBadge est={est} grande/>
              {soloLectura && (
                <span style={{fontFamily:FM, fontSize:9, color:'#1e6fa5', background:'rgba(30,111,165,0.08)', border:'1px solid rgba(30,111,165,0.25)', borderRadius:4, padding:'2px 7px', letterSpacing:1}}>SOLO LECTURA</span>
              )}
            </div>
            <div style={{fontFamily:FU, fontSize:12, color:'#8a9aaa', marginTop:2}}>{correa.descripcion} · Área {correa.area}</div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12}}>
          {[
            { label:'Estaciones',     valor:correa.numEstaciones,                 icon:'bi-grid-3x3',            col:'#1e6fa5' },
            { label:'Con falla',      valor:compProblemas.length,                 icon:'bi-exclamation-triangle', col:compCriticos.length>0?'#c0272d':'#c98b00' },
            { label:'Disponibilidad', valor:`${mock.disponibilidad.porcentaje}%`, icon:'bi-activity',            col:parseFloat(mock.disponibilidad.porcentaje)>=95?'#1e8c4a':'#c98b00' },
          ].map(k=>(
            <div key={k.label} style={{background:'#f8f9fb', border:'1px solid #dde3ec', borderRadius:8, padding:'8px 6px', textAlign:'center'}}>
              <i className={`bi ${k.icon}`} style={{fontSize:15, color:k.col}}/>
              <div style={{fontFamily:FT, fontSize:16, fontWeight:700, color:k.col, marginTop:2}}>{k.valor}</div>
              <div style={{fontFamily:FU, fontSize:10, color:'#8a9aaa'}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex', borderTop:'1px solid #edf1f7', marginLeft:-16, marginRight:-16}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTabActiva(t.id)} style={{
              flex:1, background:'none', border:'none', cursor:'pointer',
              padding:'10px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              borderBottom: tabActiva===t.id ? `2.5px solid ${col}` : '2.5px solid transparent',
              color: tabActiva===t.id ? col : '#8a9aaa', transition:'all 0.2s',
            }}>
              <i className={`bi ${t.icon}`} style={{fontSize:17}}/>
              <span style={{fontFamily:FU, fontSize:10, fontWeight:700, letterSpacing:0.5}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────── */}
      <div style={{flex:1, overflowY:'auto', padding:'16px 14px 32px'}}>

        {/* ═══ TAB: ESTADO ══════════════════════════════════════ */}
        {tabActiva==='estado' && (
          <div>
            {est==='critico' && (
              <div style={{background:'rgba(192,39,45,0.07)', border:'1.5px solid rgba(192,39,45,0.35)', borderRadius:10, padding:'12px 14px', marginBottom:14, display:'flex', gap:12, alignItems:'flex-start'}}>
                <i className="bi bi-exclamation-octagon-fill" style={{fontSize:22, color:'#c0272d', flexShrink:0, marginTop:1}}/>
                <div>
                  <div style={{fontFamily:FU, fontSize:14, fontWeight:700, color:'#c0272d'}}>Intervención requerida</div>
                  <div style={{fontFamily:FU, fontSize:12, color:'#4a2020', marginTop:4, lineHeight:1.5}}>
                    {compCriticos.length} componente{compCriticos.length>1?'s':''} en estado crítico.
                    Prioridad: <strong style={{color:'#c0272d'}}>{mock.reparacion.prioridad}</strong>.
                    {mock.reparacion.requiereParo && ' Requiere paro de correa.'}
                  </div>
                </div>
              </div>
            )}

            <SeccionCard titulo="Información general" icono="bi-info-circle" color="#1e6fa5">
              <FilaDato label="Código"            valor={correa.codigo} mono/>
              <FilaDato label="Área"              valor={`Área ${correa.area}`}/>
              <FilaDato label="Tipo"              valor={correa.tipo==='CV'?'Transportadora (CV)':'Fierro Esponja (FE)'}/>
              <FilaDato label="Estaciones"        valor={`${correa.numEstaciones} est.`} color="#1e6fa5" mono/>
              <FilaDato label="Responsable"       valor={correa.responsable}/>
              <FilaDato label="Última inspección" valor={correa.ultimaInspeccion} mono/>
              <FilaDato label="Estado global"     valor={est} badge/>
            </SeccionCard>

            <SeccionCard titulo="Estado de componentes" icono="bi-diagram-3" color="#c98b00">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                {ITEMS_CONFIG.map(item=>{
                  const d = correa.items[item.key]; if (!d) return null;
                  const c = sc(d.estado);
                  return (
                    <div key={item.key} style={{background:sb(d.estado), border:`1px solid ${c}44`, borderRadius:8, padding:'10px', display:'flex', flexDirection:'column', gap:6}}>
                      <div style={{display:'flex', alignItems:'center', gap:6}}>
                        <i className={`bi ${item.icon}`} style={{fontSize:13, color:c}}/>
                        <span style={{fontFamily:FU, fontSize:11, fontWeight:700, color:'#2a3a4a'}}>{item.label}</span>
                      </div>
                      <EstadoBadge est={d.estado}/>
                    </div>
                  );
                })}
              </div>
            </SeccionCard>

            <SeccionCard titulo="Tiempo de reparación" icono="bi-tools" color="#c98b00">
              <FilaDato label="Prioridad"       valor={mock.reparacion.prioridad} color={col}/>
              <FilaDato label="Tiempo estimado" valor={`${mock.reparacion.estimadoHoras} hrs`} mono/>
              <FilaDato label="HH requeridas"   valor={`${mock.reparacion.hh} personas`} mono/>
              <FilaDato label="Requiere paro"   valor={mock.reparacion.requiereParo?'⚠ SÍ':'NO'} color={mock.reparacion.requiereParo?'#c0272d':'#1e8c4a'}/>
              {mock.reparacion.aviso && <FilaDato label="N° aviso SAP" valor={mock.reparacion.aviso} color="#1e6fa5" mono/>}
            </SeccionCard>

            <SeccionCard titulo="Disponibilidad" icono="bi-activity" color="#1e8c4a">
              <IndicadorDisponibilidad valor={mock.disponibilidad.porcentaje} objetivo={mock.disponibilidad.objetivo}/>
              <div style={{marginTop:14}}>
                <FilaDato label="MTBF (tiempo entre fallas)" valor={`${mock.disponibilidad.mtbf} hrs`} mono color="#1e6fa5"/>
                <FilaDato label="MTTR (tiempo reparación)"   valor={`${mock.disponibilidad.mttr} hrs`}  mono color="#1e6fa5"/>
              </div>
            </SeccionCard>

            {/* ── REPUESTOS — uno por componente ── */}
            <SeccionCard titulo="Repuestos" icono="bi-box-seam" color="#1e6fa5" colapsable defaultOpen>
              {/* Resumen general */}
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                background: repConStock > 0 ? 'rgba(30,111,165,0.07)' : 'rgba(192,39,45,0.07)',
                border:`1px solid ${repConStock>0?'rgba(30,111,165,0.25)':'rgba(192,39,45,0.25)'}`,
                borderRadius:8, padding:'10px 12px', marginBottom:14,
              }}>
                <i className={`bi ${repConStock>0?'bi-check-circle-fill':'bi-x-circle-fill'}`}
                  style={{fontSize:20, color:repConStock>0?'#1e6fa5':'#c0272d'}}/>
                <span style={{fontFamily:FU, fontSize:13, fontWeight:700, color:repConStock>0?'#1e6fa5':'#c0272d'}}>
                  {repConStock} de {mock.repuestos.length} componentes con stock disponible
                </span>
              </div>
              {/* Tarjeta por componente */}
              {mock.repuestos.map(rep => <TarjetaRepuesto key={rep.key} rep={rep}/>)}
            </SeccionCard>
          </div>
        )}

        {/* ═══ TAB: POLINES ═════════════════════════════════════ */}
        {tabActiva==='polines' && (
          <div>
            <div style={{background:'#fff', border:'1px solid #dde3ec', borderRadius:10, padding:'12px 14px', marginBottom:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <div style={{fontFamily:FU, fontSize:14, fontWeight:700, color:'#2a3a4a', marginBottom:8}}>Estaciones con falla detectada</div>
              <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
                <span style={{fontFamily:FM, fontSize:12, color:'#1e6fa5'}}>Total: {correa.numEstaciones} est.</span>
                <span style={{fontFamily:FM, fontSize:12, color:'#c0272d'}}>Con falla: {mock.estacionesFalla.length}</span>
                <span style={{fontFamily:FM, fontSize:12, color:'#1e8c4a'}}>OK: {correa.numEstaciones - mock.estacionesFalla.length}</span>
              </div>
            </div>

            <SeccionCard titulo="Mapa de estaciones" icono="bi-grid-3x3" color="#1e6fa5">
              <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                {(correa.estaciones || []).map(est=>{
                  const tp = [est.izquierdo,est.central,est.derecho].some(p=>p?.estado!=='ok');
                  const ec = [est.izquierdo,est.central,est.derecho].some(p=>p?.estado==='critico');
                  const c2 = ec?'#c0272d':tp?'#c98b00':'#1e8c4a';
                  return (
                    <div key={est.numero} style={{width:36, height:36, borderRadius:6, background:sb(ec?'critico':tp?'alerta':'ok'), border:`1.5px solid ${c2}55`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FM, fontSize:9, color:c2, fontWeight:700}}>
                      {est.numero}
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex', gap:14, marginTop:10, flexWrap:'wrap'}}>
                {[['Crítico','#c0272d'],['Alerta','#c98b00'],['Normal','#1e8c4a']].map(([l,c])=>(
                  <div key={l} style={{display:'flex', alignItems:'center', gap:5}}>
                    <div style={{width:10, height:10, borderRadius:2, background:c+'22', border:`1px solid ${c}`}}/>
                    <span style={{fontFamily:FU, fontSize:11, color:'#6a7a8a'}}>{l}</span>
                  </div>
                ))}
              </div>
            </SeccionCard>

            {mock.estacionesFalla.length===0 ? (
              <div style={{background:'rgba(30,140,74,0.07)', border:'1px solid rgba(30,140,74,0.25)', borderRadius:10, padding:'24px', textAlign:'center'}}>
                <i className="bi bi-check-circle" style={{fontSize:32, color:'#1e8c4a'}}/>
                <div style={{fontFamily:FU, fontSize:14, color:'#1e8c4a', marginTop:8}}>Todos los polines en estado normal</div>
              </div>
            ) : (
              <div>
                <div style={{fontFamily:FU, fontSize:13, color:'#6a7a8a', marginBottom:10}}>Detalle de estaciones con falla:</div>
                {mock.estacionesFalla.map(ef=><PolinFalla key={ef.numero} estacion={ef}/>)}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: INSPECCIÓN ══════════════════════════════════ */}
        {tabActiva==='inspeccion' && (
          <div>
            <SeccionCard titulo="Observación del inspector" icono="bi-person-badge" color="#1e6fa5">
              <div style={{fontFamily:FU, fontSize:12, color:'#8a9aaa', marginBottom:10}}>
                <span style={{color:'#2a3a4a', fontWeight:700}}>{correa.responsable}</span>{' · '}{correa.ultimaInspeccion}
              </div>
              {ITEMS_CONFIG.map(item=>{
                const d = correa.items[item.key];
                if (!d || d.estado==='ok') return null;
                const c = sc(d.estado);
                return (
                  <div key={item.key} style={{background:sb(d.estado), border:`1px solid ${c}44`, borderRadius:8, padding:'10px 12px', marginBottom:8}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                      <i className={`bi ${item.icon}`} style={{fontSize:13, color:c}}/>
                      <span style={{fontFamily:FU, fontSize:13, fontWeight:700, color:c}}>{item.label}</span>
                      <EstadoBadge est={d.estado}/>
                    </div>
                    <p style={{fontFamily:FU, fontSize:12, color:'#4a5a6a', margin:0, lineHeight:1.6}}>{d.notas}</p>
                  </div>
                );
              })}
              {compProblemas.length===0 && <div style={{fontFamily:FU, fontSize:13, color:'#1e8c4a'}}>Sin observaciones críticas. Correa en estado normal.</div>}
            </SeccionCard>

            <SeccionCard titulo="Fotografías de campo" icono="bi-camera" color="#1e6fa5" colapsable defaultOpen>
              {mock.imagenes.length===0 ? (
                <div style={{textAlign:'center', padding:'20px 0'}}>
                  <i className="bi bi-camera-slash" style={{fontSize:32, color:'#cdd5df'}}/>
                  <div style={{fontFamily:FU, fontSize:13, color:'#8a9aaa', marginTop:8}}>Sin imágenes adjuntas</div>
                </div>
              ) : (
                <>
                  <div style={{fontFamily:FM, fontSize:10, color:'#1e6fa5', background:'rgba(30,111,165,0.07)', border:'1px solid rgba(30,111,165,0.2)', borderRadius:6, padding:'6px 10px', marginBottom:12}}>
                    <i className="bi bi-cloud-upload" style={{marginRight:6}}/>
                    {mock.imagenes.length} imagen{mock.imagenes.length>1?'es':''} cargadas desde campo · Almacenamiento pendiente
                  </div>
                  {mock.imagenes.map(img=><ImagenPlaceholder key={img.id} img={img}/>)}
                </>
              )}
            </SeccionCard>
          </div>
        )}

        {/* ═══ TAB: HISTORIAL ═══════════════════════════════════ */}
        {tabActiva==='historial' && (
          <div>
            <SeccionCard titulo="Última mantención por componente" icono="bi-clock-history" color="#1e6fa5">
              {mock.historialMantencion.map((h,i)=>(
                <div key={i} style={{padding:'10px 0', borderBottom:i<mock.historialMantencion.length-1?'1px solid #edf1f7':'none', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
                  <div>
                    <div style={{fontFamily:FU, fontSize:13, fontWeight:700, color:'#2a3a4a'}}>{h.componente}</div>
                    <div style={{fontFamily:FU, fontSize:11, color:'#8a9aaa', marginTop:2}}>{h.responsable}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontFamily:FM, fontSize:11, color:'#1e6fa5'}}>{h.fecha}</div>
                    <div style={{fontFamily:FU, fontSize:11, color:'#8a9aaa', marginTop:2}}>{h.tipo}</div>
                  </div>
                </div>
              ))}
            </SeccionCard>

            <SeccionCard titulo="Recurrencia de falla · últimos 30 días" icono="bi-graph-up" color="#c98b00">
              <div style={{display:'flex', alignItems:'center', gap:12, background:mock.recurrencia.total30d>2?'rgba(192,39,45,0.07)':'rgba(201,139,0,0.07)', border:`1px solid ${mock.recurrencia.total30d>2?'rgba(192,39,45,0.25)':'rgba(201,139,0,0.25)'}`, borderRadius:8, padding:'12px 14px', marginBottom:16}}>
                <span style={{fontFamily:FT, fontSize:34, fontWeight:700, color:mock.recurrencia.total30d>2?'#c0272d':'#c98b00'}}>{mock.recurrencia.total30d}</span>
                <div>
                  <div style={{fontFamily:FU, fontSize:14, fontWeight:700, color:'#2a3a4a'}}>falla{mock.recurrencia.total30d!==1?'s':''} en 30 días</div>
                  <div style={{fontFamily:FU, fontSize:11, color:'#6a7a8a', marginTop:2}}>
                    {mock.recurrencia.total30d===0?'Sin recurrencia reciente':mock.recurrencia.total30d<=2?'Recurrencia baja':mock.recurrencia.total30d<=4?'Recurrencia media — monitorear':'Alta recurrencia — revisar causa raíz'}
                  </div>
                </div>
              </div>
              <div style={{fontFamily:FU, fontSize:12, color:'#8a9aaa', marginBottom:10}}>Por componente (últimos 30 días):</div>
              {(()=>{
                const max = Math.max(...mock.recurrencia.porComponente.map(p=>p.fallas),1);
                return mock.recurrencia.porComponente.map((p,i)=><BarraRecurrencia key={i} label={p.componente} fallas={p.fallas} max={max}/>);
              })()}
            </SeccionCard>
          </div>
        )}
      </div>
    </div>
  );
}
