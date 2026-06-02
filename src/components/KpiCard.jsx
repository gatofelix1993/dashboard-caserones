// ============================================================
// components/KpiCard.jsx — Card de KPI ejecutivo
// ============================================================

export default function KpiCard({ label, value, unit, icon, accentColor, trend, children }) {
  return (
    <div className="kpi-card" style={{ '--accent-line': accentColor || 'var(--accent-blue)' }}>
      <div className="kpi-label">{label}</div>
      {children ? (
        children
      ) : (
        <div className="kpi-value-row">
          <span className="kpi-value">{value}</span>
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
      )}
      {trend && <div className="kpi-trend">{trend}</div>}
      {icon && <i className={`bi ${icon} kpi-icon`} />}
    </div>
  );
}
