import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileSidebar } from './ProfileSideBar';

const mockCloseSidebar = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());

const mockProfileStore = {
  member: null as any,
  isSidebarOpen: false,
  closeSidebar: mockCloseSidebar,
  openSidebar: vi.fn(),
  setProfile: vi.fn(),
  clearProfile: vi.fn(),
};

vi.mock('./shared/store/profile', () => ({
  useProfileStore: () => mockProfileStore,
}));

vi.mock('./shared/auth/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    accessToken: 'mock-token',
    isAuthenticated: true,
    login: vi.fn(),
    logoutAll: vi.fn(),
    refreshAccessToken: vi.fn(),
  }),
}));

vi.mock('./passwordReset', () => ({
  ChangePasswordDialog: () => null,
}));

vi.mock('primereact/sidebar', () => ({
  Sidebar: ({ visible, children, onHide }: any) =>
    visible ? (
      <div data-testid="sidebar">
        <button type="button" data-testid="close-sidebar" onClick={onHide}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('primereact/divider', () => ({
  Divider: () => <hr data-testid="divider" />,
}));

vi.mock('primereact/button', () => ({
  Button: ({ label, onClick, icon }: any) => (
    <button
      type="button"
      data-testid={`p-button-${String(label).replace(/\s+/g, '-').toLowerCase()}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  ),
}));

vi.mock('react-icons/fa', () => ({
  FaSignOutAlt: () => <span data-testid="logout-icon">🚪</span>,
  FaUserCircle: () => <span data-testid="user-circle" />,
  FaKey: () => <span data-testid="key-icon" />,
}));

describe('ProfileSidebar Component', () => {
  const mockMember = {
    memberId: 123,
    memberName: 'John Doe',
    email: 'john.doe@example.com',
    designation: 'Senior Developer',
    isRecruiter: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileStore.member = null;
    mockProfileStore.isSidebarOpen = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('does not render sidebar when isSidebarOpen is false', () => {
    mockProfileStore.isSidebarOpen = false;
    mockProfileStore.member = mockMember;

    render(<ProfileSidebar />);

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('renders sidebar when isSidebarOpen is true', () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = mockMember;

    render(<ProfileSidebar />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Account Overview')).toBeInTheDocument();
  });

  it('displays member information when member data is available', () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = mockMember;

    render(<ProfileSidebar />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  it('displays "Recruiter" role when isRecruiter is true', () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = { ...mockMember, isRecruiter: true };

    render(<ProfileSidebar />);

    expect(screen.getByText('Recruiter')).toBeInTheDocument();
  });

  it('shows header fallback when memberName is empty', () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = { ...mockMember, memberName: '' };

    render(<ProfileSidebar />);

    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  it('displays "No profile data available" when member is null', () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = null;

    render(<ProfileSidebar />);

    expect(screen.getByText('No profile data available')).toBeInTheDocument();
    expect(screen.queryByTestId('p-button-logout')).not.toBeInTheDocument();
  });

  it('calls closeSidebar when sidebar is closed', async () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = mockMember;

    render(<ProfileSidebar />);

    const closeButton = screen.getByTestId('close-sidebar');
    await userEvent.click(closeButton);

    expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
  });

  it('calls logout and closeSidebar when logout button is clicked', async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = mockMember;

    render(<ProfileSidebar />);

    const logoutButton = screen.getByTestId('p-button-logout');
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
    });
  });

  it('handles logout error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Logout failed');
    mockLogout.mockRejectedValueOnce(error);
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = mockMember;

    render(<ProfileSidebar />);

    const logoutButton = screen.getByTestId('p-button-logout');
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', error);
      expect(mockCloseSidebar).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders logout button only when member data exists', () => {
    mockProfileStore.isSidebarOpen = true;
    mockProfileStore.member = null;

    const { rerender } = render(<ProfileSidebar />);

    expect(screen.queryByTestId('p-button-logout')).not.toBeInTheDocument();

    mockProfileStore.member = mockMember;
    rerender(<ProfileSidebar />);

    expect(screen.getByTestId('p-button-logout')).toBeInTheDocument();
  });
});
