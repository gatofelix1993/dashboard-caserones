// ============================================================
// components/ModalDatosEntrada.jsx
// Modal para importar datos desde archivo .xlsx
// Lee columnas: codigo, area, responsable, fecha, item, estado, notas
// ============================================================
import { useState, useRef, useCallback } from 'react';

const COLUMNAS_ESPERADAS = [
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

const ITEMS_INSP = ['polines','cinta','raspadores','protecciones','chutes','poleas','contrapeso','limpieza'];

// Carga SheetJS desde CDN si no está disponible globalmente
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('No se pudo cargar SheetJS desde CDN'));
    document.head.appendChild(script);
  });
}

// Parsea xlsx/xls usando SheetJS (cargado desde CDN en runtime)
async function parseXlsx(file) {
  const XLSX = await loadSheetJS();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Normaliza una fila del xlsx al formato de correa
function normalizarFila(row) {
  const get = (k) => {
    // busca la clave de forma case-insensitive
    const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase());
    return found ? String(row[found]).trim() : '';
  };
  const estado = (k) => {
    const v = get(k).toLowerCase();
    if (v === 'critico' || v === 'crítico') return 'critico';
    if (v === 'alerta')  return 'alerta';
    return 'ok';
  };
  return {
    codigo:       get('codigo'),
    area:         get('area'),
    responsable:  get('responsable'),
    fecha:        get('fecha'),
    semana:       get('semana'),
    notas:        get('notas'),
    items: {
      polines:      { estado: estado('polines'),      notas: get('notas_polines')      || '', fotos: [] },
      cinta:        { estado: estado('cinta'),        notas: get('notas_cinta')        || '', fotos: [] },
      raspadores:   { estado: estado('raspadores'),   notas: get('notas_raspadores')   || '', fotos: [] },
      protecciones: { estado: estado('protecciones'), notas: get('notas_protecciones') || '', fotos: [] },
      chutes:       { estado: estado('chutes'),       notas: get('notas_chutes')       || '', fotos: [] },
      poleas:       { estado: estado('poleas'),       notas: get('notas_poleas')       || '', fotos: [] },
      contrapeso:   { estado: estado('contrapeso'),   notas: get('notas_contrapeso')   || '', fotos: [] },
      limpieza:     { estado: estado('limpieza'),     notas: get('notas_limpieza')     || '', fotos: [] },
    },
  };
}

// ── Pasos del wizard ──────────────────────────────────────────
const PASOS = ['Cargar archivo', 'Previsualizar', 'Confirmar'];

