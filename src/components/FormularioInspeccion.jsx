// ============================================================
// FormularioInspeccion.jsx - SCADA-MINE Caserones
// Formulario de inspeccion mobile-first
// BUG FIX: cada sub-tabla de polines tiene filas independientes
// NUEVO: foto por fila en la tabla de polines
// ============================================================
import { useState, useRef, useCallback } from 'react';

const SECCIONES_FORMULARIO = [
  {
    id: 'polines',
    num: '1.',
    titulo: 'ESTACIONES DE POLINES',
    icono: 'bi-grid-3x3',
    descripcion: 'Revisar estaciones en busca de: polines danados, desgastados, ausentes o faltantes, estructura corroida.',
    tipo: 'polines',
    subItems: [
      { id: '1.1', label: 'Estaciones de Impacto' },
      { id: '1.2', label: 'Estaciones Lado Carga' },
      { id: '1.3', label: 'Estaciones Lado Retorno' },
      { id: '1.4', label: 'Estaciones Autocentrantes Carga' },
      { id: '1.5', label: 'Estaciones Autocentrantes Retorno' },
    ],
  },
  {
    id: 'cinta',
    num: '2.',
    titulo: 'CINTA',
    icono: 'bi-arrow-left-right',
    descripcion: 'Revisar cubierta de cinta transportadora.',
    tipo: 'checklist',
    subItems: [
      { id: '2.0', label: 'Cortes, cortes pasantes, longitudinales o transversales' },
      { id: '2.1', label: 'Desgaste irregular, desprendimiento de goma, tela expuesta' },
      { id: '2.2', label: 'Surcos profundos' },
      { id: '2.3', label: 'Empalme con apertura, dano o deformaciones' },
      { id: '2.4', label: 'Desalineamiento' },
      { id: '2.5', label: 'Danos en sector linea de gualdera / skirtboard' },
      { id: '2.6', label: 'Otra condicion' },
    ],
  },
  {
    id: 'raspadores',
    num: '3.',
    titulo: 'RASPADORES',
    icono: 'bi-collection',
    descripcion: 'Revisar estado de raspadores: modulos desgastados, separacion o ajuste, estado de estructura.',
    tipo: 'checklist',
    subItems: [
      { id: '3.1', label: 'Raspador Primario' },
      { id: '3.2', label: 'Raspador Secundario' },
      { id: '3.3', label: 'Raspador Terciario' },
      { id: '3.4', label: 'Raspador Cuaternario' },
      { id: '3.5', label: 'Raspador V.Plow Retorno' },
      { id: '3.6', label: 'Raspador Diagonal Retorno' },
    ],
  },
  {
    id: 'protecciones',
    num: '4.',
    titulo: 'PROTECCIONES',
    icono: 'bi-shield-check',
    descripcion: 'Revisar estado de protecciones: ausentes, danadas o deformadas.',
    tipo: 'checklist',
    subItems: [
      { id: '4.1', label: 'Protecciones lado Pasillo' },
      { id: '4.2', label: 'Protecciones Sector Cola' },
      { id: '4.3', label: 'Protecciones Sector Cabeza' },
      { id: '4.4', label: 'Protecciones sector contrapeso' },
    ],
  },
  {
    id: 'chutes',
    num: '5.',
    titulo: 'CHUTE ALIMENTACION',
    icono: 'bi-funnel',
    descripcion: 'Revisar estado del chute de alimentacion.',
    tipo: 'checklist',
    subItems: [
      { id: '5.1', label: 'Caras del Chute: fugas, roturas o pernos cortados' },
      { id: '5.2', label: 'Gualderas: desgastadas, mal posicionadas o ausentes' },
      { id: '5.3', label: 'Porta Gualderas / Clamps: sueltos, ausentes, rozando cinta' },
      { id: '5.4', label: 'Skirtboard / Guiador de carga: rozando cinta, placas sueltas' },
    ],
  },
  {
    id: 'poleas',
    num: '6.',
    titulo: 'POLEAS',
    icono: 'bi-circle',
    descripcion: 'Revisar estado de poleas: danos en cubierta, deformaciones, desbalance, desgaste, descansos danados.',
    tipo: 'poleas',
  },
  {
    id: 'contrapeso',
    num: '7.',
    titulo: 'CONTRAPESO / TENSOR',
    icono: 'bi-arrows-vertical',
    descripcion: 'Revisar condicion de alineamiento del carro o caida del tensor.',
    tipo: 'checklist',
    subItems: [
      { id: '7.1', label: 'Contrapeso y guias' },
      { id: '7.2', label: 'Cable tensor (solo si aplica)' },
      { id: '7.3', label: 'Poleas o catalinas (solo si aplica)' },
    ],
  },
  {
    id: 'limpieza',
    num: '8.',
    titulo: 'LIMPIEZA / ASEO',
    icono: 'bi-brush',
    descripcion: 'Inspeccione condiciones de acumulacion de carga, hielo, pulpa, derrames o restos de chatarra.',
    tipo: 'checklist',
    subItems: [
      { id: '8.1', label: 'Contrapeso / Tensor' },
      { id: '8.2', label: 'Bajo polines de retorno' },
      { id: '8.3', label: 'Mesa de polines de carga' },
      { id: '8.4', label: 'Entorno de Raspadores' },
    ],
  },
];

