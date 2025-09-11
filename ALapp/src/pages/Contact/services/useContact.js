import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_BASE_URL;

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    return data;
  };

  // Create a new contact (POST /contact)
  const createContact = useCallback(async (contactData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      return await handleApiResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing contact (PATCH /contact/:contactId)
  const updateContact = useCallback(async (contactData) => {
    setLoading(true);
    setError(null);
    try {
      const contactId = contactData.contactId || contactData.clientContactId;
      if (!contactId) throw new Error('Contact ID is required for update operation');

      // Prepare partial update payload (exclude contactId from body)
      const updatePayload = {
        ...(contactData.contactPersonName !== undefined && { contactPersonName: contactData.contactPersonName }),
        ...(contactData.designation !== undefined && { designation: contactData.designation }),
        ...(contactData.phone !== undefined && { phone: contactData.phone }),
        ...(contactData.email !== undefined && { email: contactData.email }),
      };

      // Call PATCH with contactId in URL path per backend spec
      const response = await fetch(`${API_URL}/contact/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      return await handleApiResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete Contact (DELETE /contact/:id)
  const deleteContact = useCallback(async (contactId) => {
    setLoading(true);
    setError(null);
    try {
      if (!contactId) throw new Error('Contact ID is required for delete operation');

      const response = await fetch(`${API_URL}/contact/${contactId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      return await handleApiResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch client details including contacts (GET /client/:id)
  const getClientDetails = useCallback(async (clientId) => {
    setLoading(true);
    setError(null);
    try {
      if (!clientId) throw new Error('Client ID is required');

      const response = await fetch(`${API_URL}/client/${clientId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json'))
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);

      return await handleApiResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
