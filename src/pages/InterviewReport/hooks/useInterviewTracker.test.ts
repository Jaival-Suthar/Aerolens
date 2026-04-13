import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterviewTrackerReport } from "./useInterviewTracker";
import * as svc from "../services/interviewTrackerService";

vi.mock("../services/interviewTrackerService", () => ({
  getInterviewTrackerReport: vi.fn(),
}));

describe("useInterviewTrackerReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchDefault loads data when token present", async () => {
    vi.mocked(svc.getInterviewTrackerReport).mockResolvedValue({
      data: [{ interviewId: 1 }],
    } as never);

    const { result } = renderHook(() => useInterviewTrackerReport("t"));

    await act(async () => {
      await result.current.fetchDefault();
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fetchDefault returns early without token", async () => {
    const { result } = renderHook(() => useInterviewTrackerReport(null));

    await act(async () => {
      await result.current.fetchDefault();
    });

    expect(svc.getInterviewTrackerReport).not.toHaveBeenCalled();
  });

  it("fetchByDateRange passes params", async () => {
    vi.mocked(svc.getInterviewTrackerReport).mockResolvedValue({ data: [] } as never);

    const { result } = renderHook(() => useInterviewTrackerReport("t"));

    await act(async () => {
      await result.current.fetchByDateRange("a", "b");
    });

    expect(svc.getInterviewTrackerReport).toHaveBeenCalledWith("t", {
      filter: "custom",
      startDate: "a",
      endDate: "b",
    });
  });

  it("fetchWithFilters forwards filter object", async () => {
    vi.mocked(svc.getInterviewTrackerReport).mockResolvedValue({ data: [] } as never);

    const { result } = renderHook(() => useInterviewTrackerReport("t"));

    await act(async () => {
      await result.current.fetchWithFilters({ filter: "today" });
    });

    expect(svc.getInterviewTrackerReport).toHaveBeenCalledWith("t", {
      filter: "today",
    });
  });

  it("sets error message on failure", async () => {
    vi.mocked(svc.getInterviewTrackerReport).mockRejectedValue(
      new Error("boom")
    );

    const { result } = renderHook(() => useInterviewTrackerReport("t"));

    await act(async () => {
      await result.current.fetchDefault();
    });

    expect(result.current.error).toBe("boom");
  });
});
