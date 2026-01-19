import { InterviewerWorkloadResponse } from "../types/interviewerReporttypes";
const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Reuse same header pattern
const makeHeaders = (accessToken?: string) => {
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
  try {
    const query = new URLSearchParams();

    // ✅ existing params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });

    // 🕒 auto-detect browser timezone (IANA)
    query.append("timezone", getBrowserTimezone());

    const response = await fetch(
      `${API_BASE_URL}/interview/report/interviewer-workload?${query.toString()}`,
      {
        method: "GET",
        headers: makeHeaders(accessToken || undefined),
        // ❌ DO NOT add credentials: "include"
      }
    );

    const result = await response.json();

    // 🔥 preserve backend-controlled errors
    if (!response.ok || !result?.success) {
      throw result;
    }

    return result.data as InterviewerWorkloadResponse;
  } catch (error) {
    console.error("Error fetching interviewer workload report:", error);
    throw error; // UI layer handles toast/message
  }
};