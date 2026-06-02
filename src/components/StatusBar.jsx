// ============================================================
// components/StatusBar.jsx — Barra de progreso cromática
// ============================================================

export default function StatusBar({ pctValue, status }) {
  return (
    <div className="status-bar-wrap">
      <div
        className={`status-bar-fill bar-${status}`}
        style={{ width: `${pctValue}%` }}
      />
    </div>
  );
}
