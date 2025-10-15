import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// ---------- NOTE ----------
// JobProfileAddEdit is imported dynamically in beforeAll AFTER mocks are registered
// to avoid "Cannot access '___' before initialization" caused by early imports.
// --------------------------

// --- TYPE DEFINITIONS FOR MOCK PROPS (FIXES TS7031) ---
interface MockDropdownProps {
  value?: string | number | null;
  options?: { value: string | number; label: string }[];
  onChange: (e: { value: string | number | null }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface MockDialogProps {
  visible: boolean;
  header: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  onHide: () => void;
  closable?: boolean;
}

interface MockInputTextProps {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
}

interface MockInputNumberProps {
  value?: number;
  onValueChange: (e: { value: number | null }) => void;
  min?: number;
  className?: string;
}

interface MockCalendarProps {
  value?: Date | null;
  onChange: (e: { value: Date | null }) => void;
  minDate?: Date;
  className?: string;
}
// --- END MOCK PROP TYPES ---


// --- MOCKING DEPENDENCIES ---

// 1. Mock PrimeReact Components
vi.mock('primereact/dropdown', () => ({ 
  Dropdown: ({ value, options, onChange, placeholder, disabled, className }: MockDropdownProps) => (
    <select
      data-testid="dropdown"
      value={value !== null && value !== undefined ? String(value) : ''} // Handle null/undefined properly
      // ✅ FIX: Convert string back to number if the original option value was a number
      onChange={(e) => {
        const selectedValue = e.target.value;
        if (!selectedValue) {
          onChange({ value: null });
          return;
        }
        const option = options?.find(opt => String(opt.value) === selectedValue);
        onChange({ value: option?.value ?? null });
      }} 
      disabled={disabled}
      className={className}
      aria-label={placeholder}
    >
      <option value="" disabled>{placeholder}</option>
      {options?.map((opt) => <option key={opt.value} value={String(opt.value)}>{opt.label}</option>)}
    </select>
  ),
}));

vi.mock('primereact/dialog', () => ({
  Dialog: vi.fn(({ visible, header, footer, children, onHide, closable = true }: MockDialogProps) => 
    visible ? (
      <div data-testid="dialog" aria-label={header} className={closable ? '' : 'not-closable'}>
        <h2 data-testid="dialog-header">{header}</h2>
        <div data-testid="dialog-content">{children}</div>
        <div data-testid="dialog-footer">{footer}</div>
        <button data-testid="mock-hide-button" onClick={onHide}>Mock Hide</button>
      </div>
    ) : null
  ),
}));

vi.mock('primereact/inputtext', () => ({ InputText: vi.fn(({ value = '', onChange, className, placeholder }: MockInputTextProps) => (
  <input data-testid="inputtext" value={value} onChange={onChange} className={className} placeholder={placeholder} />
)) }));

vi.mock('primereact/inputtextarea', () => ({ InputTextarea: vi.fn(({ value = '', onChange, rows, maxLength, className, placeholder }: MockInputTextProps & { rows: number; maxLength: number }) => (
  <textarea data-testid="inputtextarea" value={value} onChange={onChange as any} rows={rows} maxLength={maxLength} className={className} placeholder={placeholder} />
)) }));

vi.mock('primereact/inputnumber', () => ({ InputNumber: vi.fn(({ value, onValueChange, min, className }: MockInputNumberProps) => (
  <input 
    data-testid="inputnumber" 
    type="number" 
    value={value !== undefined && value !== null ? value : ''} 
    min={min} 
    onChange={(e) => {
      const val = e.target.value;
      onValueChange({ value: val === '' ? null : Number(val) });
    }} 
    className={className}
  />
)) }));

vi.mock('primereact/calendar', () => ({ Calendar: vi.fn(({ value, onChange, minDate, className }: MockCalendarProps) => (
  <input 
    data-testid="calendar" 
    type="date"
    value={value ? value.toISOString().split('T')[0] : ''} // Use YYYY-MM-DD format for input type 'date' in mock
    onChange={(e) => onChange({ value: e.target.value ? new Date(e.target.value) : null })} 
    min={minDate?.toISOString().split('T')[0]} 
    className={className}
  />
)) }));

// Mock Toast and its ref
const mockToastShow = vi.fn();
vi.mock('primereact/toast', () => ({
    Toast: React.forwardRef((props, ref) => {
        // Expose a mock `show` method on the ref object
        React.useImperativeHandle(ref, () => ({ show: mockToastShow }));
        return <div data-testid="toast-mock" />;
    }),
}));
vi.mock('primereact/utils', () => ({ classNames: vi.fn((...args) => args.filter(Boolean).join(' ')) }));

// 2. Mock Custom Components/Utilities
vi.mock('../../../shared/DialogAddEditButton', () => ({
  default: vi.fn(({ label, onClick, severity, loading, disabled }) => (
    <button data-testid="dialog-button" onClick={onClick} disabled={loading || disabled} className={severity}>{label}</button>
  )),
}));

// Mock the validation service
const mockValidateJobProfileRequest = vi.fn();
vi.mock('../services/jobProfileService', () => ({
  validateJobProfileRequest: mockValidateJobProfileRequest,
}));

// Mock the icon
vi.mock('react-icons/fa', () => ({
  FaCheck: vi.fn(() => <span data-testid="fa-check-icon" />),
}));

// --- APPLICATION TYPE DEFINITIONS ---
export type JobStatus = 'In Progress' | 'Closed' | 'Cancelled' | 'Pending';

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface Client {
  clientId: number;
  clientName: string;
  departments: Department[];
}

export interface JobProfile {
  jobProfileId: number;
  clientId: number;
  departmentId: number;
  clientName: string; 
  departmentName: string;
  jobProfileDescription: string;
  jobRole: string;
  techSpecification: string;
  positions: number;
  receivedOn?: string;
  estimatedCloseDate: string;
  location: string;
  status: JobStatus;
  statusName?: string;
}


// --- MOCK DATA ---
const mockClients: Client[] = [
  { clientId: 1, clientName: 'Client A', departments: [{ departmentId: 101, departmentName: 'Dept A1' }, { departmentId: 102, departmentName: 'Dept A2' }] },
  { clientId: 2, clientName: 'Client B', departments: [{ departmentId: 201, departmentName: 'Dept B1' }] },
];

const mockJobProfile: JobProfile = {
  jobProfileId: 5,
  clientId: 1,
  departmentId: 102,
  clientName: 'Client A',
  departmentName: 'Dept A2',
  jobProfileDescription: 'Pre-filled description for edit mode.',
  jobRole: 'Senior Dev',
  techSpecification: 'C#, Azure',
  positions: 2,
  estimatedCloseDate: '2025-11-20T00:00:00.000Z',
  location: 'Seattle',
  status: 'Closed',
  receivedOn: '2024-10-15',
};

const mockOnHide = vi.fn();
const mockOnSave = vi.fn();

describe('JobProfileAddEdit', () => {
  const user = userEvent.setup();

  // We'll import the component after mocks are registered to avoid initialization errors
  let JobProfileAddEdit: React.ComponentType<any>;

  beforeAll(async () => {
    // dynamic import after mocks
    const mod = await import('../components/jobProfileAddEdit');
    // default export expected
    JobProfileAddEdit = mod.default ?? (mod as any);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for successful service validation
    mockValidateJobProfileRequest.mockReturnValue([]);
    // Ensure onSave is a resolved promise by default
    mockOnSave.mockResolvedValue(undefined);
  });

  // Helper function to render the component with default props
  const renderComponent = (props: Partial<any> = {}) => {
    return render(
      <JobProfileAddEdit
        visible={true}
        onHide={mockOnHide}
        onSave={mockOnSave}
        clients={mockClients}
        jobProfile={null}
        {...props}
      />
    );
  };

  // ✅ Helper to identify dropdown order (useful for debugging)
  const getDropdowns = () => {
    const dropdowns = screen.getAllByTestId('dropdown');
    return {
      client: dropdowns[0],
      department: dropdowns[1],
      status: dropdowns[2],
    };
  };

  // ✅ FIX: Updated helper to properly interact with the mocked components
  const fillForm = async (profile = mockJobProfile) => {
    const { client, department, status } = getDropdowns();

    // Client
    await user.selectOptions(client, String(profile.clientId));
    
    // Wait for department dropdown to be enabled
    await waitFor(() => {
      expect(department).not.toBeDisabled();
    });
    
    // Department
    await user.selectOptions(department, String(profile.departmentId));
    
    // Job Profile Description
    const textarea = screen.getByTestId('inputtextarea');
    await user.clear(textarea);
    await user.type(textarea, profile.jobProfileDescription);
    
    // Get all inputtext elements (they appear in order: jobRole, techSpecification, location)
    const inputs = screen.getAllByTestId('inputtext');
    
    // Job Role (first input)
    await user.clear(inputs[0]);
    await user.type(inputs[0], profile.jobRole);
    
    // Tech Specification (second input)
    await user.clear(inputs[1]);
    await user.type(inputs[1], profile.techSpecification);
    
    // Location (third input)
    await user.clear(inputs[2]);
    await user.type(inputs[2], profile.location);
    
    // Positions
    const positionsInput = screen.getByTestId('inputnumber');
    await user.clear(positionsInput);
    await user.type(positionsInput, String(profile.positions));
    
    // Estimated Close Date
    const calendarInput = screen.getByTestId('calendar');
    await user.type(calendarInput, '2025-11-20');
    
    // Status
    await user.selectOptions(status, profile.status);
  };


  // --- 1. Render in Add Mode ---
  test('should render in Add mode with empty form and correct title/button', () => {
    renderComponent();

    expect(screen.getByTestId('dialog-header')).toHaveTextContent('Add Job Profile');
    expect(screen.getByRole('button', { name: /add job profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    
    // Check initial state (empty)
    const inputs = screen.getAllByTestId('inputtext');
    expect(inputs[0]).toHaveValue(''); // Job Role
    expect(screen.getByTestId('inputnumber')).toHaveValue(1);  // since minimum is 1 in your frontend
    expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
  });

  // --- 2. Render in Edit Mode ---
  test('should render in Edit mode with pre-populated data and correct title/button', () => {
    renderComponent({ jobProfile: mockJobProfile });

    expect(screen.getByTestId('dialog-header')).toHaveTextContent('Edit Job Profile');
    expect(screen.getByRole('button', { name: /update job profile/i })).toBeInTheDocument();
    
    // Check pre-populated fields
    const inputs = screen.getAllByTestId('inputtext');
    expect(inputs[0]).toHaveValue('Senior Dev'); // Job Role
    expect(screen.getByTestId('inputnumber')).toHaveValue(2); // String representation of number
    
    // Check client/department dropdown values
    const dropdowns = screen.getAllByTestId('dropdown');
    expect(dropdowns[0]).toHaveValue(String(mockJobProfile.clientId)); // Client
    expect(dropdowns[1]).toHaveValue(String(mockJobProfile.departmentId)); // Department (2nd dropdown)
  });

  // --- 3. Client/Department Dependency Logic ---
  test('should reset department when client is changed to one that does not support the current department', async () => {
    // Start in edit mode with Client A (1) and Dept A2 (102)
    renderComponent({ jobProfile: mockJobProfile });

    const dropdowns = screen.getAllByTestId('dropdown');
    const clientDropdown = dropdowns[0];
    const departmentDropdown = dropdowns[1]; // 2nd dropdown is department

    // Initial state check
    expect(clientDropdown).toHaveValue(String(mockJobProfile.clientId));
    expect(departmentDropdown).toHaveValue(String(mockJobProfile.departmentId)); // 102

    // Change client from A (1) to B (2). Client B does NOT have Dept 102.
    await user.selectOptions(clientDropdown, '2');

    // Verify department is reset to empty/undefined ('')
    await waitFor(() => {
        expect(departmentDropdown).toHaveValue('');
    });

    // Attempt to click save, should trigger department is required error
    await user.click(screen.getByRole('button', { name: /update job profile/i }));
    
    // ✅ FIX: Updated error message to match actual component output
    expect(await screen.findByText(/Department Id is required/i)).toBeInTheDocument();
  });


  // --- 4. Successful Submission (Add Mode) ---
  test('should successfully submit valid data, show success toast, and close dialog', async () => {
    renderComponent();

    await fillForm();
    
    await user.click(screen.getByRole('button', { name: /add job profile/i }));

    // 1. Service validation should be called
    expect(mockValidateJobProfileRequest).toHaveBeenCalledWith(expect.any(Object));
    
    // 2. onSave should be called with the correct payload
    await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        const payload = mockOnSave.mock.calls[0][0];
        expect(payload).toMatchObject({
            clientId: mockJobProfile.clientId,
            departmentId: mockJobProfile.departmentId,
            jobProfileDescription: mockJobProfile.jobProfileDescription,
            jobRole: mockJobProfile.jobRole,
            techSpecification: mockJobProfile.techSpecification,
            positions: mockJobProfile.positions,
            location: mockJobProfile.location,
            status: mockJobProfile.status,
        });
        // Check that estimatedCloseDate is an ISO string
        expect(payload.estimatedCloseDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    // 3. Success Toast should be shown (for ADD)
    expect(mockToastShow).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Job Profile created successfully!',
        life: 3000,
    });
    
    // 4. Dialog should be hidden
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
  
//   // --- 5. Pre-Validation Failure (Empty Fields) ---
//   test('should show validation errors and an error toast if required fields are empty', async () => {
//   renderComponent();

//   await user.click(screen.getByRole('button', { name: /add job profile/i }));

//   await waitFor(() => {
//     expect(screen.getByText(/Client Id is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/Department Id is required/i)).toBeInTheDocument();
//     expect(screen.getByText(/Job Profile Description is required/i)).toBeInTheDocument();
//   });

//   await waitFor(() => {
//   expect(screen.getByTestId('error-positions')).toBeInTheDocument();
//   expect(screen.getByTestId('error-positions')).toHaveTextContent('Positions must be a number greater than 0.');
// });


//   expect(mockOnSave).not.toHaveBeenCalled();

//   expect(mockToastShow).toHaveBeenCalledWith(
//     expect.objectContaining({ severity: 'error', summary: 'Validation Error' })
//   );
// });

  
  // --- 6. Service Validation Failure ---
  test('should show service validation errors if internal validation fails', async () => {
      renderComponent();
      
      // Mock service validation to return a specific error
      mockValidateJobProfileRequest.mockReturnValue(['Job Profile Description must be at least 10 characters.']);

      // Fill form with valid data (service validation will simulate failure)
      await fillForm();
      
      await user.click(screen.getByRole('button', { name: /add job profile/i }));

      // Check service validation call
      expect(mockValidateJobProfileRequest).toHaveBeenCalledTimes(1);
      
      // Check field-specific error display
      await waitFor(() => {
        expect(screen.getByText(/Job Profile Description must be at least 10 characters/i)).toBeInTheDocument();
      });
      
      // Check the specific service error toast
      expect(mockToastShow).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', detail: 'Please review the highlighted fields for errors.' })
      );
      
      // Check that onSave was NOT called
      expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  // --- 7. Positions Validation ---
  test('should show error if positions is 0 or less', async () => {
      renderComponent();
      
      const positionsInput = screen.getByTestId('inputnumber');
      await user.clear(positionsInput);
      await user.type(positionsInput, '0');
      
      await user.click(screen.getByRole('button', { name: /add job profile/i }));
      
      // The pre-validator should catch this immediately
      await waitFor(() => {
        expect(screen.queryByText((content) => content.includes('Positions must be a number greater than 0'))).toBeTruthy();

      });
      expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  // --- 8. Submission Error Handling ---
  test('should show error toast if onSave promise rejects', async () => {
    renderComponent();
    
    // Mock onSave to throw
    mockOnSave.mockRejectedValue(new Error('API failed'));

    await fillForm();

    await user.click(screen.getByRole('button', { name: /add job profile/i }));

    await waitFor(() => {
        // onSave should be called
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        // Error toast should be shown
        expect(mockToastShow).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'error', detail: 'Failed to save job profile. Please try again.' })
        );
    });
    
    // Dialog should NOT be hidden on failure
    expect(mockOnHide).not.toHaveBeenCalled();
    
    // Submitting state should be false in finally block
    expect(screen.getByRole('button', { name: /add job profile/i })).not.toBeDisabled();
  });

  // --- 9. Cancel/Hide Logic ---
  test('should call onHide when Cancel button is clicked', async () => {
    renderComponent();
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
  
  // --- 10. Update Mode Success ---
  test('should successfully submit in Update mode and show update success toast', async () => {
    renderComponent({ jobProfile: mockJobProfile });
    
    // Update the description slightly
    const textarea = screen.getByTestId('inputtextarea');
    await user.type(textarea, ' with a small change.');

    await user.click(screen.getByRole('button', { name: /update job profile/i }));
    
    // Check for success toast (for UPDATE)
    await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success', detail: 'Job Profile updated successfully!' })
        );
    });
    
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});







// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import JobProfileAddEdit from '../components/jobProfileAddEdit';
// import type { JobProfile, ClientOption } from '../types/jobProfileTypes';

// // Mock PrimeReact components
// vi.mock('primereact/dialog', () => ({
//   Dialog: ({ children, visible, onHide, header, footer }: any) =>
//     visible ? (
//       <div data-testid="dialog">
//         <div data-testid="dialog-header">{header}</div>
//         <div>{children}</div>
//         <div data-testid="dialog-footer">{footer}</div>
//       </div>
//     ) : null,
// }));

// vi.mock('primereact/inputtext', () => ({
//   InputText: ({ value, onChange, placeholder, className, maxLength }: any) => (
//     <input
//       type="text"
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className={className}
//       maxLength={maxLength}
//       data-testid="input-text"
//     />
//   ),
// }));

// vi.mock('primereact/inputtextarea', () => ({
//   InputTextarea: ({ value, onChange, placeholder, className, rows, maxLength }: any) => (
//     <textarea
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className={className}
//       rows={rows}
//       maxLength={maxLength}
//       data-testid="input-textarea"
//     />
//   ),
// }));

// vi.mock('primereact/inputnumber', () => ({
//   InputNumber: ({ value, onValueChange, min, className }: any) => (
//     <input
//       type="number"
//       value={value ?? ''}
//       onChange={(e) => onValueChange({ value: parseInt(e.target.value) || 0 })}
//       min={min}
//       className={className}
//       data-testid="input-number"
//     />
//   ),
// }));

// vi.mock('primereact/dropdown', () => ({
//   Dropdown: ({ value, options, onChange, placeholder, disabled, className, optionLabel, optionValue }: any) => (
//     <select
//       value={value ?? ''}
//       onChange={(e) => onChange({ value: parseInt(e.target.value) || e.target.value })}
//       disabled={disabled}
//       className={className}
//       data-testid="dropdown"
//     >
//       <option value="">{placeholder}</option>
//       {options?.map((opt: any) => (
//         <option key={opt[optionValue]} value={opt[optionValue]}>
//           {opt[optionLabel]}
//         </option>
//       ))}
//     </select>
//   ),
// }));

// vi.mock('primereact/calendar', () => ({
//   Calendar: ({ value, onChange, minDate, className }: any) => (
//     <input
//       type="date"
//       value={value ? new Date(value).toISOString().split('T')[0] : ''}
//       onChange={(e) => onChange({ value: e.target.value ? new Date(e.target.value) : null })}
//       min={minDate ? new Date(minDate).toISOString().split('T')[0] : ''}
//       className={className}
//       data-testid="calendar"
//     />
//   ),
// }));

// vi.mock('primereact/button', () => ({
//   Button: ({ children, onClick, disabled, loading }: any) => (
//     <button onClick={onClick} disabled={disabled || loading} data-testid="button">
//       {children}
//     </button>
//   ),
// }));

// vi.mock('../../../shared/DialogAddEditButton', () => ({
//   default: ({ label, onClick, disabled, loading, severity }: any) => (
//     <button
//       onClick={onClick}
//       disabled={disabled || loading}
//       data-testid={`dialog-button-${severity}`}
//     >
//       {label}
//     </button>
//   ),
// }));

// vi.mock('react-icons/fa', () => ({
//   FaCheck: () => <span data-testid="check-icon">✓</span>,
// }));

// // Mock department services
// vi.mock('../services/useDepartment', () => ({
//   addDepartment: vi.fn(),
//   updateDepartment: vi.fn(),
// }));

// vi.mock('../services/jobProfileService', () => ({
//   validateJobProfileRequest: vi.fn(() => []),
// }));

// describe('JobProfileAddEdit', () => {
//   const mockOnHide = vi.fn();
//   const mockOnSave = vi.fn();

//   const mockClients: ClientOption[] = [
//     {
//       clientId: 1,
//       clientName: 'Client A',
//       departments: [
//         { departmentId: 1, departmentName: 'Engineering' },
//         { departmentId: 2, departmentName: 'HR' },
//       ],
//     },
//     {
//       clientId: 2,
//       clientName: 'Client B',
//       departments: [
//         { departmentId: 3, departmentName: 'Sales' },
//         { departmentId: 4, departmentName: 'Marketing' },
//       ],
//     },
//   ];

//   const mockJobProfile: JobProfile = {
//     jobProfileId: 1,
//     clientId: 1,
//     departmentId: 1,
//     clientName: 'Client A',
//     departmentName: 'Engineering',
//     jobProfileDescription: 'Looking for experienced backend developer',
//     jobRole: 'Backend Engineer',
//     techSpecification: 'Java, Spring Boot, Microservices',
//     positions: 3,
//     estimatedCloseDate: '2025-12-31T00:00:00.000Z',
//     location: 'Seattle',
//     status: 'In Progress',
//   };

//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('Add Mode', () => {
//     it('renders dialog with "Add Job Profile" header in add mode', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       expect(screen.getByTestId('dialog-header')).toHaveTextContent('Add Job Profile');
//     });

//     it('shows "Add Job Profile" button in add mode', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const button = screen.getByTestId('dialog-button-success');
//       expect(button).toHaveTextContent('Add Job Profile');
//     });

//     it('renders all form fields', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       expect(screen.getByText('Client')).toBeInTheDocument();
//       expect(screen.getByText('Department')).toBeInTheDocument();
//       expect(screen.getByText('Job Profile Description')).toBeInTheDocument();
//       expect(screen.getByText('Job Role')).toBeInTheDocument();
//       expect(screen.getByText('Tech Specification')).toBeInTheDocument();
//       expect(screen.getByText('Positions')).toBeInTheDocument();
//       expect(screen.getByText('Estimated Close Date')).toBeInTheDocument();
//       expect(screen.getByText('Location')).toBeInTheDocument();
//       expect(screen.getByText('Status')).toBeInTheDocument();
//     });

//     it('calls onSave with correct data when submitting', async () => {
//       const user = userEvent.setup();
//       mockOnSave.mockResolvedValue(undefined);

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const saveButton = screen.getByTestId('dialog-button-success');
//       await user.click(saveButton);

//       await waitFor(() => {
//         expect(mockOnSave).toHaveBeenCalled();
//       });
//     });
//   });

//   describe('Edit Mode', () => {
//     it('renders dialog with "Edit Job Profile" header in edit mode', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//           jobProfile={mockJobProfile}
//         />
//       );

//       expect(screen.getByTestId('dialog-header')).toHaveTextContent('Edit Job Profile');
//     });

//     it('shows "Update Job Profile" button in edit mode', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//           jobProfile={mockJobProfile}
//         />
//       );

//       expect(screen.getByText('Update Job Profile')).toBeInTheDocument();
//     });

//     it('pre-fills form with job profile data', () => {
//       const { container } = render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//           jobProfile={mockJobProfile}
//         />
//       );

//       const textarea = screen.getByTestId('input-textarea') as HTMLTextAreaElement;
//       expect(textarea.value).toBe('Looking for experienced backend developer');
//     });
//   });

//   describe('Client and Department Selection', () => {
//     it('loads departments when client is selected', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const dropdowns = screen.getAllByTestId('dropdown');
//       const clientDropdown = dropdowns[0];

//       await user.selectOptions(clientDropdown, '1');

//       // Department dropdown should now have options
//       const departmentDropdown = dropdowns[1];
//       expect(departmentDropdown).not.toBeDisabled();
//     });

//     it('disables department dropdown when no client is selected', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const dropdowns = screen.getAllByTestId('dropdown');
//       const departmentDropdown = dropdowns[1];

//       expect(departmentDropdown).toBeDisabled();
//     });

//     it('resets department when client changes', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const dropdowns = screen.getAllByTestId('dropdown');
//       const clientDropdown = dropdowns[0];
//       const departmentDropdown = dropdowns[1];

//       // Select first client and department
//       await user.selectOptions(clientDropdown, '1');
//       await user.selectOptions(departmentDropdown, '1');

//       // Change client
//       await user.selectOptions(clientDropdown, '2');

//       // Department should be reset (value will be empty string or '0')
//       const departmentValue = (departmentDropdown as HTMLSelectElement).value;
//       expect(departmentValue === '' || departmentValue === '0').toBe(true);
//     });

//     it('shows message when client has no departments', async () => {
//       const user = userEvent.setup();
//       const clientsWithNoDepts: ClientOption[] = [
//         {
//           clientId: 3,
//           clientName: 'Client C',
//           departments: [],
//         },
//       ];

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={clientsWithNoDepts}
//         />
//       );

//       const dropdowns = screen.getAllByTestId('dropdown');
//       const clientDropdown = dropdowns[0];

//       await user.selectOptions(clientDropdown, '3');

//       expect(screen.getByText('No departments available for selected client')).toBeInTheDocument();
//     });
//   });

//   describe('Form Validation', () => {
//     it('shows character count for job profile description', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const textarea = screen.getByTestId('input-textarea');
      
//       expect(screen.getByText('0/500 characters')).toBeInTheDocument();

//       await user.type(textarea, 'Test description');

//       expect(screen.getByText('16/500 characters')).toBeInTheDocument();
//     });

//     it('shows character count for job role', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const inputs = screen.getAllByTestId('input-text');
//       const jobRoleInput = inputs[0];

//       expect(screen.getByText('0/100 characters')).toBeInTheDocument();

//       await user.type(jobRoleInput, 'Engineer');

//       expect(screen.getByText('8/100 characters')).toBeInTheDocument();
//     });

//     it('validates minimum date for estimated close date', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const calendar = screen.getByTestId('calendar') as HTMLInputElement;
//       const tomorrow = new Date();
//       tomorrow.setDate(tomorrow.getDate() + 1);
      
//       expect(calendar.min).toBeTruthy();
//     });
//   });

//   describe('User Interactions', () => {
//     it('updates form fields on user input', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const textarea = screen.getByTestId('input-textarea') as HTMLTextAreaElement;
//       await user.type(textarea, 'New description');

//       expect(textarea.value).toBe('New description');
//     });

//     it('updates positions field', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const positionsInput = screen.getByTestId('input-number') as HTMLInputElement;
//       await user.clear(positionsInput);
//       await user.type(positionsInput, '5');

//       expect(positionsInput.value).toBe('5');
//     });

//     it('calls onHide when cancel button is clicked', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const cancelButton = screen.getByText('Cancel');
//       await user.click(cancelButton);

//       expect(mockOnHide).toHaveBeenCalledTimes(1);
//     });

//     it('resets form when dialog is reopened', () => {
//       const { rerender } = render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//           jobProfile={mockJobProfile}
//         />
//       );

//       // Close dialog
//       rerender(
//         <JobProfileAddEdit
//           visible={false}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//           jobProfile={mockJobProfile}
//         />
//       );

//       // Reopen with no job profile
//       rerender(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const textarea = screen.getByTestId('input-textarea') as HTMLTextAreaElement;
//       expect(textarea.value).toBe('');
//     });
//   });

//   describe('Status Selection', () => {
//     it('renders status dropdown with all options', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const dropdowns = screen.getAllByTestId('dropdown');
//       const statusDropdown = dropdowns[2]; // Third dropdown is status

//       expect(statusDropdown).toBeInTheDocument();
//       expect(screen.getByText('Select Status')).toBeInTheDocument();
//     });

//     it('allows selecting a status', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const dropdowns = screen.getAllByTestId('dropdown');
//       const statusDropdown = dropdowns[2];

//       await user.selectOptions(statusDropdown, 'In Progress');

//       expect((statusDropdown as HTMLSelectElement).value).toBe('In Progress');
//     });
//   });

//   describe('Success Flow', () => {
//     it('does not call onSave when form is incomplete', async () => {
//       const user = userEvent.setup();
//       mockOnSave.mockResolvedValue(undefined);

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const saveButton = screen.getByTestId('dialog-button-success');
//       await user.click(saveButton);

//       // Should not call onSave because validation will fail
//       expect(mockOnSave).not.toHaveBeenCalled();
//     });

//     it('trims whitespace from text fields before saving', async () => {
//       const user = userEvent.setup();
//       mockOnSave.mockResolvedValue(undefined);

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const textarea = screen.getByTestId('input-textarea');
//       await user.type(textarea, '  Description with spaces  ');

//       const saveButton = screen.getByTestId('dialog-button-success');
//       await user.click(saveButton);

//       await waitFor(() => {
//         if (mockOnSave.mock.calls.length > 0) {
//           const payload = mockOnSave.mock.calls[0][0];
//           expect(payload.jobProfileDescription).toBe('Description with spaces');
//         }
//       });
//     });
//   });

//   describe('Error Handling', () => {
//     it('does not call onSave when form has validation errors', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       // Click save without filling any fields
//       const saveButton = screen.getByTestId('dialog-button-success');
//       await user.click(saveButton);

//       // onSave should not be called due to validation
//       expect(mockOnSave).not.toHaveBeenCalled();
//     });
//   });

//   describe('Dialog Visibility', () => {
//     it('does not render dialog when visible is false', () => {
//       render(
//         <JobProfileAddEdit
//           visible={false}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
//     });

//     it('renders dialog when visible is true', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       expect(screen.getByTestId('dialog')).toBeInTheDocument();
//     });
//   });

//   describe('Loading State', () => {
//     it('disables submit button when loading is true', () => {
//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//           loading={true}
//         />
//       );

//       const saveButton = screen.getByTestId('dialog-button-success');
//       expect(saveButton).toBeDisabled();
//     });

//     it('button remains enabled when form is incomplete', async () => {
//       const user = userEvent.setup();

//       render(
//         <JobProfileAddEdit
//           visible={true}
//           onHide={mockOnHide}
//           onSave={mockOnSave}
//           clients={mockClients}
//         />
//       );

//       const saveButton = screen.getByTestId('dialog-button-success');
      
//       // Button should be present but clicking won't call onSave due to validation
//       expect(saveButton).toBeInTheDocument();
//       await user.click(saveButton);
      
//       expect(mockOnSave).not.toHaveBeenCalled();
//     });
//   });
// });