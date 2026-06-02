// ============================================================
// utils/status.js — Utilidades de estado de inspección
// Fuente única de verdad para colores, labels y clases CSS
// ============================================================

/**
 * Devuelve el color hex según estado de inspección
 * @param {'ok'|'alerta'|'critico'} estado
 */
export function estadoColor(estado) {
  if (estado === 'critico') return '#e74c3c';
  if (estado === 'alerta')  return '#f4a700';
  return '#2ecc71';
}

/**
 * Devuelve la etiqueta legible según estado
 * @param {'ok'|'alerta'|'critico'} estado
 */
export function estadoLabel(estado) {
  if (estado === 'critico') return 'CRÍTICO';
  if (estado === 'alerta')  return 'ALERTA';
  return 'OK';
}

/**
 * Devuelve la clase CSS de chip según estado
 * @param {'ok'|'alerta'|'critico'} estado
 */
export function estadoChipClass(estado) {
  if (estado === 'critico') return 'chip chip-rojo';
  if (estado === 'alerta')  return 'chip chip-amarillo';
  return 'chip chip-verde';
}

/**
 * Devuelve la etiqueta corta para tablas compactas
 * @param {'ok'|'alerta'|'critico'} estado
 */
export function estadoLabelCorto(estado) {
  if (estado === 'critico') return 'CRÍT';
  if (estado === 'alerta')  return 'ALRT';
  return 'OK';
}

/**
 * Determina el estado global de una correa según sus ítems
 * @param {Object} correa
 * @returns {'ok'|'alerta'|'critico'}
 */
export function getCorreaStatus(correa) {
  const items = Object.values(correa.items);
  if (items.some(i => i.estado === 'critico')) return 'critico';
  if (items.some(i => i.estado === 'alerta'))  return 'alerta';
  return 'ok';
}
