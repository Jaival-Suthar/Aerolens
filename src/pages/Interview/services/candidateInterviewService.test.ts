import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getInterviewsByCandidate } from "./candidateInterviewService";

const BASE = import.meta.env.VITE_BASE_URL;

describe("candidateInterviewService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    const body = {
      success: true,
      message: "ok",
      data: {
        candidateId: 1,
        totalRounds: 1,
        data: [],
      },
    };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as Response);

    const res = await getInterviewsByCandidate(42, "token");
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/interview/candidate/42`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      })
    );
    expect(res).toEqual(body);
  });

  it("throws parsed JSON body when request fails with JSON", async () => {
    const errBody = { success: false, message: "nope" };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => errBody,
      text: async () => JSON.stringify(errBody),
    } as Response);

    await expect(getInterviewsByCandidate(1, "t")).rejects.toEqual(errBody);
  });

  it("throws text body when response is not JSON", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      headers: new Headers({ "content-type": "text/plain" }),
      json: async () => ({}),
      text: async () => "plain error",
    } as Response);

    await expect(getInterviewsByCandidate(1, "t")).rejects.toBe("plain error");
  });

  it("returns text body for successful non-JSON responses", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "text/plain" }),
      json: async () => ({}),
      text: async () => "ok-body",
    } as Response);

    const res = await getInterviewsByCandidate(9, "tok");
    expect(res).toBe("ok-body");
  });

  it("omits Authorization header when token is empty", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true, message: "ok", data: { candidateId: 1, totalRounds: 0, data: [] } }),
      text: async () => "",
    } as Response);

    await getInterviewsByCandidate(3, "");

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/interview/candidate/3`,
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
  });
});
