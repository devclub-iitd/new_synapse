// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { LayoutDashboard, User, Calendar, LogOut, Shield, Layout } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

// const Sidebar = () => {
//   const { user, logout } = useAuth();
//   const hasManagementAccess = user?.is_superuser || (user?.authorizations && user.authorizations.length > 0);

//   return (
//     <div className="sidebar d-flex flex-column justify-content-between p-3">
//       <div>
//         {/* Professional Brand Section: Stacked & Centered */}
//         <div className="sidebar-brand-minimal d-flex flex-column align-items-center mb-5 px-3 pt-2">
//           <NavLink to="/" className="text-decoration-none d-flex flex-column align-items-center">
//             <img
//               src="http://localhost:8000/static/asset/logo_nobgn.png" 
//               alt="Synapse"
//               className="sidebar-logo-standalone mb-3"
//             />
//             <span className="sidebar-brand-text">SYNAPSE</span>
//           </NavLink>
//         </div>

//         <ul className="nav flex-column gap-2">
//           {/* ... Navigation items remain the same ... */}
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

//           {hasManagementAccess && (
//             <div className="mt-4 pt-4 border-top" style={{ borderColor: 'var(--border-primary) !important' }}>
//               <small className="text-muted text-uppercase fw-bold px-3 mb-2 d-block" style={{ fontSize: '0.65rem', letterSpacing: '1px', opacity: 0.5 }}>
//                 Management
//               </small>
//               {user?.is_superuser && (
//                 <NavLink to="/admin" className="nav-link d-flex align-items-center gap-3 text-danger-emphasis">
//                   <Shield size={20} /> Admin Panel
//                 </NavLink>
//               )}
//               {user?.authorizations?.map((auth, idx) => (
//                 <NavLink key={idx} to={`/org/${auth.id}/dashboard`} className="nav-link d-flex align-items-center gap-3 text-warning-emphasis">
//                   <Layout size={20} /> {auth.org_name}
//                 </NavLink>
//               ))}
//             </div>
//           )}
//         </ul>
//       </div>

//       {user && (
//         <button onClick={logout} className="logout-btn-minimal d-flex align-items-center gap-2 justify-content-center w-100 mb-2">
//           <LogOut size={18} /> Logout
//         </button>
//       )}
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, LogOut, Shield, Layout, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNav = ({ user, hasManagementAccess, logout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={22} /><span>Events</span>
        </NavLink>
        {user && (
          <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={22} /><span>Calendar</span>
          </NavLink>
        )}
        {user && (
          <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <User size={22} /><span>Profile</span>
          </NavLink>
        )}
        {hasManagementAccess && (
          <button className="mobile-nav-item" onClick={() => setMobileMenuOpen(true)}>
            <Layout size={22} /><span>Manage</span>
          </button>
        )}
      </nav>

      {mobileMenuOpen && (
        <>
          <div className="mobile-drawer-backdrop" onClick={closeMobileMenu} />
          <div className="mobile-drawer">
            <div className="mobile-drawer-handle" />
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Management</h6>
              <button onClick={closeMobileMenu} style={{ background: 'var(--bg-input)', border: 'none', borderRadius: '8px', padding: '6px 8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {user?.is_superuser && (
                <NavLink to="/admin" className="mobile-drawer-link" onClick={closeMobileMenu}>
                  <Shield size={18} /> Admin Panel
                </NavLink>
              )}
              {user?.authorizations?.map((auth, idx) => (
                <NavLink key={idx} to={`/org/${auth.id}/dashboard`} className="mobile-drawer-link" onClick={closeMobileMenu}>
                  <Layout size={18} /> {auth.org_name}
                </NavLink>
              ))}
              {user && (
                <button onClick={() => { logout(); closeMobileMenu(); }} className="mobile-drawer-logout">
                  <LogOut size={18} /> Logout
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const Sidebar = ({ mobileOnly = false }) => {
  const { user, logout } = useAuth();
  const hasManagementAccess = user?.is_superuser || (user?.authorizations && user.authorizations.length > 0);

  // Mobile-only mode: just render the bottom nav (used in App.js outside the grid)
  if (mobileOnly) {
    return <MobileNav user={user} hasManagementAccess={hasManagementAccess} logout={logout} />;
  }

  // Desktop sidebar
  return (
    <div className="sidebar d-flex flex-column justify-content-between p-3 h-100">
      <div>
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
            <div className="mt-4 pt-4 border-top" style={{ borderColor: 'var(--border-primary) !important' }}>
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