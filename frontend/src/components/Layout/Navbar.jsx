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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoginModal from '../UI/LoginModal';

const timeAgo = (dateStr) => {
  // DB stores GMT without timezone suffix.
  // Append 'Z' so JS parses it as UTC, then diff against local time.
  const utcMs = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z').getTime();
  const diff = Date.now() - utcMs;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(utcMs).toLocaleDateString();
};

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const popupRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch { /* ignore */ }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch { /* ignore */ }
  }, [user]);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when popup opens
  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen, fetchNotifications]);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id, wasUnread) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.redirect) {
      setNotifOpen(false);
      navigate(notif.redirect);
    }
  };

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

        {/* Notification Bell */}
        {user && (
          <div className="notif-wrapper" ref={notifRef}>
            <button
              className="notif-bell-btn"
              onClick={() => setNotifOpen(prev => !prev)}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
          </div>
        )}

        {/* Notification popup — portaled to body */}
        {notifOpen && createPortal(
          <>
            <div className="notif-overlay" onClick={() => setNotifOpen(false)} />
            <div className="notif-popup" ref={popupRef}>
              <div className="notif-popup-header">
                <span className="notif-popup-title">Notifications</span>
                <div className="d-flex align-items-center gap-2">
                  {notifications.some(n => !n.is_read) && (
                    <button className="notif-action-btn" onClick={markAllRead} title="Mark all as read">
                      <CheckCheck size={16} />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button className="notif-action-btn" onClick={clearAll} title="Clear all">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="notif-popup-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`notif-item ${!notif.is_read ? 'notif-unread' : ''} ${notif.redirect ? 'notif-clickable' : ''}`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div className="notif-item-content">
                        <div className="notif-item-title">{notif.title}</div>
                        <div className="notif-item-body">{notif.body}</div>
                        <div className="notif-item-time">{timeAgo(notif.created_at)}</div>
                      </div>
                      <button
                        className="notif-delete-btn"
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id, !notif.is_read); }}
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body
        )}

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