import { useState, useEffect } from "react";
import { lookupService } from "../services/lookupService";
import { LookupEntry, LookupApiResponse } from "../types/lookupTypes";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../shared/auth/AuthContext";

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export function useLookupData(page = 1, limit = 10, externalRefresh?: number) {
  const { accessToken } = useAuth(); // ✅ get token from context
  const [data, setData] = useState<LookupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!accessToken) return; // 🔒 Don’t call API without token

    let isMounted = true;

    async function fetchData() {
      const urlPage = parseInt(searchParams.get("page") || String(page));
      const urlLimit = parseInt(searchParams.get("limit") || String(limit));

      setLoading(true);
      setError(null);

      try {
        const res: LookupApiResponse = await lookupService.getAll(accessToken!, urlPage, urlLimit);
        if (res.success && Array.isArray(res.data)) {
          if (isMounted) {
            setData(res.data as LookupEntry[]);
            setMeta(res.meta || null);
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
  }, [accessToken, page, limit, searchParams, refresh, externalRefresh]);

  const refetch = () => setRefresh((prev) => prev + 1);

  return { data, loading, error, meta, refetch };
}
