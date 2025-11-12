import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// Assuming relative paths based on standard React project structure:
import DepartmentTable from '../components/departmentTable';
import { getDepartments } from '../services/useDepartment';
// --- MOCK EXTERNAL COMPONENTS AND SERVICES ---
// Mock AuthContext
vi.mock('../../../shared/auth/AuthContext', () => ({
    useAuth: () => ({
        accessToken: 'mock-token-123'
    })
}));
// ✅ PrimeReact components mock
vi.mock('primereact/datatable', () => ({
    DataTable: vi.fn(({ value, selection, onSelectionChange, children }) => (_jsxs("div", { "data-testid": "datatable-mock", children: [value.map((dept) => (_jsx("div", { "data-testid": `row-${dept.departmentId}`, className: selection && selection.departmentId === dept.departmentId ? 'selected' : '', onClick: () => onSelectionChange({ value: dept }), children: dept.departmentName }, dept.departmentId))), children] }))),
    Column: vi.fn(() => null),
}));
// ✅ Shared Buttons mock
vi.mock('../../../shared/AddButton', () => ({
    default: (props) => (_jsx("button", { "data-testid": "add-button", onClick: props.onClick, disabled: props.disabled, children: "Add" })),
}));
vi.mock('../../../shared/EditButton', () => ({
    default: (props) => (_jsx("button", { "data-testid": "edit-button", onClick: props.onClick, disabled: props.disabled, children: "Edit" })),
}));
vi.mock('../../../shared/DeleteButton', () => ({
    default: (props) => (_jsx("button", { "data-testid": "delete-button", onClick: props.onClick, disabled: props.disabled, children: "Delete" })),
}));
// ✅ Department dialogs mock
vi.mock('../components/DepartmentAddEdit', () => ({
    default: (props) => props.visible ? (_jsxs("div", { "data-testid": "add-edit-dialog", children: [_jsx("button", { "data-testid": "add-edit-success-mock", onClick: () => {
                    props.onSuccess?.();
                    props.onHide?.(); // simulate hide after success
                }, children: "Success" }), _jsx("button", { "data-testid": "add-edit-hide-mock", onClick: props.onHide, children: "Hide" })] })) : null,
}));
vi.mock('../components/DepartmentDelete', () => ({
    default: (props) => props.visible ? (_jsxs("div", { "data-testid": "delete-dialog", children: [_jsx("button", { "data-testid": "delete-success-mock", onClick: () => {
                    props.onSuccess?.();
                    props.onHide?.(); // simulate hide after success
                    props.onClearSelection?.(); // simulate clearing selection
                }, children: "Success" }), _jsx("button", { "data-testid": "delete-hide-mock", onClick: props.onHide, children: "Hide" }), _jsx("button", { "data-testid": "clear-selection-mock", onClick: props.onClearSelection, children: "Clear" })] })) : null,
}));
// ✅ Data service mock
const mockDepartments = [
    { departmentId: 1, departmentName: 'Engineering', departmentDescription: 'Build stuff', clientId: 1 },
    { departmentId: 2, departmentName: 'Design', departmentDescription: 'Make it look good', clientId: 1 },
];
vi.mock('../services/useDepartment', () => ({
    getDepartments: vi.fn(),
}));
// ✅ PrimeReact Button mock (Back to Clients)
vi.mock('primereact/button', () => ({
    Button: ({ label, onClick, ...props }) => (_jsx("button", { onClick: onClick, "data-testid": `button-${label.toLowerCase().replace(/\s/g, '-')}`, ...props, children: label })),
}));
// --- TEST SETUP ---
const defaultProps = {
    clientId: 1,
    clientName: 'Acme Corp',
    onBackClick: vi.fn(),
};
// --- TESTS ---
describe('DepartmentTable - Logic Verification (Coverage > 90%)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getDepartments.mockResolvedValue({ departments: mockDepartments });
    });
    it('1. must load and display departments on mount if clientId is present', async () => {
        render(_jsx(DepartmentTable, { ...defaultProps }));
        expect(screen.getByText(`Departments for: ${defaultProps.clientName}`)).toBeInTheDocument();
        expect(screen.getByTestId('button-back-to-clients')).toBeInTheDocument();
        expect(getDepartments).toHaveBeenCalledWith('mock-token-123', defaultProps.clientId);
        await waitFor(() => {
            expect(screen.getByText('Engineering')).toBeInTheDocument();
            expect(screen.getByText('Design')).toBeInTheDocument();
        });
        expect(screen.getByTestId('add-button')).toBeEnabled();
        expect(screen.getByTestId('edit-button')).toBeDisabled();
        expect(screen.getByTestId('delete-button')).toBeDisabled();
    });
    it('2. must log an error if data loading fails (fail path coverage)', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        getDepartments.mockRejectedValue(new Error('Network failure'));
        render(_jsx(DepartmentTable, { ...defaultProps }));
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading departments:', expect.any(Error));
        });
        consoleErrorSpy.mockRestore();
    });
    it('3. must NOT load data if clientId is null/undefined and disable Add button', () => {
        render(_jsx(DepartmentTable, { clientId: null, clientName: "None", onBackClick: defaultProps.onBackClick }));
        expect(screen.getByTestId('add-button')).toBeDisabled();
        expect(getDepartments).not.toHaveBeenCalled();
    });
    // it('4. must enable Edit/Delete buttons upon row selection and disable them after clear', async () => {
    //   const user = userEvent.setup();
    //   render(<DepartmentTable {...defaultProps} />);
    //   await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());
    //   await user.click(screen.getByTestId('row-1'));
    //   expect(screen.getByTestId('edit-button')).toBeEnabled();
    //   expect(screen.getByTestId('delete-button')).toBeEnabled();
    //   await user.click(screen.getByTestId('delete-button'));
    //   await user.click(screen.getByTestId('delete-dialog'));
    //   await waitFor(() => {
    //     expect(screen.getByTestId('edit-button')).toBeDisabled();
    //     expect(screen.getByTestId('delete-button')).toBeDisabled();
    //     expect(getDepartments).toHaveBeenCalledTimes(2);
    //   });
    // });
    it('5. must open the Add dialog, trigger reload on success, and hide on success', async () => {
        const user = userEvent.setup();
        render(_jsx(DepartmentTable, { ...defaultProps }));
        await waitFor(() => expect(screen.getByTestId('datatable-mock')).toBeInTheDocument());
        getDepartments.mockClear();
        await user.click(screen.getByTestId('add-button'));
        expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
        await user.click(screen.getByTestId('add-edit-success-mock'));
        await waitFor(() => {
            expect(getDepartments).toHaveBeenCalledWith('mock-token-123', defaultProps.clientId);
        });
        expect(screen.queryByTestId('add-edit-dialog')).toBeNull();
    });
    it('6. must open the Edit dialog with selected department and hide on close', async () => {
        const user = userEvent.setup();
        render(_jsx(DepartmentTable, { ...defaultProps }));
        await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument());
        await user.click(screen.getByTestId('row-1'));
        await user.click(screen.getByTestId('edit-button'));
        expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
        await user.click(screen.getByTestId('add-edit-hide-mock'));
        await waitFor(() => expect(screen.queryByTestId('add-edit-dialog')).toBeNull());
    });
    it('7. must open the Delete dialog and trigger reload/clear selection on success', async () => {
        const user = userEvent.setup();
        render(_jsx(DepartmentTable, { ...defaultProps }));
        await waitFor(() => expect(screen.getByText('Design')).toBeInTheDocument());
        await user.click(screen.getByTestId('row-2'));
        getDepartments.mockClear();
        await user.click(screen.getByTestId('delete-button'));
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
        await user.click(screen.getByTestId('delete-success-mock'));
        await waitFor(() => expect(screen.queryByTestId('delete-dialog')).toBeNull());
        expect(getDepartments).toHaveBeenCalledWith('mock-token-123', defaultProps.clientId);
        await waitFor(() => expect(screen.getByTestId('edit-button')).toBeDisabled());
    });
    it('8. must call onBackClick when "Back to Clients" button is pressed', async () => {
        const user = userEvent.setup();
        render(_jsx(DepartmentTable, { ...defaultProps }));
        await user.click(screen.getByTestId('button-back-to-clients'));
        expect(defaultProps.onBackClick).toHaveBeenCalledTimes(1);
    });
    it('9. must NOT open Edit/Delete dialogs if no department is selected', async () => {
        const user = userEvent.setup();
        render(_jsx(DepartmentTable, { ...defaultProps }));
        await waitFor(() => expect(screen.getByTestId('datatable-mock')).toBeInTheDocument());
        expect(screen.getByTestId('edit-button')).toBeDisabled();
        expect(screen.getByTestId('delete-button')).toBeDisabled();
        await user.click(screen.getByTestId('edit-button'));
        await user.click(screen.getByTestId('delete-button'));
        expect(screen.queryByTestId('add-edit-dialog')).toBeNull();
        expect(screen.queryByTestId('delete-dialog')).toBeNull();
    });
});
