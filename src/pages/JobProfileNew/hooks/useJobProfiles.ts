import { useEffect, useState, useCallback, useRef } from "react";
import { JobProfile } from "../types/jobProfileTypes";
import { getAllJobProfilesWithJD } from "../services/jobProfileService";

export const useJobProfiles = (token: string | null) => {

  const [data, setData] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent stale overwrites
  const requestIdRef = useRef(0);

  const fetchProfiles = useCallback(async () => {

    // Guard: no token
    if (!token) {
      setData([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const res = await getAllJobProfilesWithJD(token);

      // Ignore stale responses
      if (requestId !== requestIdRef.current) return;

      setData(res.data);

    } catch (err: any) {

      if (requestId !== requestIdRef.current) return;

      console.error(err);

      const message =
        err?.message ||
        err?.error ||
        err?.details?.message ||
        "Failed to load job profiles";

      setError(message);

    } finally {

      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }

  }, [token]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    jobProfiles: data,
    loading,
    error,
    refetch: fetchProfiles
  };
};
