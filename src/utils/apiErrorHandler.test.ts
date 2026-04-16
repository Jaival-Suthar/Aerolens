import { describe, it, expect, vi } from "vitest";
import { normalizeApiError } from "./apiErrorHandler";

describe("normalizeApiError", () => {
  it("returns parsed JSON body when response.json succeeds", async () => {
    const payload = { success: false, error: "X", message: "Bad" };
    const response = {
      json: vi.fn().mockResolvedValue(payload),
    } as unknown as Response;

    await expect(normalizeApiError(response)).resolves.toEqual(payload);
    expect(response.json).toHaveBeenCalledTimes(1);
  });

  it("returns fallback ApiError when json throws", async () => {
    const response = {
      json: vi.fn().mockRejectedValue(new SyntaxError("invalid json")),
    } as unknown as Response;

    await expect(normalizeApiError(response)).resolves.toEqual({
      success: false,
      error: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again later.",
    });
  });
});
