// ============================================================
// data/constants.js — Constantes compartidas del dominio
// Fuente única de verdad para ítems de inspección
// ============================================================

/**
 * Claves de los ítems de inspección (orden canónico)
 */
export const ITEMS_INSP = [
  'polines',
  'cinta',
  'raspadores',
  'protecciones',
  'chutes',
  'poleas',
  'contrapeso',
  'limpieza',
];

/**
 * Etiquetas legibles por ítem (para historial, tablas, etc.)
 */
export const ITEM_LABELS = {
  polines:      'Polines',
  cinta:        'Cinta',
  raspadores:   'Raspadores',
  protecciones: 'Protecciones',
  chutes:       'Chutes',
  poleas:       'Poleas',
  contrapeso:   'Contrapeso',
  limpieza:     'Limpieza',
};

/**
 * Configuración completa por ítem (para VistaCorrea)
 */
export const ITEMS_CONFIG = [
  { key: 'polines',      label: 'Estaciones de Polines', icon: 'bi-gear-wide'        },
  { key: 'cinta',        label: 'Cinta',                  icon: 'bi-arrow-left-right' },
  { key: 'raspadores',   label: 'Raspadores',             icon: 'bi-tools'            },
  { key: 'protecciones', label: 'Protecciones',           icon: 'bi-shield-check'     },
  { key: 'chutes',       label: 'Chutes',                 icon: 'bi-funnel'           },
  { key: 'poleas',       label: 'Poleas',                 icon: 'bi-circle'           },
  { key: 'contrapeso',   label: 'Contrapeso / Tensor',    icon: 'bi-arrows-vertical'  },
  { key: 'limpieza',     label: 'Limpieza / Aseo',        icon: 'bi-brush'            },
];

/**
 * Columnas esperadas en el archivo Excel de importación
 */
export const COLUMNAS_ESPERADAS = [
  { key: 'codigo',       label: 'codigo',       desc: 'Ej: 2200-FE-002' },
  { key: 'area',         label: 'area',         desc: 'Ej: 2200' },
  { key: 'responsable',  label: 'responsable',  desc: 'Ej: P. Araya' },
  { key: 'fecha',        label: 'fecha',        desc: 'Ej: 2026-05-28' },
  { key: 'semana',       label: 'semana',       desc: 'Ej: 22' },
  { key: 'polines',      label: 'polines',      desc: 'ok | alerta | critico' },
  { key: 'cinta',        label: 'cinta',        desc: 'ok | alerta | critico' },
  { key: 'raspadores',   label: 'raspadores',   desc: 'ok | alerta | critico' },
  { key: 'protecciones', label: 'protecciones', desc: 'ok | alerta | critico' },
  { key: 'chutes',       label: 'chutes',       desc: 'ok | alerta | critico' },
  { key: 'poleas',       label: 'poleas',       desc: 'ok | alerta | critico' },
  { key: 'contrapeso',   label: 'contrapeso',   desc: 'ok | alerta | critico' },
  { key: 'limpieza',     label: 'limpieza',     desc: 'ok | alerta | critico' },
  { key: 'notas',        label: 'notas',        desc: 'Observaciones generales (opcional)' },
];
