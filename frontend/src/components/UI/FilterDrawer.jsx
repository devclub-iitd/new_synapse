import React, { useState } from "react";
import { X, Search, Monitor, FlaskConical, Music, Camera, BookOpen, Trophy, Briefcase, Leaf } from "lucide-react";
import { GENRE_CATEGORIES } from "../../utils/constants";

const CATEGORY_ICONS = { Monitor, FlaskConical, Music, Camera, BookOpen, Trophy, Briefcase, Leaf };

const FILTER_MAPPING = {
  Clubs: {
    CAIC: [
      "DevClub", "iGEM", "Robotics Club", "Axlr8r Formula Racing",
      "PAC", "BnC", "Aeromodelling Club", "Economics Club",
      "ANCC", "Aries", "IGTS", "BlocSoc", "Hyperloop"
    ],
    BRCA: [
      "Drama", "Design", "PFC", "FACC", "Dance",
      "Hindi Samiti", "Literary", "DebSoc", "QC",
      "Music", "Spic Macay", "Envogue"
    ]
  },
  Fests: ["Rendezvous", "Beacon", "Literati", "Tryst", "Kaizen"],
  Departments: [
    "Applied Mechanics", "Biochemical Engineering", "Chemical",
    "Chemistry", "Civil", "CSE", "Design", "Electrical",
    "Mathematics", "Mechanical", "Physics"
  ]
};

const FilterDrawer = ({
  isOpen,
  onClose,
  orgType,
  setOrgType,
  selectedBoard,
  setSelectedBoard,
  selectedItem,
  setSelectedItem,
  selectedGenres = [],
  setSelectedGenres,
}) => {
  const [genreSearch, setGenreSearch] = useState('');

  const toggleGenre = (genre) => {
    if (!setSelectedGenres) return;
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  // Flatten all genres from categories for search
  const allGenresFromCategories = GENRE_CATEGORIES.flatMap(c => c.genres);
  const filteredGenres = genreSearch
    ? allGenresFromCategories.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()))
    : null;

  return (
    <>
      {isOpen && (
        <div className="modal-backdrop-v2" onClick={onClose}>
          <div className="filter-popup" onClick={e => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h5 className="mb-0 fw-bold" style={{color: 'var(--text-primary)'}}>Filter Events</h5>
              <button className="btn-close-modern" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="filter-popup-body">

          {/* BY ORGANIZATION */}
          <div className="mb-4">
            <label className="text-secondary small fw-bold mb-3 d-block">
              BY ORGANIZATION
            </label>
            <div className="filter-options">
              {["Clubs", "Fests", "Departments"].map(type => (
                <button
                  key={type}
                  className={`filter-chip ${orgType === type ? "active" : ""}`}
                  onClick={() => {
                    setOrgType(type);
                    setSelectedBoard("");
                    setSelectedItem("");
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* BOARD (ONLY FOR CLUBS) */}
          {orgType === "Clubs" && (
            <div className="mb-4">
              <label className="text-secondary small fw-bold mb-3 d-block">
                BY BOARD
              </label>
              <div className="filter-options">
                {Object.keys(FILTER_MAPPING.Clubs).map(board => (
                  <button
                    key={board}
                    className={`filter-chip ${selectedBoard === board ? "active" : ""}`}
                    onClick={() => {
                      setSelectedBoard(board);
                      setSelectedItem("");
                    }}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FINAL LEVEL */}
          {(orgType === "Fests" ||
            orgType === "Departments" ||
            selectedBoard) && (
            <div className="mb-4">
              <label className="text-secondary small fw-bold mb-3 d-block">
                {orgType === "Clubs"
                  ? "BY CLUB"
                  : `BY ${orgType.slice(0, -1).toUpperCase()}`}
              </label>

              <div className="filter-options">
                {(orgType === "Clubs"
                  ? FILTER_MAPPING.Clubs[selectedBoard]
                  : FILTER_MAPPING[orgType]
                )?.map(item => (
                  <button
                    key={item}
                    className={`filter-chip ${selectedItem === item ? "active" : ""}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BY GENRE */}
          {setSelectedGenres && (
            <div className="mb-4">
              <label className="text-secondary small fw-bold mb-3 d-block">
                BY GENRE
              </label>
              {/* Search */}
              <div className="filter-genre-search mb-3">
                <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search genres..."
                  value={genreSearch}
                  onChange={e => setGenreSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', flex: 1 }}
                />
                {genreSearch && (
                  <button onClick={() => setGenreSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {filteredGenres ? (
                /* Search results */
                <div className="filter-options">
                  {filteredGenres.map(genre => (
                    <button
                      key={genre}
                      className={`filter-chip ${selectedGenres.includes(genre) ? "active" : ""}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                  {filteredGenres.length === 0 && (
                    <span className="text-muted small fst-italic">No genres match</span>
                  )}
                </div>
              ) : (
                /* Categorized view */
                GENRE_CATEGORIES.map(cat => (
                  <div key={cat.name} className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ color: cat.color }}>{React.createElement(CATEGORY_ICONS[cat.icon], { size: 16 })}</span>
                      <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                    </div>
                    <div className="filter-options">
                      {cat.genres.map(genre => (
                        <button
                          key={genre}
                          className={`filter-chip ${selectedGenres.includes(genre) ? "active" : ""}`}
                          onClick={() => toggleGenre(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {selectedGenres.length > 0 && (
                <button
                  className="btn btn-link btn-sm text-secondary p-0 mt-2"
                  onClick={() => setSelectedGenres([])}
                >
                  Clear genres ({selectedGenres.length})
                </button>
              )}
            </div>
          )}

          {/* FOOTER */}
            </div>

            <div className="filter-popup-footer">
              <button
                className="btn btn-link text-secondary btn-sm"
                onClick={() => {
                  setOrgType("");
                  setSelectedBoard("");
                  setSelectedItem("");
                  if (setSelectedGenres) setSelectedGenres([]);
                }}
              >
                Reset All
              </button>
              <button className="btn btn-purple btn-sm px-4" onClick={onClose}>
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default FilterDrawer;
