import { useCallback, useState } from "react";
import { getInterviewTrackerReport } from "../services/interviewTrackerService";
import { InterviewTrackerItem } from "../types/interviewTrackertypes";

type ResultType = "pending" | "selected" | "rejected" | "cancelled";

export const useInterviewTrackerReport = (accessToken: string | null) => {
  const [data, setData] = useState<InterviewTrackerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Default fetch (past 7 days)
  const fetchDefault = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getInterviewTrackerReport(accessToken);
      setData(result.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load interview tracker");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // ✅ Custom date range
  const fetchByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getInterviewTrackerReport(accessToken, {
          filter: "custom",
          startDate,
          endDate,
        });

        setData(result.data ?? []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load interview tracker");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // ✅ Advanced filters (future-safe)
  const fetchWithFilters = useCallback(
    async (filters: {
      filter?: "today" | "past7days" | "custom";
      startDate?: string;
      endDate?: string;
      interviewerId?: number;
      candidateId?: number;
      result?: ResultType;
    }) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getInterviewTrackerReport(accessToken, filters);
        setData(result.data ?? []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load interview tracker");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  return {
    data,
    loading,
    error,

    fetchDefault,
    fetchByDateRange,
    fetchWithFilters,
  };
};
