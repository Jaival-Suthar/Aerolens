import { useState, useCallback } from "react";
import {
  getOverallReport,
  getMonthlyReport,
  getDailyReport,
} from "../services/reportService";

import {
  CumulativeInterviewSummary,
  InterviewerStats,
  InterviewDate,
  DailyInterview,
} from "../types/reportTypes";

export const useInterviewData = (accessToken: string | null) => {
  const [loading, setLoading] = useState(false);

  // 🔹 TOP SUMMARY (monthly cumulative)
  const [cumulativeSummary, setCumulativeSummary] =
    useState<CumulativeInterviewSummary>({
      total: 0,
      selected: 0,
      rejected: 0,
      pending: 0,
      cancelled: 0,
    });

  // 🔹 MONTHLY
  const [monthlyInterviewers, setMonthlyInterviewers] =
    useState<InterviewerStats[]>([]);
  const [monthlyInterviewDates, setMonthlyInterviewDates] =
    useState<InterviewDate[]>([]);

  // 🔹 OVERALL
  const [overallInterviewers, setOverallInterviewers] =
    useState<InterviewerStats[]>([]);

  // 🔹 DAILY
  const [dailyInterviews, setDailyInterviews] =
    useState<DailyInterview[]>([]);

  /* --------------------------------------------------
     Fetch Monthly Report
     -------------------------------------------------- */
  const fetchMonthlyReport = async (startDate: string, endDate: string) => {
  try {
    setLoading(true);

    // 🔥 CLEAR STALE DATA IMMEDIATELY
    setMonthlyInterviewDates([]);
    setMonthlyInterviewers([]);

    const response = await getMonthlyReport(accessToken, startDate, endDate);

    if (!response.success) return;

    setCumulativeSummary(response.data.summary);
    setMonthlyInterviewers(response.data.interviewers);
    setMonthlyInterviewDates(response.data.interviewDates);
  } finally {
    setLoading(false);
  }
};


  /* --------------------------------------------------
     Fetch Overall Interviewers
     -------------------------------------------------- */
  const fetchOverallInterviewers = async () => {
    try {
      setLoading(true);
      const response = await getOverallReport(accessToken);
      if (!response.success) return;
      setOverallInterviewers(response.data.interviewers);
    } catch (error) {
      console.error("❌ Error fetching overall report:", error);
      setOverallInterviewers([]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     Fetch Daily Interviews
     -------------------------------------------------- */
  const fetchDailyReport = useCallback(async (date: string) => {
  try {
    setLoading(true);
    const response = await getDailyReport(accessToken, date);
    if (!response.success) return;
    setDailyInterviews(response.data.interviews);
  } finally {
    setLoading(false);
  }
}, [accessToken]);

  return {
    loading,
    // data
    cumulativeSummary,
    monthlyInterviewers,
    monthlyInterviewDates,
    overallInterviewers,
    dailyInterviews,
    // actions
    fetchMonthlyReport,
    fetchOverallInterviewers,
    fetchDailyReport,
  };
};
