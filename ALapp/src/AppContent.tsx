import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const AppNavbar = lazy(() => import('./AppNavbar'));
const Client = lazy(() => import('./pages/ClientPage/page'));
const Home = lazy(() => import('./pages/Dashboard/page'));
const JobProfile = lazy(() => import('./pages/JobProfile/page'));
const Resume = lazy(() => import('./pages/Resume/page'));
const LookupPage = lazy(() => import('./pages/Lookup/page'));

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
      onClick={() => window.location.href = '/dashboard'}
      data-testid="go-dashboard-btn"
    >
      <span className="p-button-label">Go to Dashboard</span>
    </button>
  </div>
);

const AppContent: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="app">
        <AppNavbar />
        <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/client" element={<Client />} />
            <Route path="/job-profile" element={<JobProfile />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/lookup-data" element={<LookupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Suspense>
  );
};

export default AppContent;