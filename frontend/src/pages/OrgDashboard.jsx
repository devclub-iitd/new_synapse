// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import api from '../api/axios';
// import { Calendar, Users, BarChart3, Plus, Download, Eye, Lock, Globe, Trash2, UserPlus, X, Edit, UserCheck } from 'lucide-react';
// import DynamicFormBuilder from '../components/Forms/DynamicFormBuilder';
// import DemographicsChart from '../components/Charts/DemographicsChart';
// import Loader from '../components/UI/Loader';
// import { formatDate } from '../utils/dateUtils';
// import toast from 'react-hot-toast';

// import { DEPARTMENTS, HOSTELS, YEARS, HEAD_ROLES, TEAM_ROLES } from '../utils/constants';
// import OrgBanner from '../components/UI/OrgBanner';

// const toLocalInputValue = (utcStr) => {
//   if (!utcStr) return '';
//   const str = utcStr.endsWith('Z') ? utcStr : `${utcStr}Z`;
//   const d = new Date(str);
//   const offset = d.getTimezoneOffset() * 60000;
//   return new Date(d.getTime() - offset).toISOString().slice(0, 16);
// };

// // --- MultiSelect ---
// const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
//   const handleSelect = (e) => {
//     const value = e.target.value;
//     if (value && !selected.includes(value)) onChange([...selected, value]);
//     e.target.value = "";
//   };
//   const removeOption = (v) => onChange(selected.filter(i => i !== v));

//   return (
//     <div className="mb-3">
//       <label className="form-label-modern">{label}</label>
//       <select className="form-select modern-input mb-2" onChange={handleSelect} defaultValue="">
//         <option value="" disabled>{placeholder || "Select to add..."}</option>
//         {options.map(opt => (
//           <option key={opt} value={opt} disabled={selected.includes(opt)}>{opt}</option>
//         ))}
//       </select>
//       <div className="multiselect-chips">
//         {selected.length > 0 ? selected.map(item => (
//           <span key={item} className="multiselect-chip">
//             {item}
//             <span className="chip-remove" onClick={() => removeOption(item)}><X size={13} /></span>
//           </span>
//         )) : <small style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Open to everyone</small>}
//       </div>
//     </div>
//   );
// };

// // --- RegistrationsModal ---
// const RegistrationsModal = ({ event, orgId, onClose }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCount = async () => {
//       try {
//         const res = await api.get(`/org/${orgId}/events/${event.id}/registrations`);
//         setData({ count: res.data.length });
//       } catch (err) {
//         toast.error("Failed to load registration count");
//         onClose();
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCount();
//   }, [event.id, orgId, onClose]);

//   return (
//     <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center' }} onClick={onClose}>
//       <div style={{ background:'var(--bg-card,#1a1a2e)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'2rem',minWidth:'320px',maxWidth:'420px',width:'90%',boxShadow:'0 25px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
//         <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem' }}>
//           <div>
//             <h5 style={{ color:'var(--text-primary)',fontWeight:700,margin:0 }}>Registrations</h5>
//             <p style={{ color:'var(--text-secondary)',fontSize:'0.85rem',margin:'4px 0 0' }}>{event.name}</p>
//           </div>
//           <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)',border:'none',borderRadius:'8px',color:'var(--text-secondary)',cursor:'pointer',padding:'6px 8px',display:'flex',alignItems:'center' }}>
//             <X size={16} />
//           </button>
//         </div>
//         {loading ? (
//           <div style={{ textAlign:'center',padding:'2rem 0',color:'var(--text-secondary)' }}>
//             <div className="spinner-border spinner-border-sm" role="status" />
//             <p style={{ marginTop:'0.75rem',fontSize:'0.9rem' }}>Loading...</p>
//           </div>
//         ) : (
//           <div>
//             <div style={{ background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'12px',padding:'1.5rem',textAlign:'center',marginBottom:'1rem' }}>
//               <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'6px' }}>
//                 <UserCheck size={24} style={{ color:'#8b5cf6' }} />
//                 <span style={{ fontSize:'2.5rem',fontWeight:800,color:'var(--text-primary)',lineHeight:1 }}>{data?.count ?? 0}</span>
//               </div>
//               <p style={{ color:'var(--text-secondary)',margin:0,fontSize:'0.9rem' }}>Total Registrations</p>
//             </div>
//             <div style={{ display:'flex',justifyContent:'space-between',padding:'0.75rem 1rem',background:'rgba(255,255,255,0.04)',borderRadius:'8px',fontSize:'0.85rem' }}>
//               <span style={{ color:'var(--text-secondary)' }}>Event Date</span>
//               <span style={{ color:'var(--text-primary)',fontWeight:600 }}>{formatDate(event.date)}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const OrgDashboard = () => {
//   const { orgId } = useParams();
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [stats, setStats] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [team, setTeam] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingEventId, setEditingEventId] = useState(null);
//   const [regModalEvent, setRegModalEvent] = useState(null);

