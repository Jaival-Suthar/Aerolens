import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getOffers,
  createOffer,
  getOfferFormData,
  getOfferDetails,
  deleteOffer,
  terminateOffer,
  reviseOffer,
  updateOfferStatus,
} from "./offerService";

const API = import.meta.env.VITE_BASE_URL as string;

describe("offerService", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("getOffers returns array from root", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 1 }],
    } as Response);
    await expect(getOffers("t")).resolves.toEqual([{ id: 1 }]);
  });

  it("getOffers unwraps offers key", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers: [{ id: 2 }] }),
    } as Response);
    await expect(getOffers("t")).resolves.toEqual([{ id: 2 }]);
  });

  it("createOffer posts JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);
    await createOffer("t", 5, { a: 1 } as never);
    expect(fetch).toHaveBeenCalledWith(
      `${API}/offers/5`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("getOfferFormData GETs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { x: 1 } }),
    } as Response);
    await expect(getOfferFormData("t")).resolves.toEqual({ x: 1 });
  });

  it("getOfferDetails GETs by id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ d: 1 }),
    } as Response);
    await getOfferDetails(9, "t");
    expect(fetch).toHaveBeenCalledWith(
      `${API}/offers/9/details`,
      expect.any(Object)
    );
  });

  it("deleteOffer unwraps data wrapper", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { success: true } }),
    } as Response);
    const r = await deleteOffer(1, "t");
    expect(r).toEqual({ success: true });
  });

  it("terminateOffer unwraps raw action", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);
    const r = await terminateOffer(1, { terminationDate: "a", terminationReason: "b" }, "t");
    expect(r).toEqual({ ok: true });
  });

  it("reviseOffer posts body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
    await reviseOffer(2, { newCTC: 1, newJoiningDate: "d", reason: "r" } as never, "t");
    expect(fetch).toHaveBeenCalledWith(
      `${API}/offers/2/revise`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateOfferStatus posts", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);
    await updateOfferStatus(3, { status: "ACCEPTED" } as never, "t");
    expect(fetch).toHaveBeenCalledWith(
      `${API}/offers/3/status`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("apiFetch throws non-JSON error body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Err",
      json: async () => {
        throw new Error("bad");
      },
    } as Response);
    await expect(getOffers("t")).rejects.toEqual({ message: "Err" });
  });

  it("apiFetch handles 204", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    } as Response);
    const r = await deleteOffer(1, "t");
    expect(r).toEqual({} as never);
  });
});
