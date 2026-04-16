import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { VendorService } from "./useVendor";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

describe("VendorService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getAllVendors returns parsed JSON on success", async () => {
    const payload = { data: [{ vendorId: 1, vendorName: "Acme" }] };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => payload,
    } as Response);

    const result = await VendorService.getAllVendors("tok");
    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/vendor`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("createVendor sends JSON body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: { vendorId: 2 } }),
    } as Response);

    await VendorService.createVendor("tok", {
      vendorName: "V",
      vendorPhone: null,
      vendorEmail: null,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/vendor`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          vendorName: "V",
          vendorPhone: null,
          vendorEmail: null,
        }),
      })
    );
  });

  it("updateVendor PATCHes by id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ data: {} }),
    } as Response);

    await VendorService.updateVendor("tok", 5, { vendorName: "X" });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/vendor/5`,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("deleteVendor sends DELETE", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: async () => ({}),
    } as Response);

    await VendorService.deleteVendor("tok", 9);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/vendor/9`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("returns empty object on 204", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: async () => ({}),
    } as Response);

    const out = await VendorService.deleteVendor("tok", 1);
    expect(out).toEqual({});
  });

  it("throws TOKEN_EXPIRED body on 401 when error matches", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: "TOKEN_EXPIRED" }),
    } as Response);

    await expect(VendorService.getAllVendors("tok")).rejects.toEqual({
      error: "TOKEN_EXPIRED",
    });
  });

  it("throws text body when response is not JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => "oops",
    } as Response);

    await expect(VendorService.getAllVendors("tok")).rejects.toEqual({
      message: "oops",
    });
  });
});
