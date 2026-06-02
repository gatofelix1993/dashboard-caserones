// ============================================================
// components/VistaInicio.jsx
// Pantalla home: tabs Correas | Historial
// ============================================================
import { useMemo, useState } from 'react';
import VistaHistorial from './VistaHistorial';
import { getCorreaStatus } from '../utils/status';

// ── Dibujo SVG de una correa transportadora ─────────────────
function ConveyorSVG({ color = '#209eb0', id }) {
  // seed se mantiene por si se necesita variación visual futura
  // const seed = id ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : 42;
  return (
    <svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}>
      {/* Fondo oscuro */}
      <rect width="320" height="140" fill="#1a2028" rx="4"/>

      {/* Estructura soporte */}
      {[40, 80, 120, 160, 200, 240, 280].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="90" x2={x - 10} y2="130" stroke="#3a4a57" strokeWidth="2"/>
          <line x1={x} y1="90" x2={x + 10} y2="130" stroke="#3a4a57" strokeWidth="2"/>
          <line x1={x - 12} y1="130" x2={x + 12} y2="130" stroke="#3a4a57" strokeWidth="1.5"/>
        </g>
      ))}

      {/* Banda transportadora (retorno) */}
      <rect x="20" y="94" width="280" height="6" rx="3" fill="#2a3540" stroke="#3a4a57" strokeWidth="1"/>

      {/* Banda transportadora (carga) */}
      <path d="M20 78 Q160 70 300 78 L300 86 Q160 94 20 86 Z"
        fill={color + '30'} stroke={color} strokeWidth="1.5"/>

      {/* Polines de carga (estaciones: 3 polines c/u) */}
      {[55, 115, 175, 235].map((x, si) => (
        <g key={si}>
          <rect x={x - 20} y="72" width="6" height="22" rx="3"
            fill={color} opacity="0.85"
            transform={`rotate(-20, ${x - 17}, 83)`}/>
          <rect x={x - 3} y="68" width="6" height="24" rx="3"
            fill={color} opacity="0.95"/>
          <rect x={x + 14} y="72" width="6" height="22" rx="3"
            fill={color} opacity="0.85"
            transform={`rotate(20, ${x + 17}, 83)`}/>
        </g>
      ))}

      {/* Polines de retorno */}
      {[70, 160, 250].map((x, i) => (
        <rect key={i} x={x - 3} y="92" width="6" height="10" rx="3"
          fill="#374752" stroke="#4a5e6d" strokeWidth="0.8"/>
      ))}

      {/* Polea motriz derecha */}
      <circle cx="300" cy="82" r="16" fill="#2b3640" stroke={color} strokeWidth="2"/>
      <circle cx="300" cy="82" r="9" fill={color + '40'} stroke={color} strokeWidth="1.5"/>
      <circle cx="300" cy="82" r="3" fill={color}/>

      {/* Polea cola izquierda */}
      <circle cx="20" cy="82" r="14" fill="#2b3640" stroke="#4a5e6d" strokeWidth="1.5"/>
      <circle cx="20" cy="82" r="7" fill="#374752" stroke="#4a5e6d" strokeWidth="1"/>
      <circle cx="20" cy="82" r="2.5" fill="#374752"/>

      {/* Banda superior (cubierta) */}
      <path d="M20 66 Q160 58 300 66" fill="none" stroke={color + '60'} strokeWidth="3"/>

      {/* Líneas de carga (simulan material) */}
      <rect x="60" y="70" width="180" height="8" rx="2" fill={color + '18'}/>

      {/* Estructura lateral */}
      <rect x="6" y="68" width="4" height="24" rx="1" fill="#374752"/>
      <rect x="310" y="68" width="4" height="24" rx="1" fill="#374752"/>
    </svg>
  );
}

// getCorreaStatus importado desde utils/status.js

const STATUS_CONFIG = {
  critico: { label: 'CRÍTICO', color: '#c0392b', bg: 'rgba(192,57,43,0.15)', border: 'rgba(192,57,43,0.4)' },
  alerta:  { label: 'ALERTA',  color: '#e96c28', bg: 'rgba(233,108,40,0.15)', border: 'rgba(233,108,40,0.4)' },
  ok:      { label: 'NORMAL',  color: '#27ae60', bg: 'rgba(39,174,96,0.12)',  border: 'rgba(39,174,96,0.3)' },
};