//   const [newEvent, setNewEvent] = useState({ name:'',date:'',registration_deadline:'',venue:'',description:'',tags:'',isPrivate:false });
//   const [targetDepts, setTargetDepts] = useState([]);
//   const [targetHostels, setTargetHostels] = useState([]);
//   const [targetYears, setTargetYears] = useState([]);
//   const [formSchema, setFormSchema] = useState([]);
//   const [imageFile, setImageFile] = useState(null);
//   const [newMember, setNewMember] = useState({ email:'',role:'coordinator' });

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [dashRes, eventsRes, teamRes] = await Promise.all([
//         api.get(`/org/${orgId}/dashboard`),
//         api.get(`/org/${orgId}/events`),
//         api.get(`/org/${orgId}/team`)
//       ]);
//       setStats(dashRes.data);
//       setEvents(eventsRes.data);
//       setTeam(teamRes.data);
//     } catch (err) {
//       toast.error("Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   }, [orgId]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   useEffect(() => {
//     if (!editingEventId && activeTab === 'create') {
//       setTargetDepts(DEPARTMENTS);
//       setTargetHostels(HOSTELS);
//     }
//   }, [activeTab, editingEventId]);

//   const handleCreateEvent = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('name', newEvent.name);
//     formData.append('date', new Date(newEvent.date).toISOString());
//     if (newEvent.registration_deadline) formData.append('registration_deadline', new Date(newEvent.registration_deadline).toISOString());
//     formData.append('venue', newEvent.venue);
//     formData.append('description', newEvent.description);
//     formData.append('tags', JSON.stringify(newEvent.tags.split(',').map(t => t.trim()).filter(Boolean)));
//     formData.append('custom_form_schema', JSON.stringify(formSchema));
//     formData.append('is_private', newEvent.isPrivate);
//     if (imageFile) formData.append('photo', imageFile);
//     formData.append('target_audience', JSON.stringify({ depts: targetDepts, hostels: targetHostels, years: targetYears.map(y => parseInt(y)) }));

//     try {
//       if (editingEventId) {
//         await api.put(`/org/${orgId}/events/${editingEventId}`, formData);
//         toast.success("Event updated successfully!");
//         setEditingEventId(null);
//       } else {
//         await api.post(`/org/${orgId}/events`, formData);
//         toast.success("Event created successfully!");
//         setNewEvent({ name:'',date:'',venue:'',description:'',tags:'',isPrivate:false });
//         setTargetDepts([]); setTargetHostels([]); setTargetYears([]); setFormSchema([]); setImageFile(null);
//       }
//       setActiveTab('events');
//       fetchData();
//     } catch (err) {
//       toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to save event");
//     }
//   };

//   const handleAddMember = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post(`/org/${orgId}/team`, newMember);
//       toast.success(`${newMember.role} added successfully`);
//       setNewMember({ email:'',role:'coordinator' });
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.detail || "Failed to add member");
//     }
//   };

//   const handleRemoveMember = async (userId) => {
//     if (!window.confirm("Remove this member?")) return;
//     try {
//       await api.delete(`/org/${orgId}/team/${userId}`);
//       toast.success("Member removed");
//       fetchData();
//     } catch (err) { toast.error("Failed to remove member"); }
//   };

//   const handleEditEvent = (ev) => {
//     setEditingEventId(ev.id);
//     setNewEvent({ name:ev.name, date:toLocalInputValue(ev.date), registration_deadline:toLocalInputValue(ev.registration_deadline), venue:ev.venue||'', description:ev.description||'', tags:(ev.tags||[]).join(', '), isPrivate:ev.is_private||false });
//     setTargetDepts(ev.target_audience?.depts||[]);
//     setTargetHostels(ev.target_audience?.hostels||[]);
//     setTargetYears((ev.target_audience?.years||[]).map(String));
//     setFormSchema(ev.custom_form_schema||[]);
//     setActiveTab('create');
//   };

//   const handleDownloadCSV = async (eventId) => {
//     try {
//       const response = await api.get(`/org/${orgId}/events/${eventId}/csv`, { responseType:'blob' });
//       const blob = new Blob([response.data], { type:'text/csv' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url; link.download = `event_${eventId}_registrations.csv`;
//       document.body.appendChild(link); link.click(); link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) { toast.error("Failed to download CSV"); }
//   };

//   const handleDeleteEvent = async (eventId) => {
//     if (!window.confirm("Delete this event?")) return;
//     try {
//       await api.delete(`/org/${orgId}/events/${eventId}`);
//       toast.success("Event deleted");
//       fetchData();
//     } catch (err) { toast.error("Failed to delete event"); }
//   };

//   if (loading) return <Loader />;

//   const isHead = stats?.your_role && HEAD_ROLES.includes(stats.your_role.toLowerCase());

//   return (
//     <div className="container-fluid">
//       {regModalEvent && <RegistrationsModal event={regModalEvent} orgId={orgId} onClose={() => setRegModalEvent(null)} />}

//       <div className="org-header">
//         <div className="org-header-top">
//           <div>
//             <OrgBanner orgId={orgId} orgName={stats?.org_name} bannerUrl={stats?.org_banner} />
//             <h2 className="fw-bold mt-2" style={{ color:'var(--text-primary)' }}>{stats?.org_name} Dashboard</h2>
//             <p style={{ color:'var(--text-secondary)' }}>Role: <span className="badge bg-purple">{stats?.your_role}</span></p>
//           </div>
//           <div className="pill-tab-nav">
//             <button className={`pill-tab ${activeTab==='dashboard'?'active':''}`} onClick={() => setActiveTab('dashboard')}><BarChart3 size={15} /> Overview</button>
//             <button className={`pill-tab ${activeTab==='events'?'active':''}`} onClick={() => setActiveTab('events')}><Eye size={15} /> Events</button>
//             <button className={`pill-tab ${activeTab==='team'?'active':''}`} onClick={() => setActiveTab('team')}><Users size={15} /> Team</button>
//             <button className={`pill-tab ${activeTab==='create'?'active':''}`} onClick={() => { setEditingEventId(null); setActiveTab('create'); }}><Plus size={15} /> Create</button>
//           </div>
//         </div>
//       </div>

//       {/* ── OVERVIEW ── */}
//       {activeTab === 'dashboard' && (
//         <div className="row g-3">

//           {/* Stat Cards Row — compact, inline, auto-width */}
//           <div className="col-12">
//             <div className="org-stats-row">
//               <div className="org-stat-chip">
//                 <div className="org-stat-chip-icon purple"><Calendar size={18} /></div>
//                 <div>
//                   <div className="org-stat-chip-value">{stats?.total_events ?? 0}</div>
//                   <div className="org-stat-chip-label">Total Events</div>
//                 </div>
//               </div>
//               <div className="org-stat-chip">
//                 <div className="org-stat-chip-icon green"><Users size={18} /></div>
//                 <div>
//                   <div className="org-stat-chip-value">{stats?.total_registrations ?? 0}</div>
//                   <div className="org-stat-chip-label">Total Registrations</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Chart — full width, proper height */}
//           <div className="col-12">
//             <div className="glass-card p-4">
//               <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Audience by Department</h5>
//               <div className="org-chart-container">
//                 <DemographicsChart type="doughnut" title="" data={stats?.dept_analytics || {}} />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── EVENTS ── */}
//       {activeTab === 'events' && (
//         <div className="glass-card p-4">
//           <h5 className="fw-bold mb-4" style={{ color:'var(--text-primary)' }}>Your Events</h5>
//           <div className="modern-table-wrapper">
//             <table className="modern-table">
//               <thead>
//                 <tr>
//                   <th>Event</th>
//                   <th className="d-none d-md-table-cell">Date</th>
//                   <th className="d-none d-sm-table-cell">Visibility</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {events.map(ev => (
//                   <tr key={ev.id}>
//                     <td>
//                       <div className="fw-semibold" style={{ fontSize:'0.88rem' }}>{ev.name}</div>
//                       {/* Date shown under name on mobile */}
//                       <div className="d-md-none small" style={{ color:'var(--text-muted)',fontSize:'0.72rem' }}>{formatDate(ev.date)}</div>
//                     </td>
//                     <td className="d-none d-md-table-cell" style={{ color:'var(--text-secondary)' }}>{formatDate(ev.date)}</td>
//                     <td className="d-none d-sm-table-cell">
//                       {ev.is_private
//                         ? <span className="badge-visibility private"><Lock size={12} /> Private</span>
//                         : <span className="badge-visibility public"><Globe size={12} /> Public</span>}
//                     </td>
//                     <td>
//                       {/* Compact action buttons — icon only on mobile, icon+label on desktop */}
//                       <div className="d-flex gap-1 flex-wrap">
//                         <button className="btn-action primary" onClick={() => setRegModalEvent(ev)} title="Registrations">
//                           <Users size={13} /><span className="d-none d-lg-inline"> Regs</span>
//                         </button>
//                         <button className="btn-action success" onClick={() => handleDownloadCSV(ev.id)} title="Download CSV">
//                           <Download size={13} /><span className="d-none d-lg-inline"> CSV</span>
//                         </button>
//                         {isHead && (
//                           <>
//                             <button className="btn-action primary" onClick={() => handleEditEvent(ev)} title="Edit">
//                               <Edit size={13} />
//                             </button>
//                             <button className="btn-action danger" onClick={() => handleDeleteEvent(ev.id)} title="Delete">
//                               <Trash2 size={13} />
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ── TEAM ── */}
//       {activeTab === 'team' && (
//         <div className="row g-4">
//           {isHead && (
//             <div className="col-12 col-md-4">
//               <div className="glass-card p-4">
//                 <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color:'var(--text-primary)' }}>
//                   <UserPlus size={18} className="text-purple" /> Add Member
//                 </h5>
//                 <form onSubmit={handleAddMember}>
//                   <div className="mb-3">
//                     <label className="form-label-modern">IITD Email</label>
//                     <input type="email" className="form-control modern-input" placeholder="e.g. cs1230001@iitd.ac.in"
//                       value={newMember.email} onChange={e => setNewMember({...newMember,email:e.target.value})} required />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label-modern">Role</label>
//                     <select className="form-select modern-input" value={newMember.role} onChange={e => setNewMember({...newMember,role:e.target.value})}>
//                       {TEAM_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase()+role.slice(1)}</option>)}
//                     </select>
//                   </div>
//                   <button type="submit" className="btn btn-purple w-100">Add to Team</button>
//                 </form>
//               </div>
//             </div>
//           )}
//           <div className={isHead ? "col-12 col-md-8" : "col-12"}>
//             <div className="glass-card p-4">
//               <h5 className="fw-bold mb-4" style={{ color:'var(--text-primary)' }}>Team Members</h5>
//               <div className="modern-table-wrapper">
//                 <table className="modern-table">
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       <th className="d-none d-md-table-cell">Email</th>
//                       <th>Role</th>
//                       {isHead && <th>Action</th>}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {team.map(member => (
//                       <tr key={member.user_id}>
//                         <td>
//                           <div className="d-flex align-items-center gap-2">
//                             <div className="member-avatar-sm">{member.name.charAt(0)}</div>
//                             <div>
//                               <div className="fw-semibold" style={{ fontSize:'0.88rem' }}>{member.name}</div>
//                               {/* Email under name on mobile */}
//                               <div className="d-md-none small" style={{ color:'var(--text-muted)',fontSize:'0.72rem' }}>{member.email}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="d-none d-md-table-cell" style={{ color:'var(--text-secondary)' }}>{member.email}</td>
//                         <td>
//                           <span className={`badge ${HEAD_ROLES.includes(member.role) ? 'bg-danger' : 'bg-info text-dark'}`}>
//                             {member.role}
//                           </span>
//                         </td>
//                         {isHead && (
//                           <td>
//                             {!HEAD_ROLES.includes(member.role.toLowerCase()) && (
//                               <button className="btn-action danger" onClick={() => handleRemoveMember(member.user_id)}>
//                                 <Trash2 size={14} />
//                               </button>
//                             )}
//                           </td>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── CREATE / EDIT ── */}
//       {activeTab === 'create' && (
//         <div className="glass-form-card">
//           <h4 className="fw-bold mb-4" style={{ color:'var(--text-primary)' }}>
//             {editingEventId ? "Edit Event" : "Create New Event"}
//           </h4>
//           <form onSubmit={handleCreateEvent}>
//             <p className="text-muted small">Event Form Fields loaded...</p>
//             <div className="row g-3">
//               <div className="col-12">
//                 <label className="form-label-modern">Event Name</label>
//                 <input type="text" className="form-control modern-input" required
//                   value={newEvent.name} onChange={e => setNewEvent({...newEvent,name:e.target.value})} />
//               </div>
//               <div className="col-12 col-md-6">
//                 <label className="form-label-modern">Date & Time</label>
//                 <input type="datetime-local" className="form-control modern-input" required
//                   value={newEvent.date} onChange={e => setNewEvent({...newEvent,date:e.target.value})} />
//               </div>
//               <div className="col-12 col-md-6">
//                 <label className="form-label-modern">Registration Deadline <span style={{ color:'var(--text-muted)',fontSize:'0.8rem' }}>(optional)</span></label>
//                 <input type="datetime-local" className="form-control modern-input"
//                   value={newEvent.registration_deadline} onChange={e => setNewEvent({...newEvent,registration_deadline:e.target.value})} />
//               </div>
//               <div className="col-12 col-md-6">
//                 <label className="form-label-modern">Venue</label>
//                 <input type="text" className="form-control modern-input" required
//                   value={newEvent.venue} onChange={e => setNewEvent({...newEvent,venue:e.target.value})} />
//               </div>
//               <div className="col-12">
//                 <label className="form-label-modern">Description</label>
//                 <textarea className="form-control modern-input" rows="3" required
//                   value={newEvent.description} onChange={e => setNewEvent({...newEvent,description:e.target.value})} />
//               </div>

