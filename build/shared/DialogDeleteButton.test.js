import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DialogDeleteButton from './DialogDeleteButton';
// Mock PrimeReact Button
vi.mock('primereact/button', () => ({
    Button: ({ label, severity, icon, onClick, disabled, loading, autoFocus, className }) => (_jsxs("button", { onClick: onClick, disabled: disabled, "data-testid": severity === 'secondary' ? 'cancel-button' : 'delete-button', "data-severity": severity, "data-loading": loading, autoFocus: autoFocus, className: className, children: [loading && _jsx("span", { "data-testid": "loading-spinner", children: "Loading..." }), icon && _jsx("span", { "data-testid": "button-icon", children: icon }), label] })),
}));
// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaTrash: () => _jsx("span", { "data-testid": "trash-icon", children: "\uD83D\uDDD1" }),
}));
describe('DialogDeleteButton', () => {
    const mockOnCancel = vi.fn();
    const mockOnDelete = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders both cancel and delete buttons with default labels', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete }));
        const cancelButton = screen.getByTestId('cancel-button');
        const deleteButton = screen.getByTestId('delete-button');
        expect(cancelButton).toBeInTheDocument();
        expect(cancelButton).toHaveTextContent('Cancel');
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveTextContent('Delete');
    });
    it('renders with custom labels', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, cancelLabel: "No", deleteLabel: "Yes, Delete" }));
        const cancelButton = screen.getByTestId('cancel-button');
        const deleteButton = screen.getByTestId('delete-button');
        expect(cancelButton).toHaveTextContent('No');
        expect(deleteButton).toHaveTextContent('Yes, Delete');
    });
    it('calls onCancel when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete }));
        const cancelButton = screen.getByTestId('cancel-button');
        await user.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete }));
        const deleteButton = screen.getByTestId('delete-button');
        await user.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
    it('renders delete button with FaTrash icon', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete }));
        const icon = screen.getByTestId('trash-icon');
        expect(icon).toBeInTheDocument();
    });
    it('disables cancel button when cancelDisabled is true', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, cancelDisabled: true }));
        const cancelButton = screen.getByTestId('cancel-button');
        expect(cancelButton).toBeDisabled();
    });
    it('disables delete button when deleteDisabled is true', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, deleteDisabled: true }));
        const deleteButton = screen.getByTestId('delete-button');
        expect(deleteButton).toBeDisabled();
    });
    it('disables both buttons when loading is true', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, loading: true }));
        const cancelButton = screen.getByTestId('cancel-button');
        const deleteButton = screen.getByTestId('delete-button');
        expect(cancelButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });
    it('shows loading state on delete button when loading is true', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, loading: true }));
        const deleteButton = screen.getByTestId('delete-button');
        expect(deleteButton).toHaveAttribute('data-loading', 'true');
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    it('does not call onCancel when cancel button is disabled', async () => {
        const user = userEvent.setup();
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, cancelDisabled: true }));
        const cancelButton = screen.getByTestId('cancel-button');
        await user.click(cancelButton);
        expect(mockOnCancel).not.toHaveBeenCalled();
    });
    it('does not call onDelete when delete button is disabled', async () => {
        const user = userEvent.setup();
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, deleteDisabled: true }));
        const deleteButton = screen.getByTestId('delete-button');
        await user.click(deleteButton);
        expect(mockOnDelete).not.toHaveBeenCalled();
    });
    it('applies custom className to both buttons', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete, className: "custom-class" }));
        const cancelButton = screen.getByTestId('cancel-button');
        const deleteButton = screen.getByTestId('delete-button');
        expect(cancelButton).toHaveClass('custom-class');
        expect(deleteButton).toHaveClass('custom-class');
    });
    it('applies correct severity to buttons', () => {
        render(_jsx(DialogDeleteButton, { onCancel: mockOnCancel, onDelete: mockOnDelete }));
        const cancelButton = screen.getByTestId('cancel-button');
        const deleteButton = screen.getByTestId('delete-button');
        expect(cancelButton).toHaveAttribute('data-severity', 'secondary');
        expect(deleteButton).toHaveAttribute('data-severity', 'danger');
    });
});
