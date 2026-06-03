// ============================================================
// components/Login.jsx
// Pantalla de autenticación — Inspector / Gerente / Soporte
// Usa la paleta y tipografía del proyecto Caserones
// ============================================================
import { useState } from 'react';

// Usuarios de prueba hasta que se conecte un backend real
const USUARIOS_DEMO = [
  { id: 'u1', nombre: 'R. Díaz',    email: 'rdiaz@caserones.cl',    password: '1234', rol: 'inspector' },
  { id: 'u2', nombre: 'P. Araya',   email: 'paraya@caserones.cl',   password: '1234', rol: 'inspector' },
  { id: 'u3', nombre: 'M. Torres',  email: 'mtorres@caserones.cl',  password: '1234', rol: 'inspector' },
  { id: 'u4', nombre: 'J. Fuentes', email: 'jfuentes@caserones.cl', password: '1234', rol: 'inspector' },
  { id: 'u5', nombre: 'C. Vega',    email: 'cvega@caserones.cl',    password: '1234', rol: 'inspector' },
  { id: 'u6', nombre: 'F. Molina',  email: 'fmolina@caserones.cl',  password: '1234', rol: 'inspector' },
  { id: 'g1', nombre: 'Gerencia',   email: 'gerencia@caserones.cl', password: 'admin', rol: 'gerente'   },
  { id: 's1', nombre: 'Soporte',    email: 'soporte@caserones.cl',  password: 'soporte', rol: 'soporte' },
];

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simula latencia de red
    setTimeout(() => {
      const usuario = USUARIOS_DEMO.find(
        u => u.email === email.trim().toLowerCase() && u.password === password
      );

      if (usuario) {
        onLogin(usuario);
      } else {
        setError('Correo o contraseña incorrectos.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={styles.shell}>
      {/* Fondo con patrón sutil */}
      <div style={styles.bg} />

      <div style={styles.card}>
        {/* Header de la tarjeta */}
        <div style={styles.cardHeader}>
          <div style={styles.logoWrap}>
            <svg viewBox="0 0 44 44" width="44" height="44">
              <circle cx="22" cy="22" r="20" fill="none" stroke="#c47a2e" strokeWidth="2.5"/>
              <text x="22" y="29" textAnchor="middle"
                fontFamily="'Gill Sans','Trebuchet MS',sans-serif"
                fontWeight="bold" fontSize="17" fill="#c47a2e">Cu</text>
            </svg>
          </div>
          <div>
            <div style={styles.headerTitle}>CASERONES</div>
            <div style={styles.headerSub}>Lundin Mining — Sistema de Inspección</div>
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <div style={styles.cardBody}>
          <div style={styles.formTitle}>Iniciar sesión</div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <div style={styles.inputWrap}>
                <i className="bi bi-envelope" style={styles.inputIcon}/>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@caserones.cl"
                  required
                  autoComplete="email"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrap}>
                <i className="bi bi-lock" style={styles.inputIcon}/>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...styles.input, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi bi-eye${showPass ? '-slash' : ''}`}/>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 8 }}/>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btnLogin, opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <><span style={styles.spinner}/> Verificando...</>
                : <><i className="bi bi-box-arrow-in-right" style={{ marginRight: 8 }}/> Ingresar</>
              }
            </button>
          </form>

          {/* Hint de demo */}
          <div style={styles.demoHint}>
            <div style={styles.demoTitle}>
              <i className="bi bi-info-circle" style={{ marginRight: 6 }}/>
              Accesos demo
            </div>
            <div style={styles.demoGrid}>
              {[
                { rol: 'Inspector', email: 'rdiaz@caserones.cl',    pass: '1234'    },
                { rol: 'Gerente',   email: 'gerencia@caserones.cl', pass: 'admin'   },
                { rol: 'Soporte',   email: 'soporte@caserones.cl',  pass: 'soporte' },
              ].map(d => (
                <button
                  key={d.rol}
                  type="button"
                  style={styles.demoBtn}
                  onClick={() => { setEmail(d.email); setPassword(d.pass); setError(''); }}
                >
                  <span style={styles.demoRol}>{d.rol}</span>
                  <span style={styles.demoEmail}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.cardFooter}>
          ¿Olvidaste tu contraseña? Contacta a{' '}
          <span style={{ color: '#c47a2e', fontWeight: 700 }}>soporte@caserones.cl</span>
        </div>
      </div>
    </div>
  );
}

// ── Estilos inline (sin depender de clases CSS globales) ──────
const styles = {
  shell: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d2240',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(196,122,46,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(30,111,165,0.1) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
  card: {
    background: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    position: 'relative',
    zIndex: 1,
    borderTop: '4px solid #c47a2e',
  },
  cardHeader: {
    background: '#0d2240',
    padding: '20px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    borderBottom: '3px solid #c0272d',
  },
  logoWrap: { flexShrink: 0 },
  headerTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 4,
    color: '#c47a2e',
    lineHeight: 1.2,
  },
  headerSub: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: '28px 28px 20px',
  },
  formTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    color: '#1a2533',
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: '#5a7080',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#6a7e90',
    fontSize: 16,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    background: '#eaeff5',
    border: '1px solid #cdd5df',
    borderRadius: 6,
    padding: '11px 14px 11px 40px',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 16,
    color: '#1a2533',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    color: '#6a7e90',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    background: 'rgba(192,39,45,0.08)',
    border: '1px solid rgba(192,39,45,0.3)',
    borderRadius: 6,
    padding: '10px 14px',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 14,
    color: '#a01a20',
    display: 'flex',
    alignItems: 'center',
  },
  btnLogin: {
    background: '#c0272d',
    border: 'none',
    borderRadius: 8,
    padding: '13px 20px',
    color: '#fff',
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: 17,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: 0.3,
    transition: 'background 0.2s',
    marginTop: 4,
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTop: '2.5px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginRight: 10,
  },
  demoHint: {
    marginTop: 22,
    background: '#eaeff5',
    border: '1px solid #cdd5df',
    borderRadius: 8,
    padding: '12px 14px',
  },
  demoTitle: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: '#5a7080',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
  },
  demoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  demoBtn: {
    background: '#fff',
    border: '1px solid #cdd5df',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.15s',
    gap: 10,
    textAlign: 'left',
  },
  demoRol: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: '#1e6fa5',
    minWidth: 68,
  },
  demoEmail: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: '#6a7e90',
    flex: 1,
  },
  cardFooter: {
    borderTop: '1px solid #dde3ec',
    padding: '14px 28px',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    color: '#6a7e90',
    background: '#f2f4f7',
    textAlign: 'center',
  },
};
