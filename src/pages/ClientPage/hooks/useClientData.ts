import { useState, useCallback, useEffect } from "react";
import type { ClientType } from "../types/clientTypes";
import { getAllClients } from "../services/clientService";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { ApiError } from "../../../types/apiError";

export const useClientData = (refreshTrigger = 0) => {  // ← Keep this param
  const { accessToken } = useAuth();
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const allClients = await getAllClients(accessToken);
      setClients(allClients);
      setError(null);
      return { data: allClients, meta: { total: allClients.length } };
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Auto-reload when refreshTrigger changes
  useEffect(() => {
    if (accessToken) {
      loadClients().catch(() => {});
    }
  }, [refreshTrigger, loadClients, accessToken]);  // ← refreshTrigger is in deps

  return { clients, loading, error, loadClients, setError };
};