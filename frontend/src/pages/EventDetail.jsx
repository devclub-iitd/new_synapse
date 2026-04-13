// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import {
//   Calendar,
//   MapPin,
//   ArrowLeft,
//   Clock,
//   Info,
//   Check
// } from "lucide-react";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";
// import { formatDateTime, isPast } from '../utils/dateUtils';

// import EventRegistrationModal from "../components/Forms/EventRegistrationModal";

// const EventDetail = () => {
//   const { eventId } = useParams();
//   const navigate = useNavigate();
//   const { user, openLoginModal } = useAuth();

//   const [event, setEvent] = useState(null);
//   const [error, setError] = useState("");
//   const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

//   useEffect(() => {
//     fetchEvent();
//   }, [eventId]);

//   const fetchEvent = async () => {
//     try {
//       const res = await api.get(`/events/${eventId}`);
//       setEvent(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Event not found");
//     }
//   };

//   const handleRegisterClick = async () => {
//     if (!user) {
//       openLoginModal();
//       return;
//     }

//     // Block past events completely
//     if (eventPassed || deadlinePassed) {
//       toast.error("Registrations are closed for this event");
//       return;
//     }

//     // Deregister
//     if (event.is_registered) {
//       try {
//         await api.delete(`/events/${eventId}/register`);
//         toast.success("Deregistered successfully");
//         fetchEvent();
//       } catch (err) {
//         toast.error("Failed to deregister");
//       }
//       return;
//     }

//     // 🆕 Register
//     setIsRegisterModalOpen(true);
//   };



//   const handleRegistrationSuccess = () => {
//     setIsRegisterModalOpen(false);
//     fetchEvent();
//     toast.success("Registered successfully");
//   };

//   if (error)
//     return (
//       <div className="text-center mt-5 text-danger">
//         {error}
//       </div>
//     );

//   if (!event)
//     return (
//       <div className="text-center mt-5 text-white">
//         Loading...
//       </div>
//     );

//   // Safe deadline handling
//   const hasDeadline = !!event.registration_deadline;
//   const deadlinePassed = hasDeadline
//     ? isPast(event.registration_deadline)
//     : false;

//   const eventPassed = isPast(event.date);


//   return (
//     <div className="container py-5">
//       {/* BACK */}
//       <button
//         onClick={() => navigate(-1)}
//         className="btn-back mb-4"
//       >
//         <ArrowLeft size={18} /> Back to events
//       </button>

//       <div className="row g-4">
//         {/* IMAGE */}
//         <div className="col-md-5 mb-2">
//           <div className="event-detail-image-wrapper">
//             <img
//               src={event.image_url || "https://via.placeholder.com/300x150"}
//               alt={event.name}
//             />
//           </div>
//         </div>

//         {/* DETAILS */}
//         <div className="col-md-7">
//           <span className="badge bg-purple-soft text-purple border-purple px-3 py-2 rounded-pill mb-3 d-inline-block">
//             {event.org_name}
//           </span>

//           <h1 className="fw-bold mb-3" style={{ color: 'var(--text-primary)', fontSize: '2rem', letterSpacing: '-0.5px' }}>
//             {event.name}
//           </h1>

//           {/* META CARDS */}
//           <div className="row g-3 mb-4">
//             <div className="col-md-6">
//               <div className="event-detail-meta-card">
//                 <div className="icon-box-purple">
//                   <Calendar size={20} />
//                 </div>
//                 <div>
//                   <small className="d-block text-uppercase fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
//                     Date & Time
//                   </small>
//                   <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
//                     {formatDateTime(event.date)}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-6">
//               <div className="event-detail-meta-card">
//                 <div className="icon-box-purple">
//                   <MapPin size={20} />
//                 </div>
//                 <div>
//                   <small className="d-block text-uppercase fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
//                     Venue
//                   </small>
//                   <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
//                     {event.venue}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* REGISTRATION DEADLINE */}
//             {hasDeadline && (
//               <div className="col-md-6">
//                 <div className="event-detail-meta-card">
//                   <div className="icon-box-purple">
//                     <Clock size={20} />
//                   </div>
//                   <div>
//                     <small className="d-block text-uppercase fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
//                       Registration Deadline
//                     </small>
//                     <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
//                       {formatDateTime(event.registration_deadline)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ABOUT */}
//           <div className="section-title mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
//             <Info size={18} className="text-purple" /> About Event
//           </div>

//           <div className="event-detail-desc-block mb-4">
//             {event.description}
//           </div>

//           {/* ACTION */}
//           <button
//             className={`btn btn-register-lg ${eventPassed || deadlinePassed || event.is_registered
//                 ? "btn-registered"
//                 : "btn-purple"
//               }`}
//             disabled={eventPassed || deadlinePassed}
//             onClick={handleRegisterClick}
//           >
//             {eventPassed
//               ? "Event Over"
//               : event.is_registered
//                 ? "Deregister"
//                 : deadlinePassed
//                   ? "Registration Closed"
//                   : "Register Now"}
//           </button>
//         </div>
//       </div>

