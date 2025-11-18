import { useState, useCallback } from "react";
import type {
  Contact,
  ApiResponse,
  ContactAddEditPayload,
  ClientDetailsApiResponse,
  ContactPayload,
} from "../types/contactTypes";

export const useContact = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_BASE_URL;

  // Helper: Build headers dynamically
  const makeHeaders = (accessToken?: string) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
  };

  const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    const data: ApiResponse<T> = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    return data;
  };

  // ---------------------- GET CLIENT DETAILS ----------------------
  const getClientDetails = useCallback(
    async (accessToken: string | null, clientId: number): Promise<ApiResponse<ClientDetailsApiResponse>> => {
      setLoading(true);
      setError(null);
      try {
        if (!clientId) throw new Error("Client ID is required");

        const response = await fetch(`${API_URL}/client/${clientId}`, {
          method: "GET",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
        });

        return await handleApiResponse<ClientDetailsApiResponse>(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- CREATE CONTACT ----------------------
  const createContact = useCallback(
    async (accessToken: string | null, contactData: ContactAddEditPayload): Promise<ApiResponse<Contact>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/contact`, {
          method: "POST",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
          body: JSON.stringify(contactData),
        });
        return await handleApiResponse<Contact>(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- UPDATE CONTACT ----------------------
  const updateContact = useCallback(
    async (accessToken: string | null, contactData: ContactAddEditPayload): Promise<ApiResponse<Contact>> => {
      setLoading(true);
      setError(null);
      try {
        const contactId = (contactData as Partial<Contact>).clientContactId;
        if (!contactId) throw new Error("Contact ID is required for update");

        const updatePayload: Partial<ContactPayload> = {};
        if (contactData.contactPersonName !== undefined)
          updatePayload.contactPersonName = contactData.contactPersonName;
        if (contactData.designation !== undefined)
          updatePayload.designation = contactData.designation;
        if (contactData.phone !== undefined) updatePayload.phone = contactData.phone;
        if (contactData.email !== undefined) updatePayload.email = contactData.email;

        const response = await fetch(`${API_URL}/contact/${contactId}`, {
          method: "PATCH",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });

        return await handleApiResponse<Contact>(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- DELETE CONTACT ----------------------
  const deleteContact = useCallback(
    async (accessToken: string | null, clientContactId: number): Promise<ApiResponse<void>> => {
      setLoading(true);
      setError(null);
      try {
        if (!clientContactId) throw new Error("Contact ID is required for delete");

        const response = await fetch(`${API_URL}/contact/${clientContactId}`, {
          method: "DELETE",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
        });

        return await handleApiResponse<void>(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- FETCH DESIGNATIONS ----------------------
  const getDesignations = useCallback(
    async (accessToken: string): Promise<string[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/lookup?page=1&limit=100`, {
          method: "GET",
          headers: makeHeaders(accessToken),
          credentials: "include",
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "<unreadable>");
          throw new Error(`Failed to fetch designations: ${response.status} - ${text}`);
        }

        const result = await response.json();
        const designations = (result.data || [])
          .filter((item: any) => item.tag === "designation")
          .map((item: any) => item.value);

        return designations;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch designations");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    getClientDetails,
    getDesignations,
    clearError,
  };
};

export default useContact;
