import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

const AppNavbar = lazy(() => import('./AppNavbar'));
const Client = lazy(() => import('./pages/ClientPage/page'));
const Home = lazy(() => import('./pages/Dashboard/page'));
const JobProfile = lazy(() => import('./pages/JobProfile/page'));
const Resume = lazy(() => import('./pages/Resume/page'));
const LookupPage = lazy(() => import('./pages/Lookup/page'));
const LoginPage = lazy(() => import('./pages/Login/Login')); 
import { useAuth } from './shared/auth/AuthContext';

const LoadingSpinner = () => (
  <div className="flex align-items-center justify-content-center h-screen" data-testid="loading-spinner">
    <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
  </div>
);

const NotFound: React.FC = () => (
  <div className="flex flex-column align-items-center justify-content-center h-screen" data-testid="not-found">
    <i className="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
    <h1 className="text-4xl font-bold text-900 mb-2">404</h1>
    <p className="text-xl text-600 mb-4">Page not found</p>
    <button 
      className="p-button p-component"
      onClick={() => window.location.href = '/home'}
      data-testid="go-dashboard-btn"
    >
      <span className="p-button-label">Go to Home Page</span>
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />
        } />
        
        {isAuthenticated ? (
          <>
            <Route path="/" element={
              <div className="app">
                <AppNavbar />
                <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
                  <Navigate to="/home" replace />
                </main>
              </div>
            } />
            <Route path="/home" element={
              <div className="app">
                <AppNavbar />
                <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
                  <Home />
                </main>
              </div>
            } />
            <Route path="/client" element={
              <div className="app">
                <AppNavbar />
                <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
                  <Client />
                </main>
              </div>
            } />
            <Route path="/job-profile" element={
              <div className="app">
                <AppNavbar />
                <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
                  <JobProfile />
                </main>
              </div>
            } />
            <Route path="/resume" element={
              <div className="app">
                <AppNavbar />
                <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
                  <Resume />
                </main>
              </div>
            } />
            <Route path="/lookup-data" element={
              <div className="app">
                <AppNavbar />
                <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
                  <LookupPage />
                </main>
              </div>
            } />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <Route path="*" element={null} />
        )}
      </Routes>
    </Suspense>
  );
};

export default AppContent;