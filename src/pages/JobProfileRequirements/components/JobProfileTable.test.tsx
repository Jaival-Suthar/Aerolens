import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'mock-token' }),
}));

vi.mock('../services/jobProfileRequirementsService', () => ({
  getJobProfileRequirements: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getJobProfileRequirementsById: vi.fn(),
  createJobProfileRequirements: vi.fn(),
  updateJobProfileRequirements: vi.fn(),
  deleteJobProfileRequirements: vi.fn(),
  fetchJobProfileRequirementsLookupData: vi.fn().mockResolvedValue({ clients: [], jobProfiles: [] }),
}));

vi.mock('primereact/datatable', () => ({
  DataTable: ({ children, value }: any) => (
    <div data-testid="datatable">
      {(value || []).length === 0 ? <div>No records found</div> : null}
      {children}
    </div>
  ),
  Column: () => null,
}));

vi.mock('primereact/toast', () => ({
  Toast: ({ children }: any) => <div data-testid="toast">{children}</div>,
}));

vi.mock('primereact/tag', () => ({
  Tag: ({ value }: any) => <span>{value}</span>,
}));

vi.mock('primereact/dropdown', () => ({
  Dropdown: ({ onChange, value }: any) => <select onChange={onChange} value={value ?? ''}><option value="">All</option></select>,
}));

vi.mock('primereact/button', () => ({
  Button: ({ label, onClick }: any) => <button onClick={onClick}>{label}</button>,
}));

vi.mock('../../../shared/EditButton', () => ({
  default: ({ onClick, disabled }: any) => <button onClick={onClick} disabled={disabled}>Edit</button>,
}));

vi.mock('../../../shared/DeleteButton', () => ({
  default: ({ onClick, disabled }: any) => <button onClick={onClick} disabled={disabled}>Delete</button>,
}));

vi.mock('../../../shared/ColumnSettingsButton', () => ({
  default: () => <button>Columns</button>,
}));

vi.mock('../../../shared/ViewButton', () => ({
  default: ({ onClick }: any) => <button onClick={onClick}>View</button>,
}));

vi.mock('../../../shared/PremiumDetailsDialog', () => ({
  default: () => <div />,
}));

vi.mock('../../../shared/DetailsSection', () => ({
  default: () => <div />,
}));

vi.mock('../../../shared/DetailsGrid', () => ({
  default: () => <div />,
}));

vi.mock('../../../shared/SearchButton', () => ({
  default: ({ onClick }: any) => <button onClick={onClick}>Search</button>,
}));

vi.mock('../components/jobProfileRequirementsAddEdit', () => ({
  default: () => <div data-testid="add-edit-dialog" />,
}));

vi.mock('../components/jobProfileRequirementsDelete', () => ({
  default: () => <div data-testid="delete-dialog" />,
}));

vi.mock('react-icons/fa', () => ({
  FaDownload: () => <span />,
  FaEye: () => <span />,
}));

import JobProfileRequirementsTable from '../components/jobProfileRequirementsTable';

describe('JobProfileTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <MemoryRouter>
        <JobProfileRequirementsTable />
      </MemoryRouter>
    );
    expect(screen.getByTestId('datatable')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons', () => {
    render(
      <MemoryRouter>
        <JobProfileRequirementsTable />
      </MemoryRouter>
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
