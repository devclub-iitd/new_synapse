// import React, { useState } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import { Sun, Moon } from 'lucide-react';
// import LoginModal from '../UI/LoginModal';

// const Navbar = () => {
//   const { user } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const [isLoginOpen, setIsLoginOpen] = useState(false);

//   return (
//     <div className="navbar-container">
//       <div className="d-flex align-items-center gap-3">
//         <button
//           className="theme-toggle"
//           onClick={toggleTheme}
//           title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
//         >
//           {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
//         </button>

//         {user ? (
//           <div className="d-flex align-items-center gap-3">
//             <div className="navbar-user-info">
//               <div className="navbar-user-name">{user.name}</div>
//               <div className="navbar-user-entry">{user.entry_number}</div>
//             </div>
//             <div className="navbar-avatar">
//               {user.photo_url ? (
//                 <img
//                   src={user.photo_url}
//                   alt="profile"
//                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                 />
//               ) : (
//                 <div className="d-flex align-items-center justify-content-center fw-bold text-white h-100">
//                   {user.name.charAt(0)}
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           <button className="btn btn-purple" onClick={() => setIsLoginOpen(true)}>
//             Login
//           </button>
//         )}
//       </div>

//       <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
//     </div>
//   );
// };

// export default Navbar;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import LoginModal from '../UI/LoginModal';

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="navbar-container navbar-container-responsive">

      {/* MOBILE ONLY: Synapse logo/brand on the left */}
      <div className="d-flex d-md-none align-items-center">
        <NavLink to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <img
            src="/assets/logo_nobgn.png"
            alt="Synapse"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span style={{
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SYNAPSE
          </span>
        </NavLink>
      </div>

      {/* Right side actions */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="d-flex align-items-center gap-2 gap-md-3"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            title="Go to profile">
            <div className="navbar-user-info d-none d-sm-block">
              <div className="navbar-user-name">{user.name}</div>
              <div className="navbar-user-entry">{user.entry_number}</div>
            </div>
            <div className="navbar-avatar">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt="profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center fw-bold text-white h-100">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="btn btn-purple" onClick={() => setIsLoginOpen(true)}>
            Login
          </button>
        )}
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Navbar;