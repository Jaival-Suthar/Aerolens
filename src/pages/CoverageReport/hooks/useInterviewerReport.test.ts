import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useInterviewerReport } from "./useInterviewerReport";
import * as svc from "../services/interviewerReportservice";

vi.mock("../services/interviewerReportservice", () => ({
  getInterviewerWorkloadReport: vi.fn(),
}));

describe("useInterviewerReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads on mount when token is set", async () => {
    vi.mocked(svc.getInterviewerWorkloadReport).mockResolvedValue({
      interviewers: [{ interviewerId: 1 }],
    });

    const { result } = renderHook(() => useInterviewerReport("tok"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(svc.getInterviewerWorkloadReport).toHaveBeenCalledWith("tok", {
      filter: "past7days",
    });
  });

  it("fetchByDateRange updates data", async () => {
    vi.mocked(svc.getInterviewerWorkloadReport).mockResolvedValue({
      interviewers: [],
    });

    const { result } = renderHook(() => useInterviewerReport("tok"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(svc.getInterviewerWorkloadReport).mockResolvedValueOnce({
      interviewers: [{ interviewerId: 2 }],
    });

    await act(async () => {
      await result.current.fetchByDateRange("x", "y");
    });

    expect(result.current.data[0].interviewerId).toBe(2);
  });

  it("does not fetch when token is null", async () => {
    const { result } = renderHook(() => useInterviewerReport(null));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(svc.getInterviewerWorkloadReport).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });
});
