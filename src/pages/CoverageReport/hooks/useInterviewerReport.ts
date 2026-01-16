import { useCallback, useEffect, useState } from "react";
import { getInterviewerWorkloadReport } from "../services/interviewerReportservice";
import { InterviewerReport } from "../types/interviewerReporttypes";

export const useInterviewerReport = (accessToken: string | null) => {
  const [data, setData] = useState<InterviewerReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDefault = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getInterviewerWorkloadReport(accessToken, {
        filter: "past7days",
      });

      setData(result.interviewers ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (!accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getInterviewerWorkloadReport(accessToken, {
          filter: "custom",
          startDate,
          endDate,
        });

        setData(result.interviewers ?? []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load report");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    fetchDefault();
  }, [fetchDefault]);

  return {
    data,
    loading,
    error,
    fetchByDateRange,
    fetchDefault, // 🔥 ADD THIS - needed for Clear button
  };
};