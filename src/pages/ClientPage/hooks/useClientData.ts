import { useState, useCallback, useEffect } from "react";
import type { ClientType, ClientsApiResponse } from "../types/clientTypes";
import { getClients } from "../services/clientService";
import { useAuth } from "../../../shared/auth/AuthContext"; // Import useAuth

export const useClientData = (refreshTrigger = 0) => {
  const { accessToken } = useAuth(); // Get the token
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: ClientsApiResponse = await getClients(accessToken, page, limit); // Pass token first!
      setClients(response.data ?? []);
      return response;
    } catch (err: unknown) {
      let message = "Unknown error";

      if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setClients([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]); // Add accessToken to dependencies

  // Auto-reload when refreshTrigger changes
  useEffect(() => {
    if (accessToken) { // Only load if token exists
      loadClients(1, 10).catch(() => {});
    }
  }, [refreshTrigger, loadClients, accessToken]);

  return { clients, loading, error, loadClients, setError };
};