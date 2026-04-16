import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getInterviewTrackerReport } from "./interviewTrackerService";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

describe("interviewTrackerService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns JSON body on success", async () => {
    const body = { data: [{ id: 1 }] };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => body,
    } as Response);

    const res = await getInterviewTrackerReport("tok");
    expect(res).toEqual(body);
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url.startsWith(`${API_BASE}/interview/report/tracker?`)).toBe(true);
    expect(url).toContain("filter=past7days");
  });

  it("appends custom range when filter is custom", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: [] }),
    } as Response);

    await getInterviewTrackerReport("tok", {
      filter: "custom",
      startDate: "a",
      endDate: "b",
    });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("filter=custom");
    expect(url).toContain("startDate=a");
    expect(url).toContain("endDate=b");
  });

  it("throws parsed JSON on error response", async () => {
    const err = { message: "nope" };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => err,
    } as Response);

    await expect(getInterviewTrackerReport("tok")).rejects.toEqual(err);
  });

  it("uses text body when not JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => "plain",
    } as Response);

    await expect(getInterviewTrackerReport("tok")).rejects.toBe("plain");
  });
});
