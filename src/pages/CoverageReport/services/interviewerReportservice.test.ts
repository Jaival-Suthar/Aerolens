import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getInterviewerWorkloadReport } from "./interviewerReportservice";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

describe("interviewerReportservice", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns result.data from envelope", async () => {
    const workload = { interviewers: [{ id: 1 }] };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: workload }),
    } as Response);

    const res = await getInterviewerWorkloadReport("tok", {
      filter: "past7days",
    });
    expect(res).toEqual(workload);
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("interviewer-workload");
    expect(url).toContain("timezone=");
  });

  it("throws JSON error when not ok", async () => {
    const err = { message: "x" };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => err,
    } as Response);

    await expect(
      getInterviewerWorkloadReport("tok", { filter: "today" })
    ).rejects.toEqual(err);
  });
});
