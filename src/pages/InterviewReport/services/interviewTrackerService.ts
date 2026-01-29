import { InterviewTrackerResponse } from "../types/interviewTrackertypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

// ✅ Keep header helper consistent
const makeHeaders = (accessToken?: string): HeadersInit => {
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
    interviewerId?: number;
    candidateId?: number;
    result?: "pending" | "selected" | "rejected" | "cancelled";
  }
): Promise<InterviewTrackerResponse> => {
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

  // 🕒 browser timezone
  query.append("timezone", getBrowserTimezone());

  const response = await fetch(
    `${API_BASE_URL}/interview/report/tracker?${query.toString()}`,
    {
      method: "GET",
      headers: makeHeaders(accessToken || undefined),
      credentials: "include", // ✅ CRITICAL
    }
  );

  // 🔥 IMPORTANT: do NOT parse JSON before status check
  if (!response.ok) {
    const error = await response.json();
    throw error; // backend error preserved, interceptor can retry
  }

  const result = await response.json();
  return result as InterviewTrackerResponse;
};