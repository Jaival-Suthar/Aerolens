import { useEffect, useState, useCallback } from "react";
import { JobProfile } from "../types/jobProfileTypes";
import { getAllJobProfilesWithJD } from "../services/jobProfileService";

export const useJobProfiles = (token: string | null) => {
  const [data, setData] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllJobProfilesWithJD(token);

      setData(res.data);

    } catch (err: any) {
      console.error(err);

      setError(err?.message || "Failed to load job profiles");
    } finally {
      setLoading(false);
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
