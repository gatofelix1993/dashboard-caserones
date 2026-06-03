// ============================================================
// components/FlujoProceso.jsx
// Desktop/Tablet (≥768px): SVG diagrama de proceso
// Mobile (<768px): lista vertical por etapas colapsables
// ============================================================
import { useState, useMemo } from 'react';
import { getCorreaStatus } from '../utils/status';

const FM = "'Share Tech Mono', monospace";
const FU = "'Rajdhani', sans-serif";
const FT = "'Orbitron', monospace";

function sc(e) { return e==='critico'?'#c0272d':e==='alerta'?'#c98b00':'#1e8c4a'; }
function sb(e) { return e==='critico'?'rgba(192,39,45,0.10)':e==='alerta'?'rgba(201,139,0,0.09)':'rgba(30,140,74,0.07)'; }
function sl(e) { return e==='critico'?'CRÍTICO':e==='alerta'?'Alerta':'Normal'; }

// ── Nodo proceso (SVG) ────────────────────────────────────────
function NodoProceso({ x, y, w, titulo, sub, sub2, color='#5a7080' }) {
  const h = sub2 ? 64 : sub ? 54 : 40;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={color+'0d'} stroke={color+'66'} strokeWidth="1"/>
      <text x={x+w/2} y={y+(sub?16:h/2)} textAnchor="middle" dominantBaseline="central"
        fontFamily={FU} fontSize="14" fontWeight="700" fill={color}>{titulo}</text>
      {sub && <text x={x+w/2} y={y+34} textAnchor="middle" dominantBaseline="central"
        fontFamily={FU} fontSize="11" fill={color+'bb'}>{sub}</text>}
      {sub2 && <text x={x+w/2} y={y+50} textAnchor="middle" dominantBaseline="central"
        fontFamily={FU} fontSize="11" fill={color+'99'}>{sub2}</text>}
    </g>
  );
}

