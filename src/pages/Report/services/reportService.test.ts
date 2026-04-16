import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getOverallReport,
  getMonthlyReport,
  getDailyReport,
} from "./reportService";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

describe("reportService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getOverallReport returns success payload", async () => {
    const apiData = {
      success: true,
      message: "ok",
      data: { interviewers: [] },
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiData,
    } as Response);

    const res = await getOverallReport("tok");
    expect(res.success).toBe(true);
    expect(res.data).toEqual(apiData.data);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/interview/report/overall`,
      expect.any(Object)
    );
  });

  it("getOverallReport throws on 401", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    await expect(getOverallReport("tok")).rejects.toThrow(/Unauthorized/);
  });

  it("getMonthlyReport appends timezone query", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "m",
        data: {
          summary: {
            total: 0,
            selected: 0,
            rejected: 0,
            pending: 0,
            cancelled: 0,
          },
          interviewers: [],
          interviewTimeStamp: [],
        },
      }),
    } as Response);

    await getMonthlyReport("tok", "2025-01-01", "2025-01-31");
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("/interview/report/monthly?");
    expect(url).toContain("startDate=2025-01-01");
    expect(url).toContain("timezone=");
  });

  it("getDailyReport builds daily query", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "d",
        data: { interviews: [] },
      }),
    } as Response);

    await getDailyReport("tok", "2025-06-15");
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("/interview/report/daily?");
    expect(url).toContain("date=2025-06-15");
  });

  it("throws when API returns success false", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "x" }),
    } as Response);

    await expect(getOverallReport("tok")).rejects.toThrow("x");
  });
});
