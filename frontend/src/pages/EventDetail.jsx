import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GuestTable from '../components/GuestTable';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  MdArrowBack, MdAdd, MdLocationOn, MdCalendarToday,
  MdPeople, MdCheckCircle, MdCancel, MdSchedule, MdEdit
} from 'react-icons/md';
import { format } from 'date-fns';

const EMPTY_GUEST = { name: '', email: '', phone: '', rsvpStatus: 'pending', plusOne: false, dietaryRestrictions: '', notes: '' };

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [guestStats, setGuestStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [guestForm, setGuestForm] = useState(EMPTY_GUEST);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [evtRes, guestRes, statsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/guests?event=${id}`),
        api.get(`/guests/stats/${id}`)
      ]);
      setEvent(evtRes.data.data);
      setGuests(guestRes.data.data || []);
      setGuestStats(statsRes.data.data);
    } catch {
      navigate('/events');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAddGuest = () => {
    setEditGuest(null);
    setGuestForm(EMPTY_GUEST);
    setFormError('');
    setAddGuestOpen(true);
  };

  const openEditGuest = (guest) => {
    setEditGuest(guest);
    setGuestForm({
      name: guest.name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      rsvpStatus: guest.rsvpStatus || 'pending',
      plusOne: guest.plusOne || false,
      dietaryRestrictions: guest.dietaryRestrictions || '',
      notes: guest.notes || '',
    });
    setFormError('');
    setAddGuestOpen(true);
  };

  const handleSaveGuest = async () => {
    if (!guestForm.name.trim()) return setFormError('Name is required');
    if (!guestForm.email.trim()) return setFormError('Email is required');

    setSaving(true);
    setFormError('');
    try {
      if (editGuest) {
        await api.put(`/guests/${editGuest._id}`, guestForm);
      } else {
        await api.post('/guests', { ...guestForm, event: id });
      }
      setAddGuestOpen(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save guest');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    await api.delete(`/guests/${guestId}`);
    fetchAll();
  };

  const handleUpdateRSVP = async (guestId, rsvpStatus) => {
    await api.put(`/guests/${guestId}`, { rsvpStatus });
    fetchAll();
  };

  const handleToggleCheckIn = async (guestId) => {
    await api.patch(`/guests/${guestId}/checkin`);
    fetchAll();
  };

  const updateGuest = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setGuestForm(p => ({ ...p, [field]: val }));
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-center"><div className="spinner" /><span>Loading event...</span></div>
    </div>
  );

  if (!event) return null;

  return (
    <div className="page-container animate-fade-in">
      {/* Back + Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate('/events')}>
          <MdArrowBack /> Back to Events
        </button>
        <div className="page-header">
          <div>
            <span className={`badge badge-${event.category}`} style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
              {event.category}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{event.title}</h1>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div className="event-meta-item">
                <MdCalendarToday size={14} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy · h:mm a')}
                </span>
              </div>
              <div className="event-meta-item">
                <MdLocationOn size={14} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{event.venue}</span>
              </div>
              <div className="event-meta-item">
                <MdPeople size={14} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Capacity: {event.capacity}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate(`/events?edit=${id}`)}>
              <MdEdit /> Edit Event
            </button>
            <button id="add-guest-btn" className="btn btn-primary" onClick={openAddGuest}>
              <MdAdd /> Add Guest
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{event.description}</p>
        </div>
      )}

      {/* RSVP Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Total Guests" value={guestStats?.total} icon={<MdPeople />} color="linear-gradient(135deg, #7c3aed, #a855f7)" iconBg="rgba(124,58,237,0.15)" />
        <StatCard label="Confirmed" value={guestStats?.yes} icon={<MdCheckCircle />} color="linear-gradient(135deg, #10b981, #34d399)" iconBg="rgba(16,185,129,0.15)" />
        <StatCard label="Declined" value={guestStats?.no} icon={<MdCancel />} color="linear-gradient(135deg, #ef4444, #f87171)" iconBg="rgba(239,68,68,0.15)" />
        <StatCard label="Maybe" value={guestStats?.maybe} icon={<MdSchedule />} color="linear-gradient(135deg, #f59e0b, #fbbf24)" iconBg="rgba(245,158,11,0.15)" />
        <StatCard label="Checked In" value={guestStats?.checkedIn} icon={<MdCheckCircle />} color="linear-gradient(135deg, #06b6d4, #22d3ee)" iconBg="rgba(6,182,212,0.15)" />
      </div>

      {/* Schedule */}
      {event.schedule?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title"><MdSchedule style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} /> Event Schedule</h3>
          </div>
          <div>
            {event.schedule.map((item, i) => (
              <div key={i} className="schedule-item">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-dot" />
                <div className="schedule-content">
                  <div className="schedule-title">{item.title}</div>
                  {item.description && <div className="schedule-desc">{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><MdPeople style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} /> Guest List</h3>
          <button className="btn btn-primary btn-sm" onClick={openAddGuest}>
            <MdAdd /> Add Guest
          </button>
        </div>
        <GuestTable
          guests={guests}
          onDelete={handleDeleteGuest}
          onEdit={openEditGuest}
          onUpdateRSVP={handleUpdateRSVP}
          onToggleCheckIn={handleToggleCheckIn}
          loading={guestLoading}
        />
      </div>

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={addGuestOpen}
        onClose={() => setAddGuestOpen(false)}
        title={editGuest ? 'Edit Guest' : 'Add New Guest'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddGuestOpen(false)}>Cancel</button>
            <button id="save-guest-btn" className="btn btn-primary" onClick={handleSaveGuest} disabled={saving}>
              {saving ? <><div className="spinner spinner-sm" /> Saving...</> : editGuest ? 'Update Guest' : 'Add Guest'}
            </button>
          </>
        }
      >
        {formError && <div className="alert alert-error">⚠ {formError}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Full Name</label>
            <input className="form-input" placeholder="Jane Doe" value={guestForm.name} onChange={updateGuest('name')} />
          </div>
          <div className="form-group">
            <label className="form-label required">Email</label>
            <input type="email" className="form-input" placeholder="jane@example.com" value={guestForm.email} onChange={updateGuest('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="+1 (555) 000-0000" value={guestForm.phone} onChange={updateGuest('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">RSVP Status</label>
            <select className="form-select" value={guestForm.rsvpStatus} onChange={updateGuest('rsvpStatus')}>
              <option value="pending">Pending</option>
              <option value="yes">Going</option>
              <option value="no">Not Going</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Dietary Restrictions</label>
            <input className="form-input" placeholder="Vegetarian, gluten-free, etc." value={guestForm.dietaryRestrictions} onChange={updateGuest('dietaryRestrictions')} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="Any additional notes..." value={guestForm.notes} onChange={updateGuest('notes')} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={guestForm.plusOne} onChange={updateGuest('plusOne')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
              Bringing a plus one
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
