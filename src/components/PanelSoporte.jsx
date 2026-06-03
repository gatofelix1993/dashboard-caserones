// ============================================================
// components/PanelSoporte.jsx — Gestión de usuarios
// Solo accesible para rol: soporte
// Datos demo — listo para conectar a backend
// ============================================================
import { useState } from 'react';

const ROLES = ['inspector', 'gerente'];

const USUARIOS_INICIALES = [
  { id: 'u1', nombre: 'R. Díaz',     email: 'rdiaz@caserones.cl',     rol: 'inspector', activo: true,  creadoEn: '2026-01-10' },
  { id: 'u2', nombre: 'P. Araya',    email: 'paraya@caserones.cl',    rol: 'inspector', activo: true,  creadoEn: '2026-01-10' },
  { id: 'u3', nombre: 'M. Torres',   email: 'mtorres@caserones.cl',   rol: 'inspector', activo: true,  creadoEn: '2026-02-03' },
  { id: 'u4', nombre: 'J. Fuentes',  email: 'jfuentes@caserones.cl',  rol: 'inspector', activo: true,  creadoEn: '2026-02-03' },
  { id: 'u5', nombre: 'C. Vega',     email: 'cvega@caserones.cl',     rol: 'inspector', activo: false, creadoEn: '2026-03-15' },
  { id: 'u6', nombre: 'F. Molina',   email: 'fmolina@caserones.cl',   rol: 'inspector', activo: true,  creadoEn: '2026-03-15' },
  { id: 'g1', nombre: 'Gerencia',    email: 'gerencia@caserones.cl',  rol: 'gerente',   activo: true,  creadoEn: '2026-01-05' },
  { id: 'g2', nombre: 'Sub Gerente', email: 'sgerencia@caserones.cl', rol: 'gerente',   activo: true,  creadoEn: '2026-04-20' },
];

const FORM_VACIO = { nombre: '', email: '', password: '', rol: 'inspector' };

