import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdEvent, MdPeople, MdLogout,
  MdCalendarToday, MdSettings, MdBarChart
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/events', icon: <MdEvent />, label: 'Events' },
  { to: '/guests', icon: <MdPeople />, label: 'All Guests' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎪</div>
          <span className="sidebar-logo-text">EventFlow</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">Main Menu</span>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <span className="nav-section-label" style={{ marginTop: '1rem' }}>Account</span>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            <span className="nav-icon"><MdLogout /></span>
            Logout
          </button>
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Organizer'}</div>
              <div className="user-role">{user?.role || 'organizer'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
