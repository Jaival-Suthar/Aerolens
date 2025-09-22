import { useState, useCallback } from 'react';
import type { Contact, ApiResponse, ContactAddEditPayload, ClientDetailsApiResponse, ContactPayload } from '../types/contactTypes';

export const useContact = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_BASE_URL;

  const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    const data: ApiResponse<T> = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    console.log('API Response Data:', data);
    return data;
  };

  // Fetch client details including contacts (GET /client/:clientId)
  const getClientDetails = useCallback(
    async (clientId: number): Promise<ApiResponse<ClientDetailsApiResponse>> => {
      console.log('Fetching client details for clientId:', clientId);
      setLoading(true);
      setError(null);
      try {
        if (!clientId) throw new Error('Client ID is required');

        const response = await fetch(`${API_URL}/client/${clientId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
        }

        return await handleApiResponse<ClientDetailsApiResponse>(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // Create a new contact (POST /contact)
  const createContact = useCallback(
    async (contactData: ContactAddEditPayload): Promise<ApiResponse<Contact>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });
        return await handleApiResponse<Contact>(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // Update existing contact (PATCH /contact/:clientContactId)
  const updateContact = useCallback(
    async (contactData: ContactAddEditPayload): Promise<ApiResponse<Contact>> => {
      setLoading(true);
      setError(null);
      try {
        const contactId = (contactData as Partial<Contact>).clientContactId;
        if (!contactId) throw new Error('Contact ID is required for update operation');

        const updatePayload: Partial<ContactPayload> = {};
        if ('contactPersonName' in contactData && contactData.contactPersonName !== undefined) {
          updatePayload.contactPersonName = contactData.contactPersonName;
        }
        if ('designation' in contactData && contactData.designation !== undefined) {
          updatePayload.designation = contactData.designation;
        }
        if ('phone' in contactData && contactData.phone !== undefined) {
          updatePayload.phone = contactData.phone;
        }
        if ('email' in contactData && contactData.email !== undefined) {
          updatePayload.email = contactData.email;
        }

        const response = await fetch(`${API_URL}/contact/${contactId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });

        return await handleApiResponse<Contact>(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  // Delete Contact (DELETE /contact/:clientContactId)
  const deleteContact = useCallback(
    async (clientContactId: number): Promise<ApiResponse<void>> => {
      setLoading(true);
      setError(null);
      try {
        if (!clientContactId) throw new Error('Contact ID is required for delete operation');

        const response = await fetch(`${API_URL}/contact/${clientContactId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        return await handleApiResponse<void>(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
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
    clearError,
  };
};

export default useContact;