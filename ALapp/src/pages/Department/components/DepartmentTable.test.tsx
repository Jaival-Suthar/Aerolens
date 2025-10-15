import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DepartmentTable from '../components/departmentTable';
import { getDepartments } from '../services/useDepartment';
import { Department } from '../types/departmentTypes';

// --- MOCK EXTERNAL COMPONENTS AND SERVICES ---

// Mocking PrimeReact components (critical for fast testing)
vi.mock('primereact/datatable', () => ({
  DataTable: vi.fn(({ value, selection, onSelectionChange, children }) => (
    <div data-testid="datatable">
      {/* Simulate rendering rows for selection testing */}
      {value.map((dept: Department) => (
        <div 
          key={dept.departmentId} 
          data-testid={`row-${dept.departmentId}`} // Use departmentId (now number) in test ID
          className={selection && selection.departmentId === dept.departmentId ? 'selected' : ''}
          onClick={() => onSelectionChange({ value: dept })}
        >
          {dept.departmentName}
        </div>
      ))}
      {children}
    </div>
  )),
  Column: vi.fn(() => null), // Mock Column as it's just configuration
}));

// Mocking the dialogs and shared buttons for isolation
vi.mock('../components/departmentAddEdit', () => ({ default: vi.fn(({ visible, onHide }) => (visible ? <div data-testid="add-edit-dialog" onClick={onHide}>AddEdit</div> : null)) }));
vi.mock('../components/departmentDelete', () => ({ default: vi.fn(({ visible, onHide, onSuccess, onClearSelection }) => (visible ? <div data-testid="delete-dialog" onClick={() => { onHide(); onSuccess(); onClearSelection(); }}>Delete</div> : null)) }));
vi.mock('../../../shared/AddButton', () => ({ default: vi.fn(({ onClick, disabled }) => <button data-testid="add-button" onClick={onClick} disabled={disabled}>Add</button>) }));
vi.mock('../../../shared/EditButton', () => ({ default: vi.fn(({ onClick, disabled }) => <button data-testid="edit-button" onClick={onClick} disabled={disabled}>Edit</button>) }));
vi.mock('../../../shared/DeleteButton', () => ({ default: vi.fn(({ onClick, disabled }) => <button data-testid="delete-button" onClick={onClick} disabled={disabled}>Delete</button>) }));

// Mock the data service
const mockDepartments: Department[] = [
  // UPDATED: departmentId must be a number (as per departmentTypes.ts)
  { departmentId: 1, departmentName: 'Engineering', departmentDescription: 'Build stuff', clientId: 1 },
  { departmentId: 2, departmentName: 'Design', departmentDescription: 'Make it look good', clientId: 1 },
];
vi.mock('../services/useDepartment', () => ({
  getDepartments: vi.fn(),
}));

// --- TEST SETUP ---

const defaultProps = {
  // UPDATED: clientId must be a number (as per departmentTypes.ts)
  clientId: 1,
  clientName: 'SpaceX Mission Ops',
  onBackClick: vi.fn(),
};

