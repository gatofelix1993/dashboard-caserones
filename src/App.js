// ============================================================
// App.js - SCADA-MINE Caserones - Lundin Mining v5
// Flujo: Login -> (Inspector: Inspección) | (Gerente: KPIs)
// ============================================================
import { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import './informe.css';

import { INITIAL_DATA, INITIAL_CONFIG } from './data/data';
import Login                 from './components/Login';
import Topbar                from './components/Topbar';
import VistaInicio           from './components/VistaInicio';
import VistaCorrea           from './components/VistaCorrea';
import FormularioInspeccion  from './components/FormularioInspeccion';
import GeneradorInforme      from './components/GeneradorInforme';
import VistaGerencial        from './components/VistaGerencial';
import PanelSoporte          from './components/PanelSoporte';

function App() {
  // ── Todos los hooks SIEMPRE al tope, sin condicionales ───
  const [usuario,       setUsuario]       = useState(null);
  const [data,          setData]          = useState(INITIAL_DATA);
  const [config,        setConfig]        = useState(INITIAL_CONFIG); // eslint-disable-line no-unused-vars
  const [correaActiva,  setCorreaActiva]  = useState(null);
  const [modoCorrea,    setModoCorrea]    = useState(null);
  const [informeConfig, setInformeConfig] = useState(null);

  // ── Auth ─────────────────────────────────────────────────
  const handleLogin  = useCallback((u) => setUsuario(u), []);
  const handleLogout = useCallback(() => {
    setUsuario(null);
    setCorreaActiva(null);
    setModoCorrea(null);
  }, []);

  // ── Navegación ────────────────────────────────────────────
  const handleSelectCorrea = useCallback((correa) => {
    setCorreaActiva(correa);
    const correaEnData = data.correas.find(c => c.id === correa.id);
    const tieneInspecciones = (correaEnData?.historial || []).length > 0;
    setModoCorrea(tieneInspecciones ? 'dashboard' : 'formulario');
  }, [data.correas]);

  const handleBack = useCallback(() => {
    setCorreaActiva(null);
    setModoCorrea(null);
  }, []);

  const handleNuevaInspeccion = useCallback(() => setModoCorrea('formulario'), []);

  // ── Ingreso de datos ─────────────────────────────────────
  const handleIngresarDatos = useCallback((registro) => {
    setData(prev => {
      const correas = prev.correas.map(c => {
        if (c.id !== registro.correaId) return c;
        const historialAnterior = c.historial || [];
        const entradaHistorial = {
          id:                `insp-${Date.now()}`,
          timestamp:         registro.timestamp,
          fechaHora:         registro.fechaHora,
          fecha:             registro.fecha,
          hora:              registro.hora,
          responsable:       registro.responsable,
          responsable2:      registro.responsable2,
          ordenTrabajo:      registro.ordenTrabajo,
          tipoMantenimiento: registro.tipoMantenimiento,
          observaciones:     registro.observaciones,
          avisos:            registro.avisos,
          secciones:         registro.secciones,
          items:             registro.items,
        };
        return {
          ...c,
          items:            registro.items,
          ultimaInspeccion: registro.fecha,
          responsable:      registro.responsable || c.responsable,
          historial:        [entradaHistorial, ...historialAnterior],
        };
      });
      return { ...prev, correas };
    });
    setCorreaActiva(prev => ({ ...prev, items: registro.items }));
    setModoCorrea('dashboard');
  }, []);

  // ── Informe ──────────────────────────────────────────────
  const handleInformeGlobal   = useCallback(() => setInformeConfig({ correas: data.correas }), [data.correas]);
  const handleInformeUnitario = useCallback((correa) => setInformeConfig({ correas: [correa] }), []);
  const handleCerrarInforme   = useCallback(() => setInformeConfig(null), []);

  // ── Return condicional DESPUÉS de todos los hooks ────────
  if (!usuario) return <Login onLogin={handleLogin} />;

  // ── Vista gerencial (solo KPIs, sin navegación de correas) ──
  if (usuario.rol === 'gerente') {
    return <VistaGerencial data={data} usuario={usuario} onLogout={handleLogout} />;
  }

  // ── TODO: Panel soporte ──────────────────────────────────
  if (usuario.rol === 'soporte') {
    return <PanelSoporte usuario={usuario} onLogout={handleLogout} />;
  }

  // ── Cálculos derivados ───────────────────────────────────
  const topbarTitle = correaActiva
    ? `${correaActiva.codigo} — ${correaActiva.nombre}`
    : 'INSPECCIÓN CINTAS TRANSPORTADORAS';

  const totalPolines = data.correas.reduce((acc, c) => acc + (c.numEstaciones * 3), 0);

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
          usuario={usuario}
          onLogout={handleLogout}
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
          {!correaActiva && (
            <VistaInicio
              correas={data.correas}
              onSelectCorrea={handleSelectCorrea}
            />
          )}

          {correaActiva && modoCorrea === 'formulario' && (
            <FormularioInspeccion
              correa={correaConDatos}
              onIngresar={handleIngresarDatos}
              onCancelar={handleBack}
            />
          )}

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
