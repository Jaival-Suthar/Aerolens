import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { useProfileStore } from './shared/store/profile';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useAuth } from './shared/auth/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';
import { ChangePasswordDialog } from './passwordReset';

export const ProfileSidebar: React.FC = () => {
  const { member, isSidebarOpen, closeSidebar } = useProfileStore();
  const { logout } = useAuth();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeSidebar();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Sidebar
        visible={isSidebarOpen}
        position="right"
        onHide={closeSidebar}
        style={{
          width: '30%',
          minWidth: '300px',
          maxWidth: '400px',
        }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        baseZIndex={1000}
      >
        <div style={{ padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2
            style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              color: '#333',
              fontWeight: 600,
            }}
          >
            User Profile
          </h2>

          <Divider />

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {member ? (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem' }}>
                    Name
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
                    {member.memberName || 'N/A'}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem' }}>
                    Email
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#333', wordBreak: 'break-word' }}>
                    {member.email}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem' }}>
                    Member ID
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
                    {member.memberId}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem' }}>
                    Designation
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
                    {member.designation}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem' }}>
                    Role
                  </label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
                    {member.isRecruiter ? 'Recruiter' : 'Member'}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
                No profile data available
              </p>
            )}
          </div>

          {member && (
            <>
              <Divider />

              <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  label="Change Password"
                  icon="pi pi-key"
                  onClick={() => setIsChangePasswordOpen(true)}
                  style={{
                    width: '100%',
                    fontWeight: 600,
                    padding: '0.75rem',
                  }}
                />

                <Button
                  label="Logout"
                  icon={<FaSignOutAlt style={{ marginRight: '0.5rem' }} />}
                  onClick={handleLogout}
                  severity="danger"
                  style={{
                    width: '100%',
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    color: 'white',
                    fontWeight: 600,
                    padding: '0.75rem',
                  }}
                />
              </div>
            </>
          )}
        </div>
      </Sidebar>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        visible={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
