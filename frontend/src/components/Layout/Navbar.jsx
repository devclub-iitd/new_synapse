import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import LoginModal from '../UI/LoginModal';

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="navbar-container">
      <div className="d-flex align-items-center gap-3">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="d-flex align-items-center gap-3">
            <div className="navbar-user-info">
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