//       {/* MODAL */}
//       <EventRegistrationModal
//         isOpen={isRegisterModalOpen}
//         onClose={() => setIsRegisterModalOpen(false)}
//         eventId={eventId}
//         onSuccess={handleRegistrationSuccess}
//       />
//     </div>
//   );
// };

// export default EventDetail;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarPlus,
  MapPin,
  ArrowLeft,
  Clock,
  Info,
  Share2,
  Users,
  Sparkles,
  Tag,
  Inbox,
  X,
  Check,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { formatDateTime, isPast } from '../utils/dateUtils';
import { capitalize, orgDisplayName } from '../utils/capitalize';
import AnimatedBackground from "../components/UI/AnimatedBackground";
import SharePopup from "../components/UI/SharePopup";
import EventBanner, { useImageFallback } from "../components/UI/EventBanner";
import OrgLogo from "../components/UI/OrgLogo";
import Loader from "../components/UI/Loader";

import EventRegistrationModal from "../components/Forms/EventRegistrationModal";
import CalendarPopup from "../components/UI/CalendarPopup";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const { hasImage, onError } = useImageFallback(event?.image_url);

  useEffect(() => { fetchEvent(); }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
      setError("Event not found");
    }
  };

  const handleRegisterClick = async () => {
    if (!user) { openLoginModal(); return; }
    if (eventPassed || deadlinePassed) {
      toast.error("Registrations are closed for this event");
      return;
    }
    if (event.is_registered) {
      try {
        await api.delete(`/events/${eventId}/register`);
        toast.success("Deregistered successfully");
        fetchEvent();
      } catch (err) {
        toast.error("Failed to deregister");
      }
      return;
    }

    // If request_only or full → open request modal
    if (needsRequest) {
      setIsRequestModalOpen(true);
      return;
    }

    setIsRegisterModalOpen(true);
  };

  const handleRequestSubmit = async () => {
    setSubmittingRequest(true);
    try {
      await api.post(`/events/${eventId}/request`, { form_response: requestText });
      toast.success("Request submitted! Awaiting approval.");
      setIsRequestModalOpen(false);
      setRequestText('');
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setIsRegisterModalOpen(false);
    fetchEvent();
    toast.success("Registered successfully");
  };

  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!event) return <Loader />;

  const hasDeadline = !!event.registration_deadline;
  const deadlinePassed = hasDeadline ? isPast(event.registration_deadline) : false;
  const eventPassed = isPast(event.date);

  const hasCapacity = event.capacity !== null && event.capacity !== undefined;
  const regCount = event.registration_count || 0;
  const slotsLeft = hasCapacity ? Math.max(0, event.capacity - regCount) : null;
  const isFull = hasCapacity && slotsLeft === 0;
  const needsRequest = event.request_only || isFull;
  const userRequestStatus = event.user_request_status; // -1, 0, 1, or null

  return (
    <div className="event-detail-v3">
      <AnimatedBackground />

      <div className="container ed3-container">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="ed3-back-btn">
          <ArrowLeft size={18} />
          <span>Back to events</span>
        </button>

        <div className="ed3-layout">
          {/* Left: Image */}
          <div className="ed3-image-section">
            <div className="ed3-image-card" onClick={() => setShowImagePopup(true)} style={{ cursor: 'pointer' }}>
              {hasImage ? (
                <img
                  src={event.image_url}
                  alt={event.name}
                  onError={onError}
                />
              ) : (
                <EventBanner
                  orgName={orgDisplayName(event.organization?.name)}
                  className="ed3-banner"
                />
              )}
              <div className="ed3-image-glow" />
            </div>
          </div>

          {/* Right: Details */}
          <div className="ed3-details-section">
            <div className="ed3-org-pill">
              {orgDisplayName(event.organization?.name)}
            </div>

            <div className="ed3-title-row">
              <h1 className="ed3-title">{capitalize(event.name)}</h1>
              <div className="d-flex gap-2 align-items-center flex-shrink-0">
                {event.is_registered && (
                  <button
                    className="ed3-share-btn"
                    onClick={() => setShowCalendarPopup(true)}
                    title="Add to calendar"
                  >
                    <CalendarPlus size={18} />
                  </button>
                )}
                <button
                  className="ed3-share-btn"
                  onClick={() => setShowSharePopup(true)}
                  title="Share event"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Meta Cards */}
            <div className="ed3-meta-grid">
              <div className="ed3-meta-card">
                <div className="ed3-meta-icon">
                  <Calendar size={20} />
                </div>
                <div className="ed3-meta-text">
                  <span className="ed3-meta-label">Date & Time</span>
                  <span className="ed3-meta-value">{formatDateTime(event.date)}</span>
                </div>
              </div>

              <div className="ed3-meta-card">
                <div className="ed3-meta-icon">
                  <MapPin size={20} />
                </div>
                <div className="ed3-meta-text">
                  <span className="ed3-meta-label">Venue</span>
                  <span className="ed3-meta-value">{event.venue}</span>
                </div>
              </div>

              {hasDeadline && (
                <div className="ed3-meta-card">
                  <div className="ed3-meta-icon">
                    <Clock size={20} />
                  </div>
                  <div className="ed3-meta-text">
                    <span className="ed3-meta-label">Registration Deadline</span>
                    <span className="ed3-meta-value">{formatDateTime(event.registration_deadline)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <div className="ed3-about">
              <div className="ed3-about-header">
                <Info size={18} />
                <span>About This Event</span>
              </div>
              <div className="ed3-description">
                {event.description}
              </div>
            </div>

            {/* Genres */}
            {event.genres && event.genres.length > 0 && (
              <div className="ed3-genres">
                <div className="ed3-about-header">
                  <Tag size={18} />
                  <span>Genres</span>
                </div>
                <div className="ed3-genre-tags">
                  {event.genres.map(g => (
                    <span key={g} className="ed3-genre-tag">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity / Slots Label */}
            {hasCapacity && !eventPassed && (
              <div className="ed3-slots-info">
                {isFull ? (
                  <span className="ed3-slots-badge full">
                    <Users size={14} /> Event Full — {regCount}/{event.capacity} registered
                  </span>
                ) : slotsLeft <= 5 ? (
                  <span className="ed3-slots-badge low">
                    <Users size={14} /> {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left!
                  </span>
                ) : (
                  <span className="ed3-slots-badge available">
                    <Users size={14} /> {regCount}/{event.capacity} registered
                  </span>
                )}
              </div>
            )}

            {/* Request Status Banner */}
            {userRequestStatus !== null && userRequestStatus !== undefined && !event.is_registered && (
              <div className={`ed3-request-status ${userRequestStatus === 0 ? 'pending' : userRequestStatus === 1 ? 'accepted' : 'rejected'}`}>
                {userRequestStatus === 0 && 'Your request is pending approval'}
                {userRequestStatus === 1 && 'Your request was accepted!'}
                {userRequestStatus === -1 && 'Your request was rejected'}
              </div>
            )}

            {/* Register / Request Button */}
            <button
              className={`ed3-register-btn ${
                eventPassed || deadlinePassed
                  ? 'disabled'
                  : event.is_registered
                    ? 'registered'
                    : needsRequest
                      ? 'request-mode'
                      : ''
              }`}
              disabled={eventPassed || deadlinePassed || (userRequestStatus === 0)}
              onClick={handleRegisterClick}
            >
              <span>
                {eventPassed
                  ? "Event Over"
                  : event.is_registered
                    ? "Deregister"
                    : deadlinePassed
                      ? "Registration Closed"
                      : userRequestStatus === 0
                        ? "Request Pending..."
                        : needsRequest
                          ? "Request to Join"
                          : "Register Now"}
              </span>
              <div className="ed3-btn-shimmer" />
            </button>
          </div>
        </div>
      </div>

      <EventRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        eventId={eventId}
        onSuccess={handleRegistrationSuccess}
      />

      <SharePopup
        event={event}
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
      />

      <CalendarPopup
        event={event}
        isOpen={showCalendarPopup}
        onClose={() => setShowCalendarPopup(false)}
      />

      {/* Request to Join Modal */}
      {isRequestModalOpen && (
        <div className="modal-overlay-v3">
          <div className="modal-card-v3">
            <div className="modal-header-v3">
              <div className="modal-header-left">
                <div className="modal-icon-v3">
                  <Inbox size={20} />
                </div>
                <div>
                  <h3>Request to Join</h3>
                  <p>{event.request_only ? 'This event requires approval to join' : 'Event is full — submit a request'}</p>
                </div>
              </div>
              <button className="modal-close-v3" onClick={() => setIsRequestModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-divider-v3" />
            <div className="modal-body-v3">
              <div className="form-field-v3">
                <label className="form-label-v3">
                  <span className="field-number">1</span>
                  Why do you want to join? <span style={{ color:'var(--text-muted)',fontSize:'0.8rem' }}>(optional)</span>
                </label>
                <div className="input-wrapper-v3">
                  <textarea
                    className="form-input-v3"
                    rows="5"
                    placeholder="Write your message here..."
                    value={requestText}
                    onChange={e => setRequestText(e.target.value)}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                  <div className="input-focus-ring" />
                </div>
              </div>
              <button
                className="submit-btn-v3"
                onClick={handleRequestSubmit}
                disabled={submittingRequest}
              >
                {submittingRequest ? 'Submitting...' : (
                  <>
                    <Check size={18} />
                    <span>Submit Request</span>
                  </>
                )}
                <div className="btn-shimmer" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showImagePopup && (
        <div className="image-popup-overlay" onClick={() => setShowImagePopup(false)}>
          <button className="image-popup-close" onClick={() => setShowImagePopup(false)}>&times;</button>
          <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
            {hasImage ? (
              <img src={event.image_url} alt={event.name} />
            ) : (
              <EventBanner orgName={orgDisplayName(event.organization?.name)} className="image-popup-banner" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;