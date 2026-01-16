import { InterviewerWorkloadResponse } from "../types/interviewerReporttypes";

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
    // Build query params safely
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/interview/report/interviewer-workload?${query.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: makeHeaders(accessToken || undefined),
      }
    );

    const result = await response.json();

    // 🔥 Preserve backend-controlled errors
    if (!response.ok || !result?.success) {
      throw result;
    }

    return result.data as InterviewerWorkloadResponse;
  } catch (error) {
    console.error("Error fetching interviewer workload report:", error);
    throw error; // UI layer will show backend message
  }
};
