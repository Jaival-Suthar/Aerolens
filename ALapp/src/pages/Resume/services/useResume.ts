/* ========================================================================= */
/*  candidateService.ts – Consistent with clientService.ts (clean + typed)   */
/* ========================================================================= */

import type {
  Candidate,
  AddEditCandidate,
  CandidateUpdatePayload,
} from "../types/resumeTypes";

/* ------------------------------------------------------------------------- */
/*  CONFIG                                                                  */
/* ------------------------------------------------------------------------- */
const API_URL: string = import.meta.env.VITE_BASE_URL;
const IS_DEV = import.meta.env.DEV;

/* ------------------------------------------------------------------------- */
/*  ROUTES                                                                  */
/* ------------------------------------------------------------------------- */
const ROUTES = {
  BASE: "/candidate",
  BY_ID: (id: number) => `/candidate/${id}`,
  RESUME: (id: number) => `/candidate/${id}/resume`,
};

/* ------------------------------------------------------------------------- */
/*  LOGGER                                                                  */
/* ------------------------------------------------------------------------- */
const logger = {
  log: (...args: any[]) => IS_DEV && console.log("CANDIDATE LOG:", ...args),
  error: (...args: any[]) => console.error("CANDIDATE ERROR:", ...args),
};

/* ------------------------------------------------------------------------- */
/*  HEADER BUILDER                                                          */
/* ------------------------------------------------------------------------- */
const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

/* ------------------------------------------------------------------------- */
/*  FORM DATA BUILDER                                                       */
/* ------------------------------------------------------------------------- */
const buildCandidateFormData = (candidate: AddEditCandidate): FormData => {
  const fd = new FormData();

  fd.append("candidateName", candidate.candidateName);
  fd.append("contactNumber", candidate.contactNumber);
  fd.append("email", candidate.email);
  fd.append("recruiterName", candidate.recruiterName);
  fd.append("jobRole", candidate.jobRole);
  fd.append("preferredJobLocation", candidate.preferredJobLocation);

  fd.append("currentCTC", String(candidate.currentCTC));
  fd.append("expectedCTC", String(candidate.expectedCTC));
  fd.append("noticePeriod", String(candidate.noticePeriod));
  fd.append("experienceYears", String(candidate.experienceYears));

  fd.append("linkedinProfileUrl", candidate.linkedinProfileUrl ?? "");

  if (candidate.resumeFile) fd.append("resume", candidate.resumeFile);

  return fd;
};

/* ------------------------------------------------------------------------- */
/*  API FETCH WRAPPER                                                       */
/* ------------------------------------------------------------------------- */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = new Headers(options.headers);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error (${response.status}) – ${errorText || response.statusText}`
      );
    }

    if (response.status === 204) return {} as T;
    const data = await response.json();
    return (data.data ?? data) as T;
  } catch (error) {
    logger.error("Network/API failure:", error);
    throw error;
  }
}

/* ========================================================================= */
/*  EXPORTS – CRUD OPERATIONS                                                */
/* ========================================================================= */

// -------------------- CREATE --------------------
export const createCandidate = async (
  accessToken: string | null,
  candidate: AddEditCandidate
): Promise<Candidate> => {
  try {
    const formData = buildCandidateFormData(candidate);

    const response = await apiFetch<Candidate>(
      ROUTES.BASE,
      {
        method: "POST",
        body: formData,
      },
      accessToken || undefined
    );

    return response;
  } catch (error) {
    logger.error("Error in createCandidate:", error);
    throw error;
  }
};

// -------------------- READ (Paginated) --------------------
export interface PaginatedCandidatesResponse {
  candidates: Candidate[];
  totalCount?: number;
}

export const getCandidates = async (
  accessToken: string | null,
  page = 1,
  limit = 10
): Promise<PaginatedCandidatesResponse> => {
  try {
    const endpoint = `${ROUTES.BASE}?page=${page}&limit=${limit}`;
    const response = await apiFetch<PaginatedCandidatesResponse>(
      endpoint,
      { method: "GET" },
      accessToken || undefined
    );

    return response;
  } catch (error) {
    logger.error("Error in getCandidates:", error);
    throw error;
  }
};

// -------------------- UPDATE --------------------
export const updateCandidate = async (
  accessToken: string | null,
  candidateId: number,
  updateData: {
    candidateName: string;
    contactNumber: string;
    email: string;
    recruiterName: string;
    jobRole: string;
    preferredJobLocation: string;
    currentCTC: number;
    expectedCTC: number;
    noticePeriod: number;
    experienceYears: number;
    statusName: string;
    linkedinProfileUrl: string;
  }
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/candidate/${candidateId}`, {
      method: "PATCH",
      headers: makeHeaders(accessToken || undefined),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update candidate: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateCandidate:", error);
    throw error;
  }
};


// -------------------- DELETE --------------------
export const deleteCandidate = async (
  accessToken: string | null,
  id: number
): Promise<void> => {
  try {
    if (!id || typeof id !== "number") {
      throw new Error("Valid candidate ID is required for deletion");
    }

    const endpoint = ROUTES.BY_ID(id);
    await apiFetch(endpoint, { method: "DELETE" }, accessToken || undefined);
  } catch (error) {
    logger.error("Error in deleteCandidate:", error);
    throw error;
  }
};

// -------------------- RESUME UPLOAD --------------------
export const uploadResume = async (
  accessToken: string | null,
  candidateId: number,
  resumeFile: File
): Promise<any> => {
  try {
    const fd = new FormData();
    fd.append("resume", resumeFile);

    const endpoint = ROUTES.RESUME(candidateId);
    const response = await apiFetch<any>(
      endpoint,
      {
        method: "POST",
        body: fd,
      },
      accessToken || undefined
    );

    return response;
  } catch (error) {
    logger.error("Error in uploadResume:", error);
    throw error;
  }
};

// -------------------- RESUME DOWNLOAD --------------------
export const downloadResume = async (
  accessToken: string | null,
  candidateId: number
): Promise<Blob> => {
  try {
    const endpoint = ROUTES.RESUME(candidateId);
    const url = `${API_URL}${endpoint}`;

    const headers = makeHeaders(accessToken || undefined);
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to download resume: ${text}`);
    }
//this is a comment
    return await response.blob();
  } catch (error) {
    logger.error("Error in downloadResume:", error);
    throw error;
  }
};

// -------------------- DIRECT DOWNLOAD LINK (optional) --------------------
export const getResumeDownloadUrl = (candidateId: number): string =>
  `${API_URL}${ROUTES.RESUME(candidateId)}`;
