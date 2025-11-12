import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProfileSidebar } from './ProfileSideBar';
// ---- Hoisted mocks ----
const mockCloseSidebar = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());
// ---- Mock ProfileStore ----
const mockProfileStore = {
    member: null,
    isSidebarOpen: false,
    closeSidebar: mockCloseSidebar,
    openSidebar: vi.fn(),
    setProfile: vi.fn(),
    clearProfile: vi.fn(),
};
vi.mock('./shared/store/profile', () => ({
    useProfileStore: () => mockProfileStore,
}));
// ---- Mock AuthContext ----
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
// ---- Mock PrimeReact Components ----
vi.mock('primereact/sidebar', () => ({
    Sidebar: ({ visible, children, onHide }) => visible ? (_jsxs("div", { "data-testid": "sidebar", children: [_jsx("button", { "data-testid": "close-sidebar", onClick: onHide, children: "Close" }), children] })) : null,
}));
vi.mock('primereact/divider', () => ({
    Divider: () => _jsx("hr", { "data-testid": "divider" }),
}));
vi.mock('primereact/button', () => ({
    Button: ({ label, onClick, icon }) => (_jsxs("button", { "data-testid": "logout-button", onClick: onClick, children: [icon, label] })),
}));
vi.mock('react-icons/fa', () => ({
    FaSignOutAlt: () => _jsx("span", { "data-testid": "logout-icon", children: "\uD83D\uDEAA" }),
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
    it('does not render sidebar when isSidebarOpen is false', () => {
        mockProfileStore.isSidebarOpen = false;
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });
    it('renders sidebar when isSidebarOpen is true', () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByText('User Profile')).toBeInTheDocument();
    });
    it('displays member information when member data is available', () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
        expect(screen.getByText('Member')).toBeInTheDocument();
    });
    it('displays "Recruiter" role when isRecruiter is true', () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = { ...mockMember, isRecruiter: true };
        render(_jsx(ProfileSidebar, {}));
        expect(screen.getByText('Recruiter')).toBeInTheDocument();
    });
    it('displays "N/A" when memberName is not provided', () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = { ...mockMember, memberName: '' };
        render(_jsx(ProfileSidebar, {}));
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });
    it('displays "No profile data available" when member is null', () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = null;
        render(_jsx(ProfileSidebar, {}));
        expect(screen.getByText('No profile data available')).toBeInTheDocument();
        expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });
    it('calls closeSidebar when sidebar is closed', async () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        const closeButton = screen.getByTestId('close-sidebar');
        await userEvent.click(closeButton);
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
    });
    it('calls logout and closeSidebar when logout button is clicked', async () => {
        mockLogout.mockResolvedValueOnce(undefined);
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        const logoutButton = screen.getByTestId('logout-button');
        await userEvent.click(logoutButton);
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
        });
    });
    it('handles logout error gracefully', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const error = new Error('Logout failed');
        mockLogout.mockRejectedValueOnce(error);
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        const logoutButton = screen.getByTestId('logout-button');
        await userEvent.click(logoutButton);
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', error);
            // closeSidebar should NOT be called when logout fails
            expect(mockCloseSidebar).not.toHaveBeenCalled();
        });
        consoleErrorSpy.mockRestore();
    });
    it('renders logout button only when member data exists', () => {
        mockProfileStore.isSidebarOpen = true;
        mockProfileStore.member = null;
        render(_jsx(ProfileSidebar, {}));
        expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
        // Re-render with member data
        mockProfileStore.member = mockMember;
        render(_jsx(ProfileSidebar, {}));
        expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });
});
