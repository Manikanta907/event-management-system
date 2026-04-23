import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPersonAdd, MdVisibility, MdVisibilityOff, MdEmail, MdLock, MdPerson } from 'react-icons/md';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setErrors({ form: result.message });
  };

  const InputIcon = ({ icon }) => (
    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem', pointerEvents: 'none' }}>
      {icon}
    </span>
  );

  return (
    <div className="auth-page">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="auth-card animate-fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎪</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start managing your events today</p>
        </div>

        {errors.form && <div className="alert alert-error">⚠ {errors.form}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <InputIcon icon={<MdPerson />} />
              <input id="reg-name" type="text" className="form-input" style={{ paddingLeft: '2.5rem' }}
                placeholder="John Doe" value={form.name} onChange={update('name')} />
            </div>
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="reg-email">Email</label>
            <div style={{ position: 'relative' }}>
              <InputIcon icon={<MdEmail />} />
              <input id="reg-email" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com" value={form.email} onChange={update('email')} autoComplete="email" />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <InputIcon icon={<MdLock />} />
                <input id="reg-password" type={showPass ? 'text' : 'password'} className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Min 6 characters" value={form.password} onChange={update('password')} autoComplete="new-password" />
                <button type="button" style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                  onClick={() => setShowPass(p => !p)}>
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required" htmlFor="reg-confirm">Confirm</label>
              <div style={{ position: 'relative' }}>
                <InputIcon icon={<MdLock />} />
                <input id="reg-confirm" type={showPass ? 'text' : 'password'} className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Repeat password" value={form.confirm} onChange={update('confirm')} autoComplete="new-password" />
              </div>
              {errors.confirm && <div className="form-error">{errors.confirm}</div>}
            </div>
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <><div className="spinner spinner-sm" /> Creating account...</> : <><MdPersonAdd /> Create Account</>}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