// ── Nodo correa (SVG) ─────────────────────────────────────────
function NodoCorrea({ correa, x, y, w=220, critica=false, extra='', onClick }) {
  if (!correa) return null;
  const est  = getCorreaStatus(correa);
  const col  = sc(est);
  const bg   = sb(est);
  const crit = Object.values(correa.items).filter(i=>i.estado==='critico').length;
  const alt  = Object.values(correa.items).filter(i=>i.estado==='alerta').length;
  const ancho = w >= 180;
  const h = ancho ? 72 : 86; // angosto necesita 2 filas para badges
  // Pill siempre en fila separada del código — sin solapamiento
  const PILL_W = 48;

  return (
    <g style={{cursor:'pointer'}} onClick={onClick}>
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={bg} stroke={col+'66'} strokeWidth="1"/>
      <rect x={x} y={y} width="4" height={h} rx="2" fill={col}/>

      {/* Fila 1: estrella + código (izq) | pill est. (der, misma fila solo en modo ancho) */}
      {critica && <text x={x+12} y={y+15} fontFamily={FT} fontSize="9" fill={col} fontWeight="700">★</text>}
      <text x={x+(critica?22:10)} y={y+15} fontFamily={FT}
        fontSize={ancho?12:10} fontWeight="700" fill={col}>{correa.codigo}</text>

      {/* Pill: siempre al lado derecho del código */}
      {(() => {
        const pw = w < 170 ? 36 : PILL_W;  // pill compacto en nodos angostos
        const label = w < 170 ? `${correa.numEstaciones}e` : `${correa.numEstaciones} est.`;
        const fs = w < 170 ? 8 : 9;
        return <>
          <rect x={x+w-pw-5} y={y+6} width={pw} height={17} rx="8"
            fill={col+'22'} stroke={col+'55'} strokeWidth="0.8"/>
          <text x={x+w-pw-5+pw/2} y={y+14} textAnchor="middle" dominantBaseline="central"
            fontFamily={FM} fontSize={fs} fill={col}>{label}</text>
        </>;
      })()}

      {/* Fila 2: descripción */}
      {ancho && <text x={x+10} y={y+32} fontFamily={FU} fontSize="11" fill="#5a7080">
        {(extra||'').slice(0,34)}
      </text>}
      {!ancho && <text x={x+10} y={y+24} fontFamily={FU} fontSize="10" fill="#5a7080">
        {(extra||'').slice(0,16)}
      </text>}

      {/* Estado */}
      {(() => {
        const ey = ancho ? y+54 : y+55;
        return <>
          <circle cx={x+13} cy={ey} r="4" fill={col}/>
          <text x={x+21} y={ey} dominantBaseline="central"
            fontFamily={FU} fontSize="11" fontWeight="700" fill={col}>{sl(est)}</text>
        </>;
      })()}

      {/* Badges — en 2 filas si no caben en una */}
      {(()=>{
        const by1 = y+54;
        const by2 = y+70;
        const bx0 = x+10;
        const maxX = x+w-8;
        let bx=bx0; let by=by1;
        const items=[];
        // Estado
        items.push(<g key="st">
          <circle cx={x+13} cy={by1} r="4" fill={col}/>
          <text x={x+21} y={by1} dominantBaseline="central"
            fontFamily={FU} fontSize="11" fontWeight="700" fill={col}>{sl(est)}</text>
        </g>);
        bx = x + (sl(est).length*7) + 28;
        if (crit>0) {
          const bw=46;
          if (bx+bw > maxX) { bx=bx0; by=by2; }
          items.push(<g key="c">
            <rect x={bx} y={by-7} width={bw} height={15} rx="4"
              fill="rgba(192,39,45,0.10)" stroke="rgba(192,39,45,0.3)" strokeWidth="0.7"/>
            <text x={bx+bw/2} y={by} textAnchor="middle" dominantBaseline="central"
              fontFamily={FU} fontSize="10" fontWeight="700" fill="#a01a20">{crit} crít.</text>
          </g>);
          bx+=bw+4;
        }
        if (alt>0) {
          const bw=48;
          if (bx+bw > maxX) { bx=bx0; by=by2; }
          items.push(<g key="a">
            <rect x={bx} y={by-7} width={bw} height={15} rx="4"
              fill="rgba(201,139,0,0.10)" stroke="rgba(201,139,0,0.3)" strokeWidth="0.7"/>
            <text x={bx+bw/2} y={by} textAnchor="middle" dominantBaseline="central"
              fontFamily={FU} fontSize="10" fontWeight="700" fill="#7a5000">{alt} alert.</text>
          </g>);
        }
        return items;
      })()}

      <text x={x+w-8} y={y+h/2} textAnchor="middle" dominantBaseline="central"
        fontSize="13" fill={col+'88'}>›</text>
    </g>
  );
}

// ── Grupo FE (SVG) ────────────────────────────────────────────
function GrupoFE({ lista, x, y, w, onSelect }) {
  const crit = lista.filter(c=>getCorreaStatus(c)==='critico').length;
  const alt  = lista.filter(c=>getCorreaStatus(c)==='alerta').length;
  const peor = crit>0?'critico':alt>0?'alerta':'ok';
  const col  = sc(peor); const bg = sb(peor);
  const totEst = lista.reduce((a,c)=>a+c.numEstaciones,0);
  const minE = Math.min(...lista.map(c=>c.numEstaciones));
  const maxE = Math.max(...lista.map(c=>c.numEstaciones));
  const h = 112;
  const PILL_W = 46;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={bg} stroke={col+'66'} strokeWidth="1"/>
      <rect x={x} y={y} width="4" height={h} rx="2" fill={col}/>
      {/* Fila 1: título izq + pill der en la misma línea */}
      <text x={x+12} y={y+14} fontFamily={FT} fontSize="8.5" fontWeight="700" fill={col}>
        FE-001…FE-006 · Área {lista[0]?.area}
      </text>
      <rect x={x+w-PILL_W-6} y={y+5} width={PILL_W} height={16} rx="8"
        fill={col+'22'} stroke={col+'55'} strokeWidth="0.8"/>
      <text x={x+w-PILL_W-6+PILL_W/2} y={y+13} textAnchor="middle" dominantBaseline="central"
        fontFamily={FM} fontSize="9" fill={col}>{totEst} est.</text>
      {/* Fila 2: sub */}
      <text x={x+12} y={y+28} fontFamily={FU} fontSize="11" fill="#5a7080">
        {lista.length} correas FE · {minE}-{maxE} est. c/u
      </text>
      {crit>0 && <>
        <rect x={x+12} y={y+46} width={66} height={16} rx="4"
          fill="rgba(192,39,45,0.10)" stroke="rgba(192,39,45,0.3)" strokeWidth="0.8"/>
        <text x={x+45} y={y+54} textAnchor="middle" dominantBaseline="central"
          fontFamily={FU} fontSize="10" fontWeight="700" fill="#a01a20">{crit} CRÍTICAS</text>
      </>}
      {lista.map((c,i)=>{
        const e2=getCorreaStatus(c); const c2=sc(e2);
        const CW=Math.floor((w-24-12)/3); const GAP=6;
        const bx=x+12+(i%3)*(CW+GAP);
        const by=y+68+Math.floor(i/3)*22;
        return (
          <g key={c.id} style={{cursor:'pointer'}} onClick={ev=>{ev.stopPropagation();onSelect(c);}}>
            <rect x={bx} y={by} width={CW} height={17} rx="4"
              fill="#fff" stroke={c2+'77'} strokeWidth="0.8"/>
            <text x={bx+8} y={by+8} dominantBaseline="central"
              fontFamily={FM} fontSize="9" fill={c2}>
              {c.codigo.split('-').slice(1).join('-')}
            </text>
            <circle cx={bx+CW-8} cy={by+8} r="3" fill={c2}/>
          </g>
        );
      })}
    </g>
  );
}

