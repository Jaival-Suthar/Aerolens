import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getTechSpecifications,
  getAllJobProfilesWithJD,
  deleteJobProfile,
  getJobProfileById,
  createJobProfile,
  updateJobProfile,
} from "./jobProfileService";
import type { ApiJobProfile } from "../types/jobProfileTypes";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

const minimalProfile: ApiJobProfile = {
  jobProfileId: 1,
  position: "Dev",
  experience: "2y",
  overview: null,
  responsibilities: "a\nb",
  requiredSkills: null,
  niceToHave: null,
  jdFileName: null,
  jdOriginalName: null,
  jdUploadDate: null,
  createdAt: "t",
  updatedAt: "t",
  techSpecifications: [
    { techSpecificationId: 10, techSpecificationName: "React" },
  ],
};

describe("jobProfileService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getTechSpecifications filters techSpecification tag", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: [
          { tag: "techSpecification", lookupKey: 1, value: "TS" },
          { tag: "other", lookupKey: 2, value: "X" },
        ],
      }),
    } as Response);

    const res = await getTechSpecifications("tok");
    expect(res.data).toEqual([{ id: 1, label: "TS" }]);
  });

  it("getAllJobProfilesWithJD maps profiles", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: [minimalProfile],
      }),
    } as Response);

    const res = await getAllJobProfilesWithJD("tok");
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe(1);
    expect(res.data[0].responsibilities).toEqual(["a", "b"]);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/jobProfile`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("deleteJobProfile rejects invalid id", async () => {
    await expect(deleteJobProfile("tok", 0 as unknown as number)).rejects.toThrow(
      "Invalid job profile id"
    );
  });

  it("deleteJobProfile sends DELETE", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "ok", data: null }),
    } as Response);

    await deleteJobProfile("tok", 3);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/jobProfile/3`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("getJobProfileById returns mapped profile", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: minimalProfile,
      }),
    } as Response);

    const res = await getJobProfileById("tok", 1);
    expect(res.data.id).toBe(1);
  });

  it("throws raw body when not success", async () => {
    const body = { success: false };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => body,
    } as Response);

    await expect(getAllJobProfilesWithJD("tok")).rejects.toEqual(body);
  });

  it("createJobProfile posts FormData without JSON content-type in body check", async () => {
    const fd = new FormData();
    fd.append("position", "Dev");
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        message: "ok",
        data: minimalProfile,
      }),
    } as Response);

    await createJobProfile("tok", fd);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/jobProfile`,
      expect.objectContaining({ method: "POST", body: fd })
    );
  });

  it("updateJobProfile PATCHes with FormData", async () => {
    const fd = new FormData();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "ok",
        data: minimalProfile,
      }),
    } as Response);

    await updateJobProfile("tok", 9, fd);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/jobProfile/9`,
      expect.objectContaining({ method: "PATCH" })
    );
  });
});
