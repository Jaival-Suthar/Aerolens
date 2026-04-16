import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppContent from './AppContent';
import { AuthContext } from './shared/auth/AuthContext';

// Mock components used inside AppContent
vi.mock('./AppNavbar', () => ({
  default: () => <nav data-testid="app-navbar">AppNavbar</nav>,
}));

vi.mock('./pages/ClientPage/page', () => ({
  default: () => <div data-testid="client-page">Client Page</div>,
}));

vi.mock('./pages/Dashboard/page', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('./pages/JobProfileNew/page', () => ({
  default: () => <div data-testid="job-profile-page">Job Profile Page</div>,
}));

vi.mock('./pages/Login/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('./pages/Resume/page', () => ({
  default: () => <div data-testid="resume-page">Resume Page</div>,
}));

vi.mock('./pages/Lookup/page', () => ({
  default: () => <div data-testid="lookup-page">Lookup Page</div>,
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

  const renderWithAuth = (ui: React.ReactNode, route: string = '/home') => {
    return render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('renders AppNavbar', async () => {
    renderWithAuth(<AppContent />);

    await waitFor(() => {
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
    });
  });

  it('renders main content with correct classes', async () => {
    renderWithAuth(<AppContent />, '/home');

    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('main-content', 'p-2');
    });
  });

  it('renders main content with correct styles', async () => {
    renderWithAuth(<AppContent />, '/home');

    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveStyle('background: #fff');
      expect(mainContent).toHaveStyle('min-height: 0');
    });
  });

  it('renders app container', async () => {
    renderWithAuth(<AppContent />, '/home');

    await waitFor(() => {
      const appContainer = screen.getByRole('main').closest('.app');
      expect(appContainer).toBeInTheDocument();
    });
  });

  it('renders home page on /home route', async () => {
    renderWithAuth(<AppContent />, '/home');

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders not found page on invalid route', async () => {
    renderWithAuth(<AppContent />, '/invalid-route-xyz');

    await waitFor(() => {
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
    });
  });

  it('displays correct text in not found page', async () => {
    renderWithAuth(<AppContent />, '/invalid');

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page not found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home page/i })).toBeInTheDocument();
    });
  });

  it('renders app with navbar and main content together', async () => {
    renderWithAuth(<AppContent />, '/home');

    await waitFor(() => {
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  it('renders home page by default on root path', async () => {
    renderWithAuth(<AppContent />, '/');

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

    // Additional Tests for 100% Coverage
  it('redirects unauthenticated users to login page', async () => {
    const unauthenticatedAuth = { ...mockAuth, isAuthenticated: false };

    render(
      <AuthContext.Provider value={unauthenticatedAuth}>
        <MemoryRouter initialEntries={['/home']}>
          <AppContent />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('renders login route at /login when authenticated (no auto-redirect in app)', async () => {
    renderWithAuth(<AppContent />, '/login');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('renders client page correctly', async () => {
    renderWithAuth(<AppContent />, '/client');

    await waitFor(() => {
      expect(screen.getByTestId('client-page')).toBeInTheDocument();
    });
  });

  it('renders job profile page correctly', async () => {
    renderWithAuth(<AppContent />, '/job-profile');

    await waitFor(() => {
      expect(screen.getByTestId('job-profile-page')).toBeInTheDocument();
    });
  });

  it('renders resume page correctly', async () => {
    renderWithAuth(<AppContent />, '/resume');

    await waitFor(() => {
      expect(screen.getByTestId('resume-page')).toBeInTheDocument();
    });
  });

  it('renders lookup data page correctly', async () => {
    renderWithAuth(<AppContent />, '/lookup-data');

    await waitFor(() => {
      expect(screen.getByTestId('lookup-page')).toBeInTheDocument();
    });
  });

  it('handles unauthenticated catch-all route (renders nothing)', async () => {
    const unauthenticatedAuth = { ...mockAuth, isAuthenticated: false };

    render(
      <AuthContext.Provider value={unauthenticatedAuth}>
        <MemoryRouter initialEntries={['/random']}>
          <AppContent />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });

  it('NotFound page exposes a button to go home', async () => {
    renderWithAuth(<AppContent />, '/invalid-route-xyz');

    const btn = await screen.findByRole('button', { name: /go to home page/i });
    expect(btn).toBeInTheDocument();
  });

});
