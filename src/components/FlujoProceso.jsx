// ============================================================
// components/FlujoProceso.jsx  — v6.0  layout armónico
//
// TOPOLOGÍA: 24 correas reales S22
// Reglas de layout:
//   GAP_ARROW = 14px  entre fondo de nodo y punta de flecha
//   GAP_NODE  = 14px  entre punta de flecha y tope de nodo
//   → espacio total entre nodos: 28px visible
//   Todas las alturas de nodo están declaradas como constantes
//   Las Y se calculan acumulativamente: no hay hardcode disperso
// ============================================================
import React, { useState, useMemo, useEffect } from 'react';
import { getCorreaStatus } from '../utils/status';

const FM = "'Share Tech Mono', monospace";
const FU = "'Rajdhani', sans-serif";
const FT = "'Orbitron', monospace";

const COL_CRIT  = '#c0272d';
const COL_ALERT = '#c98b00';
const COL_OK    = '#1e8c4a';
const COL_PROC  = '#5a7080';
const COL_FLOW  = '#1e6fa5';
const COL_CIRC  = '#c98b00';
const COL_LINE  = '#cccccc';

function sc(e) { return e==='critico'?COL_CRIT:e==='alerta'?COL_ALERT:COL_OK; }
function sb(e) { return e==='critico'?'rgba(192,39,45,0.09)':e==='alerta'?'rgba(201,139,0,0.08)':'rgba(30,140,74,0.07)'; }
function sl(e) { return e==='critico'?'CRÍTICO':e==='alerta'?'Alerta':'Normal'; }

