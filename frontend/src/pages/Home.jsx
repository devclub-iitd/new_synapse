// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import EventCard from "../components/UI/EventCard";
// import FilterDrawer from "../components/UI/FilterDrawer";
// import Loader from "../components/UI/Loader";
// import LoginModal from "../components/UI/LoginModal";
// import { Filter, Search, ArrowUpDown } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";

// import EventRegistrationModal from "../components/Forms/EventRegistrationModal";

// const LIMIT = 6;

// const Home = () => {
//   const { user } = useAuth();

//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [isLoginOpen, setIsLoginOpen] = useState(false);

//   const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
//   const [selectedEventId, setSelectedEventId] = useState(null);

//   const [orgType, setOrgType] = useState("");
//   const [selectedBoard, setSelectedBoard] = useState("");
//   const [selectedItem, setSelectedItem] = useState("");

//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");

//   const [sortBy, setSortBy] = useState("date");

//   const [skip, setSkip] = useState(0);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(search);
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [search]);

//   useEffect(() => {
//     setSkip(0);
//     setEvents([]);
//     setHasMore(true);
//     fetchEvents(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [orgType, selectedBoard, selectedItem, debouncedSearch, sortBy]);

//   const fetchEvents = async (reset = false) => {
//     try {
//       reset ? setLoading(true) : setLoadingMore(true);

//       const currentSkip = reset ? 0 : skip;

//       const params = {
//         skip: currentSkip,
//         limit: LIMIT,
//         sort_by: sortBy,
//       };

//       if (orgType) params.org_type = orgType;
//       if (selectedBoard) params.board = selectedBoard;
//       if (selectedItem) params.item = selectedItem;
//       if (debouncedSearch) params.search = debouncedSearch;

//       const res = await api.get("/events", { params });

//       if (reset) {
//         setEvents(res.data);
//       } else {
//         setEvents((prev) => [...prev, ...res.data]);
//       }

//       setSkip(currentSkip + res.data.length);

//       if (res.data.length < LIMIT) {
//         setHasMore(false);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   const handleRegisterClick = (event) => {
//     if (!user) {
//       setIsLoginOpen(true);
//       return;
//     }
//     setSelectedEventId(event.id);
//     setIsRegisterModalOpen(true);
//   };

//   const handleRegistrationSuccess = () => {
//     setIsRegisterModalOpen(false);
//     setSelectedEventId(null);
//     setSkip(0);
//     setEvents([]);
//     setHasMore(true);
//     fetchEvents(true);
//   };

//   return (
//     <>
//       <div className="container mt-4 mb-4">
//         <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
//           <div className="home-hero-header">
//             <h2>Upcoming <span>Events</span></h2>
//             <p>Find and register for club activities</p>
//           </div>

//           <div className="d-flex align-items-center gap-3 flex-wrap home-controls-row">
//             <div className="search-glass">
//               <Search size={16} className="search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search events..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>

//             <div className="sort-glass">
//               <ArrowUpDown size={16} />
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="date">Sort by Date</option>
//                 <option value="popularity" disabled>
//                   Popularity (coming soon)
//                 </option>
//               </select>
//               {/* Mobile-only label shown when select is hidden */}
//               <span className="sort-mobile-label">Date</span>
//             </div>

//             <button
//               className={`btn d-flex align-items-center gap-2 ${
//                 orgType ? "btn-purple" : "btn-outline-secondary"
//               }`}
//               onClick={() => setIsFilterOpen(true)}
//             >
//               <Filter size={18} />
//               <span className="filter-btn-label">Filter</span>
//               {(orgType || selectedBoard || selectedItem) && (
//                 <span className="filter-active-dot" />
//               )}
//             </button>
//           </div>
//         </div>

