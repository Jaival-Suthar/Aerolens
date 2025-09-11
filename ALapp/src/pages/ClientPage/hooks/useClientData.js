import { useState, useEffect, useCallback } from "react";
import { getClients } from "../services/clientService";

export const useClientData = (refreshTrigger = 0) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized load function
  const loadClients = useCallback(async (page, limit) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading clients: page=${page}, limit=${limit}`);
      const response = await getClients(page, limit);
      
      if (response && response.data) {
        setClients(response.data);
        return response; // Return full response for pagination handling
      } else {
        console.warn("No data received from API");
        setClients([]);
        return { data: [], pagination: null };
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      setError(error.message);
      setClients([]);
      throw error; // Re-throw for handling in component
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    loadClients,
    setError
  };
};