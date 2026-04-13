import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTechSpecifications } from "./useTechSpecifications";
import * as jobProfileService from "../services/jobProfileService";

vi.spyOn(console, "error").mockImplementation(() => {});

vi.mock("../services/jobProfileService", () => ({
  getTechSpecifications: vi.fn(),
}));

describe("useTechSpecifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads tech specs on mount", async () => {
    vi.mocked(jobProfileService.getTechSpecifications).mockResolvedValue({
      success: true,
      message: "ok",
      data: [{ id: 1, label: "React" }],
    });

    const { result } = renderHook(() => useTechSpecifications("tok"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.techSpecs).toEqual([{ id: 1, label: "React" }]);
  });

  it("sets error on failure", async () => {
    vi.mocked(jobProfileService.getTechSpecifications).mockRejectedValue(
      new Error("nope")
    );

    const { result } = renderHook(() => useTechSpecifications("tok"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("nope");
  });

  it("refetch runs fetch again", async () => {
    vi.mocked(jobProfileService.getTechSpecifications).mockResolvedValue({
      success: true,
      message: "ok",
      data: [],
    });

    const { result } = renderHook(() => useTechSpecifications("tok"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(jobProfileService.getTechSpecifications).toHaveBeenCalledTimes(2);
  });
});
