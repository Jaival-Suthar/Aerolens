const BASE_URL: string = import.meta.env.VITE_BASE_URL;
const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}
const checkStatus = async (res: Response) => {
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

  return body;
};
export interface CandidateInterviewRound {
  interviewId: number;
  roundNumber: number;
  totalInterviews: number;
  interviewDate: string;
  fromTime: string;
  toTime: string;
  durationMinutes: number;
  result: string;
  interviewerId: number;
  interviewerName: string;
}

export interface GetCandidateInterviewsResponse {
  success: boolean;
  message: string;
  data: {
    candidateId: number;
    totalRounds: number;
    data: CandidateInterviewRound[];
  };
}

export const getInterviewsByCandidate = async (
  candidateId: number,
  token: string
): Promise<GetCandidateInterviewsResponse> => {
  const url = `${BASE_URL}/interview/candidate/${candidateId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: makeHeaders(token),
  });

  return await checkStatus(res);
};
