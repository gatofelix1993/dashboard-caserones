// ============================================================
// GeneradorInforme.jsx — SCADA-MINE · Caserones · Lundin Mining
// Genera el informe de inspección en el mismo formato del PDF oficial:
//   1. Portada general
//   2. Slide portada correa (fondo foto mina)
//   3. Slide actividades relevantes (los 8 ítems)
//   4. Slide registro fotográfico
// Se activa vía window.print() con CSS @page específico
// ============================================================

import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// ── Helpers ──────────────────────────────────────────────────

const ITEMS_LABELS = {
  polines:      'Estaciones de Polines',
  cinta:        'Cinta',
  raspadores:   'Raspadores',
  protecciones: 'Protecciones',
  chutes:       'Chutes',
  poleas:       'Poleas',
  contrapeso:   'Contrapeso / Tensor',
  limpieza:     'Limpieza / Aseo',
};

const ESTADO_COLOR = { ok: '#2ecc71', alerta: '#f4a700', critico: '#e74c3c' };
const ESTADO_LABEL = { ok: 'OK', alerta: 'Alerta', critico: 'Crítico' };

// Imagen fondo: mina rajo (usamos la de Open Street Maps como placeholder para rajo abierto)
// En producción, usar una imagen local guardada en public/
const BG_RAJO   = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1456' height='816'%3E%3Crect fill='%23223344'/%3E%3C/svg%3E";
const BG_PORTADA = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1456' height='816'%3E%3Crect fill='%23152535'/%3E%3C/svg%3E";

// Logo SVG Caserones (simplificado — triángulos del isótipo)
function LogoCaserones({ size = 180, darkBg = true }) {
  const color = darkBg ? '#ffffff' : '#ffffff';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Isotipo */}
      <svg width={size * 0.28} height={size * 0.28} viewBox="0 0 60 60" fill="none">
        <polygon points="10,50 30,10 50,50" fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round"/>
        <polygon points="22,50 37,22 52,50" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round"/>
      </svg>
      {/* Texto */}
      <div>
        <div style={{
          fontFamily: 'Arial, sans-serif', fontWeight: 900,
          fontSize: size * 0.16, color: color, letterSpacing: 3,
          lineHeight: 1.1, textTransform: 'uppercase',
        }}>CASERONES</div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: size * 0.065,
          color: color, letterSpacing: 2, opacity: 0.85,
        }}>lundin mining</div>
      </div>
    </div>
  );
}

