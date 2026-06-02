// ============================================================
// components/VistaOperacional.jsx — Gestión operacional responsive
// ============================================================
import { useState, useCallback } from 'react';
import TablaPolines from './TablaPolines';
import { getOverallStatus } from '../utils/maintenance';

const ESTADOS = ['todos', 'rojo', 'naranja', 'amarillo', 'verde'];
const ESTADO_LABELS = {
  todos: 'Todos', rojo: 'Crítico', naranja: 'Alerta', amarillo: 'Próximo', verde: 'Normal',
};

export default function VistaOperacional({ data, config, onUpdate }) {
  const [activeCorrea, setActiveCorrea] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const critCount = data.correas.flatMap(c => c.polines)
    .filter(p => getOverallStatus(p, config) === 'rojo').length;

  const correasFiltradas = activeCorrea === 'todas'
    ? data.correas
    : data.correas.filter(c => c.id === activeCorrea);

  return (
    <div>
      {critCount > 0 && (
        <div className="alert-banner mb-3">
          <i className="bi bi-exclamation-octagon-fill" style={{ fontSize: 18, flexShrink: 0 }} />
          <span>
            <strong>{critCount} polín{critCount > 1 ? 'es' : ''} en estado CRÍTICO</strong>
            {' '}— Atención inmediata requerida.
          </span>
        </div>
      )}

      {/* Filtros — apilados en mobile, en fila en desktop */}
      <div className="filters-bar mb-3">
        <div className="filters-row-top">
          <div className="correa-tabs">
            <button
              className={`correa-tab ${activeCorrea === 'todas' ? 'correa-tab--active' : ''}`}
              onClick={() => setActiveCorrea('todas')}
            >
              Todas
            </button>
            {data.correas.map(c => (
              <button
                key={c.id}
                className={`correa-tab ${activeCorrea === c.id ? 'correa-tab--active' : ''}`}
                style={activeCorrea === c.id ? { background: c.color, borderColor: c.color, color: '#000' } : {}}
                onClick={() => setActiveCorrea(c.id)}
              >
                {c.id}
              </button>
            ))}
          </div>
          <button className="btn-scada-outline btn-import">
            <i className="bi bi-upload me-1" />
            <span className="btn-import-text">Importar Inventario</span>
          </button>
        </div>

        <div className="filters-row-bottom">
          <div className="estado-filters">
            {ESTADOS.map(s => (
              <button
                key={s}
                className={`chip chip-${s === 'todos' ? 'todos' : s} ${filtroEstado === s ? 'chip--active' : ''}`}
                onClick={() => setFiltroEstado(s)}
              >
                {ESTADO_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {correasFiltradas.map(correa => {
        const polinesVisibles = filtroEstado === 'todos'
          ? correa.polines
          : correa.polines.filter(p => getOverallStatus(p, config) === filtroEstado);

        return (
          <div key={correa.id} className="mb-4">
            <div className="section-header">
              <div className="correa-accent-bar"
                style={{ background: correa.color, boxShadow: `0 0 8px ${correa.color}` }} />
              <h2>{correa.nombre}</h2>
              <span className="tag-badge">{correa.id}</span>
              <span className="correa-desc d-none d-md-inline">{correa.descripcion}</span>
              <span className="correa-count ms-auto">
                {polinesVisibles.length}/{correa.polines.length}
              </span>
              <div className="section-line" />
            </div>

            {polinesVisibles.length > 0 ? (
              <TablaPolines
                correa={{ ...correa, polines: polinesVisibles }}
                config={config}
                onUpdate={onUpdate}
              />
            ) : (
              <div className="empty-state">
                <i className="bi bi-funnel me-2" />
                No hay polines con el filtro seleccionado.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
