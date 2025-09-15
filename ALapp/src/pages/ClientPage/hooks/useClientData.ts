import { useState, useCallback, useEffect } from "react";
import type { ClientType, ClientsApiResponse } from "../types/clientTypes";
import { getClients } from "../services/clientService";

export const useClientData = (refreshTrigger = 0) => {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: ClientsApiResponse = await getClients(page, limit);
      setClients(response.data ?? []);
      return response;
    } catch (err: unknown) {
      let message = "Unknown error";

      if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setClients([]);
      throw err; // re-throw for component to handle if needed
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-reload when refreshTrigger changes
  useEffect(() => {
    loadClients(1, 10).catch(() => {});
  }, [refreshTrigger, loadClients]);

  return { clients, loading, error, loadClients, setError };
};
