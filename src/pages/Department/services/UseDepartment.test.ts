import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "./useDepartment";

const API_URL = import.meta.env.VITE_BASE_URL as string;

describe("useDepartment", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getDepartments unwraps data wrapper", async () => {
    const body = { data: { departments: [] } };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => body,
    } as Response);

    const result = await getDepartments("tok", 7);
    expect(result).toEqual(body.data);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/client/7`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("addDepartment posts JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: { departmentId: 1 } }),
    } as Response);

    await addDepartment("tok", {
      clientId: 1,
      departmentName: "Eng",
      departmentDescription: "D",
    });
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/department`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateDepartment sends PATCH", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: {} }),
    } as Response);

    await updateDepartment("tok", {
      departmentId: 3,
      departmentName: "X",
      departmentDescription: "Y",
    });
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/department/3`,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("deleteDepartment sends DELETE", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    } as Response);

    await deleteDepartment("tok", 9);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/department/9`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("propagates backend error JSON", async () => {
    const err = { message: "bad" };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => err,
    } as Response);

    await expect(getDepartments("tok", 1)).rejects.toEqual(err);
  });
});
