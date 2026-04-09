import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken, clearAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // On page load, attempt a silent refresh via the httpOnly cookie
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        // Read CSRF token from cookie
        const csrfMatch = document.cookie.match(/(^| )csrf_token=([^;]+)/);
        const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[2]) : null;

        const res = await api.post('/auth/refresh', {}, {
          headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
        });
        setAccessToken(res.data.access_token);
        await fetchUser();
      } catch (_) {
        // No valid refresh cookie — user is not logged in
        clearAccessToken();
        setUser(null);
        setLoading(false);
      }
    };

    silentRefresh();
  }, []);

  const login = (token) => {
    setAccessToken(token);
    fetchUser();
    closeLoginModal(); // close modal after successful login
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) { /* ignore */ }
    clearAccessToken();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        setUser, 
        loading,
        showLoginModal,
        openLoginModal,
        closeLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
