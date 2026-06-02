// ============================================================
// components/VistaHistorial.jsx
// Historial mensual de inspecciones — pestaña en VistaInicio
// ============================================================
import { useMemo } from 'react';
import { ITEMS_INSP, ITEM_LABELS } from '../data/constants';
import { estadoColor } from '../utils/status';

// Genera un resumen de semana a partir de las correas actuales
function generarResumenSemana(correas, semana, fecha) {
  const criticos = correas.filter(c =>
    Object.values(c.items).some(i => i.estado === 'critico')
  ).length;
  const alertas = correas.filter(c =>
    !Object.values(c.items).some(i => i.estado === 'critico') &&
    Object.values(c.items).some(i => i.estado === 'alerta')
  ).length;
  const ok = correas.length - criticos - alertas;

  // Items más problemáticos
  const itemConteo = {};
  ITEMS_INSP.forEach(k => {
    itemConteo[k] = {
      critico: correas.filter(c => c.items[k]?.estado === 'critico').length,
      alerta:  correas.filter(c => c.items[k]?.estado === 'alerta').length,
    };
  });

  // Correas con problemas
  const correasCriticas = correas
    .filter(c => Object.values(c.items).some(i => i.estado === 'critico'))
    .map(c => ({ codigo: c.codigo, area: c.area }));

  return { semana, fecha, correas: correas.length, criticos, alertas, ok, itemConteo, correasCriticas };
}

// Datos de historial simulados para meses anteriores (se irán llenando con importaciones)
function generarHistorialDemo(correas) {
  const hoy = new Date('2026-05-28');
  const semanas = [];

  // Semana actual (real)
  semanas.push(generarResumenSemana(correas, 22, '2026-05-28'));

  // Semanas anteriores simuladas con variación
  const semanasDef = [
    { s: 21, f: '2026-05-21', factorCrit: 0.8, factorAlert: 0.9 },
    { s: 20, f: '2026-05-14', factorCrit: 0.6, factorAlert: 1.1 },
    { s: 19, f: '2026-05-07', factorCrit: 1.0, factorAlert: 0.7 },
    { s: 18, f: '2026-04-30', factorCrit: 0.5, factorAlert: 0.8 },
    { s: 17, f: '2026-04-23', factorCrit: 0.7, factorAlert: 1.0 },
    { s: 16, f: '2026-04-16', factorCrit: 0.4, factorAlert: 0.9 },
    { s: 15, f: '2026-04-09', factorCrit: 0.6, factorAlert: 0.6 },
  ];

  semanasDef.forEach(({ s, f, factorCrit, factorAlert }) => {
    const base = generarResumenSemana(correas, s, f);
    semanas.push({
      ...base,
      semana: s,
      fecha: f,
      criticos: Math.max(0, Math.round(base.criticos * factorCrit)),
      alertas:  Math.max(0, Math.round(base.alertas  * factorAlert)),
      ok: correas.length - Math.max(0, Math.round(base.criticos * factorCrit)) - Math.max(0, Math.round(base.alertas * factorAlert)),
    });
  });

  return semanas;
}

