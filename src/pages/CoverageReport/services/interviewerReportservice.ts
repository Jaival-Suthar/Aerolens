import { InterviewerWorkloadResponse } from "../types/interviewerReporttypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

export const getInterviewerWorkloadReport = async (
  accessToken: string | null,
  params: {
    filter: "today" | "past7days" | "past30days" | "custom";
    startDate?: string;
    endDate?: string;
    interviewerId?: number;
  }
): Promise<InterviewerWorkloadResponse> => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  query.append("timezone", getBrowserTimezone());

  const response = await fetch(
    `${API_BASE_URL}/interview/report/interviewer-workload?${query.toString()}`,
    {
      method: "GET",
      headers: makeHeaders(accessToken || undefined),
      credentials: "include", // ✅ REQUIRED for consistency
    }
  );

  // 🔥 DO NOT parse body before status check
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  const result = await response.json();
  return result.data as InterviewerWorkloadResponse;
};