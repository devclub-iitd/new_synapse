// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { LayoutDashboard, User, Calendar, LogOut, Shield, Layout } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

// const Sidebar = () => {
//   const { user, logout } = useAuth();

//   // Helper to determine if we should show the Management section
//   const hasManagementAccess = user?.is_superuser || (user?.authorizations && user.authorizations.length > 0);

//   return (
//     <div className="sidebar d-flex flex-column justify-content-between p-3" style={{ backgroundColor: '#111222', minHeight: '100vh', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
//       <div>
//         <div className="sidebar-brand d-flex align-items-center gap-3 mb-5 px-2">
//   <img
//     src="http://localhost:8000/static/asset/logo_nobg.png"
//     alt="Synapse"
//     className="sidebar-logo"
//   />
//   <span className="sidebar-title">SYNAPSE</span>
// </div>

//         <ul className="nav flex-column gap-2">
//           <li className="nav-item">
//             <NavLink to="/" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
//               <LayoutDashboard size={20} /> Events Feed
//             </NavLink>
//           </li>
          
//           {user && (
//             <li className="nav-item">
//               <NavLink to="/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
//                 <Calendar size={20} /> My Calendar
//               </NavLink>
//             </li>
//           )}
          
//           {user && (
//             <li className="nav-item">
//               <NavLink to="/profile" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
//                 <User size={20} /> My Profile
//               </NavLink>
//             </li>
//           )}

//           {/* MANAGEMENT SECTION */}
//           {hasManagementAccess && (
//             <div className="mt-4 pt-4 border-top border-secondary">
//               <small className="text-muted text-uppercase fw-bold px-3">Management</small>
              
//               {/* 1. ADMIN LINK */}
//               {user?.is_superuser && (
//                 <NavLink 
//                   to="/admin" 
//                   className="nav-link d-flex align-items-center gap-3 text-danger mt-2"
//                 >
//                   <Shield size={20} /> Admin Panel
//                 </NavLink>
//               )}

//               {/* 2. ORG LINKS (Updated to include ID) */}
//               {user?.authorizations?.map((auth, idx) => (
//                 <NavLink 
//                   key={idx}
//                   to={`/org/${auth.id}/dashboard`} 
//                   className="nav-link d-flex align-items-center gap-3 text-warning mt-2"
//                 >
//                   <Layout size={20} /> {auth.org_name}
//                 </NavLink>
//               ))}
//             </div>
//           )}
//         </ul>
//       </div>

//       {user && (
//         <button onClick={logout} className="btn btn-outline-danger d-flex align-items-center gap-2 justify-content-center w-100 mt-4">
//           <LogOut size={18} /> Logout
//         </button>
//       )}
//     </div>
//   );
// };

// export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, LogOut, Shield, Layout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const hasManagementAccess = user?.is_superuser || (user?.authorizations && user.authorizations.length > 0);

  return (
    <div className="sidebar d-flex flex-column justify-content-between p-3">
      <div>
        {/* Professional Brand Section: Stacked & Centered */}
        <div className="sidebar-brand-minimal d-flex flex-column align-items-center mb-5 px-3 pt-2">
          <NavLink to="/" className="text-decoration-none d-flex flex-column align-items-center">
            <img
              src="http://localhost:8000/static/asset/logo_nobgn.png" 
              alt="Synapse"
              className="sidebar-logo-standalone mb-3"
            />
            <span className="sidebar-brand-text">SYNAPSE</span>
          </NavLink>
        </div>

        <ul className="nav flex-column gap-2">
          {/* ... Navigation items remain the same ... */}
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
              <LayoutDashboard size={20} /> Events Feed
            </NavLink>
          </li>
          
          {user && (
            <li className="nav-item">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
                <Calendar size={20} /> My Calendar
              </NavLink>
            </li>
          )}
          
          {user && (
            <li className="nav-item">
              <NavLink to="/profile" className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active-link' : 'text-secondary'}`}>
                <User size={20} /> My Profile
              </NavLink>
            </li>
          )}

          {hasManagementAccess && (
            <div className="mt-4 pt-4 border-top border-secondary-subtle" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
              <small className="text-muted text-uppercase fw-bold px-3 mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', opacity: 0.5 }}>
                Management
              </small>
              {user?.is_superuser && (
                <NavLink to="/admin" className="nav-link d-flex align-items-center gap-3 text-danger-emphasis">
                  <Shield size={20} /> Admin Panel
                </NavLink>
              )}
              {user?.authorizations?.map((auth, idx) => (
                <NavLink key={idx} to={`/org/${auth.id}/dashboard`} className="nav-link d-flex align-items-center gap-3 text-warning-emphasis">
                  <Layout size={20} /> {auth.org_name}
                </NavLink>
              ))}
            </div>
          )}
        </ul>
      </div>

      {user && (
        <button onClick={logout} className="logout-btn-minimal d-flex align-items-center gap-2 justify-content-center w-100 mb-2">
          <LogOut size={18} /> Logout
        </button>
      )}
    </div>
  );
};

export default Sidebar;