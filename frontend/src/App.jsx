import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import GuestList from './pages/GuestList';
import Login from './pages/Login';
import Register from './pages/Register';

// Route titles
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/guests': 'All Guests',
};

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const getTitle = () => {
    const path = window.location.pathname;
    if (path.startsWith('/events/')) return 'Event Details';
    return PAGE_TITLES[path] || 'EventFlow';
  };

  return (
    <div className="app-layout">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar title={getTitle()} onMenuClick={() => setSidebarOpen(s => !s)} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/guests" element={<GuestList />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AuthLayout() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={user ? <ProtectedLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
