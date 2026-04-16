import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useContact from "./useContact";
import type { ContactAddEditPayload } from "../types/contactTypes";

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

const API = import.meta.env.VITE_BASE_URL;
const TOKEN = "mock-token-123";

function mockJsonResponse(ok: boolean, status: number, body: unknown) {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("useContact", () => {
  it("getClientDetails calls GET /client/:id and returns JSON", async () => {
    const payload = { success: true, data: { clientId: 1 } };
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(true, 200, payload) as Response);

    const { result } = renderHook(() => useContact());
    let out: unknown;
    await act(async () => {
      out = await result.current.getClientDetails(TOKEN, 7);
    });

    expect(fetch).toHaveBeenCalledWith(`${API}/client/7`, expect.any(Object));
    expect(out).toEqual(payload);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("getClientDetails sets error on failed response", async () => {
    const errBody = { success: false, error: "E", message: "not found" };
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(false, 404, errBody) as Response);

    const { result } = renderHook(() => useContact());
    await act(async () => {
      try {
        await result.current.getClientDetails(TOKEN, 1);
      } catch {
        /* expected */
      }
    });

    expect(result.current.error).toEqual(errBody);
  });

  it("createContact POSTs JSON body", async () => {
    const created = { success: true, data: { clientContactId: 9 } };
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(true, 200, created) as Response);

    const body: ContactAddEditPayload = {
      clientId: 1,
      contactPersonName: "A",
      designation: "D",
      phone: "1",
      email: "a@b.com",
    };

    const { result } = renderHook(() => useContact());
    let out: unknown;
    await act(async () => {
      out = await result.current.createContact(TOKEN, body);
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/contact`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    expect(out).toEqual(created);
  });

  it("updateContact PATCHes /contact/:clientContactId", async () => {
    const updated = { success: true, message: "ok" };
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(true, 200, updated) as Response);

    const payload: ContactAddEditPayload = {
      clientContactId: 55,
      contactPersonName: "B",
      designation: "X",
      phone: "2",
      email: "b@b.com",
    };

    const { result } = renderHook(() => useContact());
    await act(async () => {
      await result.current.updateContact(TOKEN, payload);
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/contact/55`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          contactPersonName: "B",
          designation: "X",
          phone: "2",
          email: "b@b.com",
        }),
      })
    );
  });

  it("deleteContact DELETEs /contact/:id", async () => {
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(true, 200, { success: true }) as Response);

    const { result } = renderHook(() => useContact());
    await act(async () => {
      await result.current.deleteContact(TOKEN, 99);
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/contact/99`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("getDesignations parses lookup data", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockJsonResponse(true, 200, {
        data: [
          { tag: "designation", value: "Mgr" },
          { tag: "other", value: "x" },
        ],
      }) as Response
    );

    const { result } = renderHook(() => useContact());
    let list: string[] = [];
    await act(async () => {
      list = await result.current.getDesignations(TOKEN);
    });

    expect(list).toEqual(["Mgr"]);
  });

  it("clearError resets error", async () => {
    const errBody = { success: false, error: "E", message: "bad" };
    vi.mocked(fetch).mockResolvedValue(mockJsonResponse(false, 400, errBody) as Response);

    const { result } = renderHook(() => useContact());
    await act(async () => {
      try {
        await result.current.getClientDetails(TOKEN, 1);
      } catch {
        /* expected */
      }
    });
    expect(result.current.error).toEqual(errBody);

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
});
