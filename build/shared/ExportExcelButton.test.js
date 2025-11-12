import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportExcelButton from './ExportExcelButton';
// Mock PrimeReact Button
vi.mock('primereact/button', () => ({
    Button: ({ children, onClick, disabled, tooltip, ...props }) => (_jsx("button", { onClick: onClick, disabled: disabled, "aria-label": props['aria-label'], "data-testid": "export-excel-button", title: tooltip, children: children })),
}));
// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaFileExcel: () => _jsx("span", { "data-testid": "file-excel-icon", children: "\uD83D\uDCCA" }),
}));
// Mock PrimeReact DataTable
vi.mock('primereact/datatable', () => ({
    DataTable: vi.fn(),
}));
describe('ExportExcelButton', () => {
    let mockExportCSV;
    let dtRef;
    beforeEach(() => {
        mockExportCSV = vi.fn();
        dtRef = {
            current: {
                exportCSV: mockExportCSV,
            },
        };
        vi.clearAllMocks();
    });
    it('renders the button with correct aria-label', () => {
        render(_jsx(ExportExcelButton, { dtRef: dtRef }));
        const button = screen.getByLabelText('Export');
        expect(button).toBeInTheDocument();
    });
    it('renders the FaFileExcel icon', () => {
        render(_jsx(ExportExcelButton, { dtRef: dtRef }));
        const icon = screen.getByTestId('file-excel-icon');
        expect(icon).toBeInTheDocument();
    });
    it('calls exportCSV when button is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(ExportExcelButton, { dtRef: dtRef }));
        const button = screen.getByTestId('export-excel-button');
        await user.click(button);
        expect(mockExportCSV).toHaveBeenCalledTimes(1);
    });
    it('applies default tooltip when not provided', () => {
        render(_jsx(ExportExcelButton, { dtRef: dtRef }));
        const button = screen.getByTestId('export-excel-button');
        expect(button).toHaveAttribute('title', 'Export');
    });
    it('applies custom tooltip when provided', () => {
        render(_jsx(ExportExcelButton, { dtRef: dtRef, tooltip: "Download as Excel" }));
        const button = screen.getByTestId('export-excel-button');
        expect(button).toHaveAttribute('title', 'Download as Excel');
    });
    it('applies custom label as aria-label', () => {
        render(_jsx(ExportExcelButton, { dtRef: dtRef, label: "Download" }));
        const button = screen.getByLabelText('Download');
        expect(button).toBeInTheDocument();
    });
    it('disables the button when disabled prop is true', () => {
        render(_jsx(ExportExcelButton, { dtRef: dtRef, disabled: true }));
        const button = screen.getByTestId('export-excel-button');
        expect(button).toBeDisabled();
    });
    it('does not call exportCSV when button is disabled', async () => {
        const user = userEvent.setup();
        render(_jsx(ExportExcelButton, { dtRef: dtRef, disabled: true }));
        const button = screen.getByTestId('export-excel-button');
        await user.click(button);
        expect(mockExportCSV).not.toHaveBeenCalled();
    });
});
