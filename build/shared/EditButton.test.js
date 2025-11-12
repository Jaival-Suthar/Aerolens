import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditButton from './EditButton';
// Mock PrimeReact Button
vi.mock('primereact/button', () => ({
    Button: ({ children, onClick, disabled, tooltip, ...props }) => (_jsx("button", { onClick: onClick, disabled: disabled, "aria-label": props['aria-label'], "data-testid": "edit-button", title: tooltip, children: children })),
}));
// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaPencilAlt: () => _jsx("span", { "data-testid": "pencil-icon", children: "\u270F" }),
}));
describe('EditButton', () => {
    const mockOnClick = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders the button with correct aria-label', () => {
        render(_jsx(EditButton, { onClick: mockOnClick }));
        const button = screen.getByLabelText('Edit');
        expect(button).toBeInTheDocument();
    });
    it('renders the FaPencilAlt icon', () => {
        render(_jsx(EditButton, { onClick: mockOnClick }));
        const icon = screen.getByTestId('pencil-icon');
        expect(icon).toBeInTheDocument();
    });
    it('calls onClick handler when clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(EditButton, { onClick: mockOnClick }));
        const button = screen.getByTestId('edit-button');
        await user.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
    it('applies default tooltip when not provided', () => {
        render(_jsx(EditButton, { onClick: mockOnClick }));
        const button = screen.getByTestId('edit-button');
        expect(button).toHaveAttribute('title', 'Edit');
    });
    it('applies custom tooltip when provided', () => {
        render(_jsx(EditButton, { onClick: mockOnClick, tooltip: "Edit contact details" }));
        const button = screen.getByTestId('edit-button');
        expect(button).toHaveAttribute('title', 'Edit contact details');
    });
    it('disables the button when disabled prop is true', () => {
        render(_jsx(EditButton, { onClick: mockOnClick, disabled: true }));
        const button = screen.getByTestId('edit-button');
        expect(button).toBeDisabled();
    });
    it('does not call onClick when button is disabled', async () => {
        const user = userEvent.setup();
        render(_jsx(EditButton, { onClick: mockOnClick, disabled: true }));
        const button = screen.getByTestId('edit-button');
        await user.click(button);
        expect(mockOnClick).not.toHaveBeenCalled();
    });
    it('enables the button when disabled prop is false', () => {
        render(_jsx(EditButton, { onClick: mockOnClick, disabled: false }));
        const button = screen.getByTestId('edit-button');
        expect(button).not.toBeDisabled();
    });
});
