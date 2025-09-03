// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import Dashboard from './pages/Dashboard/page';
import Contact from './pages/Contact/page';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// Placeholder components for other routes
const Projects = () => (
  <div className="p-2">
    <div className="card">
      <h2>Projects</h2>
      <p>Projects component will be implemented here.</p>
    </div>
  </div>
);


const NotFound = () => (
  <div className="flex flex-column align-items-center justify-content-center h-screen">
    <i className="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
    <h1 className="text-4xl font-bold text-900 mb-2">404</h1>
    <p className="text-xl text-600 mb-4">Page not found</p>
    <button 
      className="p-button p-component"
      onClick={() => window.location.href = '/dashboard'}
    >
      <span className="p-button-label">Go to Dashboard</span>
    </button>
  </div>
);

const App = () => {
  return (
    <PrimeReactProvider>
      <Router>
        <div className="app">
          <AppNavbar />
          <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PrimeReactProvider>
  );
};

export default App;