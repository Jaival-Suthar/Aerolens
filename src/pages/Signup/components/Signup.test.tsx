import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ accessToken: 'mock-token', isAuthenticated: true }),
}));

vi.mock('../services/useSignup', () => ({
  registerUser: vi.fn().mockResolvedValue({ success: true, message: 'User registered' }),
  fetchMemberCreateData: vi.fn().mockResolvedValue({ designations: [] }),
}));

vi.mock('primereact/dialog', () => ({
  Dialog: ({ visible, children, header, footer }: any) =>
    visible ? (
      <div data-testid="signup-dialog">
        <div data-testid="dialog-header">{header}</div>
        <div>{children}</div>
        <div data-testid="dialog-footer">{footer}</div>
      </div>
    ) : null,
}));

vi.mock('primereact/inputtext', () => ({
  InputText: ({ value, onChange, placeholder }: any) => (
    <input value={value ?? ''} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('primereact/password', () => ({
  Password: ({ value, onChange, placeholder }: any) => (
    <input type="password" value={value ?? ''} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('primereact/dropdown', () => ({
  Dropdown: ({ value, onChange, placeholder }: any) => (
    <select value={value ?? ''} onChange={(e) => onChange({ value: e.target.value })}>
      <option value="">{placeholder}</option>
    </select>
  ),
}));

vi.mock('../../../shared/components/PhoneInput', () => ({
  default: ({ value, onChange }: any) => (
    <input data-testid="phone-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('../../../shared/DialogAddEditButton', () => ({
  default: ({ label, onClick, disabled, loading }: any) => (
    <button onClick={onClick} disabled={disabled || loading}>{label}</button>
  ),
}));

import SignupForm from './SignupForm';

describe('SignupForm', () => {
  const mockOnHide = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when visible is false', () => {
    render(
      <SignupForm visible={false} onHide={mockOnHide} onSuccess={mockOnSuccess} />
    );
    expect(screen.queryByTestId('signup-dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when visible is true', async () => {
    render(
      <SignupForm visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
    );
    expect(screen.getByTestId('signup-dialog')).toBeInTheDocument();
  });

  it('renders form fields when visible', () => {
    render(
      <SignupForm visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
    );
    expect(screen.getByText('Full Name *')).toBeInTheDocument();
    expect(screen.getByText('Email *')).toBeInTheDocument();
  });

  it('calls onHide when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SignupForm visible={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
    );
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
