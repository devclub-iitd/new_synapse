import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Clock,
  Info,
  Check
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { formatDateTime, isPast } from '../utils/dateUtils';

import EventRegistrationModal from "../components/Forms/EventRegistrationModal";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

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
    if (!user) {
      openLoginModal();
      return;
    }

    // ❌ Block past events completely
    if (eventPassed || deadlinePassed) {
      toast.error("Registrations are closed for this event");
      return;
    }

    // 🔄 Deregister
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

    // 🆕 Register
    setIsRegisterModalOpen(true);
  };



  const handleRegistrationSuccess = () => {
    setIsRegisterModalOpen(false);
    fetchEvent();
    toast.success("Registered successfully");
  };

  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        {error}
      </div>
    );

  if (!event)
    return (
      <div className="text-center mt-5 text-white">
        Loading...
      </div>
    );

  // ✅ SAFE DEADLINE HANDLING
  const hasDeadline = !!event.registration_deadline;
  const deadlinePassed = hasDeadline
    ? isPast(event.registration_deadline)
    : false;

  const eventPassed = isPast(event.date);


  return (
    <div className="container py-5">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="btn-back mb-4"
      >
        <ArrowLeft size={18} /> Back to events
      </button>

      <div className="row g-4">
        {/* IMAGE */}
        <div className="col-md-5 mb-2">
          <div className="event-detail-image-wrapper">
            <img
              src={event.image_url || "https://via.placeholder.com/300x150"}
              alt={event.name}
            />
          </div>
        </div>

        {/* DETAILS */}
        <div className="col-md-7">
          <span className="badge bg-purple-soft text-purple border-purple px-3 py-2 rounded-pill mb-3 d-inline-block">
            {event.org_name}
          </span>

          <h1 className="fw-bold mb-3" style={{ color: 'var(--text-primary)', fontSize: '2rem', letterSpacing: '-0.5px' }}>
            {event.name}
          </h1>

          {/* META CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="event-detail-meta-card">
                <div className="icon-box-purple">
                  <Calendar size={20} />
                </div>
                <div>
                  <small className="d-block text-uppercase fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Date & Time
                  </small>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {formatDateTime(event.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="event-detail-meta-card">
                <div className="icon-box-purple">
                  <MapPin size={20} />
                </div>
                <div>
                  <small className="d-block text-uppercase fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    Venue
                  </small>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* REGISTRATION DEADLINE */}
            {hasDeadline && (
              <div className="col-md-6">
                <div className="event-detail-meta-card">
                  <div className="icon-box-purple">
                    <Clock size={20} />
                  </div>
                  <div>
                    <small className="d-block text-uppercase fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      Registration Deadline
                    </small>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {formatDateTime(event.registration_deadline)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ABOUT */}
          <div className="section-title mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Info size={18} className="text-purple" /> About Event
          </div>

          <div className="event-detail-desc-block mb-4">
            {event.description}
          </div>

          {/* ACTION */}
          <button
            className={`btn btn-register-lg ${eventPassed || deadlinePassed || event.is_registered
                ? "btn-registered"
                : "btn-purple"
              }`}
            disabled={eventPassed || deadlinePassed}
            onClick={handleRegisterClick}
          >
            {eventPassed
              ? "Event Over"
              : event.is_registered
                ? "Deregister"
                : deadlinePassed
                  ? "Registration Closed"
                  : "Register Now"}
          </button>
        </div>
      </div>

      {/* MODAL */}
      <EventRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        eventId={eventId}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default EventDetail;
