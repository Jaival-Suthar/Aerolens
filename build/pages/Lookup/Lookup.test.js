import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import LookupPage from './page';
import { useLookupData } from './hooks/useLookupData';
import { useSearchParams } from 'react-router-dom';
// Mock the custom hook
vi.mock('./hooks/useLookupData', () => ({
    useLookupData: vi.fn(),
}));
// Mock react-router-dom useSearchParams
vi.mock('react-router-dom', () => ({
    useSearchParams: vi.fn(),
}));
// Mock child component LookupTable
vi.mock('./components/lookupTable', () => ({
    default: ({ data, onPageChange, onDataChange }) => (_jsxs("div", { children: [_jsxs("div", { "data-testid": "lookup-table", children: [data.length, " items"] }), _jsx("button", { onClick: () => onPageChange(3, 15), children: "Change Page" }), _jsx("button", { onClick: () => onDataChange(), children: "Data Change" })] })),
}));
describe('LookupPage', () => {
    const mockSetSearchParams = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        useSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
    });
    it('renders loading spinner when loading and no data', () => {
        useLookupData.mockReturnValue({ data: [], loading: true, error: null, meta: null });
        render(_jsx(LookupPage, {}));
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    it('renders error message when error occurs', () => {
        useLookupData.mockReturnValue({ data: [], loading: false, error: 'Failed to fetch', meta: null });
        render(_jsx(LookupPage, {}));
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
    it('renders LookupTable when data is available', () => {
        useLookupData.mockReturnValue({
            data: [{ id: 1, tag: 'status', value: 'active' }],
            loading: false,
            error: null,
            meta: { total: 1, page: 1, limit: 10 },
        });
        render(_jsx(LookupPage, {}));
        expect(screen.getByTestId('lookup-table')).toHaveTextContent('1 items');
    });
    it('prefers search params over localStorage values', async () => {
        localStorage.setItem('lookupPagination', JSON.stringify({ page: 5, limit: 50 }));
        useSearchParams.mockReturnValue([new URLSearchParams({ page: '3', limit: '15' }), mockSetSearchParams]);
        useLookupData.mockReturnValue({ data: [], loading: false, error: null, meta: null });
        render(_jsx(LookupPage, {}));
        await waitFor(() => {
            expect(screen.getByTestId('lookup-table')).toBeInTheDocument();
            expect(mockSetSearchParams).not.toHaveBeenCalled(); // search params present, no need to update
        });
        localStorage.clear();
    });
    it('uses localStorage if search params are missing', async () => {
        localStorage.setItem('lookupPagination', JSON.stringify({ page: 2, limit: 20 }));
        useLookupData.mockReturnValue({ data: [], loading: false, error: null, meta: null });
        render(_jsx(LookupPage, {}));
        await waitFor(() => {
            expect(mockSetSearchParams).toHaveBeenCalledWith({ page: '2', limit: '20' });
        });
        localStorage.clear();
    });
    it('defaults to page 1 and limit 10 if no search params or localStorage', () => {
        useLookupData.mockReturnValue({ data: [], loading: false, error: null, meta: null });
        render(_jsx(LookupPage, {}));
        expect(screen.getByTestId('lookup-table')).toBeInTheDocument();
    });
    it('handles onPageChange callback correctly', async () => {
        useLookupData.mockReturnValue({ data: [{ id: 1 }], loading: false, error: null, meta: { total: 10, page: 1, limit: 5 } });
        render(_jsx(LookupPage, {}));
        fireEvent.click(screen.getByText('Change Page'));
        await waitFor(() => {
            expect(mockSetSearchParams).toHaveBeenCalledWith({ page: '3', limit: '15' });
            expect(JSON.parse(localStorage.getItem('lookupPagination') || '{}')).toEqual({ page: 3, limit: 15 });
        });
    });
    //   it('handles onDataChange callback by resetting page to 1', () => {
    //     (useLookupData as any).mockReturnValue({ data: [{ id: 1 }], loading: false, error: null, meta: { total: 10, page: 5, limit: 5 } });
    //     render(<LookupPage />);
    //     fireEvent.click(screen.getByText('Data Change'));
    //     expect(mockSetSearchParams).toHaveBeenCalledWith({ page: '1', limit: '5' });
    //     expect(JSON.parse(localStorage.getItem('lookupPagination') || '{}')).toEqual({ page: 1, limit: 5 });
    //   });
    it('renders LookupTable even when meta is undefined', () => {
        useLookupData.mockReturnValue({ data: [{ id: 1 }], loading: false, error: null, meta: undefined });
        render(_jsx(LookupPage, {}));
        expect(screen.getByTestId('lookup-table')).toBeInTheDocument();
    });
    it('renders empty table if data is empty but not loading', () => {
        useLookupData.mockReturnValue({ data: [], loading: false, error: null, meta: { total: 0, page: 1, limit: 10 } });
        render(_jsx(LookupPage, {}));
        expect(screen.getByTestId('lookup-table')).toHaveTextContent('0 items');
    });
});
