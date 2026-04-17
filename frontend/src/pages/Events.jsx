import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import { MdAdd, MdSearch, MdFilterList, MdRefresh, MdDelete } from 'react-icons/md';

const CATEGORIES = ['conference', 'workshop', 'seminar', 'wedding', 'birthday', 'corporate', 'concert', 'sports', 'other'];
const STATUSES = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];

const EMPTY_FORM = {
  title: '', description: '', dateOnly: '', timeOnly: '09:00',
  endDateOnly: '', endTimeOnly: '', venue: '',
  category: 'other', status: 'published', capacity: 100, tags: '', isPublic: true,
  schedule: []
};

// Build ISO date string from separate date+time fields
const buildDate = (dateOnly, timeOnly) => {
  if (!dateOnly) return '';
  return `${dateOnly}T${timeOnly || '00:00'}:00.000Z`;
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') openCreate();
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await api.get('/events', { params });
      setEvents(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 350);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    const d = event.date ? new Date(event.date) : null;
    const ed = event.endDate ? new Date(event.endDate) : null;
    setForm({
      title: event.title || '',
      description: event.description || '',
      dateOnly: d ? d.toISOString().slice(0,10) : '',
      timeOnly: d ? d.toISOString().slice(11,16) : '09:00',
      endDateOnly: ed ? ed.toISOString().slice(0,10) : '',
      endTimeOnly: ed ? ed.toISOString().slice(11,16) : '',
      venue: event.venue || '',
      category: event.category || 'other',
      status: event.status || 'published',
      capacity: event.capacity || 100,
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : '',
      isPublic: event.isPublic !== false,
      schedule: event.schedule || [],
    });
    setFormError('');
    setModalOpen(true);
  };

  const quickFill = (title, venue, category) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const dateStr = tomorrow.toISOString().slice(0,10);
    setForm(p => ({ ...p, title, venue, category, dateOnly: dateStr, timeOnly: '09:00', status: 'published', capacity: 100, schedule: [] }));
  };

  const addScheduleItem = () => {
    setForm(p => ({ ...p, schedule: [...p.schedule, { time: '', title: '', description: '', duration: 30 }] }));
  };

  const updateScheduleItem = (index, field, value) => {
    const newSchedule = [...form.schedule];
    newSchedule[index][field] = value;
    setForm(p => ({ ...p, schedule: newSchedule }));
  };

  const removeScheduleItem = (index) => {
    const newSchedule = [...form.schedule];
    newSchedule.splice(index, 1);
    setForm(p => ({ ...p, schedule: newSchedule }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setFormError('Title is required');
    if (!form.dateOnly) return setFormError('Date is required');
    if (!form.venue.trim()) return setFormError('Venue is required');

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        date: buildDate(form.dateOnly, form.timeOnly),
        endDate: form.endDateOnly ? buildDate(form.endDateOnly, form.endTimeOnly) : undefined,
        venue: form.venue,
        category: form.category,
        status: form.status,
        capacity: parseInt(form.capacity) || 100,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isPublic: form.isPublic,
        schedule: form.schedule
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    try {
      await api.delete(`/events/${event._id}`);
      setDeleteConfirm(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const updateForm = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [field]: val }));
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={fetchEvents} title="Refresh">
            <MdRefresh />
          </button>
          <button id="create-event-btn" className="btn btn-primary" onClick={openCreate}>
            <MdAdd /> New Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input
            id="event-search"
            className="form-input search-input"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select id="event-status-filter" className="form-select" style={{ maxWidth: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select id="event-category-filter" className="form-select" style={{ maxWidth: 150 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        {(statusFilter || categoryFilter || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Loading events...</span></div>
      ) : events.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          <div className="empty-state-icon">🎪</div>
          <div className="empty-state-title">No events found</div>
          <div className="empty-state-text">
            {search || statusFilter || categoryFilter ? 'Try different filters' : 'Create your first event to get started'}
          </div>
          {!search && !statusFilter && !categoryFilter && (
            <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Create Event</button>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard key={event._id} event={event} onEdit={openEdit} onDelete={setDeleteConfirm} />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button id="save-event-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner spinner-sm" /> Saving...</> : editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </>
        }
      >
        {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠ {formError}</div>}

        {/* Quick Fill Buttons */}
        {!editingEvent && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick fill:</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost btn-sm" id="quickfill-conference" onClick={() => quickFill('Tech Summit 2025', 'Grand Convention Center, New York', 'conference')}>🎤 Conference</button>
              <button type="button" className="btn btn-ghost btn-sm" id="quickfill-workshop" onClick={() => quickFill('Design Workshop', 'Innovation Hub, Austin', 'workshop')}>🎨 Workshop</button>
              <button type="button" className="btn btn-ghost btn-sm" id="quickfill-corporate" onClick={() => quickFill('Product Launch Party', 'Rooftop Lounge, Downtown', 'corporate')}>🚀 Corporate</button>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label required" htmlFor="event-title">Event Title</label>
            <input id="event-title" className="form-input" placeholder="e.g. Annual Tech Conference 2025" value={form.title} onChange={updateForm('title')} />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="event-date">Start Date</label>
            <input id="event-date" type="date" className="form-input" value={form.dateOnly} onChange={updateForm('dateOnly')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-time">Start Time</label>
            <input id="event-time" type="time" className="form-input" value={form.timeOnly} onChange={updateForm('timeOnly')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-end-date">End Date (optional)</label>
            <input id="event-end-date" type="date" className="form-input" value={form.endDateOnly} onChange={updateForm('endDateOnly')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-end-time">End Time</label>
            <input id="event-end-time" type="time" className="form-input" value={form.endTimeOnly} onChange={updateForm('endTimeOnly')} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label required" htmlFor="event-venue">Venue / Location</label>
            <input id="event-venue" className="form-input" placeholder="e.g. Grand Ballroom, New York" value={form.venue} onChange={updateForm('venue')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-category">Category</label>
            <select id="event-category" className="form-select" value={form.category} onChange={updateForm('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-status">Status</label>
            <select id="event-status" className="form-select" value={form.status} onChange={updateForm('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-capacity">Capacity</label>
            <input id="event-capacity" type="number" className="form-input" min="1" value={form.capacity} onChange={updateForm('capacity')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-tags">Tags (comma-separated)</label>
            <input id="event-tags" className="form-input" placeholder="networking, tech, 2025" value={form.tags} onChange={updateForm('tags')} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="event-description">Description</label>
            <textarea id="event-description" className="form-textarea" placeholder="Describe your event..." value={form.description} onChange={updateForm('description')} />
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Event Schedule (Optional)</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addScheduleItem}><MdAdd /> Add Item</button>
            </div>
            
            {form.schedule.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {form.schedule.map((item, index) => (
                  <div key={index} style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', position: 'relative' }}>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--danger)' }} onClick={() => removeScheduleItem(index)}>
                      <MdDelete />
                    </button>
                    <div className="form-row" style={{ gridTemplateColumns: '120px 1fr' }}>
                      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Time</label>
                        <input className="form-input" style={{ padding: '0.5rem' }} placeholder="09:00 AM" value={item.time} onChange={(e) => updateScheduleItem(index, 'time', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Title</label>
                        <input className="form-input" style={{ padding: '0.5rem' }} placeholder="Keynote Speech" value={item.title} onChange={(e) => updateScheduleItem(index, 'title', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                        <input className="form-input" style={{ padding: '0.5rem' }} placeholder="Brief overview..." value={item.description} onChange={(e) => updateScheduleItem(index, 'description', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', border: '1px dashed var(--border)' }}>
                 No schedule items added. Click "Add Item" to build the agenda.
               </div>
            )}
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.isPublic} onChange={updateForm('isPublic')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
              Public event
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Event"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button id="confirm-delete-btn" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Event</button>
          </>
        }
      >
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteConfirm?.title}"</strong>?</p>
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            ⚠ This will also delete all associated guests and cannot be undone.
          </div>
        </div>
      </Modal>
    </div>
  );
}
