import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import EventCard from '../components/EventCard';
import {
  MdEvent, MdPeople, MdCheckCircle, MdCancel,
  MdSchedule, MdTrendingUp, MdAdd
} from 'react-icons/md';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const RSVP_COLORS = {
  going: '#10b981',
  declined: '#f43f5e',
  maybe: '#f59e0b',
  pending: '#94a3b8'
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/events/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const pieData = stats ? [
    { name: 'Going', value: stats.guests.confirmed },
    { name: 'Declined', value: stats.guests.declined },
    { name: 'Maybe', value: stats.guests.maybe },
    { name: 'Pending', value: stats.guests.pending },
  ] : [];

  const pieColors = ['#10b981', '#f43f5e', '#f59e0b', '#94a3b8'];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-center">
          <div className="spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ color: 'var(--text-muted)', fontsize: '0.875rem', marginBottom: '0.25rem' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Organizer'} 👋
          </p>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Here's what's happening with your events</p>
        </div>
        <button id="dashboard-create-event" className="btn btn-primary" onClick={() => navigate('/events?new=1')}>
          <MdAdd /> Create Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Events"
          value={stats?.events.total}
          icon={<MdEvent />}
          color="linear-gradient(135deg, #7c3aed, #a855f7)"
          iconBg="rgba(124,58,237,0.15)"
        />
        <StatCard
          label="Upcoming Events"
          value={stats?.events.upcoming}
          icon={<MdSchedule />}
          color="linear-gradient(135deg, #06b6d4, #22d3ee)"
          iconBg="rgba(6,182,212,0.15)"
        />
        <StatCard
          label="Total Guests"
          value={stats?.guests.total}
          icon={<MdPeople />}
          color="linear-gradient(135deg, #f59e0b, #fbbf24)"
          iconBg="rgba(245,158,11,0.15)"
        />
        <StatCard
          label="Confirmed RSVPs"
          value={stats?.guests.confirmed}
          icon={<MdCheckCircle />}
          color="linear-gradient(135deg, #10b981, #34d399)"
          iconBg="rgba(16,185,129,0.15)"
        />
        <StatCard
          label="Declined"
          value={stats?.guests.declined}
          icon={<MdCancel />}
          color="linear-gradient(135deg, #ef4444, #f87171)"
          iconBg="rgba(239,68,68,0.15)"
        />
        <StatCard
          label="Pending RSVPs"
          value={stats?.guests.pending}
          icon={<MdTrendingUp />}
          color="linear-gradient(135deg, #6b7280, #9ca3af)"
          iconBg="rgba(107,114,128,0.15)"
        />
      </div>

      {/* Charts + Recent Events */}
      <div className="dashboard-grid">
        {/* Charts Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* RSVP Pie Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">RSVP Breakdown</h3>
              <span className="badge badge-pending">{stats?.guests.total || 0} total</span>
            </div>
            {stats?.guests.total > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-text">No RSVP data yet</div>
              </div>
            )}
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: pieColors[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>

          {/* Event Status Bar */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Event Status Overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[
                { name: 'Total', value: stats?.events.total || 0, fill: '#8b5cf6' },
                { name: 'Upcoming', value: stats?.events.upcoming || 0, fill: '#0ea5e9' },
                { name: 'Completed', value: stats?.events.completed || 0, fill: '#10b981' },
              ]} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[{ fill: '#8b5cf6' }, { fill: '#0ea5e9' }, { fill: '#10b981' }].map((item, index) => (
                    <Cell key={index} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events Column */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <h3 className="card-title">Recent Events</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View all</button>
            </div>
            {stats?.recentEvents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.recentEvents.map(event => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    style={{
                      padding: '0.875rem',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{event.title}</span>
                      <span className={`badge badge-${event.status}`} style={{ fontSize: '0.65rem' }}>{event.status}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                      <span>{event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBD'}</span>
                      <span>·</span>
                      <span>{event.guestCount || 0} guests</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-title">No events yet</div>
                <div className="empty-state-text">Create your first event to get started</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/events?new=1')}>
                  <MdAdd /> Create Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
