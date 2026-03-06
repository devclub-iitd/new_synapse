import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Users, BarChart3, Plus, Download, Eye, Lock, Globe, Trash2, UserPlus, X, Edit, UserCheck } from 'lucide-react';
import DynamicFormBuilder from '../components/Forms/DynamicFormBuilder';
import DemographicsChart from '../components/Charts/DemographicsChart';
import Loader from '../components/UI/Loader';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

import { DEPARTMENTS, HOSTELS, YEARS, HEAD_ROLES, TEAM_ROLES } from '../utils/constants';
import OrgBanner from '../components/UI/OrgBanner';

// --- HELPER COMPONENT: MultiSelect ---
const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !selected.includes(value)) {
      onChange([...selected, value]);
    }
    e.target.value = "";
  };

  const removeOption = (valueToRemove) => {
    onChange(selected.filter(item => item !== valueToRemove));
  };

  return (
    <div className="mb-3">
      <label className="form-label-modern">{label}</label>
      <select
        className="form-select modern-input mb-2"
        onChange={handleSelect}
        defaultValue=""
      >
        <option value="" disabled>{placeholder || "Select to add..."}</option>
        {options.map(opt => (
          <option key={opt} value={opt} disabled={selected.includes(opt)}>
            {opt}
          </option>
        ))}
      </select>

      <div className="multiselect-chips">
        {selected.length > 0 ? (
          selected.map(item => (
            <span key={item} className="multiselect-chip">
              {item}
              <span
                className="chip-remove"
                onClick={() => removeOption(item)}
              >
                <X size={13} />
              </span>
            </span>
          ))
        ) : (
          <small style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Open to everyone</small>
        )}
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: Registrations Popup Modal ---
const RegistrationsModal = ({ event, orgId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get(`/org/${orgId}/events/${event.id}/registrations`);
        setData({ count: res.data.length });
      } catch (err) {
        toast.error("Failed to load registration count");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [event.id, orgId, onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card, #1a1a2e)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '2rem',
          minWidth: '320px',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
              Registrations
            </h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              {event.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px',
              color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
            <div className="spinner-border spinner-border-sm" role="status" />
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading...</p>
          </div>
        ) : (
          <div>
            {/* Big Count Display */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
                <UserCheck size={24} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {data?.count ?? 0}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Total Registrations
              </p>
            </div>

            {/* Event date info */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Event Date</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {formatDate(event.date)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrgDashboard = () => {
  const { orgId } = useParams();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEventId, setEditingEventId] = useState(null);

  // ✅ NEW: State for registrations popup
  const [regModalEvent, setRegModalEvent] = useState(null);

  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    registration_deadline: '',
    venue: '',
    description: '',
    tags: '',
    isPrivate: false
  });

  const [targetDepts, setTargetDepts] = useState([]);
  const [targetHostels, setTargetHostels] = useState([]);
  const [targetYears, setTargetYears] = useState([]);

  const [formSchema, setFormSchema] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const [newMember, setNewMember] = useState({ email: '', role: 'coordinator' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, eventsRes, teamRes] = await Promise.all([
        api.get(`/org/${orgId}/dashboard`),
        api.get(`/org/${orgId}/events`),
        api.get(`/org/${orgId}/team`)
      ]);
      setStats(dashRes.data);
      setEvents(eventsRes.data);
      setTeam(teamRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!editingEventId && activeTab === 'create') {
      setTargetDepts(DEPARTMENTS);
      setTargetHostels(HOSTELS);
    }
  }, [activeTab, editingEventId]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('name', newEvent.name);
    formData.append('date', new Date(newEvent.date).toISOString());
    if (newEvent.registration_deadline) {
      formData.append('registration_deadline', new Date(newEvent.registration_deadline).toISOString());
    }
    formData.append('venue', newEvent.venue);
    formData.append('description', newEvent.description);
    formData.append('tags', JSON.stringify(newEvent.tags.split(',').map(t => t.trim()).filter(Boolean)));
    formData.append('custom_form_schema', JSON.stringify(formSchema));
    formData.append('is_private', newEvent.isPrivate);
    if (imageFile) formData.append('photo', imageFile);

    const audience = {
      depts: targetDepts,
      hostels: targetHostels,
      years: targetYears.map(y => parseInt(y))
    };
    formData.append('target_audience', JSON.stringify(audience));

    try {
      if (editingEventId) {
        await api.put(`/org/${orgId}/events/${editingEventId}`, formData);
        toast.success("Event updated successfully!");
        setEditingEventId(null);
      } else {
        await api.post(`/org/${orgId}/events`, formData);
        toast.success("Event created successfully!");
        setNewEvent({ name: '', date: '', venue: '', description: '', tags: '', isPrivate: false });
        setTargetDepts([]);
        setTargetHostels([]);
        setTargetYears([]);
        setFormSchema([]);
        setImageFile(null);
      }

      setActiveTab('events');
      fetchData();

    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to save event";
      toast.error(msg);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/org/${orgId}/team`, newMember);
      toast.success(`${newMember.role} added successfully`);
      setNewMember({ email: '', role: 'coordinator' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/org/${orgId}/team/${userId}`);
      toast.success("Member removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const handleEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setNewEvent({
      name: ev.name,
      date: ev.date?.slice(0, 16) || '',
      registration_deadline: ev.registration_deadline?.slice(0, 16) || '',
      venue: ev.venue || '',
      description: ev.description || '',
      tags: (ev.tags || []).join(', '),
      isPrivate: ev.is_private || false
    });

    setTargetDepts(ev.target_audience?.depts || []);
    setTargetHostels(ev.target_audience?.hostels || []);
    setTargetYears((ev.target_audience?.years || []).map(String));
    setFormSchema(ev.custom_form_schema || []);

    setActiveTab('create');
  };

  const handleDownloadCSV = async (eventId) => {
    try {
      const response = await api.get(
        `/org/${orgId}/events/${eventId}/csv`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `event_${eventId}_registrations.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download CSV");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/org/${orgId}/events/${eventId}`);
      toast.success("Event deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  if (loading) return <Loader />;

  const isHead = stats?.your_role && HEAD_ROLES.includes(stats.your_role.toLowerCase());

  return (
    <div className="container-fluid">

      {/* ✅ NEW: Registrations Modal */}
      {regModalEvent && (
        <RegistrationsModal
          event={regModalEvent}
          orgId={orgId}
          onClose={() => setRegModalEvent(null)}
        />
      )}

      <div className="org-header">
        <div className="org-header-top">
          <div>
            <OrgBanner orgId={orgId} orgName={stats?.org_name} bannerUrl={stats?.org_banner} />
            <h2 className="fw-bold mt-2" style={{ color: 'var(--text-primary)' }}>{stats?.org_name} Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Role: <span className="badge bg-purple">{stats?.your_role}</span>
            </p>
          </div>
          <div className="pill-tab-nav">
            <button className={`pill-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <BarChart3 size={16} /> Overview
            </button>
            <button className={`pill-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
              <Eye size={16} /> Events
            </button>
            <button className={`pill-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
              <Users size={16} /> Team
            </button>
            <button
              className={`pill-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setEditingEventId(null);
                setActiveTab('create');
              }}
            >
              <Plus size={16} /> Create
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="stat-card-modern">
              <div className="stat-icon purple"><Calendar size={28} /></div>
              <div>
                <div className="stat-value">{stats?.total_events}</div>
                <div className="stat-label">Total Events</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="stat-card-modern">
              <div className="stat-icon green"><Users size={28} /></div>
              <div>
                <div className="stat-value">{stats?.total_registrations}</div>
                <div className="stat-label">Total Registrations</div>
              </div>
            </div>
          </div>
          <div className="col-12 mt-4">
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Analytics</h5>
              <div className="row g-4">
                <div className="col-md-6" style={{ height: '300px' }}>
                  <DemographicsChart type="doughnut" title="Audience by Dept" data={stats?.dept_analytics || {}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="glass-card p-4">
          <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your Events</h5>
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td className="fw-semibold">{ev.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(ev.date)}</td>
                    <td>{ev.is_private ? <span className="badge-visibility private"><Lock size={12} /> Private</span> : <span className="badge-visibility public"><Globe size={12} /> Public</span>}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* ✅ NEW: Registrations count button */}
                        <button
                          className="btn-action primary"
                          onClick={() => setRegModalEvent(ev)}
                          title="View registrations count"
                        >
                          <Users size={14} /> Regs
                        </button>

                        <button
                          className="btn-action success"
                          onClick={() => handleDownloadCSV(ev.id)}
                          title="Download CSV"
                        >
                          <Download size={14} /> CSV
                        </button>

                        {isHead && (
                          <>
                            <button
                              className="btn-action primary"
                              onClick={() => handleEditEvent(ev)}
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              className="btn-action danger"
                              onClick={() => handleDeleteEvent(ev.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="row g-4">
          {isHead && (
            <div className="col-md-4">
              <div className="glass-card p-4 h-100">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <UserPlus size={18} className="text-purple" /> Add Member
                </h5>
                <form onSubmit={handleAddMember}>
                  <div className="mb-3">
                    <label className="form-label-modern">IITD Email</label>
                    <input
                      type="email"
                      className="form-control modern-input"
                      placeholder="e.g. cs1230001@iitd.ac.in"
                      value={newMember.email}
                      onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-modern">Role</label>
                    <select
                      className="form-select modern-input"
                      value={newMember.role}
                      onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                    >
                      {TEAM_ROLES.map(role => (
                        <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-purple w-100">Add to Team</button>
                </form>
              </div>
            </div>
          )}

          <div className={isHead ? "col-md-8" : "col-12"}>
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Team Members</h5>
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      {isHead && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {team.map(member => (
                      <tr key={member.user_id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="member-avatar-sm">{member.name.charAt(0)}</div>
                            <span className="fw-semibold">{member.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{member.email}</td>
                        <td>
                          <span className={`badge ${HEAD_ROLES.includes(member.role) ? 'bg-danger' : 'bg-info text-dark'}`}>
                            {member.role}
                          </span>
                        </td>
                        {isHead && (
                          <td>
                            {!HEAD_ROLES.includes(member.role.toLowerCase()) && (
                              <button
                                className="btn-action danger"
                                onClick={() => handleRemoveMember(member.user_id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="glass-form-card">
          <h4 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingEventId ? "Edit Event" : "Create New Event"}
          </h4>
          <form onSubmit={handleCreateEvent}>
            <p className="text-muted small">Event Form Fields loaded...</p>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label-modern">Event Name</label>
                <input type="text" className="form-control modern-input" required
                  value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label-modern">Date & Time</label>
                <input type="datetime-local" className="form-control modern-input" required
                  value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label-modern">Registration Deadline <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                <input type="datetime-local" className="form-control modern-input"
                  value={newEvent.registration_deadline} onChange={e => setNewEvent({ ...newEvent, registration_deadline: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label-modern">Venue</label>
                <input type="text" className="form-control modern-input" required
                  value={newEvent.venue} onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label-modern">Description</label>
                <textarea className="form-control modern-input" rows="3" required
                  value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>

              <div className="col-12 form-section">
                <div className="form-section-title">
                  <Users size={16} className="section-icon" /> Audience Targeting
                </div>
              </div>

              <div className="col-md-6">
                <MultiSelect
                  label="Target Departments"
                  options={DEPARTMENTS}
                  selected={targetDepts}
                  onChange={setTargetDepts}
                  placeholder="Select departments..."
                />
              </div>

              <div className="col-md-6">
                <MultiSelect
                  label="Target Hostels"
                  options={HOSTELS}
                  selected={targetHostels}
                  onChange={setTargetHostels}
                  placeholder="Select hostels..."
                />
              </div>

              <div className="col-md-6">
                <MultiSelect
                  label="Target Years"
                  options={YEARS.map(String)}
                  selected={targetYears}
                  onChange={setTargetYears}
                  placeholder="Select years..."
                />
              </div>

              <div className="col-md-6 d-flex align-items-center">
                <div className="form-check form-switch mt-3">
                  <input className="form-check-input" type="checkbox" id="privateSwitch"
                    checked={newEvent.isPrivate} onChange={e => setNewEvent({ ...newEvent, isPrivate: e.target.checked })} />
                  <label className="form-check-label" style={{ color: 'var(--text-primary)' }} htmlFor="privateSwitch">Member-Only (Hidden from feed)</label>
                </div>
              </div>

              <div className="col-12 form-section">
                <div className="form-section-title">
                  <Calendar size={16} className="section-icon" /> Media & Metadata
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label-modern">Poster Image</label>
                <input type="file" className="form-control modern-input" accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div className="col-md-6">
                <label className="form-label-modern">Tags (comma separated)</label>
                <input type="text" className="form-control modern-input" placeholder="Tech, Fun"
                  value={newEvent.tags} onChange={e => setNewEvent({ ...newEvent, tags: e.target.value })} />
              </div>
            </div>

            <DynamicFormBuilder schema={formSchema} setSchema={setFormSchema} />

            <button type="submit" className="btn btn-purple w-100 mt-4 py-2 fw-bold">
              {editingEventId ? "Update Event" : "Publish Event"}
            </button>

          </form>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;
