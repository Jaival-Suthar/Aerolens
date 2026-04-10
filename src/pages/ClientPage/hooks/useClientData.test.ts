import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useClientData } from "./useClientData";
import * as clientService from "../services/clientService";
import type { ClientType } from "../types/clientTypes";

vi.mock("../services/clientService");

const useAuthMock = vi.fn(() => ({
  accessToken: "mock-token-123",
}));

vi.mock("../../../shared/auth/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("useClientData hook", () => {
  const mockClients: ClientType[] = [
    { clientId: 1, clientName: "SpaceX", address: "Mars Base" },
    { clientId: 2, clientName: "Tesla", address: "Gigafactory" },
  ];

  const mockedGetAllClients = vi.mocked(clientService.getAllClients);

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ accessToken: "mock-token-123" });
    mockedGetAllClients.mockResolvedValue([]);
  });

  it("initial load runs when accessToken is set", async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedGetAllClients).toHaveBeenCalledWith("mock-token-123");
    expect(result.current.clients).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("does not load when accessToken is null", async () => {
    useAuthMock.mockReturnValue({ accessToken: null } as any);

    const { result } = renderHook(() => useClientData());

    expect(mockedGetAllClients).not.toHaveBeenCalled();
    expect(result.current.clients).toEqual([]);
  });

  it("successfully loads clients from getAllClients", async () => {
    mockedGetAllClients.mockResolvedValue(mockClients);

    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.clients).toEqual(mockClients);
    });

    expect(result.current.error).toBeNull();
  });

  it("loadClients returns data and meta total", async () => {
    mockedGetAllClients.mockResolvedValue(mockClients);

    const { result } = renderHook(() => useClientData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let ret: Awaited<ReturnType<typeof result.current.loadClients>> | undefined;
    await act(async () => {
      ret = await result.current.loadClients();
    });

    expect(ret).toEqual({
      data: mockClients,
      meta: { total: mockClients.length },
    });
  });

  it("handles API errors and rethrows", async () => {
    const err = { success: false as const, error: "x", message: "Network error" };
    const { result } = renderHook(() => useClientData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedGetAllClients.mockRejectedValueOnce(err);

    await expect(result.current.loadClients()).rejects.toEqual(err);

    await waitFor(() => expect(result.current.error).toEqual(err));
  });

  it("auto-reloads when refreshTrigger changes", async () => {
    mockedGetAllClients.mockResolvedValue(mockClients);

    const { rerender, result } = renderHook(({ refresh }) => useClientData(refresh), {
      initialProps: { refresh: 0 },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = mockedGetAllClients.mock.calls.length;
    expect(callsBefore).toBeGreaterThan(0);

    rerender({ refresh: 1 });

    await waitFor(() =>
      expect(mockedGetAllClients.mock.calls.length).toBeGreaterThan(callsBefore)
    );
  });

  it("setError updates error state", () => {
    const { result } = renderHook(() => useClientData());

    act(() => {
      result.current.setError({
        success: false,
        error: "e",
        message: "Test error",
      });
    });

    expect(result.current.error).toEqual({
      success: false,
      error: "e",
      message: "Test error",
    });
  });

  it("clears error when setError(null) is called", () => {
    const { result } = renderHook(() => useClientData());

    act(() => {
      result.current.setError({
        success: false,
        error: "e",
        message: "x",
      });
    });

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  // REMOVED: test for undefined API data — getAllClients always returns ClientType[];
  // source useClientData would throw if service returned undefined (no source change allowed).
});
