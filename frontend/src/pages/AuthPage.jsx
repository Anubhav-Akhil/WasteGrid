import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Mail, User, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Truck, Globe } from 'lucide-react';
import WasteGridLogo from '../components/WasteGridLogo';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(() => {
    return location.state?.isLogin !== undefined ? location.state.isLogin : true;
  });

  React.useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('citizen');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const redirectUser = (r) => {
    if (r === 'admin') navigate('/admin');
    else if (r === 'driver') navigate('/driver');
    else navigate('/citizen');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isLogin) {
        const u = await login(email, password);
        redirectUser(u.role);
      } else {
        const u = await register(name, email, password, role, vehicleNumber);
        redirectUser(u.role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally { setLoading(false); }
  };

  const autofill = (r) => {
    const c = { 
      admin: ['admin@waste.com','admin123'], 
      driver: ['driver1@waste.com','driver123'],
      citizen: ['citizen@waste.com','citizen123']
    };
    if (c[r]) { setEmail(c[r][0]); setPassword(c[r][1]); }
    setIsLogin(true); setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left: Branding */}
      <div style={{
        flex: '0 0 45%', background: 'var(--bg-dark)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '3rem' }}>
            <WasteGridLogo size={26} color="var(--primary)" />
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>WasteGrid</span>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
            Smart waste collection starts here.
          </h1>
          <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            One platform for municipalities, drivers, and citizens to streamline waste operations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: <Shield size={18} />, text: 'Real-time bin monitoring & analytics' },
              { icon: <Truck size={18} />,  text: 'AI-optimized collection routes' },
              { icon: <Globe size={18} />,  text: 'Public citizen reporting portal' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  {item.icon}
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isLogin ? 'Sign in to access your dashboard.' : 'Register for a new WasteGrid account.'}
            </p>
          </div>

          {/* Tab switch */}
          <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', overflow: 'hidden' }}>
            {['Sign In', 'Register'].map((t, i) => (
              <button key={t} onClick={() => { setIsLogin(i === 0); setError(''); }}
                style={{
                  flex: 1, padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  background: (i === 0 ? isLogin : !isLogin) ? 'var(--primary)' : 'white',
                  color: (i === 0 ? isLogin : !isLogin) ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}>
                {t}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><User size={16} /></span>
                  <input type="text" required className="form-input has-icon-left" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Mail size={16} /></span>
                <input type="email" required className="form-input has-icon-left" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><KeyRound size={16} /></span>
                <input type={showPass ? 'text' : 'password'} required className="form-input has-icon-left has-icon-right" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <span className="input-icon-right" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role</label>
                  <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="citizen">Citizen</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {role === 'driver' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Vehicle Number</label>
                    <div className="input-wrapper">
                      <span className="input-icon-left"><Truck size={16} /></span>
                      <input
                        type="text"
                        required
                        className="form-input has-icon-left"
                        placeholder="e.g. PB-07-AB-1234"
                        value={vehicleNumber}
                        onChange={e => setVehicleNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem' }}>
              {loading
                ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block' }} className="animate-spin" /> Authenticating…</>
                : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Demo Access */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', fontWeight: 600 }}>
              Demo Quick Access
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => autofill('admin')} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Admin</button>
              <button onClick={() => autofill('driver')} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Driver</button>
              <button onClick={() => autofill('citizen')} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Citizen</button>
            </div>
          </div>

          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '1rem', color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
