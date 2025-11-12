import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import AppContent from './AppContent';
import { ProfileSidebar } from './ProfileSideBar';

const App = (): JSX.Element => {
  return (
    <PrimeReactProvider>
      <Router>

          <AppContent />
          <ProfileSidebar />
      </Router>
    </PrimeReactProvider>
  );
};

export default App;