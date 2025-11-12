import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteButton from './DeleteButton';
// Mock PrimeReact Button
vi.mock('primereact/button', () => ({
    Button: ({ children, onClick, disabled, tooltip, ...props }) => (_jsx("button", { onClick: onClick, disabled: disabled, "aria-label": props['aria-label'], "data-testid": "delete-button", title: tooltip, children: children })),
}));
// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaTrash: () => _jsx("span", { "data-testid": "trash-icon", children: "\uD83D\uDDD1" }),
}));
describe('DeleteButton', () => {
    const mockOnClick = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders the button with correct aria-label', () => {
        render(_jsx(DeleteButton, { onClick: mockOnClick }));
        const button = screen.getByLabelText('Delete');
        expect(button).toBeInTheDocument();
    });
    it('renders the FaTrash icon', () => {
        render(_jsx(DeleteButton, { onClick: mockOnClick }));
        const icon = screen.getByTestId('trash-icon');
        expect(icon).toBeInTheDocument();
    });
    it('calls onClick handler when clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(DeleteButton, { onClick: mockOnClick }));
        const button = screen.getByTestId('delete-button');
        await user.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
    it('applies default tooltip when not provided', () => {
        render(_jsx(DeleteButton, { onClick: mockOnClick }));
        const button = screen.getByTestId('delete-button');
        expect(button).toHaveAttribute('title', 'Delete');
    });
    it('applies custom tooltip when provided', () => {
        render(_jsx(DeleteButton, { onClick: mockOnClick, tooltip: "Delete item" }));
        const button = screen.getByTestId('delete-button');
        expect(button).toHaveAttribute('title', 'Delete item');
    });
    it('disables the button when disabled prop is true', () => {
        render(_jsx(DeleteButton, { onClick: mockOnClick, disabled: true }));
        const button = screen.getByTestId('delete-button');
        expect(button).toBeDisabled();
    });
    it('does not call onClick when button is disabled', async () => {
        const user = userEvent.setup();
        render(_jsx(DeleteButton, { onClick: mockOnClick, disabled: true }));
        const button = screen.getByTestId('delete-button');
        await user.click(button);
        expect(mockOnClick).not.toHaveBeenCalled();
    });
    it('enables the button when disabled prop is false', () => {
        render(_jsx(DeleteButton, { onClick: mockOnClick, disabled: false }));
        const button = screen.getByTestId('delete-button');
        expect(button).not.toBeDisabled();
    });
});
