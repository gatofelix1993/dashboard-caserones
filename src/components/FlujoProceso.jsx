// ============================================================
// components/FlujoProceso.jsx — Diagrama flujo proceso minero
// SVG exacto según diagrama de referencia
// Click en correa → onSelectCorrea(correa)
// Gerente: solo lectura, sin modificaciones
// ============================================================
import { useMemo } from 'react';
import { getCorreaStatus } from '../utils/status';

function sc(e) { return e === 'critico' ? '#c0272d' : e === 'alerta' ? '#c98b00' : '#1e8c4a'; }
function sb(e) { return e === 'critico' ? 'rgba(192,39,45,0.10)' : e === 'alerta' ? 'rgba(201,139,0,0.09)' : 'rgba(30,140,74,0.07)'; }
function sl(e) { return e === 'critico' ? 'CRÍTICO' : e === 'alerta' ? 'Alerta' : 'Normal'; }

const FONT_MONO  = "'Share Tech Mono', monospace";
const FONT_UI    = "'Rajdhani', sans-serif";
const FONT_TITLE = "'Orbitron', monospace";

export default function FlujoProceso({ correas, onSelectCorrea }) {
  const byId = useMemo(() => Object.fromEntries(correas.map(c => [c.id, c])), [correas]);
  const get  = id => byId[id];

  const fe2200 = correas.filter(c => c.area === '2200' && c.tipo === 'FE');

  const totalEst  = correas.reduce((a, c) => a + c.numEstaciones, 0);
  const totalCrit = correas.filter(c => getCorreaStatus(c) === 'critico').length;
  const totalAlt  = correas.filter(c => getCorreaStatus(c) === 'alerta').length;

  // Helpers para nodos SVG
  const correaColor  = id => { const c = get(id); return c ? sc(getCorreaStatus(c)) : '#888'; };
  const correaBg     = id => { const c = get(id); return c ? sb(getCorreaStatus(c)) : '#f5f5f5'; };
  const correaItems  = id => {
    const c = get(id); if (!c) return { crit: 0, alt: 0, est: 0 };
    return {
      crit: Object.values(c.items).filter(i => i.estado === 'critico').length,
      alt:  Object.values(c.items).filter(i => i.estado === 'alerta').length,
      est:  c.numEstaciones,
    };
  };

  // Nodo de proceso (no clickeable)
  const NodoProceso = ({ x, y, w, h, titulo, sub, color = '#5a7080' }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={color + '0d'} stroke={color + '55'} strokeWidth="1"/>
      <text x={x + w/2} y={y + (sub ? h/2 - 8 : h/2)} textAnchor="middle" dominantBaseline="central"
        fontFamily={FONT_UI} fontSize="14" fontWeight="700" fill={color}>{titulo}</text>
      {sub && <text x={x + w/2} y={y + h/2 + 10} textAnchor="middle" dominantBaseline="central"
        fontFamily={FONT_UI} fontSize="12" fill={color + 'bb'}>{sub}</text>}
    </g>
  );

  // Nodo de correa clickeable
  const NodoCorrea = ({ id, x, y, w = 220, critica = false, extraLabel = '' }) => {
    const c    = get(id);
    if (!c) return null;
    const est  = getCorreaStatus(c);
    const col  = sc(est);
    const bg   = sb(est);
    const info = correaItems(id);
    const h    = 68;

    return (
      <g style={{ cursor: 'pointer' }} onClick={() => onSelectCorrea(c)}>
        <rect x={x} y={y} width={w} height={h} rx="8"
          fill={bg} stroke={col + '66'} strokeWidth="1"
          style={{ transition: 'opacity 0.15s' }}/>
        <rect x={x} y={y} width="4" height={h} rx="2" fill={col}/>

        {/* Codigo + estrella */}
        {critica && <text x={x + 14} y={y + 18} fontFamily={FONT_TITLE} fontSize="10" fill={col} fontWeight="700">★</text>}
        <text x={x + (critica ? 26 : 14)} y={y + 18} fontFamily={FONT_TITLE} fontSize="11" fontWeight="700" fill={col}>{id}</text>

        {/* Estaciones pill */}
        <rect x={x + w - 52} y={y + 8} width={44} height={18} rx="9"
          fill={col + '22'} stroke={col + '55'} strokeWidth="0.8"/>
        <text x={x + w - 30} y={y + 17} textAnchor="middle" dominantBaseline="central"
          fontFamily={FONT_MONO} fontSize="10" fill={col}>{info.est} est.</text>

        {/* Descripcion / extra label */}
        <text x={x + 14} y={y + 34} fontFamily={FONT_UI} fontSize="11" fill="#5a7080">
          {extraLabel || c.descripcion?.replace('Correa transportadora', 'CV').replace('Correa fierro esponja', 'FE').replace(', area', '·').slice(0, 32)}
        </text>

        {/* Estado + badges */}
        <circle cx={x + 18} cy={y + 52} r="4" fill={col}/>
        <text x={x + 26} y={y + 52} dominantBaseline="central"
          fontFamily={FONT_UI} fontSize="11" fontWeight="700" fill={col}>{sl(est)}</text>

        {info.crit > 0 && <>
          <rect x={x + 90} y={y + 44} width={52} height={16} rx="4"
            fill="rgba(192,39,45,0.10)" stroke="rgba(192,39,45,0.3)" strokeWidth="0.8"/>
          <text x={x + 116} y={y + 52} textAnchor="middle" dominantBaseline="central"
            fontFamily={FONT_UI} fontSize="10" fontWeight="700" fill="#a01a20">{info.crit} crít.</text>
        </>}
        {info.alt > 0 && <>
          <rect x={x + (info.crit > 0 ? 148 : 90)} y={y + 44} width={52} height={16} rx="4"
            fill="rgba(201,139,0,0.10)" stroke="rgba(201,139,0,0.3)" strokeWidth="0.8"/>
          <text x={x + (info.crit > 0 ? 174 : 116)} y={y + 52} textAnchor="middle" dominantBaseline="central"
            fontFamily={FONT_UI} fontSize="10" fontWeight="700" fill="#7a5000">{info.alt} alert.</text>
        </>}

        {/* Flecha detalle */}
        <text x={x + w - 14} y={y + 52} textAnchor="middle" dominantBaseline="central"
          fontFamily="'Bootstrap Icons', sans-serif" fontSize="14" fill={col + '99'}>›</text>
      </g>
    );
  };

  // Grupo de correas FE (area 2200)
  const GrupoFE = ({ correas: lista, x, y, w = 220 }) => {
    const totalCritFE = lista.filter(c => getCorreaStatus(c) === 'critico').length;
    const totalAltFE  = lista.filter(c => getCorreaStatus(c) === 'alerta').length;
    const peor = totalCritFE > 0 ? 'critico' : totalAltFE > 0 ? 'alerta' : 'ok';
    const col  = sc(peor);
    const bg   = sb(peor);
    const totalEstFE = lista.reduce((a, c) => a + c.numEstaciones, 0);
    const minEst = Math.min(...lista.map(c => c.numEstaciones));
    const maxEst = Math.max(...lista.map(c => c.numEstaciones));
    const h    = 90;

    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx="8"
          fill={bg} stroke={col + '66'} strokeWidth="1"/>
        <rect x={x} y={y} width="4" height={h} rx="2" fill={col}/>

        <text x={x + 14} y={y + 16} fontFamily={FONT_TITLE} fontSize="10" fontWeight="700" fill={col}>
          FE-001…FE-00{lista.length} · Área {lista[0]?.area}
        </text>
        <rect x={x + w - 52} y={y + 6} width={44} height={18} rx="9"
          fill={col + '22'} stroke={col + '55'} strokeWidth="0.8"/>
        <text x={x + w - 30} y={y + 15} textAnchor="middle" dominantBaseline="central"
          fontFamily={FONT_MONO} fontSize="10" fill={col}>{totalEstFE} est.</text>

        <text x={x + 14} y={y + 32} fontFamily={FONT_UI} fontSize="11" fill="#5a7080">
          {lista.length} correas FE · {minEst}-{maxEst} est. c/u
        </text>

        {totalCritFE > 0 && <>
          <rect x={x + 14} y={y + 40} width={60} height={15} rx="4"
            fill="rgba(192,39,45,0.10)" stroke="rgba(192,39,45,0.3)" strokeWidth="0.8"/>
          <text x={x + 44} y={y + 47} textAnchor="middle" dominantBaseline="central"
            fontFamily={FONT_UI} fontSize="10" fontWeight="700" fill="#a01a20">{totalCritFE} CRÍTICAS</text>
        </>}

        {/* Mini botones por correa */}
        <g>
          {lista.map((c, i) => {
            const est2 = getCorreaStatus(c);
            const col2 = sc(est2);
            const bx = x + 14 + (i % 3) * 66;
            const by = y + 60 + Math.floor(i / 3) * 22;
            return (
              <g key={c.id} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onSelectCorrea(c); }}>
                <rect x={bx} y={by} width={58} height={16} rx="4"
                  fill="#fff" stroke={col2 + '77'} strokeWidth="0.8"/>
                <text x={bx + 8} y={by + 8} dominantBaseline="central"
                  fontFamily={FONT_MONO} fontSize="9" fill={col2}>
                  {c.codigo.split('-').slice(1).join('-')}
                </text>
                <circle cx={bx + 50} cy={by + 8} r="3" fill={col2}/>
              </g>
            );
          })}
        </g>
      </g>
    );
  };

  // ViewBox dinámico: altura total del diagrama
  const VW = 680;
  const VH = 1580;

  // Coordenadas X para columna izquierda (CV) y derecha (FE)
  const CX = 230; // centro columna CV
  const FX = 450; // centro columna FE (grupo FE)
  const CW = 220; // ancho nodos
  const NW = 220; // ancho nodos proceso

  return (
    <div style={{ width: '100%', overflowY: 'auto' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ fontFamily: FONT_UI, maxWidth: 700, display: 'block', margin: '0 auto' }}
      >
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <marker id="arr-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#c98b00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>

        {/* ── LEYENDA ── */}
        <rect x="20" y="10" width="640" height="36" rx="8" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        {[
          { x: 36, col: '#c0272d', label: 'Crítico' },
          { x: 120, col: '#c98b00', label: 'Alerta' },
          { x: 198, col: '#1e8c4a', label: 'Normal' },
        ].map(d => (
          <g key={d.label}>
            <rect x={d.x} y="22" width="12" height="12" rx="2" fill={d.col + '33'} stroke={d.col} strokeWidth="0.8"/>
            <text x={d.x + 16} y="28" dominantBaseline="central" fontFamily={FONT_UI} fontSize="11" fill="#5a7080">{d.label}</text>
          </g>
        ))}
        <line x1="285" y1="25" x2="320" y2="25" stroke="#c98b00" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr-gold)"/>
        <text x="326" y="25" dominantBaseline="central" fontFamily={FONT_UI} fontSize="11" fill="#c98b00">Carga circulante</text>
        <text x="450" y="25" dominantBaseline="central" fontFamily={FONT_UI} fontSize="11" fontWeight="700" fill="#c0272d">★</text>
        <text x="462" y="25" dominantBaseline="central" fontFamily={FONT_UI} fontSize="11" fill="#5a7080">Crítica para continuidad</text>

        {/* ══ 1. MINA RAJO ABIERTO ══ */}
        <NodoProceso x={230} y={55} w={220} h={52} titulo="Mina rajo abierto" sub="4.600 m.s.n.m · 4.000 t/h"/>
        {/* Flecha ↓ */}
        <line x1="340" y1="107" x2="340" y2="130" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 2. 2100-CV-001 ══ */}
        <NodoCorrea id="2100-CV-001" x={230} y={132} extraLabel="CV · Alerta · Area 2100"/>
        {/* Flecha ↓ */}
        <line x1="340" y1="200" x2="340" y2="224" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 3. CHANCADO PRIMARIO ══ */}
        <NodoProceso x={230} y={226} w={220} h={52} titulo="Chancado primario" sub="Trituradora giratoria"/>

        {/* Bifurcación Y desde chancado */}
        {/* Línea central baja de chancado */}
        <line x1="340" y1="278" x2="340" y2="300" stroke="#aaa" strokeWidth="1.5"/>
        {/* Rama izquierda (CV) */}
        <line x1="340" y1="300" x2="230" y2="300" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="230" y1="300" x2="230" y2="316" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>
        {/* Rama derecha (FE) */}
        <line x1="340" y1="300" x2="460" y2="300" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="460" y1="300" x2="460" y2="316" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>
        {/* Labels de rama */}
        <text x="215" y="310" textAnchor="middle" fontFamily={FONT_MONO} fontSize="10" fill="#6a7e90">via CV</text>
        <text x="478" y="310" textAnchor="middle" fontFamily={FONT_MONO} fontSize="10" fill="#6a7e90">via FE</text>

        {/* ══ 4a. 2200-CV-001 (izq) ══ */}
        <NodoCorrea id="2200-CV-001" x={120} y={318} w={220} critica extraLabel="CV · Alerta · Crítica · Area 2200"/>

        {/* ══ 4b. GRUPO FE-001..006 (der) ══ */}
        <GrupoFE correas={fe2200} x={350} y={318} w={240}/>

        {/* Convergencia hacia Molienda SAG */}
        {/* Rama izquierda sube */}
        <line x1="230" y1="386" x2="230" y2="430" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="230" y1="430" x2="300" y2="430" stroke="#aaa" strokeWidth="1.5"/>
        {/* Rama derecha */}
        <line x1="470" y1="408" x2="470" y2="430" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="470" y1="430" x2="400" y2="430" stroke="#aaa" strokeWidth="1.5"/>
        {/* Línea central baja hacia Molienda */}
        <line x1="340" y1="430" x2="340" y2="448" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 5. MOLIENDA SAG ══ */}
        <NodoProceso x={190} y={450} w={300} h={64}
          titulo="Molienda SAG + molino bolas"
          sub="Alimentado por CV-001 + FE-001…006"
          color="#1e6fa5"/>
        {/* Sub2 */}
        <text x="340" y="500" textAnchor="middle" fontFamily={FONT_UI} fontSize="11" fill="#1e6fa5cc">
          Genera pebbles → recirculan ↑
        </text>

        {/* ══ CARGA CIRCULANTE: 3300-CV-021 a la DERECHA de Molienda ══ */}
        {/* Flecha punteada desde Harnero (abajo) hacia CV-021, luego hacia Molienda (lateral) */}
        {/* CV-021 */}
        <NodoCorrea id="3300-CV-021" x={500} y={456} w={160} critica extraLabel="Pebbles discharge · Crítica"/>

        {/* Flecha dorada punteada desde Molienda → lateral hacia CV-021 */}
        <line x1="490" y1="482" x2="500" y2="482"
          stroke="#c98b00" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr-gold)"/>

        {/* Label CARGA CIRCULANTE */}
        <rect x="494" y="440" width="136" height="14" rx="3"
          fill="rgba(201,139,0,0.08)" stroke="#c98b00" strokeWidth="0.6" strokeDasharray="3 2"/>
        <text x="562" y="447" textAnchor="middle" dominantBaseline="central"
          fontFamily={FONT_MONO} fontSize="9" fontWeight="700" fill="#c98b00">CARGA CIRCULANTE</text>

        {/* Flecha desde CV-021 sube y entra a Harnero via arco */}
        {/* (se dibuja después de Harnero para no cruzar) */}

        {/* Flecha ↓ de Molienda */}
        <line x1="340" y1="514" x2="340" y2="538" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 6. 3300-CV-022 ══ */}
        <NodoCorrea id="3300-CV-022" x={230} y={540} critica extraLabel="CV · CRÍTICO · 11 poleas · Crítica continuidad"/>
        {/* Flecha ↓ */}
        <line x1="340" y1="608" x2="340" y2="632" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 7. HARNERO ══ */}
        <NodoProceso x={190} y={634} w={300} h={60}
          titulo="Harnero · clasificación"
          sub="Finos → 5 rutas · Pebbles → recirculan ↑"
          color="#1e6fa5"/>

        {/* Flecha punteada dorada desde Harnero → lateral → CV-021 (retorno de pebbles) */}
        <path d="M490 664 L570 664 L570 492 L660 492"
          fill="none" stroke="#c98b00" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr-gold)"/>
        {/* Flecha de CV-021 entrando a Molienda por la derecha */}
        <path d="M660 492 L660 482"
          fill="none" stroke="#c98b00" strokeWidth="0" strokeDasharray="0"/>

        {/* 5 flechas paralelas bajando del Harnero */}
        {[46, 164, 282, 400, 518].map((xf, i) => (
          <line key={i} x1={xf + 54} y1="694" x2={xf + 54} y2="716" stroke="#aaa" strokeWidth="1.2" markerEnd="url(#arr)"/>
        ))}

        {/* ══ 8. CINCO CORREAS PARALELAS (108px c/u, gap 8px) ══ */}
        {[
          { id: '3300-CV-023', x: 20,  extra: 'CRÍTICO · polines+cinta' },
          { id: '3300-CV-024', x: 136, extra: 'CRÍTICO · cinta' },
          { id: '3300-CV-025', x: 252, extra: 'CRÍTICO · polines' },
          { id: '3300-CV-026', x: 368, extra: 'Alerta · polines' },
          { id: '3300-CV-027', x: 484, extra: 'Alerta · poleas' },
        ].map(({ id, x, extra }) => (
          <NodoCorrea key={id} id={id} x={x} y={718} w={108} extraLabel={extra}/>
        ))}

        {/* 5 flechas convergentes hacia Flotación */}
        {[74, 190, 306, 422, 538].map((xf, i) => (
          <g key={i}>
            <line x1={xf} y1="786" x2={xf} y2="800" stroke="#aaa" strokeWidth="1.2"/>
            <line x1={xf} y1="800" x2="340" y2="800" stroke="#aaa" strokeWidth="1.2"/>
          </g>
        ))}
        <line x1="340" y1="800" x2="340" y2="818" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 9. FLOTACIÓN ══ */}
        <NodoProceso x={190} y={820} w={300} h={52}
          titulo="Flotación Rougher + Cleaner"
          sub="Recupera Cu y Mo · colas a relave"
          color="#1e6fa5"/>

        {/* Bifurcación hacia 5300-CV-001 y 5300-CV-002 */}
        <line x1="340" y1="872" x2="340" y2="892" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="230" y1="892" x2="450" y2="892" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="230" y1="892" x2="230" y2="908" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <line x1="450" y1="892" x2="450" y2="908" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 10a. 5300-CV-001 (izq) ══ */}
        <NodoCorrea id="5300-CV-001" x={120} y={910} extraLabel="CV · CRÍTICO · Area 5300"/>

        {/* ══ 10b. 5300-CV-002 (der) ══ */}
        <NodoCorrea id="5300-CV-002" x={350} y={910} extraLabel="CV · CRÍTICO · Area 5300"/>

        {/* Convergencia */}
        <line x1="230" y1="978" x2="230" y2="998" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="230" y1="998" x2="340" y2="998" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="460" y1="978" x2="460" y2="998" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="460" y1="998" x2="340" y2="998" stroke="#aaa" strokeWidth="1.5"/>
        <line x1="340" y1="998" x2="340" y2="1016" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 11. SEPARACIÓN Cu/Mo ══ */}
        <NodoProceso x={190} y={1018} w={300} h={52}
          titulo="Separación Cu / Mo"
          sub="Flotación + espesamiento + filtrado"
          color="#1e6fa5"/>
        <line x1="340" y1="1070" x2="340" y2="1094" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 12. 7200-CV-001 ══ */}
        <NodoCorrea id="7200-CV-001" x={230} y={1096} extraLabel="CV · Alerta · mayor longitud · Area 7200"/>
        <line x1="340" y1="1164" x2="340" y2="1188" stroke="#aaa" strokeWidth="1.5" markerEnd="url(#arr)"/>

        {/* ══ 13. CONCENTRADUCTO ══ */}
        <NodoProceso x={230} y={1190} w={220} h={52} titulo="Concentraducto · Punta Chungo" sub="120 km · exportación a Japón"/>

        {/* ══ FOOTER ══ */}
        <line x1="40" y1="1262" x2="640" y2="1262" stroke="#ddd" strokeWidth="0.8"/>
        <text x="340" y="1278" textAnchor="middle" fontFamily={FONT_UI} fontSize="12" fill="#8a9aaa">
          Total sistema: {totalEst} estaciones de polines monitoreadas · semana 22 · 28-05-2026
        </text>
        <text x="340" y="1296" textAnchor="middle" fontFamily={FONT_UI} fontSize="12" fill="#8a9aaa">
          {totalCrit > 0 && `${totalCrit} correas críticas · `}{totalAlt > 0 && `${totalAlt} en alerta · `}Las pastillas muestran Nº de estaciones
        </text>

      </svg>
    </div>
  );
}
