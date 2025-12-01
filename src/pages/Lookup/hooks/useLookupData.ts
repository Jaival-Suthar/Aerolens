import { useState, useEffect } from "react";
import { lookupService } from "../services/lookupService";
import { LookupEntry, LookupApiResponse } from "../types/lookupTypes";
import { useAuth } from "../../../shared/auth/AuthContext";

export function useLookupData(externalRefresh?: number) {  // ← Remove page, limit params
  const { accessToken } = useAuth();
  const [data, setData] = useState<LookupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const res: LookupApiResponse = await lookupService.getAll(accessToken!);  // ← No pagination params
        if (res.success && Array.isArray(res.data)) {
          if (isMounted) {
            setData(res.data as LookupEntry[]);
          }
        } else {
          if (isMounted) setError(res.message || "Failed to load data");
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Unexpected error");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [accessToken, refresh, externalRefresh]);

  const refetch = () => setRefresh((prev) => prev + 1);

  return { data, loading, error, refetch };  // ← Remove meta
}