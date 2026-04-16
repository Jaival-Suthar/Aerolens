import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { registerUser, fetchMemberCreateData } from "./useSignup";

const API_URL = import.meta.env.VITE_BASE_URL as string;

const form = {
  fullName: "A B",
  contactNumber: "+1234567890",
  email: "a@b.com",
  password: "secret",
  confirmPassword: "secret",
  designationId: 1,
  vendorId: null,
  isRecruiter: true,
  isInterviewer: false,
};

describe("useSignup service", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registerUser returns data on success", async () => {
    const ok = { success: true, message: "ok", data: {} };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ok,
    } as Response);

    const result = await registerUser(form, "token");
    expect(result).toEqual(ok);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/register`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("registerUser throws ApiError shape on HTTP error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: "EMAIL_EXISTS",
        message: "taken",
      }),
    } as Response);

    await expect(registerUser(form, "token")).rejects.toMatchObject({
      success: false,
      error: "EMAIL_EXISTS",
    });
  });

  it("registerUser throws when success false with 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "nope" }),
    } as Response);

    await expect(registerUser(form, "token")).rejects.toMatchObject({
      success: false,
    });
  });

  it("registerUser handles invalid JSON via parseJsonSafely", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("bad json");
      },
    } as Response);

    await expect(registerUser(form, "token")).rejects.toMatchObject({
      error: "INVALID_RESPONSE",
    });
  });

  it("fetchMemberCreateData returns nested data", async () => {
    const data = { designations: [] };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data }),
    } as Response);

    await expect(fetchMemberCreateData("t")).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/member/create-data`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("fetchMemberCreateData throws on failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: "fail" }),
    } as Response);

    await expect(fetchMemberCreateData("t")).rejects.toMatchObject({
      success: false,
    });
  });
});
