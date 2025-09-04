import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_BASE_URL;

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to handle API responses
  const handleApiResponse = async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  };

  // Create a new contact
  const createContact = useCallback(async (contactData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      const result = await handleApiResponse(response);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing contact
  const updateContact = useCallback(async (contactData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract the contact ID - check both possible field names
      const contactId = contactData.contactId || contactData.clientContactId;
      
      if (!contactId) {
        throw new Error('Contact ID is required for update operation');
      }
      
      // Prepare the update payload with contactId in the body (as per API docs)
      const updatePayload = {
        contactId: contactId
      };
      
      // Only include fields that are provided for update
      if (contactData.contactPersonName !== undefined) {
        updatePayload.contactPersonName = contactData.contactPersonName;
      }
      if (contactData.designation !== undefined) {
        updatePayload.designation = contactData.designation;
      }
      if (contactData.phone !== undefined) {
        updatePayload.phone = contactData.phone;
      }
      if (contactData.email !== undefined) {
        updatePayload.email = contactData.email;
      }
      
      // Use PATCH /contact endpoint (not /contact/:id based on API docs)
      const response = await fetch(`${API_URL}/contact`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
      
      const result = await handleApiResponse(response);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get client details including contacts
  const getClientDetails = useCallback(async (clientId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/client/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned ${response.status}: Expected JSON but received ${contentType || 'unknown content type'}`);
      }
      
      const result = await handleApiResponse(response);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a contact
  const deleteContact = useCallback(async (contactId) => {
    setLoading(true);
    setError(null);
    
    try {
      // The API uses DELETE /contact/:id format
      const response = await fetch(`${API_URL}/contact/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await handleApiResponse(response);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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