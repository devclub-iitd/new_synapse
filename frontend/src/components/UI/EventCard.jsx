import React from 'react';
import { Calendar, MapPin, ExternalLink, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, isPast } from '../../utils/dateUtils';
import { capitalize } from '../../utils/capitalize';
import toast from 'react-hot-toast';

const EventCard = ({ event, onRegisterClick }) => {
  const navigate = useNavigate();

  const isRegistered = event.is_registered;
  const eventPassed = isPast(event.date);


  const hasDeadline = !!event.registration_deadline;
  const deadlinePassed = hasDeadline
    ? isPast(event.registration_deadline)
    : false;

  const goToDetail = () => {
    navigate(`/events/${event.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator.share({ title: event.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="col-md-4 mb-4">
      <div
        className="card event-card h-100 p-3 cursor-pointer"
        onClick={goToDetail}
      >
        <img
          src={event.image_url || "https://via.placeholder.com/300x150"}
          className="card-img-top rounded-4 mb-3"
          alt="event"
        />

        <div className="card-body p-0">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <div className="card-org-badge">
              {capitalize(event.organization?.name)}
            </div>
            <button className="btn-share-sm" onClick={handleShare} title="Share event">
              <Share2 size={14} />
            </button>
          </div>

          <h5 className="card-title fw-bold" style={{ color: 'var(--text-primary)' }}>
            {capitalize(event.name)}
          </h5>

          <div className="card-meta-row">
            <Calendar size={14} />
            {formatDate(event.date)}
          </div>

          <div className="card-meta-row mb-3">
            <MapPin size={14} />
            {event.venue}
          </div>

          {hasDeadline && (
            <p className="small mb-2" style={{ color: 'var(--text-muted)' }}>
              Register by:{" "}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {formatDate(event.registration_deadline)}
              </strong>
            </p>
          )}

          <button
            className={`btn w-100 d-flex align-items-center justify-content-center gap-2 ${eventPassed || isRegistered || deadlinePassed
                ? "btn-registered"
                : "btn-purple"
              }`}
            disabled={eventPassed || isRegistered || deadlinePassed}
            onClick={(e) => {
              e.stopPropagation();
              if (!eventPassed && !isRegistered && !deadlinePassed) {
                onRegisterClick(event);
              }
            }}
          >
            {eventPassed
              ? "Event Over"
              : isRegistered
                ? "Registered"
                : deadlinePassed
                  ? "Registration Closed"
                  : "Register"}
            {!eventPassed && !isRegistered && !deadlinePassed && (
              <ExternalLink size={16} />
            )}
          </button>


        </div>
      </div>
    </div>
  );
};

export default EventCard;
