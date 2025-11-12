import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './shared/auth/AuthContext';
const AppNavbar = lazy(() => import('./AppNavbar'));
const Client = lazy(() => import('./pages/ClientPage/page'));
const Home = lazy(() => import('./pages/Dashboard/page'));
const JobProfile = lazy(() => import('./pages/JobProfile/page'));
const Resume = lazy(() => import('./pages/Resume/page'));
const LookupPage = lazy(() => import('./pages/Lookup/page'));
const LoginPage = lazy(() => import('./pages/Login/Login'));
const SignUpPage = lazy(() => import('./pages/Signup/page'));
const LoadingSpinner = () => (_jsx("div", { className: "flex align-items-center justify-content-center h-screen", "data-testid": "loading-spinner", children: _jsx("i", { className: "pi pi-spin pi-spinner text-4xl text-primary" }) }));
const NotFound = () => (_jsxs("div", { className: "flex flex-column align-items-center justify-content-center h-screen", "data-testid": "not-found", children: [_jsx("i", { className: "pi pi-exclamation-triangle text-6xl text-orange-500 mb-3" }), _jsx("h1", { className: "text-4xl font-bold text-900 mb-2", children: "404" }), _jsx("p", { className: "text-xl text-600 mb-4", children: "Page not found" }), _jsx("button", { className: "p-button p-component", onClick: () => (window.location.href = '/home'), "data-testid": "go-dashboard-btn", children: _jsx("span", { className: "p-button-label", children: "Go to Home Page" }) })] }));
const AppLayout = ({ children }) => (_jsxs("div", { className: "app", children: [_jsx(AppNavbar, {}), _jsx("main", { className: "main-content p-2", style: { background: '#fff', minHeight: '100vh' }, children: children })] }));
const AppContent = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    return (_jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/home", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(AppLayout, { children: _jsx(SignUpPage, {}) }) }), isAuthenticated && (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/home", replace: true }) }), _jsx(Route, { path: "/home", element: _jsx(AppLayout, { children: _jsx(Home, {}) }) }), _jsx(Route, { path: "/client", element: _jsx(AppLayout, { children: _jsx(Client, {}) }) }), _jsx(Route, { path: "/job-profile", element: _jsx(AppLayout, { children: _jsx(JobProfile, {}) }) }), _jsx(Route, { path: "/resume", element: _jsx(AppLayout, { children: _jsx(Resume, {}) }) }), _jsx(Route, { path: "/lookup-data", element: _jsx(AppLayout, { children: _jsx(LookupPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }))] }) }));
};
export default AppContent;
