const BASE_URL: string = import.meta.env.VITE_BASE_URL;
import { FinalizeInterviewRequest, FinalizeInterviewResponse } from "../types/interviewTypes";

// -------------------- COMMON HELPERS WITH DEBUG --------------------

const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

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


// GET FORM DATA (candidates, interviewers, recruiters)
export const getInterviewFormData = async (token: string) => {
  const url = `${BASE_URL}/interview/create-data`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(token),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[getInterviewFormData] ERROR:", err);
    throw err;
  }
};

// ---------------------- INTERVIEW SERVICE WITH DEBUG ----------------------

export const getInterviews = async (token: string) => {
  const url = `${BASE_URL}/interview`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(token),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[getInterviews] ERROR OCCURRED:", err);
    throw err;
  }
};

// GET BY ID
export const getInterviewById = async (interviewId: number, token: string) => {
  const url = `${BASE_URL}/interview/${interviewId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(token),
    });
    return await checkStatus(res);
  } catch (err) {
    console.error("[getInterviewById] ERROR:", err);
    throw err;
  }
};

// CREATE
export const createInterview = async (candidateId: number, payload: any, token: string) => {
  const url = `${BASE_URL}/interview/${candidateId}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: makeHeaders(token),
      body: JSON.stringify(payload),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[createInterview] ERROR:", err);
    throw err;
  }
};

// UPDATE
export const updateInterview = async (interviewId: number, payload: any, token: string) => {
  const url = `${BASE_URL}/interview/${interviewId}`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: makeHeaders(token),
      body: JSON.stringify(payload),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[updateInterview] ERROR:", err);
    throw err;
  }
};

// DELETE
export const deleteInterview = async (interviewId: number, token: string) => {
  const url = `${BASE_URL}/interview/${interviewId}`;


  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: makeHeaders(token),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[deleteInterview] ERROR:", err);
    throw err;
  }
};

export const finalizeInterview = async (
  interviewId: number,
  payload: FinalizeInterviewRequest,
  token: string
): Promise<FinalizeInterviewResponse> => {
  const url = `${BASE_URL}/interview/${interviewId}/finalize`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: makeHeaders(token),
      body: JSON.stringify(payload),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[finalizeInterview] ERROR:", err);
    throw err;
  }
};

export const getFinalizeInterviewData = async (
  interviewId: number,
  token: string
) => {
  const url = `${BASE_URL}/interview/${interviewId}/finalize-data`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: makeHeaders(token),
    });

    return await checkStatus(res);
  } catch (err) {
    console.error("[getFinalizeInterviewData] ERROR:", err);
    throw err;
  }
};

