// reportService.ts
const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Safe fallback (should never happen in modern browsers)
    return "UTC";
  }
};
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  OverallReportData,
  MonthlyReportData,
  DailyReportData,
  OverallReportResponse,
  MonthlyReportResponse,
  DailyReportResponse,
} from "../types/reportTypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// --------------------------
// Common Headers
// --------------------------
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

export const getOverallReport = async (
  accessToken: string | null
): Promise<OverallReportResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interview/report/overall`, {
      credentials: "include",
      headers: makeHeaders(accessToken || undefined),
    });
    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Unauthorized - invalid or expired token");
      throw new Error(`Failed to fetch overall report: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch overall report");
    }
    return {
      success: true,
      message: data.message,
      data: data.data as OverallReportData,
    };
  } catch (error) {
    console.error("Error in getOverallReport:", error);
    throw error;
  }
};

// GET /report/monthly

export const getMonthlyReport = async (
  accessToken: string | null,
  startDate: string,
  endDate: string
): Promise<MonthlyReportResponse> => {
  try {
    const timezone = getBrowserTimezone();

    const query = new URLSearchParams({
      startDate,
      endDate,
      timezone,
    }).toString();

    const response = await fetch(
      `${API_BASE_URL}/interview/report/monthly?${query}`,
      {
        credentials: "include",
        headers: makeHeaders(accessToken || undefined),
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Unauthorized - invalid or expired token");
      throw new Error(`Failed to fetch monthly report: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch monthly report");
    }

    return {
      success: true,
      message: data.message,
      data: data.data as MonthlyReportData,
    };
  } catch (error) {
    console.error("Error in getMonthlyReport:", error);
    throw error;
  }
};

// --------------------------
// GET Daily Summary Report
// GET /report/daily
// --------------------------
export const getDailyReport = async (
  accessToken: string | null,
  date: string
): Promise<DailyReportResponse> => {
  try {
    const timezone = getBrowserTimezone();

    const query = new URLSearchParams({
      date,
      timezone,
    }).toString();

    const response = await fetch(
      `${API_BASE_URL}/interview/report/daily?${query}`,
      {
        credentials: "include",
        headers: makeHeaders(accessToken || undefined),
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("Unauthorized - invalid or expired token");
      throw new Error(`Failed to fetch daily report: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch daily report");
    }

    return {
      success: true,
      message: data.message,
      data: data.data as DailyReportData,
    };
  } catch (error) {
    console.error("Error in getDailyReport:", error);
    throw error;
  }
};