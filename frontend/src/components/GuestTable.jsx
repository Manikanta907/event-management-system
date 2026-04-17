import { useState } from 'react';
import { MdSearch, MdDelete, MdEdit, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import RSVPBadge from './RSVPBadge';
import { format } from 'date-fns';

const RSVP_FILTERS = ['all', 'yes', 'no', 'maybe', 'pending'];

export default function GuestTable({ guests = [], onDelete, onEdit, onUpdateRSVP, onToggleCheckIn, loading }) {
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('all');

  const filtered = guests.filter(g => {
    const matchSearch = !search ||
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase());
    const matchRSVP = rsvpFilter === 'all' || g.rsvpStatus === rsvpFilter;
    return matchSearch && matchRSVP;
  });

  return (
    <div>
      {/* Controls */}
      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input
            id="guest-search"
            className="form-input search-input"
            placeholder="Search guests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No guests found</div>
            <div className="empty-state-text">
              {search || rsvpFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first guest to get started'}
            </div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Check-In</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>RSVP Status</th>
                <th>Plus One</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(guest => (
                <tr key={guest._id}>
                  <td>
                    <button
                      className={`btn btn-icon ${guest.checkedIn ? 'btn-success' : 'btn-ghost'}`}
                      title={guest.checkedIn ? 'Checked In' : 'Mark as checked in'}
                      onClick={() => onToggleCheckIn && onToggleCheckIn(guest._id)}
                      style={{ fontSize: '1.1rem' }}
                    >
                      {guest.checkedIn ? <MdCheckCircle /> : <MdRadioButtonUnchecked />}
                    </button>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0
                      }}>
                        {guest.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      {guest.name}
                    </div>
                  </td>
                  <td>{guest.email}</td>
                  <td>{guest.phone || '—'}</td>
                  <td>
                    {onUpdateRSVP ? (
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 2rem 0.3rem 0.6rem', fontSize: '0.78rem', minWidth: '120px' }}
                        value={guest.rsvpStatus}
                        onChange={e => onUpdateRSVP(guest._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Going</option>
                        <option value="no">Not Going</option>
                        <option value="maybe">Maybe</option>
                      </select>
                    ) : (
                      <RSVPBadge status={guest.rsvpStatus} />
                    )}
                  </td>
                  <td>
                    {guest.plusOne ? (
                      <span className="badge badge-yes">+1</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {guest.createdAt ? format(new Date(guest.createdAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => onEdit && onEdit(guest)}>
                        <MdEdit />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Remove" onClick={() => onDelete && onDelete(guest._id)}>
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

      {/* Footer count */}
      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        Showing {filtered.length} of {guests.length} guests
      </div>
    </div>
  );
}