//         {loading ? (
//           <div className="d-flex justify-content-center py-5">
//             <Loader />
//           </div>
//         ) : (
//           <>
//             <div className="row g-4 grid-stagger">
//               {events.length > 0 ? (
//                 events.map((event) => (
//                   <EventCard
//                     key={event.id}
//                     event={event}
//                     onRegisterClick={handleRegisterClick}
//                   />
//                 ))
//               ) : (
//                 <div className="col-12">
//                   <div className="no-events">
//                     <h4>No events found</h4>
//                     <p style={{color: 'var(--text-muted)'}}>Try adjusting your filters or check back later.</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {hasMore && (
//               <div className="d-flex justify-content-center mt-5">
//                 <button
//                   className="btn-load-more"
//                   onClick={() => fetchEvents(false)}
//                   disabled={loadingMore}
//                 >
//                   {loadingMore ? "Loading..." : "Load more events"}
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         <FilterDrawer
//           isOpen={isFilterOpen}
//           onClose={() => setIsFilterOpen(false)}
//           orgType={orgType}
//           setOrgType={setOrgType}
//           selectedBoard={selectedBoard}
//           setSelectedBoard={setSelectedBoard}
//           selectedItem={selectedItem}
//           setSelectedItem={setSelectedItem}
//         />

//         <LoginModal
//           isOpen={isLoginOpen}
//           onClose={() => setIsLoginOpen(false)}
//         />

//         <EventRegistrationModal
//           isOpen={isRegisterModalOpen}
//           onClose={() => setIsRegisterModalOpen(false)}
//           eventId={selectedEventId}
//           onSuccess={handleRegistrationSuccess}
//         />
//       </div>
//     </>
//   );
// };

// export default Home;

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import EventCard from "../components/UI/EventCard";
import FilterDrawer from "../components/UI/FilterDrawer";
import Loader from "../components/UI/Loader";
import LoginModal from "../components/UI/LoginModal";
import AnimatedBackground from "../components/UI/AnimatedBackground";
import { Filter, Search, ArrowUpDown, Inbox, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isLhVenue, LH_ROOMS } from "../utils/constants";
import toast from "react-hot-toast";

import EventRegistrationModal from "../components/Forms/EventRegistrationModal";

const LIMIT = 6;

