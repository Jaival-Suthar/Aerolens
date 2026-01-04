import { useState, useCallback } from "react";
import useContact from "../services/useContact";
import type {
  Contact,
  Client,
  DialogMode,
  ContactAddEditPayload,
} from "../types/contactTypes";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { ApiError } from "../../../types/apiError";

interface ContactOperationsResult {
  success: boolean;
}

export const useContactOperations = () => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const { accessToken } = useAuth();
  const { createContact, updateContact, deleteContact } = useContact();

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ---------------------- SAVE (ADD / UPDATE) ----------------------
  const handleSaveContact = useCallback(
  async (
    contactData: ContactAddEditPayload,
    dialogMode: DialogMode,
    selectedClient: Client | null
  ) => {
    if (!accessToken) {
      throw {
        error: "UNAUTHORIZED",
        message: "Session expired",
      };
    }

    let response;

    if (dialogMode === "add") {
      response = await createContact(accessToken, {
        ...contactData,
        clientId: selectedClient?.clientId,
      });
    } else {
      const contactId =
        (contactData as Partial<Contact>).clientContactId ||
        (contactData as Partial<Contact>).contactId;

      response = await updateContact(accessToken, {
        ...contactData,
        clientContactId: contactId,
      });
    }

    triggerRefresh();

    // 🔥 PASS BACKEND MESSAGE UP
    return {
      success: true,
      message: response.message,
    };
  },
  [accessToken, createContact, updateContact, triggerRefresh]
);


  // ---------------------- DELETE ----------------------
  const handleDeleteContact = useCallback(
  async (contact: Contact) => {
    const response = await deleteContact(
      accessToken,
      contact.clientContactId!
    );

    triggerRefresh();

    return {
      success: true,
      message: response.message,
    };
  },
  [accessToken, deleteContact, triggerRefresh]
);



  // ---------------------- SELECTION VALIDATION (UI-ONLY) ----------------------
  const validateContactSelection = useCallback(
    (contact: Contact | null): boolean => {
      return Boolean(contact?.clientContactId);
    },
    []
  );

  return {
    refreshTrigger,
    handleSaveContact,
    handleDeleteContact,
    validateContactSelection,
    triggerRefresh,
  };
};

export default useContactOperations;