// ─────────────────────────────────────────────────────────────
// NODO PROCESO (rectángulo etapa)
// ─────────────────────────────────────────────────────────────
function NodoProceso({ x, y, w, h, titulo, sub, color=COL_PROC }) {
  const cy1 = sub ? y + h*0.38 : y + h/2;
  const cy2 = y + h*0.68;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={color+'11'} stroke={color+'55'} strokeWidth="1"/>
      <text x={x+w/2} y={cy1} textAnchor="middle" dominantBaseline="central"
        fontFamily={FU} fontSize="13" fontWeight="700" fill={color}>{titulo}</text>
      {sub && (
        <text x={x+w/2} y={cy2} textAnchor="middle" dominantBaseline="central"
          fontFamily={FU} fontSize="10.5" fill={color+'bb'}>{sub}</text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// NODO CORREA ANCHO (correas principales con texto completo)
// ─────────────────────────────────────────────────────────────
function NodoCorrea({ correa, x, y, w, h=70, critica=false, extra='', onClick }) {
  if (!correa) return null;
  const est  = getCorreaStatus(correa);
  const col  = sc(est); const bg = sb(est);
  const crit = Object.values(correa.items).filter(i=>i.estado==='critico').length;
  const alt  = Object.values(correa.items).filter(i=>i.estado==='alerta').length;
  const PILL_W = 46;
  return (
    <g style={{cursor:'pointer'}} onClick={onClick}>
      <rect x={x} y={y} width={w} height={h} rx="7"
        fill={bg} stroke={col+'66'} strokeWidth="1"/>
      <rect x={x} y={y} width="4" height={h} rx="2" fill={col}/>
      {/* Código */}
      {critica && <text x={x+13} y={y+14} fontFamily={FT} fontSize="8.5" fill={col} fontWeight="700">★</text>}
      <text x={x+(critica?22:10)} y={y+14} fontFamily={FT} fontSize="11" fontWeight="700" fill={col}>
        {correa.codigo}
      </text>
      {/* Pill estaciones */}
      <rect x={x+w-PILL_W-6} y={y+5} width={PILL_W} height={16} rx="8"
        fill={col+'1a'} stroke={col+'55'} strokeWidth="0.8"/>
      <text x={x+w-PILL_W/2-6} y={y+13} textAnchor="middle" dominantBaseline="central"
        fontFamily={FM} fontSize="8.5" fill={col}>{correa.numEstaciones} est.</text>
      {/* Descripción */}
      {extra && (
        <text x={x+10} y={y+30} fontFamily={FU} fontSize="10.5" fill="#6a7a8a">
          {extra.slice(0,44)}
        </text>
      )}
      {/* Estado */}
      <circle cx={x+13} cy={y+h-14} r="3.5" fill={col}/>
      <text x={x+21} y={y+h-14} dominantBaseline="central"
        fontFamily={FU} fontSize="10.5" fontWeight="700" fill={col}>{sl(est)}</text>
      {crit>0 && (
        <g>
          <rect x={x+70} y={y+h-21} width={44} height={14} rx="3"
            fill="rgba(192,39,45,0.09)" stroke="rgba(192,39,45,0.3)" strokeWidth="0.7"/>
          <text x={x+92} y={y+h-14} textAnchor="middle" dominantBaseline="central"
            fontFamily={FU} fontSize="9.5" fontWeight="700" fill="#a01a20">{crit} crít.</text>
        </g>
      )}
      {alt>0 && (
        <g>
          <rect x={x+(crit>0?120:70)} y={y+h-21} width={46} height={14} rx="3"
            fill="rgba(201,139,0,0.09)" stroke="rgba(201,139,0,0.3)" strokeWidth="0.7"/>
          <text x={x+(crit>0?143:93)} y={y+h-14} textAnchor="middle" dominantBaseline="central"
            fontFamily={FU} fontSize="9.5" fontWeight="700" fill="#7a5000">{alt} alert.</text>
        </g>
      )}
      <text x={x+w-9} y={y+h/2} textAnchor="middle" dominantBaseline="central"
        fontSize="13" fill={col+'77'}>›</text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// NODO CORREA COMPACTO (grupos con muchas correas en fila)
// ─────────────────────────────────────────────────────────────
function NodoCorreaCompacto({ correa, x, y, w, h=66, critica=false, onClick }) {
  if (!correa) return null;
  const est = getCorreaStatus(correa);
  const col = sc(est); const bg = sb(est);
  const short = correa.codigo.split('-').slice(1).join('-');
  return (
    <g style={{cursor:'pointer'}} onClick={onClick}>
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill={bg} stroke={col+'66'} strokeWidth="0.9"/>
      <rect x={x} y={y} width="3" height={h} rx="2" fill={col}/>
      <text x={x+w/2} y={y+15} textAnchor="middle" dominantBaseline="central"
        fontFamily={FT} fontSize={critica?8.5:9.5} fontWeight="700" fill={col}>
        {critica?`★ ${short}`:short}
      </text>
      <text x={x+w/2} y={y+32} textAnchor="middle" dominantBaseline="central"
        fontFamily={FM} fontSize="9" fill="#6a7a8a">{correa.numEstaciones} est.</text>
      <text x={x+w/2} y={y+50} textAnchor="middle" dominantBaseline="central"
        fontFamily={FU} fontSize="9.5" fontWeight="700" fill={col}>{sl(est)}</text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS DE DIBUJO — nunca tocan nodos
// ─────────────────────────────────────────────────────────────
// Flecha vertical simple: de (x, y1) a (x, y2) con punta abajo
const VA = ({x, y1, y2, col=COL_LINE, sw=1.4}) => (
  <line x1={x} y1={y1} x2={x} y2={y2} stroke={col} strokeWidth={sw} markerEnd="url(#arr)"/>
);
// Línea plain (sin punta)
const LP = ({x1,y1,x2,y2,col=COL_LINE,sw=1.2,dash=''}) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={sw} strokeDasharray={dash}/>
);
// Eje horizontal (sin punta)
const HA = ({y, xL, xR, col=COL_LINE, sw=1.2}) => (
  <line x1={xL} y1={y} x2={xR} y2={y} stroke={col} strokeWidth={sw}/>
);

// ══════════════════════════════════════════════════════════════
// VISTA DESKTOP SVG
// Ancho virtual: 760px  |  viewBox 0 0 760 <altura calculada>
// Espaciado:
//   ARROW_H = 18px  (espacio libre para flechas entre nodos)
//   GAP     = 14px  (margen entre flecha y nodo)
// ══════════════════════════════════════════════════════════════
function FlujoProcesaSVG({ correas, onSelectCorrea }) {
  const byId = useMemo(()=>Object.fromEntries(correas.map(c=>[c.id,c])),[correas]);
  const get  = id => byId[id];

  const fe22 = correas.filter(c=>c.area==='2200'&&c.tipo==='FE'); // 6 correas FE área 2200
  const fe33 = ['3300-FE-001','3300-FE-002','3300-FE-003'].map(get).filter(Boolean);
  const cv33 = ['3300-CV-023','3300-CV-024','3300-CV-025','3300-CV-026','3300-CV-027'].map(get).filter(Boolean);

  const totEst  = correas.reduce((a,c)=>a+c.numEstaciones,0);
  const totCrit = correas.filter(c=>getCorreaStatus(c)==='critico').length;
  const totAlt  = correas.filter(c=>getCorreaStatus(c)==='alerta').length;

  // ── Alturas de cada nodo (constantes) ──────────────────────
  const HP  = 44;  // alto NodoProceso simple
  const HPS = 52;  // alto NodoProceso con sub larga
  const HC  = 70;  // alto NodoCorrea
  const HK  = 64;  // alto NodoCorreaCompacto
  const HK2 = 58;  // alto NodoCorreaCompacto filas FE22

  // ── Ancho canvas ──────────────────────────────────────────
  const VW = 760;
  const CC = 380;  // centro

  // ── ARROW_H: espacio entre fondo de nodo y punta de arrow
  const AH = 18;
  // ── GAP entre flechas: espacio libre para texto de label
  const GLB = 14;  // gap label bifurcación

  // ── Nodos proceso centrados ────────────────────────────────
  const PW = 360; const PX = CC - PW/2;  // 200..560

  // ── Correas 2100 — 2 paralelas ────────────────────────────
  const C21W = 175; const C21G = 10;
  const C21L = CC - C21W - C21G/2;  // izquierda
  const C21R = CC + C21G/2;          // derecha

  // ── Zona izquierda: 2200-CV-001 ───────────────────────────
  // Centrado: total = CV22W + GAP22 + (3*FE22W + 2*FE22G)
  // = 260 + 16 + (3*58 + 2*7) = 260 + 16 + 188 = 464
  // x0 = (760 - 464) / 2 = 148
  const CV22W = 260; const GAP22 = 16;
  const FE22W = 58;  const FE22G = 7;
  const BLOQUE22_W = CV22W + GAP22 + (3*FE22W + 2*FE22G); // 464
  const BLOQUE22_X = Math.round((VW - BLOQUE22_W) / 2);   // 148
  const CV22X  = BLOQUE22_X;                              // 148
  const FE22X0 = BLOQUE22_X + CV22W + GAP22;              // 424
  const CV22CX = CV22X + CV22W/2;   // cx 278
  // centros de columnas FE22
  const fe22cx = [0,1,2].map(i => FE22X0 + i*(FE22W+FE22G) + FE22W/2);
  // cx grupo FE22 = columna central
  const FE22GCX = fe22cx[1]; // cx 511

  // ── CV-021 carga circulante (lateral derecha, nivel cv022) ─────
  const CV021X = 640; const CV021W = 104; const CV021CX = CV021X + CV021W/2;

  // ── 8 correas post-harnero: 5 CV + 3 FE ──────────────────
  // Ancho total disponible: 760px - 2*20 = 720
  // 8 nodos × 64px + 7 gaps × 8px = 512 + 56 = 568 → x0 = (760-568)/2 = 96
  const PK_W = 64; const PK_G = 10;
  const PK_X0 = Math.round((VW - (8*PK_W + 7*PK_G)) / 2); // ≈ 76
  // separador entre 5 CV y 3 FE: gap extra de 18px después del 5º
  const PK_SEP = 18; // extra gap visual antes de FE
  const pkX = (i) => i < 5
    ? PK_X0 + i*(PK_W+PK_G)
    : PK_X0 + 5*(PK_W+PK_G) + PK_SEP + (i-5)*(PK_W+PK_G);
  const pkCX = (i) => pkX(i) + PK_W/2;
  // cx para label "5 CV"
  const lbl5CV_cx = (pkCX(0)+pkCX(4))/2;
  const lbl3FE_cx = (pkCX(5)+pkCX(7))/2;

  // ── 5300: 2 correas paralelas ─────────────────────────────
  const CV53W = 258; const CV53G = 14;
  const CV53LX = CC - CV53W - CV53G/2;
  const CV53RX = CC + CV53G/2;
  const CV53LCX = CV53LX + CV53W/2;
  const CV53RCX = CV53RX + CV53W/2;

  // ── 7200: 3 correas en fila ────────────────────────────────
  const C72W = 194; const C72G = 13;
  const C72_X0 = Math.round((VW - (3*C72W + 2*C72G)) / 2); // ≈ 23
  const c72x = [0,1,2].map(i => C72_X0 + i*(C72W+C72G));
  const c72cx = [0,1,2].map(i => c72x[i] + C72W/2);

  // ══ CÁLCULO ACUMULATIVO DE Y ══════════════════════════════
  // Cada bloque: Y_NODO = Y_PREV_NODO + H_PREV + AH
  // Flechas:     y1 = Y_NODO + H, y2 = Y_NODO_SIG - 2 (2px antes del borde)
  // ─────────────────────────────────────────────────────────
  let Y = {};

  const LEYENDA_H = 30;
  Y.leyenda = 10;

  // Mina
  Y.mina = Y.leyenda + LEYENDA_H + 16;
  // flecha mina→2100: desde Y.mina+HP hasta Y.c2100
  Y.c2100 = Y.mina + HP + AH;

  // flecha 2100→chancado
  Y.chancado = Y.c2100 + HC + AH;

  // bifurcación hacia CV / FE
  // flecha chancado → (punto bifurcación) → correas
  Y.c2200 = Y.chancado + HP + AH;  // 2200-CV-001 y FE22r1 empiezan aquí
  Y.fe22r2 = Y.c2200 + HK2 + 6;   // fila 2 FE22 pegada a fila 1

  // Convergencia hacia SAG: toma el max de los dos caminos
  const maxFE22bottom = Y.fe22r2 + HK2;
  const maxCV22bottom = Y.c2200  + HC;
  Y.sag = Math.max(maxFE22bottom, maxCV22bottom) + AH;

  // SAG → CV022
  Y.cv022 = Y.sag + HPS + AH;

  // CV-021 lateral: al mismo nivel que cv022
  Y.cv021 = Y.cv022;

  // CV022 → Harnero
  Y.harnero = Y.cv022 + HC + AH;

  // Harnero → 8 paralelas (espacio para labels de grupo)
  Y.par = Y.harnero + HPS + AH + 16; // +16 para los labels "5 CV paralelas"

  // 8 paralelas → flotación
  Y.flotacion = Y.par + HK + AH;

  // flotación → 5300
  Y.cv5300 = Y.flotacion + HP + AH;

  // 5300 → separación
  Y.separacion = Y.cv5300 + HC + AH;

  // separación → 7200
  Y.c7200 = Y.separacion + HP + AH;

  // 7200 → concentraducto
  Y.concentra = Y.c7200 + HC + AH;

  // Footer
  Y.footer = Y.concentra + HP + 28;
  const TOTAL_H = Y.footer + 14;

  return (
    <div style={{width:'100%', overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
      <svg width="100%" viewBox={`0 0 ${VW} ${TOTAL_H}`}
        style={{display:'block', margin:'0 auto', minWidth:680, maxWidth:940}}>

        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1.5L8 5L2 8.5" fill="none" stroke={COL_LINE}
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1.5L8 5L2 8.5" fill="none" stroke={COL_CIRC}
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>

        {/* ── LEYENDA ─────────────────────────────────────── */}
        <rect x="20" y={Y.leyenda} width={VW-40} height={LEYENDA_H} rx="6"
          fill="none" stroke="#ccc" strokeWidth="0.5"/>
        {[
          {x:36, col:COL_CRIT,  l:'Crítico'},
          {x:108,col:COL_ALERT, l:'Alerta'},
          {x:178,col:COL_OK,    l:'Normal'},
        ].map(d=>(
          <g key={d.l}>
            <rect x={d.x} y={Y.leyenda+9} width="10" height="10" rx="2"
              fill={d.col+'22'} stroke={d.col} strokeWidth="0.8"/>
            <text x={d.x+14} y={Y.leyenda+14} dominantBaseline="central"
              fontFamily={FU} fontSize="10" fill="#5a7080">{d.l}</text>
          </g>
        ))}
        <LP x1={256} y1={Y.leyenda+14} x2={288} y2={Y.leyenda+14}
          col={COL_CIRC} sw={1.5} dash="5 3"/>
        <line x1={284} y1={Y.leyenda+14} x2={288} y2={Y.leyenda+14}
          stroke={COL_CIRC} strokeWidth="1.5" markerEnd="url(#arrG)"/>
        <text x={294} y={Y.leyenda+14} dominantBaseline="central"
          fontFamily={FU} fontSize="10" fill={COL_CIRC}>Carga circulante</text>
        <text x={418} y={Y.leyenda+14} dominantBaseline="central"
          fontFamily={FU} fontSize="10" fontWeight="700" fill={COL_CRIT}>★</text>
        <text x={430} y={Y.leyenda+14} dominantBaseline="central"
          fontFamily={FU} fontSize="10" fill="#5a7080">crítica · [N]=est. · clic=detalle</text>

        {/* ── 1. MINA ────────────────────────────────────── */}
        <NodoProceso x={PX} y={Y.mina} w={PW} h={HP}
          titulo="Mina rajo abierto" sub="4.600 m.s.n.m · 4.000 t/h"/>

        {/* Mina → bifurca en 2 flechas hacia 2100 */}
        {/* Línea vertical baja del centro del Mina */}
        <LP x1={CC} y1={Y.mina+HP} x2={CC} y2={Y.mina+HP+AH/2} sw={1.4}/>
        {/* Bifurcación horizontal */}
        <LP x1={C21L+C21W/2} y1={Y.mina+HP+AH/2} x2={C21R+C21W/2} y2={Y.mina+HP+AH/2} sw={1.2}/>
        {/* Flechas hacia cada correa 2100 */}
        <VA x={C21L+C21W/2} y1={Y.mina+HP+AH/2} y2={Y.c2100-1}/>
        <VA x={C21R+C21W/2} y1={Y.mina+HP+AH/2} y2={Y.c2100-1}/>

        {/* ── 2. 2100: 2 correas paralelas ─────────────── */}
        <NodoCorrea correa={get('2100-CV-001')} x={C21L} y={Y.c2100} w={C21W} h={HC}
          extra="CV · Alerta · Área 2100"
          onClick={()=>onSelectCorrea(get('2100-CV-001'))}/>
        <NodoCorrea correa={get('2100-FE-001')} x={C21R} y={Y.c2100} w={C21W} h={HC}
          extra="FE · Alerta · Área 2100"
          onClick={()=>onSelectCorrea(get('2100-FE-001'))}/>

        {/* 2100 → convergen a chancado */}
        <LP x1={C21L+C21W/2} y1={Y.c2100+HC} x2={C21L+C21W/2} y2={Y.chancado-AH/2} sw={1.2}/>
        <LP x1={C21R+C21W/2} y1={Y.c2100+HC} x2={C21R+C21W/2} y2={Y.chancado-AH/2} sw={1.2}/>
        <LP x1={C21L+C21W/2} y1={Y.chancado-AH/2} x2={C21R+C21W/2} y2={Y.chancado-AH/2} sw={1.2}/>
        <VA x={CC} y1={Y.chancado-AH/2} y2={Y.chancado-1}/>

        {/* ── 3. CHANCADO ─────────────────────────────── */}
        <NodoProceso x={PX} y={Y.chancado} w={PW} h={HP}
          titulo="Chancado primario" sub="Trituradora giratoria"/>

        {/* Bifurcación chancado → via CV (izq) / via FE (der) */}
        {/* El centro del bloque 7 recuadros es CC=380, la línea baja y se divide */}
        {/* Labels "via CV" y "via FE" */}
        <text x={CV22CX} y={Y.chancado+HP+AH*0.55}
          textAnchor="middle" dominantBaseline="central"
          fontFamily={FM} fontSize="10" fill="#8a9aaa">via CV</text>
        <text x={FE22GCX} y={Y.chancado+HP+AH*0.55}
          textAnchor="middle" dominantBaseline="central"
          fontFamily={FM} fontSize="10" fill="#8a9aaa">via FE</text>
        {/* Línea desde chancado baja al punto de bifurcación */}
        <LP x1={CC} y1={Y.chancado+HP} x2={CC} y2={Y.chancado+HP+8} sw={1.4}/>
        {/* Brazo horizontal: de CV22CX a FE22GCX pasando por CC */}
        <LP x1={CV22CX} y1={Y.chancado+HP+8} x2={FE22GCX} y2={Y.chancado+HP+8} sw={1.2}/>
        {/* Flechas verticales hacia los nodos */}
        <VA x={CV22CX}  y1={Y.chancado+HP+8} y2={Y.c2200-1}/>
        <VA x={FE22GCX} y1={Y.chancado+HP+8} y2={Y.c2200-1}/>

        {/* ── 4a. 2200-CV-001 ─────────────────────────── */}
        <NodoCorrea correa={get('2200-CV-001')} x={CV22X} y={Y.c2200} w={CV22W} h={HC}
          critica extra="CV · Alerta · Crítica · Área 2200"
          onClick={()=>onSelectCorrea(get('2200-CV-001'))}/>

        {/* ── 4b. 6 FE área 2200 — fila 1 (FE-001..003) ─ */}
        {fe22.slice(0,3).map((c,i)=>(
          <NodoCorreaCompacto key={c.id} correa={c}
            x={FE22X0+i*(FE22W+FE22G)} y={Y.c2200} w={FE22W} h={HK2}
            critica={getCorreaStatus(c)!=='ok'}
            onClick={()=>onSelectCorrea(c)}/>
        ))}
        {/* Líneas verticales entre filas FE22 */}
        {[0,1,2].map(i=>(
          <LP key={i}
            x1={FE22X0+i*(FE22W+FE22G)+FE22W/2} y1={Y.c2200+HK2}
            x2={FE22X0+i*(FE22W+FE22G)+FE22W/2} y2={Y.fe22r2-1}
            sw={1}/>
        ))}
        {/* ── 4c. Fila 2 FE22 (FE-004..006) ─────────── */}
        {fe22.slice(3,6).map((c,i)=>(
          <NodoCorreaCompacto key={c.id} correa={c}
            x={FE22X0+i*(FE22W+FE22G)} y={Y.fe22r2} w={FE22W} h={HK2}
            critica
            onClick={()=>onSelectCorrea(c)}/>
        ))}

        {/* ── Convergencia 2200 → SAG ──────────────────── */}
        {/* CV22 baja hasta línea de convergencia */}
        <LP x1={CV22CX} y1={Y.c2200+HC} x2={CV22CX} y2={Y.sag-AH/2} sw={1.2}/>
        {/* FE22 (fila 2 col central) baja hasta línea de convergencia */}
        <LP x1={FE22GCX} y1={Y.fe22r2+HK2} x2={FE22GCX} y2={Y.sag-AH/2} sw={1.2}/>
        {/* Línea horizontal convergencia */}
        <LP x1={CV22CX} y1={Y.sag-AH/2} x2={FE22GCX} y2={Y.sag-AH/2} sw={1.2}/>
        {/* Flecha hacia SAG desde centro */}
        <VA x={CC} y1={Y.sag-AH/2} y2={Y.sag-1}/>

        {/* ── 5. SAG ─────────────────────────────────── */}
        <NodoProceso x={PX} y={Y.sag} w={PW} h={HPS} color={COL_FLOW}
          titulo="Molienda SAG + molino bolas"
          sub="Alimentado por CV-001 + FE-001…006 · genera pebbles"/>

        {/* ── CV-021 CARGA CIRCULANTE (lateral derecha, nivel cv022) ── */}
        {/* Flujo: Harnero → entra por izq del CV-021                      */}
        {/*        CV-021 → sale por abajo, dobla izq, entra al SAG por der  */}
        {/* Etiqueta lateral */}
        <rect x={CV021X} y={Y.cv021-15} width={CV021W} height="13" rx="3"
          fill="rgba(201,139,0,0.08)" stroke={COL_CIRC} strokeWidth="0.6" strokeDasharray="3 2"/>
        <text x={CV021X+CV021W/2} y={Y.cv021-9} textAnchor="middle" dominantBaseline="central"
          fontFamily={FM} fontSize="7.5" fontWeight="700" fill={COL_CIRC}>CARGA CIRCULANTE</text>
        <NodoCorreaCompacto correa={get('3300-CV-021')} x={CV021X} y={Y.cv021}
          w={CV021W} h={HC} critica onClick={()=>onSelectCorrea(get('3300-CV-021'))}/>

        {/* Tramo 1: Harnero → CV-021                                        */}
        {/* Horizontal: borde der Harnero → cx del CV-021                    */}
        <LP x1={PX+PW}             y1={Y.harnero+HPS/2}
            x2={CV021X+CV021W/2}   y2={Y.harnero+HPS/2}
            col={COL_CIRC} sw={1.5} dash="5 3"/>
        {/* Vertical: baja hasta borde inferior del CV-021 con flecha        */}
        <LP x1={CV021X+CV021W/2}   y1={Y.harnero+HPS/2}
            x2={CV021X+CV021W/2}   y2={Y.cv021+HC+1}
            col={COL_CIRC} sw={1.5} dash="5 3"/>
        <line x1={CV021X+CV021W/2} y1={Y.cv021+HC+1}
              x2={CV021X+CV021W/2} y2={Y.cv021+HC-1}
              stroke={COL_CIRC} strokeWidth="1.5" markerEnd="url(#arrG)"/>

        {/* Tramo 2: CV-021 → SAG                                             */}
        {/* Vertical: sube desde borde sup CV-021                            */}
        <LP x1={CV021X+CV021W/2} y1={Y.cv021}
            x2={CV021X+CV021W/2} y2={Y.sag+HPS/2}
            col={COL_CIRC} sw={1.5} dash="5 3"/>
        {/* Horizontal: dobla 90º izq hasta borde der del SAG con flecha     */}
        <LP x1={CV021X+CV021W/2} y1={Y.sag+HPS/2}
            x2={PX+PW+1}          y2={Y.sag+HPS/2}
            col={COL_CIRC} sw={1.5} dash="5 3"/>
        <line x1={PX+PW+1} y1={Y.sag+HPS/2}
              x2={PX+PW-1} y2={Y.sag+HPS/2}
              stroke={COL_CIRC} strokeWidth="1.5" markerEnd="url(#arrG)"/>

        {/* SAG → CV-022 */}
        <VA x={CC} y1={Y.sag+HPS} y2={Y.cv022-1}/>

        {/* ── 6. 3300-CV-022 ────────────────────────── */}
        <NodoCorrea correa={get('3300-CV-022')} x={PX} y={Y.cv022} w={PW} h={HC}
          critica extra="CV · CRÍTICO · 11 poleas · Crítica para continuidad"
          onClick={()=>onSelectCorrea(get('3300-CV-022'))}/>

        {/* CV-022 → Harnero */}
        <VA x={CC} y1={Y.cv022+HC} y2={Y.harnero-1}/>

        {/* ── 7. HARNERO ──────────────────────────── */}
        <NodoProceso x={PX} y={Y.harnero} w={PW} h={HPS} color={COL_FLOW}
          titulo="Harnero · clasificación"
          sub="Finos → 5+3 rutas paralelas · pebbles recirculan ↑"/>

        {/* Harnero → 8 correas paralelas */}
        {/* Línea vertical baja del harnero */}
        <LP x1={CC} y1={Y.harnero+HPS} x2={CC} y2={Y.par-AH} sw={1.4}/>
        {/* Línea horizontal distribuidora */}
        <LP x1={pkCX(0)} y1={Y.par-AH} x2={pkCX(7)} y2={Y.par-AH} sw={1.2}/>
        {/* 8 flechas verticales */}
        {[0,1,2,3,4,5,6,7].map(i=>(
          <VA key={i} x={pkCX(i)} y1={Y.par-AH} y2={Y.par-1}/>
        ))}
        {/* Labels de grupo */}
        <text x={lbl5CV_cx} y={Y.par-AH-6} textAnchor="middle"
          fontFamily={FM} fontSize="9" fill="#8a9aaa">5 CV paralelas</text>
        <text x={lbl3FE_cx} y={Y.par-AH-6} textAnchor="middle"
          fontFamily={FM} fontSize="9" fill="#8a9aaa">3 FE paralelas</text>
        {/* Separador visual CV/FE */}
        <LP x1={pkCX(4)+PK_W/2+4} y1={Y.par-AH-10}
           x2={pkCX(4)+PK_W/2+4} y2={Y.par+HK+4}
           col="#dde3ec" sw={0.8} dash="3 3"/>

        {/* ── 8. 5 CV + 3 FE área 3300 ─────────────── */}
        {cv33.map((c,i)=>(
          <NodoCorreaCompacto key={c.id} correa={c}
            x={pkX(i)} y={Y.par} w={PK_W} h={HK}
            onClick={()=>onSelectCorrea(c)}/>
        ))}
        {fe33.map((c,i)=>(
          <NodoCorreaCompacto key={c.id} correa={c}
            x={pkX(5+i)} y={Y.par} w={PK_W} h={HK}
            onClick={()=>onSelectCorrea(c)}/>
        ))}

        {/* Convergencia 8 → flotación */}
        {/* 8 líneas verticales bajan al mismo nivel */}
        {[0,1,2,3,4,5,6,7].map(i=>(
          <LP key={i} x1={pkCX(i)} y1={Y.par+HK}
            x2={pkCX(i)} y2={Y.flotacion-AH/2} sw={1.1}/>
        ))}
        <LP x1={pkCX(0)} y1={Y.flotacion-AH/2} x2={pkCX(7)} y2={Y.flotacion-AH/2} sw={1.2}/>
        <VA x={CC} y1={Y.flotacion-AH/2} y2={Y.flotacion-1}/>

        {/* ── 9. FLOTACIÓN ─────────────────────────── */}
        <NodoProceso x={PX} y={Y.flotacion} w={PW} h={HP} color={COL_FLOW}
          titulo="Flotación Rougher + Cleaner"
          sub="Recupera Cu y Mo · colas a relave"/>

        {/* Flotación → bifurca a 2 correas 5300 */}
        <LP x1={CC} y1={Y.flotacion+HP} x2={CC} y2={Y.cv5300-AH/2} sw={1.4}/>
        <LP x1={CV53LCX} y1={Y.cv5300-AH/2} x2={CV53RCX} y2={Y.cv5300-AH/2} sw={1.2}/>
        <VA x={CV53LCX} y1={Y.cv5300-AH/2} y2={Y.cv5300-1}/>
        <VA x={CV53RCX} y1={Y.cv5300-AH/2} y2={Y.cv5300-1}/>

        {/* ── 10. 5300: 2 correas ───────────────────── */}
        <NodoCorrea correa={get('5300-CV-001')} x={CV53LX} y={Y.cv5300} w={CV53W} h={HC}
          extra="CV · CRÍTICO · Área 5300"
          onClick={()=>onSelectCorrea(get('5300-CV-001'))}/>
        <NodoCorrea correa={get('5300-CV-002')} x={CV53RX} y={Y.cv5300} w={CV53W} h={HC}
          extra="CV · CRÍTICO · Área 5300"
          onClick={()=>onSelectCorrea(get('5300-CV-002'))}/>

        {/* Convergencia 5300 → separación */}
        <LP x1={CV53LCX} y1={Y.cv5300+HC} x2={CV53LCX} y2={Y.separacion-AH/2} sw={1.2}/>
        <LP x1={CV53RCX} y1={Y.cv5300+HC} x2={CV53RCX} y2={Y.separacion-AH/2} sw={1.2}/>
        <LP x1={CV53LCX} y1={Y.separacion-AH/2} x2={CV53RCX} y2={Y.separacion-AH/2} sw={1.2}/>
        <VA x={CC} y1={Y.separacion-AH/2} y2={Y.separacion-1}/>

        {/* ── 11. SEPARACIÓN Cu/Mo ──────────────────── */}
        <NodoProceso x={PX} y={Y.separacion} w={PW} h={HP} color={COL_FLOW}
          titulo="Separación Cu / Mo"
          sub="Flotación + espesamiento + filtrado"/>

        {/* Separación → bifurca a 3 correas 7200 */}
        <LP x1={CC} y1={Y.separacion+HP} x2={CC} y2={Y.c7200-AH/2} sw={1.4}/>
        <LP x1={c72cx[0]} y1={Y.c7200-AH/2} x2={c72cx[2]} y2={Y.c7200-AH/2} sw={1.2}/>
        <VA x={c72cx[0]} y1={Y.c7200-AH/2} y2={Y.c7200-1}/>
        <VA x={c72cx[1]} y1={Y.c7200-AH/2} y2={Y.c7200-1}/>
        <VA x={c72cx[2]} y1={Y.c7200-AH/2} y2={Y.c7200-1}/>

        {/* ── 12. 7200: 3 correas independientes ───── */}
        <NodoCorrea correa={get('7200-FE-001')} x={c72x[0]} y={Y.c7200} w={C72W} h={HC}
          critica extra="FE · CRÍTICO · Área 7200"
          onClick={()=>onSelectCorrea(get('7200-FE-001'))}/>
        <NodoCorrea correa={get('7200-CV-001')} x={c72x[1]} y={Y.c7200} w={C72W} h={HC}
          extra="CV · Alerta · 86 est. · Área 7200"
          onClick={()=>onSelectCorrea(get('7200-CV-001'))}/>
        <NodoCorrea correa={get('7200-FE-002')} x={c72x[2]} y={Y.c7200} w={C72W} h={HC}
          extra="FE · Alerta · Área 7200"
          onClick={()=>onSelectCorrea(get('7200-FE-002'))}/>

        {/* Convergencia 7200 → concentraducto */}
        <LP x1={c72cx[0]} y1={Y.c7200+HC} x2={c72cx[0]} y2={Y.concentra-AH/2} sw={1.2}/>
        <LP x1={c72cx[1]} y1={Y.c7200+HC} x2={c72cx[1]} y2={Y.concentra-AH/2} sw={1.2}/>
        <LP x1={c72cx[2]} y1={Y.c7200+HC} x2={c72cx[2]} y2={Y.concentra-AH/2} sw={1.2}/>
        <LP x1={c72cx[0]} y1={Y.concentra-AH/2} x2={c72cx[2]} y2={Y.concentra-AH/2} sw={1.2}/>
        <VA x={CC} y1={Y.concentra-AH/2} y2={Y.concentra-1}/>

        {/* ── 13. CONCENTRADUCTO ───────────────────── */}
        <NodoProceso x={PX} y={Y.concentra} w={PW} h={HP}
          titulo="Concentraducto · Punta Chungo"
          sub="120 km · exportación a Japón"/>

        {/* FOOTER */}
        <LP x1={40} y1={Y.footer-4} x2={VW-40} y2={Y.footer-4} col="#ddd" sw={0.8}/>
        <text x={CC} y={Y.footer+8} textAnchor="middle"
          fontFamily={FU} fontSize="10.5" fill="#8a9aaa">
          {`${totEst} estaciones monitoreadas · 24 correas · semana 22 · 28-05-2026 · ${totCrit} críticas · ${totAlt} en alerta`}
        </text>
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// VISTA MOBILE
// ══════════════════════════════════════════════════════════════
function CorreaCardMobile({ correa, onSelect }) {
  const est  = getCorreaStatus(correa);
  const col  = sc(est); const bg = sb(est);
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
          borderRadius:20, padding:'2px 8px'}}>{correa.numEstaciones} est.</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
        <span style={{display:'flex', alignItems:'center', gap:4,
          fontFamily:FU, fontSize:12, fontWeight:700, color:col}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:col,display:'inline-block'}}/>
          {sl(est)}
        </span>
        {crit>0 && <span style={{fontFamily:FU,fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:4,
          background:'rgba(192,39,45,0.10)',color:'#a01a20',border:'1px solid rgba(192,39,45,0.3)'}}>{crit} crít.</span>}
        {alt>0 && <span style={{fontFamily:FU,fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:4,
          background:'rgba(201,139,0,0.10)',color:'#7a5000',border:'1px solid rgba(201,139,0,0.3)'}}>{alt} alert.</span>}
      </div>
    </button>
  );
}

function EtapaMobile({ titulo, subtitulo, colorEtapa='#5a7080', correas=[], onSelect, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  const crit = correas.filter(c=>getCorreaStatus(c)==='critico').length;
  const alt  = correas.filter(c=>getCorreaStatus(c)==='alerta').length;
  return (
    <div style={{background:'#fff',border:'1px solid var(--border-color)',borderRadius:10,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
      <div style={{background:colorEtapa+'0d',borderLeft:`4px solid ${colorEtapa}`,padding:'12px 14px',display:'flex',flexDirection:'column',gap:4}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
          <div>
            <div style={{fontFamily:FU,fontSize:14,fontWeight:700,color:colorEtapa}}>{titulo}</div>
            {subtitulo&&<div style={{fontFamily:FU,fontSize:12,color:colorEtapa+'99',marginTop:2}}>{subtitulo}</div>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
            {crit>0&&<span style={{fontFamily:FU,fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:12,
              background:'rgba(192,39,45,0.10)',color:'#a01a20',border:'1px solid rgba(192,39,45,0.3)'}}>{crit} crít.</span>}
            {alt>0&&<span style={{fontFamily:FU,fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:12,
              background:'rgba(201,139,0,0.10)',color:'#7a5000',border:'1px solid rgba(201,139,0,0.3)'}}>{alt} alert.</span>}
            {correas.length>0&&(
              <button onClick={()=>setOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',
                color:colorEtapa,fontSize:18,display:'flex',alignItems:'center',padding:0}}>
                {open?'▲':'▼'}
              </button>
            )}
          </div>
        </div>
      </div>
      {open&&correas.length>0&&(
        <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:8,borderTop:`1px solid ${colorEtapa}22`}}>
          {correas.map(c=><CorreaCardMobile key={c.id} correa={c} onSelect={onSelect}/>)}
        </div>
      )}
    </div>
  );
}

function FlujoProcesaMobile({ correas, onSelectCorrea }) {
  const byId = useMemo(()=>Object.fromEntries(correas.map(c=>[c.id,c])),[correas]);
  const get  = id => byId[id];
  const etapas = [
    {titulo:'Mina rajo abierto',subtitulo:'4.600 m.s.n.m · 4.000 t/h',color:'#5a7080',correas:[]},
    {titulo:'Alimentación — 2 correas Área 2100',subtitulo:'CV-001 + FE-001 en paralelo',color:'#c98b00',
      correas:[get('2100-CV-001'),get('2100-FE-001')].filter(Boolean),defaultOpen:true},
    {titulo:'Chancado primario',subtitulo:'Trituradora giratoria',color:'#5a7080',correas:[]},
    {titulo:'Via CV — 2200-CV-001',subtitulo:'Crítica · Área 2200',color:'#c0272d',
      correas:[get('2200-CV-001')].filter(Boolean)},
    {titulo:'Via FE — 6 correas Área 2200',subtitulo:'FE-001 a FE-006 · 5 críticas',color:'#c0272d',
      correas:correas.filter(c=>c.area==='2200'&&c.tipo==='FE'),defaultOpen:true},
    {titulo:'Molienda SAG + molino bolas',subtitulo:'Alimentado por CV-001 + FE-001…006',color:COL_FLOW,correas:[]},
    {titulo:'★ 3300-CV-022',subtitulo:'92 est. · CRÍTICO · Crítica continuidad',color:'#c0272d',
      correas:[get('3300-CV-022')].filter(Boolean)},
    {titulo:'Harnero · clasificación',subtitulo:'Finos → 5+3 rutas · pebbles recirculan',color:COL_FLOW,correas:[]},
    {titulo:'★ 3300-CV-021 — Carga circulante',subtitulo:'Pebbles discharge · Área 3300',color:'#c98b00',
      correas:[get('3300-CV-021')].filter(Boolean)},
    {titulo:'5 CV a flotación — Área 3300',subtitulo:'CV-023 a CV-027',color:'#c0272d',
      correas:['3300-CV-023','3300-CV-024','3300-CV-025','3300-CV-026','3300-CV-027'].map(get).filter(Boolean),defaultOpen:true},
    {titulo:'3 FE a flotación — Área 3300',subtitulo:'FE-001 a FE-003 · 3 críticas',color:'#c0272d',
      correas:['3300-FE-001','3300-FE-002','3300-FE-003'].map(get).filter(Boolean),defaultOpen:true},
    {titulo:'Flotación Rougher + Cleaner',subtitulo:'Recupera Cu y Mo · colas a relave',color:COL_FLOW,correas:[]},
    {titulo:'Área 5300 — 2 correas',subtitulo:'CV-001 y CV-002 · 2 críticas',color:'#c0272d',
      correas:[get('5300-CV-001'),get('5300-CV-002')].filter(Boolean)},
    {titulo:'Separación Cu / Mo',subtitulo:'Flotación + espesamiento + filtrado',color:COL_FLOW,correas:[]},
    {titulo:'3 correas Área 7200',subtitulo:'FE-001 (crít.) · CV-001 · FE-002',color:'#c0272d',
      correas:[get('7200-FE-001'),get('7200-CV-001'),get('7200-FE-002')].filter(Boolean),defaultOpen:true},
    {titulo:'Concentraducto · Punta Chungo',subtitulo:'120 km · exportación a Japón',color:'#5a7080',correas:[]},
  ];
  const totCrit = correas.filter(c=>getCorreaStatus(c)==='critico').length;
  const totAlt  = correas.filter(c=>getCorreaStatus(c)==='alerta').length;
  const totEst  = correas.reduce((a,c)=>a+c.numEstaciones,0);
  return (
    <div style={{padding:'12px 12px 32px',display:'flex',flexDirection:'column',gap:8}}>
      <div style={{background:'#fff',border:'1px solid var(--border-color)',borderLeft:'4px solid #c47a2e',
        borderRadius:8,padding:'12px 14px',marginBottom:4}}>
        <div style={{fontFamily:FT,fontSize:11,letterSpacing:2,color:'#9a5e1f',fontWeight:700}}>
          FLUJO DE PROCESO — CASERONES · 24 CORREAS
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
          {totCrit>0&&<span style={{fontFamily:FU,fontSize:13,fontWeight:700,padding:'4px 12px',borderRadius:20,
            background:'rgba(192,39,45,0.10)',color:'#a01a20',border:'1px solid rgba(192,39,45,0.3)'}}>⬤ {totCrit} críticas</span>}
          {totAlt>0&&<span style={{fontFamily:FU,fontSize:13,fontWeight:700,padding:'4px 12px',borderRadius:20,
            background:'rgba(201,139,0,0.10)',color:'#7a5000',border:'1px solid rgba(201,139,0,0.3)'}}>⬤ {totAlt} alertas</span>}
          <span style={{fontFamily:FM,fontSize:11,color:'#8a9aaa',padding:'4px 10px',borderRadius:20,
            background:'rgba(0,0,0,0.04)',border:'1px solid #dde3ec'}}>{totEst} est.</span>
        </div>
      </div>
      {etapas.map((e,i)=>(
        <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:20,flexShrink:0,paddingTop:14}}>
            <div style={{width:10,height:10,borderRadius:'50%',
              background:e.correas.length>0?e.color:'#cdd5df',
              border:`2px solid ${e.correas.length>0?e.color:'#cdd5df'}`,flexShrink:0}}/>
            {i<etapas.length-1&&<div style={{width:2,flex:1,minHeight:16,background:'#e0e6ef',marginTop:2}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <EtapaMobile titulo={e.titulo} subtitulo={e.subtitulo} colorEtapa={e.color}
              correas={e.correas} onSelect={onSelectCorrea} defaultOpen={e.defaultOpen}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE RAÍZ
// ══════════════════════════════════════════════════════════════
export default function FlujoProceso({ correas, onSelectCorrea }) {
  const [isMobile, setIsMobile] = useState(()=>window.innerWidth<768);
  useEffect(()=>{
    const h = ()=>setIsMobile(window.innerWidth<768);
    window.addEventListener('resize',h);
    return ()=>window.removeEventListener('resize',h);
  },[]);
  return isMobile
    ? <FlujoProcesaMobile correas={correas} onSelectCorrea={onSelectCorrea}/>
    : <FlujoProcesaSVG    correas={correas} onSelectCorrea={onSelectCorrea}/>;
}
