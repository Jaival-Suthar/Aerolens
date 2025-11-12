import { useState, useCallback } from "react";
import useContact from "../services/useContact";
import { useAuth } from "../../../shared/auth/AuthContext"; // ✅ Import AuthContext
export const useContactOperations = (showSuccess, showError) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { accessToken } = useAuth(); // ✅ Get token from context
    const { createContact, updateContact, deleteContact } = useContact(); // ✅ These now expect token as first param
    const triggerRefresh = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);
    // ---------------------- SAVE (ADD / UPDATE) CONTACT ----------------------
    const handleSaveContact = useCallback(async (contactData, dialogMode, selectedClient) => {
        try {
            if (!accessToken)
                throw new Error("Access token not found. Please log in again.");
            if (dialogMode === "add") {
                if (!selectedClient?.clientId) {
                    throw new Error("Client ID is required for adding a contact");
                }
                const newContactData = {
                    ...contactData,
                    clientId: selectedClient.clientId,
                };
                await createContact(accessToken, newContactData); // ✅ Pass token
                showSuccess("Contact added successfully");
            }
            else {
                const contactId = contactData.clientContactId ||
                    contactData.contactId;
                if (!contactId) {
                    throw new Error("Contact ID is required for update operation");
                }
                const updateContactData = {
                    ...contactData,
                    clientContactId: contactId,
                    clientId: selectedClient?.clientId,
                };
                await updateContact(accessToken, updateContactData); // ✅ Pass token
                showSuccess("Contact updated successfully");
            }
            triggerRefresh();
            return { success: true };
        }
        catch (err) {
            console.error("Error saving contact:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save contact";
            showError(errorMessage);
            return { success: false, error: err };
        }
    }, [
        accessToken,
        createContact,
        updateContact,
        showSuccess,
        showError,
        triggerRefresh,
    ]);
    // ---------------------- DELETE CONTACT ----------------------
    const handleDeleteContact = useCallback(async (contactToDelete) => {
        try {
            if (!accessToken)
                throw new Error("Access token not found. Please log in again.");
            if (!contactToDelete.clientContactId) {
                throw new Error("Contact ID is required for deletion operation");
            }
            await deleteContact(accessToken, contactToDelete.clientContactId); // ✅ Pass token
            showSuccess("Contact deleted successfully");
            triggerRefresh();
            return { success: true };
        }
        catch (err) {
            console.error("Error deleting contact:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete contact";
            showError(errorMessage);
            return { success: false, error: err };
        }
    }, [accessToken, deleteContact, showSuccess, showError, triggerRefresh]);
    // ---------------------- VALIDATION ----------------------
    const validateContactSelection = useCallback((contact, showError) => {
        if (!contact) {
            showError("Please select a contact first");
            return false;
        }
        if (!contact.clientContactId) {
            showError("Contact ID is missing. Cannot perform this operation.");
            return false;
        }
        return true;
    }, [showError]);
    return {
        refreshTrigger,
        handleSaveContact,
        handleDeleteContact,
        validateContactSelection,
        triggerRefresh,
    };
};
export default useContactOperations;
