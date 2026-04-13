import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { locationService } from "./locationService";

const API = import.meta.env.VITE_BASE_URL as string;

describe("locationService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("getAll GETs /location", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as Response);
    await locationService.getAll("t");
    expect(fetch).toHaveBeenCalledWith(`${API}/location`, expect.any(Object));
  });

  it("getById throws on invalid id", async () => {
    await expect(locationService.getById("t", 0)).rejects.toThrow("Invalid locationId");
  });

  it("getById GETs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
    await locationService.getById("t", 5);
    expect(fetch).toHaveBeenCalledWith(`${API}/location/5`, expect.any(Object));
  });

  it("create validates city and country", async () => {
    await expect(
      locationService.create("t", { city: " ", country: "IN" })
    ).rejects.toThrow("Validation failed");
  });

  it("create POSTs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({}),
    } as Response);
    await locationService.create("t", { city: "Mumbai", country: "IN" });
    expect(fetch).toHaveBeenCalledWith(
      `${API}/location`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("patch validates id and payload", async () => {
    await expect(locationService.patch("t", 0, { city: "x" })).rejects.toThrow(
      "Invalid locationId"
    );
    await expect(locationService.patch("t", 1, {})).rejects.toThrow(
      "At least one field"
    );
  });

  it("patch sends PATCH", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
    await locationService.patch("t", 2, { city: "Pune" });
    expect(fetch).toHaveBeenCalledWith(
      `${API}/location/2`,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("delete validates id", async () => {
    await expect(locationService.delete("t", 0)).rejects.toThrow("Invalid locationId");
  });

  it("delete sends DELETE", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
    await locationService.delete("t", 3);
    expect(fetch).toHaveBeenCalledWith(
      `${API}/location/3`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("checkStatus throws with body text", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "missing",
      statusText: "Not Found",
    } as Response);
    await expect(locationService.getAll("t")).rejects.toThrow("HTTP 404");
  });
});
