import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
// --- END MOCK PROP TYPES ---
// --- MOCKING DEPENDENCIES ---
// 1. Mock PrimeReact Components
vi.mock('primereact/dropdown', () => ({
    Dropdown: ({ value, options, onChange, placeholder, disabled, className }) => (_jsxs("select", { "data-testid": "dropdown", value: value !== null && value !== undefined ? String(value) : '', 
        // ✅ FIX: Convert string back to number if the original option value was a number
        onChange: (e) => {
            const selectedValue = e.target.value;
            if (!selectedValue) {
                onChange({ value: null });
                return;
            }
            const option = options?.find(opt => String(opt.value) === selectedValue);
            onChange({ value: option?.value ?? null });
        }, disabled: disabled, className: className, "aria-label": placeholder, children: [_jsx("option", { value: "", disabled: true, children: placeholder }), options?.map((opt) => _jsx("option", { value: String(opt.value), children: opt.label }, opt.value))] })),
}));
vi.mock('primereact/dialog', () => ({
    Dialog: vi.fn(({ visible, header, footer, children, onHide, closable = true }) => visible ? (_jsxs("div", { "data-testid": "dialog", "aria-label": header, className: closable ? '' : 'not-closable', children: [_jsx("h2", { "data-testid": "dialog-header", children: header }), _jsx("div", { "data-testid": "dialog-content", children: children }), _jsx("div", { "data-testid": "dialog-footer", children: footer }), _jsx("button", { "data-testid": "mock-hide-button", onClick: onHide, children: "Mock Hide" })] })) : null),
}));
vi.mock('primereact/inputtext', () => ({ InputText: vi.fn(({ value = '', onChange, className, placeholder }) => (_jsx("input", { "data-testid": "inputtext", value: value, onChange: onChange, className: className, placeholder: placeholder }))) }));
vi.mock('primereact/inputtextarea', () => ({ InputTextarea: vi.fn(({ value = '', onChange, rows, maxLength, className, placeholder }) => (_jsx("textarea", { "data-testid": "inputtextarea", value: value, onChange: onChange, rows: rows, maxLength: maxLength, className: className, placeholder: placeholder }))) }));
vi.mock('primereact/inputnumber', () => ({ InputNumber: vi.fn(({ value, onValueChange, min, className }) => (_jsx("input", { "data-testid": "inputnumber", type: "number", value: value !== undefined && value !== null ? value : '', min: min, onChange: (e) => {
            const val = e.target.value;
            onValueChange({ value: val === '' ? null : Number(val) });
        }, className: className }))) }));
vi.mock('primereact/calendar', () => ({ Calendar: vi.fn(({ value, onChange, minDate, className }) => (_jsx("input", { "data-testid": "calendar", type: "date", value: value ? value.toISOString().split('T')[0] : '', onChange: (e) => onChange({ value: e.target.value ? new Date(e.target.value) : null }), min: minDate?.toISOString().split('T')[0], className: className }))) }));
// Mock Toast and its ref
const mockToastShow = vi.fn();
vi.mock('primereact/toast', () => ({
    Toast: React.forwardRef((props, ref) => {
        // Expose a mock `show` method on the ref object
        React.useImperativeHandle(ref, () => ({ show: mockToastShow }));
        return _jsx("div", { "data-testid": "toast-mock" });
    }),
}));
vi.mock('primereact/utils', () => ({ classNames: vi.fn((...args) => args.filter(Boolean).join(' ')) }));
// 2. Mock Custom Components/Utilities
vi.mock('../../../shared/DialogAddEditButton', () => ({
    default: vi.fn(({ label, onClick, severity, loading, disabled }) => (_jsx("button", { "data-testid": "dialog-button", onClick: onClick, disabled: loading || disabled, className: severity, children: label }))),
}));
// Mock the validation service
const mockValidateJobProfileRequest = vi.fn();
vi.mock('../services/jobProfileService', () => ({
    validateJobProfileRequest: mockValidateJobProfileRequest,
}));
// Mock the icon
vi.mock('react-icons/fa', () => ({
    FaCheck: vi.fn(() => _jsx("span", { "data-testid": "fa-check-icon" })),
}));
// --- MOCK DATA ---
const mockClients = [
    { clientId: 1, clientName: 'Client A', departments: [{ departmentId: 101, departmentName: 'Dept A1' }, { departmentId: 102, departmentName: 'Dept A2' }] },
    { clientId: 2, clientName: 'Client B', departments: [{ departmentId: 201, departmentName: 'Dept B1' }] },
];
const mockJobProfile = {
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
    let JobProfileAddEdit;
    beforeAll(async () => {
        // dynamic import after mocks
        const mod = await import('../components/jobProfileAddEdit');
        // default export expected
        JobProfileAddEdit = mod.default ?? mod;
    });
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock for successful service validation
        mockValidateJobProfileRequest.mockReturnValue([]);
        // Ensure onSave is a resolved promise by default
        mockOnSave.mockResolvedValue(undefined);
    });
    // Helper function to render the component with default props
    const renderComponent = (props = {}) => {
        return render(_jsx(JobProfileAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, clients: mockClients, jobProfile: null, ...props }));
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
        expect(screen.getByTestId('inputnumber')).toHaveValue(1); // since minimum is 1 in your frontend
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
        expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Please review the highlighted fields for errors.' }));
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
            expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Failed to save job profile. Please try again.' }));
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
            expect(mockToastShow).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', detail: 'Job Profile updated successfully!' }));
        });
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
});
