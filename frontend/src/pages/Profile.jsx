import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';
import { Camera, Edit3, Save, X, GraduationCap, MapPin, Calendar, Heart, Lock, Search, Mail, Hash, ChevronDown, Check, Plus } from 'lucide-react';
import { HOSTELS, GENRES, GENRE_CATEGORIES } from '../utils/constants';
import SearchableDropdown from '../components/UI/SearchableDropdown';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);

  const [interestSearch, setInterestSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [form, setForm] = useState({
    hostel: user?.hostel || "",
    interests: user?.interests || [],
    photo_url: user?.photo_url || "",
    photo_file: null,
    remove_photo: false
  });

  useEffect(() => {
    if (user) {
      setForm({
        hostel: user.hostel || "",
        interests: user.interests || [],
        photo_url: user.photo_url || "",
        photo_file: null,
        remove_photo: false
      });
    }
  }, [user]);

  if (!user) return <Loader />;

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({
      ...prev,
      photo_file: file,
      photo_url: URL.createObjectURL(file),
      remove_photo: false
    }));
  };

  const saveProfile = async () => {
    try {
      const fd = new FormData();
      fd.append("hostel", form.hostel);
      fd.append("interests", JSON.stringify(form.interests));
      if (form.remove_photo) fd.append("remove_photo", "true");
      if (form.photo_file) fd.append("photo", form.photo_file);

      const res = await api.put("/user/profile", fd);
      setUser(res.data);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const cancelEdit = () => {
    setForm({
      hostel: user.hostel || "",
      interests: user.interests || [],
      photo_url: user.photo_url || "",
      photo_file: null,
      remove_photo: false
    });
    setEditMode(false);
    setInterestSearch('');
    setExpandedCategory(null);
  };

  // Filter genres for search mode
  const searchFiltered = interestSearch
    ? GENRES.filter(g => g.toLowerCase().includes(interestSearch.toLowerCase()))
    : null;

  return (
    <div className="container-fluid profile-page-v3 py-4">

      {/* ── HERO CARD ── */}
      <div className="profile-hero-v3">
        <div className="profile-hero-bg" />

        <div className="profile-hero-content">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-v3">
              {form.photo_url ? (
                <img src={form.photo_url} alt="profile" />
              ) : (
                <span className="profile-avatar-letter">{user.name.charAt(0)}</span>
              )}
            </div>

            {editMode && (
              <>
                <button
                  className="profile-avatar-edit-btn"
                  onClick={() => document.getElementById("photoInput").click()}
                >
                  <Camera size={16} />
                </button>
                {form.photo_url && (
                  <button
                    className="profile-avatar-remove-btn"
                    onClick={() => setForm(prev => ({ ...prev, photo_url: "", photo_file: null, remove_photo: true }))}
                  >
                    <X size={12} />
                  </button>
                )}
              </>
            )}
            <input type="file" hidden id="photoInput" accept="image/*" onChange={handlePhotoChange} />
          </div>

          {/* Info */}
          <div className="profile-hero-info">
            <h1 className="profile-name-v3">{user.name}</h1>
            <div className="profile-meta-row">
              <span className="profile-meta-item"><Mail size={14} /> {user.email}</span>
              <span className="profile-meta-item"><Hash size={14} /> {user.entry_number}</span>
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="profile-hero-actions">
            {!editMode ? (
              <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
                <Edit3 size={16} /> Edit
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="profile-cancel-btn" onClick={cancelEdit}>
                  <X size={16} /> Discard
                </button>
                <button className="profile-save-btn" onClick={saveProfile}>
                  <Save size={16} /> Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DETAILS GRID ── */}
      <div className="profile-grid-v3">

        {/* LEFT: Academic Info */}
        <div className="profile-card-v3">
          <div className="profile-card-header">
            <GraduationCap size={18} />
            <span>Academic Details</span>
          </div>

          {!editMode ? (
            <div className="profile-info-list">
              <div className="profile-info-row">
                <GraduationCap size={16} className="profile-info-icon" />
                <div>
                  <div className="profile-info-label">Department</div>
                  <div className="profile-info-value">{user.department || "Not set"}</div>
                </div>
              </div>
              <div className="profile-info-row">
                <MapPin size={16} className="profile-info-icon" />
                <div>
                  <div className="profile-info-label">Hostel</div>
                  <div className="profile-info-value">{user.hostel || "Not set"}</div>
                </div>
              </div>
              <div className="profile-info-row">
                <Calendar size={16} className="profile-info-icon" />
                <div>
                  <div className="profile-info-label">Year</div>
                  <div className="profile-info-value">{user.current_year ? `Year ${user.current_year}` : "N/A"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-edit-fields">
              <div className="profile-field-group">
                <label className="profile-field-label">
                  Department <Lock size={11} style={{ opacity: 0.4 }} />
                </label>
                <input
                  className="profile-field-input disabled"
                  value={user.department || "Not set"}
                  readOnly
                />
                <span className="profile-field-hint">Auto-filled from entry number</span>
              </div>
              <div className="profile-field-group">
                <label className="profile-field-label">Hostel</label>
                <SearchableDropdown
                  options={HOSTELS}
                  value={form.hostel}
                  onChange={(val) => setForm({ ...form, hostel: val })}
                  placeholder="Select your hostel"
                />
              </div>
              <div className="profile-field-group">
                <label className="profile-field-label">
                  Year <Lock size={11} style={{ opacity: 0.4 }} />
                </label>
                <input
                  className="profile-field-input disabled"
                  value={user.current_year ? `Year ${user.current_year}` : "Not set"}
                  readOnly
                />
                <span className="profile-field-hint">Auto-calculated from admission year</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Interests */}
        <div className="profile-card-v3 profile-interests-card">
          <div className="profile-card-header">
            <Heart size={18} />
            <span>Your Interests</span>
            {form.interests.length > 0 && (
              <span className="profile-interest-count">{form.interests.length}</span>
            )}
          </div>

          {!editMode ? (
            /* ── View mode ── */
            <div className="profile-interests-view">
              {(user.interests || []).length > 0 ? (
                <div className="profile-interest-chips">
                  {user.interests.map(interest => (
                    <span key={interest} className="profile-interest-tag">{interest}</span>
                  ))}
                </div>
              ) : (
                <div className="profile-interests-empty">
                  <Heart size={32} style={{ opacity: 0.15 }} />
                  <p>No interests selected yet</p>
                  <span>Click Edit to personalise your event feed</span>
                </div>
              )}
            </div>
          ) : (
            /* ── Edit mode ── */
            <div className="profile-interests-edit">
              {/* Selected chips */}
              {form.interests.length > 0 && (
                <div className="profile-selected-interests">
                  {form.interests.map(interest => (
                    <button key={interest} className="profile-selected-chip" onClick={() => toggleInterest(interest)}>
                      {interest} <X size={13} />
                    </button>
                  ))}
                </div>
              )}

              {/* Search bar */}
              <div className="profile-interest-search-v3">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search interests..."
                  value={interestSearch}
                  onChange={e => setInterestSearch(e.target.value)}
                />
                {interestSearch && (
                  <button className="profile-search-clear" onClick={() => setInterestSearch('')}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Results / Categories */}
              <div className="profile-interest-picker">
                {searchFiltered ? (
                  /* Search results */
                  <div className="profile-interest-results">
                    {searchFiltered.length > 0 ? searchFiltered.map(genre => {
                      const sel = form.interests.includes(genre);
                      return (
                        <button key={genre} className={`profile-pick-chip ${sel ? 'picked' : ''}`} onClick={() => toggleInterest(genre)}>
                          {sel ? <Check size={13} /> : <Plus size={13} />}
                          {genre}
                        </button>
                      );
                    }) : (
                      <div className="profile-no-results">No interests match "{interestSearch}"</div>
                    )}
                  </div>
                ) : (
                  /* Categories accordion */
                  <div className="profile-category-list">
                    {GENRE_CATEGORIES.map(cat => {
                      const isOpen = expandedCategory === cat.name;
                      const selectedInCat = cat.genres.filter(g => form.interests.includes(g)).length;
                      return (
                        <div key={cat.name} className={`profile-category-item ${isOpen ? 'open' : ''}`}>
                          <button
                            className="profile-category-header"
                            onClick={() => setExpandedCategory(isOpen ? null : cat.name)}
                          >
                            <span className="profile-cat-name" style={{ color: cat.color }}>{cat.name}</span>
                            <div className="d-flex align-items-center gap-2">
                              {selectedInCat > 0 && <span className="profile-cat-count">{selectedInCat}</span>}
                              <ChevronDown size={15} className={`profile-cat-chevron ${isOpen ? 'rotated' : ''}`} />
                            </div>
                          </button>
                          {isOpen && (
                            <div className="profile-category-genres">
                              {cat.genres.map(genre => {
                                const sel = form.interests.includes(genre);
                                return (
                                  <button key={genre} className={`profile-pick-chip ${sel ? 'picked' : ''}`} onClick={() => toggleInterest(genre)}>
                                    {sel ? <Check size={13} /> : <Plus size={13} />}
                                    {genre}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;