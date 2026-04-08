import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';
import { Camera, Edit3, Save, X, GraduationCap, MapPin, Calendar, Heart, Lock } from 'lucide-react';
import { HOSTELS } from '../utils/constants';
import SearchableDropdown from '../components/UI/SearchableDropdown';

const ALL_INTERESTS = [
  "AI", "Web Development", "Machine Learning", "Robotics",
  "Design", "Blockchain", "Competitive Programming", "Cyber Security"
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);

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
  };

  return (
    <div className="container-fluid profile-page py-4">

      {/* 1. HERO IDENTITY SECTION */}
      <div className="profile-hero-v2 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-center gap-4">

          {/* AVATAR CONTAINER */}
          <div className="position-relative">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {form.photo_url ? (
                  <img src={form.photo_url} alt="profile" />
                ) : (
                  <span className="profile-avatar-initial">{user.name.charAt(0)}</span>
                )}
              </div>
            </div>

            {editMode && (
              <>
                <button
                  className="avatar-edit-fab shadow border-0"
                  onClick={() => document.getElementById("photoInput").click()}
                  style={{ position: 'absolute', bottom: '0', right: '0', zIndex: 2 }}
                >
                  <Camera size={18} />
                </button>

                {form.photo_url && (
                  <button
                    className="btn btn-danger btn-sm rounded-circle p-1 shadow"
                    style={{ position: 'absolute', top: '-5px', right: '-5px', zIndex: 3, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setForm(prev => ({ ...prev, photo_url: "", photo_file: null, remove_photo: true }))}
                  >
                    <X size={14} />
                  </button>
                )}
              </>
            )}
            <input type="file" hidden id="photoInput" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div className="text-center text-md-start flex-grow-1">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <span className="entry-pill px-3 py-1">{user.entry_number}</span>
          </div>

          <div className="mt-3 mt-md-0">
            {!editMode ? (
              <button className="btn btn-purple-outline d-flex align-items-center gap-2 px-4 py-2" onClick={() => setEditMode(true)}>
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={cancelEdit}>
                  <X size={18} /> Discard
                </button>
                <button className="btn btn-purple d-flex align-items-center gap-2 px-4" onClick={saveProfile}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. ACADEMIC DETAILS */}
        <div className="col-lg-5">
          <div className="profile-glass-card h-100 p-4">
            <h5 className="section-title mb-4 d-flex align-items-center gap-2">
              <GraduationCap size={20} className="text-purple" /> Academic Info
            </h5>

            {!editMode ? (
              <div className="d-flex flex-column gap-3">
                <div className="info-mini-card">
                  <div className="info-mini-icon"><GraduationCap size={18} /></div>
                  <div>
                    <div className="info-mini-label">Department</div>
                    <div className="info-mini-value">{user.department || "Not set"}</div>
                  </div>
                </div>
                <div className="info-mini-card">
                  <div className="info-mini-icon"><MapPin size={18} /></div>
                  <div>
                    <div className="info-mini-label">Hostel</div>
                    <div className="info-mini-value">{user.hostel || "Not set"}</div>
                  </div>
                </div>
                <div className="info-mini-card">
                  <div className="info-mini-icon"><Calendar size={18} /></div>
                  <div>
                    <div className="info-mini-label">Current Year</div>
                    <div className="info-mini-value">Year {user.current_year || "N/A"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {/* Department — auto-filled, read-only */}
                <div>
                  <label className="form-label-modern d-flex align-items-center gap-1">
                    Department <Lock size={13} className="text-muted" />
                  </label>
                  <input
                    className="form-control modern-input"
                    value={user.department || "Not set"}
                    readOnly
                    style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', opacity: 0.7 }}
                  />
                  <div className="form-text" style={{ fontSize: '0.72rem' }}>Auto-filled from your entry number</div>
                </div>
                {/* Hostel — editable */}
                <div>
                  <label className="form-label-modern">Hostel</label>
                  <SearchableDropdown
                    options={HOSTELS}
                    value={form.hostel}
                    onChange={(val) => setForm({ ...form, hostel: val })}
                    placeholder="Select your hostel"
                  />
                </div>
                {/* Year — auto-filled, read-only */}
                <div>
                  <label className="form-label-modern d-flex align-items-center gap-1">
                    Current Year <Lock size={13} className="text-muted" />
                  </label>
                  <input
                    className="form-control modern-input"
                    value={user.current_year ? `Year ${user.current_year}` : "Not set"}
                    readOnly
                    style={{ background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', opacity: 0.7 }}
                  />
                  <div className="form-text" style={{ fontSize: '0.72rem' }}>Auto-calculated from admission year</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. INTERESTS SELECTION */}
        <div className="col-lg-7">
          <div className="profile-glass-card h-100 p-4">
            <h5 className="section-title mb-4 d-flex align-items-center gap-2">
              <Heart size={20} className="text-purple" /> Your Interests
            </h5>
            <p className="text-secondary small mb-3">
              {editMode ? "Select topics to customize your campus experience." : "These interests help customize your event feed."}
            </p>

            <div className="d-flex flex-wrap gap-2">
              {(editMode ? ALL_INTERESTS : user.interests).map(interest => {
                const isSelected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    disabled={!editMode}
                    className={`interest-chip-v2 ${isSelected ? "active" : ""} ${!editMode ? "view-only" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {editMode && <span>{isSelected ? "✓" : "+"}</span>}
                    {interest}
                  </button>
                );
              })}

              {!editMode && user.interests.length === 0 && (
                <div className="text-center w-100 py-4 opacity-50 fst-italic" style={{ color: 'var(--text-muted)' }}>
                  No interests selected. Click edit to add some!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;