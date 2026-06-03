// ============================================================
// components/VistaCorrea.jsx — v3.1
// Layout 2 columnas: Donut Chart.js + 8 ítems acordeón
// Ítem "Estaciones de Polines" muestra SVG resumen de correa
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ITEMS_CONFIG } from '../data/constants';
import { estadoColor } from '../utils/status';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

// ITEMS_CONFIG importado desde data/constants.js

const EC = {
  ok:      { label: 'OK',      color: '#2ecc71', icon: 'bi-check-circle-fill',         bg: 'rgba(46,204,113,0.15)',  border: 'rgba(46,204,113,0.35)' },
  alerta:  { label: 'ALERTA',  color: '#f4a700', icon: 'bi-exclamation-triangle-fill', bg: 'rgba(244,167,0,0.15)',   border: 'rgba(244,167,0,0.4)'   },
  critico: { label: 'CRÍTICO', color: '#e74c3c', icon: 'bi-x-octagon-fill',            bg: 'rgba(231,76,60,0.15)',   border: 'rgba(231,76,60,0.4)'   },
};

// ── SVG resumen de estaciones de polines ─────────────────────
// 3 filas (LE / CEN / LD) × N columnas (una por estación)
// Leyenda separada fuera del SVG (ver wrapper en JSX)
function PolinesResumenSVG({ estaciones = [], color = '#209eb0' }) {
  const cp = (estado) => {
    if (estado === 'critico') return '#e74c3c';
    if (estado === 'alerta')  return '#f4a700';
    return '#2ecc71';
  };

  const MAX_VISIBLE = 30;
  const visible = estaciones.slice(0, MAX_VISIBLE);
  const n = visible.length || 1;

  // Dimensiones SVG
  const W      = 640;
  const H      = 130;
  const PAD_X  = 30;           // margen izq/der para poleas
  const PAD_Y  = 10;           // margen superior
  const usable = W - PAD_X * 2;
  const step   = usable / (n - 1 || 1);

  // Filas: LE (izquierdo), CEN (central), LD (derecho)
  const ROWS = [
    { key: 'izquierdo', label: 'LE',  cy: PAD_Y + 14  },
    { key: 'central',   label: 'CEN', cy: PAD_Y + 44  },
    { key: 'derecho',   label: 'LD',  cy: PAD_Y + 74  },
  ];
  const R = 7; // radio de cada círculo-polín

  // Banda de carga va por la fila CEN
  const bandY  = ROWS[1].cy - R - 2;
  const bandH  = ROWS[1].cy - ROWS[0].cy + R * 2 + 4;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Fondo */}
      <rect width={W} height={H} fill="#eaeff5" rx="6"/>

      {/* Etiquetas de fila a la izquierda */}
      {ROWS.map(row => (
        <text key={row.key} x="4" y={row.cy + 4}
          fontFamily="'Share Tech Mono',monospace" fontSize="7"
          fill="#4a5e6d" textAnchor="start">{row.label}
        </text>
      ))}

      {/* Línea de banda (carga) entre LE y LD */}
      <rect
        x={PAD_X} y={ROWS[0].cy - R}
        width={usable} height={ROWS[2].cy - ROWS[0].cy + R * 2}
        rx="4"
        fill={color + '08'} stroke={color + '22'} strokeWidth="1"
      />

      {/* Banda retorno debajo */}
      <rect x={PAD_X} y={ROWS[2].cy + R + 6} width={usable} height="5" rx="2"
        fill="#d5dce5" stroke="#b8c4cc" strokeWidth="1"/>

      {/* Poleas extremos (por la fila CEN) */}
      <circle cx={PAD_X}          cy={ROWS[1].cy} r="16"
        fill="#d5dce5" stroke={color + '77'} strokeWidth="2"/>
      <circle cx={PAD_X + usable} cy={ROWS[1].cy} r="16"
        fill="#d5dce5" stroke={color + '77'} strokeWidth="2"/>

      {/* Polines: 3 por estación */}
      {visible.map((est, i) => {
        const cx = PAD_X + i * step;
        const polines = [
          { row: ROWS[0], data: est.izquierdo },
          { row: ROWS[1], data: est.central   },
          { row: ROWS[2], data: est.derecho   },
        ];
        return (
          <g key={i}>
            {/* Eje vertical que une los 3 */}
            <line
              x1={cx} y1={ROWS[0].cy}
              x2={cx} y2={ROWS[2].cy}
              stroke="#b8c4cc" strokeWidth="1"
            />
            {/* Círculo por cada polín */}
            {polines.map(({ row, data }) => (
              <circle key={row.key}
                cx={cx} cy={row.cy} r={R}
                fill={cp(data?.estado)}
                opacity="0.92"
              />
            ))}
            {/* Número de estación cada 5 o primero/último */}
            {(i === 0 || (i + 1) % 5 === 0 || i === n - 1) && (
              <text x={cx} y={H - 4}
                textAnchor="middle"
                fontFamily="'Share Tech Mono',monospace"
                fontSize="7" fill="#7a96aa"
              >
                {est.numero}
              </text>
            )}
          </g>
        );
      })}

      {/* Total estaciones si hay más de MAX_VISIBLE */}
      {estaciones.length > MAX_VISIBLE && (
        <text x={W - 6} y={H - 6}
          textAnchor="end"
          fontFamily="'Share Tech Mono',monospace"
          fontSize="8"
          fill="#7a96aa"
        >
          +{estaciones.length - MAX_VISIBLE} más
        </text>
      )}
    </svg>
  );
}

