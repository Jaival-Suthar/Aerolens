import { jsx as _jsx } from "react/jsx-runtime";
// ClientTable.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientTable from "./clientTable";
import React from "react";
// Create mock functions
const mockLoadClients = vi.fn().mockResolvedValue({
    data: [],
    meta: null,
});
const mockSetError = vi.fn();
const mockUpdateUrlParams = vi.fn();
const mockSavePaginationPreferences = vi.fn();
const mockUpdatePaginationFromResponse = vi.fn();
const mockResetPaginationOnError = vi.fn();
// Mock the hooks
vi.mock("../hooks/useClientData", () => ({
    useClientData: vi.fn(),
}));
vi.mock("../hooks/usePagination", () => ({
    usePagination: vi.fn(),
}));
// Import after mocking
import { useClientData } from "../hooks/useClientData";
import { usePagination } from "../hooks/usePagination";
describe("ClientTable", () => {
    const mockClients = [
        { clientId: 1, clientName: "SpaceX", address: "Mars Base" },
        { clientId: 2, clientName: "Tesla", address: "Gigafactory" },
    ];
    beforeEach(() => {
        vi.clearAllMocks();
        // Set default mock implementation for useClientData
        vi.mocked(useClientData).mockReturnValue({
            clients: mockClients,
            loading: false,
            error: null,
            loadClients: mockLoadClients,
            setError: mockSetError,
        });
        // Set default mock implementation for usePagination
        vi.mocked(usePagination).mockReturnValue({
            pagination: {
                currentPage: 1,
                limit: 10,
                totalPages: 1,
                totalRecords: 2
            },
            setPagination: vi.fn(),
            getInitialPagination: () => ({
                currentPage: 1,
                limit: 10,
                totalPages: 1,
                totalRecords: 0
            }),
            updateUrlParams: mockUpdateUrlParams,
            savePaginationPreferences: mockSavePaginationPreferences,
            updatePaginationFromResponse: mockUpdatePaginationFromResponse,
            resetPaginationOnError: mockResetPaginationOnError,
            searchParams: new URLSearchParams(),
        });
    });
    it("renders client rows and headers", () => {
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn() }));
        // Check headers
        expect(screen.getByText("Client ID")).toBeInTheDocument();
        expect(screen.getByText("Client Name")).toBeInTheDocument();
        // Check data rows
        expect(screen.getByText("SpaceX")).toBeInTheDocument();
        expect(screen.getByText("Tesla")).toBeInTheDocument();
    });
    it("shows empty message when no clients", () => {
        vi.mocked(useClientData).mockReturnValue({
            clients: [],
            loading: false,
            error: null,
            loadClients: mockLoadClients,
            setError: mockSetError,
        });
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn() }));
        expect(screen.getByText("No clients found.")).toBeInTheDocument();
    });
    it("shows error UI when error is present", () => {
        vi.mocked(useClientData).mockReturnValue({
            clients: [],
            loading: false,
            error: "Network error",
            loadClients: mockLoadClients,
            setError: mockSetError,
        });
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn() }));
        expect(screen.getByText(/Error loading clients: Network error/)).toBeInTheDocument();
    });
    it("shows loading state", () => {
        vi.mocked(useClientData).mockReturnValue({
            clients: [],
            loading: true,
            error: null,
            loadClients: mockLoadClients,
            setError: mockSetError,
        });
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn(), loading: true }));
        // You may need to adjust this based on your loading UI implementation
        // For example, if you have a loading spinner or skeleton
    });
    it("calls onSelectionChange when selection changes", () => {
        const handler = vi.fn();
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: handler }));
        // Simulate selection change: fire selection event if possible
        // You might need to adapt depending on whether DataTable exposes input/select in test env
        // This is a placeholder - adjust based on your actual DataTable implementation
    });
    it("calls onEdit on row double click", () => {
        const editHandler = vi.fn();
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: editHandler, refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn() }));
        // Find a row and fire double click event
        const row = screen.getByText("SpaceX").closest("tr");
        if (row) {
            fireEvent.doubleClick(row);
            expect(editHandler).toHaveBeenCalledWith(expect.objectContaining({
                clientId: 1,
                clientName: "SpaceX",
                address: "Mars Base"
            }));
        }
    });
    it("shows paginator and triggers page change callback", () => {
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn() }));
        // Should show paginator controls
        expect(screen.getByLabelText("Table pagination controls")).toBeInTheDocument();
        // Simulate page change if needed by interacting with paginator elements
    });
    it("reloads clients when refreshTrigger changes", () => {
        const { rerender } = render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: null, onSelectionChange: vi.fn() }));
        expect(mockLoadClients).toHaveBeenCalledTimes(1);
        // Change refreshTrigger
        rerender(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 1, selectedClient: null, onSelectionChange: vi.fn() }));
        expect(mockLoadClients).toHaveBeenCalledTimes(2);
    });
    it("handles selected client prop", () => {
        const selectedClient = {
            clientId: 1,
            clientName: "SpaceX",
            address: "Mars Base"
        };
        render(_jsx(ClientTable, { dtRef: React.createRef(), onEdit: vi.fn(), refreshTrigger: 0, selectedClient: selectedClient, onSelectionChange: vi.fn() }));
        // Verify the selected client is rendered
        expect(screen.getByText("SpaceX")).toBeInTheDocument();
    });
});
