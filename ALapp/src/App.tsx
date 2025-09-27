// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import Client from './pages/ClientPage/page';
import Home from './pages/Dashboard/page';
import JobProfile from './pages/JobProfile/page';
import Resume from './pages/Resume/page';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const NotFound: React.FC = () => (
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

const App = (): JSX.Element => {
  return (
    <PrimeReactProvider>
      <Router>
        <div className="app">
          <AppNavbar />
          <main className="main-content p-2" style={{ background: "#fff", minHeight: "100vh" }}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/client" element={<Client />} />
              {/* <Route path="/contact" element={<Contact />} /> */}
              <Route path="/job-profile" element={<JobProfile />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PrimeReactProvider>
  );
};

export default App;
