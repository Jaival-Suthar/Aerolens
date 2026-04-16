import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'mock-token' }),
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

vi.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{label}</button>
  ),
}));

vi.mock('primereact/message', () => ({
  Message: ({ text }: any) => <div data-testid="message">{text}</div>,
}));

vi.mock('../../../shared/DialogDeleteButton', () => ({
  default: ({ onDelete, onCancel, loading }: any) => (
    <div>
      <button onClick={onDelete} disabled={loading} data-testid="delete-btn">Delete</button>
      <button onClick={onCancel} disabled={loading} data-testid="cancel-btn">Cancel</button>
    </div>
  ),
}));

import JobProfileRequirementsDelete from '../components/jobProfileRequirementsDelete';

const mockJobProfile = {
  jobProfileRequirementId: 1,
  jobProfileId: 10,
  clientId: 1,
  departmentId: 101,
  clientName: 'Client A',
  departmentName: 'Dept A',
  jobRole: 'Developer',
  positions: 2,
  estimatedCloseDate: '2025-12-31',
  location: { city: 'Remote', country: 'US' },
  status: 'In Progress' as const,
  techSpecification: 'React',
  jobProfileDescription: 'Description',
} as any;

const mockClients = [{ clientId: 1, clientName: 'Client A', departments: [{ departmentId: 101, departmentName: 'Dept A' }] }];

describe('JobProfileDelete Component', () => {
  const mockOnHide = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when visible is false', () => {
    render(
      <JobProfileRequirementsDelete
        visible={false}
        onHide={mockOnHide}
        onDelete={mockOnDelete}
        jobProfile={mockJobProfile}
        clients={mockClients}
      />
    );
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with job profile details when visible is true', () => {
    render(
      <JobProfileRequirementsDelete
        visible={true}
        onHide={mockOnHide}
        onDelete={mockOnDelete}
        jobProfile={mockJobProfile}
        clients={mockClients}
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('renders nothing when jobProfile is null', () => {
    const { container } = render(
      <JobProfileRequirementsDelete
        visible={true}
        onHide={mockOnHide}
        onDelete={mockOnDelete}
        jobProfile={null}
        clients={mockClients}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    render(
      <JobProfileRequirementsDelete
        visible={true}
        onHide={mockOnHide}
        onDelete={mockOnDelete}
        jobProfile={mockJobProfile}
        clients={mockClients}
      />
    );
    await user.click(screen.getByTestId('delete-btn'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onHide when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(
      <JobProfileRequirementsDelete
        visible={true}
        onHide={mockOnHide}
        onDelete={mockOnDelete}
        jobProfile={mockJobProfile}
        clients={mockClients}
      />
    );
    await user.click(screen.getByTestId('cancel-btn'));
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
