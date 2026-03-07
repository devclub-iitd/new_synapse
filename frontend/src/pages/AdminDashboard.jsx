// import React, { useState, useEffect } from 'react';
// import api from '../api/axios';
// import { Search, ShieldAlert, Trash2, UserCheck, PlusCircle, X } from 'lucide-react';
// import Loader from '../components/UI/Loader';
// import ConfirmationModal from '../components/UI/ConfirmationModal';
// import toast from 'react-hot-toast';

// import { ORG_TYPES, HEAD_ROLES, ALL_ORGS } from '../utils/constants';

// const AdminDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [authForm, setAuthForm] = useState({
//     org_type: 'club',
//     org_name: 'devclub',
//     role_name: 'overall coordinator'
//   });
//   const [revokeModalOpen, setRevokeModalOpen] = useState(false);
//   const [roleToRevoke, setRoleToRevoke] = useState(null);

//   useEffect(() => { fetchUsers(); }, []);

//   useEffect(() => {
//     const results = users.filter(user =>
//       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredUsers(results);
//   }, [searchTerm, users]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/admin/users');
//       setUsers(res.data);
//       setFilteredUsers(res.data);
//     } catch (err) {
//       toast.error("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAuthorize = async (e) => {
//     e.preventDefault();
//     if (!selectedUser) return;
//     try {
//       await api.post(`/admin/authorize?email=${selectedUser.email}`, authForm);
//       toast.success(`Role assigned to ${selectedUser.name}`);
//       setSelectedUser(null);
//       fetchUsers();
//     } catch (err) {
//       toast.error(err.response?.data?.detail || "Failed to authorize user");
//     }
//   };

//   const confirmRevoke = (user, authId) => {
//     setRoleToRevoke({ user_id: user.id, auth_id: authId });
//     setRevokeModalOpen(true);
//   };

//   const handleRevoke = async () => {
//     try {
//       toast.success("Role revoked (Simulation)");
//       fetchUsers();
//       setRevokeModalOpen(false);
//       setRoleToRevoke(null);
//     } catch (err) {
//       toast.error("Failed to revoke role");
//     }
//   };

//   const handleTypeChange = (e) => {
//     const newType = e.target.value;
//     const availableOrgs = ALL_ORGS[newType] || [];
//     setAuthForm({ ...authForm, org_type: newType, org_name: availableOrgs[0] || '' });
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="container-fluid">
//       <div className="page-header">
//         <h2>Admin Control Center</h2>
//         <p className="page-subtitle">Manage users, assign roles, and control access</p>
//       </div>

//       <div className="row g-4">

//         {/* LEFT: USER LIST */}
//         <div className="col-12 col-md-8">
//           <div className="glass-card p-4 h-100">

//             {/* Header: stacks on mobile */}
//             <div className="admin-list-header mb-4">
//               <h5 className="m-0 fw-bold" style={{ color: 'var(--text-primary)' }}>All Users</h5>
//               <div className="admin-search-bar">
//                 <Search size={16} className="text-purple" style={{ flexShrink: 0 }} />
//                 <input
//                   type="text"
//                   placeholder="Search students..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="custom-scrollbar" style={{ maxHeight: '600px', overflowY: 'auto' }}>
//               <div className="modern-table-wrapper">
//                 <table className="modern-table">
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       {/* Hide email + roles on mobile */}
//                       <th className="d-none d-md-table-cell">Email</th>
//                       <th className="d-none d-md-table-cell">Current Roles</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredUsers.map(user => (
//                       <tr key={user.id} className={selectedUser?.id === user.id ? "row-selected" : ""}>
//                         <td>
//                           <div className="d-flex align-items-center gap-2">
//                             <div className="member-avatar-sm">{user.name.charAt(0)}</div>
//                             <div>
//                               <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{user.name}</div>
//                               <div className="small" style={{ color: 'var(--text-muted)' }}>{user.entry_number}</div>
//                               {/* Show email below name on mobile only */}
//                               <div className="d-md-none small" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
//                                 {user.email}
//                               </div>
//                               {/* Show roles below name on mobile only */}
//                               {user.authorizations?.length > 0 && (
//                                 <div className="d-md-none d-flex flex-wrap gap-1 mt-1">
//                                   {user.authorizations.map(auth => (
//                                     <span key={auth.id} className="role-badge" style={{ fontSize: '0.62rem' }}>
//                                       {auth.org_name}
//                                     </span>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* Desktop-only columns */}
//                         <td className="d-none d-md-table-cell" style={{ color: 'var(--text-secondary)' }}>
//                           {user.email}
//                         </td>
//                         <td className="d-none d-md-table-cell">
//                           <div className="d-flex flex-wrap gap-1">
//                             {user.authorizations?.length > 0 ? (
//                               user.authorizations.map(auth => (
//                                 <span key={auth.id} className="role-badge">
//                                   {auth.org_name}
//                                   <span style={{ opacity: 0.7 }}> ({auth.role_name})</span>
//                                   <button
//                                     className="badge-revoke btn p-0 border-0 bg-transparent d-flex"
//                                     onClick={(e) => { e.stopPropagation(); confirmRevoke(user, auth.id); }}
//                                     title="Revoke Role"
//                                   >
//                                     <Trash2 size={11} />
//                                   </button>
//                                 </span>
//                               ))
//                             ) : (
//                               <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Student</span>
//                             )}
//                           </div>
//                         </td>

