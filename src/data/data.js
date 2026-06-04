// ============================================================
// data.js - Datos reales Caserones - Lundin Mining
// Basado en Informe Inspeccion Semana 22, 28-05-2026
// Arquitectura preparada para migracion a API REST
// ============================================================

export const INITIAL_CONFIG = {
  intervaloDiasInspeccion: 30,
  mesesReemplazo: 6,
  diasAlertaTemprana: 5,
  costoPorPolin: 380000,
  tarifaHH: 45000,
};

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().split('T')[0];
}

const RESPONSABLES = ['J. Fuentes', 'R. Diaz', 'P. Araya', 'M. Torres', 'C. Vega', 'F. Molina'];
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function generarItemsInspeccion(overrides = {}) {
  const defaults = {
    polines:      { estado: 'ok', notas: 'Sin anomalias.', fotos: [] },
    cinta:        { estado: 'ok', notas: 'En buenas condiciones.', fotos: [] },
    raspadores:   { estado: 'ok', notas: 'Operativos.', fotos: [] },
    protecciones: { estado: 'ok', notas: 'OK.', fotos: [] },
    chutes:       { estado: 'ok', notas: 'OK.', fotos: [] },
    poleas:       { estado: 'ok', notas: 'Sin desgaste.', fotos: [] },
    contrapeso:   { estado: 'ok', notas: 'OK.', fotos: [] },
    limpieza:     { estado: 'ok', notas: 'OK.', fotos: [] },
  };
  return { ...defaults, ...overrides };
}

function generarEstaciones(n, problemasIdx = []) {
  return Array.from({ length: n }, (_, i) => ({
    numero: i + 1,
    izquierdo: { estado: problemasIdx.includes(`${i+1}i`) ? 'critico' : 'ok', horas: rnd(800,4200), temp: rnd(28,65), vibracion: parseFloat((Math.random()*4+0.5).toFixed(1)) },
    central:   { estado: problemasIdx.includes(`${i+1}c`) ? 'critico' : 'ok', horas: rnd(800,4200), temp: rnd(28,65), vibracion: parseFloat((Math.random()*4+0.5).toFixed(1)) },
    derecho:   { estado: problemasIdx.includes(`${i+1}d`) ? 'critico' : 'ok', horas: rnd(800,4200), temp: rnd(28,65), vibracion: parseFloat((Math.random()*4+0.5).toFixed(1)) },
    limpieza:  'ok',
  }));
}

// Paleta Caserones / Lundin Mining 2026
// CV (transportadoras): tonos azul marino
// FE (fierro esponja):  tonos cobre/ambar
// Criticas:             rojo Lundin #c0272d
const COLORES = {
  azulCV1:   '#1e6fa5',  // azul Caserones principal
  azulCV2:   '#1a5a90',  // azul marino oscuro
  azulCV3:   '#2a90d4',  // azul cielo
  azulCV4:   '#145070',  // azul profundo
  azulCV5:   '#3a5a7a',  // pizarra azul
  cobreFE1:  '#c47a2e',  // cobre mineral
  cobreFE2:  '#d4891a',  // cobre dorado
  cobreFE3:  '#7a5840',  // tierra andina
  rojoCrit:  '#c0272d',  // rojo Lundin
  arena:     '#b8a48a',  // arena andina
};

