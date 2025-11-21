import { useState, useEffect, useCallback } from "react";
import useContact from "../services/useContact";
import type {
  Contact,
  ApiResponse,
  ClientDetailsApiResponse,
} from "../types/contactTypes";
import { useAuth } from "../../../shared/auth/AuthContext"; // ✅ Import useAuth

/**
 * Hook to fetch contacts for a given client.
 * Automatically uses accessToken from AuthContext.
 */
export const useContactsByClient = (
  clientId: number | undefined,
  refreshTrigger: number
) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { getClientDetails, loading, error, clearError } = useContact();
  const { accessToken } = useAuth(); // ✅ Retrieve token from AuthContext

  const loadContacts = useCallback(async () => {
    if (!clientId) {
      setContacts([]);
      return;
    }

    if (!accessToken) {
      setContacts([]);
      return;
    }

    try {
      const response: ApiResponse<ClientDetailsApiResponse> = await getClientDetails(
        accessToken, // ✅ Pass token as first argument
        clientId
      );

      if (response.success && response.data) {
        const clientContactsArray = response.data.clientContact;

        if (Array.isArray(clientContactsArray) && clientContactsArray.length > 0) {
          const validContacts = clientContactsArray.filter(
            (contact) => contact && (contact.clientContactId || contact.contactId)
          );
          setContacts(validContacts);
        } else {
          setContacts([]);
        }
      } else {
        setContacts([]);
      }
    } catch (err) {
      setContacts([]);
    }
  }, [accessToken, clientId, getClientDetails]);

  useEffect(() => {
    if (accessToken) {
      loadContacts();
    } else {
    }

    return () => clearError();
  }, [loadContacts, refreshTrigger, clearError, accessToken]);

  return {
    contacts,
    loading,
    error,
    clearError,
  };
};
