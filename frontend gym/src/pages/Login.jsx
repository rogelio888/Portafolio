import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, User, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resetDemoData } from '../data/db';
import '../styles/Login.css';

const DEMO_CREDENTIALS = [
  { label: 'Administrador', email: 'admin@powerfit.com', password: 'admin123' },
  { label: 'Recepcionista', email: 'recepcion@powerfit.com', password: 'recepcion123' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  const handleResetDemo = () => {
    resetDemoData();
    setEmail('');
    setPassword('');
    setError('');
    setResetMsg('Demo reiniciada. Los datos volvieron a su estado inicial.');
    setTimeout(() => setResetMsg(''), 4000);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo-circle">
            <Dumbbell size={32} className="logo-icon-large" />
          </div>
          <h1>PowerFit</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {resetMsg && (
          <div className="error-message" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
            <RotateCcw size={18} />
            <span>{resetMsg}</span>
          </div>
        )}

        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#60a5fa', marginBottom: '0.5rem' }}>
            Credenciales de prueba (demo sin backend)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillDemo(cred)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '0.5rem 0.7rem', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  <strong>{cred.label}</strong> · {cred.email}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontFamily: 'monospace' }}>{cred.password}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Validando...' : 'Ingresar al Sistema'}
          </button>

          <button
            type="button"
            onClick={handleResetDemo}
            style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', marginTop: '0.9rem', cursor: 'pointer', width: '100%', textAlign: 'center' }}
          >
            ¿Cuenta bloqueada? Reiniciar demo
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
