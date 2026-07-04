import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import CitizenPortal from './pages/CitizenPortal';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-secondary)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%' }} className="animate-spin" />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading session…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin')  return <Navigate to="/admin"   replace />;
    if (user.role === 'driver') return <Navigate to="/driver"  replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'admin')  return <Navigate to="/admin"   replace />;
    if (user.role === 'driver') return <Navigate to="/driver"  replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
};

// Only show Navbar on non-landing pages
const ShowNavbar = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <Navbar />;
};

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ShowNavbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"        element={<LandingPage />} />
          <Route path="/login"   element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="/citizen" element={<CitizenPortal />} />
          <Route path="/admin"   element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/driver"  element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
