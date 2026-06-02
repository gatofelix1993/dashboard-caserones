// ============================================================
// utils/maintenance.js — Lógica de mantención preventiva
// ============================================================

/** Días transcurridos desde una fecha ISO string */
export function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/** Días restantes hasta la próxima inspección */
export function daysUntilInspection(polin, intervaloDias) {
  return intervaloDias - daysSince(polin.ultimaInspeccion);
}

/** Días restantes hasta el próximo reemplazo (180 días = 6 meses) */
export function daysUntilReemplazo(polin) {
  return 180 - daysSince(polin.ultimoReemplazo);
}

/**
 * Devuelve el estado de color según días restantes y umbral de alerta.
 * verde → amarillo → naranja → rojo
 */
export function getStatus(daysLeft, alertDays) {
  if (daysLeft <= 0)              return 'rojo';
  if (daysLeft <= alertDays)      return 'rojo';
  if (daysLeft <= alertDays + 5)  return 'naranja';
  if (daysLeft <= alertDays + 12) return 'amarillo';
  return 'verde';
}

/** Estado global del polín (peor entre inspección y reemplazo) */
export function getOverallStatus(polin, config) {
  const sInsp = getStatus(daysUntilInspection(polin, config.intervaloDiasInspeccion), config.diasAlertaTemprana);
  const sRemp = getStatus(daysUntilReemplazo(polin), config.diasAlertaTemprana);
  const priority = ['rojo', 'naranja', 'amarillo', 'verde'];
  return priority[Math.min(priority.indexOf(sInsp), priority.indexOf(sRemp))];
}

/** Convierte días restantes a porcentaje de barra de progreso */
export function toPct(val, max) {
  return Math.max(0, Math.min(100, (val / max) * 100));
}

/** Formatea fecha ISO a formato local chileno */
export function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-CL');
}

/** Formatea número a pesos chilenos */
export function fmtCLP(n) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
}

/** Retorna prioridad numérica del estado (para ordenar) */
export function statusPriority(s) {
  return { rojo: 0, naranja: 1, amarillo: 2, verde: 3 }[s] ?? 3;
}

/** Etiquetas legibles por estado */
export const STATUS_LABELS = {
  verde:    'Normal',
  amarillo: 'Próximo',
  naranja:  'Alerta',
  rojo:     'Crítico',
};

export const STATUS_ICONS = {
  verde:    'bi-check-circle-fill',
  amarillo: 'bi-clock-fill',
  naranja:  'bi-exclamation-triangle-fill',
  rojo:     'bi-x-octagon-fill',
};
