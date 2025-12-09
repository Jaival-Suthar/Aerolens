import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "./clientService";
import type { ClientsApiResponse, ClientType } from "../types/clientTypes";

// --- Setup + Mocks ---
beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

global.fetch = vi.fn() as any;

const BASE_URL = import.meta.env.VITE_PREPROD_URL;
const TOKEN = "mock-token-123";

describe("clientService API calls", () => {
  // ---------------- getClients ----------------
  describe("getClients", () => {
    it("fetches clients successfully", async () => {
      const mockResponse: ClientsApiResponse = {
        data: [{ clientId: 1, clientName: "Test", address: "Earth" }],
        meta: { currentPage: 1, totalPages: 1, totalRecords: 1, limit: 10 },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const res = await getClients(TOKEN, 1, 5);
      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/client?page=1&limit=5`,
        expect.objectContaining({
          credentials: "include",
          headers: expect.objectContaining({
            Authorization: `Bearer ${TOKEN}`,
          }),
        })
      );
      expect(res).toEqual(mockResponse);
    });

    it("throws error if response not ok", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("Not Found"),
      });

      await expect(getClients(TOKEN, 2, 2)).rejects.toThrow(
        /Failed to fetch clients: 404 Not Found/
      );
    });
  });

  // ---------------- createClient ----------------
  describe("createClient", () => {
    it("successfully creates new client", async () => {
      const payload = { name: "Elon", address: "Mars" };
      const mockResp: ClientType = {
        clientId: 2,
        clientName: "Elon",
        address: "Mars",
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResp),
      });

      const res = await createClient(TOKEN, payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/client`,
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: expect.objectContaining({
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(payload),
        })
      );
      expect(res).toEqual(mockResp);
    });

    it("throws error if missing name/address", async () => {
      await expect(
        createClient(TOKEN, { name: "", address: "Test" })
      ).rejects.toThrow(/Name and address are required/);

      await expect(
        createClient(TOKEN, { name: "Test", address: "" })
      ).rejects.toThrow(/Name and address are required/);
    });

    it("throws error if API response not ok", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue("Bad Payload"),
      });

      await expect(
        createClient(TOKEN, { name: "Ali", address: "Moon" })
      ).rejects.toThrow(/Failed to create client: 400 Bad Payload/);
    });
  });

  // ---------------- updateClient ----------------
  describe("updateClient", () => {
    it("updates client successfully with name/address", async () => {
      const payload = { id: 5, name: "New Name", address: "Updated Addr" };
      const mockResp: ClientType = {
        clientId: 5,
        clientName: "New Name",
        address: "Updated Addr",
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResp),
      });

      const res = await updateClient(TOKEN, payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/client/5`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer ${TOKEN}`,
          }),
        })
      );
      expect(res).toEqual(mockResp);
    });

    it("throws error if missing id", async () => {
      await expect(
        updateClient(TOKEN, { id: undefined as any })
      ).rejects.toThrow(/Client ID is required/);
    });

    it("throws error if missing name/address", async () => {
      await expect(
        updateClient(TOKEN, { id: 7 } as any)
      ).rejects.toThrow(/must be provided for update/);
    });

    it("throws error if API response not ok", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("DB fail"),
      });

      await expect(
        updateClient(TOKEN, { id: 11, name: "Update" })
      ).rejects.toThrow(/Failed to update client: 500 DB fail/);
    });
  });

  // ---------------- deleteClient ----------------
  describe("deleteClient", () => {
    it("successfully deletes client by id", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
      });

      await expect(deleteClient(TOKEN, 99)).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/client/99`,
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
          headers: expect.objectContaining({
            Authorization: `Bearer ${TOKEN}`,
          }),
        })
      );
    });

    it("throws error for invalid id", async () => {
      await expect(
        deleteClient(TOKEN, undefined as any)
      ).rejects.toThrow(/Valid client ID is required/);
      await expect(
        deleteClient(TOKEN, "abc" as any)
      ).rejects.toThrow(/Valid client ID is required/);
    });

    it("throws if API not ok", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue("Delete failed"),
      });

      await expect(deleteClient(TOKEN, 42)).rejects.toThrow(
        /Failed to delete client/
      );
    });
  });

    // ---------------- Extra Edge Cases ----------------
  describe("edge cases", () => {
    it("getClients: handles thrown fetch rejection gracefully", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network down"));

      await expect(getClients("mock-token-123", 1, 10)).rejects.toThrow(
        /Network down/
      );
    });

    it("getClients: works without accessToken (no Authorization header)", async () => {
      const mockResp: ClientsApiResponse = {
        data: [],
        meta: null,
      };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResp),
      });

      await getClients(null, 1, 10);

      const [url, opts] = (global.fetch as any).mock.calls[0];
      expect(url).toContain("/client?page=1&limit=10");
      expect(opts.headers.Authorization).toBeUndefined();
    });

    it("createClient: catches rejected fetch error and rethrows", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Server crash"));
      const payload = { name: "Edge", address: "Case" };

      await expect(createClient("mock-token-123", payload)).rejects.toThrow(
        /Server crash/
      );
    });

    it("updateClient: returns unknown error if response.text() fails", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockRejectedValue(new Error("text() failed")),
      });

      await expect(
        updateClient("mock-token-123", { id: 9, name: "Err" })
      ).rejects.toThrow(/Failed to update client: 500 Unknown error/);
    });

    it("deleteClient: catches network error rejection", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Connection reset"));

      await expect(deleteClient("mock-token-123", 7)).rejects.toThrow(
        /Connection reset/
      );
    });

    it("deleteClient: passes when accessToken is null (no Authorization header)", async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      await deleteClient(null, 10);
      const [, opts] = (global.fetch as any).mock.calls[0];
      expect(opts.headers.Authorization).toBeUndefined();
    });
  });

});
