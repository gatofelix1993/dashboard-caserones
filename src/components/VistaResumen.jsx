// ============================================================
// components/VistaResumen.jsx — Panel general responsive
// ============================================================
import { Row, Col } from 'react-bootstrap';
import KpiCard from './KpiCard';
import TendenciaChart from './TendenciaChart';
import SensorValue from './SensorValue';
import {
  getOverallStatus,
  daysUntilInspection,
  daysUntilReemplazo,
} from '../utils/maintenance';

export default function VistaResumen({ data, config, onNavigate }) {
  const todosPolines = data.correas.flatMap(c => c.polines);

  const byStatus = {
    rojo:     todosPolines.filter(p => getOverallStatus(p, config) === 'rojo'),
    naranja:  todosPolines.filter(p => getOverallStatus(p, config) === 'naranja'),
    amarillo: todosPolines.filter(p => getOverallStatus(p, config) === 'amarillo'),
    verde:    todosPolines.filter(p => getOverallStatus(p, config) === 'verde'),
  };

  const SUMMARY_CARDS = [
    { key: 'rojo',     label: 'Críticos',     icon: 'bi-x-octagon-fill',           color: 'var(--red)' },
    { key: 'naranja',  label: 'En Alerta',    icon: 'bi-exclamation-triangle-fill', color: 'var(--orange)' },
    { key: 'amarillo', label: 'Próximos',     icon: 'bi-clock-fill',               color: 'var(--yellow)' },
    { key: 'verde',    label: 'Normales',     icon: 'bi-check-circle-fill',         color: 'var(--green)' },
  ];

  return (
    <div>
      {/* KPI Cards — 2 columnas en mobile, 4 en desktop */}
      <Row className="g-3 mb-4">
        {SUMMARY_CARDS.map(s => (
          <Col key={s.key} xs={6} lg={3}>
            <div onClick={() => onNavigate('operacional')} style={{ cursor: 'pointer', height: '100%' }}>
              <KpiCard
                label={s.label}
                value={byStatus[s.key].length}
                unit="polines"
                icon={s.icon}
                accentColor={s.color}
                trend={<span style={{ color: 'var(--text-muted)' }}>de {todosPolines.length}</span>}
              />
            </div>
          </Col>
        ))}
      </Row>

      {/* Tabla críticos — scroll horizontal en mobile */}
      {byStatus.rojo.length > 0 && (
        <div className="mb-4">
          <div className="section-header">
            <h2 style={{ color: 'var(--red)' }}>
              <i className="bi bi-exclamation-octagon me-2" />
              POLINES CRÍTICOS
            </h2>
            <div className="section-line" />
          </div>

          {/* Cards en mobile */}
          <div className="criticos-mobile">
            {byStatus.rojo.map(p => {
              const correa = data.correas.find(c => c.polines.some(pp => pp.id === p.id));
              const dInsp  = daysUntilInspection(p, config.intervaloDiasInspeccion);
              const dRemp  = daysUntilReemplazo(p);
              return (
                <div key={p.id} className="critico-card">
                  <div className="critico-card-header">
                    <span className="polin-num" style={{ color: 'var(--red)' }}>{p.id}</span>
                    <span className="mono-val" style={{ color: correa?.color, fontSize: 10 }}>{correa?.nombre}</span>
                  </div>
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
                      <span className="polin-sensor-label">INSP</span>
                      <span className={`days-val ${dInsp <= 0 ? 'days-val--expired' : ''}`} style={{ fontSize: 11 }}>
                        {dInsp <= 0 ? `VENC.${Math.abs(dInsp)}d` : `${dInsp}d`}
                      </span>
                    </div>
                    <div className="polin-sensor-item">
                      <span className="polin-sensor-label">REMP</span>
                      <span className={`days-val ${dRemp <= 0 ? 'days-val--expired' : ''}`} style={{ fontSize: 11 }}>
                        {dRemp <= 0 ? `VENC.${Math.abs(dRemp)}d` : `${dRemp}d`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabla en desktop */}
          <div className="tabla-desktop table-responsive">
            <table className="scada-table">
              <thead>
                <tr>
                  <th>Polín</th><th>Correa</th><th>Temperatura</th>
                  <th>Vibración</th><th>Días→Inspección</th><th>Días→Reemplazo</th>
                </tr>
              </thead>
              <tbody>
                {byStatus.rojo.map(p => {
                  const correa = data.correas.find(c => c.polines.some(pp => pp.id === p.id));
                  const dInsp  = daysUntilInspection(p, config.intervaloDiasInspeccion);
                  const dRemp  = daysUntilReemplazo(p);
                  return (
                    <tr key={p.id}>
                      <td><span className="polin-num" style={{ color: 'var(--red)' }}>{p.id}</span></td>
                      <td><span className="mono-val" style={{ color: correa?.color, fontSize: 11 }}>{correa?.nombre}</span></td>
                      <td><SensorValue val={p.temperatura} warn={60} crit={80} unit="°C" /></td>
                      <td><SensorValue val={p.vibracion} warn={3.5} crit={4.5} unit="mm/s" /></td>
                      <td>
                        <span className={`days-val ${dInsp <= 0 ? 'days-val--expired' : ''}`}>
                          {dInsp <= 0 ? `VENCIDO (${Math.abs(dInsp)}d)` : `${dInsp}d`}
                        </span>
                      </td>
                      <td>
                        <span className={`days-val ${dRemp <= 0 ? 'days-val--expired' : ''}`}>
                          {dRemp <= 0 ? `VENCIDO (${Math.abs(dRemp)}d)` : `${dRemp}d`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="chart-card">
        <div className="chart-title">
          <i className="bi bi-bar-chart-line me-2" />
          Tendencia Mensual de Intervenciones
        </div>
        <TendenciaChart data={data.intervencionesMensuales} />
      </div>
      {/* chart-canvas-wrap ya maneja la altura fija internamente */}
    </div>
  );
}
