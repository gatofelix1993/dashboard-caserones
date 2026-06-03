// ============================================================
// App.js - SCADA-MINE Caserones - Lundin Mining v5
// Flujo: Inicio -> Formulario -> Dashboard (con historial)
// ============================================================
import { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import './informe.css';

import { INITIAL_DATA, INITIAL_CONFIG } from './data/data';
import Topbar                from './components/Topbar';
import VistaInicio           from './components/VistaInicio';
import VistaCorrea           from './components/VistaCorrea';
import FormularioInspeccion  from './components/FormularioInspeccion';
import GeneradorInforme      from './components/GeneradorInforme';

// Modos posibles de la vista de correa
// 'formulario' -> FormularioInspeccion (nuevo flujo)
// 'dashboard'  -> VistaCorrea (vista de datos)
// null         -> VistaInicio

function App() {
  const [data,          setData]          = useState(INITIAL_DATA);
  const [config,        setConfig]        = useState(INITIAL_CONFIG);
  const [correaActiva,  setCorreaActiva]  = useState(null);
  const [modoCorrea,    setModoCorrea]    = useState(null); // 'formulario' | 'dashboard'
  const [informeConfig, setInformeConfig] = useState(null);

  // ── Navegación ────────────────────────────────────────────
  const handleSelectCorrea = useCallback((correa) => {
    setCorreaActiva(correa);
    // Si ya tiene datos de inspección real, va al dashboard
    // Si no, abre el formulario directamente
    const correaEnData = data.correas.find(c => c.id === correa.id);
    const tieneInspecciones = (correaEnData?.historial || []).length > 0;
    setModoCorrea(tieneInspecciones ? 'dashboard' : 'formulario');
  }, [data.correas]);

  const handleBack = useCallback(() => {
    setCorreaActiva(null);
    setModoCorrea(null);
  }, []);

  const handleNuevaInspeccion = useCallback(() => {
    setModoCorrea('formulario');
  }, []);

  // ── Ingreso de datos desde el formulario ─────────────────
  const handleIngresarDatos = useCallback((registro) => {
    setData(prev => {
      const correas = prev.correas.map(c => {
        if (c.id !== registro.correaId) return c;

        // Los datos actuales pasan al historial
        const historialAnterior = c.historial || [];
        const entradaHistorial = {
          id:            `insp-${Date.now()}`,
          timestamp:     registro.timestamp,
          fechaHora:     registro.fechaHora,
          fecha:         registro.fecha,
          hora:          registro.hora,
          responsable:   registro.responsable,
          responsable2:  registro.responsable2,
          ordenTrabajo:  registro.ordenTrabajo,
          tipoMantenimiento: registro.tipoMantenimiento,
          observaciones: registro.observaciones,
          avisos:        registro.avisos,
          secciones:     registro.secciones, // datos raw del formulario
          items:         registro.items,      // datos convertidos al formato dashboard
        };

        return {
          ...c,
          // Dashboard se actualiza con los nuevos datos
          items:            registro.items,
          ultimaInspeccion: registro.fecha,
          responsable:      registro.responsable || c.responsable,
          // Historial acumula todas las inspecciones
          historial: [entradaHistorial, ...historialAnterior],
        };
      });
      return { ...prev, correas };
    });

    // Actualiza correaActiva con los nuevos datos
    setCorreaActiva(prev => {
      const actualizada = data.correas.find(c => c.id === registro.correaId);
      return { ...prev, items: registro.items };
    });
    setModoCorrea('dashboard');
  }, [data.correas]);

  // ── Informe ──────────────────────────────────────────────
  const handleInformeGlobal = useCallback(() => {
    setInformeConfig({ correas: data.correas });
  }, [data.correas]);

  const handleInformeUnitario = useCallback((correa) => {
    setInformeConfig({ correas: [correa] });
  }, []);

  const handleCerrarInforme = useCallback(() => setInformeConfig(null), []);

  // ── Título del topbar ────────────────────────────────────
  const topbarTitle = correaActiva
    ? `${correaActiva.codigo} — ${correaActiva.nombre}`
    : 'INSPECCIÓN CINTAS TRANSPORTADORAS';

  const totalPolines = data.correas.reduce((acc, c) => acc + (c.numEstaciones * 3), 0);

  // La correa activa siempre viene con los datos más actuales de data
  const correaConDatos = correaActiva
    ? (data.correas.find(c => c.id === correaActiva.id) || correaActiva)
    : null;

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
                <button className="btn-informe-global" onClick={handleInformeGlobal}>
                  <i className="bi bi-file-earmark-pdf me-2"/>
                  <span className="btn-import-text">Informe Global</span>
                </button>
              </div>
            )
          }
        />

        <main className="content-area">
          {/* Vista inicio */}
          {!correaActiva && (
            <VistaInicio
              correas={data.correas}
              onSelectCorrea={handleSelectCorrea}
            />
          )}

          {/* Formulario de inspección */}
          {correaActiva && modoCorrea === 'formulario' && (
            <FormularioInspeccion
              correa={correaConDatos}
              onIngresar={handleIngresarDatos}
              onCancelar={handleBack}
            />
          )}

          {/* Dashboard de correa */}
          {correaActiva && modoCorrea === 'dashboard' && (
            <VistaCorrea
              correa={correaConDatos}
              onBack={handleBack}
              onNuevaInspeccion={handleNuevaInspeccion}
              onInformeUnitario={handleInformeUnitario}
            />
          )}
        </main>
      </div>

      {/* Generador de Informe */}
      {informeConfig && (
        <GeneradorInforme
          data={data}
          correas={informeConfig.correas}
          onClose={handleCerrarInforme}
        />
      )}
    </div>
  );
}

export default App;