// ══════════════════════════════════════════════════════════════
// VISTA MOBILE — lista vertical por etapas
// ══════════════════════════════════════════════════════════════
function CorreaCardMobile({ correa, onSelect }) {
  const est  = getCorreaStatus(correa);
  const col  = sc(est);
  const bg   = sb(est);
  const crit = Object.values(correa.items).filter(i=>i.estado==='critico').length;
  const alt  = Object.values(correa.items).filter(i=>i.estado==='alerta').length;

  return (
    <button onClick={()=>onSelect(correa)} style={{
      width:'100%', background:bg, border:`1px solid ${col}44`,
      borderLeft:`4px solid ${col}`, borderRadius:8,
      padding:'10px 12px', cursor:'pointer', textAlign:'left',
      display:'flex', flexDirection:'column', gap:4,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
        <span style={{fontFamily:FT, fontSize:11, fontWeight:700, color:col}}>{correa.codigo}</span>
        <span style={{fontFamily:FM, fontSize:10, color:col,
          background:col+'22', border:`1px solid ${col}55`,
          borderRadius:20, padding:'2px 8px'}}>
          {correa.numEstaciones} est.
        </span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
        <span style={{display:'flex', alignItems:'center', gap:4,
          fontFamily:FU, fontSize:12, fontWeight:700, color:col}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:col,display:'inline-block'}}/>
          {sl(est)}
        </span>
        {crit>0 && <span style={{fontFamily:FU,fontSize:11,fontWeight:700,
          padding:'2px 7px',borderRadius:4,
          background:'rgba(192,39,45,0.10)',color:'#a01a20',
          border:'1px solid rgba(192,39,45,0.3)'}}>{crit} crít.</span>}
        {alt>0 && <span style={{fontFamily:FU,fontSize:11,fontWeight:700,
          padding:'2px 7px',borderRadius:4,
          background:'rgba(201,139,0,0.10)',color:'#7a5000',
          border:'1px solid rgba(201,139,0,0.3)'}}>{alt} alert.</span>}
      </div>
    </button>
  );
}

function EtapaMobile({ titulo, subtitulo, colorEtapa='#5a7080', correas=[], onSelect, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  const crit = correas.filter(c=>getCorreaStatus(c)==='critico').length;
  const alt  = correas.filter(c=>getCorreaStatus(c)==='alerta').length;

  return (
    <div style={{background:'#fff', border:'1px solid var(--border-color)',
      borderRadius:10, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
      {/* Header de etapa */}
      <div style={{background:colorEtapa+'0d', borderLeft:`4px solid ${colorEtapa}`,
        padding:'12px 14px', display:'flex', flexDirection:'column', gap:4}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
          <div>
            <div style={{fontFamily:FU, fontSize:14, fontWeight:700, color:colorEtapa}}>{titulo}</div>
            {subtitulo && <div style={{fontFamily:FU, fontSize:12, color:colorEtapa+'99', marginTop:2}}>{subtitulo}</div>}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
            {crit>0 && <span style={{fontFamily:FU,fontSize:11,fontWeight:700,
              padding:'2px 8px',borderRadius:12,
              background:'rgba(192,39,45,0.10)',color:'#a01a20',
              border:'1px solid rgba(192,39,45,0.3)'}}>{crit} crít.</span>}
            {alt>0 && <span style={{fontFamily:FU,fontSize:11,fontWeight:700,
              padding:'2px 8px',borderRadius:12,
              background:'rgba(201,139,0,0.10)',color:'#7a5000',
              border:'1px solid rgba(201,139,0,0.3)'}}>{alt} alert.</span>}
            {correas.length>0 && (
              <button onClick={()=>setOpen(o=>!o)} style={{
                background:'none', border:'none', cursor:'pointer',
                color:colorEtapa, fontSize:18, display:'flex',
                alignItems:'center', padding:0,
              }}>
                {open ? '▲' : '▼'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Correas de la etapa */}
      {open && correas.length>0 && (
        <div style={{padding:'10px 12px', display:'flex', flexDirection:'column', gap:8,
          borderTop:`1px solid ${colorEtapa}22`}}>
          {correas.map(c=>(
            <CorreaCardMobile key={c.id} correa={c} onSelect={onSelect}/>
          ))}
        </div>
      )}
    </div>
  );
}

function FlujoProcesaMobile({ correas, onSelectCorrea }) {
  const byId = useMemo(()=>Object.fromEntries(correas.map(c=>[c.id,c])),[correas]);
  const get  = id => byId[id];

  const etapas = [
    {
      titulo:'Mina rajo abierto',
      subtitulo:'4.600 m.s.n.m · 4.000 t/h',
      color:'#5a7080', correas:[],
    },
    {
      titulo:'2100-CV-001 — Alimentación',
      subtitulo:'Área 2100',
      color:'#c98b00',
      correas:[get('2100-CV-001')].filter(Boolean),
    },
    {
      titulo:'Chancado primario',
      subtitulo:'Trituradora giratoria',
      color:'#5a7080', correas:[],
    },
    {
      titulo:'Correas post-chancado',
      subtitulo:'Via CV + Via FE (6 correas FE)',
      color:'#c0272d',
      correas:[get('2200-CV-001'), ...correas.filter(c=>c.area==='2200'&&c.tipo==='FE')].filter(Boolean),
      defaultOpen:true,
    },
    {
      titulo:'Molienda SAG + molino bolas',
      subtitulo:'Alimentado por CV-001 + FE-001…006',
      color:'#1e6fa5', correas:[],
    },
    {
      titulo:'3300-CV-021 — Carga circulante',
      subtitulo:'Pebbles discharge · Crítica para continuidad',
      color:'#c0272d',
      correas:[get('3300-CV-021')].filter(Boolean),
    },
    {
      titulo:'3300-CV-022 — Transportadora principal',
      subtitulo:'11 poleas · Crítica para continuidad',
      color:'#c0272d',
      correas:[get('3300-CV-022')].filter(Boolean),
    },
    {
      titulo:'Harnero · clasificación',
      subtitulo:'Finos → 5 rutas · Pebbles → recirculan',
      color:'#1e6fa5', correas:[],
    },
    {
      titulo:'5 rutas a flotación',
      subtitulo:'CV-023 a CV-027 · Área 3300',
      color:'#c0272d',
      correas:['3300-CV-023','3300-CV-024','3300-CV-025','3300-CV-026','3300-CV-027'].map(get).filter(Boolean),
      defaultOpen:true,
    },
    {
      titulo:'Flotación Rougher + Cleaner',
      subtitulo:'Recupera Cu y Mo · colas a relave',
      color:'#1e6fa5', correas:[],
    },
    {
      titulo:'Correas post-flotación',
      subtitulo:'Área 5300',
      color:'#c0272d',
      correas:[get('5300-CV-001'),get('5300-CV-002')].filter(Boolean),
    },
    {
      titulo:'Separación Cu / Mo',
      subtitulo:'Flotación + espesamiento + filtrado',
      color:'#1e6fa5', correas:[],
    },
    {
      titulo:'7200-CV-001 — Mayor longitud',
      subtitulo:'86 estaciones · Área 7200',
      color:'#c98b00',
      correas:[get('7200-CV-001')].filter(Boolean),
    },
    {
      titulo:'Concentraducto · Punta Chungo',
      subtitulo:'120 km · exportación a Japón',
      color:'#5a7080', correas:[],
    },
  ];

  const totCrit = correas.filter(c=>getCorreaStatus(c)==='critico').length;
  const totAlt  = correas.filter(c=>getCorreaStatus(c)==='alerta').length;
  const totEst  = correas.reduce((a,c)=>a+c.numEstaciones,0);

  return (
    <div style={{padding:'12px 12px 32px', display:'flex', flexDirection:'column', gap:8}}>
      {/* Banner resumen */}
      <div style={{background:'#fff', border:'1px solid var(--border-color)',
        borderLeft:'4px solid #c47a2e', borderRadius:8,
        padding:'12px 14px', marginBottom:4}}>
        <div style={{fontFamily:FT, fontSize:11, letterSpacing:2, color:'#9a5e1f', fontWeight:700}}>
          FLUJO DE PROCESO — CASERONES
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
          {totCrit>0 && <span style={{fontFamily:FU,fontSize:13,fontWeight:700,
            padding:'4px 12px',borderRadius:20,
            background:'rgba(192,39,45,0.10)',color:'#a01a20',
            border:'1px solid rgba(192,39,45,0.3)'}}>⬤ {totCrit} críticas</span>}
          {totAlt>0 && <span style={{fontFamily:FU,fontSize:13,fontWeight:700,
            padding:'4px 12px',borderRadius:20,
            background:'rgba(201,139,0,0.10)',color:'#7a5000',
            border:'1px solid rgba(201,139,0,0.3)'}}>⬤ {totAlt} alertas</span>}
          <span style={{fontFamily:FM,fontSize:11,color:'#8a9aaa',
            padding:'4px 10px',borderRadius:20,
            background:'rgba(0,0,0,0.04)',border:'1px solid #dde3ec'}}>
            {totEst} est.
          </span>
        </div>
      </div>

      {/* Línea vertical + etapas */}
      {etapas.map((e,i) => (
        <div key={i} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
          {/* Indicador de flujo */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center',
            width:20, flexShrink:0, paddingTop:14}}>
            <div style={{width:10, height:10, borderRadius:'50%',
              background: e.correas.length>0 ? e.color : '#cdd5df',
              border:`2px solid ${e.correas.length>0 ? e.color : '#cdd5df'}`,
              flexShrink:0}}/>
            {i < etapas.length-1 && (
              <div style={{width:2, flex:1, minHeight:16,
                background: i%2===0 ? '#e0e6ef' : '#e0e6ef',
                marginTop:2}}/>
            )}
          </div>
          {/* Contenido de la etapa */}
          <div style={{flex:1, minWidth:0}}>
            <EtapaMobile
              titulo={e.titulo}
              subtitulo={e.subtitulo}
              colorEtapa={e.color}
              correas={e.correas}
              onSelect={onSelectCorrea}
              defaultOpen={e.defaultOpen}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// VISTA DESKTOP — SVG completo
// ══════════════════════════════════════════════════════════════
function FlujoProcesaSVG({ correas, onSelectCorrea }) {
  const byId = useMemo(()=>Object.fromEntries(correas.map(c=>[c.id,c])),[correas]);
  const get  = id => byId[id];
  const fe22 = correas.filter(c=>c.area==='2200'&&c.tipo==='FE');

  const totEst  = correas.reduce((a,c)=>a+c.numEstaciones,0);
  const totCrit = correas.filter(c=>getCorreaStatus(c)==='critico').length;
  const totAlt  = correas.filter(c=>getCorreaStatus(c)==='alerta').length;

  // ViewBox 900px — más espacio para todos los nodos
  const VW  = 900;
  const CC  = 450;  // centro
  const PW  = 380;  // nodos proceso
  const PX  = CC-PW/2; // = 260

  // Split CV / FE
  const SL_X=80;  const SL_W=250; const SL_CX=SL_X+SL_W/2;  // cx=205
  const SR_X=350; const SR_W=270; const SR_CX=SR_X+SR_W/2;  // cx=485

  // CV-021
  const CV021_X=640; const CV021_W=200;

  // 5 paralelas: 160px c/u, gap 8px → total=5*160+4*8=832, x0=450-416=34
  const P5W=160; const P5G=8;
  const P5X0=CC-(5*P5W+4*P5G)/2; // = 34

  // 5300
  const CV53_W=260; const CV53_LX=CC-CV53_W-18; const CV53_RX=CC+18;
  const H72=72; const H112=112;

  const Y={
    mina:55, cv2100:130, chancado:222, split:314,
    molienda:450, cv021:452, cv022:526, harnero:620,
    par:694, flotacion:820, cv5300:910, separacion:1020,
    cv7200:1094, concentra:1186,
  };

  return (
    <div style={{width:'100%', overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
      <svg width="100%" viewBox="0 0 900 1310" style={{display:'block',margin:'0 auto',minWidth:700,maxWidth:1000}}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#c98b00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>

        {/* Leyenda */}
        <rect x="20" y="10" width="860" height="32" rx="6" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        {[{x:34,col:'#c0272d',l:'Crítico'},{x:110,col:'#c98b00',l:'Alerta'},{x:184,col:'#1e8c4a',l:'Normal'}].map(d=>(
          <g key={d.l}>
            <rect x={d.x} y="20" width="11" height="11" rx="2" fill={d.col+'33'} stroke={d.col} strokeWidth="0.8"/>
            <text x={d.x+15} y="26" dominantBaseline="central" fontFamily={FU} fontSize="11" fill="#5a7080">{d.l}</text>
          </g>
        ))}
        <line x1="268" y1="26" x2="302" y2="26" stroke="#c98b00" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrG)"/>
        <text x="308" y="26" dominantBaseline="central" fontFamily={FU} fontSize="11" fill="#c98b00">Carga circulante</text>
        <text x="460" y="26" dominantBaseline="central" fontFamily={FU} fontSize="11" fontWeight="700" fill="#c0272d">★</text>
        <text x="472" y="26" dominantBaseline="central" fontFamily={FU} fontSize="11" fill="#5a7080">Crítica continuidad · [N]=est. · clic=detalle</text>

        {/* 1. Mina */}
        <NodoProceso x={PX} y={Y.mina} w={PW} titulo="Mina rajo abierto" sub="4.600 m.s.n.m · 4.000 t/h"/>
        <line x1={CC} y1={Y.mina+54} x2={CC} y2={Y.cv2100-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 2. 2100-CV-001 */}
        <NodoCorrea correa={get('2100-CV-001')} x={PX} y={Y.cv2100} w={PW} extra="CV · Alerta · Area 2100"
          onClick={()=>onSelectCorrea(get('2100-CV-001'))}/>
        <line x1={CC} y1={Y.cv2100+H72} x2={CC} y2={Y.chancado-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 3. Chancado */}
        <NodoProceso x={PX} y={Y.chancado} w={PW} titulo="Chancado primario" sub="Trituradora giratoria"/>

        {/* Bifurcación Y */}
        <line x1={CC} y1={Y.chancado+54} x2={CC} y2={Y.split-20} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={SL_CX} y1={Y.split-20} x2={SR_CX} y2={Y.split-20} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={SL_CX} y1={Y.split-20} x2={SL_CX} y2={Y.split-4} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <line x1={SR_CX} y1={Y.split-20} x2={SR_CX} y2={Y.split-4} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <text x={SL_CX-28} y={Y.split-8} fontFamily={FM} fontSize="10" fill="#7a8a9a">via CV</text>
        <text x={SR_CX+4}  y={Y.split-8} fontFamily={FM} fontSize="10" fill="#7a8a9a">via FE</text>

        {/* 4a. 2200-CV-001 */}
        <NodoCorrea correa={get('2200-CV-001')} x={SL_X} y={Y.split} w={SL_W} critica extra="CV · Alerta · Crítica · Area 2200"
          onClick={()=>onSelectCorrea(get('2200-CV-001'))}/>

        {/* 4b. Grupo FE */}
        <GrupoFE lista={fe22} x={SR_X} y={Y.split} w={SR_W} onSelect={onSelectCorrea}/>

        {/* Convergencia → Molienda */}
        <line x1={SL_CX} y1={Y.split+H72} x2={SL_CX} y2={Y.molienda-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={SL_CX} y1={Y.molienda-18} x2={CC} y2={Y.molienda-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={SR_CX} y1={Y.split+H112} x2={SR_CX} y2={Y.molienda-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={SR_CX} y1={Y.molienda-18} x2={CC} y2={Y.molienda-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CC} y1={Y.molienda-18} x2={CC} y2={Y.molienda-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 5. Molienda SAG */}
        <NodoProceso x={PX} y={Y.molienda} w={PW} titulo="Molienda SAG + molino bolas"
          sub="Alimentado por CV-001 + FE-001…006"
          sub2="Genera pebbles → recirculan ↑" color="#1e6fa5"/>

        {/* CV-021 */}
        <rect x={CV021_X} y={Y.cv021-16} width={CV021_W} height="14" rx="3"
          fill="rgba(201,139,0,0.07)" stroke="#c98b00" strokeWidth="0.6" strokeDasharray="3 2"/>
        <text x={CV021_X+CV021_W/2} y={Y.cv021-9} textAnchor="middle" dominantBaseline="central"
          fontFamily={FM} fontSize="8" fontWeight="700" fill="#c98b00">CARGA CIRCULANTE</text>
        <NodoCorrea correa={get('3300-CV-021')} x={CV021_X} y={Y.cv021} w={CV021_W} critica extra="Pebbles discharge"
          onClick={()=>onSelectCorrea(get('3300-CV-021'))}/>
        <line x1={PX+PW} y1={Y.molienda+28} x2={CV021_X} y2={Y.molienda+28}
          stroke="#c98b00" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrG)"/>

        {/* Flecha ↓ Molienda (h=64) */}
        <line x1={CC} y1={Y.molienda+64} x2={CC} y2={Y.cv022-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 6. CV-022 */}
        <NodoCorrea correa={get('3300-CV-022')} x={PX} y={Y.cv022} w={PW} critica extra="CV · CRÍTICO · 11 poleas · Crítica continuidad"
          onClick={()=>onSelectCorrea(get('3300-CV-022'))}/>
        <line x1={CC} y1={Y.cv022+H72} x2={CC} y2={Y.harnero-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 7. Harnero */}
        <NodoProceso x={PX} y={Y.harnero} w={PW} titulo="Harnero · clasificación"
          sub="Finos → 5 rutas · Pebbles → recirculan ↑" color="#1e6fa5"/>
        {/* Flecha punteada Harnero → CV-021 */}
        <path d={`M${PX+PW} ${Y.harnero+27} L${CV021_X+CV021_W+8} ${Y.harnero+27} L${CV021_X+CV021_W+8} ${Y.molienda+28}`}
          fill="none" stroke="#c98b00" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrG)"/>

        {/* 5 flechas paralelas */}
        {Array.from({length:5}).map((_,i)=>{
          const cx=P5X0+P5W/2+i*(P5W+P5G);
          return <line key={i} x1={cx} y1={Y.harnero+54} x2={cx} y2={Y.par-2} stroke="#bbb" strokeWidth="1.2" markerEnd="url(#arr)"/>;
        })}

        {/* 8. Cinco paralelas */}
        {[
          {id:'3300-CV-023',extra:'CRÍTICO · polines'},
          {id:'3300-CV-024',extra:'CRÍTICO · cinta'},
          {id:'3300-CV-025',extra:'CRÍTICO · pol.'},
          {id:'3300-CV-026',extra:'Alerta · pol.'},
          {id:'3300-CV-027',extra:'Alerta · pol.'},
        ].map(({id,extra},i)=>(
          <NodoCorrea key={id} correa={get(id)} x={P5X0+i*(P5W+P5G)} y={Y.par} w={P5W}
            extra={extra} onClick={()=>onSelectCorrea(get(id))}/>
        ))}

        {/* Convergencia 5 → Flotación */}
        {Array.from({length:5}).map((_,i)=>{
          const cx=P5X0+P5W/2+i*(P5W+P5G);
          const c=get(`3300-CV-02${3+i}`);
          const ny=Y.par+(c?(getCorreaStatus(c)==='critico'?80:78):78);
          return <g key={i}>
            <line x1={cx} y1={ny} x2={cx} y2={Y.flotacion-20} stroke="#bbb" strokeWidth="1.2"/>
            <line x1={cx} y1={Y.flotacion-20} x2={CC} y2={Y.flotacion-20} stroke="#bbb" strokeWidth="1.2"/>
          </g>;
        })}
        <line x1={CC} y1={Y.flotacion-20} x2={CC} y2={Y.flotacion-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 9. Flotación */}
        <NodoProceso x={PX} y={Y.flotacion} w={PW} titulo="Flotación Rougher + Cleaner"
          sub="Recupera Cu y Mo · colas a relave" color="#1e6fa5"/>

        {/* Bifurcación → 5300 */}
        <line x1={CC} y1={Y.flotacion+54} x2={CC} y2={Y.cv5300-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CV53_LX+CV53_W/2} y1={Y.cv5300-18} x2={CV53_RX+CV53_W/2} y2={Y.cv5300-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CV53_LX+CV53_W/2} y1={Y.cv5300-18} x2={CV53_LX+CV53_W/2} y2={Y.cv5300-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <line x1={CV53_RX+CV53_W/2} y1={Y.cv5300-18} x2={CV53_RX+CV53_W/2} y2={Y.cv5300-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 10. 5300 */}
        <NodoCorrea correa={get('5300-CV-001')} x={CV53_LX} y={Y.cv5300} w={CV53_W} extra="CV · CRÍTICO · Area 5300"
          onClick={()=>onSelectCorrea(get('5300-CV-001'))}/>
        <NodoCorrea correa={get('5300-CV-002')} x={CV53_RX} y={Y.cv5300} w={CV53_W} extra="CV · CRÍTICO · Area 5300"
          onClick={()=>onSelectCorrea(get('5300-CV-002'))}/>

        {/* Convergencia → Separación */}
        <line x1={CV53_LX+CV53_W/2} y1={Y.cv5300+H72} x2={CV53_LX+CV53_W/2} y2={Y.separacion-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CV53_LX+CV53_W/2} y1={Y.separacion-18} x2={CC} y2={Y.separacion-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CV53_RX+CV53_W/2} y1={Y.cv5300+H72} x2={CV53_RX+CV53_W/2} y2={Y.separacion-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CV53_RX+CV53_W/2} y1={Y.separacion-18} x2={CC} y2={Y.separacion-18} stroke="#bbb" strokeWidth="1.5"/>
        <line x1={CC} y1={Y.separacion-18} x2={CC} y2={Y.separacion-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 11. Separación */}
        <NodoProceso x={PX} y={Y.separacion} w={PW} titulo="Separación Cu / Mo"
          sub="Flotación + espesamiento + filtrado" color="#1e6fa5"/>
        <line x1={CC} y1={Y.separacion+54} x2={CC} y2={Y.cv7200-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 12. 7200-CV-001 */}
        <NodoCorrea correa={get('7200-CV-001')} x={PX} y={Y.cv7200} w={PW} extra="CV · Alerta · mayor longitud · Area 7200"
          onClick={()=>onSelectCorrea(get('7200-CV-001'))}/>
        <line x1={CC} y1={Y.cv7200+H72} x2={CC} y2={Y.concentra-2} stroke="#bbb" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* 13. Concentraducto */}
        <NodoProceso x={PX} y={Y.concentra} w={PW} titulo="Concentraducto · Punta Chungo"
          sub="120 km · exportación a Japón"/>

        {/* Footer */}
        <line x1="40" y1="1252" x2="860" y2="1252" stroke="#ddd" strokeWidth="0.8"/>
        <text x={CC} y="1268" textAnchor="middle" fontFamily={FU} fontSize="12" fill="#8a9aaa">
          {`Total sistema: ${totEst} estaciones · semana 22 · 28-05-2026`}
        </text>
        <text x={CC} y="1286" textAnchor="middle" fontFamily={FU} fontSize="12" fill="#8a9aaa">
          {[totCrit>0&&`${totCrit} correas críticas`,totAlt>0&&`${totAlt} en alerta`,'Pastillas = Nº estaciones'].filter(Boolean).join(' · ')}
        </text>
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE RAÍZ — elige vista según ancho de pantalla
// ══════════════════════════════════════════════════════════════
export default function FlujoProceso({ correas, onSelectCorrea }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // Escucha cambios de tamaño
  useMemo(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile
    ? <FlujoProcesaMobile correas={correas} onSelectCorrea={onSelectCorrea}/>
    : <FlujoProcesaSVG    correas={correas} onSelectCorrea={onSelectCorrea}/>;
}