//                         <td>
//                           <button className="btn-action primary" onClick={() => setSelectedUser(user)}>
//                             <UserCheck size={15} />
//                             <span className="d-none d-sm-inline"> Assign</span>
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT: AUTHORIZE FORM */}
//         <div className="col-12 col-md-4">
//           <div className="glass-card p-4">
//             <h5 className="mb-3 d-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--text-primary)' }}>
//               <ShieldAlert size={20} className="text-purple" /> Grant Access
//             </h5>

//             {!selectedUser ? (
//               <div className="empty-placeholder">
//                 <UserCheck size={40} />
//                 <p>Select a user from the list to assign a leadership role.</p>
//               </div>
//             ) : (
//               <form onSubmit={handleAuthorize}>
//                 <div className="selected-user-card">
//                   <div className="selected-user-avatar">{selectedUser.name.charAt(0)}</div>
//                   <div className="selected-user-info">
//                     <div className="selected-user-name">{selectedUser.name}</div>
//                     <div className="selected-user-email">{selectedUser.email}</div>
//                   </div>
//                   <button type="button" className="btn p-0 border-0 bg-transparent" onClick={() => setSelectedUser(null)}>
//                     <X size={16} style={{ color: 'var(--text-muted)' }} />
//                   </button>
//                 </div>

//                 <div className="mb-3">
//                   <label className="form-label-modern">Organization Type</label>
//                   <select className="form-select modern-input" value={authForm.org_type} onChange={handleTypeChange}>
//                     {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
//                   </select>
//                 </div>

//                 <div className="mb-3">
//                   <label className="form-label-modern">Organization Name</label>
//                   <select className="form-select modern-input" value={authForm.org_name}
//                     onChange={(e) => setAuthForm({ ...authForm, org_name: e.target.value })}>
//                     {(ALL_ORGS[authForm.org_type] || []).map(org => (
//                       <option key={org} value={org}>{org.charAt(0).toUpperCase() + org.slice(1)}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label-modern">Role Title</label>
//                   <select className="form-select modern-input" value={authForm.role_name}
//                     onChange={(e) => setAuthForm({ ...authForm, role_name: e.target.value })}>
//                     {HEAD_ROLES.map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
//                   </select>
//                 </div>

//                 <button type="submit" className="btn btn-purple w-100 fw-bold">
//                   <PlusCircle size={18} className="me-2" /> Assign
//                 </button>
//               </form>
//             )}
//           </div>
//         </div>
//       </div>

//       <ConfirmationModal
//         isOpen={revokeModalOpen}
//         onClose={() => setRevokeModalOpen(false)}
//         onConfirm={handleRevoke}
//         title="Revoke Access"
//         message="Are you sure you want to remove this role? The user will lose access immediately."
//       />
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, ShieldAlert, Trash2, UserCheck, PlusCircle, X } from 'lucide-react';
import Loader from '../components/UI/Loader';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

