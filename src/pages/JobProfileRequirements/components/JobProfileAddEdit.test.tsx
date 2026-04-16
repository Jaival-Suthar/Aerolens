import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'mock-token' }),
}));

vi.mock('../services/jobProfileRequirementsService', () => ({
  validateJobProfileRequirementsRequest: vi.fn().mockReturnValue([]),
  getClients: vi.fn().mockResolvedValue({ clients: [], locations: [] }),
  fetchJobProfileRequirementsLookupData: vi.fn().mockResolvedValue({ profileStatuses: [] }),
}));

vi.mock('primereact/dialog', () => ({
  Dialog: ({ visible, children, header, footer }: any) =>
    visible ? (
      <div data-testid="dialog">
        <div data-testid="dialog-header">{header}</div>
        <div>{children}</div>
        <div data-testid="dialog-footer">{footer}</div>
      </div>
    ) : null,
}));

vi.mock('primereact/inputtext', () => ({
  InputText: ({ value, onChange }: any) => (
    <input data-testid="inputtext" value={value ?? ''} onChange={onChange} />
  ),
}));

vi.mock('primereact/inputtextarea', () => ({
  InputTextarea: ({ value, onChange }: any) => (
    <textarea data-testid="inputtextarea" value={value ?? ''} onChange={onChange} />
  ),
}));

vi.mock('primereact/inputnumber', () => ({
  InputNumber: ({ value, onValueChange }: any) => (
    <input
      data-testid="inputnumber"
      type="number"
      value={value ?? ''}
      onChange={(e) => onValueChange({ value: Number(e.target.value) })}
    />
  ),
}));

vi.mock('primereact/dropdown', () => ({
  Dropdown: ({ value, onChange, placeholder }: any) => (
    <select data-testid="dropdown" value={value ?? ''} onChange={e => onChange({ value: e.target.value })}>
      <option value="">{placeholder}</option>
    </select>
  ),
}));

vi.mock('primereact/calendar', () => ({
  Calendar: ({ value, onChange }: any) => (
    <input
      data-testid="calendar"
      type="date"
      value={value ? new Date(value).toISOString().split('T')[0] : ''}
      onChange={(e) => onChange({ value: e.target.value ? new Date(e.target.value) : null })}
    />
  ),
}));

vi.mock('primereact/toast', () => ({
  Toast: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('primereact/utils', () => ({
  classNames: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{label}</button>
  ),
}));

vi.mock('../../../shared/DialogAddEditButton', () => ({
  default: ({ label, onClick, disabled, loading }: any) => (
    <button onClick={onClick} disabled={disabled || loading} data-testid={`btn-${label?.toLowerCase().replace(/\s/g, '-')}`}>{label}</button>
  ),
}));

vi.mock('react-icons/fa', () => ({
  FaCheck: () => <span />,
  FaTimes: () => <span />,
}));

import JobProfileRequirementsAddEdit from '../components/jobProfileRequirementsAddEdit';

const mockClients = [
  { clientId: 1, clientName: 'Client A', departments: [{ departmentId: 101, departmentName: 'Dept A' }] },
];

describe('JobProfileAddEdit Component', () => {
  const mockOnHide = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue({ success: true });
  });

  it('renders Add dialog when visible', () => {
    render(
      <JobProfileRequirementsAddEdit
        visible={true}
        onHide={mockOnHide}
        onSave={mockOnSave}
        clients={mockClients}
        jobProfile={null}
        jobProfiles={[]}
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('does not render dialog when visible is false', () => {
    render(
      <JobProfileRequirementsAddEdit
        visible={false}
        onHide={mockOnHide}
        onSave={mockOnSave}
        clients={mockClients}
        jobProfile={null}
        jobProfiles={[]}
      />
    );
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('calls onHide when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <JobProfileRequirementsAddEdit
        visible={true}
        onHide={mockOnHide}
        onSave={mockOnSave}
        clients={mockClients}
        jobProfile={null}
        jobProfiles={[]}
      />
    );
    const cancelBtn = screen.getByTestId('btn-cancel');
    await user.click(cancelBtn);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
