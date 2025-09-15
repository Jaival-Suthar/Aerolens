import { useState, useCallback } from 'react';
import useContact from '../services/useContact';
import type { Contact, Client, DialogMode, ContactAddEditPayload } from '../types/contactTypes';

interface ContactOperationsResult {
  success: boolean;
  error?: Error;
}

export const useContactOperations = (
  showSuccess: (message: string) => void,
  showError: (message: string) => void
) => {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const { createContact, updateContact, deleteContact } = useContact();

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleSaveContact = useCallback(
    async (
      contactData: ContactAddEditPayload,
      dialogMode: DialogMode,
      selectedClient: Client | null
    ): Promise<ContactOperationsResult> => {
      try {
        if (dialogMode === 'add') {
          if (!selectedClient?.clientId) {
            throw new Error('Client ID is required for adding a contact');
          }
          const newContactData = {
            ...contactData,
            clientId: selectedClient.clientId
          };
          await createContact(newContactData);
          showSuccess('Contact added successfully');
        } else {
          // Edit mode: contactData is Partial<Omit<Contact, 'clientId'>>
          const contactId =
          (contactData as Partial<Contact>).clientContactId ||
          (contactData as Partial<Contact>).contactId;
        if (!contactId) {
          throw new Error('Contact ID is required for update operation');
        }
        const updateContactData = {
          ...contactData,
          clientContactId: contactId,
          clientId: selectedClient?.clientId,
        };

          await updateContact(updateContactData);
          showSuccess('Contact updated successfully');
        }

        triggerRefresh();
        return { success: true };
      } catch (err) {
        console.error('Error saving contact:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to save contact';
        showError(errorMessage);
        return { success: false, error: err as Error };
      }
    },
    [createContact, updateContact, showSuccess, showError, triggerRefresh]
  );

  const handleDeleteContact = useCallback(
    async (contactToDelete: Contact): Promise<ContactOperationsResult> => {
      try {
        if (!contactToDelete.clientContactId) {
          throw new Error('Contact ID is required for deletion operation');
        }
        await deleteContact(contactToDelete.clientContactId);
        showSuccess('Contact deleted successfully');
        triggerRefresh();
        return { success: true };
      } catch (err) {
        console.error('Error deleting contact:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete contact';
        showError(errorMessage);
        return { success: false, error: err as Error };
      }
    },
    [deleteContact, showSuccess, showError, triggerRefresh]
  );

  const validateContactSelection = useCallback(
    (contact: Contact | null, showError: (message: string) => void): boolean => {
      if (!contact) {
        showError('Please select a contact first');
        return false;
      }
      if (!contact.clientContactId) {
        showError('Contact ID is missing. Cannot perform this operation.');
        return false;
      }
      return true;
    },
    []
  );

  return {
    refreshTrigger,
    handleSaveContact,
    handleDeleteContact,
    validateContactSelection,
    triggerRefresh
  };
};