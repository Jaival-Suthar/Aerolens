import React, { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext';
import { useProfileStore } from '../../shared/store/profile';

const API_BASE = 'https://api.example.com'; // Replace with your API

export const ProfilePage: React.FC = () => {
  const { accessToken, logout, logoutAll } = useAuth();
  const { member, setProfile } = useProfileStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || member) return;
    
    fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((res) => setProfile(res.data.member))
      .catch(console.error);
  }, [accessToken, member, setProfile]);

  const fetchSessions = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/sessions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setSessions(data.data.sessions);
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 32 }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Profile</h1>
      
      {member && (
        <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <p style={{ margin: '4px 0' }}><strong>ID:</strong> {member.memberId}</p>
          <p style={{ margin: '4px 0' }}><strong>Name:</strong> {member.memberName || 'N/A'}</p>
          <p style={{ margin: '4px 0' }}><strong>Email:</strong> {member.email}</p>
          <p style={{ margin: '4px 0' }}><strong>Designation:</strong> {member.designation}</p>
          <p style={{ margin: '4px 0' }}><strong>Recruiter:</strong> {member.isRecruiter ? 'Yes' : 'No'}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={logout}
          style={{ padding: '10px 16px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Logout
        </button>
        <button
          onClick={logoutAll}
          style={{ padding: '10px 16px', background: '#f0ad4e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Logout All Devices
        </button>
        <button
          onClick={fetchSessions}
          disabled={loading}
          style={{ padding: '10px 16px', background: '#5bc0de', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {loading ? 'Loading...' : 'View Sessions'}
        </button>
      </div>

      {sessions.length > 0 && (
        <div>
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>Active Sessions</h3>
          {sessions.map((s) => (
            <div key={s.id} style={{ background: '#f9f9f9', padding: 16, marginBottom: 12, borderRadius: 6, fontSize: 13 }}>
              <p style={{ margin: '4px 0' }}><strong>User Agent:</strong> {s.userAgent}</p>
              <p style={{ margin: '4px 0' }}><strong>IP:</strong> {s.ipAddress}</p>
              <p style={{ margin: '4px 0' }}><strong>Issued:</strong> {new Date(s.issuedAt).toLocaleString()}</p>
              <p style={{ margin: '4px 0' }}><strong>Expires:</strong> {new Date(s.expiresAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};