// ============================================================
// components/TablaPolines.jsx — Tabla operacional por correa
// Responsive: tabla en desktop/tablet, cards en mobile
// ============================================================
import { useState, useCallback } from 'react';
import StatusChip from './StatusChip';
import StatusBar from './StatusBar';
import SensorValue from './SensorValue';
import HistorialPanel from './HistorialPanel';
import ModalRegistro from './ModalRegistro';
import {
  getOverallStatus,
  getStatus,
  daysUntilInspection,
  daysUntilReemplazo,
  toPct,
} from '../utils/maintenance';

// ── Card mobile individual por polín ──────────────────────────
function PolinCard({ p, correa, config, onRegistrar, onToggleHistorial, isExpanded }) {
  const dInsp   = daysUntilInspection(p, config.intervaloDiasInspeccion);
  const dRemp   = daysUntilReemplazo(p);
  const sInsp   = getStatus(dInsp, config.diasAlertaTemprana);
  const sRemp   = getStatus(dRemp, config.diasAlertaTemprana);
  const overall = getOverallStatus(p, config);

  return (
    <div className={`polin-card polin-card--${overall}`}>
      {/* Cabecera */}
      <div className="polin-card-header" onClick={onToggleHistorial}>
        <div className="polin-card-id" style={{ color: correa.color }}>
          {p.id}
        </div>
        <StatusChip status={overall} />
        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} polin-card-chevron`} />
      </div>

      {/* Sensores en fila */}
      <div className="polin-card-sensors">
        <div className="polin-sensor-item">
          <span className="polin-sensor-label">TEMP</span>
          <SensorValue val={p.temperatura} warn={60} crit={80} unit="°C" />
        </div>
        <div className="polin-sensor-item">
          <span className="polin-sensor-label">VIB</span>
          <SensorValue val={p.vibracion} warn={3.5} crit={4.5} unit="mm/s" />
        </div>
        <div className="polin-sensor-item">
          <span className="polin-sensor-label">HORAS</span>
          <span className="mono-val" style={{ fontSize: 12 }}>{p.horasOperacion.toLocaleString('es-CL')}h</span>
        </div>
      </div>

      {/* Barras de estado */}
      <div className="polin-card-bars">
        <div className="polin-bar-group">
          <div className="polin-bar-labels">
            <span className="polin-sensor-label">INSPECCIÓN</span>
            <span className={`days-val ${dInsp <= 0 ? 'days-val--expired' : ''}`} style={{ fontSize: 11 }}>
              {dInsp <= 0 ? `VENC. ${Math.abs(dInsp)}d` : `${dInsp}d`}
            </span>
          </div>
          <StatusBar pctValue={toPct(Math.max(0, dInsp), config.intervaloDiasInspeccion)} status={sInsp} />
        </div>
        <div className="polin-bar-group">
          <div className="polin-bar-labels">
            <span className="polin-sensor-label">REEMPLAZO</span>
            <span className={`days-val ${dRemp <= 0 ? 'days-val--expired' : ''}`} style={{ fontSize: 11 }}>
              {dRemp <= 0 ? `VENC. ${Math.abs(dRemp)}d` : `${dRemp}d`}
            </span>
          </div>
          <StatusBar pctValue={toPct(Math.max(0, dRemp), 180)} status={sRemp} />
        </div>
      </div>

      {/* Acciones */}
      <div className="polin-card-actions" onClick={e => e.stopPropagation()}>
        <button className="btn-ghost btn-ghost--blue btn-full" onClick={() => onRegistrar('inspeccion')}>
          <i className="bi bi-clipboard-check me-1" /> Inspección
        </button>
        <button className="btn-ghost btn-ghost--orange btn-full" onClick={() => onRegistrar('reemplazo')}>
          <i className="bi bi-arrow-repeat me-1" /> Reemplazo
        </button>
      </div>

      {/* Historial expandible */}
      {isExpanded && (
        <div className="polin-card-historial">
          <HistorialPanel
            polin={p}
            onClose={onToggleHistorial}
            onRegistrar={onRegistrar}
          />
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function TablaPolines({ correa, config, onUpdate }) {
  const [expandedId, setExpandedId] = useState(null);
  const [modalState, setModalState] = useState(null);

  const handleSave = useCallback((polin, reg) => {
    const updated = {
      ...polin,
      historial: [...polin.historial, reg],
      ...(reg.tipo === 'inspeccion' ? { ultimaInspeccion: reg.fecha } : {}),
      ...(reg.tipo === 'reemplazo'  ? { ultimoReemplazo: reg.fecha, horasOperacion: 0 } : {}),
    };
    onUpdate(correa.id, updated);
    setModalState(null);
  }, [correa.id, onUpdate]);

  return (
    <>
      {modalState && (
        <ModalRegistro
          polin={modalState.polin}
          tipoInit={modalState.tipo}
          onClose={() => setModalState(null)}
          onSave={reg => handleSave(modalState.polin, reg)}
        />
      )}

      {/* ── VISTA DESKTOP: tabla horizontal ── */}
      <div className="tabla-desktop table-responsive">
        <table className="scada-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Estado</th>
              <th>Temp.</th>
              <th>Vibración</th>
              <th>Horas Op.</th>
              <th>Días→Insp.</th>
              <th style={{ minWidth: 120 }}>Prog. Insp.</th>
              <th>Días→Remp.</th>
              <th style={{ minWidth: 120 }}>Prog. Remp.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {correa.polines.map(p => {
              const dInsp   = daysUntilInspection(p, config.intervaloDiasInspeccion);
              const dRemp   = daysUntilReemplazo(p);
              const sInsp   = getStatus(dInsp, config.diasAlertaTemprana);
              const sRemp   = getStatus(dRemp, config.diasAlertaTemprana);
              const overall = getOverallStatus(p, config);
              const expanded = expandedId === p.id;

              return (
                <>
                  <tr
                    key={p.id}
                    className={`polin-row ${expanded ? 'polin-row--expanded' : ''}`}
                    onClick={() => setExpandedId(expanded ? null : p.id)}
                  >
                    <td><span className="polin-num" style={{ color: correa.color }}>P{p.numero}</span></td>
                    <td><StatusChip status={overall} /></td>
                    <td><SensorValue val={p.temperatura} warn={60} crit={80} unit="°C" /></td>
                    <td><SensorValue val={p.vibracion} warn={3.5} crit={4.5} unit="mm/s" /></td>
                    <td><span className="mono-val">{p.horasOperacion.toLocaleString('es-CL')} h</span></td>
                    <td>
                      <span className={`days-val ${dInsp <= 0 ? 'days-val--expired' : ''}`}>
                        {dInsp <= 0 ? `VENC. ${Math.abs(dInsp)}d` : `${dInsp}d`}
                      </span>
                    </td>
                    <td><StatusBar pctValue={toPct(Math.max(0, dInsp), config.intervaloDiasInspeccion)} status={sInsp} /></td>
                    <td>
                      <span className={`days-val ${dRemp <= 0 ? 'days-val--expired' : ''}`}>
                        {dRemp <= 0 ? `VENC. ${Math.abs(dRemp)}d` : `${dRemp}d`}
                      </span>
                    </td>
                    <td><StatusBar pctValue={toPct(Math.max(0, dRemp), 180)} status={sRemp} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="action-btns">
                        <button className="btn-ghost btn-ghost--blue" title="Inspección"
                          onClick={() => setModalState({ polin: p, tipo: 'inspeccion' })}>
                          <i className="bi bi-clipboard-check" />
                        </button>
                        <button className="btn-ghost btn-ghost--orange" title="Reemplazo"
                          onClick={() => setModalState({ polin: p, tipo: 'reemplazo' })}>
                          <i className="bi bi-arrow-repeat" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${p.id}-hist`} className="historial-row">
                      <td colSpan={10}>
                        <HistorialPanel
                          polin={p}
                          onClose={() => setExpandedId(null)}
                          onRegistrar={tipo => setModalState({ polin: p, tipo })}
                        />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── VISTA MOBILE: cards apiladas ── */}
      <div className="tabla-mobile">
        {correa.polines.map(p => (
          <PolinCard
            key={p.id}
            p={p}
            correa={correa}
            config={config}
            isExpanded={expandedId === p.id}
            onToggleHistorial={() => setExpandedId(expandedId === p.id ? null : p.id)}
            onRegistrar={tipo => setModalState({ polin: p, tipo })}
          />
        ))}
      </div>
    </>
  );
}
