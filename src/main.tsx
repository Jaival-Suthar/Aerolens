import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css";
import { AuthProvider } from './shared/auth/AuthContext';
import { initializeAppSchemaVersion } from './shared/config/appSchema';

initializeAppSchemaVersion();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
  </StrictMode>
);


