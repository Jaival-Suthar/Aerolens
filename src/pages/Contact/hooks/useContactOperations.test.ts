import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContactOperations } from "./useContactOperations";
import type { Contact, Client } from "../types/contactTypes";

const mockCreateContact = vi.fn();
const mockUpdateContact = vi.fn();
const mockDeleteContact = vi.fn();

vi.mock("../../../shared/auth/AuthContext", () => ({
  useAuth: () => ({
    accessToken: "mock-token-123",
  }),
}));

vi.mock("../services/useContact", () => ({
  default: () => ({
    createContact: mockCreateContact,
    updateContact: mockUpdateContact,
    deleteContact: mockDeleteContact,
  }),
}));

const MOCK_CLIENT: Client = { clientId: 1, clientName: "Mock Client" };

const MOCK_CONTACT_PAYLOAD = {
  contactPersonName: "John Doe",
  designation: "Manager",
  phone: "555-1234",
  email: "john@example.com",
};

const MOCK_EDIT_CONTACT = {
  clientContactId: 101,
  clientId: 1,
  contactPersonName: "Jane Smith",
  designation: "CEO",
} as Contact;

describe("useContactOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateContact.mockResolvedValue({ success: true, message: "Contact added successfully" });
    mockUpdateContact.mockResolvedValue({ success: true, message: "Contact updated successfully" });
    mockDeleteContact.mockResolvedValue({ success: true, message: "Contact deleted successfully" });
  });

  const setupHook = () => renderHook(() => useContactOperations());

  it("initializes refreshTrigger to 0 and increments it when triggerRefresh is called", () => {
    const { result } = setupHook();

    expect(result.current.refreshTrigger).toBe(0);

    act(() => {
      result.current.triggerRefresh();
    });

    expect(result.current.refreshTrigger).toBe(1);

    act(() => {
      result.current.triggerRefresh();
    });

    expect(result.current.refreshTrigger).toBe(2);
  });

  describe("handleSaveContact - ADD Mode", () => {
    it("calls createContact with token and payload including clientId, returns backend message", async () => {
      const { result } = setupHook();

      const response = await act(async () =>
        result.current.handleSaveContact(MOCK_CONTACT_PAYLOAD, "add", MOCK_CLIENT)
      );

      expect(response.success).toBe(true);
      expect(response.message).toBe("Contact added successfully");
      expect(mockCreateContact).toHaveBeenCalledWith("mock-token-123", {
        ...MOCK_CONTACT_PAYLOAD,
        clientId: MOCK_CLIENT.clientId,
      });
      expect(result.current.refreshTrigger).toBe(1);
    });

    it("passes undefined clientId when selectedClient is null", async () => {
      const { result } = setupHook();

      await act(async () =>
        result.current.handleSaveContact(MOCK_CONTACT_PAYLOAD, "add", null)
      );

      expect(mockCreateContact).toHaveBeenCalledWith("mock-token-123", {
        ...MOCK_CONTACT_PAYLOAD,
        clientId: undefined,
      });
    });

    it("propagates createContact rejection", async () => {
      mockCreateContact.mockRejectedValue(new Error("API error during create."));
      const { result } = setupHook();

      await expect(
        act(async () => result.current.handleSaveContact(MOCK_CONTACT_PAYLOAD, "add", MOCK_CLIENT))
      ).rejects.toThrow("API error during create.");
    });
  });

  describe("handleSaveContact - EDIT Mode", () => {
    const UPDATE_PAYLOAD = {
      clientContactId: MOCK_EDIT_CONTACT.clientContactId,
      designation: "VP of Sales",
    };

    it("calls updateContact without clientId in body (implementation spreads contactData only)", async () => {
      const { result } = setupHook();

      const response = await act(async () =>
        result.current.handleSaveContact(UPDATE_PAYLOAD, "edit", MOCK_CLIENT)
      );

      expect(response.success).toBe(true);
      expect(mockUpdateContact).toHaveBeenCalledWith("mock-token-123", {
        clientContactId: MOCK_EDIT_CONTACT.clientContactId,
        designation: "VP of Sales",
      });
      expect(result.current.refreshTrigger).toBe(1);
    });

    it("uses contactId fallback for clientContactId", async () => {
      const { result } = setupHook();
      const payloadWithContactId = {
        contactId: 99,
        designation: "Old School",
      };

      await act(async () =>
        result.current.handleSaveContact(payloadWithContactId, "edit", MOCK_CLIENT)
      );

      expect(mockUpdateContact).toHaveBeenCalledWith(
        "mock-token-123",
        expect.objectContaining({ clientContactId: 99 })
      );
    });

    it("propagates updateContact rejection", async () => {
      mockUpdateContact.mockRejectedValue(new Error("API error during update."));
      const { result } = setupHook();

      await expect(
        act(async () => result.current.handleSaveContact(UPDATE_PAYLOAD, "edit", MOCK_CLIENT))
      ).rejects.toThrow("API error during update.");
    });
  });

  describe("handleDeleteContact", () => {
    it("calls deleteContact and returns message", async () => {
      const { result } = setupHook();

      const response = await act(async () =>
        result.current.handleDeleteContact(MOCK_EDIT_CONTACT)
      );

      expect(response.success).toBe(true);
      expect(response.message).toBe("Contact deleted successfully");
      expect(mockDeleteContact).toHaveBeenCalledWith(
        "mock-token-123",
        MOCK_EDIT_CONTACT.clientContactId
      );
      expect(result.current.refreshTrigger).toBe(1);
    });

    it("propagates deleteContact rejection", async () => {
      mockDeleteContact.mockRejectedValue(new Error("API error during delete."));
      const { result } = setupHook();

      await expect(
        act(async () => result.current.handleDeleteContact(MOCK_EDIT_CONTACT))
      ).rejects.toThrow("API error during delete.");
    });
  });

  describe("validateContactSelection", () => {
    it("returns true when clientContactId is present", () => {
      const { result } = setupHook();
      expect(result.current.validateContactSelection(MOCK_EDIT_CONTACT)).toBe(true);
    });

    it("returns false when contact is null", () => {
      const { result } = setupHook();
      expect(result.current.validateContactSelection(null)).toBe(false);
    });

    it("returns false when clientContactId is missing", () => {
      const { result } = setupHook();
      const invalidContact = { clientId: 1, contactPersonName: "Invalid" } as Contact;
      expect(result.current.validateContactSelection(invalidContact)).toBe(false);
    });
  });
});
