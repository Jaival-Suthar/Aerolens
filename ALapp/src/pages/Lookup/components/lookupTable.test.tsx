// LookupTable.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PaginationMeta, LookupEntry } from '../types/lookupTypes';
import LookupTable from './lookupTable';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AddButton from '../../../shared/AddButton';
import { AddLookupForm } from './AddLookupForm';

// Mock PrimeReact components
vi.mock('primereact/datatable', () => ({
  DataTable: vi.fn(({ children, value, emptyMessage, ...props }) => (
    <div data-testid="data-table" {...props}>
      {value?.length === 0 && <div data-testid="empty-message">{emptyMessage}</div>}
      {children}
      <div data-testid="paginator">Paginator</div>
    </div>
  )),
  Column: vi.fn(() => null),
}));

// Mock shared components
vi.mock('../../../shared/AddButton', () => ({
  default: vi.fn(({ onClick }) => (
    <button data-testid="add-button" onClick={onClick}>
      Add
    </button>
  )),
}));

// Mock AddLookupForm
vi.mock('./AddLookupForm', () => ({
  AddLookupForm: vi.fn(({ visible, onHide, onSuccess }) => (
    <div data-testid="add-dialog" style={{ display: visible ? 'block' : 'none' }}>
      <button
        data-testid="add-dialog-submit"
        onClick={() => {
          onSuccess();
          onHide(); // Call onHide after onSuccess to close dialog
        }}
      >
        Submit
      </button>
      <button data-testid="add-dialog-cancel" onClick={onHide}>
        Cancel
      </button>
    </div>
  )),
}));

// Sample data
const mockData: LookupEntry[] = [
  { lookupKey: 1, tag: 'tag1', value: 'value1' }, // Fixed lookupKey to string
  { lookupKey: 2, tag: 'tag2', value: 'value2' },
];

const mockMeta: PaginationMeta = {
  currentPage: 1,
  totalPages: 2,
  totalRecords: 20,
  limit: 10,
  hasNextPage: true,
  hasPrevPage: false,
  nextPage: 2,
  prevPage: null,
};

describe('LookupTable', () => {
  const onPageChange = vi.fn();
  const onSelectionChange = vi.fn();
  const onDataChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with data and meta correctly', () => {
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByText('Lookup Data')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('paginator')).toBeInTheDocument();
    expect(DataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        value: mockData,
        paginator: true,
        first: 0,
        rows: 10,
        totalRecords: 20,
        lazy: true,
        className: 'p-datatable-sm',
        selectionMode: 'single',
        dataKey: 'lookupKey',
        emptyMessage: 'No lookup entries found',
      }),
      expect.anything()
    );
  });

  it('renders empty message when no data', () => {
    render(
      <LookupTable
        data={[]}
        meta={null}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    expect(screen.getByText('No lookup entries found')).toBeInTheDocument();
    expect(DataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        value: [],
        emptyMessage: 'No lookup entries found',
      }),
      expect.anything()
    );
  });

  it('shows loading state when loading is true', () => {
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        loading={true}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    expect(DataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        loading: true,
      }),
      expect.anything()
    );
  });

  it('handles pagination change correctly', async () => {
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    const dataTableProps = (DataTable as any).mock.calls[0][0];
    const onPageHandler = dataTableProps.onPage;

    // Simulate page change to page 2 with 10 rows
    await waitFor(() => {
      onPageHandler({ first: 10, rows: 10 });
    });

    expect(onPageChange).toHaveBeenCalledWith(2, 10);
  });

  it('handles row selection correctly', async () => {
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    const dataTableProps = (DataTable as any).mock.calls[0][0];
    const onSelectionChangeHandler = dataTableProps.onSelectionChange;

    // Simulate selecting a row
    await waitFor(() => {
      onSelectionChangeHandler({ value: mockData[0] });
    });

    expect(onSelectionChange).toHaveBeenCalledWith(mockData[0]);
  });

  it('handles null selection correctly', async () => {
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    const dataTableProps = (DataTable as any).mock.calls[0][0];
    const onSelectionChangeHandler = dataTableProps.onSelectionChange;

    // Simulate null selection
    await waitFor(() => {
      onSelectionChangeHandler({ value: null });
    });

    expect(onSelectionChange).toHaveBeenCalledWith(null);
  });

  it('opens and closes add dialog correctly', async () => {
    const user = userEvent.setup();
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    // Open add dialog
    await user.click(screen.getByTestId('add-button'));
    expect(screen.getByTestId('add-dialog')).toBeInTheDocument();

    // Cancel dialog
    await user.click(screen.getByTestId('add-dialog-cancel'));
    expect(screen.getByTestId('add-dialog')).toHaveStyle({ display: 'none' });
  });

  it('handles add dialog submission correctly', async () => {
    const user = userEvent.setup();
    render(
      <LookupTable
        data={mockData}
        meta={mockMeta}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    // Open add dialog
    await user.click(screen.getByTestId('add-button'));
    expect(screen.getByTestId('add-dialog')).toBeInTheDocument();

    // Submit dialog
    await user.click(screen.getByTestId('add-dialog-submit'));
    expect(onDataChange).toHaveBeenCalled();
    expect(screen.getByTestId('add-dialog')).toHaveStyle({ display: 'none' });
  });

  it('handles missing meta gracefully', () => {
    render(
      <LookupTable
        data={mockData}
        meta={null}
        onPageChange={onPageChange}
        onSelectionChange={onSelectionChange}
        onDataChange={onDataChange}
      />
    );

    expect(DataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 0,
        rows: 10,
        totalRecords: 0,
      }),
      expect.anything()
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
});