/* ========================================================================= */
/*  candidateService.ts – Consistent with clientService.ts (clean + typed)   */
/* ========================================================================= */

import type {
  Candidate,
  AddEditCandidate,
  CandidateUpdatePayload,
  CandidateCreateData,
  BulkUploadResponse,
  ResumeBulkUploadResponse,
  ResumeBatchStatusResponse
} from "../types/resumeTypes";

/* ------------------------------------------------------------------------- */
/*  CONFIG                                                                  */
/* ------------------------------------------------------------------------- */
const API_URL: string = import.meta.env.VITE_BASE_URL;
// -------------------- FETCH LOOKUP DATA --------------------
export interface LookupItem {
  lookupKey: number;  // Changed from 'key' to 'lookupKey'
  tag: string;
  value: string;
}

export interface LookupData {
  recruiters: string[];
  statuses: string[];
}

// export const fetchLookupData = async (
//   accessToken: string | null
// ): Promise<LookupData> => {
//   try {
//     const endpoint = `/lookup?page=1&limit=100`;
//     const data = await apiFetch<LookupItem[]>(
//       endpoint,
//       { method: "GET" },
//       accessToken || undefined
//     );

//     const recruiters = (data || [])
//       .filter((item: LookupItem) => item.tag === "recruiter")
//       .map((item: LookupItem) => item.value);

//     const statuses = (data || [])
//       .filter((item: LookupItem) => item.tag === "candidateStatus")
//       .map((item: LookupItem) => item.value);
//     return { recruiters, statuses };
//   } catch (error) {
//     logger.error("Error fetching lookup data:", error);
//     throw error;
//   }
// };

// Keep the individual functions for backward compatibility if needed
// export const fetchRecruiters = async (
//   accessToken: string | null
// ): Promise<string[]> => {
//   const { recruiters } = await fetchLookupData(accessToken);
//   return recruiters;
// };

// export const fetchCandidateStatuses = async (
//   accessToken: string | null
// ): Promise<string[]> => {
//   const { statuses } = await fetchLookupData(accessToken);
//   return statuses;
// };
/* ------------------------------------------------------------------------- */
/*  CACHED LOOKUP FETCH – /candidate/create-data                             */
/* ------------------------------------------------------------------------- */

export const fetchCandidateCreateData = async (
  accessToken: string | null,
  forceRefresh = false
): Promise<CandidateCreateData> => {
  try {
    const endpoint = `/candidate/create-data`;
    const data = await apiFetch<CandidateCreateData>(
      endpoint,
      { method: "GET" },
      accessToken || undefined
    );
    return data;
  } catch (error) {
    logger.error("Error fetching create-data:", error);
    throw error;
  }
};

/* ------------------------------------------------------------------------- */
/*  ROUTES                                                                  */
/* ------------------------------------------------------------------------- */
const ROUTES = {
  BASE: "/candidate",
  BY_ID: (id: number) => `/candidate/${id}`,
  RESUME: (id: number) => `/candidate/${id}/resume`,
  SHARE: (id: number) => `/candidate/${id}/share`,
  BULK_UPLOAD: "/candidate/bulk-upload",   // 👈 ADD THIS
  RESUME_BULK_UPLOAD: "/candidate/resume-bulk-upload",
  RESUME_BULK_STATUS: (batchId: string) =>
    `/candidate/resume-bulk-upload/${batchId}/status`,
};

/* ------------------------------------------------------------------------- */
/*  LOGGER                                                                  */
/* ------------------------------------------------------------------------- */
const logger = {
  //log: (...args: any[]) => IS_DEV && console.log("CANDIDATE LOG:", ...args),
  error: (...args: any[]) => console.error("CANDIDATE ERROR:", ...args),
};

/* ------------------------------------------------------------------------- */
/*  HEADER BUILDER                                                          */
/* ------------------------------------------------------------------------- */
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};


