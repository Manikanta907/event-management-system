import { MdMenu, MdNotifications, MdSearch } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger btn-icon" onClick={onMenuClick} aria-label="Toggle menu">
          <MdMenu />
        </button>
        <div>
          <div className="navbar-title">{title}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{timeStr}</div>
        </div>
      </div>
      <div className="navbar-right">
        <div style={{
          padding: '0.4rem 0.875rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 6px var(--success)' }} />
          Online
        </div>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--border-radius-sm)',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
          cursor: 'pointer'
        }}>
          {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