const Home = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Initialize genres from URL params immediately (avoid race with first fetch)
  const initGenres = () => {
    const g = searchParams.get('genres');
    return g ? g.split(',').map(s => s.trim()).filter(Boolean) : [];
  };
  const initLive = () => searchParams.get('live') === 'true';
  const initLh = () => searchParams.get('lh') === 'true' ? [...LH_ROOMS] : [];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestEvent, setRequestEvent] = useState(null);
  const [requestText, setRequestText] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [orgType, setOrgType] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedGenres, setSelectedGenres] = useState(initGenres);
  const [liveOnly, setLiveOnly] = useState(initLive);
  const [selectedLhRooms, setSelectedLhRooms] = useState(initLh);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Default: newest first
  const [sortBy, setSortBy] = useState("date_desc");

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSkip(0);
    setEvents([]);
    setHasMore(true);
    fetchEvents(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgType, selectedBoard, selectedItem, debouncedSearch, sortBy, selectedGenres, liveOnly, selectedLhRooms]);

  const fetchEvents = async (reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);

      const currentSkip = reset ? 0 : skip;

      const params = {
        skip: currentSkip,
        limit: LIMIT,
        sort_by: sortBy,
      };

      if (orgType) params.org_type = orgType;
      if (selectedBoard) params.board = selectedBoard;
      if (selectedItem) params.item = selectedItem;
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedGenres.length > 0) params.genres = selectedGenres.join(',');
      if (liveOnly) params.live = true;

      // When LH filter active, fetch more to have enough after client-side filter
      const lhActive = selectedLhRooms.length > 0;
      if (lhActive) params.limit = LIMIT * 4;

      const res = await api.get("/events/", { params });
      let fetched = res.data;

      // Client-side LH venue filter
      if (lhActive) {
        const lhSet = new Set(selectedLhRooms.map(r => r.toUpperCase()));
        fetched = fetched.filter(e => e.venue && lhSet.has(e.venue.trim().toUpperCase()));
      }

      if (reset) {
        setEvents(fetched);
      } else {
        setEvents((prev) => [...prev, ...fetched]);
      }

      setSkip(currentSkip + res.data.length);

      if (res.data.length < (lhActive ? LIMIT * 4 : LIMIT)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
    setSkip(0);
    setEvents([]);
    setHasMore(true);
    fetchEvents(true);
  };

  const handleRequestClick = (event) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    setRequestEvent(event);
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmit = async () => {
    setSubmittingRequest(true);
    try {
      await api.post(`/events/${requestEvent.id}/request`, { form_response: requestText });
      toast.success("Request submitted! Awaiting approval.");
      setIsRequestModalOpen(false);
      setRequestText('');
      setRequestEvent(null);
      setSkip(0);
      setEvents([]);
      setHasMore(true);
      fetchEvents(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="home-page-v3">
      <AnimatedBackground />

      <div className="home-content-wrapper">
        {/* Hero Section */}
        <div className="home-hero-v3">
          <div className="hero-content-v3 hero-compact">
            <h1 className="hero-title-v3">
              Discover <span className="gradient-text">Events</span>
            </h1>
          </div>

          {/* Controls Bar */}
          <div className="controls-bar-v3">
            <div className="search-v3">
              <Search size={18} className="search-v3-icon" />
              <input
                type="text"
                placeholder="Search events, clubs, fests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="controls-right-v3">
              <button
                className="sort-toggle-v3"
                onClick={() => setSortBy(prev => prev === 'date_desc' ? 'date_asc' : 'date_desc')}
                title={sortBy === 'date_desc' ? 'Showing Newest First' : 'Showing Oldest First'}
              >
                <ArrowUpDown size={16} />
                <span>{sortBy === 'date_desc' ? 'Newest' : 'Oldest'}</span>
              </button>

              <button
                className={`filter-btn-v3 ${orgType || selectedGenres.length || liveOnly || selectedLhRooms.length ? 'active' : ''}`}
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter size={18} />
                <span className="filter-btn-label">Filters</span>
                {(orgType || selectedBoard || selectedItem || selectedGenres.length > 0 || liveOnly || selectedLhRooms.length > 0) && (
                  <span className="filter-active-dot" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-section-v3">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Loader />
          </div>
        ) : (
          <>
            <div className="events-grid-v3">
              {events.length > 0 ? (
                events.map((event, idx) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegisterClick={handleRegisterClick}
                    onRequestClick={handleRequestClick}
                    index={idx}
                  />
                ))
              ) : (
                <div className="empty-state-v3">
                  <div className="empty-icon">
                    <Search size={48} />
                  </div>
                  <h3>No events found</h3>
                  <p>Try adjusting your filters or check back later.</p>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="load-more-wrapper">
                <button
                  className="btn-load-more-v3"
                  onClick={() => fetchEvents(false)}
                  disabled={loadingMore}
                >
                  <span>{loadingMore ? "Loading..." : "Load more events"}</span>
                  <div className="btn-shimmer" />
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        orgType={orgType}
        setOrgType={setOrgType}
        selectedBoard={selectedBoard}
        setSelectedBoard={setSelectedBoard}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        liveOnly={liveOnly}
        setLiveOnly={setLiveOnly}
        selectedLhRooms={selectedLhRooms}
        setSelectedLhRooms={setSelectedLhRooms}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <EventRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        eventId={selectedEventId}
        onSuccess={handleRegistrationSuccess}
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
                  <p>{requestEvent?.request_only ? 'This event requires approval to join' : 'Event is full — submit a request'}</p>
                </div>
              </div>
              <button className="modal-close-v3" onClick={() => { setIsRequestModalOpen(false); setRequestText(''); setRequestEvent(null); }}>
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
    </div>
  );
};

export default Home;