/* ------------------------------------------------------------------------- */
/*  FORM DATA BUILDER                                                       */
/* ------------------------------------------------------------------------- */
const buildCandidateFormData = (candidate: AddEditCandidate): FormData => {
  const fd = new FormData();

  fd.append("candidateName", candidate.candidateName);
  fd.append("recruiterName", candidate.recruiterName ?? "");
  if (candidate.recruiterId !== null && candidate.recruiterId !== undefined) {
    fd.append("recruiterId", String(candidate.recruiterId));
  }
  if (candidate.workModeId !== null && candidate.workModeId !== undefined) {
    fd.append("workModeId", String(candidate.workModeId));
  }
  
  if (candidate.workMode) {
    fd.append("workMode", candidate.workMode);
  }
  if (candidate.vendorId !== null && candidate.vendorId !== undefined) {
    fd.append("vendorId", String(candidate.vendorId));
  }

  if (candidate.referredBy && candidate.referredBy.trim()) {
    fd.append("referredBy", candidate.referredBy.trim());
  }
   fd.append(
    "jobProfileRequirementId",
    String(candidate.jobProfileRequirementId)
  );
  if (candidate.expectedLocation) {
    fd.append("expectedLocation[city]", candidate.expectedLocation.city);
    fd.append("expectedLocation[country]", candidate.expectedLocation.country);
  }

  if (candidate.currentLocation) {
    fd.append("currentLocation[city]", candidate.currentLocation.city);
    fd.append("currentLocation[country]", candidate.currentLocation.country);
  }
   // ✅ New CTC fields
   if (candidate.currentCTCAmount !== null && candidate.currentCTCAmount !== undefined) {
    fd.append("currentCTCAmount", String(candidate.currentCTCAmount));
  }
  console.log("FORM DATA VALUES");
for (const pair of fd.entries()) {
  console.log(pair[0], pair[1]);
}
  if (candidate.currentCTCCurrencyId !== null && candidate.currentCTCCurrencyId !== undefined) {
    fd.append("currentCTCCurrencyId", String(candidate.currentCTCCurrencyId));
  }
  if (candidate.currentCTCTypeId !== null && candidate.currentCTCTypeId !== undefined) {
    fd.append("currentCTCTypeId", String(candidate.currentCTCTypeId));
  }
  if (candidate.expectedCTCAmount !== null && candidate.expectedCTCAmount !== undefined) {
    fd.append("expectedCTCAmount", String(candidate.expectedCTCAmount));
  }
  if (candidate.expectedCTCCurrencyId !== null && candidate.expectedCTCCurrencyId !== undefined) {
    fd.append("expectedCTCCurrencyId", String(candidate.expectedCTCCurrencyId));
  }
  if (candidate.expectedCTCTypeId !== null && candidate.expectedCTCTypeId !== undefined) {
    fd.append("expectedCTCTypeId", String(candidate.expectedCTCTypeId));
  }
  fd.append("noticePeriod", String(candidate.noticePeriod));
  fd.append("experienceYears", String(candidate.experienceYears));
  const contact = candidate.contactNumber?.trim();
  if (contact) fd.append("contactNumber", contact);

  const email = candidate.email?.trim();
  if (email) fd.append("email", email);

  //   if (typeof candidate.currentCTC === "number") {
  //   fd.append("currentCTC", String(candidate.currentCTC));
  // }

  // if (typeof candidate.expectedCTC === "number") {
  //   fd.append("expectedCTC", String(candidate.expectedCTC));
  // }
  if (candidate.notes) fd.append("notes", candidate.notes);
  if (candidate.linkedinProfileUrl && candidate.linkedinProfileUrl.trim()) {
    fd.append("linkedinProfileUrl", candidate.linkedinProfileUrl);
  }

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
      let errorPayload: any;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = { message: response.statusText };
      }
      throw errorPayload; 
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

export const getCandidateById = async (
  accessToken: string | null,
  candidateId: number
): Promise<Candidate> => {
  try {
    const endpoint = `/candidate/${candidateId}`;

    const data = await apiFetch<Candidate>(
      endpoint,
      { method: "GET" },
      accessToken || undefined
    );

    return data;
  } catch (error) {
    logger.error("Error fetching candidate by ID:", error);
    throw error;
  }
};


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

