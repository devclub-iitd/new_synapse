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

  const handleRegisterClick = () => {
    if (!user) {
      openLoginModal();
      return;
    }
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
    ? new Date(event.registration_deadline) < new Date()
    : false;

  return (
    <div className="container py-5">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-link text-secondary text-decoration-none mb-4 ps-0"
      >
        <ArrowLeft size={18} className="me-2" /> Back
      </button>

      <div className="row">
        {/* IMAGE */}
        <div className="col-md-5 mb-4">
          <img
            src={event.image_url || "https://via.placeholder.com/300x150"}
            className="img-fluid rounded-4 shadow-lg w-100 object-fit-cover"
            alt={event.name}
            style={{ height: "350px" }}
          />
        </div>

        {/* DETAILS */}
        <div className="col-md-7">
          <span className="badge bg-purple-soft text-purple border-purple px-3 py-2 rounded-pill mb-3">
            {event.org_name}
          </span>

          <h1 className="fw-bold text-white mb-3">
            {event.name}
          </h1>

          {/* META CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3 text-secondary p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="icon-box-purple">
                  <Calendar size={20} />
                </div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">
                    Date & Time
                  </small>
                  <span className="text-white">
                    {new Date(event.date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3 text-secondary p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="icon-box-purple">
                  <MapPin size={20} />
                </div>
                <div>
                  <small className="d-block text-uppercase fw-bold opacity-50">
                    Venue
                  </small>
                  <span className="text-white">
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ REGISTRATION DEADLINE */}
            {hasDeadline && (
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 text-secondary p-3 rounded-3"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="icon-box-purple">
                    <Clock size={20} />
                  </div>
                  <div>
                    <small className="d-block text-uppercase fw-bold opacity-50">
                      Registration Deadline
                    </small>
                    <span className="text-white">
                      {new Date(event.registration_deadline).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ABOUT */}
          <div className="section-title mb-3 d-flex align-items-center gap-2 text-white">
            <Info size={18} className="text-purple" /> About Event
          </div>

          <div className="text-secondary mb-5" style={{ lineHeight: 1.8 }}>
            {event.description}
          </div>

          {/* ACTION */}
          <button
            className={`btn px-5 py-3 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 ${
              event.is_registered || deadlinePassed
                ? "btn-registered"
                : "btn-purple"
            }`}
            disabled={event.is_registered || deadlinePassed}
            onClick={handleRegisterClick}
          >
            {event.is_registered ? (
              <>
                <Check size={20} /> Registered
              </>
            ) : deadlinePassed ? (
              "Registration Closed"
            ) : (
              "Register Now"
            )}
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
