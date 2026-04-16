import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterviewData } from "./useInterviewData";
import * as reportService from "../services/reportService";

vi.spyOn(console, "error").mockImplementation(() => {});

vi.mock("../services/reportService", () => ({
  getMonthlyReport: vi.fn(),
  getOverallReport: vi.fn(),
  getDailyReport: vi.fn(),
}));

describe("useInterviewData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchMonthlyReport populates state on success", async () => {
    const summary = {
      total: 1,
      selected: 0,
      rejected: 0,
      pending: 0,
      cancelled: 0,
    };
    vi.mocked(reportService.getMonthlyReport).mockResolvedValue({
      success: true,
      message: "ok",
      data: {
        summary,
        interviewers: [{ id: 1 }],
        interviewTimeStamp: [{ t: 1 }],
      },
    });

    const { result } = renderHook(() => useInterviewData("tok"));

    await act(async () => {
      await result.current.fetchMonthlyReport("2025-01-01", "2025-01-31");
    });

    expect(result.current.cumulativeSummary).toEqual(summary);
    expect(result.current.monthlyInterviewers).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });

  it("fetchMonthlyReport no-ops when success false", async () => {
    vi.mocked(reportService.getMonthlyReport).mockResolvedValue({
      success: false,
      message: "x",
      data: {} as never,
    });

    const { result } = renderHook(() => useInterviewData("tok"));

    await act(async () => {
      await result.current.fetchMonthlyReport("a", "b");
    });

    expect(result.current.monthlyInterviewers).toEqual([]);
  });

  it("fetchOverallInterviewers sets list", async () => {
    vi.mocked(reportService.getOverallReport).mockResolvedValue({
      success: true,
      message: "ok",
      data: { interviewers: [{ id: 2 }] },
    });

    const { result } = renderHook(() => useInterviewData("tok"));

    await act(async () => {
      await result.current.fetchOverallInterviewers();
    });

    expect(result.current.overallInterviewers).toHaveLength(1);
  });

  it("fetchDailyReport sets daily interviews", async () => {
    vi.mocked(reportService.getDailyReport).mockResolvedValue({
      success: true,
      message: "ok",
      data: { interviews: [{ id: 3 }] },
    });

    const { result } = renderHook(() => useInterviewData("tok"));

    await act(async () => {
      await result.current.fetchDailyReport("2025-01-02");
    });

    expect(result.current.dailyInterviews).toHaveLength(1);
  });
});
