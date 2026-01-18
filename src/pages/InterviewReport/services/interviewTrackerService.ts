import { InterviewTrackerResponse } from "../types/interviewTrackertypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Reuse same header pattern
const makeHeaders = (accessToken?: string) => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

export const getInterviewTrackerReport = async (
  accessToken: string | null,
  params?: {
    filter?: "today" | "past7days" | "custom";
    startDate?: string;
    endDate?: string;

    // future-safe (backend already supports these)
    interviewerId?: number;
    candidateId?: number;
    result?: "pending" | "selected" | "rejected" | "cancelled";
  }
): Promise<InterviewTrackerResponse> => {
  try {
    const query = new URLSearchParams();

    // ✅ default filter
    const filter = params?.filter ?? "past7days";
    query.append("filter", filter);

    // ✅ date range only when custom
    if (filter === "custom") {
      if (params?.startDate) query.append("startDate", params.startDate);
      if (params?.endDate) query.append("endDate", params.endDate);
    }

    // ✅ optional filters
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        !["filter", "startDate", "endDate"].includes(key)
      ) {
        query.append(key, String(value));
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/interview/report/tracker?${query.toString()}`,
      {
        method: "GET",
        headers: makeHeaders(accessToken || undefined),
      }
    );

    const result = await response.json();

    // 🔥 preserve backend-controlled errors
    if (!response.ok || !result?.success) {
      throw result;
    }

    return result as InterviewTrackerResponse;
  } catch (error) {
    console.error("Error fetching interview tracker report:", error);
    throw error; // UI handles toast/message
  }
};