export default function PanelSoporte({ usuario, onLogout }) {
  const [usuarios,   setUsuarios]   = useState(USUARIOS_INICIALES);
  const [vista,      setVista]      = useState('lista');
  const [form,       setForm]       = useState(FORM_VACIO);
  const [editId,     setEditId]     = useState(null);
  const [busqueda,   setBusqueda]   = useState('');
  const [filtroRol,  setFiltroRol]  = useState('todos');
  const [toast,      setToast]      = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusq = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol  = filtroRol === 'todos' || u.rol === filtroRol;
    return matchBusq && matchRol;
  });

  const handleNuevo = () => { setForm(FORM_VACIO); setEditId(null); setVista('nuevo'); };

  const handleEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    setEditId(u.id);
    setVista('editar');
  };

  const handleGuardar = () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      mostrarToast('Nombre y correo son obligatorios.', 'error'); return;
    }
    if (vista === 'nuevo' && !form.password.trim()) {
      mostrarToast('La contraseña es obligatoria para usuarios nuevos.', 'error'); return;
    }
    if (usuarios.find(u => u.email === form.email.trim() && u.id !== editId)) {
      mostrarToast('Ese correo ya está en uso.', 'error'); return;
    }
    if (vista === 'nuevo') {
      setUsuarios(prev => [...prev, {
        id: `u${Date.now()}`, nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(), rol: form.rol,
        activo: true, creadoEn: new Date().toISOString().split('T')[0],
      }]);
      mostrarToast(`Usuario ${form.nombre.trim()} creado.`);
    } else {
      setUsuarios(prev => prev.map(u =>
        u.id === editId ? { ...u, nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(), rol: form.rol } : u
      ));
      mostrarToast('Usuario actualizado.');
    }
    setVista('lista');
  };

  const handleToggleActivo = (id) => {
    const u = usuarios.find(x => x.id === id);
    setUsuarios(prev => prev.map(x => x.id === id ? { ...x, activo: !x.activo } : x));
    mostrarToast(`${u.nombre} ${u.activo ? 'desactivado' : 'activado'}.`, u.activo ? 'warn' : 'ok');
  };

  const handleEliminar = (id) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    setConfirmDel(null);
    mostrarToast('Usuario eliminado.', 'warn');
  };

  const totalActivos    = usuarios.filter(u => u.activo).length;
  const totalInactivos  = usuarios.filter(u => !u.activo).length;
  const totalInspectors = usuarios.filter(u => u.rol === 'inspector').length;
  const totalGerentes   = usuarios.filter(u => u.rol === 'gerente').length;

  return (
    <div style={S.shell}>

      {/* Topbar */}
      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          <div style={S.topbarTitle}>CASERONES</div>
          <div style={S.topbarSep}>|</div>
          <div style={S.topbarSub}>Panel de Soporte</div>
        </div>
        <div style={S.topbarRight}>
          <span style={S.userInfo}>
            <i className="bi bi-person-circle" style={{ fontSize: 16 }}/>
            {usuario?.nombre}
            <span style={S.rolBadge}>Soporte</span>
          </span>
          <button style={S.btnLogout} onClick={onLogout} title="Cerrar sesión">
            <i className="bi bi-box-arrow-right"/>
          </button>
        </div>
      </header>

      <main style={S.main}>

        {/* Toast */}
        {toast && (
          <div style={{ ...S.toast, ...(toast.tipo === 'error' ? S.toastError : toast.tipo === 'warn' ? S.toastWarn : S.toastOk) }}>
            <i className={`bi ${toast.tipo === 'error' ? 'bi-x-circle-fill' : toast.tipo === 'warn' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} style={{ marginRight: 8 }}/>
            {toast.msg}
          </div>
        )}

        {/* Modal confirmar eliminación */}
        {confirmDel && (
          <div style={S.overlay}>
            <div style={S.modalConfirm}>
              <i className="bi bi-trash3-fill" style={{ color: '#c0272d', fontSize: 36, marginBottom: 8 }}/>
              <div style={S.modalConfirmTitle}>Eliminar usuario</div>
              <div style={S.modalConfirmDesc}>
                Esta acción no se puede deshacer. <strong>{confirmDel.nombre}</strong> perderá el acceso al sistema.
              </div>
              <div style={S.modalConfirmBtns}>
                <button style={{ ...S.btnSec, flex: 1, justifyContent: 'center' }} onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button style={{ ...S.btnDanger, flex: 1 }} onClick={() => handleEliminar(confirmDel.id)}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={S.kpiRow}>
          {[
            { label: 'Total usuarios',  value: usuarios.length,  icon: 'bi-people',       color: '#1e6fa5' },
            { label: 'Activos',         value: totalActivos,     icon: 'bi-person-check',  color: '#1e8c4a' },
            { label: 'Inactivos',       value: totalInactivos,   icon: 'bi-person-dash',   color: '#c98b00' },
            { label: 'Inspectores',     value: totalInspectors,  icon: 'bi-person-gear',   color: '#1e6fa5' },
            { label: 'Gerentes',        value: totalGerentes,    icon: 'bi-person-badge',  color: '#c47a2e' },
          ].map(k => (
            <div key={k.label} style={{ ...S.kpiCard, borderTop: `3px solid ${k.color}` }}>
              <i className={`bi ${k.icon}`} style={{ fontSize: 22, color: k.color }}/>
              <div style={S.kpiVal}>{k.value}</div>
              <div style={S.kpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Card principal */}
        <div style={S.card}>

          {/* Header */}
          <div style={S.cardHeader}>
            <div style={S.cardHeaderLeft}>
              <span style={S.cardTitle}>
                <i className="bi bi-people-fill" style={{ marginRight: 8 }}/>
                Gestión de usuarios
              </span>
              <span style={S.cardCount}>{usuariosFiltrados.length} resultados</span>
            </div>
            <button style={S.btnPri} onClick={handleNuevo}>
              <i className="bi bi-person-plus-fill" style={{ marginRight: 6 }}/>
              Nuevo usuario
            </button>
          </div>

          {/* Formulario */}
          {(vista === 'nuevo' || vista === 'editar') && (
            <div style={S.formWrap}>
              <div style={S.formTitle}>
                <i className={`bi ${vista === 'nuevo' ? 'bi-person-plus' : 'bi-pencil-square'}`} style={{ marginRight: 8 }}/>
                {vista === 'nuevo' ? 'Crear nuevo usuario' : 'Editar usuario'}
              </div>
              <div style={S.formGrid}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Nombre completo *</label>
                  <input style={S.input} placeholder="Ej: J. Fuentes"
                    value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}/>
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Correo electrónico *</label>
                  <input style={S.input} type="email" placeholder="usuario@caserones.cl"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}/>
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>{vista === 'nuevo' ? 'Contraseña *' : 'Nueva contraseña (vacío = no cambia)'}</label>
                  <input style={S.input} type="password" placeholder="••••••••"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}/>
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Rol *</label>
                  <div style={S.rolSelector}>
                    {ROLES.map(r => (
                      <button key={r} type="button"
                        style={{ ...S.rolBtn, ...(form.rol === r ? S.rolBtnActive : {}) }}
                        onClick={() => setForm(p => ({ ...p, rol: r }))}>
                        <i className={`bi ${r === 'inspector' ? 'bi-person-gear' : 'bi-person-badge'}`} style={{ marginRight: 6 }}/>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={S.formActions}>
                <button style={S.btnSec} onClick={() => setVista('lista')}>
                  <i className="bi bi-x" style={{ marginRight: 6 }}/>Cancelar
                </button>
                <button style={S.btnPri} onClick={handleGuardar}>
                  <i className="bi bi-check-lg" style={{ marginRight: 6 }}/>
                  {vista === 'nuevo' ? 'Crear usuario' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={S.filtros}>
            <div style={S.searchWrap}>
              <i className="bi bi-search" style={S.searchIcon}/>
              <input style={S.searchInput} placeholder="Buscar por nombre o correo..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
            </div>
            <div style={S.filtroRoles}>
              {['todos', 'inspector', 'gerente'].map(r => (
                <button key={r}
                  style={{ ...S.filtroBtn, ...(filtroRol === r ? S.filtroBtnActive : {}) }}
                  onClick={() => setFiltroRol(r)}>
                  {r === 'todos' ? 'Todos' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Usuario', 'Correo', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      <i className="bi bi-search" style={{ fontSize: 24, display: 'block', marginBottom: 8 }}/>
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : usuariosFiltrados.map(u => (
                  <tr key={u.id} style={{ ...S.trRow, opacity: u.activo ? 1 : 0.55 }}>
                    <td style={S.td}>
                      <div style={S.userCell}>
                        <div style={{ ...S.avatar, background: u.rol === 'gerente' ? 'rgba(196,122,46,0.15)' : 'rgba(30,111,165,0.15)', color: u.rol === 'gerente' ? '#c47a2e' : '#1e6fa5' }}>
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span style={S.userName}>{u.nombre}</span>
                      </div>
                    </td>
                    <td style={{ ...S.td, fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={S.td}>
                      <span style={{ ...S.rolChip, ...(u.rol === 'gerente' ? S.rolChipGer : S.rolChipInsp) }}>
                        <i className={`bi ${u.rol === 'gerente' ? 'bi-person-badge' : 'bi-person-gear'}`} style={{ marginRight: 4 }}/>
                        {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.estadoChip, ...(u.activo ? S.estadoActivo : S.estadoInactivo) }}>
                        <span style={{ ...S.dot, background: u.activo ? '#1e8c4a' : '#c98b00' }}/>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: 'var(--text-muted)' }}>{u.creadoEn}</td>
                    <td style={S.td}>
                      <div style={S.acciones}>
                        <button style={S.btnIcon} title="Editar" onClick={() => handleEditar(u)}>
                          <i className="bi bi-pencil"/>
                        </button>
                        <button style={{ ...S.btnIcon, color: u.activo ? '#c98b00' : '#1e8c4a' }}
                          title={u.activo ? 'Desactivar' : 'Activar'} onClick={() => handleToggleActivo(u.id)}>
                          <i className={`bi ${u.activo ? 'bi-person-dash' : 'bi-person-check'}`}/>
                        </button>
                        <button style={{ ...S.btnIcon, color: '#c0272d' }} title="Eliminar" onClick={() => setConfirmDel(u)}>
                          <i className="bi bi-trash3"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={S.cardFooter}>
            <i className="bi bi-info-circle" style={{ marginRight: 6 }}/>
            Las contraseñas se conectarán al backend en la siguiente fase. Los datos actuales son de demostración.
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────
const S = {
  shell:   { display:'flex', flexDirection:'column', minHeight:'100dvh', background:'var(--bg-primary)' },
  topbar:  { height:68, background:'#0d2240', borderBottom:'3px solid #c0272d', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', gap:10, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.18)' },
  topbarLeft:  { display:'flex', alignItems:'center', gap:10 },
  topbarTitle: { fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:900, letterSpacing:3, color:'#c47a2e' },
  topbarSep:   { color:'rgba(255,255,255,0.25)', fontSize:18 },
  topbarSub:   { fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)' },
  topbarRight: { display:'flex', alignItems:'center', gap:10 },
  userInfo:    { display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.75)', fontFamily:"'Rajdhani',sans-serif", fontSize:15 },
  rolBadge:    { background:'rgba(196,122,46,0.25)', color:'#c47a2e', border:'1px solid rgba(196,122,46,0.4)', borderRadius:4, padding:'2px 8px', fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase' },
  btnLogout:   { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', borderRadius:4, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 },
  main:    { flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 },
  toast:      { position:'fixed', top:20, right:20, zIndex:9999, display:'flex', alignItems:'center', padding:'12px 20px', borderRadius:8, fontFamily:"'Rajdhani',sans-serif", fontSize:15, fontWeight:700, boxShadow:'0 4px 16px rgba(0,0,0,0.15)' },
  toastOk:    { background:'rgba(30,140,74,0.12)',  color:'#155a30', border:'1px solid rgba(30,140,74,0.3)'  },
  toastWarn:  { background:'rgba(201,139,0,0.12)',  color:'#7a5000', border:'1px solid rgba(201,139,0,0.3)'  },
  toastError: { background:'rgba(192,39,45,0.12)',  color:'#a01a20', border:'1px solid rgba(192,39,45,0.3)'  },
  overlay:         { position:'fixed', inset:0, background:'rgba(13,34,64,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 },
  modalConfirm:    { background:'#fff', borderRadius:12, padding:'32px 28px', maxWidth:400, width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:12, boxShadow:'0 24px 60px rgba(0,0,0,0.25)', borderTop:'4px solid #c0272d' },
  modalConfirmTitle:{ fontFamily:"'Rajdhani',sans-serif", fontSize:20, fontWeight:700, color:'#1a2533' },
  modalConfirmDesc: { fontFamily:"'Rajdhani',sans-serif", fontSize:15, color:'var(--text-secondary)', textAlign:'center', lineHeight:1.5 },
  modalConfirmBtns: { display:'flex', gap:10, marginTop:8, width:'100%' },
  kpiRow:  { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12 },
  kpiCard: { background:'#fff', border:'1px solid var(--border-color)', borderRadius:8, padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:6, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  kpiVal:  { fontFamily:"'Orbitron',monospace", fontSize:28, fontWeight:700, color:'#1a2533', lineHeight:1 },
  kpiLabel:{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:'var(--text-muted)', textAlign:'center' },
  card:        { background:'#fff', border:'1px solid var(--border-color)', borderRadius:8, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border-color)', background:'var(--bg-card-deep)', flexWrap:'wrap', gap:10 },
  cardHeaderLeft: { display:'flex', alignItems:'center', gap:12 },
  cardTitle:   { fontFamily:"'Share Tech Mono',monospace", fontSize:12, fontWeight:700, letterSpacing:1.5, color:'var(--text-label)', textTransform:'uppercase', display:'flex', alignItems:'center' },
  cardCount:   { fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:'var(--text-muted)', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:20, padding:'2px 10px' },
  cardFooter:  { padding:'10px 20px', borderTop:'1px solid var(--border-color)', background:'var(--bg-card-deep)', fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:'var(--text-muted)', display:'flex', alignItems:'center' },
  formWrap:    { padding:'20px', borderBottom:'1px solid var(--border-color)', background:'rgba(30,111,165,0.03)' },
  formTitle:   { fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, color:'#1a2533', marginBottom:16, display:'flex', alignItems:'center' },
  formGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  fieldGroup:  { display:'flex', flexDirection:'column', gap:5 },
  label:       { fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:700, color:'var(--text-label)', textTransform:'uppercase', letterSpacing:0.5 },
  input:       { background:'#fff', border:'1px solid var(--border-color)', borderRadius:6, padding:'10px 14px', fontFamily:"'Rajdhani',sans-serif", fontSize:15, color:'#1a2533', outline:'none' },
  rolSelector: { display:'flex', gap:8 },
  rolBtn:      { flex:1, padding:'10px', borderRadius:6, fontFamily:"'Rajdhani',sans-serif", fontSize:14, fontWeight:700, border:'2px solid var(--border-color)', background:'var(--bg-card-deep)', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  rolBtnActive:{ background:'#0d2240', borderColor:'#0d2240', color:'#fff' },
  formActions: { display:'flex', gap:10, marginTop:18, justifyContent:'flex-end' },
  filtros:     { display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:'1px solid var(--border-color)', flexWrap:'wrap' },
  searchWrap:  { flex:1, minWidth:200, position:'relative', display:'flex', alignItems:'center' },
  searchIcon:  { position:'absolute', left:12, color:'var(--text-muted)', fontSize:14, pointerEvents:'none' },
  searchInput: { width:'100%', background:'var(--bg-card-deep)', border:'1px solid var(--border-color)', borderRadius:6, padding:'9px 14px 9px 36px', fontFamily:"'Rajdhani',sans-serif", fontSize:15, color:'#1a2533', outline:'none' },
  filtroRoles: { display:'flex', gap:6 },
  filtroBtn:   { padding:'7px 14px', borderRadius:20, fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700, border:'1px solid var(--border-color)', background:'var(--bg-card-deep)', color:'var(--text-muted)', cursor:'pointer' },
  filtroBtnActive: { background:'#0d2240', borderColor:'#0d2240', color:'#fff' },
  tableWrap: { overflowX:'auto' },
  table:     { width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:640 },
  th:        { fontFamily:"'Share Tech Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--text-label)', textTransform:'uppercase', padding:'10px 16px', textAlign:'left', background:'var(--bg-card-deep)', borderBottom:'1px solid var(--border-color)', whiteSpace:'nowrap' },
  trRow:     { borderBottom:'1px solid var(--border-light)' },
  td:        { padding:'12px 16px', fontFamily:"'Rajdhani',sans-serif", fontSize:14, color:'var(--text-secondary)', verticalAlign:'middle' },
  userCell:  { display:'flex', alignItems:'center', gap:10 },
  avatar:    { width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, flexShrink:0 },
  userName:  { fontFamily:"'Rajdhani',sans-serif", fontSize:15, fontWeight:700, color:'#1a2533' },
  rolChip:     { display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:4, fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700 },
  rolChipInsp: { background:'rgba(30,111,165,0.1)',  color:'#145080', border:'1px solid rgba(30,111,165,0.3)' },
  rolChipGer:  { background:'rgba(196,122,46,0.1)',  color:'#9a5e1f', border:'1px solid rgba(196,122,46,0.3)' },
  estadoChip:    { display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontFamily:"'Rajdhani',sans-serif", fontSize:13, fontWeight:700 },
  estadoActivo:  { background:'rgba(30,140,74,0.1)',  color:'#155a30', border:'1px solid rgba(30,140,74,0.3)' },
  estadoInactivo:{ background:'rgba(201,139,0,0.1)',  color:'#7a5000', border:'1px solid rgba(201,139,0,0.3)' },
  dot:       { width:6, height:6, borderRadius:'50%', flexShrink:0 },
  acciones:  { display:'flex', gap:6 },
  btnIcon:   { background:'var(--bg-card-deep)', border:'1px solid var(--border-color)', borderRadius:6, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'var(--text-secondary)' },
  btnPri:    { background:'#0d2240', border:'none', color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, padding:'9px 18px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center' },
  btnSec:    { background:'#fff', border:'1px solid var(--border-color)', color:'var(--text-secondary)', fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, padding:'9px 18px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center' },
  btnDanger: { background:'#c0272d', border:'none', color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, padding:'9px 18px', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
};