// ── Fila para sub-tabla de polines (número fijo, no editable) ─
function filaConNumero(n) {
  return { numero: n, izquierdo: false, central: false, derecho: false, detalle: '', fotos: [] };
}

// ── Estado inicial ────────────────────────────────────────────
function crearEstadoInicial(correa) {
  const secciones = {};

  SECCIONES_FORMULARIO.forEach(sec => {
    if (sec.tipo === 'polines') {
      // Filas fijas: una por cada estación de la correa, numeradas 1..N
      const subItemsData = {};
      sec.subItems.forEach(si => {
        subItemsData[si.id] = Array.from(
          { length: correa.numEstaciones },
          (_, i) => filaConNumero(i + 1)
        );
      });
      secciones[sec.id] = {
        subItems: subItemsData,
        fotos: [],
        notas: '',
      };
    } else if (sec.tipo === 'poleas') {
      secciones[sec.id] = {
        poleas: Array.from({ length: 5 }, (_, i) => ({
          num: i + 1,
          bueno: false,
          malo: false,
          detalle: '',
          fotos: [],
        })),
        fotos: [],
        notas: '',
      };
    } else {
      const items = {};
      sec.subItems.forEach(si => {
        items[si.id] = { bueno: false, malo: false, detalle: '', fotos: [] };
      });
      secciones[sec.id] = { items, fotos: [], notas: '' };
    }
  });

  return {
    ordenTrabajo: '',
    tipoMantenimiento: 'PM',
    responsable: '',
    responsable2: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    observaciones: '',
    avisos: ['', '', '', '', '', ''],
    secciones,
  };
}

