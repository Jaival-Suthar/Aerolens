import { useEffect, useState, useCallback } from "react";
import { getTechSpecifications } from "../services/jobProfileService";

export const useTechSpecifications = (token: string | null) => {
  const [data, setData] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTechSpecs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getTechSpecifications(token);

      setData(res.data);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load tech specs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTechSpecs();
  }, [fetchTechSpecs]);

  return {
    techSpecs: data,
    loading,
    error,
    refetch: fetchTechSpecs
  };
};