//               <div className="col-12 form-section">
//                 <div className="form-section-title"><Users size={16} className="section-icon" /> Audience Targeting</div>
//               </div>
//               <div className="col-12 col-md-6">
//                 <MultiSelect label="Target Departments" options={DEPARTMENTS} selected={targetDepts} onChange={setTargetDepts} placeholder="Select departments..." />
//               </div>
//               <div className="col-12 col-md-6">
//                 <MultiSelect label="Target Hostels" options={HOSTELS} selected={targetHostels} onChange={setTargetHostels} placeholder="Select hostels..." />
//               </div>
//               <div className="col-12 col-md-6">
//                 <MultiSelect label="Target Years" options={YEARS.map(String)} selected={targetYears} onChange={setTargetYears} placeholder="Select years..." />
//               </div>
//               <div className="col-12 col-md-6 d-flex align-items-center">
//                 <div className="form-check form-switch mt-3">
//                   <input className="form-check-input" type="checkbox" id="privateSwitch"
//                     checked={newEvent.isPrivate} onChange={e => setNewEvent({...newEvent,isPrivate:e.target.checked})} />
//                   <label className="form-check-label" style={{ color:'var(--text-primary)' }} htmlFor="privateSwitch">Member-Only (Hidden from feed)</label>
//                 </div>
//               </div>

