import { useState, useEffect, useCallback } from 'react';
import useContact from '../services/useContact';

export const useContactsByClient = (clientId, refreshTrigger) => {
  const [contacts, setContacts] = useState([]);
  const { getClientDetails, loading, error, clearError } = useContact();

  const loadContacts = useCallback(async () => {
    if (!clientId) {
      setContacts([]);
      return;
    }
    try {
      const response = await getClientDetails(clientId);
      if (response.success && response.data?.clientContacts) {
        const contactsWithIds = response.data.clientContacts.map((contact, idx) => ({
          ...contact,
          clientContactId: contact.clientContactId || contact.id || `temp-${idx}`,
          clientId: contact.clientId || clientId,
        }));
        setContacts(contactsWithIds);
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
