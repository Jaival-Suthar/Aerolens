import { Candidate, AddEditCandidate, CandidateUpdatePayload } from "../types/resumeTypes";
// import { z } from 'zod'; // Use a library like zod for robust schema validation

/**
 * ⚠️ CONFIGURATION CONSTANTS ⚠️
 * Moving magic strings and environment config here.
 */
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;
const IS_DEV = import.meta.env.DEV; // Vite provides this for environment checking
const API_ROUTES = {
  CANDIDATE_BASE: '/candidate',
  CANDIDATE_BY_ID: (id: number) => `/candidate/${id}`,
  RESUME_UPLOAD: (id: number) => `/candidate/${id}/resume`,
  RESUME_DOWNLOAD: (id: number) => `/candidate/${id}/resume`,
};
const FIELD_MAPPING = {
  CLIENT_STATUS_NAME: 'statusName',
  API_STATUS: 'status',
};

/**
 * 🚨 Logger Utility (Replaces all console.log) 🚨
 * In a real app, this would use Winston/Pino and send logs to a backend APM.
 * For this fix, it simply toggles logging based on the environment.
 */
const logger = {
  log: (...args: any[]) => {
    if (IS_DEV) console.log("🔍 API LOG:", ...args);
  },
  error: (...args: any[]) => {
    // In prod, this would hit an error reporting service (Sentry, etc.)
    console.error("💥 API ERROR:", ...args);
  },
};

/**
 * 🔐 Security and Payload Utilities
 */

// Function to simulate getting a secure token (e.g., from a cookie or Auth context)
const getAuthToken = (): string => {
  // 🚨 DANGER: This is a placeholder. Must be implemented securely.
  // E.g., return localStorage.getItem('authToken') || '';
  return 'Bearer-Your-Secure-Token-Here'; 
};

/**
 * 📦 Abstracted FormData Builder (Fixes code duplication)
 */
function buildCandidateFormData(candidate: AddEditCandidate): FormData {
  logger.log("🛠️ Building FormData from candidate data.");
  const formData = new FormData();
  
  // NOTE: This repetitive append logic should ideally be looped over a config map 
  // to further reduce maintenance cost.
  formData.append("candidateName", candidate.candidateName);
  formData.append("contactNumber", candidate.contactNumber);
  formData.append("email", candidate.email);
  formData.append("recruiterName", candidate.recruiterName);
  formData.append("jobRole", candidate.jobRole);
  formData.append("preferredJobLocation", candidate.preferredJobLocation);
  
  // Ensure number types are correctly handled for the API
  formData.append("currentCTC", String(candidate.currentCTC));
  formData.append("expectedCTC", String(candidate.expectedCTC));
  formData.append("noticePeriod", String(candidate.noticePeriod));
  formData.append("experienceYears", String(candidate.experienceYears));
  
  formData.append("linkedinProfileUrl", candidate.linkedinProfileUrl || "");

  if (candidate.resumeFile) {
    formData.append("resume", candidate.resumeFile);
  }
  
  return formData;
}

/**
 * 🛑 Centralized API Fetch Utility (Fixes Content-Type, Error Handling, Auth, Resilience)
 * This utility wraps native fetch to centralize:
 * 1. Auth Headers
 * 2. API Base URL
 * 3. Centralized, Robust Error Handling
 * 4. Resilience (Timeout/Abort/Retry logic could be added here)
 */
interface FetchOptions extends RequestInit {
  timeout?: number; // Resilience: Timeout option added
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  logger.log(`➡️ Sending ${options.method || 'GET'} request to: ${url}`);
  
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  // 1. Add Auth Header (Security Fix)
  if (!headers.has('Authorization')) {
    headers.set('Authorization', getAuthToken());
  }
  
  // 2. Default Content-Type (Only for JSON/non-FormData)
  // CRITICAL FIX: DO NOT set Content-Type for FormData.
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // 3. Resilience: Setup AbortController for basic timeout/cancellation
  const abortController = new AbortController();
  const timeoutId = options.timeout ? setTimeout(() => abortController.abort(), options.timeout) : null;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: abortController.signal, // Connect signal for cancellation
    });
    
    // Clear the timeout if the request finished
    if (timeoutId) clearTimeout(timeoutId);

    logger.log(`⬅️ Response received (Status: ${response.status}) from: ${url}`);

    // 4. Centralized Error Handling
    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        // API Response Handling Fix: Check for common backend error shapes
        errorDetail = errorData.error || errorData.message || JSON.stringify(errorData);
        logger.error(`Failed request details (${url}):`, errorData);
      } catch (e) {
        logger.error(`Failed to parse error body for ${url}`, e);
        errorDetail = await response.text();
      }
      
      const error = new Error(`API Error on ${url} (${response.status}): ${errorDetail}`);
      (error as any).status = response.status; // Attach status for error boundary
      throw error;
    }

    // Handle 204 No Content (e.g., DELETE success)
    if (response.status === 204) {
        return {} as T; 
    }

    const data = await response.json();

    // 5. Hardened API Response Handling Fix (Assume backend wraps data)
    // Return the specific data field, or the entire payload if data.data doesn't exist.
    // In a production setup, a runtime type checker (like Zod) would validate 'data'.
    const finalData = data.data !== undefined ? data.data : data;
    
    // Use a runtime type-checker here: z.object(CandidateSchema).parse(finalData)

    return finalData as T;

  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId); // Just in case
    logger.error(`Unhandled network/fetch error for ${url}:`, error);
    throw error; // Re-throw for caller to catch and display
  }
}

