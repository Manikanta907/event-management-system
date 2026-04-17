import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdLogin, MdVisibility, MdVisibilityOff, MdEmail, MdLock } from 'react-icons/md';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else setErrors({ form: result.message });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card animate-fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎪</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to manage your events</p>
        </div>

        {errors.form && (
          <div className="alert alert-error">⚠ {errors.form}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="login-email">Email</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <><div className="spinner spinner-sm" /> Signing in...</> : <><MdLogin /> Sign In</>}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create one</Link>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Credentials</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Register a new account to get started
          </div>
        </div>
      </div>
    </div>
  );
}
