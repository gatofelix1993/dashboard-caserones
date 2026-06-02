// ============================================================
// components/VistaGerencial.jsx — KPIs ejecutivos responsive
// ============================================================
import { Row, Col } from 'react-bootstrap';
import KpiCard from './KpiCard';
import StatusBar from './StatusBar';
import TendenciaChart from './TendenciaChart';
import DisponibilidadChart from './DisponibilidadChart';
import { getOverallStatus, daysSince, fmtCLP } from '../utils/maintenance';

export default function VistaGerencial({ data, config, onStockChange, onCostoChange, onHHChange }) {
  const todosPolines = data.correas.flatMap(c => c.polines);
  const criticos     = todosPolines.filter(p => getOverallStatus(p, config) === 'rojo').length;
  const proximos     = todosPolines.filter(p => ['naranja', 'amarillo'].includes(getOverallStatus(p, config))).length;
  const normales     = todosPolines.length - criticos - proximos;
  const reemplazados = todosPolines.filter(p => daysSince(p.ultimoReemplazo) < 30).length;
  const dispGlobal   = parseFloat(
    ((todosPolines.filter(p => getOverallStatus(p, config) !== 'rojo').length / todosPolines.length) * 100).toFixed(1)
  );

  return (
    <div>
      {/* Fila 1 — 2 cols en mobile, 4 en desktop */}
      <Row className="g-3 mb-3">
        <Col xs={6} xl={3}>
          <KpiCard label="Disponibilidad" value={`${dispGlobal}%`} icon="bi-activity"
            accentColor="var(--green)"
            trend={<span style={{ color: dispGlobal > 90 ? 'var(--green)' : 'var(--orange)' }}>
              {dispGlobal > 90 ? '▲ Óptima' : '▼ Revisar'}
            </span>}
          />
        </Col>
        <Col xs={6} xl={3}>
          <KpiCard label="Críticos" value={criticos} icon="bi-x-octagon"
            accentColor="var(--red)"
            trend={<span style={{ color: 'var(--text-muted)' }}>de {todosPolines.length}</span>}
          />
        </Col>
        <Col xs={6} xl={3}>
          <KpiCard label="Próximos" value={proximos} icon="bi-clock-history"
            accentColor="var(--orange)"
            trend={<span style={{ color: 'var(--text-muted)' }}>alerta temprana</span>}
          />
        </Col>
        <Col xs={6} xl={3}>
          <KpiCard label="Normales" value={normales} icon="bi-check-circle"
            accentColor="var(--green)"
            trend={<span style={{ color: 'var(--text-muted)' }}>sin intervención</span>}
          />
        </Col>
      </Row>

      {/* Fila 2 — Costos */}
      <Row className="g-3 mb-3">
        <Col xs={6} xl={3}>
          <KpiCard label="Stock de Polines" icon="bi-box-seam" accentColor="var(--accent-purple)">
            <div className="kpi-editable-row">
              <input type="number" className="stock-input" value={data.stockPolines} min={0}
                onChange={e => onStockChange(parseInt(e.target.value) || 0)} />
              <span className="kpi-edit-label">uds.</span>
            </div>
          </KpiCard>
        </Col>
        <Col xs={6} xl={3}>
          <KpiCard label="Costo Reemplazos" icon="bi-cash-coin" accentColor="var(--accent-orange)">
            <div className="kpi-value" style={{ fontSize: 16, marginTop: 4 }}>{fmtCLP(data.costoTotal)}</div>
            <div className="kpi-edit-mini">
              <span className="polin-sensor-label">$/polín:</span>
              <input type="number" className="inline-input" value={config.costoPorPolin}
                onChange={e => onCostoChange(parseInt(e.target.value) || 0)} />
            </div>
          </KpiCard>
        </Col>
        <Col xs={6} xl={3}>
          <KpiCard label="Costo HH Mant." icon="bi-person-gear" accentColor="var(--accent-cyan)">
            <div className="kpi-value" style={{ fontSize: 16, marginTop: 4 }}>
              {fmtCLP(data.HHMantencion * config.tarifaHH)}
            </div>
            <div className="kpi-edit-mini">
              <input type="number" className="inline-input" style={{ width: 46 }}
                value={data.HHMantencion} onChange={e => onHHChange(parseInt(e.target.value) || 0)} />
              <span className="polin-sensor-label">HH</span>
            </div>
          </KpiCard>
        </Col>
        <Col xs={6} xl={3}>
          <KpiCard label="Reemplazos / Mes" value={reemplazados} icon="bi-arrow-repeat"
            accentColor="var(--accent-blue)"
            trend={<span style={{ color: 'var(--text-muted)' }}>sustituidos</span>}
          />
        </Col>
      </Row>

      {/* Disponibilidad por correa — 1 col mobile, 3 desktop */}
      <Row className="g-3 mb-4">
        {data.correas.map(c => {
          const ok    = c.polines.filter(p => getOverallStatus(p, config) !== 'rojo').length;
          const pctOk = parseFloat(((ok / c.polines.length) * 100).toFixed(1));
          const crit2 = c.polines.filter(p => getOverallStatus(p, config) === 'rojo').length;
          const barSt = pctOk > 90 ? 'verde' : pctOk > 75 ? 'amarillo' : pctOk > 60 ? 'naranja' : 'rojo';
          return (
            <Col key={c.id} xs={12} md={4}>
              <KpiCard label={c.nombre} accentColor={c.color}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span className="kpi-value" style={{ color: c.color }}>{pctOk}%</span>
                  <span className="kpi-unit">disponibilidad</span>
                </div>
                <StatusBar pctValue={pctOk} status={barSt} />
                <div className="correa-stat-row">
                  <span>{ok} OK</span>
                  <span style={{ color: 'var(--red)' }}>{crit2} críticos</span>
                  <span>{c.polines.length} total</span>
                </div>
              </KpiCard>
            </Col>
          );
        })}
      </Row>

      {/* Charts — flex row con alturas alineadas */}
      <div className="charts-row">
        <div className="charts-col-main">
          <div className="chart-card">
            <div className="chart-title">
              <i className="bi bi-bar-chart-line me-2" />Tendencia Mensual de Intervenciones
            </div>
            <TendenciaChart data={data.intervencionesMensuales} />
          </div>
        </div>
        <div className="charts-col-aside">
          <div className="chart-card">
            <div className="chart-title">
              <i className="bi bi-pie-chart me-2" />Disponibilidad por Correa
            </div>
            <DisponibilidadChart correas={data.correas} config={config} />
          </div>
        </div>
      </div>

      <div className="export-row">
        <button className="btn-scada-orange" onClick={() => window.print()}>
          <i className="bi bi-file-earmark-pdf me-2" />
          <span className="btn-import-text">Exportar Reporte PDF</span>
        </button>
      </div>
    </div>
  );
}