// =========================================================================
// 🚀 EXPORTED SERVICE FUNCTIONS (CLEAN AND FOCUSED)
// =========================================================================

/**
 * CREATE CANDIDATE
 * Uses abstracted FormData builder and the robust apiFetch.
 */
export const createCandidate = async (candidate: AddEditCandidate): Promise<Candidate> => {
  const formData = buildCandidateFormData(candidate);
  
  // CRITICAL FIX: No manual Content-Type header when using FormData.
  const response = await apiFetch<Candidate>(API_ROUTES.CANDIDATE_BASE, {
    method: "POST",
    body: formData,
    timeout: 10000, // Example resilience: 10 second timeout
  });

  return response;
};

/**
 * READ CANDIDATES
 * Uses centralized query building and hardened response checking.
 */
// Define a structure for the expected paginated response (Harden Response Fix)
interface PaginatedCandidatesResponse {
    candidates: Candidate[];
    // Add pagination metadata here (e.g., totalPages: number, totalRecords: number)
}

export const getCandidates = async (pageNumber: number, pageSize: number = 5): Promise<Candidate[]> => {
  const endpoint = `${API_ROUTES.CANDIDATE_BASE}?pageSize=${pageSize}&pageNumber=${pageNumber}`;
  
  // We expect the 'data' field in the API response to contain { candidates: Candidate[] }
  const response = await apiFetch<PaginatedCandidatesResponse>(endpoint, {
    method: "GET",
  });
  
  // Hardened API Response Handling Fix: Safe access with type safety in mind
  if (!response.candidates) {
      logger.error('API returned successfully but expected "candidates" list is missing.');
      return []; // Graceful Fallback Fix
  }

  return response.candidates;
};

/**
 * UPDATE CANDIDATE
 * Uses constants for API path and field mapping.
 */
export const updateCandidate = async (
  id: number,
  candidateData: CandidateUpdatePayload
): Promise<Candidate> => {
  // Filter out undefined/null and handle type mapping (Mapping/Magic String Fix)
  const patchPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(candidateData)) {
    if (value !== undefined && value !== null) {
      if (key === FIELD_MAPPING.CLIENT_STATUS_NAME) {
        // Hardcoded API Path/Data Shape Fix: Map client key to API key
        patchPayload[FIELD_MAPPING.API_STATUS] = value;
      } else {
        patchPayload[key] = value;
      }
    }
  }

  const endpoint = API_ROUTES.CANDIDATE_BY_ID(id);
  
  const response = await apiFetch<Candidate>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(patchPayload),
  });

  return response;
};

/**
 * DELETE CANDIDATE
 * Expects a 204 No Content for a successful deletion.
 */
export const deleteCandidate = async (id: number): Promise<boolean> => {
  const endpoint = API_ROUTES.CANDIDATE_BY_ID(id);
  
  // apiFetch handles 204 (no content) correctly, returning {} as the payload.
  await apiFetch(endpoint, {
    method: "DELETE",
  });

  return true; // If apiFetch doesn't throw, deletion was successful
};

/**
 * UPLOAD RESUME
 * Uses abstracted FormData logic and the robust apiFetch.
 */
export const uploadResume = async (candidateId: number, resumeFile: File): Promise<any> => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  
  const endpoint = API_ROUTES.RESUME_UPLOAD(candidateId);
  
  // CRITICAL FIX: No manual Content-Type header when using FormData.
  const response = await apiFetch<any>(endpoint, {
    method: "POST",
    body: formData,
  });

  return response;
};

/**
 * DOWNLOAD RESUME
 * Inefficient File Download Fix: Return a function to handle the authenticated fetch
 * for safe download, or stick to the direct URL for simplicity/CDN path if appropriate.
 * The secure approach is to *not* expose the URL, but to use an authenticated fetch.
 */
export const secureDownloadResume = async (candidateId: number): Promise<Blob> => {
    const endpoint = API_ROUTES.RESUME_DOWNLOAD(candidateId);
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers();
    headers.set('Authorization', getAuthToken());

    const response = await fetch(url, {
        method: "GET",
        headers: headers,
        // No Content-Type needed for GET
    });

    if (!response.ok) {
        // Centralized error handling for secure downloads
        let errorDetail = await response.text();
        logger.error(`Secure download failed for ID ${candidateId}: ${response.status}`, errorDetail);
        throw new Error(`Failed to download resume. Status: ${response.status}`);
    }
    
    // Return the raw Blob which can be used to create an object URL for download
    return response.blob(); 
};

// Alternative: If the user needs the direct, unauthenticated URL (less safe)
export const getResumeDownloadUrl = (candidateId: number): string => {
    return `${API_BASE_URL}${API_ROUTES.RESUME_DOWNLOAD(candidateId)}`;
};