export default function ModalDatosEntrada({ onClose, onImportar }) {
  const [paso,       setPaso]       = useState(0);   // 0 cargar | 1 preview | 2 confirmar
  const [archivo,    setArchivo]    = useState(null);
  const [filas,      setFilas]      = useState([]);   // raw rows del xlsx
  const [preview,    setPreview]    = useState([]);   // filas normalizadas
  const [errores,    setErrores]    = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const inputRef = useRef(null);

  const procesarArchivo = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrores(['El archivo debe ser .xlsx o .xls']);
      return;
    }
    setCargando(true);
    setErrores([]);
    try {
      const rows = await parseXlsx(file);
      setFilas(rows);
      const errs = [];
      const norm = rows.map((row, i) => {
        const n = normalizarFila(row);
        if (!n.codigo) errs.push(`Fila ${i + 2}: falta columna "codigo"`);
        return n;
      }).filter(n => n.codigo);
      setPreview(norm);
      setErrores(errs);
      setArchivo(file);
      setPaso(1);
    } catch (e) {
      setErrores([`Error al leer el archivo: ${e.message}`]);
    } finally {
      setCargando(false);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) procesarArchivo(file);
  };

  const handleConfirmar = () => {
    onImportar(preview);
    onClose();
  };

  // ── Estado por ítem de una fila
  const estadoColor = (e) => e === 'critico' ? '#e74c3c' : e === 'alerta' ? '#f4a700' : '#2ecc71';
  const estadoLabel = (e) => e === 'critico' ? 'CRÍT' : e === 'alerta' ? 'ALRT' : 'OK';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-datos-entrada">

        {/* Header */}
        <div className="modal-de-header">
          <div className="modal-de-title">
            <i className="bi bi-file-earmark-spreadsheet me-2"/>
            DATOS DE ENTRADA
          </div>
          <button className="modal-de-close" onClick={onClose}>
            <i className="bi bi-x-lg"/>
          </button>
        </div>

        {/* Wizard steps */}
        <div className="modal-de-steps">
          {PASOS.map((p, i) => (
            <div key={i} className={`modal-de-step ${i === paso ? 'active' : i < paso ? 'done' : ''}`}>
              <div className="modal-de-step-num">
                {i < paso ? <i className="bi bi-check-lg"/> : i + 1}
              </div>
              <span className="modal-de-step-label">{p}</span>
              {i < PASOS.length - 1 && <div className="modal-de-step-line"/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="modal-de-body">

          {/* ── Paso 0: Cargar ── */}
          {paso === 0 && (
            <div className="modal-de-paso0">
              {/* Zona drag & drop */}
              <div
                className={`dropzone ${dragOver ? 'dropzone--over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={e => procesarArchivo(e.target.files[0])}/>
                {cargando ? (
                  <div className="dropzone-content">
                    <div className="spinner"/>
                    <span>Procesando archivo...</span>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <i className="bi bi-file-earmark-arrow-up dropzone-icon"/>
                    <span className="dropzone-main">Arrastra tu archivo .xlsx aquí</span>
                    <span className="dropzone-sub">o haz clic para seleccionarlo</span>
                    <span className="dropzone-formats">.xlsx · .xls</span>
                  </div>
                )}
              </div>

              {/* Errores */}
              {errores.length > 0 && (
                <div className="modal-de-errores">
                  {errores.map((e, i) => (
                    <div key={i} className="modal-de-error-row">
                      <i className="bi bi-exclamation-triangle me-2"/>
                      {e}
                    </div>
                  ))}
                </div>
              )}

              {/* Estructura esperada */}
              <div className="modal-de-schema">
                <div className="modal-de-schema-title">
                  <i className="bi bi-table me-2"/>
                  ESTRUCTURA ESPERADA DEL ARCHIVO
                </div>
                <div className="schema-table-wrap">
                  <table className="schema-table">
                    <thead>
                      <tr>
                        <th>Columna</th>
                        <th>Ejemplo / Valores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COLUMNAS_ESPERADAS.map(col => (
                        <tr key={col.key}>
                          <td className="schema-col-key">{col.label}</td>
                          <td className="schema-col-desc">{col.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-de-schema-note">
                  <i className="bi bi-info-circle me-1"/>
                  Los nombres de columna no distinguen mayúsculas/minúsculas. Primera hoja del libro.
                </div>
              </div>
            </div>
          )}

          {/* ── Paso 1: Preview ── */}
          {paso === 1 && (
            <div className="modal-de-paso1">
              <div className="preview-summary">
                <span className="preview-stat">
                  <i className="bi bi-file-earmark-spreadsheet me-1"/>{archivo?.name}
                </span>
                <span className="preview-stat ok">
                  <i className="bi bi-check-circle me-1"/>{preview.length} correas válidas
                </span>
                {errores.length > 0 && (
                  <span className="preview-stat warn">
                    <i className="bi bi-exclamation-triangle me-1"/>{errores.length} advertencias
                  </span>
                )}
              </div>

              {errores.length > 0 && (
                <div className="modal-de-errores" style={{ marginBottom: 10 }}>
                  {errores.map((e, i) => (
                    <div key={i} className="modal-de-error-row">
                      <i className="bi bi-exclamation-triangle me-2"/>{e}
                    </div>
                  ))}
                </div>
              )}

              <div className="preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Código</th>
                      <th>Área</th>
                      <th>Responsable</th>
                      <th>Fecha</th>
                      {ITEMS_INSP.map(k => (
                        <th key={k}>{k.substring(0,4).toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td className="preview-num">{i + 1}</td>
                        <td className="preview-codigo">{row.codigo}</td>
                        <td>{row.area}</td>
                        <td>{row.responsable}</td>
                        <td>{row.fecha}</td>
                        {ITEMS_INSP.map(k => (
                          <td key={k}>
                            <span className="preview-estado-dot"
                              style={{ background: estadoColor(row.items[k]?.estado) }}
                              title={row.items[k]?.estado}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="preview-legend">
                {[['#2ecc71','OK'],['#f4a700','Alerta'],['#e74c3c','Crítico']].map(([c,l]) => (
                  <span key={l} className="preview-legend-item">
                    <span style={{ width:8,height:8,borderRadius:'50%',background:c,display:'inline-block',marginRight:4 }}/>
                    {l}
                  </span>
                ))}
                <span className="preview-legend-item" style={{ marginLeft:'auto', color:'#7a96aa', fontSize:10 }}>
                  POLE=Polines · CINT=Cinta · RASP=Raspadores · PROT=Protecciones · CHUT=Chutes · POLE=Poleas · CONT=Contrapeso · LIMP=Limpieza
                </span>
              </div>
            </div>
          )}

          {/* ── Paso 2: Confirmar ── */}
          {paso === 2 && (
            <div className="modal-de-paso2">
              <div className="confirm-icon">
                <i className="bi bi-patch-check-fill"/>
              </div>
              <div className="confirm-title">¿Confirmar importación?</div>
              <div className="confirm-desc">
                Se actualizarán los datos de <strong style={{color:'#209eb0'}}>{preview.length} correas</strong> con la
                información del archivo <strong>{archivo?.name}</strong>.<br/>
                Los datos actuales serán reemplazados por los del archivo.
              </div>
              <div className="confirm-rows">
                {preview.slice(0, 6).map((row, i) => {
                  const crits = ITEMS_INSP.filter(k => row.items[k]?.estado === 'critico').length;
                  const alerts = ITEMS_INSP.filter(k => row.items[k]?.estado === 'alerta').length;
                  return (
                    <div key={i} className="confirm-row-item">
                      <span className="confirm-row-codigo">{row.codigo}</span>
                      <span className="confirm-row-area">Área {row.area}</span>
                      {crits > 0 && <span className="chip chip-rojo" style={{fontSize:9}}>{crits} crít.</span>}
                      {alerts > 0 && <span className="chip chip-amarillo" style={{fontSize:9}}>{alerts} alert.</span>}
                    </div>
                  );
                })}
                {preview.length > 6 && (
                  <div className="confirm-row-more">+{preview.length - 6} correas más</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="modal-de-footer">
          <button className="btn-modal-sec" onClick={paso === 0 ? onClose : () => setPaso(p => p - 1)}>
            <i className={`bi bi-${paso === 0 ? 'x' : 'arrow-left'} me-1`}/>
            {paso === 0 ? 'Cancelar' : 'Atrás'}
          </button>
          <div style={{ flex: 1 }}/>
          {paso === 0 && (
            <button className="btn-modal-pri" onClick={() => inputRef.current?.click()} disabled={cargando}>
              <i className="bi bi-folder2-open me-2"/>
              Seleccionar archivo
            </button>
          )}
          {paso === 1 && (
            <button className="btn-modal-pri" onClick={() => setPaso(2)} disabled={preview.length === 0}>
              <i className="bi bi-arrow-right me-2"/>
              Continuar ({preview.length} registros)
            </button>
          )}
          {paso === 2 && (
            <button className="btn-modal-confirm" onClick={handleConfirmar}>
              <i className="bi bi-check2-circle me-2"/>
              Importar y actualizar dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
