import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useJobProfiles } from "./useJobProfiles";
import * as jobProfileService from "../services/jobProfileService";

vi.spyOn(console, "error").mockImplementation(() => {});

vi.mock("../services/jobProfileService", () => ({
  getAllJobProfilesWithJD: vi.fn(),
}));

describe("useJobProfiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears data when token is null", async () => {
    const { result } = renderHook(() => useJobProfiles(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.jobProfiles).toEqual([]);
    expect(jobProfileService.getAllJobProfilesWithJD).not.toHaveBeenCalled();
  });

  it("loads profiles when token is set", async () => {
    vi.mocked(jobProfileService.getAllJobProfilesWithJD).mockResolvedValue({
      success: true,
      message: "ok",
      data: [{ id: 1, position: "P", experience: "e", overview: "", responsibilities: [], requiredSkills: [], niceToHave: [], techSpecifications: [] }],
    });

    const { result } = renderHook(() => useJobProfiles("tok"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.jobProfiles).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("refetch calls service again", async () => {
    vi.mocked(jobProfileService.getAllJobProfilesWithJD).mockResolvedValue({
      success: true,
      message: "ok",
      data: [],
    });

    const { result } = renderHook(() => useJobProfiles("tok"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(jobProfileService.getAllJobProfilesWithJD).toHaveBeenCalledTimes(2);
  });
});