// -------------------- GET --------------------
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
    const data = await apiFetch<Candidate[]>(
      endpoint,
      { method: "GET" },
      accessToken || undefined
    );

    return {
      candidates: data,
      totalCount: data.length,
    };
  } catch (error) {
    logger.error("Error in getCandidates:", error);
    throw error;
  }
};


// -------------------- UPDATE --------------------
export const updateCandidate = async (
  accessToken: string | null,
  candidateId: number,
  updateData: CandidateUpdatePayload 
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/candidate/${candidateId}`, {
      method: "PATCH",
      headers: makeHeaders(accessToken || undefined),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorPayload = await response.json();
      throw errorPayload; // 🔥 forward backend error
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

// -------------------- RESUME SHARE (temporary public link) --------------------
export type ResumeShareLinkResponse = {
  shareUrl: string;
};

export const createResumeShareLink = async (
  accessToken: string | null,
  candidateId: number
): Promise<ResumeShareLinkResponse> => {
  try {
    const endpoint = ROUTES.SHARE(candidateId);
    return await apiFetch<ResumeShareLinkResponse>(
      endpoint,
      { method: "POST", body: JSON.stringify({}) },
      accessToken || undefined
    );
  } catch (error) {
    logger.error("Error creating resume share link:", error);
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
      let errorPayload;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = { message: "Failed to download resume" };
      }
      throw errorPayload;
    }
    return await response.blob();
  } catch (error) {
    logger.error("Error in downloadResume:", error);
    throw error;
  }
};
// -------------------- BULK UPLOAD --------------------
export const bulkUploadCandidates = async (
  accessToken: string | null,
  file: File
): Promise<BulkUploadResponse> => {
  if (!file) {
    throw new Error("File is required for bulk upload");
  }

  const fd = new FormData();
  fd.append("file", file);

  const response = await fetch(`${API_URL}${ROUTES.BULK_UPLOAD}`, {
    method: "POST",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    body: fd,
    credentials: "include",
  });

  let responseBody: any;

  try {
    responseBody = await response.json();
  } catch {
    throw {
      success: false,
      message: "Invalid server response",
    };
  }

  // 🔥 Important: Handle both success and failure explicitly

  if (!response.ok) {
    // 400 errors will come here
    throw responseBody;
  }

  // 201 or 207 will both come here as success
  return responseBody as BulkUploadResponse;
};

/* ------------------------------------------------------------------------- */
/*  RESUME BULK ZIP UPLOAD                                                   */
/* ------------------------------------------------------------------------- */

export const bulkUploadResumes = async (
  accessToken: string | null,
  file: File
): Promise<ResumeBulkUploadResponse> => {
  if (!file) {
    throw new Error("ZIP file is required");
  }

  const fd = new FormData();
  fd.append("zipFile", file);

  const response = await fetch(`${API_URL}${ROUTES.RESUME_BULK_UPLOAD}`, {
    method: "POST",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    body: fd,
    credentials: "include",
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw responseBody;
  }

  return responseBody as ResumeBulkUploadResponse;
};

/* ------------------------------------------------------------------------- */
/*  RESUME BULK STATUS                                                       */
/* ------------------------------------------------------------------------- */

export const getResumeBulkStatus = async (
  accessToken: string | null,
  batchId: string
): Promise<ResumeBatchStatusResponse> => {
  const response = await fetch(
    `${API_URL}${ROUTES.RESUME_BULK_STATUS(batchId)}`,
    {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      credentials: "include",
    }
  );

  const responseBody = await response.json();

  if (!response.ok) {
    throw responseBody;
  }

  return responseBody as ResumeBatchStatusResponse;
};

// -------------------- DIRECT DOWNLOAD LINK (optional) --------------------
export const getResumeDownloadUrl = (candidateId: number): string =>
  `${API_URL}${ROUTES.RESUME(candidateId)}`;

export const getDeletedCandidates = async (
  accessToken: string | null
): Promise<import("../types/resumeTypes").CandidateDeletedResponse> => {
  const response = await fetch(`${API_URL}/candidate/deletions`, {
    credentials: "include",
    headers: makeHeaders(accessToken || undefined),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch deleted candidates");
  }
  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch deleted candidates");
  return data;
};