export default function VistaHistorial({ correas, historialImportado = [] }) {
  const historial = useMemo(
    () => historialImportado.length > 0
      ? historialImportado
      : generarHistorialDemo(correas),
    [correas, historialImportado]
  );

  const semanaActual = historial[0];

  return (
    <div className="historial-wrap">
      {/* Banner */}
      <div className="historial-banner">
        <div>
          <div className="historial-banner-title">
            <i className="bi bi-calendar3 me-2"/>
            HISTORIAL DE INSPECCIONES
          </div>
          <div className="historial-banner-sub">
            Últimas {historial.length} semanas · {correas.length} correas monitoreadas
          </div>
        </div>
        <div className="historial-banner-right">
          <div className="historial-kpi">
            <span className="historial-kpi-val" style={{ color: '#e74c3c' }}>
              {semanaActual?.criticos ?? 0}
            </span>
            <span className="historial-kpi-label">Críticas</span>
          </div>
          <div className="historial-kpi">
            <span className="historial-kpi-val" style={{ color: '#f4a700' }}>
              {semanaActual?.alertas ?? 0}
            </span>
            <span className="historial-kpi-label">En alerta</span>
          </div>
          <div className="historial-kpi">
            <span className="historial-kpi-val" style={{ color: '#2ecc71' }}>
              {semanaActual?.ok ?? 0}
            </span>
            <span className="historial-kpi-label">Normales</span>
          </div>
        </div>
      </div>

      <div className="historial-layout">
        {/* ── Tabla de semanas ── */}
        <div className="historial-tabla-wrap">
          <div className="historial-section-title">
            <i className="bi bi-table me-2"/>RESUMEN SEMANAL
          </div>
          <div className="historial-table-scroll">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Críticas</th>
                  <th>Alertas</th>
                  <th>Normales</th>
                  <th>% Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => {
                  const disp = Math.round((h.ok / h.correas) * 100);
                  const dispColor = disp >= 90 ? '#2ecc71' : disp >= 75 ? '#f4a700' : '#e74c3c';
                  return (
                    <tr key={i} className={i === 0 ? 'historial-row-actual' : ''}>
                      <td>
                        <span className="historial-semana-badge">
                          S{h.semana}
                          {i === 0 && <span className="historial-actual-tag">ACTUAL</span>}
                        </span>
                      </td>
                      <td className="historial-fecha">{h.fecha}</td>
                      <td className="historial-num">{h.correas}</td>
                      <td>
                        {h.criticos > 0
                          ? <span className="chip chip-rojo" style={{fontSize:9}}>{h.criticos}</span>
                          : <span style={{color:'#4a5e6d'}}>—</span>
                        }
                      </td>
                      <td>
                        {h.alertas > 0
                          ? <span className="chip chip-amarillo" style={{fontSize:9}}>{h.alertas}</span>
                          : <span style={{color:'#4a5e6d'}}>—</span>
                        }
                      </td>
                      <td>
                        <span className="chip chip-verde" style={{fontSize:9}}>{h.ok}</span>
                      </td>
                      <td>
                        <div className="historial-disp-wrap">
                          <div className="historial-disp-bar">
                            <div style={{ width: `${disp}%`, background: dispColor, height: '100%', borderRadius: 3, transition: 'width 0.3s' }}/>
                          </div>
                          <span className="historial-disp-pct" style={{ color: dispColor }}>{disp}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Panel derecho: ítems problemáticos ── */}
        <div className="historial-derecho">
          {/* Ítem más problemático esta semana */}
          <div className="historial-section-title">
            <i className="bi bi-bar-chart me-2"/>ESTADO POR ÍTEM — SEMANA ACTUAL
          </div>
          <div className="historial-items-list">
            {ITEMS_INSP.map(k => {
              const crits  = semanaActual?.itemConteo[k]?.critico ?? 0;
              const alerts = semanaActual?.itemConteo[k]?.alerta  ?? 0;
              const total  = semanaActual?.correas ?? 1;
              const pctOk  = Math.round(((total - crits - alerts) / total) * 100);
              const peor   = crits > 0 ? 'critico' : alerts > 0 ? 'alerta' : 'ok';
              return (
                <div key={k} className="historial-item-row">
                  <div className="historial-item-label">
                    <span className="historial-item-dot" style={{ background: estadoColor(peor) }}/>
                    {ITEM_LABELS[k]}
                  </div>
                  <div className="historial-item-bar-wrap">
                    <div className="historial-item-bar-bg">
                      <div className="historial-item-bar-fill"
                        style={{ width: `${pctOk}%`, background: estadoColor(peor) }}/>
                    </div>
                  </div>
                  <div className="historial-item-nums">
                    {crits > 0  && <span className="chip chip-rojo"    style={{fontSize:8,padding:'1px 5px'}}>{crits}c</span>}
                    {alerts > 0 && <span className="chip chip-amarillo" style={{fontSize:8,padding:'1px 5px'}}>{alerts}a</span>}
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#7a96aa' }}>{pctOk}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Correas críticas */}
          {semanaActual?.correasCriticas?.length > 0 && (
            <>
              <div className="historial-section-title" style={{ marginTop: 16 }}>
                <i className="bi bi-x-octagon me-2"/>CORREAS CRÍTICAS
              </div>
              <div className="historial-criticas-list">
                {semanaActual.correasCriticas.map((c, i) => (
                  <div key={i} className="historial-critica-row">
                    <span className="chip chip-rojo" style={{ fontSize: 9 }}>{c.codigo}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#7a96aa' }}>Área {c.area}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
