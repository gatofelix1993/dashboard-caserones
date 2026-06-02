// ============================================================
// components/HistorialPanel.jsx — Línea de tiempo de intervenciones
// ============================================================
import { fmtDate } from '../utils/maintenance';

const TIPO_COLOR = {
  inspeccion: 'var(--accent-blue)',
  reemplazo:  'var(--accent-orange)',
  correctivo: 'var(--accent-purple)',
};

const TIPO_ICON = {
  inspeccion: 'bi-clipboard-check',
  reemplazo:  'bi-arrow-repeat',
  correctivo: 'bi-tools',
};

export default function HistorialPanel({ polin, onClose, onRegistrar }) {
  return (
    <div className="historial-panel">
      <div className="historial-header">
        <div>
          <span className="historial-title">HISTORIAL — {polin.id}</span>
          <div className="historial-count">{polin.historial.length} intervenciones registradas</div>
        </div>
        <div className="historial-actions">
          <button
            className="btn-ghost btn-ghost--blue"
            onClick={() => onRegistrar('inspeccion')}
          >
            <i className="bi bi-clipboard-plus me-1" />Inspección
          </button>
          <button
            className="btn-ghost btn-ghost--orange"
            onClick={() => onRegistrar('reemplazo')}
          >
            <i className="bi bi-arrow-repeat me-1" />Reemplazo
          </button>
          <button className="btn-close-panel" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>

      <ul className="timeline-list">
        {[...polin.historial].reverse().map((h, i) => (
          <li key={i} className="timeline-item">
            <div
              className="timeline-dot"
              style={{ background: TIPO_COLOR[h.tipo] || 'var(--text-muted)' }}
            />
            <div className="timeline-body">
              <div className="timeline-meta">
                <i className={`bi ${TIPO_ICON[h.tipo] || 'bi-activity'} me-1`} />
                {fmtDate(h.fecha)} ·{' '}
                <span style={{ color: TIPO_COLOR[h.tipo] }}>{h.tipo.toUpperCase()}</span>
              </div>
              <div className="timeline-desc">{h.notas || 'Sin observaciones.'}</div>
              <div className="timeline-resp">
                <i className="bi bi-person me-1" />
                {h.responsable}
              </div>
            </div>
          </li>
        ))}
        {polin.historial.length === 0 && (
          <li className="timeline-empty">Sin historial registrado.</li>
        )}
      </ul>
    </div>
  );
}
