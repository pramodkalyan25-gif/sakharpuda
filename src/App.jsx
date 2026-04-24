import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ScrollToTop  from './components/ui/ScrollToTop';

import LandingPage       from './pages/LandingPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import CreateProfilePage from './pages/CreateProfilePage';
import DashboardPage     from './pages/DashboardPage';
import SearchPage        from './pages/SearchPage';
import ViewProfilePage   from './pages/ViewProfilePage';
import AdminPage         from './pages/AdminPage';

// Legal & Info Pages
import TermsPage         from './pages/TermsPage';
import PrivacyPage       from './pages/PrivacyPage';
import FraudAlertPage    from './pages/FraudAlertPage';
import GrievancePage     from './pages/GrievancePage';
import AboutPage         from './pages/AboutPage';
import ContactPage       from './pages/ContactPage';
import HelpPage          from './pages/HelpPage';

export default function App() {
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          {isOffline && (
            <div style={{
              background: '#f87171', color: 'white', textAlign: 'center',
              padding: '8px', fontSize: '14px', fontWeight: '600',
              position: 'sticky', top: 0, zIndex: 9999
            }}>
              🚫 You are currently offline. Some features may not work.
            </div>
          )}
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Legal & Info Routes */}
            <Route path="/terms"       element={<TermsPage />} />
            <Route path="/privacy"     element={<PrivacyPage />} />
            <Route path="/fraud-alert" element={<FraudAlertPage />} />
            <Route path="/grievances"  element={<GrievancePage />} />
            <Route path="/about"       element={<AboutPage />} />
            <Route path="/contact"     element={<ContactPage />} />
            <Route path="/help"        element={<HelpPage />} />
            <Route path="/faq"         element={<HelpPage />} />

            {/* Protected routes */}
            <Route path="/create-profile" element={
              <ProtectedRoute><CreateProfilePage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute><SearchPage /></ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute><ViewProfilePage /></ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="/admin" element={
              <AdminRoute><AdminPage /></AdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e1e3a',
                color: '#fff',
                border: '1px solid rgba(201, 149, 108, 0.3)',
                borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif',
              },
              success: { iconTheme: { primary: '#C9956C', secondary: '#1e1e3a' } },
              error:   { iconTheme: { primary: '#ff6b6b', secondary: '#1e1e3a' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
