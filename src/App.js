// ============================================================
// App.js — Raíz SCADA-MINE Caserones · Lundin Mining v4
// Flujo: Inicio (tabs Correas/Historial) → Correa (detalle)
// Modal "Datos de Entrada" para importar xlsx
// ============================================================
import { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { INITIAL_DATA, INITIAL_CONFIG } from './data/data';
import Topbar              from './components/Topbar';
import VistaInicio         from './components/VistaInicio';
import VistaCorrea         from './components/VistaCorrea';
import ModalDatosEntrada   from './components/ModalDatosEntrada';

function App() {
  const [data,           setData]           = useState(INITIAL_DATA);
  const [config,         setConfig]         = useState(INITIAL_CONFIG);
  const [correaActiva,   setCorreaActiva]   = useState(null);
  const [modalDatos,     setModalDatos]     = useState(false);

  const handleSelectCorrea = useCallback((correa) => setCorreaActiva(correa), []);
  const handleBack         = useCallback(() => setCorreaActiva(null), []);
  const handleInformeGlobal = useCallback(() => window.print(), []);

  // Importar datos desde xlsx: actualiza los items de cada correa
  const handleImportar = useCallback((filas) => {
    setData(prev => {
      const correas = prev.correas.map(c => {
        const fila = filas.find(f => f.codigo === c.codigo);
        if (!fila) return c;
        return {
          ...c,
          responsable:      fila.responsable || c.responsable,
          ultimaInspeccion: fila.fecha       || c.ultimaInspeccion,
          items: {
            ...c.items,
            ...Object.fromEntries(
              Object.entries(fila.items).map(([k, v]) => [k, { ...c.items[k], ...v }])
            ),
          },
        };
      });
      return { ...prev, correas };
    });
  }, []);

  const totalPolines = data.correas.reduce((acc, c) => acc + (c.numEstaciones * 3), 0);

  const topbarTitle = correaActiva
    ? `${correaActiva.codigo} — ${correaActiva.nombre}`
    : 'INSPECCIÓN CINTAS TRANSPORTADORAS';

  return (
    <div className="app-shell app-shell--no-sidebar">
      <div className="main-wrapper">
        <Topbar
          title={topbarTitle}
          totalPolines={totalPolines}
          onMenuToggle={() => {}}
          hideHamburger
          extraRight={
            !correaActiva && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Botón Datos de Entrada */}
                <button
                  className="btn-datos-entrada"
                  onClick={() => setModalDatos(true)}
                >
                  <i className="bi bi-file-earmark-spreadsheet me-2"/>
                  <span className="btn-import-text">Datos de Entrada</span>
                </button>
                {/* Botón Informe Global */}
                <button className="btn-informe-global" onClick={handleInformeGlobal}>
                  <i className="bi bi-file-earmark-pdf me-2"/>
                  <span className="btn-import-text">Informe Global</span>
                </button>
              </div>
            )
          }
        />

        <main className="content-area">
          {!correaActiva ? (
            <VistaInicio
              correas={data.correas}
              onSelectCorrea={handleSelectCorrea}
            />
          ) : (
            <VistaCorrea
              correa={correaActiva}
              onBack={handleBack}
              onUpdate={() => {}}
            />
          )}
        </main>
      </div>

      {/* Modal Datos de Entrada */}
      {modalDatos && (
        <ModalDatosEntrada
          onClose={() => setModalDatos(false)}
          onImportar={handleImportar}
        />
      )}
    </div>
  );
}

export default App;
