import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useClientData } from "./useClientData";
import * as clientService from "../services/clientService";
import type { ClientsApiResponse, ClientType } from "../types/clientTypes";

vi.mock("../services/clientService");

// Default mock AuthContext with valid accessToken
vi.mock("../../../shared/auth/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    accessToken: "mock-token-123",
  })),
}));

describe("useClientData hook", () => {
  const mockClients: ClientType[] = [
    { clientId: 1, clientName: "SpaceX", address: "Mars Base" },
    { clientId: 2, clientName: "Tesla", address: "Gigafactory" },
  ];

  const mockedGetClients = vi.mocked(clientService.getClients);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initial state is empty clients, no error, not loading", async () => {
    mockedGetClients.mockResolvedValue({ data: [], meta: null });

    const { result } = renderHook(() => useClientData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clients).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.loading).toBe("boolean");
  });

  it("does not auto-load clients when accessToken is null", async () => {
    const useAuthMock = vi.mocked(
      await import("../../../shared/auth/AuthContext")
    ).useAuth;
    useAuthMock.mockReturnValueOnce({ accessToken: null } as any);

    const { result } = renderHook(() => useClientData());

    expect(mockedGetClients).not.toHaveBeenCalled();
    expect(result.current.clients).toEqual([]);
  });

  it("loading eventually becomes false after initial load", async () => {
    mockedGetClients.mockResolvedValue({ data: mockClients, meta: null });

    const { result } = renderHook(() => useClientData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clients).toEqual(mockClients);
    expect(result.current.error).toBeNull();
    expect(mockedGetClients).toHaveBeenCalledWith("mock-token-123", 1, 10);
  });

  it("successfully loads clients and updates state", async () => {
    const response: ClientsApiResponse = { data: mockClients, meta: null };
    mockedGetClients.mockResolvedValue(response);

    const { result } = renderHook(() => useClientData());

    act(() => {
      void result.current.loadClients(1, 10);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.clients).toEqual(mockClients);
      expect(result.current.error).toBeNull();
    });

    expect(mockedGetClients).toHaveBeenCalledWith("mock-token-123", 1, 10);
  });

  it("handles API errors correctly and updates error state", async () => {
    const errorMessage = "Network error";
    mockedGetClients.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useClientData());

    let caughtError: unknown;
    act(() => {
      result.current.loadClients(1, 10).catch(err => {
        caughtError = err;
      });
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.clients).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(mockedGetClients).toHaveBeenCalledWith("mock-token-123", 1, 10);
    expect(caughtError).toBeInstanceOf(Error);
  });

  it("auto-reloads clients when refreshTrigger changes", async () => {
    const response: ClientsApiResponse = { data: mockClients, meta: null };
    mockedGetClients.mockResolvedValue(response);

    const { result, rerender } = renderHook(
      ({ refresh }) => useClientData(refresh),
      { initialProps: { refresh: 0 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.clients).toEqual(mockClients);
    });

    act(() => {
      rerender({ refresh: 1 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGetClients).toHaveBeenCalledTimes(2);
  });

  it("resets clients and error if empty data received", async () => {
    mockedGetClients.mockResolvedValue({ data: [], meta: null });

    const { result } = renderHook(() => useClientData());

    act(() => {
      void result.current.loadClients(1, 10);
    });

    await waitFor(() => {
      expect(result.current.clients).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGetClients).toHaveBeenCalledWith("mock-token-123", 1, 10);
  });

  it("setError updates the error state correctly", () => {
    const { result } = renderHook(() => useClientData());

    act(() => {
      result.current.setError("Test error");
    });

    expect(result.current.error).toBe("Test error");
  });

  it("loadClients throws error to be handled by caller", async () => {
    const errorMessage = "Fatal error";
    mockedGetClients.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useClientData());

    let caughtError: unknown;

    await act(async () => {
      try {
        await result.current.loadClients(1, 10);
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as Error).message).toBe(errorMessage);
  });

  it("falls back to empty array if response.data is undefined", async () => {
    mockedGetClients.mockResolvedValue({ data: undefined, meta: null } as any);

    const { result } = renderHook(() => useClientData());

    act(() => {
      void result.current.loadClients(1, 10);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clients).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("handles non-Error exceptions gracefully", async () => {
    mockedGetClients.mockRejectedValue("String error" as any);

    const { result } = renderHook(() => useClientData());

    act(() => {
      void result.current.loadClients(1, 10).catch(() => {});
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Unknown error");
    expect(result.current.clients).toEqual([]);
  });

  it("clears error when setError is called with null", () => {
    const { result } = renderHook(() => useClientData());

    act(() => {
      result.current.setError("Some error");
    });

    expect(result.current.error).toBe("Some error");

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it("loadClients returns the API response", async () => {
    const response: ClientsApiResponse = { data: mockClients, meta: null };
    mockedGetClients.mockResolvedValue(response);

    const { result } = renderHook(() => useClientData());

    let apiResponse: ClientsApiResponse | undefined;
    await act(async () => {
      apiResponse = await result.current.loadClients(1, 10);
    });

    expect(apiResponse).toEqual(response);
  });
});
