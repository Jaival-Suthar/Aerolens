import { useState, useEffect, useCallback } from "react";
import useContact from "../services/useContact";
import { useAuth } from "../../../shared/auth/AuthContext"; // ✅ Import useAuth
/**
 * Hook to fetch contacts for a given client.
 * Automatically uses accessToken from AuthContext.
 */
export const useContactsByClient = (clientId, refreshTrigger) => {
    const [contacts, setContacts] = useState([]);
    const { getClientDetails, loading, error, clearError } = useContact();
    const { accessToken } = useAuth(); // ✅ Retrieve token from AuthContext
    const loadContacts = useCallback(async () => {
        if (!clientId) {
            setContacts([]);
            return;
        }
        if (!accessToken) {
            console.warn("⚠️ Access token missing. Skipping contacts fetch.");
            setContacts([]);
            return;
        }
        try {
            console.log("📥 Loading contacts for clientId:", clientId);
            const response = await getClientDetails(accessToken, // ✅ Pass token as first argument
            clientId);
            console.log("📦 Full API Response:", response);
            if (response.success && response.data) {
                const clientContactsArray = response.data.clientContact;
                if (Array.isArray(clientContactsArray) && clientContactsArray.length > 0) {
                    const validContacts = clientContactsArray.filter((contact) => contact && (contact.clientContactId || contact.contactId));
                    console.log("✅ Setting contacts:", validContacts);
                    setContacts(validContacts);
                }
                else {
                    console.log("⚠️ No valid contacts found in response");
                    setContacts([]);
                }
            }
            else {
                console.log("⚠️ No contacts found or unsuccessful response");
                setContacts([]);
            }
        }
        catch (err) {
            console.error("❌ Failed to load contacts:", err);
            setContacts([]);
        }
    }, [accessToken, clientId, getClientDetails]);
    useEffect(() => {
        if (accessToken) {
            loadContacts();
        }
        else {
            console.warn("⏳ Waiting for accessToken before fetching contacts...");
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
