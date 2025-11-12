import { useState, useEffect } from "react";
import { lookupService } from "../services/lookupService";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../shared/auth/AuthContext";
export function useLookupData(page = 1, limit = 10, externalRefresh) {
    const { accessToken } = useAuth(); // ✅ get token from context
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [meta, setMeta] = useState(null);
    const [searchParams] = useSearchParams();
    useEffect(() => {
        if (!accessToken)
            return; // 🔒 Don’t call API without token
        let isMounted = true;
        async function fetchData() {
            const urlPage = parseInt(searchParams.get("page") || String(page));
            const urlLimit = parseInt(searchParams.get("limit") || String(limit));
            setLoading(true);
            setError(null);
            try {
                const res = await lookupService.getAll(accessToken, urlPage, urlLimit);
                if (res.success && Array.isArray(res.data)) {
                    if (isMounted) {
                        setData(res.data);
                        setMeta(res.meta || null);
                    }
                }
                else {
                    if (isMounted)
                        setError(res.message || "Failed to load data");
                }
            }
            catch (err) {
                if (isMounted)
                    setError(err.message || "Unexpected error");
            }
            finally {
                if (isMounted)
                    setLoading(false);
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