export const INITIAL_DATA = {
  meta: {
    empresa: 'Caserones - Lundin Mining',
    planta: 'Planta Concentradora',
    semana: 22,
    fechaInforme: '2026-05-28',
    version: '3.0.0',
  },

  correas: [
    // AREA 2100
    {
      id: '2100-CV-001', codigo: '2100-CV-001', nombre: 'Correa CV-001',
      area: '2100', tipo: 'CV', descripcion: 'Correa transportadora de mineral, area 2100',
      color: COLORES.azulCV1, ultimaInspeccion: '2026-05-28', responsable: 'R. Diaz',
      numEstaciones: 12, estaciones: generarEstaciones(12, ['2c', '8c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'ok',     notas: 'Estaciones de polines en condiciones OK.', fotos: [] },
        cinta:      { estado: 'alerta', notas: 'E2 reparacion con polimero, T2-3 dano canto izq. 2 cables cortados (Rx) 44mt delante E2 aviso 10345774. Tramo 4-1 dano 5 cables a 26mts. Corte transversal entre tramo 4-1.', fotos: [] },
        raspadores: { estado: 'alerta', notas: 'Raspador primario con desgaste de palmetas.', fotos: [] },
        poleas:     { estado: 'alerta', notas: 'P2 deflectora: reparacion sello de revestimiento. P8 deflectora: reparacion sello de revestimiento.', fotos: [] },
      }),
    },
    {
      id: '2100-FE-001', codigo: '2100-FE-001', nombre: 'Correa FE-001',
      area: '2100', tipo: 'FE', descripcion: 'Correa de fierro esponja, area 2100',
      color: COLORES.cobreFE1, ultimaInspeccion: '2026-05-28', responsable: 'R. Diaz',
      numEstaciones: 10, estaciones: generarEstaciones(10, ['2c']),
      items: generarItemsInspeccion({
        polines: { estado: 'alerta', notas: 'Polin de retorno 2 trabado.', fotos: [] },
        cinta:   { estado: 'alerta', notas: '2 danos en cubierta de carga reparados con polimero. Sello cubierta retorno con desprendimiento, 9 cables expuestos. Reparacion en frio aviso 10345778.', fotos: [] },
        poleas:  { estado: 'alerta', notas: 'Polea n 2: desgaste en centro de revestimiento.', fotos: [] },
      }),
    },

    // AREA 2200
    {
      id: '2200-CV-001', codigo: '2200-CV-001', nombre: 'Correa CV-001',
      area: '2200', tipo: 'CV', descripcion: 'Correa transportadora principal, area 2200',
      color: COLORES.azulCV2, ultimaInspeccion: '2026-05-28', responsable: 'M. Torres',
      numEstaciones: 15, estaciones: generarEstaciones(15, ['2c']),
      items: generarItemsInspeccion({
        polines:  { estado: 'alerta', notas: 'Retorno N 2 polin trabado. Limpieza por retorno estaciones N 50,70,92.', fotos: [] },
        cinta:    { estado: 'alerta', notas: 'E1 y E2 operativos. Desgaste cubierta carga zona de placas ambos lados. Leve desalineamiento hacia izquierda. Aviso 10345779.', fotos: [] },
        poleas:   { estado: 'alerta', notas: 'Polea n 2: material acumulado en contrapeso. Polea n 4: desgaste de revestimiento y material acumulado.', fotos: [] },
        limpieza: { estado: 'alerta', notas: 'Polea N 4 con material acumulado.', fotos: [] },
      }),
    },
    {
      id: '2200-FE-001', codigo: '2200-FE-001', nombre: 'Correa FE-001',
      area: '2200', tipo: 'FE', descripcion: 'Correa fierro esponja 1, area 2200',
      color: COLORES.cobreFE2, ultimaInspeccion: '2026-05-28', responsable: 'P. Araya',
      numEstaciones: 8, estaciones: generarEstaciones(8, ['3c', '5c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Polin carga central 3 y 5 TRABADOS. Acumulacion material retorno 1-4.', fotos: [] },
        cinta:      { estado: 'critico', notas: 'Desgaste cubierta carga llegando a 2a tela sector centro. Aviso 10345790.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '2200-FE-002', codigo: '2200-FE-002', nombre: 'Correa FE-002',
      area: '2200', tipo: 'FE', descripcion: 'Correa fierro esponja 2, area 2200',
      color: COLORES.rojoCrit, ultimaInspeccion: '2026-05-28', responsable: 'P. Araya',
      numEstaciones: 17, estaciones: generarEstaciones(17, ['8c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Limpieza retorno N 1,2,4 mas polea cola. Limpieza carga N 5-17. Estacion carga N 8 polin central ROTO.', fotos: [] },
        cinta:      { estado: 'critico', notas: 'Desprendimiento sello retorno con exposicion carcasa textil llegando a 3 telas.', fotos: [] },
        limpieza:   { estado: 'alerta',  notas: 'Polea cola con material acumulado.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '2200-FE-003', codigo: '2200-FE-003', nombre: 'Correa FE-003',
      area: '2200', tipo: 'FE', descripcion: 'Correa fierro esponja 3, area 2200',
      color: COLORES.azulCV3, ultimaInspeccion: '2026-05-28', responsable: 'J. Fuentes',
      numEstaciones: 8, estaciones: generarEstaciones(8, ['7c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'alerta',  notas: 'Limpieza carga N 1-8 der. Limpieza retorno N 1,2,4. Estacion carga N 7 polin central SIN CUBIERTA DE GOMA.', fotos: [] },
        cinta:      { estado: 'alerta',  notas: 'Desalineamiento hacia lado izquierdo.', fotos: [] },
        raspadores: { estado: 'critico', notas: 'Raspador primario fuera de posicion. Aviso 10345781.', fotos: [] },
        poleas:     { estado: 'critico', notas: 'Polea motriz con desgaste de revestimiento, manto metalico EXPUESTO. Aviso 10345780.', fotos: [] },
        limpieza:   { estado: 'alerta',  notas: 'Polea de cola con material acumulado.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '2200-FE-004', codigo: '2200-FE-004', nombre: 'Correa FE-004',
      area: '2200', tipo: 'FE', descripcion: 'Correa fierro esponja 4, area 2200',
      color: COLORES.cobreFE3, ultimaInspeccion: '2026-05-28', responsable: 'J. Fuentes',
      numEstaciones: 10, estaciones: generarEstaciones(10),
      items: generarItemsInspeccion({
        poleas:     { estado: 'critico', notas: 'Polea motriz con desgaste de revestimiento, exposicion manto metalico lado derecho. Aviso 10345782.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '2200-FE-005', codigo: '2200-FE-005', nombre: 'Correa FE-005',
      area: '2200', tipo: 'FE', descripcion: 'Correa fierro esponja 5, area 2200',
      color: COLORES.azulCV5, ultimaInspeccion: '2026-05-28', responsable: 'C. Vega',
      numEstaciones: 12, estaciones: generarEstaciones(12, ['12i']),
      items: generarItemsInspeccion({
        polines:    { estado: 'alerta',  notas: 'Estacion polin de carga izquierdo 12 TRABADO.', fotos: [] },
        cinta:      { estado: 'alerta',  notas: 'Desalineamiento hacia lado izquierdo.', fotos: [] },
        poleas:     { estado: 'critico', notas: 'Polea motriz con desprendimiento de revestimiento.', fotos: [] },
        limpieza:   { estado: 'alerta',  notas: 'Material acumulado estacion 1-2 de retorno.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '2200-FE-006', codigo: '2200-FE-006', nombre: 'Correa FE-006',
      area: '2200', tipo: 'FE', descripcion: 'Correa fierro esponja 6, area 2200',
      color: COLORES.azulCV4, ultimaInspeccion: '2026-05-28', responsable: 'C. Vega',
      numEstaciones: 10, estaciones: generarEstaciones(10, ['6c', '2c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Retorno N 6 polin TRABADO. Retorno N 2 TRABADO. Aviso 10345788.', fotos: [] },
        raspadores: { estado: 'critico', notas: 'Raspador primario y secundario FUERA DE SERVICIO. Aviso 10345789.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },

    // AREA 3300
    {
      id: '3300-CV-021', codigo: '3300-CV-021', nombre: 'Correa CV-021',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 021, area 3300',
      color: COLORES.azulCV1, ultimaInspeccion: '2026-05-28', responsable: 'F. Molina',
      numEstaciones: 10, estaciones: generarEstaciones(10),
      items: generarItemsInspeccion({
        cinta:  { estado: 'alerta', notas: 'Desalineamiento lado derecho. Dano canto izq. 3mm profundidad reparado polimero. Abertura canto derecho sectorizado. Aviso 10345783.', fotos: [] },
        poleas: { estado: 'alerta', notas: 'Polea 5: desgaste en revestimiento y material acumulado.', fotos: [] },
      }),
    },
    {
      id: '3300-CV-022', codigo: '3300-CV-022', nombre: 'Correa CV-022',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 022, area 3300',
      color: COLORES.rojoCrit, ultimaInspeccion: '2026-05-28', responsable: 'F. Molina',
      numEstaciones: 92, estaciones: generarEstaciones(20, ['3c', '10c', '17c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Trabado carga der 3 R33. Polin vela izq retorno 10,17 cortado. Acumulacion material retorno 23,33,35. Ausente C79. Desgaste Cd 90,91,92.', fotos: [] },
        cinta:      { estado: 'critico', notas: 'Surco lado derecho por todo el desarrollo zona de placas. Aviso 10345784.', fotos: [] },
        raspadores: { estado: 'critico', notas: 'Raspador primario QUEBRADO Y CAIDO. Raspador secundario desajustado.', fotos: [] },
        poleas:     { estado: 'alerta',  notas: 'P4: desgaste lado izq revestimiento deflectora. P3: desgaste lado der. P5: leve desgaste centro contrapeso.', fotos: [] },
      }),
    },
    {
      id: '3300-CV-023', codigo: '3300-CV-023', nombre: 'Correa CV-023',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 023, area 3300',
      color: COLORES.azulCV3, ultimaInspeccion: '2026-05-28', responsable: 'F. Molina',
      numEstaciones: 42, estaciones: generarEstaciones(15, ['7c', '27i', '40i', '42i']),
      items: generarItemsInspeccion({
        polines:     { estado: 'critico', notas: 'Acumulacion retorno 26,27,10,14,7. Trabado carga izq 27,42 R7. ROTO R7. Desgaste manto carga izq 40,42.', fotos: [] },
        cinta:       { estado: 'critico', notas: 'Desgaste cubierta carga lado der llegando 1a tela, lado izq sector de placas. Cinta cambiada 14-10-2025. Aviso 10322123.', fotos: [] },
        protecciones:{ estado: 'ok', notas: 'En buenas condiciones.', fotos: [] },
        poleas:      { estado: 'alerta',  notas: 'Poleas 4 y 5 con leve desgaste en revestimiento.', fotos: [] },
      }),
    },
    {
      id: '3300-CV-024', codigo: '3300-CV-024', nombre: 'Correa CV-024',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 024, area 3300',
      color: COLORES.cobreFE1, ultimaInspeccion: '2026-05-28', responsable: 'R. Diaz',
      numEstaciones: 22, estaciones: generarEstaciones(15, ['17d', '22d']),
      items: generarItemsInspeccion({
        polines:     { estado: 'alerta',  notas: 'Polin retorno 1 mal instalado. Falta aseo pasillo. Est. 17 polin vela der AUSENTE, izq desgastado. Est. 22 polin vela der AUSENTE.', fotos: [] },
        cinta:       { estado: 'critico', notas: 'Desgaste canto izq por roce. Surco lado izq todo el desarrollo. Desalineamiento hacia izq. Aviso 10345786. Corte canto izq ~1", multiples cortes. Aviso 10346929.', fotos: [] },
        protecciones:{ estado: 'ok', notas: 'En buenas condiciones.', fotos: [] },
        poleas:      { estado: 'alerta',  notas: 'Poleas 4-5 con leve desgaste en revestimiento.', fotos: [] },
        contrapeso:  { estado: 'ok', notas: 'En buenas condiciones.', fotos: [] },
      }),
    },
    {
      id: '3300-CV-025', codigo: '3300-CV-025', nombre: 'Correa CV-025',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 025, area 3300',
      color: COLORES.azulCV5, ultimaInspeccion: '2026-05-28', responsable: 'R. Diaz',
      numEstaciones: 54, estaciones: generarEstaciones(15, ['53c', '54c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Acumulacion material 2-10, 49-54. Carga central 53 DESGASTE MANTO. Carga central 54 ROTO. Retorno 16 polin vela fuera de posicion.', fotos: [] },
        cinta:      { estado: 'alerta',  notas: 'Surco lado derecho en todo el desarrollo. Aviso 10322120.', fotos: [] },
        poleas:     { estado: 'alerta',  notas: 'Poleas 2, 4, 5 con desgaste en centro de revestimiento.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'En buenas condiciones.', fotos: [] },
        limpieza:   { estado: 'alerta',  notas: 'Acumulacion de carga en cajon guiador polines de carga.', fotos: [] },
      }),
    },
    {
      id: '3300-CV-026', codigo: '3300-CV-026', nombre: 'Correa CV-026',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 026, area 3300',
      color: COLORES.azulCV4, ultimaInspeccion: '2026-05-28', responsable: 'M. Torres',
      numEstaciones: 21, estaciones: generarEstaciones(12, ['6i', '20i']),
      items: generarItemsInspeccion({
        polines:    { estado: 'alerta', notas: 'Limpieza retorno N 1,3,8,9,12,18-21. Retorno N 6 polin vela izq trabajando por ENCIMA de cinta. Retorno 12,9,8 polin vela izq falta altura. Retorno N 20 FALTA polin vela izq.', fotos: [] },
        poleas:     { estado: 'alerta', notas: 'Polea 5: desgaste en centro de revestimiento.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'En buenas condiciones.', fotos: [] },
      }),
    },
    {
      id: '3300-CV-027', codigo: '3300-CV-027', nombre: 'Correa CV-027',
      area: '3300', tipo: 'CV', descripcion: 'Correa transportadora 027, area 3300',
      color: COLORES.arena, ultimaInspeccion: '2026-05-28', responsable: 'M. Torres',
      numEstaciones: 10, estaciones: generarEstaciones(10),
      items: generarItemsInspeccion({
        poleas:   { estado: 'alerta', notas: 'Poleas 4 y 5 con leve desgaste en centro de revestimiento.', fotos: [] },
        limpieza: { estado: 'alerta', notas: 'Aseo por retorno.', fotos: [] },
      }),
    },
    {
      id: '3300-FE-001', codigo: '3300-FE-001', nombre: 'Correa FE-001',
      area: '3300', tipo: 'FE', descripcion: 'Correa fierro esponja 1, area 3300',
      color: COLORES.cobreFE1, ultimaInspeccion: '2026-05-28', responsable: 'J. Fuentes',
      numEstaciones: 10, estaciones: generarEstaciones(10),
      items: generarItemsInspeccion({
        poleas:     { estado: 'critico', notas: 'Polea motriz con desgaste de revestimiento y exposicion MANTO METALICO EXPUESTO. Aviso 10345083.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '3300-FE-002', codigo: '3300-FE-002', nombre: 'Correa FE-002',
      area: '3300', tipo: 'FE', descripcion: 'Correa fierro esponja 2, area 3300',
      color: COLORES.cobreFE2, ultimaInspeccion: '2026-05-28', responsable: 'J. Fuentes',
      numEstaciones: 8, estaciones: generarEstaciones(8, ['2c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'alerta',  notas: 'Estacion retorno N 2 AUSENTE.', fotos: [] },
        cinta:      { estado: 'critico', notas: 'Desgaste cubierta carga sector centro. Exposicion carcasa textil sectorizada en empalme. Cinta cambiada 10-04-2025. Aviso 10336260.', fotos: [] },
        raspadores: { estado: 'alerta',  notas: 'Raspador primario desaplicado.', fotos: [] },
        contrapeso: { estado: 'ok', notas: 'N/A.', fotos: [] },
      }),
    },
    {
      id: '3300-FE-003', codigo: '3300-FE-003', nombre: 'Correa FE-003',
      area: '3300', tipo: 'FE', descripcion: 'Correa fierro esponja 3, area 3300',
      color: COLORES.azulCV3, ultimaInspeccion: '2026-05-28', responsable: 'C. Vega',
      numEstaciones: 10, estaciones: generarEstaciones(10, ['7c', '8c', '9c', '10c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Carga central 7-8 FALLA RODAMIENTO. Carga N 9 polin central CAIDO. Carga N 10 FALLA RODAMIENTO, soporte polin CORTADO.', fotos: [] },
        raspadores: { estado: 'alerta',  notas: 'Raspador secundario con material acumulado.', fotos: [] },
      }),
    },

    // AREA 5300
    {
      id: '5300-CV-001', codigo: '5300-CV-001', nombre: 'Correa CV-001',
      area: '5300', tipo: 'CV', descripcion: 'Correa transportadora 1, area 5300',
      color: COLORES.azulCV1, ultimaInspeccion: '2026-05-28', responsable: 'P. Araya',
      numEstaciones: 18, estaciones: generarEstaciones(12, ['2c']),
      items: generarItemsInspeccion({
        polines:  { estado: 'critico', notas: 'Polin carga 2 FALLA RODAMIENTO sector cola. R1 izq AUSENTE CAIDO. R7 izq TRABADO. R18 izq AUSENTE CAIDO.', fotos: [] },
        cinta:    { estado: 'alerta',  notas: 'Desalineamiento hacia izquierdo. Corrugado danado en sectores sin afectar operatividad. Capacho quebrado sector centro. Aviso 10325485.', fotos: [] },
      }),
    },
    {
      id: '5300-CV-002', codigo: '5300-CV-002', nombre: 'Correa CV-002',
      area: '5300', tipo: 'CV', descripcion: 'Correa transportadora 2, area 5300',
      color: COLORES.cobreFE1, ultimaInspeccion: '2026-05-28', responsable: 'P. Araya',
      numEstaciones: 10, estaciones: generarEstaciones(10, ['5c', '6c']),
      items: generarItemsInspeccion({
        polines:    { estado: 'alerta',  notas: 'Material acumulado R5, R6.', fotos: [] },
        cinta:      { estado: 'critico', notas: 'Desalineamiento retorno, cinta rosando estaciones generando desgaste estructura. Abertura sello cubierta carga. Multiples danos cubierta carga. Cortes al ancho reparados en frio. Aviso 10345181.', fotos: [] },
        raspadores: { estado: 'alerta',  notas: 'Desgaste goma raspador V.plow de cola.', fotos: [] },
      }),
    },

    // AREA 7200
    {
      id: '7200-CV-001', codigo: '7200-CV-001', nombre: 'Correa CV-001',
      area: '7200', tipo: 'CV', descripcion: 'Correa transportadora principal, area 7200',
      color: COLORES.azulCV2, ultimaInspeccion: '2026-05-28', responsable: 'F. Molina',
      numEstaciones: 86, estaciones: generarEstaciones(15, ['86c']),
      items: generarItemsInspeccion({
        polines: { estado: 'alerta', notas: 'Limpieza carga N 1-30. Limpieza retorno N 1,36. Poleas 3 y 6 material acumulado. Carga N 86 polin central TRABADO.', fotos: [] },
        poleas:  { estado: 'alerta', notas: 'Poleas 3 y 6 con material acumulado.', fotos: [] },
      }),
    },
    {
      id: '7200-FE-001', codigo: '7200-FE-001', nombre: 'Correa FE-001',
      area: '7200', tipo: 'FE', descripcion: 'Correa fierro esponja 1, area 7200',
      color: COLORES.rojoCrit, ultimaInspeccion: '2026-05-28', responsable: 'F. Molina',
      numEstaciones: 15, estaciones: generarEstaciones(15, ['4c', '6i', '11i', '13i', '14i', '15i']),
      items: generarItemsInspeccion({
        polines:    { estado: 'critico', notas: 'Acumulacion Ci4,14 Cd6,4,2. TRABADO Ci4,11,13,14,15 Cd13,6,5,4,3,2. Ruido falla rodamiento Ci6.', fotos: [] },
        cinta:      { estado: 'alerta',  notas: 'Desalineamiento hacia lado izquierdo. Desgaste zona placas lado derecho. Aviso 10345828.', fotos: [] },
        raspadores: { estado: 'alerta',  notas: 'Falta de aseo.', fotos: [] },
        limpieza:   { estado: 'alerta',  notas: 'Polines requieren aseo.', fotos: [] },
      }),
    },
    {
      id: '7200-FE-002', codigo: '7200-FE-002', nombre: 'Correa FE-002',
      area: '7200', tipo: 'FE', descripcion: 'Correa fierro esponja 2, area 7200',
      color: COLORES.azulCV3, ultimaInspeccion: '2026-05-28', responsable: 'C. Vega',
      numEstaciones: 15, estaciones: generarEstaciones(15, ['11d', '13d']),
      items: generarItemsInspeccion({
        polines: { estado: 'alerta', notas: 'Trabado carga derecho 13, 11. Retorno 3 trabado.', fotos: [] },
      }),
    },
  ],

  stockPolines: 24,
  costoTotal: 4560000,
  HHMantencion: 72,
  intervencionesMensuales: [
    { mes: 'Ene', inspecciones: 18, reemplazos: 4 },
    { mes: 'Feb', inspecciones: 16, reemplazos: 3 },
    { mes: 'Mar', inspecciones: 20, reemplazos: 6 },
    { mes: 'Abr', inspecciones: 17, reemplazos: 5 },
    { mes: 'May', inspecciones: 22, reemplazos: 7 },
    { mes: 'Jun', inspecciones: 14, reemplazos: 3 },
  ],
};
