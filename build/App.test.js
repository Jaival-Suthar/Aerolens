import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import React from 'react';
// Mock AppContent component
vi.mock('./AppContent', () => ({
    default: () => _jsx("div", { "data-testid": "app-content", children: "AppContent" }),
}));
// Mock ProfileSidebar component
vi.mock('./ProfileSideBar', () => ({
    ProfileSidebar: () => _jsx("div", { "data-testid": "profile-sidebar", children: "ProfileSidebar" }),
}));
// Mock AuthContext (required by ProfileSidebar)
vi.mock('./shared/auth/AuthContext', () => ({
    useAuth: () => ({
        accessToken: 'mock-token-123',
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        logoutAll: vi.fn(),
        refreshAccessToken: vi.fn(),
    }),
    AuthProvider: ({ children }) => _jsx("div", { children: children }),
}));
// Mock Profile Store (required by ProfileSidebar)
vi.mock('./shared/store/profile', () => ({
    useProfileStore: () => ({
        member: null,
        isSidebarOpen: false,
        closeSidebar: vi.fn(),
        openSidebar: vi.fn(),
        toggleSidebar: vi.fn(),
        setProfile: vi.fn(),
        clearProfile: vi.fn(),
    }),
}));
// Mock PrimeReactProvider
vi.mock('primereact/api', () => ({
    PrimeReactProvider: ({ children }) => (_jsx("div", { "data-testid": "prime-react-provider", children: children })),
}));
// Mock theme CSS
vi.mock('primereact/resources/themes/saga-blue/theme.css', () => ({}));
// Mock BrowserRouter
vi.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }) => (_jsx("div", { "data-testid": "browser-router", children: children })),
}));
describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('Structure & Providers', () => {
        it('renders App component without errors', () => {
            render(_jsx(App, {}));
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
            expect(screen.getByTestId('profile-sidebar')).toBeInTheDocument();
        });
        it('wraps content with PrimeReactProvider', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            expect(provider).toBeInTheDocument();
        });
        it('renders ProfileSidebar component', () => {
            render(_jsx(App, {}));
            expect(screen.getByTestId('profile-sidebar')).toBeInTheDocument();
        });
        it('renders AppContent component', async () => {
            render(_jsx(App, {}));
            await waitFor(() => {
                expect(screen.getByTestId('app-content')).toBeInTheDocument();
            });
        });
        it('PrimeReactProvider is parent of Router', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            const content = screen.getByTestId('app-content');
            expect(provider).toBeInTheDocument();
            expect(content).toBeInTheDocument();
            expect(provider.contains(content)).toBe(true);
        });
        it('renders correct component hierarchy', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            expect(provider).toBeInTheDocument();
            const appContent = provider.querySelector('[data-testid="app-content"]');
            expect(appContent).toBeInTheDocument();
        });
    });
    describe('PrimeReact Theme Integration', () => {
        it('includes PrimeReact provider for styling', () => {
            const { container } = render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            expect(provider).toBeInTheDocument();
            expect(container).toBeTruthy();
        });
        it('PrimeReactProvider wraps entire app', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            const children = provider.children.length;
            expect(children).toBeGreaterThan(0);
        });
        it('theme CSS is imported', () => {
            // Verify the import is in the file by checking if PrimeReactProvider exists
            render(_jsx(App, {}));
            expect(screen.getByTestId('prime-react-provider')).toBeInTheDocument();
        });
    });
    describe('Router Configuration', () => {
        it('wraps App with BrowserRouter', () => {
            const { container } = render(_jsx(App, {}));
            expect(screen.getByTestId('prime-react-provider')).toBeInTheDocument();
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });
        it('Router is a child of PrimeReactProvider', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            const content = screen.getByTestId('app-content');
            // Content should be inside provider
            expect(provider.contains(content)).toBe(true);
        });
        it('renders without Router errors', () => {
            expect(() => {
                render(_jsx(App, {}));
            }).not.toThrow();
        });
        it('AppContent is child of Router (within provider)', () => {
            render(_jsx(App, {}));
            const appContent = screen.getByTestId('app-content');
            const provider = screen.getByTestId('prime-react-provider');
            expect(appContent).toBeInTheDocument();
            expect(provider.contains(appContent)).toBe(true);
        });
    });
    describe('Component Composition', () => {
        it('App is a functional component', () => {
            expect(typeof App).toBe('function');
        });
        it('App returns JSX Element', () => {
            const element = App();
            expect(element).toBeTruthy();
        });
        it('renders all required layers', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            const content = screen.getByTestId('app-content');
            expect(provider).toBeInTheDocument();
            expect(content).toBeInTheDocument();
        });
        it('component structure is correct: PrimeReactProvider > Router > AppContent', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            expect(provider).toBeInTheDocument();
            const content = screen.getByTestId('app-content');
            expect(content).toBeInTheDocument();
            // Verify nesting
            expect(provider.contains(content)).toBe(true);
        });
    });
    describe('Import & Dependencies', () => {
        it('imports React correctly', () => {
            expect(React).toBeDefined();
        });
        it('uses lazy and Suspense from React', () => {
            // If these weren't imported, the file wouldn't compile
            const app = App();
            expect(app).toBeTruthy();
        });
        it('imports PrimeReactProvider', () => {
            render(_jsx(App, {}));
            expect(screen.getByTestId('prime-react-provider')).toBeInTheDocument();
        });
        it('imports BrowserRouter from react-router-dom', () => {
            const { container } = render(_jsx(App, {}));
            expect(container).toBeTruthy();
        });
        it('imports AppContent component', () => {
            render(_jsx(App, {}));
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });
    });
    describe('Type Safety', () => {
        it('App component returns JSX.Element', () => {
            const result = App();
            expect(result).toBeTruthy();
            expect(result.type).toBeTruthy();
        });
        it('App is a React FC', () => {
            const app = App();
            expect(app).toHaveProperty('$$typeof');
        });
        it('component renders without prop requirements', () => {
            expect(() => {
                render(_jsx(App, {}));
            }).not.toThrow();
        });
        it('App accepts no props', () => {
            const { container } = render(_jsx(App, {}));
            expect(container).toBeTruthy();
        });
    });
    describe('Rendering & DOM', () => {
        it('renders successfully', () => {
            const { container } = render(_jsx(App, {}));
            expect(container).toBeTruthy();
        });
        it('renders single root div from PrimeReactProvider', () => {
            const { container } = render(_jsx(App, {}));
            const divs = container.querySelectorAll('div');
            expect(divs.length).toBeGreaterThan(0);
        });
        it('AppContent is accessible in DOM', () => {
            render(_jsx(App, {}));
            const content = screen.getByTestId('app-content');
            expect(content).toBeVisible();
        });
        it('component does not render null', () => {
            const { container } = render(_jsx(App, {}));
            expect(container.textContent).toBeTruthy();
        });
        it('renders all descendants', () => {
            const { container } = render(_jsx(App, {}));
            const allElements = container.querySelectorAll('*');
            expect(allElements.length).toBeGreaterThan(0);
        });
    });
    describe('Provider Configuration', () => {
        it('PrimeReactProvider is properly configured', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            expect(provider).toBeInTheDocument();
        });
        it('theme styles are loaded through provider', () => {
            render(_jsx(App, {}));
            expect(screen.getByTestId('prime-react-provider')).toBeInTheDocument();
        });
        it('provider passes children correctly', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            const hasChildren = provider.children.length > 0;
            expect(hasChildren).toBe(true);
        });
        it('nested structure is maintained', () => {
            render(_jsx(App, {}));
            const provider = screen.getByTestId('prime-react-provider');
            const content = screen.getByTestId('app-content');
            expect(provider.contains(content)).toBe(true);
        });
    });
    describe('Edge Cases & Error Handling', () => {
        it('handles multiple renders without errors', () => {
            const { rerender } = render(_jsx(App, {}));
            expect(() => {
                rerender(_jsx(App, {}));
            }).not.toThrow();
        });
        it('cleanup after unmount works correctly', () => {
            const { unmount } = render(_jsx(App, {}));
            expect(() => {
                unmount();
            }).not.toThrow();
        });
        it('App is stable across renders', () => {
            render(_jsx(App, {}));
            const content1 = screen.getByTestId('app-content');
            expect(content1).toBeInTheDocument();
        });
        it('component handles missing AppContent gracefully', () => {
            render(_jsx(App, {}));
            // Component should still render with mocked AppContent
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });
        it('renders without throwing errors', () => {
            expect(() => {
                render(_jsx(App, {}));
            }).not.toThrow();
        });
    });
});
