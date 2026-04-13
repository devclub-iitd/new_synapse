import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Share2, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, isPast } from '../../utils/dateUtils';
import { capitalize, orgDisplayName } from '../../utils/capitalize';
import toast from 'react-hot-toast';
import SharePopup from './SharePopup';
import EventBanner, { useImageFallback } from './EventBanner';
import OrgLogo from './OrgLogo';

const EventCard = ({ event, onRegisterClick, index = 0 }) => {
  const navigate = useNavigate();

  const isRegistered = event.is_registered;
  const eventPassed = isPast(event.date);

  const hasDeadline = !!event.registration_deadline;
  const deadlinePassed = hasDeadline ? isPast(event.registration_deadline) : false;

  const [showSharePopup, setShowSharePopup] = useState(false);
  const { hasImage, onError } = useImageFallback(event.image_url);

  const goToDetail = () => navigate(`/events/${event.id}`);

  const handleShare = (e) => {
    e.stopPropagation();
    setShowSharePopup(true);
  };

  return (
    <div
      className="event-card-v3"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={goToDetail}
    >
      {/* Image Section */}
      <div className="ec3-image-wrapper">
        {hasImage ? (
          <img
            src={event.image_url}
            alt={event.name}
            onError={onError}
          />
        ) : (
          <EventBanner orgName={orgDisplayName(event.organization?.name)} />
        )}
        <div className="ec3-image-overlay" />

        {/* Floating org badge on image */}
        <div className="ec3-org-badge">
          {orgDisplayName(event.organization?.name)}
        </div>

        {/* Share button */}
        <button className="ec3-share-btn" onClick={handleShare} title="Share">
          <Share2 size={14} />
        </button>

        {/* Status indicator */}
        {eventPassed && <div className="ec3-status-pill past">Event Over</div>}
        {!eventPassed && isRegistered && <div className="ec3-status-pill registered">Registered</div>}
      </div>

      {/* Content */}
      <div className="ec3-content">
        <h3 className="ec3-title">{capitalize(event.name)}</h3>

        <div className="ec3-meta-list">
          <div className="ec3-meta-item">
            <Calendar size={14} />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="ec3-meta-item">
            <MapPin size={14} />
            <span>{event.venue}</span>
          </div>
          {hasDeadline && !deadlinePassed && !eventPassed && (
            <div className="ec3-meta-item deadline">
              <Clock size={14} />
              <span>Deadline: {formatDate(event.registration_deadline)}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <button
          className={`ec3-action-btn ${
            eventPassed || isRegistered || deadlinePassed ? 'disabled' : ''
          }`}
          disabled={eventPassed || isRegistered || deadlinePassed}
          onClick={(e) => {
            e.stopPropagation();
            if (!eventPassed && !isRegistered && !deadlinePassed) {
              onRegisterClick(event);
            }
          }}
        >
          <span>
            {eventPassed
              ? "Event Over"
              : isRegistered
                ? "Registered"
                : deadlinePassed
                  ? "Registration Closed"
                  : "Register Now"}
          </span>
          {!eventPassed && !isRegistered && !deadlinePassed && (
            <ArrowRight size={16} />
          )}
        </button>
      </div>

      {/* Hover glow effect */}
      <div className="ec3-glow" />

      {/* Share Popup */}
      <SharePopup
        event={event}
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
      />
    </div>
  );
};

export default EventCard;
