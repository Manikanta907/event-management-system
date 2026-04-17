import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import RSVPBadge from '../components/RSVPBadge';
import { MdSearch, MdPeople, MdDelete, MdEdit, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { format } from 'date-fns';

const RSVP_FILTERS = ['all', 'yes', 'no', 'maybe', 'pending'];

export default function GuestList() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('all');
  const [totalStats, setTotalStats] = useState({ total: 0, yes: 0, no: 0, maybe: 0, pending: 0 });

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (rsvpFilter !== 'all') params.rsvpStatus = rsvpFilter;
      if (search) params.search = search;
      const { data } = await api.get('/guests', { params });
      const list = data.data || [];
      setGuests(list);

      // Compute stats client-side
      const stats = { total: list.length, yes: 0, no: 0, maybe: 0, pending: 0 };
      list.forEach(g => { if (stats[g.rsvpStatus] !== undefined) stats[g.rsvpStatus]++; });
      setTotalStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [rsvpFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchGuests, 300);
    return () => clearTimeout(t);
  }, [fetchGuests]);

  const handleUpdateRSVP = async (guestId, rsvpStatus) => {
    await api.put(`/guests/${guestId}`, { rsvpStatus });
    fetchGuests();
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    await api.delete(`/guests/${guestId}`);
    fetchGuests();
  };

  const handleToggleCheckIn = async (guestId) => {
    await api.patch(`/guests/${guestId}/checkin`);
    fetchGuests();
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Guests</h1>
          <p className="page-subtitle">Manage guests across all your events</p>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Total', value: totalStats.total, color: '#7c3aed' },
          { key: 'yes', label: 'Going', value: totalStats.yes, color: '#10b981' },
          { key: 'no', label: 'Declined', value: totalStats.no, color: '#ef4444' },
          { key: 'maybe', label: 'Maybe', value: totalStats.maybe, color: '#f59e0b' },
          { key: 'pending', label: 'Pending', value: totalStats.pending, color: '#6b7280' },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setRsvpFilter(s.key)}
            style={{
              padding: '0.75rem 1.25rem',
              background: rsvpFilter === s.key ? `${s.color}22` : 'var(--bg-card)',
              border: `1px solid ${rsvpFilter === s.key ? s.color : 'var(--border)'}`,
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              textAlign: 'center',
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input
            id="guest-list-search"
            className="form-input search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {RSVP_FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${rsvpFilter === f ? 'active' : ''}`}
            onClick={() => setRsvpFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : guests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><MdPeople /></div>
              <div className="empty-state-title">No guests found</div>
              <div className="empty-state-text">Add guests through individual event pages</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Check-In</th>
                  <th>Guest</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>RSVP</th>
                  <th>+1</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(g => (
                  <tr key={g._id}>
                    <td>
                      <button
                        className={`btn btn-icon btn-sm ${g.checkedIn ? 'btn-success' : 'btn-ghost'}`}
                        onClick={() => handleToggleCheckIn(g._id)}
                        title={g.checkedIn ? 'Checked in' : 'Mark checked in'}
                        style={{ fontSize: '1.1rem' }}
                      >
                        {g.checkedIn ? <MdCheckCircle /> : <MdRadioButtonUnchecked />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {g.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</span>
                      </div>
                    </td>
                    <td>{g.email}</td>
                    <td>
                      {g.event ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>{g.event.title}</span>
                      ) : '—'}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 2rem 0.3rem 0.6rem', fontSize: '0.78rem', minWidth: '120px' }}
                        value={g.rsvpStatus}
                        onChange={e => handleUpdateRSVP(g._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Going</option>
                        <option value="no">Not Going</option>
                        <option value="maybe">Maybe</option>
                      </select>
                    </td>
                    <td>{g.plusOne ? <span className="badge badge-yes">+1</span> : '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {g.createdAt ? format(new Date(g.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-danger btn-sm btn-icon" title="Remove" onClick={() => handleDelete(g._id)}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
