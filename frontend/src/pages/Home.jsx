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
import api from "../api/axios";
import EventCard from "../components/UI/EventCard";
import FilterDrawer from "../components/UI/FilterDrawer";
import Loader from "../components/UI/Loader";
import LoginModal from "../components/UI/LoginModal";
import { Filter, Search, ArrowUpDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import EventRegistrationModal from "../components/Forms/EventRegistrationModal";
import SearchableDropdown from "../components/UI/SearchableDropdown";

const LIMIT = 6;

const Home = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [orgType, setOrgType] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

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
  }, [orgType, selectedBoard, selectedItem, debouncedSearch, sortBy]);

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

      const res = await api.get("/events/", { params });

      if (reset) {
        setEvents(res.data);
      } else {
        setEvents((prev) => [...prev, ...res.data]);
      }

      setSkip(currentSkip + res.data.length);

      if (res.data.length < LIMIT) {
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

  return (
    <>
      <div className="container mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div className="home-hero-header">
            <h2>Upcoming <span>Events</span></h2>
            <p>Find and register for club activities</p>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap home-controls-row">
            <div className="search-glass">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="sort-glass">
              <ArrowUpDown size={16} />
              <SearchableDropdown
                className="sd-compact"
                options={[
                  { label: 'Newest First', value: 'date_desc' },
                  { label: 'Oldest First', value: 'date_asc' },
                ]}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                searchable={false}
              />
              {/* Mobile-only label shown when select is hidden */}
              <span className="sort-mobile-label">
                {sortBy === "date_desc" ? "Newest" : "Oldest"}
              </span>
            </div>

            <button
              className={`btn d-flex align-items-center gap-2 ${
                orgType ? "btn-purple" : "btn-outline-secondary"
              }`}
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter size={18} />
              <span className="filter-btn-label">Filter</span>
              {(orgType || selectedBoard || selectedItem) && (
                <span className="filter-active-dot" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Loader />
          </div>
        ) : (
          <>
            <div className="row g-4 grid-stagger">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegisterClick={handleRegisterClick}
                  />
                ))
              ) : (
                <div className="col-12">
                  <div className="no-events">
                    <h4>No events found</h4>
                    <p style={{ color: "var(--text-muted)" }}>
                      Try adjusting your filters or check back later.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="d-flex justify-content-center mt-5">
                <button
                  className="btn-load-more"
                  onClick={() => fetchEvents(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more events"}
                </button>
              </div>
            )}
          </>
        )}

        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          orgType={orgType}
          setOrgType={setOrgType}
          selectedBoard={selectedBoard}
          setSelectedBoard={setSelectedBoard}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
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
      </div>
    </>
  );
};

export default Home;