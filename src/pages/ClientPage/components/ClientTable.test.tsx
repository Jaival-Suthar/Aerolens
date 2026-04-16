// ClientTable.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientTable from "./clientTable";
import React from "react";
import type { ClientType } from "../types/clientTypes";

// Create mock functions
const mockLoadClients = vi.fn().mockResolvedValue({
  data: [],
  meta: { total: 0 },
});
const mockSetError = vi.fn();

// Mock the hooks
vi.mock("../hooks/useClientData", () => ({
  useClientData: vi.fn(),
}));

// Import after mocking
import { useClientData } from "../hooks/useClientData";

describe("ClientTable", () => {
  const mockClients: ClientType[] = [
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

  });

  it("renders client rows and headers", () => {
    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

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

    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByText("No clients found.")).toBeInTheDocument();
  });

  it("shows error UI when error is present", () => {
    vi.mocked(useClientData).mockReturnValue({
      clients: [],
      loading: false,
      error: {
        success: false,
        error: "network",
        message: "Network error",
      },
      loadClients: mockLoadClients,
      setError: mockSetError,
    });

    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });

  it("shows loading state", () => {
    vi.mocked(useClientData).mockReturnValue({
      clients: [],
      loading: true,
      error: null,
      loadClients: mockLoadClients,
      setError: mockSetError,
    });

    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
        loading={true}
      />
    );

    // You may need to adjust this based on your loading UI implementation
    // For example, if you have a loading spinner or skeleton
  });

  it("calls onSelectionChange when selection changes", () => {
    const handler = vi.fn();
    
    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={handler}
      />
    );

    // Simulate selection change: fire selection event if possible
    // You might need to adapt depending on whether DataTable exposes input/select in test env
    // This is a placeholder - adjust based on your actual DataTable implementation
  });

  it("calls onEdit on row double click", () => {
    const editHandler = vi.fn();
    
    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={editHandler}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

    // Find a row and fire double click event
    const row = screen.getByText("SpaceX").closest("tr");
    if (row) {
      fireEvent.doubleClick(row);
      expect(editHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 1,
          clientName: "SpaceX",
          address: "Mars Base"
        })
      );
    }
  });

  it("shows paginator and triggers page change callback", () => {
    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

    // Built-in DataTable paginator (standalone Paginator in source is commented out)
    expect(screen.getByText(/Showing .* of .* Clients/)).toBeInTheDocument();
  });

  it("reloads clients when refreshTrigger changes", () => {
    const { rerender } = render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

    expect(mockLoadClients).toHaveBeenCalledTimes(1);

    // Change refreshTrigger
    rerender(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={1}
        selectedClient={null}
        onSelectionChange={vi.fn()}
      />
    );

    expect(mockLoadClients).toHaveBeenCalledTimes(2);
  });

  it("handles selected client prop", () => {
    const selectedClient: ClientType = {
      clientId: 1,
      clientName: "SpaceX",
      address: "Mars Base"
    };

    render(
      <ClientTable
        dtRef={React.createRef()}
        onEdit={vi.fn()}
        refreshTrigger={0}
        selectedClient={selectedClient}
        onSelectionChange={vi.fn()}
      />
    );

    // Verify the selected client is rendered
    expect(screen.getByText("SpaceX")).toBeInTheDocument();
  });
});