import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  mapApiMember,
  getMembers,
  getMemberById,
  patchMember,
  getMemberFormData,
  deleteMember,
} from "./memberService";
import type { MemberApi } from "../types/memberTypes";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

const apiMember: MemberApi = {
  memberId: 1,
  memberName: "N",
  memberContact: "c",
  email: "e@e.com",
  designationId: 2,
  designation: "D",
  isRecruiter: true,
  isInterviewer: false,
  interviewerCapacity: null,
  vendorId: null,
  vendorName: null,
  clientId: null,
  clientName: null,
  organisation: "Org",
  city: "C",
  country: "IN",
  skills: [],
  isActive: true,
  lastLogin: null,
  createdAt: null,
  updatedAt: null,
};

describe("memberService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mapApiMember maps location from city", () => {
    const m = mapApiMember(apiMember);
    expect(m.location.city).toBe("C");
    expect(m.location.country).toBe("IN");
    expect(m.skills).toEqual([]);
  });

  it("mapApiMember uses cityName when present on payload", () => {
    const m = mapApiMember({
      ...apiMember,
      cityName: "Mumbai",
    } as MemberApi & { cityName: string });
    expect(m.location.city).toBe("Mumbai");
  });

  it("getMembers returns mapped list", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: [apiMember],
      }),
    } as Response);

    const res = await getMembers("tok");
    expect(res.data).toHaveLength(1);
    expect(res.data[0].memberId).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/member`,
      expect.any(Object)
    );
  });

  it("getMembers throws on 401", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    await expect(getMembers("tok")).rejects.toThrow(/Unauthorized/);
  });

  it("getMemberById maps single member", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: apiMember,
      }),
    } as Response);

    const res = await getMemberById("tok", 1);
    expect(res.data.memberId).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/member/1`,
      expect.any(Object)
    );
  });

  it("patchMember throws without token or id", async () => {
    await expect(patchMember(null, 1, {} as never)).rejects.toThrow("Access token");
    await expect(patchMember("t", 0, {} as never)).rejects.toThrow("Invalid memberId");
  });

  it("patchMember maps response on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: apiMember,
      }),
    } as Response);

    const res = await patchMember("tok", 1, { memberName: "X" } as never);
    expect(res.data.memberName).toBe("N");
  });

  it("patchMember attaches validationErrors from details", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: "bad",
        details: { validationErrors: [{ field: "email", message: "invalid" }] },
      }),
    } as Response);

    try {
      await patchMember("tok", 1, {} as never);
      expect.fail("should throw");
    } catch (e: unknown) {
      const err = e as Error & { validationErrors?: unknown[] };
      expect(err.validationErrors).toHaveLength(1);
    }
  });

  it("getMemberFormData normalizes designations", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          designations: [{ designationId: 1, designationName: "Recruiter" }],
          vendors: [],
          clients: [],
          skills: [],
          locations: [],
        },
      }),
    } as Response);

    const fd = await getMemberFormData("tok");
    expect(fd.designations).toEqual([{ lookupKey: 1, value: "Recruiter" }]);
  });

  it("deleteMember throws on bad args", async () => {
    await expect(deleteMember(null, 1)).rejects.toThrow("Access token");
    await expect(deleteMember("t", 0)).rejects.toThrow("Invalid memberId");
  });

  it("deleteMember succeeds", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "deleted" }),
    } as Response);

    const r = await deleteMember("tok", 2);
    expect(r.success).toBe(true);
  });
});