// ── Mini uploader de foto por fila ───────────────────────────
function FotoFila({ fotos, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const MAX = 3;

  const handleAdd = (e) => {
    const files = Array.from(e.target.files);
    const nuevas = files.slice(0, MAX - fotos.length).map(f => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    onChange([...fotos, ...nuevas]);
    e.target.value = '';
  };

  return (
    <>
      <div className="fi-fila-fotos">
        {fotos.map((f, i) => (
          <div key={i} className="fi-fila-foto-item">
            <img
              src={f.url}
              alt={f.name}
              className="fi-fila-foto-thumb"
              onClick={() => setPreview(f)}
              title="Ver foto"
            />
            <button
              className="fi-fila-foto-del"
              onClick={() => onChange(fotos.filter((_, j) => j !== i))}
              title="Eliminar"
            >
              <i className="bi bi-x"/>
            </button>
          </div>
        ))}
        {fotos.length < MAX && (
          <button
            className="fi-fila-foto-add"
            onClick={() => inputRef.current?.click()}
            title={`Agregar foto (${fotos.length}/${MAX})`}
          >
            <i className="bi bi-camera-fill"/>
            {fotos.length > 0 && <span className="fi-fila-foto-count">{fotos.length}</span>}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleAdd}
      />
      {preview && (
        <div className="fi-preview-overlay" onClick={() => setPreview(null)}>
          <div className="fi-preview-box" onClick={e => e.stopPropagation()}>
            <button className="fi-preview-close" onClick={() => setPreview(null)}>
              <i className="bi bi-x-lg"/>
            </button>
            <img src={preview.url} alt={preview.name} className="fi-preview-img"/>
            <div className="fi-preview-name">{preview.name}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Uploader de fotos de seccion completa ────────────────────
function FotosSeccion({ fotos, onChange, maxFotos = 3 }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleAdd = (e) => {
    const files = Array.from(e.target.files);
    const nuevas = files.slice(0, maxFotos - fotos.length).map(f => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    onChange([...fotos, ...nuevas]);
    e.target.value = '';
  };

  return (
    <div className="fi-fotos-wrap">
      <div className="fi-fotos-label">
        <i className="bi bi-camera me-1"/>
        Fotos de seccion ({fotos.length}/{maxFotos})
      </div>
      <div className="fi-fotos-grid">
        {fotos.map((f, i) => (
          <div key={i} className="fi-foto-item">
            <img
              src={f.url}
              alt={f.name}
              className="fi-foto-thumb"
              onClick={() => setPreview(f)}
            />
            <button className="fi-foto-del" onClick={() => onChange(fotos.filter((_, j) => j !== i))}>
              <i className="bi bi-x"/>
            </button>
          </div>
        ))}
        {fotos.length < maxFotos && (
          <button className="fi-foto-add" onClick={() => inputRef.current?.click()}>
            <i className="bi bi-camera-fill"/>
            <span>Agregar</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleAdd}
      />
      {preview && (
        <div className="fi-preview-overlay" onClick={() => setPreview(null)}>
          <div className="fi-preview-box" onClick={e => e.stopPropagation()}>
            <button className="fi-preview-close" onClick={() => setPreview(null)}>
              <i className="bi bi-x-lg"/>
            </button>
            <img src={preview.url} alt={preview.name} className="fi-preview-img"/>
            <div className="fi-preview-name">{preview.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seccion de Polines ────────────────────────────────────────
// Cada sub-item tiene filas fijas (una por estación). El número
// de estación es solo lectura — no se puede agregar ni eliminar.
function SeccionPolines({ secDef, estado, onChange }) {

  const updateFila = (siId, idx, campo, val) => {
    const filas = estado.subItems[siId].map((f, i) => i === idx ? { ...f, [campo]: val } : f);
    onChange({ ...estado, subItems: { ...estado.subItems, [siId]: filas } });
  };

  const updateFilaFotos = (siId, idx, nuevasFotos) => {
    const filas = estado.subItems[siId].map((f, i) => i === idx ? { ...f, fotos: nuevasFotos } : f);
    onChange({ ...estado, subItems: { ...estado.subItems, [siId]: filas } });
  };

  return (
    <div className="fi-seccion-body">
      <p className="fi-descripcion">{secDef.descripcion}</p>

      {secDef.subItems.map(si => {
        // Cada sub-item lee y escribe SOLO su propio array
        const filas = estado.subItems[si.id] || [];
        return (
          <div key={si.id} className="fi-polines-grupo">
            <div className="fi-polines-subtitulo">{si.id} — {si.label}</div>

            <div className="fi-polines-table-wrap">
              <table className="fi-polines-table">
                <thead>
                  <tr>
                    <th className="fi-th-num">N° Est.</th>
                    <th className="fi-th-check">Izq.</th>
                    <th className="fi-th-check">Cen.</th>
                    <th className="fi-th-check">Der.</th>
                    <th>Detalle hallazgo</th>
                    <th className="fi-th-foto">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, idx) => (
                    <tr key={idx} className={fila.izquierdo || fila.central || fila.derecho ? 'fi-tr-falla' : ''}>
                      {/* Número de estación: fijo, solo lectura */}
                      <td>
                        <span className="fi-num-fijo">{fila.numero}</span>
                      </td>
                      {['izquierdo', 'central', 'derecho'].map(campo => (
                        <td key={campo} className="fi-td-check">
                          <button
                            className={`fi-polin-btn ${fila[campo] ? 'fi-polin-btn--malo' : 'fi-polin-btn--ok'}`}
                            onClick={() => updateFila(si.id, idx, campo, !fila[campo])}
                          >
                            {fila[campo]
                              ? <i className="bi bi-x-circle-fill"/>
                              : <i className="bi bi-check-circle"/>}
                          </button>
                        </td>
                      ))}
                      <td>
                        <input
                          className="fi-input-detalle"
                          type="text"
                          placeholder="Describa el hallazgo..."
                          value={fila.detalle}
                          onChange={e => updateFila(si.id, idx, 'detalle', e.target.value)}
                        />
                      </td>
                      <td className="fi-td-foto">
                        <FotoFila
                          fotos={fila.fotos || []}
                          onChange={nuevasFotos => updateFilaFotos(si.id, idx, nuevasFotos)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sin botón de agregar — lista fija según numEstaciones de la correa */}
          </div>
        );
      })}

      <FotosSeccion
        fotos={estado.fotos}
        onChange={f => onChange({ ...estado, fotos: f })}
      />
      <textarea
        className="fi-notas"
        placeholder="Observaciones adicionales sobre polines..."
        value={estado.notas}
        onChange={e => onChange({ ...estado, notas: e.target.value })}
      />
    </div>
  );
}

// ── Seccion Checklist estandar (Bueno / Malo) ────────────────
function SeccionChecklist({ secDef, estado, onChange }) {
  const toggleItem = (id, campo) => {
    const item = estado.items[id];
    const nuevo = campo === 'bueno'
      ? { ...item, bueno: !item.bueno, malo: item.bueno ? item.malo : false }
      : { ...item, malo: !item.malo, bueno: item.malo ? item.bueno : false };
    onChange({ ...estado, items: { ...estado.items, [id]: nuevo } });
  };

  const setDetalle = (id, val) => {
    onChange({ ...estado, items: { ...estado.items, [id]: { ...estado.items[id], detalle: val } } });
  };

  return (
    <div className="fi-seccion-body">
      <p className="fi-descripcion">{secDef.descripcion}</p>
      <div className="fi-checklist-header">
        <span className="fi-cl-col-item">Item</span>
        <span className="fi-cl-col-estado">
          <span className="fi-cl-bueno">Bueno</span>
          <span className="fi-cl-malo">Malo</span>
        </span>
        <span className="fi-cl-col-detalle">Detalle hallazgo</span>
      </div>

      {secDef.subItems.map(si => {
        const item = estado.items[si.id];
        const estadoItem = item.malo ? 'malo' : item.bueno ? 'bueno' : 'sin-marcar';
        return (
          <div key={si.id} className={`fi-checklist-row fi-checklist-row--${estadoItem}`}>
            <div className="fi-cl-item-label">
              <span className="fi-cl-item-num">{si.id}</span>
              {si.label}
            </div>
            <div className="fi-cl-estado">
              <button
                className={`fi-toggle fi-toggle--bueno ${item.bueno ? 'active' : ''}`}
                onClick={() => toggleItem(si.id, 'bueno')}
              >
                <i className={`bi ${item.bueno ? 'bi-check-circle-fill' : 'bi-circle'}`}/>
              </button>
              <button
                className={`fi-toggle fi-toggle--malo ${item.malo ? 'active' : ''}`}
                onClick={() => toggleItem(si.id, 'malo')}
              >
                <i className={`bi ${item.malo ? 'bi-x-circle-fill' : 'bi-circle'}`}/>
              </button>
            </div>
            <div className="fi-cl-detalle">
              {(item.malo || item.bueno) && (
                <input
                  className="fi-input-detalle"
                  type="text"
                  placeholder="Describa el hallazgo..."
                  value={item.detalle}
                  onChange={e => setDetalle(si.id, e.target.value)}
                />
              )}
            </div>
          </div>
        );
      })}

      <FotosSeccion
        fotos={estado.fotos}
        onChange={f => onChange({ ...estado, fotos: f })}
      />
      <textarea
        className="fi-notas"
        placeholder={`Observaciones sobre ${secDef.titulo.toLowerCase()}...`}
        value={estado.notas}
        onChange={e => onChange({ ...estado, notas: e.target.value })}
      />
    </div>
  );
}

// ── Seccion de Poleas ─────────────────────────────────────────
function SeccionPoleas({ secDef, estado, onChange }) {
  const togglePolea = (idx, campo) => {
    const poleas = estado.poleas.map((p, i) => {
      if (i !== idx) return p;
      return campo === 'bueno'
        ? { ...p, bueno: !p.bueno, malo: p.bueno ? p.malo : false }
        : { ...p, malo: !p.malo, bueno: p.malo ? p.bueno : false };
    });
    onChange({ ...estado, poleas });
  };

  const setDetalle = (idx, val) => {
    onChange({ ...estado, poleas: estado.poleas.map((p, i) => i === idx ? { ...p, detalle: val } : p) });
  };

  const addPolea = () => {
    const n = estado.poleas.length + 1;
    onChange({ ...estado, poleas: [...estado.poleas, { num: n, bueno: false, malo: false, detalle: '', fotos: [] }] });
  };

  return (
    <div className="fi-seccion-body">
      <p className="fi-descripcion">{secDef.descripcion}</p>
      <div className="fi-checklist-header">
        <span className="fi-cl-col-item">Polea</span>
        <span className="fi-cl-col-estado">
          <span className="fi-cl-bueno">Bueno</span>
          <span className="fi-cl-malo">Malo</span>
        </span>
        <span className="fi-cl-col-detalle">Detalle hallazgo</span>
      </div>

      {estado.poleas.map((p, idx) => {
        const estadoP = p.malo ? 'malo' : p.bueno ? 'bueno' : 'sin-marcar';
        return (
          <div key={idx} className={`fi-checklist-row fi-checklist-row--${estadoP}`}>
            <div className="fi-cl-item-label">
              <span className="fi-cl-item-num">6.{p.num}</span>
              Polea {p.num}
            </div>
            <div className="fi-cl-estado">
              <button
                className={`fi-toggle fi-toggle--bueno ${p.bueno ? 'active' : ''}`}
                onClick={() => togglePolea(idx, 'bueno')}
              >
                <i className={`bi ${p.bueno ? 'bi-check-circle-fill' : 'bi-circle'}`}/>
              </button>
              <button
                className={`fi-toggle fi-toggle--malo ${p.malo ? 'active' : ''}`}
                onClick={() => togglePolea(idx, 'malo')}
              >
                <i className={`bi ${p.malo ? 'bi-x-circle-fill' : 'bi-circle'}`}/>
              </button>
            </div>
            <div className="fi-cl-detalle">
              {(p.malo || p.bueno) && (
                <input
                  className="fi-input-detalle"
                  type="text"
                  placeholder="Describa el hallazgo..."
                  value={p.detalle}
                  onChange={e => setDetalle(idx, e.target.value)}
                />
              )}
            </div>
          </div>
        );
      })}

      <button className="fi-btn-add-fila" onClick={addPolea}>
        <i className="bi bi-plus-circle me-1"/>Agregar polea
      </button>

      <FotosSeccion
        fotos={estado.fotos}
        onChange={f => onChange({ ...estado, fotos: f })}
      />
      <textarea
        className="fi-notas"
        placeholder="Observaciones sobre poleas..."
        value={estado.notas}
        onChange={e => onChange({ ...estado, notas: e.target.value })}
      />
    </div>
  );
}

// ── Conversion al formato del dashboard ──────────────────────
function convertirAItems(secciones) {
  const determinarEstado = (secId, estado) => {
    if (secId === 'polines') {
      const tieneMalo = Object.values(estado.subItems || {}).some(filas =>
        filas.some(f => f.izquierdo || f.central || f.derecho)
      );
      return tieneMalo ? 'critico' : 'ok';
    }
    if (secId === 'poleas') {
      return estado.poleas?.some(p => p.malo) ? 'critico' : 'ok';
    }
    return Object.values(estado.items || {}).some(i => i.malo) ? 'alerta' : 'ok';
  };

  const construirNotas = (secId, estado) => {
    if (secId === 'polines') {
      const hallazgos = [];
      Object.entries(estado.subItems || {}).forEach(([siId, filas]) => {
        filas.forEach(f => {
          if (f.izquierdo || f.central || f.derecho || f.detalle) {
            const partes = [f.izquierdo && 'Izq', f.central && 'Cen', f.derecho && 'Der'].filter(Boolean).join('/');
            hallazgos.push(`[${siId}] Est.${f.numero || '?'}: ${partes} ${f.detalle || 'Falla'}`.trim());
          }
        });
      });
      return hallazgos.length ? hallazgos.join('. ') : 'Sin anomalias.';
    }
    if (secId === 'poleas') {
      const malas = estado.poleas?.filter(p => p.malo);
      return malas?.length ? malas.map(p => `Polea ${p.num}: ${p.detalle || 'Falla'}`).join('. ') : 'Sin anomalias.';
    }
    const malos = Object.entries(estado.items || {}).filter(([, i]) => i.malo);
    return malos.length ? malos.map(([, i]) => i.detalle || 'Falla').join('. ') : 'OK.';
  };

  return {
    polines:      { estado: determinarEstado('polines', secciones.polines),           notas: construirNotas('polines', secciones.polines),           fotos: secciones.polines?.fotos || [] },
    cinta:        { estado: determinarEstado('cinta', secciones.cinta),               notas: construirNotas('cinta', secciones.cinta),               fotos: secciones.cinta?.fotos || [] },
    raspadores:   { estado: determinarEstado('raspadores', secciones.raspadores),     notas: construirNotas('raspadores', secciones.raspadores),     fotos: secciones.raspadores?.fotos || [] },
    protecciones: { estado: determinarEstado('protecciones', secciones.protecciones), notas: construirNotas('protecciones', secciones.protecciones), fotos: secciones.protecciones?.fotos || [] },
    chutes:       { estado: determinarEstado('chutes', secciones.chutes),             notas: construirNotas('chutes', secciones.chutes),             fotos: secciones.chutes?.fotos || [] },
    poleas:       { estado: determinarEstado('poleas', secciones.poleas),             notas: construirNotas('poleas', secciones.poleas),             fotos: secciones.poleas?.fotos || [] },
    contrapeso:   { estado: determinarEstado('contrapeso', secciones.contrapeso),     notas: construirNotas('contrapeso', secciones.contrapeso),     fotos: secciones.contrapeso?.fotos || [] },
    limpieza:     { estado: determinarEstado('limpieza', secciones.limpieza),         notas: construirNotas('limpieza', secciones.limpieza),         fotos: secciones.limpieza?.fotos || [] },
  };
}

// ── Componente principal ──────────────────────────────────────
export default function FormularioInspeccion({ correa, onIngresar, onCancelar }) {
  const [form, setForm] = useState(() => crearEstadoInicial(correa));
  const [seccionActiva, setSeccionActiva] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const topRef = useRef(null);

  const updateSeccion = useCallback((id, nuevoEstado) => {
    setForm(prev => ({ ...prev, secciones: { ...prev.secciones, [id]: nuevoEstado } }));
  }, []);

  const getProgresoSeccion = (sec) => {
    const est = form.secciones[sec.id];
    if (sec.tipo === 'polines') {
      return Object.values(est.subItems || {}).some(filas =>
        filas.some(f => f.numero || f.detalle)
      ) ? 'revisado' : 'pendiente';
    }
    if (sec.tipo === 'poleas') {
      return est.poleas.some(p => p.bueno || p.malo) ? 'revisado' : 'pendiente';
    }
    return Object.values(est.items).some(i => i.bueno || i.malo) ? 'revisado' : 'pendiente';
  };

  const getEstadoSeccion = (sec) => {
    const est = form.secciones[sec.id];
    if (sec.tipo === 'polines') {
      return Object.values(est.subItems || {}).some(filas =>
        filas.some(f => f.izquierdo || f.central || f.derecho)
      ) ? 'critico' : 'ok';
    }
    if (sec.tipo === 'poleas') {
      return est.poleas.some(p => p.malo) ? 'critico' : 'ok';
    }
    return Object.values(est.items).some(i => i.malo) ? 'alerta' : 'ok';
  };

  const handleIngresar = () => {
    const items = convertirAItems(form.secciones);
    onIngresar({
      ...form,
      items,
      correaId: correa.id,
      timestamp: new Date().toISOString(),
      fechaHora: `${form.fecha} ${form.hora}`,
    });
  };

  const seccionActualDef = SECCIONES_FORMULARIO.find(s => s.id === seccionActiva);

  // ── Vista de detalle de seccion ──────────────────────────
  if (seccionActiva && seccionActualDef) {
    const estadoSec = form.secciones[seccionActiva];
    return (
      <div className="fi-wrapper" ref={topRef}>
        <div className="fi-seccion-header">
          <button className="fi-btn-volver" onClick={() => setSeccionActiva(null)}>
            <i className="bi bi-arrow-left me-1"/>Volver
          </button>
          <div className="fi-seccion-header-title">
            <i className={`bi ${seccionActualDef.icono} me-2`}/>
            {seccionActualDef.num} {seccionActualDef.titulo}
          </div>
        </div>

        {seccionActualDef.tipo === 'polines' && (
          <SeccionPolines
            secDef={seccionActualDef}
            estado={estadoSec}
            onChange={est => updateSeccion(seccionActiva, est)}
          />
        )}
        {seccionActualDef.tipo === 'checklist' && (
          <SeccionChecklist
            secDef={seccionActualDef}
            estado={estadoSec}
            onChange={est => updateSeccion(seccionActiva, est)}
          />
        )}
        {seccionActualDef.tipo === 'poleas' && (
          <SeccionPoleas
            secDef={seccionActualDef}
            estado={estadoSec}
            onChange={est => updateSeccion(seccionActiva, est)}
          />
        )}

        <div className="fi-seccion-footer">
          <button className="fi-btn-listo" onClick={() => setSeccionActiva(null)}>
            <i className="bi bi-check-lg me-2"/>Listo — Volver al resumen
          </button>
        </div>
      </div>
    );
  }

  // ── Vista resumen (pantalla principal) ───────────────────
  return (
    <div className="fi-wrapper" ref={topRef}>

      <div className="fi-header">
        <div className="fi-header-top">
          <button className="fi-btn-cancelar" onClick={onCancelar}>
            <i className="bi bi-arrow-left me-1"/>Volver
          </button>
          <div className="fi-header-badge">P1.1</div>
        </div>
        <div className="fi-header-titulo">Inspeccion de Correa Transportadora</div>
        <div className="fi-header-subtitulo">{correa.codigo} — {correa.nombre}</div>
      </div>

      <div className="fi-datos-card">
        <div className="fi-datos-row">
          <div className="fi-dato-group">
            <label className="fi-dato-label">Orden de Trabajo</label>
            <input className="fi-dato-input" type="text" placeholder="Nro. de OT"
              value={form.ordenTrabajo}
              onChange={e => setForm(p => ({ ...p, ordenTrabajo: e.target.value }))}/>
          </div>
          <div className="fi-dato-group">
            <label className="fi-dato-label">Tipo Mantencion</label>
            <div className="fi-tipo-selector">
              {['PM', 'NP'].map(t => (
                <button key={t}
                  className={`fi-tipo-btn ${form.tipoMantenimiento === t ? 'active' : ''}`}
                  onClick={() => setForm(p => ({ ...p, tipoMantenimiento: t }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="fi-datos-row">
          <div className="fi-dato-group">
            <label className="fi-dato-label">Fecha</label>
            <input className="fi-dato-input" type="date"
              value={form.fecha}
              onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}/>
          </div>
          <div className="fi-dato-group">
            <label className="fi-dato-label">Hora</label>
            <input className="fi-dato-input" type="time"
              value={form.hora}
              onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}/>
          </div>
        </div>
        <div className="fi-dato-group fi-dato-full">
          <label className="fi-dato-label">Responsable (Inspector)</label>
          <input className="fi-dato-input" type="text" placeholder="Nombre completo"
            value={form.responsable}
            onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))}/>
        </div>
        <div className="fi-dato-group fi-dato-full">
          <label className="fi-dato-label">Responsable 2 (opcional)</label>
          <input className="fi-dato-input" type="text" placeholder="Nombre completo"
            value={form.responsable2}
            onChange={e => setForm(p => ({ ...p, responsable2: e.target.value }))}/>
        </div>
      </div>

      <div className="fi-secciones-titulo">
        <i className="bi bi-clipboard-check me-2"/>Listado de tareas de inspeccion
      </div>

      <div className="fi-secciones-lista">
        {SECCIONES_FORMULARIO.map(sec => {
          const progreso = getProgresoSeccion(sec);
          const estadoSec = getEstadoSeccion(sec);
          return (
            <button
              key={sec.id}
              className={`fi-seccion-card fi-seccion-card--${progreso} fi-seccion-card--${estadoSec}`}
              onClick={() => setSeccionActiva(sec.id)}
            >
              <div className="fi-sc-left">
                <div className="fi-sc-icon-wrap">
                  <i className={`bi ${sec.icono}`}/>
                </div>
                <div className="fi-sc-info">
                  <div className="fi-sc-num">{sec.num}</div>
                  <div className="fi-sc-titulo">{sec.titulo}</div>
                  <div className="fi-sc-sub">
                    {sec.tipo === 'polines' && `${sec.subItems.length} sub-secciones`}
                    {sec.tipo === 'poleas' && `${form.secciones.poleas.poleas.length} poleas`}
                    {sec.tipo === 'checklist' && `${sec.subItems.length} items`}
                  </div>
                </div>
              </div>
              <div className="fi-sc-right">
                {progreso === 'revisado' && estadoSec === 'critico' && (
                  <span className="fi-badge fi-badge--critico"><i className="bi bi-x-octagon-fill me-1"/>Falla</span>
                )}
                {progreso === 'revisado' && estadoSec === 'alerta' && (
                  <span className="fi-badge fi-badge--alerta"><i className="bi bi-exclamation-triangle-fill me-1"/>Alerta</span>
                )}
                {progreso === 'revisado' && estadoSec === 'ok' && (
                  <span className="fi-badge fi-badge--ok"><i className="bi bi-check-circle-fill me-1"/>OK</span>
                )}
                {progreso === 'pendiente' && (
                  <span className="fi-badge fi-badge--pendiente">Pendiente</span>
                )}
                <i className="bi bi-chevron-right fi-sc-arrow"/>
              </div>
            </button>
          );
        })}
      </div>

      <div className="fi-bloque">
        <div className="fi-bloque-titulo">
          <i className="bi bi-chat-text me-2"/>Observaciones generales / Recomendaciones
        </div>
        <textarea
          className="fi-notas fi-notas-grande"
          placeholder="Ingrese observaciones generales y recomendaciones sobre el estado de la correa..."
          value={form.observaciones}
          onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
        />
      </div>

      {!confirmando ? (
        <button className="fi-btn-ingresar" onClick={() => setConfirmando(true)}>
          <i className="bi bi-cloud-check-fill me-2"/>
          Ingresar Datos al Dashboard
        </button>
      ) : (
        <div className="fi-confirmar-box">
          <div className="fi-confirmar-texto">
            <i className="bi bi-info-circle-fill me-2"/>
            Confirma el ingreso de esta inspeccion? Los datos actuales pasaran al historial.
          </div>
          <div className="fi-confirmar-botones">
            <button className="fi-btn-cancelar-confirm" onClick={() => setConfirmando(false)}>
              <i className="bi bi-arrow-left me-1"/>Volver a revisar
            </button>
            <button className="fi-btn-confirmar" onClick={handleIngresar}>
              <i className="bi bi-check-lg me-2"/>Si, ingresar datos
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 40 }}/>
    </div>
  );
}
