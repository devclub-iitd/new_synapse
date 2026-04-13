import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/UI/Loader";
import LoginModal from "../components/UI/LoginModal";
import AnimatedBackground from "../components/UI/AnimatedBackground";
import { Sparkles, ArrowRight, ChevronRight, Monitor, FlaskConical, Music, Camera, BookOpen, Trophy, Briefcase, Leaf, Radio } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GENRE_CATEGORIES } from "../utils/constants";
import EventBanner from "../components/UI/EventBanner";
import { orgDisplayName } from "../utils/capitalize";

const CATEGORY_ICONS = { Monitor, FlaskConical, Music, Camera, BookOpen, Trophy, Briefcase, Leaf };
import EventRegistrationModal from "../components/Forms/EventRegistrationModal";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [picks, setPicks] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const params = { skip: 0, limit: 6, sort_by: "date_desc" };
        let results = [];
        // If user has interests, try personalized picks first
        if (user?.interests?.length) {
          params.genres = user.interests.join(",");
          const res = await api.get("/events/", { params });
          results = res.data || [];
        }
        // Backfill: if we have fewer than 6, fetch more without genre filter
        if (results.length < 6) {
          const backfillParams = { skip: 0, limit: 6, sort_by: "date_desc" };
          const res2 = await api.get("/events/", { params: backfillParams });
          const existingIds = new Set(results.map(e => e.id));
          for (const ev of (res2.data || [])) {
            if (!existingIds.has(ev.id)) {
              results.push(ev);
              if (results.length >= 6) break;
            }
          }
        }
        setPicks(results.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchLiveEvents = async () => {
      try {
        const res = await api.get("/events/", { params: { live: true, limit: 4, sort_by: "date_desc" } });
        setLiveEvents(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPicks();
    fetchLiveEvents();
  }, [user]);

  const handleRegisterClick = (event) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedEventId(event.id);
    setIsRegisterModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegisterModalOpen(false);
    setSelectedEventId(null);
  };

  const handleViewMore = () => {
    navigate("/events");
  };

  const handleCategoryClick = (cat) => {
    navigate(`/events?genres=${encodeURIComponent(cat.genres.join(","))}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate();
    const suffix = ["th","st","nd","rd"][(day % 100 > 10 && day % 100 < 14) ? 0 : (day % 10 < 4 ? day % 10 : 0)];
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    return <>{day}<sup className="date-ordinal">{suffix}</sup> {month}</>;
  };

  return (
    <div className="home-page-v3">
      <AnimatedBackground />

      {/* Hero */}
      <div className="home-hero-v3">
        <div className="container">
          <div className="hero-content-v3">
            <h1 className="hero-title-v3">
              Welcome to <span className="gradient-text">Synapse</span>
            </h1>
            <p className="hero-subtitle-v3">
              {user
                ? "Events handpicked for you from across campus"
                : "Fests, talks, workshops & more at IIT Delhi"}
            </p>
          </div>
        </div>
      </div>

      {/* Personalized Picks */}
      <div className="container homepage-section">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="homepage-section-title">
            <Sparkles size={20} className="text-purple" />
            {user?.interests?.length ? "Picked for You" : "Upcoming Events"}
          </h2>
          <button className="btn-view-more" onClick={handleViewMore}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="picks-placeholder d-flex justify-content-center align-items-center">
            <Loader />
          </div>
        ) : picks.length > 0 ? (
          <div className="picks-tile-grid">
            {picks.map((event) => (
              <div
                key={event.id}
                className="pick-tile-v2"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="pick-tile-banner">
                  {event.image_url ? (
                    <img src={event.image_url} alt="" />
                  ) : (
                    <EventBanner orgName={orgDisplayName(event.organization?.name)} className="pick-tile-fallback-banner" />
                  )}
                  <div className="pick-tile-overlay">
                    <span className="pick-tile-date">{formatDate(event.date)}</span>
                    <h4 className="pick-tile-name">{event.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="homepage-empty-picks">
            <p>No events right now. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Live Events */}
      {liveEvents.length > 0 && (
        <div className="container homepage-section">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="homepage-section-title">
              <span className="live-pulse-dot" />
              Live Now
            </h2>
            <button className="btn-view-more" onClick={() => navigate("/events?live=true")}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="picks-tile-grid live-tile-grid">
            {liveEvents.map((event) => (
              <div
                key={event.id}
                className="pick-tile-v2 live-tile"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="pick-tile-banner">
                  {event.image_url ? (
                    <img src={event.image_url} alt="" />
                  ) : (
                    <EventBanner orgName={orgDisplayName(event.organization?.name)} className="pick-tile-fallback-banner" />
                  )}
                  <span className="live-badge-tile"><Radio size={10} /> LIVE</span>
                  <div className="pick-tile-overlay">
                    <span className="pick-tile-date">{formatDate(event.date)}</span>
                    <h4 className="pick-tile-name">{event.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genre Categories */}
      <div className="container homepage-section">
        <h2 className="homepage-section-title mb-4">
          Explore by Category
        </h2>
        <div className="genre-categories-grid">
          {GENRE_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className="genre-category-card"
              onClick={() => handleCategoryClick(cat)}
              style={{ '--cat-color': cat.color }}
            >
              <span className="genre-category-icon">{React.createElement(CATEGORY_ICONS[cat.icon], { size: 22 })}</span>
              <span className="genre-category-name">{cat.name}</span>
              <ChevronRight size={16} className="genre-category-arrow" />
            </button>
          ))}
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <EventRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        eventId={selectedEventId}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default HomePage;
