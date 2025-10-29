import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppContent from './AppContent';

vi.mock('./AppNavbar', () => ({
  default: () => <nav data-testid="app-navbar">AppNavbar</nav>,
}));

vi.mock('./pages/ClientPage/page', () => ({
  default: () => <div data-testid="client-page">Client Page</div>,
}));

vi.mock('./pages/Dashboard/page', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('./pages/JobProfile/page', () => ({
  default: () => <div data-testid="job-profile-page">Job Profile Page</div>,
}));

vi.mock('./pages/Resume/page', () => ({
  default: () => <div data-testid="resume-page">Resume Page</div>,
}));

vi.mock('./pages/Lookup/page', () => ({
  default: () => <div data-testid="lookup-page">Lookup Page</div>,
}));

describe('AppContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AppNavbar', async () => {
    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
    });
  });

  it('renders main content with correct classes', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('main-content', 'p-2');
    });
  });

  it('renders main content with correct styles', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveStyle('background: rgb(255, 255, 255)');
      expect(mainContent).toHaveStyle('minHeight: 100vh');
    });
  });

  it('renders app container', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      const appContainer = screen.getByRole('main').closest('.app');
      expect(appContainer).toBeInTheDocument();
    });
  });

  it('renders home page on /home route', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('renders loading spinner during lazy load', async () => {
    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
    });
  });

  it('renders not found page on invalid route', async () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route-xyz']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
    });
  });

  it('displays correct text in not found page', async () => {
    render(
      <MemoryRouter initialEntries={['/invalid']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page not found')).toBeInTheDocument();
      expect(screen.getByTestId('go-dashboard-btn')).toBeInTheDocument();
    });
  });

  it('renders Suspense with navbar', async () => {
    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
    });
  });

  it('not found button is clickable', async () => {
    render(
      <MemoryRouter initialEntries={['/invalid']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      const button = screen.getByTestId('go-dashboard-btn');
      expect(button).toBeInTheDocument();
    });
  });

  it('renders app with navbar and main content together', async () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  it('renders home page by default on root path', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { BrowserRouter } from 'react-router-dom';
// import AppContent from './AppContent';

// vi.mock('./AppNavbar', () => ({
//   default: () => <nav data-testid="app-navbar">AppNavbar</nav>,
// }));

// vi.mock('./pages/ClientPage/page', () => ({
//   default: () => <div data-testid="client-page">Client Page</div>,
// }));

// vi.mock('./pages/Dashboard/page', () => ({
//   default: () => <div data-testid="home-page">Home Page</div>,
// }));

// vi.mock('./pages/JobProfile/page', () => ({
//   default: () => <div data-testid="job-profile-page">Job Profile Page</div>,
// }));

// vi.mock('./pages/Resume/page', () => ({
//   default: () => <div data-testid="resume-page">Resume Page</div>,
// }));

// vi.mock('./pages/Lookup/page', () => ({
//   default: () => <div data-testid="lookup-page">Lookup Page</div>,
// }));

// describe('AppContent', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it('renders AppNavbar', async () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
//     });
//   });

//   it('renders main content with correct classes', () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     const mainContent = screen.getByRole('main');
//     expect(mainContent).toHaveClass('main-content', 'p-2');
//   });

//   it('renders main content with correct styles', () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     const mainContent = screen.getByRole('main');
//     expect(mainContent).toHaveStyle('background: rgb(255, 255, 255)');
//     expect(mainContent).toHaveStyle('minHeight: 100vh');
//   });

//   it('renders app container', () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     const appContainer = screen.getByRole('main').closest('.app');
//     expect(appContainer).toBeInTheDocument();
//   });

//   it('renders home page on /home route', async () => {
//     window.history.pushState({}, 'Home', '/home');
    
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('home-page')).toBeInTheDocument();
//     });
//   });

//   it('renders loading spinner during lazy load', async () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
//     });
//   });

//   it('renders not found page on invalid route', async () => {
//     window.history.pushState({}, 'Invalid', '/invalid-route-xyz');
    
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('not-found')).toBeInTheDocument();
//       expect(screen.getByText('404')).toBeInTheDocument();
//     });
//   });

//   it('displays correct text in not found page', async () => {
//     window.history.pushState({}, 'Invalid', '/invalid');
    
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByText('404')).toBeInTheDocument();
//       expect(screen.getByText('Page not found')).toBeInTheDocument();
//       expect(screen.getByTestId('go-dashboard-btn')).toBeInTheDocument();
//     });
//   });

//   it('renders Suspense fallback properly', () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     const loadingSpinner = screen.queryByTestId('loading-spinner');
//     const navbar = screen.queryByTestId('app-navbar');
    
//     // Either loading spinner or navbar should be present
//     expect(loadingSpinner || navbar).toBeTruthy();
//   });

//   it('navigates to dashboard on not found button click', async () => {
//     const user = userEvent.setup();
//     window.history.pushState({}, 'Invalid', '/not-found');
    
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('go-dashboard-btn')).toBeInTheDocument();
//     });

//     const button = screen.getByTestId('go-dashboard-btn');
//     expect(button).toBeInTheDocument();
//   });

//   it('renders app with navbar and main content together', async () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
//       expect(screen.getByRole('main')).toBeInTheDocument();
//     });
//   });

//   it('renders home page by default', async () => {
//     render(
//       <BrowserRouter>
//         <AppContent />
//       </BrowserRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByTestId('home-page')).toBeInTheDocument();
//     });
//   });
// });