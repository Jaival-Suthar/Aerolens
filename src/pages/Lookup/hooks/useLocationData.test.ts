import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useLocationData } from "./useLocationData";
import { locationService } from "../services/locationService";

vi.mock("../services/locationService", () => ({
  locationService: {
    getAll: vi.fn(),
  },
}));

describe("useLocationData", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(locationService.getAll).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sets error and stops loading when no access token", async () => {
    const { result } = renderHook(() => useLocationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("No access token found");
    expect(result.current.data).toEqual([]);
    expect(locationService.getAll).not.toHaveBeenCalled();
  });

  it("loads nested data array when API returns { data: [...] }", async () => {
    localStorage.setItem("accessToken", "tok");
    vi.mocked(locationService.getAll).mockResolvedValue({
      success: true,
      message: "ok",
      data: { data: [{ locationId: 1, city: "X", country: "Y" }] },
    });

    const { result } = renderHook(() => useLocationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(locationService.getAll).toHaveBeenCalledWith("tok");
    expect(result.current.data).toEqual([
      { locationId: 1, city: "X", country: "Y" },
    ]);
    expect(result.current.error).toBeNull();
  });

  it("uses empty list when response data is not nested", async () => {
    localStorage.setItem("accessToken", "tok");
    vi.mocked(locationService.getAll).mockResolvedValue({
      success: true,
      message: "ok",
      data: { locationId: 1, city: "X", country: "Y" },
    });

    const { result } = renderHook(() => useLocationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it("uses empty list when response data is null", async () => {
    localStorage.setItem("accessToken", "tok");
    vi.mocked(locationService.getAll).mockResolvedValue({
      success: true,
      message: "ok",
      data: null,
    });

    const { result } = renderHook(() => useLocationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it("maps service errors and clears data", async () => {
    localStorage.setItem("accessToken", "tok");
    vi.mocked(locationService.getAll).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useLocationData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("boom");
    expect(result.current.data).toEqual([]);
  });

  it("refetch reloads data", async () => {
    localStorage.setItem("accessToken", "tok");
    vi.mocked(locationService.getAll).mockResolvedValue({
      success: true,
      message: "ok",
      data: { data: [] },
    });

    const { result } = renderHook(() => useLocationData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(locationService.getAll).mockResolvedValue({
      success: true,
      message: "ok",
      data: { data: [{ locationId: 2, city: "Z", country: "W" }] },
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(locationService.getAll).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual([
      { locationId: 2, city: "Z", country: "W" },
    ]);
  });
});
