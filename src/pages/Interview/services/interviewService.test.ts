import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getInterviewFormData,
  getInterviewerDailyCapacity,
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  finalizeInterview,
  getFinalizeInterviewData,
} from "./interviewService";

const BASE = import.meta.env.VITE_BASE_URL as string;

function okJson(data: unknown) {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => data,
  } as Response;
}

describe("interviewService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("getInterviewFormData GETs create-data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({ ok: true }));
    await expect(getInterviewFormData("tok")).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/create-data`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("getInterviewerDailyCapacity builds query", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({ cap: 1 }));
    await getInterviewerDailyCapacity("tok", 3, "2025-01-01", "Asia/Kolkata");
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("/interview/capacity/interviewer-daily/3?");
    expect(url).toContain("date=2025-01-01");
  });

  it("getInterviews GETs list", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson([]));
    await getInterviews("tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("getInterviewById GETs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({ id: 1 }));
    await getInterviewById(7, "tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/7`,
      expect.any(Object)
    );
  });

  it("createInterview POSTs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({}));
    await createInterview(1, { x: 1 }, "tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/1`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateInterview PATCHes", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({}));
    await updateInterview(2, { y: 2 }, "tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/2`,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("deleteInterview DELETEs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({}));
    await deleteInterview(3, "tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/3`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("finalizeInterview PUTs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({ done: true }));
    await finalizeInterview(4, { notes: "n" } as never, "tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/4/finalize`,
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("getFinalizeInterviewData GETs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(okJson({}));
    await getFinalizeInterviewData(5, "tok");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/interview/5/finalize-data`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("checkStatus uses text when not JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => "plain",
    } as Response);
    await expect(getInterviews("tok")).rejects.toBe("plain");
  });
});
