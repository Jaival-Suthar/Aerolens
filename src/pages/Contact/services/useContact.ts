import { useState, useCallback } from "react";
import type {
  Contact,
  ApiResponse,
  ContactAddEditPayload,
  ClientDetailsApiResponse,
  ContactPayload,
} from "../types/contactTypes";
import type { ApiError } from "../../../types/apiError";
import { normalizeApiError } from "../../../utils/apiErrorHandler";

export const useContact = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const API_URL = import.meta.env.VITE_BASE_URL;

  // ---------------------- HEADERS ----------------------
  const makeHeaders = (accessToken?: string) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
  };

  // ---------------------- GET CLIENT DETAILS ----------------------
  const getClientDetails = useCallback(
    async (
      accessToken: string | null,
      clientId: number
    ): Promise<ApiResponse<ClientDetailsApiResponse>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/client/${clientId}`, {
          method: "GET",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
        });

        if (!response.ok) {
          const apiError = await normalizeApiError(response);
          throw apiError;
        }

        return response.json();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- CREATE CONTACT ----------------------
  const createContact = useCallback(
    async (
      accessToken: string | null,
      contactData: ContactAddEditPayload
    ): Promise<ApiResponse<Contact>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/contact`, {
          method: "POST",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
          body: JSON.stringify(contactData),
        });

        if (!response.ok) {
          const apiError = await normalizeApiError(response);
          throw apiError;
        }

        return response.json();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- UPDATE CONTACT ----------------------
  const updateContact = useCallback(
    async (
      accessToken: string | null,
      contactData: ContactAddEditPayload
    ): Promise<ApiResponse<Contact>> => {
      setLoading(true);
      setError(null);

      try {
        const contactId = (contactData as Partial<Contact>).clientContactId;

        const updatePayload: Partial<ContactPayload> = {
          contactPersonName: contactData.contactPersonName,
          designation: contactData.designation,
          phone: contactData.phone,
          email: contactData.email,
        };

        const response = await fetch(`${API_URL}/contact/${contactId}`, {
          method: "PATCH",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const apiError = await normalizeApiError(response);
          throw apiError;
        }

        return response.json();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- DELETE CONTACT ----------------------
  const deleteContact = useCallback(
    async (
      accessToken: string | null,
      clientContactId: number
    ): Promise<ApiResponse<void>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/contact/${clientContactId}`, {
          method: "DELETE",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
        });

        if (!response.ok) {
          const apiError = await normalizeApiError(response);
          throw apiError;
        }

        return response.json();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // ---------------------- GET DESIGNATIONS ----------------------
  const getDesignations = useCallback(
    async (accessToken: string | null): Promise<string[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/lookup?page=1&limit=100`, {
          method: "GET",
          headers: makeHeaders(accessToken || undefined),
          credentials: "include",
        });

        if (!response.ok) {
          const apiError = await normalizeApiError(response);
          throw apiError;
        }

        const data = await response.json();

        return (
          data?.data
            ?.filter((item: any) => item.tag === "designation")
            .map((item: any) => item.value) ?? []
        );
      } catch (err) {
        setError(err as ApiError);
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
    getClientDetails,
    deleteContact,
    getDesignations,
    clearError,
  };
};

export default useContact;

// ─── Plain service functions (used by dialogs outside of hook context) ───────

export const getDeletedContacts = async (
  accessToken: string,
  clientId: number
): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/contact/client/${clientId}/deleted`, {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data.data ?? data;
};

export const restoreContact = async (
  accessToken: string,
  contactId: number
): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}/contact/${contactId}/restore`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
