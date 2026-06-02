// ============================================================
// components/SensorValue.jsx — Valor de sensor con colores de alerta
// ============================================================

export default function SensorValue({ val, warn, crit, unit }) {
  const cls = val >= crit ? 'sensor-crit' : val >= warn ? 'sensor-warn' : 'sensor-ok';
  return (
    <span className={`sensor-val ${cls}`}>
      {val}
      <small className="sensor-unit">{unit}</small>
    </span>
  );
}
