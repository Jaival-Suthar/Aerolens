import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import LookupPage from "./page";
import { useLookupData } from "./hooks/useLookupData";
import { useLocationData } from "./hooks/useLocationData";

vi.mock("./hooks/useLookupData", () => ({
  useLookupData: vi.fn(),
}));

vi.mock("./hooks/useLocationData", () => ({
  useLocationData: vi.fn(),
}));

vi.mock("./components/lookupTable", () => ({
  default: ({ data, onDataChange }: any) => (
    <div>
      <div data-testid="lookup-table">{data.length} items</div>
      <button type="button" onClick={() => onDataChange?.()}>
        Data Change
      </button>
    </div>
  ),
}));

vi.mock("./components/locationLookupTable", () => ({
  default: ({ data }: any) => (
    <div data-testid="location-table">{data?.length ?? 0} locations</div>
  ),
}));

vi.mock("primereact/progressspinner", () => ({
  ProgressSpinner: () => <div role="progressbar" aria-label="Loading" />,
}));

vi.mock("primereact/message", () => ({
  Message: ({ text }: { text?: string }) => <div role="alert">{text}</div>,
}));

describe("LookupPage", () => {
  const mockLookupRefetch = vi.fn();
  const mockLocationRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useLookupData as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockLookupRefetch,
    });
    (useLocationData as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockLocationRefetch,
    });
  });

  it("renders loading spinner when lookup loading and no data", () => {
    (useLookupData as any).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: mockLookupRefetch,
    });
    render(<LookupPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders error message when lookup hook reports error", () => {
    (useLookupData as any).mockReturnValue({
      data: [],
      loading: false,
      error: "Failed to fetch",
      refetch: mockLookupRefetch,
    });
    render(<LookupPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to fetch");
  });

  it("renders LookupTable when lookup data is available", () => {
    (useLookupData as any).mockReturnValue({
      data: [{ id: 1, tag: "status", value: "active" }],
      loading: false,
      error: null,
      refetch: mockLookupRefetch,
    });
    render(<LookupPage />);
    expect(screen.getByTestId("lookup-table")).toHaveTextContent("1 items");
  });

  it("switches to Location Lookup tab and shows location table", async () => {
    (useLocationData as any).mockReturnValue({
      data: [{ id: 1 }],
      loading: false,
      error: null,
      refetch: mockLocationRefetch,
    });
    render(<LookupPage />);
    fireEvent.click(screen.getByRole("button", { name: /Location Lookup/i }));
    await waitFor(() => {
      expect(screen.getByTestId("location-table")).toHaveTextContent("1 locations");
    });
  });

  it("calls lookup refetch when Data Change is clicked", async () => {
    (useLookupData as any).mockReturnValue({
      data: [{ id: 1 }],
      loading: false,
      error: null,
      refetch: mockLookupRefetch,
    });
    render(<LookupPage />);
    fireEvent.click(screen.getByText("Data Change"));
    expect(mockLookupRefetch).toHaveBeenCalled();
  });

  // REMOVED: URLSearchParams / localStorage pagination tests — Lookup page no longer uses useSearchParams or lookupPagination in page.tsx.
  // REMOVED: onPageChange callback test — LookupTable is no longer passed onPageChange from page.tsx.

  it("renders LookupTable even when meta is not used by page", () => {
    (useLookupData as any).mockReturnValue({
      data: [{ id: 1 }],
      loading: false,
      error: null,
      refetch: mockLookupRefetch,
    });
    render(<LookupPage />);
    expect(screen.getByTestId("lookup-table")).toBeInTheDocument();
  });

  it("renders empty table if data is empty but not loading", () => {
    (useLookupData as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: mockLookupRefetch,
    });
    render(<LookupPage />);
    expect(screen.getByTestId("lookup-table")).toHaveTextContent("0 items");
  });
});
