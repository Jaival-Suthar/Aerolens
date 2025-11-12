import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepartmentAddEdit from '../components/departmentAddEdit';
import * as useDepartment from '../services/useDepartment';
vi.mock('../../../shared/auth/AuthContext', () => ({
    useAuth: () => ({
        accessToken: 'mock-token-123'
    })
}));
// Mock PrimeReact components
vi.mock('primereact/dialog', () => ({
    Dialog: ({ children, visible, onHide, header, footer }) => (visible ? (_jsxs("div", { "data-testid": "dialog", children: [_jsx("div", { "data-testid": "dialog-header", children: header }), _jsx("div", { children: children }), _jsx("div", { "data-testid": "dialog-footer", children: footer })] })) : null),
}));
vi.mock('primereact/inputtextarea', () => ({
    InputTextarea: ({ id, value, onChange, placeholder, className }) => (_jsx("textarea", { id: id, value: value, onChange: onChange, placeholder: placeholder, className: className, "data-testid": id })),
}));
// Mock DialogButton
vi.mock('../../../shared/DialogAddEditButton', () => ({
    default: ({ label, onClick, disabled, severity }) => (_jsx("button", { onClick: onClick, disabled: disabled, "data-testid": `dialog-button-${severity}`, children: label })),
}));
// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaCheck: () => _jsx("span", { "data-testid": "check-icon", children: "\u2713" }),
}));
// Mock department services
vi.mock('../services/useDepartment', () => ({
    addDepartment: vi.fn(),
    updateDepartment: vi.fn(),
}));
describe('DepartmentAddEdit', () => {
    const mockOnHide = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockClientId = 1;
    const mockDepartment = {
        departmentId: 1,
        clientId: 1,
        departmentName: 'Engineering',
        departmentDescription: 'Engineering Department',
    };
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('Add Mode', () => {
        it('renders dialog with "Add New Department" header in add mode', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            expect(screen.getByTestId('dialog-header')).toHaveTextContent('Add New Department');
        });
        it('renders empty input fields in add mode', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            expect(nameInput.value).toBe('');
            expect(descInput.value).toBe('');
        });
        it('shows "Add Department" button in add mode', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            expect(screen.getByText('Add Department')).toBeInTheDocument();
        });
        it('calls addDepartment service when saving new department', async () => {
            const user = userEvent.setup();
            vi.mocked(useDepartment.addDepartment).mockResolvedValue(undefined);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            const saveButton = screen.getByText('Add Department');
            await user.type(nameInput, 'HR');
            await user.type(descInput, 'Human Resources');
            await user.click(saveButton);
            await waitFor(() => {
                expect(useDepartment.addDepartment).toHaveBeenCalledWith('mock-token-123', {
                    clientId: mockClientId,
                    departmentName: 'HR',
                    departmentDescription: 'Human Resources',
                });
            });
        });
    });
    describe('Edit Mode', () => {
        it('renders dialog with "Edit Department" header in edit mode', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: mockDepartment, clientId: mockClientId, onSuccess: mockOnSuccess }));
            expect(screen.getByTestId('dialog-header')).toHaveTextContent('Edit Department');
        });
        it('pre-fills input fields with selected department data', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: mockDepartment, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            expect(nameInput.value).toBe('Engineering');
            expect(descInput.value).toBe('Engineering Department');
        });
        it('shows "Update Department" button in edit mode', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: mockDepartment, clientId: mockClientId, onSuccess: mockOnSuccess }));
            expect(screen.getByText('Update Department')).toBeInTheDocument();
        });
        it('calls updateDepartment service when updating existing department', async () => {
            const user = userEvent.setup();
            vi.mocked(useDepartment.updateDepartment).mockResolvedValue(undefined);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: mockDepartment, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const saveButton = screen.getByText('Update Department');
            await user.clear(nameInput);
            await user.type(nameInput, 'IT Department');
            await user.click(saveButton);
            await waitFor(() => {
                expect(useDepartment.updateDepartment).toHaveBeenCalledWith('mock-token-123', {
                    ...mockDepartment,
                    departmentName: 'IT Department',
                    departmentDescription: 'Engineering Department',
                });
            });
        });
    });
    describe('Form Validation', () => {
        it('disables save button when department name is empty', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const saveButton = screen.getByText('Add Department');
            expect(saveButton).toBeDisabled();
        });
        it('disables save button when department description is empty', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            await user.type(nameInput, 'Test');
            const saveButton = screen.getByText('Add Department');
            expect(saveButton).toBeDisabled();
        });
        it('enables save button when both fields are filled', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            await user.type(nameInput, 'Test');
            await user.type(descInput, 'Test Description');
            const saveButton = screen.getByText('Add Department');
            expect(saveButton).not.toBeDisabled();
        });
        it('disables save button when fields are cleared after being filled', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            await user.type(nameInput, 'Test');
            await user.type(descInput, 'Test Desc');
            await user.clear(nameInput);
            const saveButton = screen.getByText('Add Department');
            expect(saveButton).toBeDisabled();
        });
    });
    describe('User Interactions', () => {
        it('updates department name field on user input', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            await user.type(nameInput, 'Sales');
            expect(nameInput.value).toBe('Sales');
        });
        it('updates department description field on user input', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const descInput = screen.getByTestId('departmentDescription');
            await user.type(descInput, 'Sales Department');
            expect(descInput.value).toBe('Sales Department');
        });
        it('calls onHide when cancel button is clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const cancelButton = screen.getByText('Cancel');
            await user.click(cancelButton);
            expect(mockOnHide).toHaveBeenCalledTimes(1);
        });
        it('resets form fields when cancel is clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const cancelButton = screen.getByText('Cancel');
            await user.type(nameInput, 'Test');
            await user.click(cancelButton);
            expect(nameInput.value).toBe('');
        });
    });
    describe('Success Flow', () => {
        it('calls onSuccess and onHide after successful save', async () => {
            const user = userEvent.setup();
            vi.mocked(useDepartment.addDepartment).mockResolvedValue(undefined);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            const saveButton = screen.getByText('Add Department');
            await user.type(nameInput, 'Finance');
            await user.type(descInput, 'Finance Department');
            await user.click(saveButton);
            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalledTimes(1);
                expect(mockOnHide).toHaveBeenCalledTimes(1);
            });
        });
        it('resets form after successful save', async () => {
            const user = userEvent.setup();
            vi.mocked(useDepartment.addDepartment).mockResolvedValue(undefined);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            const saveButton = screen.getByText('Add Department');
            await user.type(nameInput, 'Marketing');
            await user.type(descInput, 'Marketing Department');
            await user.click(saveButton);
            await waitFor(() => {
                expect(nameInput.value).toBe('');
                expect(descInput.value).toBe('');
            });
        });
    });
    describe('Error Handling', () => {
        it('logs error when addDepartment fails', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const error = new Error('Failed to add department');
            vi.mocked(useDepartment.addDepartment).mockRejectedValue(error);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            const saveButton = screen.getByText('Add Department');
            await user.type(nameInput, 'Test');
            await user.type(descInput, 'Test Dept');
            await user.click(saveButton);
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving department:', error);
            });
            consoleErrorSpy.mockRestore();
        });
        it('logs error when updateDepartment fails', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const error = new Error('Failed to update department');
            vi.mocked(useDepartment.updateDepartment).mockRejectedValue(error);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: mockDepartment, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const saveButton = screen.getByText('Update Department');
            await user.click(saveButton);
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving department:', error);
            });
            consoleErrorSpy.mockRestore();
        });
    });
    describe('Dialog Visibility', () => {
        it('does not render dialog when visible is false', () => {
            render(_jsx(DepartmentAddEdit, { visible: false, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
        });
        it('renders dialog when visible is true', () => {
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            expect(screen.getByTestId('dialog')).toBeInTheDocument();
        });
    });
    describe('Field Trimming', () => {
        it('trims whitespace from department name before saving', async () => {
            const user = userEvent.setup();
            vi.mocked(useDepartment.addDepartment).mockResolvedValue(undefined);
            render(_jsx(DepartmentAddEdit, { visible: true, onHide: mockOnHide, selectedDepartment: null, clientId: mockClientId, onSuccess: mockOnSuccess }));
            const nameInput = screen.getByTestId('departmentName');
            const descInput = screen.getByTestId('departmentDescription');
            const saveButton = screen.getByText('Add Department');
            await user.type(nameInput, '  Legal  ');
            await user.type(descInput, '  Legal Department  ');
            await user.click(saveButton);
            await waitFor(() => {
                expect(useDepartment.addDepartment).toHaveBeenCalledWith('mock-token-123', {
                    clientId: mockClientId,
                    departmentName: 'Legal',
                    departmentDescription: 'Legal Department',
                });
            });
        });
    });
});
