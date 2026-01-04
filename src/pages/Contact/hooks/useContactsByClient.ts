import { useState, useEffect, useCallback } from "react";
import useContact from "../services/useContact";
import type {
  Contact,
  ApiResponse,
  ClientDetailsApiResponse,
} from "../types/contactTypes";
import { useAuth } from "../../../shared/auth/AuthContext";

/**
 * Hook to fetch contacts for a given client.
 * Backend-driven errors, no swallowing.
 */
export const useContactsByClient = (
  clientId: number | undefined,
  refreshTrigger: number
) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { getClientDetails, loading, error, clearError } = useContact();
  const { accessToken } = useAuth();

  const loadContacts = useCallback(async () => {
    if (!clientId || !accessToken) {
      setContacts([]);
      return;
    }

    try {
      const response: ApiResponse<ClientDetailsApiResponse> =
        await getClientDetails(accessToken, clientId);

      const clientContactsArray = response?.data?.clientContact ?? [];

      if (Array.isArray(clientContactsArray)) {
        setContacts(
          clientContactsArray.filter(
            (contact) =>
              contact && (contact.clientContactId || contact.contactId)
          )
        );
      } else {
        setContacts([]);
      }
    } catch (err) {
      setContacts([]);
      throw err; // 🔥 let parent decide (toast / redirect)
    }
  }, [accessToken, clientId, getClientDetails]);

  useEffect(() => {
    loadContacts();

    return () => {
      clearError();
    };
  }, [loadContacts, refreshTrigger, clearError]);

  return {
    contacts,
    loading,
    error, // ApiError | null (backend-driven)
    clearError,
  };
};
