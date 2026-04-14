import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Share2, Clock, ArrowRight, Radio, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, isPast } from '../../utils/dateUtils';
import { capitalize, orgDisplayName } from '../../utils/capitalize';
import toast from 'react-hot-toast';
import SharePopup from './SharePopup';
import EventBanner, { useImageFallback } from './EventBanner';
import OrgLogo from './OrgLogo';

const EventCard = ({ event, onRegisterClick, onRequestClick, index = 0 }) => {
  const navigate = useNavigate();

  const isRegistered = event.is_registered;
  const eventPassed = isPast(event.date);

  const hasDeadline = !!event.registration_deadline;
  const deadlinePassed = hasDeadline ? isPast(event.registration_deadline) : false;

  const hasCapacity = event.capacity !== null && event.capacity !== undefined;
  const regCount = event.registration_count || 0;
  const slotsLeft = hasCapacity ? Math.max(0, event.capacity - regCount) : null;
  const isFull = hasCapacity && slotsLeft === 0;
  const needsRequest = event.request_only || isFull;
  const userRequestStatus = event.user_request_status;

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
        {event.is_live && <span className="ec3-live-tag"><Radio size={10} /> LIVE</span>}

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
            eventPassed || isRegistered || deadlinePassed || userRequestStatus === 0
              ? 'disabled'
              : needsRequest && !isRegistered
                ? 'request-mode'
                : ''
          }`}
          disabled={eventPassed || isRegistered || deadlinePassed || userRequestStatus === 0}
          onClick={(e) => {
            e.stopPropagation();
            if (eventPassed || isRegistered || deadlinePassed || userRequestStatus === 0) return;
            if (needsRequest) {
              onRequestClick(event);
            } else {
              onRegisterClick(event);
            }
          }}
        >
          <span>
            {eventPassed
              ? "Event Over"
              : isRegistered
                ? "Registered"
                : userRequestStatus === 0
                  ? "Request Pending"
                  : deadlinePassed
                    ? "Registration Closed"
                    : needsRequest
                      ? "Request to Join"
                      : "Register Now"}
          </span>
          {!eventPassed && !isRegistered && !deadlinePassed && userRequestStatus !== 0 && (
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
