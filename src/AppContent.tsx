import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './shared/auth/AuthContext';
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const AppNavbar = lazy(() => import('./AppNavbar'));
const Client = lazy(() => import('./pages/ClientPage/page'));
const Home = lazy(() => import('./pages/Dashboard/page'));
const JobProfile = lazy(() => import('./pages/JobProfile/page'));
const Resume = lazy(() => import('./pages/Resume/page'));
const Interview = lazy(() => import('./pages/Interview/page')); // ⭐️ NEW LAZY IMPORT
const LookupPage = lazy(() => import('./pages/Lookup/page'));
const LoginPage = lazy(() => import('./pages/Login/Login'));
const SignUpPage = lazy(() => import('./pages/Signup/page'));
const Members = lazy(() => import('./pages/Members/page'));
const ReportPage = lazy(() => import('./pages/Report/page'));

const LoadingSpinner = () => (
  <div
    className="flex align-items-center justify-content-center h-screen"
    data-testid="loading-spinner"
  >
    <FaSpinner className="spin text-4xl text-primary" />
  </div>
);


const NotFound: React.FC = () => (
  <div
    className="flex flex-column align-items-center justify-content-center h-screen"
    data-testid="not-found"
  >
    <FaExclamationTriangle className="text-6xl text-orange-500 mb-3" />

    <h1 className="text-4xl font-bold text-900 mb-2">404</h1>
    <p className="text-xl text-600 mb-4">Page not found</p>

    <button
      className="p-button p-component"
      onClick={() => (window.location.href = "/home")}
      data-testid="go-dashboard-btn"
    >
      <span className="p-button-label">Go to Home Page</span>
    </button>
  </div>
);


const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app" >
    <AppNavbar />

    <main
      className="main-content p-2"
      style={{
        background: "#fff",
        height: "calc(100vh - 64px)", // navbar height
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // IMPORTANT
        minHeight: 0,
      }}
    >
      {children}
    </main>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />

        {/* Authenticated Routes */}
        {isAuthenticated && (
          <>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/create-user" element={<AppLayout><SignUpPage /></AppLayout>} />
            <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/client" element={<AppLayout><Client /></AppLayout>} />
            <Route path="/job-profile" element={<AppLayout><JobProfile /></AppLayout>} />
            <Route path="/resume" element={<AppLayout><Resume /></AppLayout>} />
            <Route path="/interview" element={<AppLayout><Interview /></AppLayout>} />
            <Route path="/lookup-data" element={<AppLayout><LookupPage /></AppLayout>} />
            <Route path="/members" element={<AppLayout><Members /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><ReportPage /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

export default AppContent;
