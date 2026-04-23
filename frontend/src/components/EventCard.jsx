import { useNavigate } from 'react-router-dom';
import { MdLocationOn, MdCalendarToday, MdPeople, MdMoreVert } from 'react-icons/md';
import { format } from 'date-fns';

const categoryColors = {
  conference: '#0ea5e9', workshop: '#10b981', seminar: '#8b5cf6',
  wedding: '#ec4899', birthday: '#f59e0b', corporate: '#6d28d9',
  concert: '#f43f5e', sports: '#38bdf8', other: '#94a3b8'
};

const statusBanners = {
  published: 'var(--gradient-primary)',
  draft: 'linear-gradient(135deg, #475569, #64748b)',
  completed: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  cancelled: 'linear-gradient(135deg, #f43f5e, #dc2626)',
  ongoing: 'linear-gradient(135deg, #10b981, #059669)',
};

export default function EventCard({ event, onEdit, onDelete }) {
  const navigate = useNavigate();
  const catColor = categoryColors[event.category] || '#94a3b8';

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event._id}`)}>
      <div className="event-card-banner" style={{ background: statusBanners[event.status] || statusBanners.published, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} />
      <div className="event-card-body">
        <div className="event-card-category" style={{ color: catColor, textShadow: `0 0 10px ${catColor}40` }}>
          {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}
        </div>
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <div className="event-meta-item">
            <MdCalendarToday size={13} />
            {event.date ? format(new Date(event.date), 'MMM d, yyyy · h:mm a') : 'Date TBD'}
          </div>
          <div className="event-meta-item">
            <MdLocationOn size={13} />
            <span className="truncate" style={{ maxWidth: '180px' }}>{event.venue}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-${event.status}`}>
            {event.status}
          </span>
        </div>
      </div>
      <div className="event-card-footer" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
        <div className="guest-count">
          <MdPeople size={15} style={{ color: 'var(--primary-light)' }} />
          {event.guestCount || 0} guests
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit && onEdit(event)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete && onDelete(event)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