//               <div className="col-12 form-section">
//                 <div className="form-section-title"><Calendar size={16} className="section-icon" /> Media & Metadata</div>
//               </div>
//               <div className="col-12 col-md-6">
//                 <label className="form-label-modern">Poster Image</label>
//                 <input type="file" className="form-control modern-input" accept="image/*"
//                   onChange={e => setImageFile(e.target.files[0])} />
//               </div>
//               <div className="col-12 col-md-6">
//                 <label className="form-label-modern">Tags (comma separated)</label>
//                 <input type="text" className="form-control modern-input" placeholder="Tech, Fun"
//                   value={newEvent.tags} onChange={e => setNewEvent({...newEvent,tags:e.target.value})} />
//               </div>
//             </div>

//             <DynamicFormBuilder schema={formSchema} setSchema={setFormSchema} />

//             <button type="submit" className="btn btn-purple w-100 mt-4 py-2 fw-bold">
//               {editingEventId ? "Update Event" : "Publish Event"}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrgDashboard;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Users, BarChart3, Plus, Download, Eye, Lock, Globe, Trash2, UserPlus, X, Edit, UserCheck, Tag, Upload, Save, Check, ChevronDown, Search } from 'lucide-react';
import DynamicFormBuilder from '../components/Forms/DynamicFormBuilder';
import DemographicsChart from '../components/Charts/DemographicsChart';
import Loader from '../components/UI/Loader';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

import { DEPARTMENTS, HOSTELS, YEARS, HEAD_ROLES, TEAM_ROLES, GENRES } from '../utils/constants';
import OrgBanner from '../components/UI/OrgBanner';
import SearchableDropdown from '../components/UI/SearchableDropdown';
import { capitalize, orgDisplayName } from '../utils/capitalize';
import ConfirmationModal from '../components/UI/ConfirmationModal';

const toLocalInputValue = (utcStr) => {
  if (!utcStr) return '';
  const str = utcStr.endsWith('Z') ? utcStr : `${utcStr}Z`;
  const d = new Date(str);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};


// Shared avatar helper — photo if available, else coloured initial
const UserAvatar = ({ name, photoUrl, size = 38 }) => {
  const style = {
    width: size, height: size, borderRadius: '10px',
    background: 'var(--brand-gradient)', color: 'white',
    fontWeight: 700, fontSize: size * 0.36 + 'px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden',
  };
  if (photoUrl) {
    return (
      <div style={style}>
        <img
          src={photoUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = name?.charAt(0) || '?'; }}
        />
      </div>
    );
  }
  return <div style={style}>{name?.charAt(0) || '?'}</div>;
};