function groupByArea(correas) {
  return correas.reduce((acc, c) => {
    if (!acc[c.area]) acc[c.area] = [];
    acc[c.area].push(c);
    return acc;
  }, {});
}

export default function VistaInicio({ correas, onSelectCorrea }) {
  const areas = useMemo(() => groupByArea(correas), [correas]);
  const totalCriticos = correas.filter(c => getCorreaStatus(c) === 'critico').length;
  const totalAlertas  = correas.filter(c => getCorreaStatus(c) === 'alerta').length;
  const [tabActiva, setTabActiva] = useState('correas');

  return (
    <div className="vista-inicio">
      {/* Tabs de navegación */}
      <div className="inicio-tabs">
        <button
          className={`inicio-tab ${tabActiva === 'correas' ? 'inicio-tab--active' : ''}`}
          onClick={() => setTabActiva('correas')}
        >
          <i className="bi bi-grid me-2"/>CORREAS
          <span className="inicio-tab-count">{correas.length}</span>
        </button>
        <button
          className={`inicio-tab ${tabActiva === 'historial' ? 'inicio-tab--active' : ''}`}
          onClick={() => setTabActiva('historial')}
        >
          <i className="bi bi-calendar3 me-2"/>HISTORIAL
        </button>
      </div>

      {/* Tab: Historial */}
      {tabActiva === 'historial' && (
        <VistaHistorial correas={correas}/>
      )}

      {/* Tab: Correas */}
      {tabActiva === 'correas' && (<>
        <div className="inicio-banner">
          <div className="inicio-banner-left">
            <div className="inicio-banner-title">INSPECCIÓN CINTAS TRANSPORTADORAS</div>
            <div className="inicio-banner-sub">Semana N°22 · 28 de mayo 2026 · {correas.length} correas monitoreadas</div>
          </div>
          <div className="inicio-banner-right">
            {totalCriticos > 0 && (
              <div className="inicio-stat critico">
                <i className="bi bi-x-octagon-fill"/>{totalCriticos} Críticas
              </div>
            )}
            {totalAlertas > 0 && (
              <div className="inicio-stat alerta">
                <i className="bi bi-exclamation-triangle-fill"/>{totalAlertas} En alerta
              </div>
            )}
            <div className="inicio-stat ok">
              <i className="bi bi-check-circle-fill"/>{correas.length - totalCriticos - totalAlertas} Normales
            </div>
          </div>
        </div>

        {/* Grilla por área */}
        {Object.entries(areas).map(([area, lista]) => (
          <div key={area} className="area-section">
            <div className="area-header">
              <div className="area-pill">ÁREA {area}</div>
              <div className="area-line"/>
              <span className="area-count">{lista.length} correas</span>
            </div>
            <div className="correa-grid">
              {lista.map(correa => {
                const status = getCorreaStatus(correa);
                const sc = STATUS_CONFIG[status];
                const criticos = Object.values(correa.items).filter(i => i.estado === 'critico').length;
                const alertas  = Object.values(correa.items).filter(i => i.estado === 'alerta').length;

                return (
                  <button
                    key={correa.id}
                    className="correa-card"
                    onClick={() => onSelectCorrea(correa)}
                    style={{ '--card-color': correa.color, '--status-bg': sc.bg, '--status-border': sc.border }}
                  >
                    <div className="correa-card-status" style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                      <span className="status-dot" style={{ background: sc.color }}/>
                      {sc.label}
                    </div>
                    <div className="correa-card-svg">
                      <ConveyorSVG color={correa.color} id={correa.id}/>
                    </div>
                    <div className="correa-card-info">
                      <div className="correa-card-codigo">{correa.codigo}</div>
                      <div className="correa-card-nombre">{correa.nombre}</div>
                      <div className="correa-card-desc">{correa.descripcion}</div>
                    </div>
                    <div className="correa-card-badges">
                      {criticos > 0 && (
                        <span className="badge-mini badge-crit-mini">
                          <i className="bi bi-x-octagon-fill me-1"/>{criticos} crít.
                        </span>
                      )}
                      {alertas > 0 && (
                        <span className="badge-mini badge-alert-mini">
                          <i className="bi bi-exclamation-triangle me-1"/>{alertas} alert.
                        </span>
                      )}
                      <span className="badge-mini badge-est-mini">
                        {correa.numEstaciones} est.
                      </span>
                    </div>
                    <div className="correa-card-arrow">
                      <i className="bi bi-arrow-right-circle"/>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </>)}
    </div>
  );
}
