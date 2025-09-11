import { useState, useCallback } from 'react';
import useContact from '../services/useContact';

export const useContactOperations = (showSuccess, showError) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { createContact, updateContact, deleteContact } = useContact();

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const validateContactId = useCallback((contact, operation) => {
    if (!contact?.clientContactId) {
      throw new Error(`Contact ID is missing for ${operation} operation`);
    }
  }, []);

  const handleSaveContact = useCallback(async (contactData, dialogMode, selectedClient) => {
  try {
    if (dialogMode === "add") {
      const newContactData = {
        ...contactData,
        clientId: selectedClient?.clientId
      };
      await createContact(newContactData);
      showSuccess("Contact added successfully");
    } else {
      // Make sure we have the contact ID
      const contactId = contactData.clientContactId || contactData.contactId;
      
      if (!contactId) {
        //console.error('Missing contact ID in contactData:', contactData);
        throw new Error('Contact ID is missing for update operation');
      }
      
      const updateContactData = {
        ...contactData,
        clientContactId: contactId,
        clientId: contactData.clientId || selectedClient?.clientId
      };
      
      //console.log('Calling updateContact with:', updateContactData);
      await updateContact(updateContactData);
      showSuccess("Contact updated successfully");
    }
    
    triggerRefresh();
    return { success: true };
  } catch (err) {
    console.error('Error saving contact:', err);
    showError(err.message || 'Failed to save contact');
    return { success: false, error: err };
  }
}, [createContact, updateContact, showSuccess, showError, triggerRefresh]);

  const handleDeleteContact = useCallback(async (contactToDelete) => {
    try {
      validateContactId(contactToDelete, 'deletion');
      
      await deleteContact(contactToDelete.clientContactId);
      showSuccess("Contact deleted successfully");
      triggerRefresh();
      return { success: true };
    } catch (err) {
      console.error('Error deleting contact:', err);
      showError(err.message || 'Failed to delete contact');
      return { success: false, error: err };
    }
  }, [deleteContact, validateContactId, showSuccess, showError, triggerRefresh]);

  const validateContactSelection = useCallback((contact, showError) => {
    if (!contact) {
      showError('Please select a contact first');
      return false;
    }
    
    if (!contact.clientContactId) {
      showError('Contact ID is missing. Cannot perform this operation.');
      return false;
    }
    
    return true;
  }, []);

  return {
    refreshTrigger,
    handleSaveContact,
    handleDeleteContact,
    validateContactSelection,
    triggerRefresh
  };
};