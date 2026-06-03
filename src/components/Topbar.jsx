// ============================================================
// components/Topbar.jsx — v4
// Logotipo Codelco (isotipo Cu) + mayor contraste
// ============================================================
import { useClock } from '../hooks/useClock';

// Isotipo Codelco SVG (símbolo del cobre Cu en círculo)
function CodelcoLogo() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 34, height: 34, flexShrink: 0 }}>
      {/* Círculo exterior cobre */}
      <circle cx="19" cy="19" r="17.5" stroke="#bb5726" strokeWidth="2.5"/>
      {/* Símbolo Cu */}
      <text x="19" y="25" textAnchor="middle"
        fontFamily="'Gill Sans','Trebuchet MS',sans-serif"
        fontWeight="bold" fontSize="15" fill="#bb5726"
        letterSpacing="-0.5">Cu</text>
    </svg>
  );
}

export default function Topbar({ title, totalPolines, onMenuToggle, hideHamburger, extraRight, usuario, onLogout }) {
  const t = useClock();
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
  const dateStr = t.toLocaleDateString('es-CL');

  return (
    <header className="scada-topbar">
      <div className="topbar-left">
        {/* Hamburguesa mobile */}
        {!hideHamburger && (
          <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Abrir menú">
            <i className="bi bi-list" />
          </button>
        )}



        <span className="topbar-title">{title}</span>
        <span className="tag-badge topbar-badge-hidden">{totalPolines} POLINES</span>
      </div>

      <div className="topbar-right">
        {extraRight}
        <span className="clock-display">
          {timeStr}<span className="clock-date"> | {dateStr}</span>
        </span>
        {usuario && (
          <span style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.75)', fontFamily:'var(--font-ui)', fontSize:14 }}>
            <i className="bi bi-person-circle" style={{ fontSize:16 }}/>
            {usuario.nombre}
            <span style={{ background:'rgba(196,122,46,0.25)', color:'#c47a2e', border:'1px solid rgba(196,122,46,0.4)', borderRadius:4, padding:'2px 8px', fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
              {usuario.rol}
            </span>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.6)', borderRadius:4, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, transition:'all 0.2s' }}
            >
              <i className="bi bi-box-arrow-right"/>
            </button>
          </span>
        )}
        <span className="live-badge">
          <span className="pulse-dot pulse-dot--sm" />
          <span className="live-text">LIVE</span>
        </span>
      </div>
    </header>
  );
}
