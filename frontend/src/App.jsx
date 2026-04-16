import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { getDeviceToken } from "./firebase";
import api from './api/axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/mobile.css';

// Layout
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import HomePage from './pages/HomePage';
import Home from './pages/Home';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import OrgDashboard from './pages/OrgDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';
import EventDetail from './pages/EventDetail';

// UI
import Loader from './components/UI/Loader';
import LoginModal from './components/UI/LoginModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Loader />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Loader />
      </div>
    );
  }

  if (!user || !user.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppLayout = () => {
  const { showLoginModal, closeLoginModal, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  useEffect(() => {
    if (!user) return;

    async function setupNotifications() {
      try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const token = await getDeviceToken();
          if (token) {
            await api.post('/notifications/device-token', { token });
          }
        }
      } catch (err) {
        console.error("Notification setup failed:", err);
      }
    }

    setupNotifications();
  }, [user]);

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <div className="d-none d-md-block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      </div>

      {/* Mobile bottom nav */}
      <div className="d-block d-md-none">
        <Sidebar mobileOnly />
      </div>

      {/* Main area */}
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="w-100 border-bottom border-secondary border-opacity-10" style={{ zIndex: 100 }}>
          <Navbar />
        </div>

        <div className="flex-grow-1 overflow-y-auto custom-scrollbar px-md-4 py-4 main-content-area">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/events/:eventId" element={<EventDetail />} />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/org/:orgId/dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={closeLoginModal} />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
          <Toaster
            position="top-right"
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
              }
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;