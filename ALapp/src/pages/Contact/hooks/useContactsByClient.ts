import { useState, useEffect, useCallback } from 'react';
import useContact from '../services/useContact';
import type { Contact, ApiResponse } from '../types/contactTypes';

// Define the expected shape of getClientDetails response data
interface ClientDetailsResponse {
  clientContacts: Contact[];
}

export const useContactsByClient = (clientId: number | undefined, refreshTrigger: number) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { getClientDetails, loading, error, clearError } = useContact();

  const loadContacts = useCallback(async () => {
    if (!clientId) {
      setContacts([]);
      return;
    }
    try {
      const response: ApiResponse<ClientDetailsResponse> = await getClientDetails(clientId);
      if (response.success && response.data?.clientContacts) {
        setContacts(response.data.clientContacts);
      } else {
        setContacts([]);
      }
    } catch (err) {
      setContacts([]);
      console.error('Failed to load contacts:', err);
    }
  }, [clientId, getClientDetails]);

  useEffect(() => {
    loadContacts();
    // Clear any lingering errors on unmount or client change
    return () => clearError();
  }, [loadContacts, refreshTrigger, clearError]);

  return {
    contacts,
    loading,
    error,
    clearError,
  };
};