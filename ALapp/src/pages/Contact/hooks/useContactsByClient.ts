import { useState, useEffect, useCallback } from 'react';
import useContact from '../services/useContact';
import type { Contact, ApiResponse, ClientDetailsApiResponse } from '../types/contactTypes';


export const useContactsByClient = (clientId: number | undefined, refreshTrigger: number) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { getClientDetails, loading, error, clearError } = useContact();

  const loadContacts = useCallback(async () => {
  if (!clientId) {
    setContacts([]);
    return;
  }
  try {
    console.log('Loading contacts for clientId:', clientId);
    const response: ApiResponse<ClientDetailsApiResponse> = await getClientDetails(clientId);
    
    console.log('Full API Response:', response);
    
    if (response.success && response.data) {
      // API returns clientContact as an array (uppercase 'C')
      const clientContactsArray = response.data.clientContact;
      
      if (Array.isArray(clientContactsArray) && clientContactsArray.length > 0) {
        // Filter out contacts without valid IDs
        const validContacts = clientContactsArray.filter(contact => 
          contact && (contact.clientContactId || contact.contactId)
        );
        console.log('Setting contacts:', validContacts);
        setContacts(validContacts);
      } else {
        console.log('No valid contacts found in response');
        setContacts([]);
      }
    } else {
      console.log('No contacts found or unsuccessful response');
      setContacts([]);
    }
  } catch (err) {
    console.error('Failed to load contacts:', err);
    setContacts([]);
  }
}, [clientId, getClientDetails]);

  useEffect(() => {
    loadContacts();
    return () => clearError();
  }, [loadContacts, refreshTrigger, clearError]);

  return {
    contacts,
    loading,
    error,
    clearError,
  };
};

// Alternative approach if your API might return multiple contacts in the future:
export const useContactsByClientFlexible = (clientId: number | undefined, refreshTrigger: number) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { getClientDetails, loading, error, clearError } = useContact();

  const loadContacts = useCallback(async () => {
  if (!clientId) {
    setContacts([]);
    return;
  }
  try {
    const response: ApiResponse<ClientDetailsApiResponse> = await getClientDetails(clientId);
    
    if (response.success && response.data) {
      let contactsArray: Contact[] = [];
      
      // Only check for the correct API structure
      if (response.data.clientContact && Array.isArray(response.data.clientContact)) {
        contactsArray = response.data.clientContact;
      } else if (response.data.clientContact && typeof response.data.clientContact === 'object') {
        contactsArray = [response.data.clientContact];
      }
      
      console.log('Processed contacts:', contactsArray);
      setContacts(contactsArray);
    } else {
      setContacts([]);
    }
  } catch (err) {
    console.error('Failed to load contacts:', err);
    setContacts([]);
  }
}, [clientId, getClientDetails]);

  useEffect(() => {
    loadContacts();
    return () => clearError();
  }, [loadContacts, refreshTrigger, clearError]);

  return {
    contacts,
    loading,
    error,
    clearError,
  };
};