import { ORG_TYPES, HEAD_ROLES, ALL_ORGS } from '../utils/constants';

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

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    org_type: 'club',
    org_name: 'devclub',
    role_name: 'overall coordinator'
  });
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [roleToRevoke, setRoleToRevoke] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.post(`/admin/authorize?email=${selectedUser.email}`, authForm);
      toast.success(`Role assigned to ${selectedUser.name}`);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to authorize user");
    }
  };

  const confirmRevoke = (user, authId) => {
    setRoleToRevoke({ user_id: user.id, auth_id: authId });
    setRevokeModalOpen(true);
  };

  const handleRevoke = async () => {
    try {
      toast.success("Role revoked (Simulation)");
      fetchUsers();
      setRevokeModalOpen(false);
      setRoleToRevoke(null);
    } catch (err) {
      toast.error("Failed to revoke role");
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const availableOrgs = ALL_ORGS[newType] || [];
    setAuthForm({ ...authForm, org_type: newType, org_name: availableOrgs[0] || '' });
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid">
      <div className="page-header">
        <h2>Admin Control Center</h2>
        <p className="page-subtitle">Manage users, assign roles, and control access</p>
      </div>

      <div className="row g-4">

        {/* LEFT: USER LIST */}
        <div className="col-12 col-md-8">
          <div className="glass-card p-4 h-100">

            <div className="admin-list-header mb-4">
              <h5 className="m-0 fw-bold" style={{ color: 'var(--text-primary)' }}>All Users</h5>
              <div className="admin-search-bar">
                <Search size={16} className="text-purple" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="custom-scrollbar" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="d-none d-md-table-cell">Email</th>
                      <th className="d-none d-md-table-cell">Current Roles</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={selectedUser?.id === user.id ? "row-selected" : ""}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <UserAvatar name={user.name} photoUrl={user.photo_url} size={36} />
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{user.name}</div>
                              <div className="small" style={{ color: 'var(--text-muted)' }}>{user.entry_number}</div>
                              <div className="d-md-none small" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                {user.email}
                              </div>
                              {user.authorizations?.length > 0 && (
                                <div className="d-md-none d-flex flex-wrap gap-1 mt-1">
                                  {user.authorizations.map(auth => (
                                    <span key={auth.id} className="role-badge" style={{ fontSize: '0.62rem' }}>
                                      {auth.org_name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="d-none d-md-table-cell" style={{ color: 'var(--text-secondary)' }}>
                          {user.email}
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="d-flex flex-wrap gap-1">
                            {user.authorizations?.length > 0 ? (
                              user.authorizations.map(auth => (
                                <span key={auth.id} className="role-badge">
                                  {auth.org_name}
                                  <span style={{ opacity: 0.7 }}> ({auth.role_name})</span>
                                  <button
                                    className="badge-revoke btn p-0 border-0 bg-transparent d-flex"
                                    onClick={(e) => { e.stopPropagation(); confirmRevoke(user, auth.id); }}
                                    title="Revoke Role"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Student</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <button className="btn-action primary" onClick={() => setSelectedUser(user)}>
                            <UserCheck size={15} />
                            <span className="d-none d-sm-inline"> Assign</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AUTHORIZE FORM */}
        <div className="col-12 col-md-4">
          <div className="glass-card p-4">
            <h5 className="mb-3 d-flex align-items-center gap-2 fw-bold" style={{ color: 'var(--text-primary)' }}>
              <ShieldAlert size={20} className="text-purple" /> Grant Access
            </h5>

            {!selectedUser ? (
              <div className="empty-placeholder">
                <UserCheck size={40} />
                <p>Select a user from the list to assign a leadership role.</p>
              </div>
            ) : (
              <form onSubmit={handleAuthorize}>
                <div className="selected-user-card">
                  <UserAvatar name={selectedUser.name} photoUrl={selectedUser.photo_url} size={40} />
                  <div className="selected-user-info">
                    <div className="selected-user-name">{selectedUser.name}</div>
                    <div className="selected-user-email">{selectedUser.email}</div>
                  </div>
                  <button type="button" className="btn p-0 border-0 bg-transparent" onClick={() => setSelectedUser(null)}>
                    <X size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>

                <div className="mb-3">
                  <label className="form-label-modern">Organization Type</label>
                  <select className="form-select modern-input" value={authForm.org_type} onChange={handleTypeChange}>
                    {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label-modern">Organization Name</label>
                  <select className="form-select modern-input" value={authForm.org_name}
                    onChange={(e) => setAuthForm({ ...authForm, org_name: e.target.value })}>
                    {(ALL_ORGS[authForm.org_type] || []).map(org => (
                      <option key={org} value={org}>{org.charAt(0).toUpperCase() + org.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label-modern">Role Title</label>
                  <select className="form-select modern-input" value={authForm.role_name}
                    onChange={(e) => setAuthForm({ ...authForm, role_name: e.target.value })}>
                    {HEAD_ROLES.map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                  </select>
                </div>

                <button type="submit" className="btn btn-purple w-100 fw-bold">
                  <PlusCircle size={18} className="me-2" /> Assign
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        onConfirm={handleRevoke}
        title="Revoke Access"
        message="Are you sure you want to remove this role? The user will lose access immediately."
      />
    </div>
  );
};

export default AdminDashboard;