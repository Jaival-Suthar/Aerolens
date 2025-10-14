import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import AppContent from './AppContent';

const App = (): JSX.Element => {
  return (
    <PrimeReactProvider>
      <Router>
        <AppContent />
      </Router>
    </PrimeReactProvider>
  );
};

export default App;