// ── Gráfico de torta de items ─────────────────────────────────
function ItemsDonut({ items }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const criticos = Object.values(items).filter(i => i.estado === 'critico').length;
    const alertas  = Object.values(items).filter(i => i.estado === 'alerta').length;
    const oks      = Object.values(items).filter(i => i.estado === 'ok').length;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['OK', 'Alerta', 'Crítico'],
        datasets: [{
          data: [oks, alertas, criticos],
          backgroundColor: ['rgba(46,204,113,0.8)', 'rgba(244,167,0,0.8)', 'rgba(231,76,60,0.8)'],
          borderColor:      ['#2ecc71', '#f4a700', '#e74c3c'],
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: { duration: 500 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#3a4f63',
              font: { family: "'Share Tech Mono', monospace", size: 10 },
              padding: 8, boxWidth: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} ítem${ctx.raw !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [items]);

  const total = Object.values(items).length;
  const oks   = Object.values(items).filter(i => i.estado === 'ok').length;

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <canvas ref={canvasRef}/>
      <div style={{
        position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {oks}/{total}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>OK</div>
      </div>
    </div>
  );
}

// ── Uploader de fotos ─────────────────────────────────────────
function FotoUploader({ fotos, onAdd, itemKey }) {
  const ref = useRef(null);
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      onAdd(itemKey, { url, name: file.name });
    });
  }
  return (
    <div className="foto-uploader">
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}/>
      <div className="foto-grid">
        {fotos.map((f, i) => (
          <div key={i} className="foto-thumb">
            <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}/>
          </div>
        ))}
        <button className="foto-add-btn" onClick={() => ref.current?.click()}>
          <i className="bi bi-camera-fill" style={{ fontSize: 18 }}/>
          <span>{fotos.length === 0 ? 'Añadir foto' : '+'}</span>
        </button>
      </div>
    </div>
  );
}

