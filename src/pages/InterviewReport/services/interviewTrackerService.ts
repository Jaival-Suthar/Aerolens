import { InterviewTrackerResponse } from "../types/interviewTrackertypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

// ✅ Consistent header helper
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
};

// ✅ Consistent response handler (same as working services)
const checkStatus = async (res: Response): Promise<InterviewTrackerResponse> => {
  const contentType = res.headers.get("content-type");

  let body: any = null;

  if (contentType?.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    throw body;
  }

  return body as InterviewTrackerResponse;
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

  // ✅ Default filter
  const filter = params?.filter ?? "past7days";
  query.append("filter", filter);

  // ✅ Date range only when custom
  if (filter === "custom") {
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
  }

  // ✅ Optional filters
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !["filter", "startDate", "endDate"].includes(key)
    ) {
      query.append(key, String(value));
    }
  });

  // 🕒 Browser timezone
  query.append("timezone", getBrowserTimezone());

  const url = `${API_BASE_URL}/interview/report/tracker?${query.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: makeHeaders(accessToken || undefined),
    // ❌ DO NOT include credentials — breaks refresh retry chain
  });

  return await checkStatus(res);
};