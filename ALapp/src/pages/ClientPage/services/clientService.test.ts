import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "./clientService";
import type { ClientsApiResponse, ClientType } from "../types/clientTypes";

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to force global fetch to type any
global.fetch = vi.fn()

describe("clientService API calls", () => {
  describe("getClients", () => {
    it("fetches clients successfully", async () => {
      const mockResponse: ClientsApiResponse = {
        data: [{ clientId: 1, clientName: "Test", address: "Earth" }],
        meta: { currentPage: 1, totalPages: 1, totalRecords: 1 , limit: 10},
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const res = await getClients(1, 5);
      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/client?page=1&limit=5`
      );
      expect(res).toEqual(mockResponse);
    });

    it("throws error if response not ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("Not Found"),
      });

      await expect(getClients(2, 2)).rejects.toThrow(
        /Failed to fetch clients: 404 Not Found/
      );
    });
  });

  describe("createClient", () => {
    it("successfully creates new client", async () => {
      const payload = { name: "Elon", address: "Mars" };
      const mockResp: ClientType = { clientId: 2, clientName: "Elon", address: "Mars" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResp),
      });

      const res = await createClient(payload);
      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/client`,
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: JSON.stringify(payload),
        })
      );
      expect(res).toEqual(mockResp);
    });

    it("throws error if missing name/address", async () => {
      await expect(createClient({ name: "", address: "Test" })).rejects.toThrow(
        /Name and address are required/
      );
      await expect(createClient({ name: "Test", address: "" })).rejects.toThrow(
        /Name and address are required/
      );
    });

    it("throws error if API response not ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue("Bad Payload"),
      });

      await expect(
        createClient({ name: "Ali", address: "Moon" })
      ).rejects.toThrow(/Failed to create client: 400 Bad Payload/);
    });
  });

  describe("updateClient", () => {
    it("updates client successfully with name/address", async () => {
      const payload = { id: 5, name: "New Name", address: "Updated Addr" };
      const mockResp: ClientType = { clientId: 5, clientName: "New Name", address: "Updated Addr" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResp),
      });

      const res = await updateClient(payload);
      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/client/5`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.any(Object),
        })
      );
      expect(res).toEqual(mockResp);
    });

    it("throws error if missing id", async () => {
      await expect(updateClient({ id: undefined as any })).rejects.toThrow(
        /Client ID is required/
      );
    });

    it("throws error if missing name/address", async () => {
      await expect(updateClient({ id: 7 })).rejects.toThrow(
        /must be provided for update/
      );
    });

    it("throws error if API response not ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("DB fail"),
      });

      await expect(
        updateClient({ id: 11, name: "Update" })
      ).rejects.toThrow(/Failed to update client: 500 DB fail/);
    });
  });

  describe("deleteClient", () => {
    it("successfully deletes client by id", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      });

      await expect(deleteClient(99)).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/client/99`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws error for invalid id", async () => {
      await expect(deleteClient(undefined as any)).rejects.toThrow(
        /Valid client ID is required/
      );
      await expect(deleteClient("abc" as any)).rejects.toThrow(
        /Valid client ID is required/
      );
    });

    it("throws if API not ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue("Delete failed"),
      });

      await expect(deleteClient(42)).rejects.toThrow(/Failed to delete client/);
    });
  });
});
