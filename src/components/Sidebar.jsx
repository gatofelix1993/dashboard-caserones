// ============================================================
// components/Sidebar.jsx — Navegación lateral SCADA
// Paleta Codelco + División Caserones
// ============================================================
import { getOverallStatus } from '../utils/maintenance';

const NAV_ITEMS = [
  { id: 'resumen',     label: 'Panel General',     icon: 'bi-grid-1x2' },
  { id: 'operacional', label: 'Vista Operacional',  icon: 'bi-table' },
  { id: 'gerencial',   label: 'Vista Gerencial',    icon: 'bi-graph-up' },
];

export default function Sidebar({ data, config, activeView, onNavigate, onConfigChange, isOpen, onClose }) {
  return (
    <aside className={`scada-sidebar ${isOpen ? 'scada-sidebar--open' : ''}`}>

      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-inner">
          <div className="sidebar-logo-block">
            {/* Isotipo Codelco — símbolo cobre */}
            <div className="codelco-isotipo" aria-label="Codelco">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="2"/>
                <text x="18" y="23" textAnchor="middle"
                  fontFamily="'Gill Sans', 'Trebuchet MS', sans-serif"
                  fontWeight="bold" fontSize="14" fill="currentColor">Cu</text>
              </svg>
            </div>
            <div>
              <div className="logo-codelco-text">CODELCO</div>
              <div className="logo-division-text">División Caserones</div>
              <div className="logo-sub">
                <span className="pulse-dot" />
                SISTEMA ACTIVO
              </div>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="logo-empresa">{data.meta.empresa}</div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navegación</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`bi ${item.icon}`} />
            <span className="nav-item-label">{item.label}</span>
          </button>
        ))}

        <div className="sidebar-separator" />
        <div className="nav-section-label">Correas</div>
        {data.correas.map(c => {
          const criticos = c.polines.filter(p => getOverallStatus(p, config) === 'rojo').length;
          return (
            <div key={c.id} className="correa-nav-item">
              <span className="correa-dot" style={{ background: c.color, boxShadow: `0 0 5px ${c.color}` }} />
              <span className="correa-nav-label">{c.id} — {c.nombre}</span>
              {criticos > 0 && <span className="badge-crit">{criticos}</span>}
            </div>
          );
        })}

        <div className="sidebar-separator" />
        <div className="nav-section-label">Parámetros</div>
        <div className="config-panel">
          {[
            { label: 'Intervalo inspección', key: 'intervaloDiasInspeccion', unit: 'días' },
            { label: 'Alerta temprana',       key: 'diasAlertaTemprana',      unit: 'días' },
          ].map(f => (
            <div key={f.key} className="config-field">
              <label className="config-label">{f.label}</label>
              <div className="config-input-row">
                <input
                  type="number"
                  className="config-input"
                  value={config[f.key]}
                  min={1}
                  onChange={e => onConfigChange(f.key, parseInt(e.target.value) || 1)}
                />
                <span className="config-unit">{f.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div>v<span className="version-num">{data.meta.version}</span></div>
        <div>{data.meta.planta}</div>
      </div>
    </aside>
  );
}