// --- MultiSelect (with inline checklist dropdown) ---
const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleOption = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(i => i !== val));
    } else {
      onChange([...selected, val]);
    }
  };
  const removeOption = (v) => onChange(selected.filter(i => i !== v));

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mb-3">
      <label className="form-label-modern">{label}</label>
      <div className="ms-container" ref={containerRef}>
        <button
          type="button"
          className={`sd-trigger ${isOpen ? 'sd-open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sd-placeholder">{placeholder || "Select..."}</span>
          <ChevronDown size={15} className={`sd-chevron ${isOpen ? 'sd-chevron-up' : ''}`} />
        </button>
        {isOpen && (
          <div className="ms-dropdown">
            <div className="sd-search-wrap">
              <Search size={14} className="sd-search-icon" />
              <input
                type="text"
                className="sd-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button type="button" className="sd-search-clear" onClick={() => setSearch('')}><X size={12} /></button>
              )}
            </div>
            <ul className="sd-options">
              {filtered.length > 0 ? filtered.map(opt => (
                <li
                  key={opt}
                  className={`sd-option ms-check-option ${selected.includes(opt) ? 'sd-selected' : ''}`}
                  onClick={() => toggleOption(opt)}
                >
                  <span className="ms-check-box">{selected.includes(opt) && <Check size={13} />}</span>
                  {opt}
                </li>
              )) : (
                <li className="sd-no-results">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="multiselect-chips mt-2">
        {selected.length > 0 ? selected.map(item => (
          <span key={item} className="multiselect-chip">
            {item}
            <span className="chip-remove" onClick={() => removeOption(item)}><X size={13} /></span>
          </span>
        )) : <small style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Open to everyone</small>}
      </div>
    </div>
  );
};

// --- RegistrationsModal ---
const RegistrationsModal = ({ event, orgId, onClose }) => {
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        const res = await api.get(`/org/${orgId}/events/${event.id}/registrations`);
        setRegistrants(res.data);
      } catch (err) {
        toast.error("Failed to load registrations");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchRegs();
  }, [event.id, orgId, onClose]);

  const filtered = registrants.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.entry_number?.toLowerCase().includes(search.toLowerCase())
  );

  const formatRegDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isMobile = window.innerWidth < 640;

  return (
    <div
      style={{ position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding: isMobile ? '12px' : '20px' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--bg-secondary)',border:'1px solid var(--border-primary)',borderRadius: isMobile ? '16px' : '20px',width:'100%',maxWidth:'780px',maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 32px 80px rgba(0,0,0,0.6)',overflow:'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ padding: isMobile ? '16px 16px 0' : '24px 28px 0', flexShrink:0 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px' }}>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px' }}>
                <div style={{ width:32,height:32,borderRadius:'9px',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Users size={16} style={{ color:'#8b5cf6' }} />
                </div>
                <h5 style={{ color:'var(--text-primary)',fontWeight:700,margin:0,fontSize: isMobile ? '1rem' : '1.1rem' }}>Registrations</h5>
              </div>
              <p style={{ color:'var(--text-secondary)',fontSize:'0.82rem',margin:0,paddingLeft:'42px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{event.name}</p>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'8px',flexShrink:0,marginLeft:'12px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'5px',padding:'5px 10px',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:'20px' }}>
                <UserCheck size={13} style={{ color:'#8b5cf6' }} />
                <span style={{ color:'#a78bfa',fontWeight:700,fontSize:'0.85rem' }}>{registrants.length}</span>
                {!isMobile && <span style={{ color:'var(--text-muted)',fontSize:'0.75rem' }}>registered</span>}
              </div>
              <button onClick={onClose} style={{ width:32,height:32,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border-primary)',borderRadius:'8px',color:'var(--text-secondary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ display:'flex',alignItems:'center',gap:'8px',padding:'0 12px',height:'36px',background:'var(--bg-input)',border:'1px solid var(--border-primary)',borderRadius:'10px',marginBottom:'14px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search by name, email or entry number..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background:'transparent',border:'none',outline:'none',color:'var(--text-primary)',fontSize:'0.83rem',flex:1,minWidth:0 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',padding:0,flexShrink:0 }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Column headers — desktop only */}
          {!isMobile && (
            <div style={{ display:'grid',gridTemplateColumns:'1.4fr 1.8fr 1fr 1fr 1fr',borderBottom:'1px solid var(--border-primary)',paddingBottom:'10px' }}>
              {['Name','Email','Department','Hostel','Registered'].map(h => (
                <div key={h} style={{ fontSize:'0.67rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px',color:'var(--text-muted)',padding:'0 4px' }}>{h}</div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY:'auto',flex:1,padding: isMobile ? '0 16px 16px' : '0 28px 24px' }}>
          {loading ? (
            <div style={{ textAlign:'center',padding:'3rem 0',color:'var(--text-secondary)' }}>
              <div className="spinner-border spinner-border-sm" role="status" />
              <p style={{ marginTop:'0.75rem',fontSize:'0.88rem' }}>Loading registrations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center',padding:'3rem 0',color:'var(--text-muted)',fontSize:'0.88rem' }}>
              {search ? 'No results match your search.' : 'No registrations yet.'}
            </div>
          ) : isMobile ? (
            /* ── MOBILE: card-per-row layout ── */
            <div style={{ display:'flex',flexDirection:'column',gap:'8px',paddingTop:'12px' }}>
              {filtered.map((r, i) => (
                <div key={i} style={{ background:'var(--bg-input)',border:'1px solid var(--border-primary)',borderRadius:'12px',padding:'12px 14px' }}>
                  {/* Top row: avatar + name + entry + date */}
                  <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px' }}>
                    <UserAvatar name={r.name} photoUrl={r.photo_url} size={34} />
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:'0.88rem',color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.name}</div>
                      <div style={{ fontSize:'0.7rem',color:'var(--text-muted)' }}>{r.entry_number}</div>
                    </div>
                    <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',flexShrink:0 }}>{formatRegDate(r.registered_at)}</div>
                  </div>
                  {/* Bottom row: email / dept / hostel pills */}
                  <div style={{ display:'flex',flexWrap:'wrap',gap:'6px' }}>
                    <span style={{ fontSize:'0.72rem',color:'var(--text-secondary)',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border-primary)',borderRadius:'6px',padding:'3px 8px',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.email}</span>
                    {r.department && <span style={{ fontSize:'0.72rem',color:'#a78bfa',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:'6px',padding:'3px 8px' }}>{r.department}</span>}
                    {r.hostel && <span style={{ fontSize:'0.72rem',color:'var(--text-secondary)',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border-primary)',borderRadius:'6px',padding:'3px 8px' }}>{r.hostel}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── DESKTOP: grid table ── */
            filtered.map((r, i) => (
              <div
                key={i}
                style={{ display:'grid',gridTemplateColumns:'1.4fr 1.8fr 1fr 1fr 1fr',padding:'13px 4px',borderBottom:'1px solid var(--border-secondary)',alignItems:'center',transition:'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div style={{ display:'flex',alignItems:'center',gap:'10px',minWidth:0 }}>
                  <UserAvatar name={r.name} photoUrl={r.photo_url} size={30} />
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:600,fontSize:'0.85rem',color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.name}</div>
                    <div style={{ fontSize:'0.7rem',color:'var(--text-muted)' }}>{r.entry_number}</div>
                  </div>
                </div>
                <div style={{ fontSize:'0.8rem',color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingRight:'8px' }}>{r.email}</div>
                <div style={{ fontSize:'0.8rem',color:'var(--text-secondary)' }}>{r.department || '—'}</div>
                <div style={{ fontSize:'0.8rem',color:'var(--text-secondary)' }}>{r.hostel || '—'}</div>
                <div style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>{formatRegDate(r.registered_at)}</div>
              </div>
            ))
          )}
        </div>
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
  const [tabLoading, setTabLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState({});
  const [editingEventId, setEditingEventId] = useState(null);
  const [regModalEvent, setRegModalEvent] = useState(null);

  const [newEvent, setNewEvent] = useState({ name:'',date:'',registration_deadline:'',venue:'',description:'',tags:'',isPrivate:false });
  const [eventGenres, setEventGenres] = useState([]);
  const [orgGenres, setOrgGenres] = useState([]);
  const [savingGenres, setSavingGenres] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [targetDepts, setTargetDepts] = useState([]);
  const [targetHostels, setTargetHostels] = useState([]);
  const [targetYears, setTargetYears] = useState([]);
  const [formSchema, setFormSchema] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const posterInputRef = useRef(null);
  const [newMember, setNewMember] = useState({ email:'',role:'coordinator' });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null, loading: false });

  const loadedTabsRef = useRef({});

  const fetchDashboard = useCallback(async () => {
    const res = await api.get(`/org/${orgId}/dashboard`);
    setStats(res.data);
    const g = res.data.org_genres;
    setOrgGenres(g ? g.split(',').map(s => s.trim()).filter(Boolean) : []);
  }, [orgId]);

  const fetchEvents = useCallback(async () => {
    const res = await api.get(`/org/${orgId}/events`);
    setEvents(res.data);
  }, [orgId]);

  const fetchTeam = useCallback(async () => {
    const res = await api.get(`/org/${orgId}/team`);
    setTeam(res.data);
  }, [orgId]);

  const fetchTabData = useCallback(async (tab) => {
    if (loadedTabsRef.current[tab]) return;
    const isFirstLoad = Object.keys(loadedTabsRef.current).length === 0;
    isFirstLoad ? setLoading(true) : setTabLoading(true);
    try {
      if (tab === 'dashboard') {
        await fetchDashboard();
      } else if (tab === 'events' || tab === 'create') {
        await fetchEvents();
      } else if (tab === 'team') {
        await fetchTeam();
      }
      loadedTabsRef.current = { ...loadedTabsRef.current, [tab]: true };
      setLoadedTabs(prev => ({ ...prev, [tab]: true }));
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  }, [fetchDashboard, fetchEvents, fetchTeam]);

  useEffect(() => { fetchTabData(activeTab); }, [activeTab, fetchTabData]);

  // Reset and re-fetch when org changes
  useEffect(() => {
    loadedTabsRef.current = {};
    setLoadedTabs({});
    setStats(null);
    setEvents([]);
    setTeam([]);
    fetchTabData(activeTab);
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Full refresh (after create/edit/delete)
  const fetchData = useCallback(async () => {
    loadedTabsRef.current = {};
    setLoadedTabs({});
    setLoading(true);
    try {
      await Promise.all([fetchDashboard(), fetchEvents(), fetchTeam()]);
      const allLoaded = { dashboard: true, events: true, create: true, team: true };
      loadedTabsRef.current = allLoaded;
      setLoadedTabs(allLoaded);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally { setLoading(false); }
  }, [fetchDashboard, fetchEvents, fetchTeam]);

  useEffect(() => {
    if (!editingEventId && activeTab === 'create') {
      setTargetDepts(DEPARTMENTS);
      setTargetHostels(HOSTELS);
      setEventGenres([...orgGenres]);
    }
  }, [activeTab, editingEventId, orgGenres]);

  const handleSaveOrgGenres = async () => {
    setSavingGenres(true);
    try {
      await api.patch(`/org/${orgId}/genres`, { genres: orgGenres });
      toast.success("Genres updated!");
      setShowGenreModal(false);
    } catch (err) {
      toast.error("Failed to update genres");
    } finally {
      setSavingGenres(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newEvent.name);
    formData.append('date', new Date(newEvent.date).toISOString());
    if (newEvent.registration_deadline) formData.append('registration_deadline', new Date(newEvent.registration_deadline).toISOString());
    formData.append('venue', newEvent.venue);
    formData.append('description', newEvent.description);
    formData.append('tags', JSON.stringify(newEvent.tags.split(',').map(t => t.trim()).filter(Boolean)));
    formData.append('custom_form_schema', JSON.stringify(formSchema));
    formData.append('is_private', newEvent.isPrivate);
    if (newEvent.duration_hours) formData.append('duration_hours', newEvent.duration_hours);
    if (imageFile) formData.append('photo', imageFile);
    formData.append('target_audience', JSON.stringify({ depts: targetDepts, hostels: targetHostels, years: targetYears.map(y => parseInt(y)) }));
    formData.append('genres', JSON.stringify(eventGenres));

    try {
      if (editingEventId) {
        await api.put(`/org/${orgId}/events/${editingEventId}`, formData);
        toast.success("Event updated successfully!");
        setEditingEventId(null);
      } else {
        await api.post(`/org/${orgId}/events`, formData);
        toast.success("Event created successfully!");
        setNewEvent({ name:'',date:'',venue:'',description:'',tags:'',isPrivate:false,duration_hours:'' });
        setTargetDepts([]); setTargetHostels([]); setTargetYears([]); setFormSchema([]); setImageFile(null); setEventGenres([]);
      }
      setActiveTab('events');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || "Failed to save event");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/org/${orgId}/team`, newMember);
      toast.success(`${newMember.role} added successfully`);
      setNewMember({ email:'',role:'coordinator' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add member");
    }
  };

  const handleRemoveMember = (userId) => {
    setConfirmModal({
      open: true,
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member? This action cannot be undone.',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/org/${orgId}/team/${userId}`);
          toast.success('Member removed');
          fetchData();
        } catch (err) { toast.error('Failed to remove member'); }
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null, loading: false });
      },
    });
  };

  const handleEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setNewEvent({ name:ev.name, date:toLocalInputValue(ev.date), registration_deadline:toLocalInputValue(ev.registration_deadline), venue:ev.venue||'', description:ev.description||'', tags:(ev.tags||[]).join(', '), isPrivate:ev.is_private||false, duration_hours:ev.duration_hours||'' });
    setEventGenres(ev.genres || []);
    setTargetDepts(ev.target_audience?.depts||[]);
    setTargetHostels(ev.target_audience?.hostels||[]);
    setTargetYears((ev.target_audience?.years||[]).map(String));
    setFormSchema(ev.custom_form_schema||[]);
    setActiveTab('create');
  };

  const handleDownloadCSV = async (eventId) => {
    try {
      const response = await api.get(`/org/${orgId}/events/${eventId}/csv`, { responseType:'blob' });
      const blob = new Blob([response.data], { type:'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `event_${eventId}_registrations.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { toast.error("Failed to download CSV"); }
  };

  const handleDeleteEvent = (eventId) => {
    setConfirmModal({
      open: true,
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? All registrations will be lost. This action cannot be undone.',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/org/${orgId}/events/${eventId}`);
          toast.success('Event deleted');
          fetchData();
        } catch (err) { toast.error('Failed to delete event'); }
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null, loading: false });
      },
    });
  };

  if (loading) return <Loader />;

  const isHead = stats?.your_role && HEAD_ROLES.includes(stats.your_role.toLowerCase());

  return (
    <div className="container-fluid">
      {regModalEvent && <RegistrationsModal event={regModalEvent} orgId={orgId} onClose={() => setRegModalEvent(null)} />}
      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: null, loading: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={confirmModal.loading}
      />

      <div className="org-header">
        <div className="org-header-top">
          <div>
            <OrgBanner orgId={orgId} orgName={orgDisplayName(stats?.org_name)} bannerUrl={stats?.org_banner} />
            <h2 className="fw-bold mt-2" style={{ color:'var(--text-primary)' }}>{orgDisplayName(stats?.org_name)} Dashboard</h2>
            <p style={{ color:'var(--text-secondary)' }}>Role: <span className="badge bg-purple">{stats?.your_role}</span></p>
          </div>
          <div className="pill-tab-nav">
            <button className={`pill-tab ${activeTab==='dashboard'?'active':''}`} onClick={() => setActiveTab('dashboard')}><BarChart3 size={15} /> Overview</button>
            <button className={`pill-tab ${activeTab==='events'?'active':''}`} onClick={() => setActiveTab('events')}><Eye size={15} /> Events</button>
            <button className={`pill-tab ${activeTab==='team'?'active':''}`} onClick={() => setActiveTab('team')}><Users size={15} /> Team</button>
            <button className={`pill-tab ${activeTab==='create'?'active':''}`} onClick={() => { setEditingEventId(null); setActiveTab('create'); }}><Plus size={15} /> Create</button>
          </div>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        tabLoading ? <div className="d-flex justify-content-center py-5"><Loader /></div> :
        <div className="row g-3">

          {/* Stat Cards Row — compact, inline, auto-width */}
          <div className="col-12">
            <div className="org-stats-row">
              <div className="org-stat-chip">
                <div className="org-stat-chip-icon purple"><Calendar size={18} /></div>
                <div>
                  <div className="org-stat-chip-value">{stats?.total_events ?? 0}</div>
                  <div className="org-stat-chip-label">Total Events</div>
                </div>
              </div>
              <div className="org-stat-chip">
                <div className="org-stat-chip-icon green"><Users size={18} /></div>
                <div>
                  <div className="org-stat-chip-value">{stats?.total_registrations ?? 0}</div>
                  <div className="org-stat-chip-label">Total Registrations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart — full width, self-contained height */}
          <div className="col-12">
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Audience by Department</h5>
              <DemographicsChart type="doughnut" title="" data={stats?.dept_analytics || {}} />
            </div>
          </div>

          {/* Org Genres */}
          <div className="col-12">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Tag size={18} className="text-purple" /> Organisation Genres
                </h5>
                <button className="btn btn-purple btn-sm d-flex align-items-center gap-1" onClick={() => setShowGenreModal(true)}>
                  <Edit size={14} /> Manage
                </button>
              </div>
              {orgGenres.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {orgGenres.map(g => (
                    <span key={g} className="genre-display-tag">{g}</span>
                  ))}
                </div>
              ) : (
                <p className="text-muted small fst-italic mb-0">No genres added yet. Click Manage to add some.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {activeTab === 'events' && (
        tabLoading ? <div className="d-flex justify-content-center py-5"><Loader /></div> :
        <div className="glass-card p-4">
          <h5 className="fw-bold mb-4" style={{ color:'var(--text-primary)' }}>Your Events</h5>
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th className="d-none d-md-table-cell">Date</th>
                  <th className="d-none d-sm-table-cell">Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>
                      <div className="fw-semibold" style={{ fontSize:'0.88rem' }}>{ev.name}</div>
                      {/* Date shown under name on mobile */}
                      <div className="d-md-none small" style={{ color:'var(--text-muted)',fontSize:'0.72rem' }}>{formatDate(ev.date)}</div>
                    </td>
                    <td className="d-none d-md-table-cell" style={{ color:'var(--text-secondary)' }}>{formatDate(ev.date)}</td>
                    <td className="d-none d-sm-table-cell">
                      {ev.is_private
                        ? <span className="badge-visibility private"><Lock size={12} /> Private</span>
                        : <span className="badge-visibility public"><Globe size={12} /> Public</span>}
                    </td>
                    <td>
                      {/* Compact action buttons — icon only on mobile, icon+label on desktop */}
                      <div className="d-flex gap-1 flex-wrap">
                        <button className="btn-action primary" onClick={() => setRegModalEvent(ev)} title="Registrations">
                          <Users size={13} /><span className="d-none d-lg-inline"> Regs</span>
                        </button>
                        <button className="btn-action success" onClick={() => handleDownloadCSV(ev.id)} title="Download CSV">
                          <Download size={13} /><span className="d-none d-lg-inline"> CSV</span>
                        </button>
                        {isHead && (
                          <>
                            <button className="btn-action primary" onClick={() => handleEditEvent(ev)} title="Edit">
                              <Edit size={13} />
                            </button>
                            <button className="btn-action danger" onClick={() => handleDeleteEvent(ev.id)} title="Delete">
                              <Trash2 size={13} />
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

      {/* ── TEAM ── */}
      {activeTab === 'team' && (
        tabLoading ? <div className="d-flex justify-content-center py-5"><Loader /></div> :
        <div className="row g-4">
          {isHead && (
            <div className="col-12 col-md-4">
              <div className="glass-card p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color:'var(--text-primary)' }}>
                  <UserPlus size={18} className="text-purple" /> Add Member
                </h5>
                <form onSubmit={handleAddMember}>
                  <div className="mb-3">
                    <label className="form-label-modern">IITD Email</label>
                    <input type="email" className="form-control modern-input" placeholder="e.g. cs1230001@iitd.ac.in"
                      value={newMember.email} onChange={e => setNewMember({...newMember,email:e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-modern">Role</label>
                    <SearchableDropdown
                      options={TEAM_ROLES.map(role => ({ label: role.charAt(0).toUpperCase()+role.slice(1), value: role }))}
                      value={newMember.role}
                      onChange={val => setNewMember({...newMember, role: val})}
                      placeholder="Select role..."
                      searchable={false}
                    />
                  </div>
                  <button type="submit" className="btn btn-purple w-100">Add to Team</button>
                </form>
              </div>
            </div>
          )}
          <div className={isHead ? "col-12 col-md-8" : "col-12"}>
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-4" style={{ color:'var(--text-primary)' }}>Team Members</h5>
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="d-none d-md-table-cell">Email</th>
                      <th>Role</th>
                      {isHead && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {team.map(member => (
                      <tr key={member.user_id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <UserAvatar name={member.name} photoUrl={member.photo_url} size={36} />
                            <div>
                              <div className="fw-semibold" style={{ fontSize:'0.88rem' }}>{member.name}</div>
                              {/* Email under name on mobile */}
                              <div className="d-md-none small" style={{ color:'var(--text-muted)',fontSize:'0.72rem' }}>{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell" style={{ color:'var(--text-secondary)' }}>{member.email}</td>
                        <td>
                          <span className={`badge ${HEAD_ROLES.includes(member.role) ? 'bg-danger' : 'bg-info text-dark'}`}>
                            {member.role}
                          </span>
                        </td>
                        {isHead && (
                          <td>
                            {!HEAD_ROLES.includes(member.role.toLowerCase()) && (
                              <button className="btn-action danger" onClick={() => handleRemoveMember(member.user_id)}>
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

      {/* ── CREATE / EDIT ── */}
      {activeTab === 'create' && (
        <div className="glass-form-card">
          <h4 className="fw-bold mb-4" style={{ color:'var(--text-primary)' }}>
            {editingEventId ? "Edit Event" : "Create New Event"}
          </h4>
          <form onSubmit={handleCreateEvent}>
            <p className="text-muted small">Event Form Fields loaded...</p>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label-modern">Event Name</label>
                <input type="text" className="form-control modern-input" required
                  value={newEvent.name} onChange={e => setNewEvent({...newEvent,name:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label-modern">Date & Time</label>
                <input type="datetime-local" className="form-control modern-input" required
                  value={newEvent.date} onChange={e => setNewEvent({...newEvent,date:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label-modern">Registration Deadline <span style={{ color:'var(--text-muted)',fontSize:'0.8rem' }}>(optional)</span></label>
                <input type="datetime-local" className="form-control modern-input"
                  value={newEvent.registration_deadline} onChange={e => setNewEvent({...newEvent,registration_deadline:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label-modern">Duration <span style={{ color:'var(--text-muted)',fontSize:'0.8rem' }}>(hours, optional)</span></label>
                <input type="number" step="0.5" min="0" className="form-control modern-input" placeholder="e.g. 2"
                  value={newEvent.duration_hours} onChange={e => setNewEvent({...newEvent,duration_hours:e.target.value})} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label-modern">Venue</label>
                <input type="text" className="form-control modern-input" required
                  value={newEvent.venue} onChange={e => setNewEvent({...newEvent,venue:e.target.value})} />
              </div>
              <div className="col-12">
                <label className="form-label-modern">Description</label>
                <textarea className="form-control modern-input" rows="3" required
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent,description:e.target.value})} />
              </div>

              <div className="col-12 form-section">
                <div className="form-section-title"><Users size={16} className="section-icon" /> Audience Targeting</div>
              </div>
              <div className="col-12 col-md-6">
                <MultiSelect label="Target Departments" options={DEPARTMENTS} selected={targetDepts} onChange={setTargetDepts} placeholder="Select departments..." />
              </div>
              <div className="col-12 col-md-6">
                <MultiSelect label="Target Hostels" options={HOSTELS} selected={targetHostels} onChange={setTargetHostels} placeholder="Select hostels..." />
              </div>
              <div className="col-12 col-md-6">
                <MultiSelect label="Target Years" options={YEARS.map(String)} selected={targetYears} onChange={setTargetYears} placeholder="Select years..." />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center">
                <div className="form-check form-switch mt-3">
                  <input className="form-check-input" type="checkbox" id="privateSwitch"
                    checked={newEvent.isPrivate} onChange={e => setNewEvent({...newEvent,isPrivate:e.target.checked})} />
                  <label className="form-check-label" style={{ color:'var(--text-primary)' }} htmlFor="privateSwitch">Member-Only (Hidden from feed)</label>
                </div>
              </div>

              <div className="col-12 form-section">
                <div className="form-section-title"><Calendar size={16} className="section-icon" /> Media & Metadata</div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label-modern">Poster Image</label>
                <input type="file" ref={posterInputRef} accept="image/*" style={{ display: 'none' }}
                  onChange={e => setImageFile(e.target.files[0])} />
                <button type="button" className="modern-input d-flex align-items-center gap-2" style={{ cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => posterInputRef.current?.click()}>
                  <Upload size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                  <span style={{ color: imageFile ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {imageFile ? imageFile.name : 'Choose poster image...'}
                  </span>
                </button>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label-modern">Tags (comma separated)</label>
                <input type="text" className="form-control modern-input" placeholder="Tech, Fun"
                  value={newEvent.tags} onChange={e => setNewEvent({...newEvent,tags:e.target.value})} />
              </div>
              <div className="col-12">
                <MultiSelect label="Event Genres" options={GENRES} selected={eventGenres} onChange={setEventGenres} placeholder="Search & add genres..." />
              </div>
            </div>

            <DynamicFormBuilder schema={formSchema} setSchema={setFormSchema} />

            <button type="submit" className="btn btn-purple w-100 mt-4 py-2 fw-bold">
              {editingEventId ? "Update Event" : "Publish Event"}
            </button>
          </form>
        </div>
      )}

      {/* ── GENRE MODAL ── */}
      {showGenreModal && (
        <div className="modal-backdrop-v2" onClick={() => setShowGenreModal(false)}>
          <div className="modal-content-v2" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Tag size={18} className="text-purple" /> Manage Genres
              </h5>
              <button className="btn-close-modern" onClick={() => setShowGenreModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-secondary small mb-3">Select genres that describe your organisation. These will be pre-selected for new events.</p>
            <MultiSelect label="" options={GENRES} selected={orgGenres} onChange={setOrgGenres} placeholder="Search & add genres..." />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowGenreModal(false)}>Cancel</button>
              <button className="btn btn-purple btn-sm d-flex align-items-center gap-1" onClick={handleSaveOrgGenres} disabled={savingGenres}>
                <Save size={14} /> {savingGenres ? 'Saving...' : 'Save Genres'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;