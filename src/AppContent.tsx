import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import ProtectedRoute from './shared/ProtectedRoute';

const AppNavbar = lazy(() => import('./AppNavbar'));
const Client = lazy(() => import('./pages/ClientPage/page'));
const Home = lazy(() => import('./pages/Dashboard/page'));
const JobProfile = lazy(() => import('./pages/JobProfile/page'));
const JobProfileNew = lazy(() => import('./pages/JobProfileNew/page'));
const Resume = lazy(() => import('./pages/Resume/page'));
const Interview = lazy(() => import('./pages/Interview/page')); // ⭐️ NEW LAZY IMPORT
const LookupPage = lazy(() => import('./pages/Lookup/page'));
const LoginPage = lazy(() => import('./pages/Login/Login'));
const Members = lazy(() => import('./pages/Members/page'));
const ReportPage = lazy(() => import('./pages/Report/page'));
const Vendor = lazy(() => import('./pages/Vendor/page'));
const CoverageReportPage = lazy(() => import('./pages/CoverageReport/page'));
const InterviewTrackerPage = lazy(() => import('./pages/InterviewReport/page'));

const LoadingSpinner = () => (
  <div
    className="flex align-items-center justify-content-center h-screen"
    role="status"
    aria-live="polite"
    aria-label="Loading application"
  >
    <FaSpinner
      className="spin text-4xl text-primary"
      aria-hidden="true"
    />
  </div>
);

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-column align-items-center justify-content-center h-screen"
      data-testid="not-found"
    >
      <FaExclamationTriangle className="text-6xl text-orange-500 mb-3" />

      <h1 className="text-4xl font-bold text-900 mb-2">404</h1>
      <p className="text-xl text-600 mb-4" role="status">Page not found</p>

      <button
        className="p-button p-component"
        onClick={() => navigate("/home")}
        aria-label="Go to home page"
      >
        <span className="p-button-label">Go to Home Page</span>
      </button>
    </div>
  );
};


const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app" >
    <AppNavbar />

    <main
      role='main'
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
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/home" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout><Home /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <AppLayout><Client /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-profile"
          element={
            <ProtectedRoute>
              <AppLayout><JobProfile /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-profile-new"
          element={
            <ProtectedRoute>
              <AppLayout><JobProfileNew /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <AppLayout><Resume /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <AppLayout><Interview /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lookup-data"
          element={
            <ProtectedRoute>
              <AppLayout><LookupPage /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <AppLayout><Members /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout><ReportPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/coverage"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CoverageReportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/interview-tracker"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InterviewTrackerPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor"
          element={<ProtectedRoute><AppLayout><Vendor/></AppLayout></ProtectedRoute>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppContent;