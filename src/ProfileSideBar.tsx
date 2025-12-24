import React, { useState, useEffect } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { useProfileStore } from './shared/store/profile';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useAuth } from './shared/auth/AuthContext';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
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

  const InfoBlock = ({ label, value }: { label: string; value?: string }) => (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: '#ffffff',
        border: '1px solid #eef2f7',
        boxShadow: '0 4px 10px rgba(7,40,68,0.06)',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#072844',
          wordBreak: 'break-word',
        }}
      >
        {value || 'N/A'}
      </div>
    </div>
  );
  useEffect(() => {
  if (isSidebarOpen) {
    // Lock background scroll
    document.body.style.overflow = 'hidden';
  } else {
    // Restore scroll
    document.body.style.overflow = '';
  }

  // Cleanup on unmount (safety)
  return () => {
    document.body.style.overflow = '';
  };
}, [isSidebarOpen]);


  return (
    <>
      <style>
    {`
      .p-sidebar-content {
        scrollbar-width: none;        /* Firefox */
        -ms-overflow-style: none;     /* IE / Edge */
      }

      .p-sidebar-content::-webkit-scrollbar {
        display: none;                /* Chrome / Safari */
      }
    `}
  </style>
      <Sidebar
        visible={isSidebarOpen}
        position="right"
        onHide={closeSidebar}
        style={{ width: '380px' }}
        baseZIndex={1000}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #072844, #55c62c)',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 6px 20px rgba(7,40,68,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaUserCircle size={36} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {member?.memberName || 'User Profile'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Account Overview
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {member ? (
            <>
              <InfoBlock label="Email" value={member.email} />
              <InfoBlock label="Member ID" value={member.memberId.toString()} />
              <InfoBlock label="Designation" value={member.designation} />
              <InfoBlock
                label="Role"
                value={member.isRecruiter ? 'Recruiter' : 'Member'}
              />
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              No profile data available
            </p>
          )}
        </div>

        <Divider />

        {/* Actions */}
        {member && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <Button
              label="Change Password"
              icon="pi pi-key"
              onClick={() => {
                closeSidebar(); 
                setIsChangePasswordOpen(true);
              }}
              style={{
                background: 'linear-gradient(90deg, #072844, #55c62c)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.75rem',
                boxShadow: '0 4px 14px rgba(7,40,68,0.35)',
                transition: 'all 0.2s ease',
              }}
            />


            <Button
              label="Logout"
              icon={<FaSignOutAlt />}
              onClick={handleLogout}
              style={{
                background: '#b91c1c', // deep red (Tailwind red-700)
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.75rem',
                boxShadow: '0 4px 12px rgba(185,28,28,0.35)',
                transition: 'all 0.2s ease',
              }}
            />

          </div>
        )}
      </Sidebar>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        visible={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