describe('DepartmentTable - Mission Critical Logic Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default success mock for data loading
    (getDepartments as any).mockResolvedValue({ departments: mockDepartments });
  });

  // Test Case 1: Initial load and render success (The core mission success path)
  it('must load and display departments on mount if clientId is present', async () => {
    render(<DepartmentTable {...defaultProps} />);

    expect(screen.getByText(`Departments for: ${defaultProps.clientName}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to clients/i })).toBeInTheDocument();
    
    // Verify immediate call to the data layer
    expect(getDepartments).toHaveBeenCalledWith(defaultProps.clientId);

    // Wait for the simulated data table rows to render
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });
    
    // Initial state check: CRUD buttons
    expect(screen.getByTestId('add-button')).toBeEnabled();
    expect(screen.getByTestId('edit-button')).toBeDisabled();
    expect(screen.getByTestId('delete-button')).toBeDisabled();
  });

  // Test Case 2: No-op load when no client is selected (Deletion of unnecessary complexity)
  it('must NOT load data if clientId is undefined (efficiency constraint)', () => {
    // Note: The DepartmentTableProps expects clientId to be a number, but allows it to be passed as undefined 
    // in the scenario where the parent component hasn't fully loaded the client yet.
    // The component's implementation logic handles this by checking `if (clientId)`.
    render(<DepartmentTable clientId={undefined as any} clientName="None" onBackClick={defaultProps.onBackClick} />);
    
    // The Add button must be disabled if no client exists to associate the department with
    expect(screen.getByTestId('add-button')).toBeDisabled();

    // The data fetch must be skipped
    expect(getDepartments).not.toHaveBeenCalled();
  });

  // Test Case 3: Error handling during data load (Reliability check)
  it('must log an error if data loading fails (mission failure pathway)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (getDepartments as any).mockRejectedValue(new Error('Network failure'));

    render(<DepartmentTable {...defaultProps} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading departments:", expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  // Test Case 4: Selection state management (Instant feedback check)
  it('must enable Edit/Delete buttons instantly upon row selection', async () => {
    const user = userEvent.setup();
    render(<DepartmentTable {...defaultProps} />);
    
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());
    
    // UPDATED: Use the number ID for the row test ID
    const rowToSelect = screen.getByTestId('row-1');
    await user.click(rowToSelect);

    // Verify selection state enables buttons
    expect(screen.getByTestId('edit-button')).toBeEnabled();
    expect(screen.getByTestId('delete-button')).toBeEnabled();

    // Verify deselection (by clicking the row again or any other mechanism that would reset selection)
    // Here we'll simulate the dialog clearing the selection
    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton); // Open delete dialog
    
    // The mock delete dialog is programmed to call onSuccess and onClearSelection
    const deleteDialog = screen.getByTestId('delete-dialog');
    await user.click(deleteDialog); // Simulates closing dialog and success flow

    // The buttons must revert to disabled
    await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeDisabled();
        expect(screen.getByTestId('delete-button')).toBeDisabled();
        // The data must be reloaded after success
        expect(getDepartments).toHaveBeenCalledTimes(2);
    });
  });

  // Test Case 5: Add workflow (Zero-latency modal path)
  it('must open the Add dialog and call the hide function correctly', async () => {
    const user = userEvent.setup();
    render(<DepartmentTable {...defaultProps} />);
    
    const addButton = screen.getByTestId('add-button');
    await user.click(addButton);

    // Dialog must be visible
    expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
    
    // Simulate dialog close/hide event
    await user.click(screen.getByTestId('add-edit-dialog')); 
    
    // Dialog must be hidden
    expect(screen.queryByTestId('add-edit-dialog')).toBeNull();

    // Verify data is reloaded after successful add operation simulated by the mock dialog's onSuccess
    const totalCallsAfterSuccessFlow = 2; // Initial load + 1 successful operation
    expect(getDepartments).toHaveBeenCalledTimes(2);
  });

  // Test Case 6: Edit workflow (Data integrity and dialog precision)
  it('must open the Edit dialog with the selected department data', async () => {
    const user = userEvent.setup();
    render(<DepartmentTable {...defaultProps} />);
    
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());

    // Select the first row (Engineering)
    // UPDATED: Use the number ID for the row test ID
    await user.click(screen.getByTestId('row-1'));
    
    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    // Check if the DepartmentAddEdit component received the correct props for editing
    expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
    expect((require('../components/departmentAddEdit').default as any)).toHaveBeenCalledWith(
        expect.objectContaining({
            visible: true,
            selectedDepartment: mockDepartments[0], // Ensure the selected object is passed
            clientId: defaultProps.clientId,
        }),
        {}
    );
  });
  
  // Test Case 7: Delete workflow (Isolation and mandatory success reload)
  it('must open the Delete dialog and trigger data reload on success', async () => {
    const user = userEvent.setup();
    render(<DepartmentTable {...defaultProps} />);

    await waitFor(() => expect(screen.getByText('Design')).toBeInTheDocument());

    // Select the second row (Design)
    // UPDATED: Use the number ID for the row test ID
    await user.click(screen.getByTestId('row-2'));
    
    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);

    // Dialog must be visible
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();

    // Simulate dialog close and success flow
    await user.click(screen.getByTestId('delete-dialog')); 

    // Dialog must be hidden
    expect(screen.queryByTestId('delete-dialog')).toBeNull();

    // Verify data is reloaded (Initial load + 1 success reload)
    expect(getDepartments).toHaveBeenCalledTimes(2);
  });
  
  // Test Case 8: Navigation action (Back button)
  it('must call onBackClick when the "Back to Clients" button is pressed', async () => {
    const user = userEvent.setup();
    render(<DepartmentTable {...defaultProps} />);

    const backButton = screen.getByRole('button', { name: /back to clients/i });
    await user.click(backButton);

    // The handler must execute
    expect(defaultProps.onBackClick).toHaveBeenCalledTimes(1);
  });
});
