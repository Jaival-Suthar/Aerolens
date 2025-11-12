import { useState, useCallback } from "react";
export const useContact = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_BASE_URL;
    // Helper: Build headers dynamically
    const makeHeaders = (accessToken) => {
        const headers = { "Content-Type": "application/json" };
        if (accessToken)
            headers["Authorization"] = `Bearer ${accessToken}`;
        return headers;
    };
    const handleApiResponse = async (response) => {
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        //console.log("API Response Data:", data);
        return data;
    };
    // ---------------------- GET CLIENT DETAILS ----------------------
    const getClientDetails = useCallback(async (accessToken, clientId) => {
        //console.log("Fetching client details for clientId:", clientId);
        setLoading(true);
        setError(null);
        try {
            if (!clientId)
                throw new Error("Client ID is required");
            const response = await fetch(`${API_URL}/client/${clientId}`, {
                method: "GET",
                headers: makeHeaders(accessToken || undefined),
                credentials: "include",
            });
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Expected JSON but got ${contentType || "unknown content type"}`);
            }
            return await handleApiResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [API_URL]);
    // ---------------------- CREATE CONTACT ----------------------
    const createContact = useCallback(async (accessToken, contactData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: makeHeaders(accessToken || undefined),
                credentials: "include",
                body: JSON.stringify(contactData),
            });
            return await handleApiResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [API_URL]);
    // ---------------------- UPDATE CONTACT ----------------------
    const updateContact = useCallback(async (accessToken, contactData) => {
        setLoading(true);
        setError(null);
        try {
            const contactId = contactData.clientContactId;
            if (!contactId)
                throw new Error("Contact ID is required for update operation");
            const updatePayload = {};
            if (contactData.contactPersonName !== undefined)
                updatePayload.contactPersonName = contactData.contactPersonName;
            if (contactData.designation !== undefined)
                updatePayload.designation = contactData.designation;
            if (contactData.phone !== undefined)
                updatePayload.phone = contactData.phone;
            if (contactData.email !== undefined)
                updatePayload.email = contactData.email;
            const response = await fetch(`${API_URL}/contact/${contactId}`, {
                method: "PATCH",
                headers: makeHeaders(accessToken || undefined),
                credentials: "include",
                body: JSON.stringify(updatePayload),
            });
            return await handleApiResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [API_URL]);
    // ---------------------- DELETE CONTACT ----------------------
    const deleteContact = useCallback(async (accessToken, clientContactId) => {
        setLoading(true);
        setError(null);
        try {
            if (!clientContactId)
                throw new Error("Contact ID is required for delete operation");
            const response = await fetch(`${API_URL}/contact/${clientContactId}`, {
                method: "DELETE",
                headers: makeHeaders(accessToken || undefined),
                credentials: "include",
            });
            return await handleApiResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [API_URL]);
    const clearError = useCallback(() => setError(null), []);
    return {
        loading,
        error,
        createContact,
        updateContact,
        getClientDetails,
        deleteContact,
        clearError,
    };
};
export default useContact;
