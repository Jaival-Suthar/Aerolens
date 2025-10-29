import React, { useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const EMAIL_HISTORY_KEY = 'auth_email_history';

const getEmailSuggestions = (): string[] => {
  try {
    const raw = localStorage.getItem(EMAIL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveEmail = (email: string) => {
  let list = getEmailSuggestions().filter(e => e !== email);
  list.unshift(email);
  if (list.length > 5) list = list.slice(0, 5);
  localStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(list));
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      saveEmail(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#eef1f7',
      }}
    >
    <div style={{
      maxWidth: 450,
      width: '100%',
      padding: 40,
      background: '#f9f9f9',
      borderRadius: 12,
      boxShadow: '0 4px 24px #1f1f1f61',
      minHeight: 340, 
    }}>
      <h2
        style={{
          marginBottom: 38,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 0.6,
          textAlign: 'center',
          background: 'linear-gradient(90deg, #072844, #55c62c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Login to Aerolens Portal
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="p-float-label" style={{ marginBottom: 28 }}>
          <InputText
            id="email-field"
            value={email}
            type="email"
            onChange={e => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            style={{ width: '100%', borderRadius: 25, color: '#000000ff' }}
            className="p-inputtext-sm"
            list="email-history"
            autoComplete="email"
          />
          <label htmlFor="email-field" style={{ marginLeft:6  ,color: '#000000ff' }}>Email</label>
        </div>
        
        <div className="p-float-label" style={{ marginBottom: 24, position: 'relative', color: '#000000ff', }}>
        <InputText
          id="password-field"
          value={password}
          type={showPassword ? "text" : "password"}
          onChange={e => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          style={{ width: '100%', paddingRight: 40, borderRadius: 25 }}
          className="p-inputtext-sm"
          onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
        />
        <label htmlFor="password-field" style={{ marginLeft:6  ,color: '#000000ff' }}>Password</label>
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            fontSize: 20,
            color: '#000000ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
          onClick={() => setShowPassword(v => !v)}
        >
          {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        </span>
      </div>

        {error && (
          <p style={{ 
            color: '#d9534f', 
            fontSize: 13, 
            marginBottom: 16,
            marginTop: -8,
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            borderRadius: 8,
            border: '1px solid #fecaca',
          }}>
            {error}
          </p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <Button
          type="submit"
          label={loading ? "Logging in..." : "Login"}
          loading={loading}
          style={{
            width: '60%',
            backgroundColor: '#072844',
            border: 'none',
            borderRadius: 25,
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
            boxShadow: '0 4px 14px rgba(7, 40, 68, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0b3b63';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#072844';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
          disabled={loading}
        />
      </div>
      </form>
    </div>
    </div>
  );
};

export default LoginPage;