// ── Item de inspección ────────────────────────────────────────
function ItemInspeccion({ itemKey, config, data, correa, onFotoAdd, onNotaChange, onEstadoChange }) {
  const [expanded, setExpanded] = useState(false);
  const isPolines = itemKey === 'polines';

  return (
    <div className={`insp-item insp-item--${data.estado}`}>
      <div className="insp-item-header" onClick={() => setExpanded(e => !e)}>
        <div className="insp-item-left">
          <i className={`bi ${config.icon} insp-item-icon`}/>
          <span className="insp-item-label">{config.label}</span>
        </div>
        <div className="insp-item-center" onClick={e => e.stopPropagation()}>
          <div className="estado-selector">
            {['ok', 'alerta', 'critico'].map(s => (
              <button key={s}
                className={`estado-btn estado-btn--${s} ${data.estado === s ? 'active' : ''}`}
                onClick={() => onEstadoChange(itemKey, s)}>
                {EC[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="insp-item-right">
          <span className="foto-count"><i className="bi bi-camera me-1"/>{data.fotos.length}</span>
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'} insp-chevron`}/>
        </div>
      </div>

      {expanded && (
        <div className="insp-item-body">
          {/* Bloque especial para polines: SVG de correa */}
          {isPolines && correa.estaciones?.length > 0 && (
            <div className="polines-svg-wrap">
              <div className="polines-svg-label">
                <i className="bi bi-diagram-3 me-2"/>
                VISTA DE ESTACIONES — {correa.numEstaciones} estaciones
              </div>
              <div className="polines-svg-canvas">
                <PolinesResumenSVG
                  estaciones={correa.estaciones}
                  color={correa.color}
                />
              </div>
              {/* Leyenda fuera del SVG */}
              <div className="polines-leyenda">
                <span className="polines-leyenda-fila"><span className="polines-leyenda-dot" style={{background:'#4a5e6d'}}/><span className="polines-leyenda-txt">LE</span><span className="polines-leyenda-sep">Izquierdo</span></span>
                <span className="polines-leyenda-fila"><span className="polines-leyenda-dot" style={{background:'#4a5e6d'}}/><span className="polines-leyenda-txt">CEN</span><span className="polines-leyenda-sep">Central</span></span>
                <span className="polines-leyenda-fila"><span className="polines-leyenda-dot" style={{background:'#4a5e6d'}}/><span className="polines-leyenda-txt">LD</span><span className="polines-leyenda-sep">Derecho</span></span>
                <span className="polines-leyenda-sep">·</span>
                {[['#2ecc71','OK'],['#f4a700','Alerta'],['#e74c3c','Crítico']].map(([c,l]) => (
                  <span key={l} className="polines-leyenda-fila">
                    <span className="polines-leyenda-dot" style={{background:c}}/>
                    <span className="polines-leyenda-txt">{l}</span>
                  </span>
                ))}
              </div>
              {/* Resumen de estados */}
              <div className="polines-stats">
                {['critico', 'alerta', 'ok'].map(est => {
                  const count = correa.estaciones.filter(e =>
                    [e.izquierdo, e.central, e.derecho].some(p => p?.estado === est)
                  ).length;
                  if (count === 0) return null;
                  return (
                    <span key={est} className={`chip chip-${est === 'ok' ? 'verde' : est === 'alerta' ? 'amarillo' : 'rojo'}`}>
                      <i className={`bi ${EC[est].icon} me-1`}/>
                      {count} est. {EC[est].label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observaciones + fotos (siempre) */}
          <div className="insp-item-content">
            <div className="insp-notas-area">
              <label className="insp-notas-label">Observaciones</label>
              <textarea className="insp-notas-input" value={data.notas} rows={4}
                onChange={e => onNotaChange(itemKey, e.target.value)}
                placeholder="Ingrese observaciones técnicas..."/>
            </div>
            <div className="insp-fotos-area">
              <label className="insp-notas-label">Registro Fotográfico</label>
              <FotoUploader fotos={data.fotos} itemKey={itemKey} onAdd={onFotoAdd}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────
export default function VistaCorrea({ correa, onBack, onUpdate, onNuevaInspeccion, onInformeUnitario, soloLectura = false }) {
  const [items, setItems] = useState(() => ({ ...correa.items }));
  const [historialAbierto, setHistorialAbierto] = useState(null); // inspeccion del historial en vista detalle

  const historial = correa.historial || [];
  const allFotosLoaded = Object.values(items).every(i => i.fotos.length > 0);
  const criticos = Object.values(items).filter(i => i.estado === 'critico').length;
  const alertas  = Object.values(items).filter(i => i.estado === 'alerta').length;

  const handleFotoAdd = useCallback((itemKey, foto) => {
    setItems(prev => ({ ...prev, [itemKey]: { ...prev[itemKey], fotos: [...prev[itemKey].fotos, foto] } }));
  }, []);
  const handleNotaChange = useCallback((itemKey, val) => {
    setItems(prev => ({ ...prev, [itemKey]: { ...prev[itemKey], notas: val } }));
  }, []);
  const handleEstadoChange = useCallback((itemKey, estado) => {
    setItems(prev => ({ ...prev, [itemKey]: { ...prev[itemKey], estado } }));
  }, []);

  return (
    <div className="vista-correa">
      {/* Barra de correa */}
      <div className="correa-topbar">
        <button className="btn-back" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"/>Volver
        </button>
        <div className="correa-topbar-info">
          <span className="correa-topbar-codigo" style={{ color: correa.color }}>{correa.codigo}</span>
          <span className="correa-topbar-sep">·</span>
          <span className="correa-topbar-nombre">{correa.nombre}</span>
          <span className="correa-topbar-sep d-none d-md-inline">·</span>
          <span className="correa-topbar-area d-none d-md-inline">Área {correa.area}</span>
        </div>
        <div className="correa-topbar-badges">
          {criticos > 0 && <span className="chip chip-rojo"><i className="bi bi-x-octagon me-1"/>{criticos} crít.</span>}
          {alertas  > 0 && <span className="chip chip-naranja"><i className="bi bi-exclamation-triangle me-1"/>{alertas} alert.</span>}
        </div>
      </div>

      <div className="correa-layout">
        {/* ── Columna izquierda: torta + metadata ── */}
        <div className="correa-col-left">
          <div className="panel-header">
            <i className="bi bi-info-circle me-2"/>INFORMACIÓN
          </div>
          <div className="correa-meta">
            {[
              { label: 'Código',      val: correa.codigo },
              { label: 'Área',        val: correa.area },
              { label: 'Tipo',        val: correa.tipo },
              { label: 'Responsable', val: correa.responsable },
              { label: 'Inspección',  val: correa.ultimaInspeccion },
              { label: 'Estaciones',  val: `${correa.numEstaciones}` },
            ].map(({ label, val }) => (
              <div key={label} className="meta-row">
                <span className="meta-label">{label}</span>
                <span className="meta-val">{val}</span>
              </div>
            ))}
          </div>

          <div className="panel-header"><i className="bi bi-circle-half me-2"/>LEYENDA</div>
          <div className="leyenda-box">
            {Object.entries(EC).map(([key, ec]) => (
              <div key={key} className="leyenda-row">
                <span className="leyenda-dot" style={{ background: ec.color }}/>
                <span className="leyenda-label">{ec.label}</span>
                <i className={`bi ${ec.icon}`} style={{ color: ec.color, fontSize: 11, marginLeft: 'auto' }}/>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha: ítems de inspección ── */}
        <div className="correa-col-right">
          <div className="insp-header">
            <div className="insp-header-title">
              <i className="bi bi-clipboard-check me-2"/>
              REGISTRO DE INSPECCIÓN
            </div>
            <div className="insp-header-sub">
              Responsable: <strong>{correa.responsable}</strong> &nbsp;·&nbsp; {correa.ultimaInspeccion}
            </div>
          </div>

          <div className="insp-items-list">
            {ITEMS_CONFIG.map(ic => (
              <ItemInspeccion
                key={ic.key}
                itemKey={ic.key}
                config={ic}
                data={items[ic.key]}
                correa={correa}
                onFotoAdd={handleFotoAdd}
                onNotaChange={handleNotaChange}
                onEstadoChange={handleEstadoChange}
              />
            ))}
          </div>

          {/* Boton Ingresar Datos — solo visible para inspector */}
          {!soloLectura && onNuevaInspeccion && (
            <div className="informe-btn-area">
              <button
                className="btn-nueva-inspeccion"
                onClick={onNuevaInspeccion}
              >
                <i className="bi bi-pencil-square me-2"/>
                Ingresar Datos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
