import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Sidebar } from 'primereact/sidebar';
import { useProfileStore } from './shared/store/profile';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useAuth } from './shared/auth/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';
export const ProfileSidebar = () => {
    const { member, isSidebarOpen, closeSidebar } = useProfileStore();
    const { logout } = useAuth();
    const handleLogout = async () => {
        try {
            await logout();
            closeSidebar();
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    };
    return (_jsx(Sidebar, { visible: isSidebarOpen, position: "right", onHide: closeSidebar, style: {
            width: '30%',
            minWidth: '300px',
            maxWidth: '400px',
        }, maskStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }, baseZIndex: 1000, children: _jsxs("div", { style: { padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsx("h2", { style: {
                        margin: '0 0 1rem 0',
                        fontSize: '1.5rem',
                        color: '#333',
                        fontWeight: 600,
                    }, children: "User Profile" }), _jsx(Divider, {}), _jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: member ? (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: '#666',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }, children: "Name" }), _jsx("p", { style: {
                                            margin: 0,
                                            fontSize: '1rem',
                                            color: '#333',
                                        }, children: member.memberName || 'N/A' })] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: '#666',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }, children: "Email" }), _jsx("p", { style: {
                                            margin: 0,
                                            fontSize: '1rem',
                                            color: '#333',
                                            wordBreak: 'break-word',
                                        }, children: member.email })] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: '#666',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }, children: "Member ID" }), _jsx("p", { style: {
                                            margin: 0,
                                            fontSize: '1rem',
                                            color: '#333',
                                        }, children: member.memberId })] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: '#666',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }, children: "Designation" }), _jsx("p", { style: {
                                            margin: 0,
                                            fontSize: '1rem',
                                            color: '#333',
                                        }, children: member.designation })] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: '#666',
                                            marginBottom: '0.5rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }, children: "Role" }), _jsx("p", { style: {
                                            margin: 0,
                                            fontSize: '1rem',
                                            color: '#333',
                                        }, children: member.isRecruiter ? 'Recruiter' : 'Member' })] })] })) : (_jsx("p", { style: { color: '#666', textAlign: 'center', marginTop: '2rem' }, children: "No profile data available" })) }), member && (_jsxs(_Fragment, { children: [_jsx(Divider, {}), _jsx("div", { style: { paddingTop: '1rem' }, children: _jsx(Button, { label: "Logout", icon: _jsx(FaSignOutAlt, { style: { marginRight: '0.5rem' } }), onClick: handleLogout, severity: "danger", style: {
                                    width: '100%',
                                    backgroundColor: '#dc3545',
                                    borderColor: '#dc3545',
                                    color: 'white',
                                    fontWeight: 600,
                                    padding: '0.75rem',
                                } }) })] }))] }) }));
};
