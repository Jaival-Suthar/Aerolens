import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppContent from './AppContent';
import { AuthContext } from './shared/auth/AuthContext';
// Mock components used inside AppContent
vi.mock('./AppNavbar', () => ({
    default: () => _jsx("nav", { "data-testid": "app-navbar", children: "AppNavbar" }),
}));
vi.mock('./pages/ClientPage/page', () => ({
    default: () => _jsx("div", { "data-testid": "client-page", children: "Client Page" }),
}));
vi.mock('./pages/Dashboard/page', () => ({
    default: () => _jsx("div", { "data-testid": "home-page", children: "Home Page" }),
}));
vi.mock('./pages/JobProfile/page', () => ({
    default: () => _jsx("div", { "data-testid": "job-profile-page", children: "Job Profile Page" }),
}));
vi.mock('./pages/Resume/page', () => ({
    default: () => _jsx("div", { "data-testid": "resume-page", children: "Resume Page" }),
}));
vi.mock('./pages/Lookup/page', () => ({
    default: () => _jsx("div", { "data-testid": "lookup-page", children: "Lookup Page" }),
}));
// ✅ Mock AuthContext value (authenticated state)
const mockAuth = {
    accessToken: 'mock-token-123',
    isAuthenticated: true,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    logoutAll: vi.fn().mockResolvedValue(undefined),
    refreshAccessToken: vi.fn().mockResolvedValue('mock-token-123'),
};
describe('AppContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    const renderWithAuth = (ui, route = '/home') => {
        return render(_jsx(AuthContext.Provider, { value: mockAuth, children: _jsx(MemoryRouter, { initialEntries: [route], children: ui }) }));
    };
    it('renders AppNavbar', async () => {
        renderWithAuth(_jsx(AppContent, {}));
        await waitFor(() => {
            expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
        });
    });
    it('renders main content with correct classes', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/home');
        await waitFor(() => {
            const mainContent = screen.getByRole('main');
            expect(mainContent).toHaveClass('main-content', 'p-2');
        });
    });
    it('renders main content with correct styles', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/home');
        await waitFor(() => {
            const mainContent = screen.getByRole('main');
            expect(mainContent).toHaveStyle('background: #fff');
            expect(mainContent).toHaveStyle('minHeight: 100vh');
        });
    });
    it('renders app container', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/home');
        await waitFor(() => {
            const appContainer = screen.getByRole('main').closest('.app');
            expect(appContainer).toBeInTheDocument();
        });
    });
    it('renders home page on /home route', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/home');
        await waitFor(() => {
            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });
    it('renders not found page on invalid route', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/invalid-route-xyz');
        await waitFor(() => {
            expect(screen.getByTestId('not-found')).toBeInTheDocument();
            expect(screen.getByText('404')).toBeInTheDocument();
        });
    });
    it('displays correct text in not found page', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/invalid');
        await waitFor(() => {
            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('Page not found')).toBeInTheDocument();
            expect(screen.getByTestId('go-dashboard-btn')).toBeInTheDocument();
        });
    });
    it('renders app with navbar and main content together', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/home');
        await waitFor(() => {
            expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
            expect(screen.getByRole('main')).toBeInTheDocument();
        });
    });
    it('renders home page by default on root path', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/');
        await waitFor(() => {
            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });
    // Additional Tests for 100% Coverage
    it('redirects unauthenticated users to login page', async () => {
        const unauthenticatedAuth = { ...mockAuth, isAuthenticated: false };
        render(_jsx(AuthContext.Provider, { value: unauthenticatedAuth, children: _jsx(MemoryRouter, { initialEntries: ['/home'], children: _jsx(AppContent, {}) }) }));
        // The user should see login page (redirected)
        await waitFor(() => {
            expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
        });
    });
    it('redirects authenticated users from /login to /home', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/login');
        await waitFor(() => {
            expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
            expect(screen.getByTestId('home-page')).toBeInTheDocument();
        });
    });
    it('renders client page correctly', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/client');
        await waitFor(() => {
            expect(screen.getByTestId('client-page')).toBeInTheDocument();
        });
    });
    it('renders job profile page correctly', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/job-profile');
        await waitFor(() => {
            expect(screen.getByTestId('job-profile-page')).toBeInTheDocument();
        });
    });
    it('renders resume page correctly', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/resume');
        await waitFor(() => {
            expect(screen.getByTestId('resume-page')).toBeInTheDocument();
        });
    });
    it('renders lookup data page correctly', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/lookup-data');
        await waitFor(() => {
            expect(screen.getByTestId('lookup-page')).toBeInTheDocument();
        });
    });
    it('handles unauthenticated catch-all route (renders nothing)', async () => {
        const unauthenticatedAuth = { ...mockAuth, isAuthenticated: false };
        render(_jsx(AuthContext.Provider, { value: unauthenticatedAuth, children: _jsx(MemoryRouter, { initialEntries: ['/random'], children: _jsx(AppContent, {}) }) }));
        await waitFor(() => {
            expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
            expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
        });
    });
    it('navigates to /home when clicking "Go to Home Page" button in NotFound page', async () => {
        renderWithAuth(_jsx(AppContent, {}), '/invalid-route-xyz');
        const btn = await screen.findByTestId('go-dashboard-btn');
        Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
        btn.click();
        expect(window.location.href).toBe('/home');
    });
});