// ── SLIDE: Portada General ────────────────────────────────────
function SlidePresentacion({ meta }) {
  return (
    <div className="inf-slide inf-slide--portada">
      {/* Fondo */}
      <div className="inf-bg-overlay inf-bg-overlay--portada" />

      {/* Centro */}
      <div className="inf-portada-content">
        <LogoCaserones size={220}/>
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div className="inf-portada-titulo">
            Informe Inspección Cintas Transportadoras
          </div>
          <div className="inf-portada-semana">Semana N°{meta.semana}</div>
          <div className="inf-portada-fecha">
            {new Date(meta.fechaInforme + 'T12:00:00').toLocaleDateString('es-CL', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SLIDE: Portada de cada correa ────────────────────────────
function SlideCorreaPortada({ correa }) {
  return (
    <div className="inf-slide inf-slide--correa-portada">
      <div className="inf-bg-overlay inf-bg-overlay--correa" />

      {/* Centro: logo izq + separador + código der */}
      <div className="inf-correa-portada-content">
        <div className="inf-correa-portada-left">
          <LogoCaserones size={160}/>
        </div>
        <div className="inf-correa-portada-sep"/>
        <div className="inf-correa-portada-right">
          <div className="inf-correa-portada-codigo">{correa.codigo}</div>
          <div className="inf-correa-portada-subtitulo">Correa</div>
        </div>
      </div>
    </div>
  );
}

// ── SLIDE: Actividades relevantes (grupo de 4 ítems por slide) ─
function SlideActividades({ correa, items, titulo, numero }) {
  return (
    <div className="inf-slide inf-slide--actividades">
      {/* Header */}
      <div className="inf-act-header">
        <div className="inf-act-header-left">
          <div className="inf-act-subtitulo">Actividades relevantes</div>
          <div className="inf-act-titulo">Inspección cinta transportadora</div>
          <div className="inf-act-codigo">{correa.codigo}</div>
        </div>
        <div className="inf-act-header-right">
          <LogoCaserones size={120} darkBg={false}/>
        </div>
      </div>

      {/* Separador */}
      <div className="inf-act-sep"/>

      {/* Ítems */}
      <div className="inf-act-items">
        {items.map(([key, item], i) => {
          const num = numero + i;
          const estado = item.estado;
          return (
            <div key={key} className="inf-act-item">
              <div className="inf-act-item-num">{num}.</div>
              <div className="inf-act-item-label">{ITEMS_LABELS[key]}</div>
              <div className="inf-act-item-estado" style={{ color: ESTADO_COLOR[estado] }}>
                {estado !== 'ok' && (
                  <span className="inf-act-estado-badge" style={{
                    background: ESTADO_COLOR[estado] + '22',
                    border: `1px solid ${ESTADO_COLOR[estado]}55`,
                  }}>
                    {ESTADO_LABEL[estado]}
                  </span>
                )}
              </div>
              <div className="inf-act-item-notas">
                {item.notas && item.notas !== 'OK.' && item.notas !== 'OK' && item.notas !== 'N/A.'
                  ? item.notas
                  : <span className="inf-act-notas-ok">OK</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SLIDE: Registro fotográfico ──────────────────────────────
function SlideRegistroFotos({ correa, todasFotos }) {
  if (todasFotos.length === 0) return null;
  return (
    <div className="inf-slide inf-slide--fotos">
      <div className="inf-fotos-header">
        <div className="inf-fotos-titulo">Registro fotográfico</div>
        <div className="inf-fotos-sep"/>
      </div>
      <div className="inf-fotos-grid" style={{
        gridTemplateColumns: todasFotos.length === 1
          ? '1fr' : todasFotos.length === 2
          ? '1fr 1fr' : todasFotos.length <= 4
          ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      }}>
        {todasFotos.map((foto, i) => (
          <div key={i} className="inf-foto-cell">
            <img src={foto.url} alt={foto.name || `Foto ${i+1}`}
              className="inf-foto-img"/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SLIDE: Cierre / Contraportada ────────────────────────────
function SlideCierre() {
  return (
    <div className="inf-slide inf-slide--cierre">
      <div className="inf-bg-overlay inf-bg-overlay--cierre"/>
      <div className="inf-cierre-content">
        <LogoCaserones size={200}/>
        <div className="inf-cierre-valores">
          <div className="inf-cierre-lema">EL VALOR DE</div>
          <div className="inf-cierre-ser">SER CASERONES</div>
        </div>
        <div className="inf-cierre-chips">
          {['RESPETO E INTEGRIDAD','SEGURIDAD','EXCELENCIA OPERACIONAL','COLABORACIÓN','SUSTENTABILIDAD','VISIÓN INNOVADORA'].map((v, i) => (
            <div key={i} className="inf-cierre-chip">{v}</div>
          ))}
        </div>
        <div className="inf-cierre-tagline">
          Orgullosos de lo que somos,{' '}
          <strong>nos proyectamos al futuro</strong>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal del informe ─────────────────────────
// Se monta en un portal fuera del árbol principal
export function InformeCompleto({ data, correas, onClose }) {
  const portalRef = useRef(null);

  // Crear portal en body para el print
  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'informe-portal';
    document.body.appendChild(el);
    portalRef.current = el;
    return () => document.body.removeChild(el);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const meta = data?.meta || {
    semana: 22, fechaInforme: '2026-05-28',
  };

  // Filtrar correas a incluir
  const correasAImprimir = correas || data.correas;

  return (
    <>
      {/* Botones flotantes de control (solo en pantalla, no en print) */}
      <div className="inf-control-bar" id="inf-control-bar">
        <button className="inf-btn-close" onClick={onClose}>
          <i className="bi bi-x-lg me-2"/>Cerrar
        </button>
        <span className="inf-control-info">
          Informe Semana N°{meta.semana} — {correasAImprimir.length} correas
        </span>
        <button className="inf-btn-print" onClick={handlePrint}>
          <i className="bi bi-printer me-2"/>Imprimir / Guardar PDF
        </button>
      </div>

      {/* Contenido del informe */}
      <div className="inf-documento" id="inf-documento">

        {/* Portada */}
        <SlidePresentacion meta={meta}/>

        {/* Páginas por correa */}
        {correasAImprimir.map(correa => {
          const itemsEntries = Object.entries(correa.items || {});
          const mitad = Math.ceil(itemsEntries.length / 2);
          const grupo1 = itemsEntries.slice(0, mitad);   // ítems 1-4
          const grupo2 = itemsEntries.slice(mitad);       // ítems 5-8
          const todasFotos = itemsEntries.flatMap(([, item]) => item.fotos || []);

          return (
            <div key={correa.id}>
              {/* 1. Portada de la correa */}
              <SlideCorreaPortada correa={correa}/>

              {/* 2. Actividades ítems 1-4 */}
              <SlideActividades
                correa={correa}
                items={grupo1}
                numero={1}
                titulo="Actividades relevantes — parte 1"
              />

              {/* 3. Actividades ítems 5-8 */}
              <SlideActividades
                correa={correa}
                items={grupo2}
                numero={mitad + 1}
                titulo="Actividades relevantes — parte 2"
              />

              {/* 4. Registro fotográfico (solo si hay fotos) */}
              {todasFotos.length > 0 && (
                <SlideRegistroFotos correa={correa} todasFotos={todasFotos}/>
              )}
            </div>
          );
        })}

        {/* Contraportada */}
        <SlideCierre/>
      </div>
    </>
  );
}

// ── Modal envolvente del informe ─────────────────────────────
export default function GeneradorInforme({ data, correas, onClose }) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return ReactDOM.createPortal(
    <div className="inf-overlay">
      <InformeCompleto data={data} correas={correas} onClose={onClose}/>
    </div>,
    document.body
  );
}
