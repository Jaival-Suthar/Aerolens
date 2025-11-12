import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import AppContent from './AppContent';
import { ProfileSidebar } from './ProfileSideBar';
const App = () => {
    return (_jsx(PrimeReactProvider, { children: _jsxs(Router, { children: [_jsx(AppContent, {}), _jsx(ProfileSidebar, {})] }) }));
};
export default App;
