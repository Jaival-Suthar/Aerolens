/* ========================================================================= */
/*  candidateService.ts – Consistent with clientService.ts (clean + typed)   */
/* ========================================================================= */
/* ------------------------------------------------------------------------- */
/*  CONFIG                                                                  */
/* ------------------------------------------------------------------------- */
const API_URL = import.meta.env.VITE_BASE_URL;
const IS_DEV = import.meta.env.DEV;
/* ------------------------------------------------------------------------- */
/*  ROUTES                                                                  */
/* ------------------------------------------------------------------------- */
const ROUTES = {
    BASE: "/candidate",
    BY_ID: (id) => `/candidate/${id}`,
    RESUME: (id) => `/candidate/${id}/resume`,
};
/* ------------------------------------------------------------------------- */
/*  LOGGER                                                                  */
/* ------------------------------------------------------------------------- */
const logger = {
    //log: (...args: any[]) => IS_DEV && console.log("CANDIDATE LOG:", ...args),
    error: (...args) => console.error("CANDIDATE ERROR:", ...args),
};
/* ------------------------------------------------------------------------- */
/*  HEADER BUILDER                                                          */
/* ------------------------------------------------------------------------- */
const makeHeaders = (accessToken, isFormData = false) => {
    const headers = {};
    if (!isFormData)
        headers["Content-Type"] = "application/json";
    if (accessToken)
        headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
};
/* ------------------------------------------------------------------------- */
/*  FORM DATA BUILDER                                                       */
/* ------------------------------------------------------------------------- */
const buildCandidateFormData = (candidate) => {
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
    if (candidate.resumeFile)
        fd.append("resume", candidate.resumeFile);
    return fd;
};
/* ------------------------------------------------------------------------- */
/*  API FETCH WRAPPER                                                       */
/* ------------------------------------------------------------------------- */
async function apiFetch(endpoint, options = {}, accessToken) {
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
            throw new Error(`API Error (${response.status}) – ${errorText || response.statusText}`);
        }
        if (response.status === 204)
            return {};
        const data = await response.json();
        return (data.data ?? data);
    }
    catch (error) {
        logger.error("Network/API failure:", error);
        throw error;
    }
}
/* ========================================================================= */
/*  EXPORTS – CRUD OPERATIONS                                                */
/* ========================================================================= */
// -------------------- CREATE --------------------
export const createCandidate = async (accessToken, candidate) => {
    try {
        const formData = buildCandidateFormData(candidate);
        const response = await apiFetch(ROUTES.BASE, {
            method: "POST",
            body: formData,
        }, accessToken || undefined);
        return response;
    }
    catch (error) {
        logger.error("Error in createCandidate:", error);
        throw error;
    }
};
export const getCandidates = async (accessToken, page = 1, limit = 10) => {
    try {
        const endpoint = `${ROUTES.BASE}?page=${page}&limit=${limit}`;
        const response = await apiFetch(endpoint, { method: "GET" }, accessToken || undefined);
        return response;
    }
    catch (error) {
        logger.error("Error in getCandidates:", error);
        throw error;
    }
};
// -------------------- UPDATE --------------------
export const updateCandidate = async (accessToken, candidateId, updateData) => {
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
    }
    catch (error) {
        console.error("Error in updateCandidate:", error);
        throw error;
    }
};
// -------------------- DELETE --------------------
export const deleteCandidate = async (accessToken, id) => {
    try {
        if (!id || typeof id !== "number") {
            throw new Error("Valid candidate ID is required for deletion");
        }
        const endpoint = ROUTES.BY_ID(id);
        await apiFetch(endpoint, { method: "DELETE" }, accessToken || undefined);
    }
    catch (error) {
        logger.error("Error in deleteCandidate:", error);
        throw error;
    }
};
// -------------------- RESUME UPLOAD --------------------
export const uploadResume = async (accessToken, candidateId, resumeFile) => {
    try {
        const fd = new FormData();
        fd.append("resume", resumeFile);
        const endpoint = ROUTES.RESUME(candidateId);
        const response = await apiFetch(endpoint, {
            method: "POST",
            body: fd,
        }, accessToken || undefined);
        return response;
    }
    catch (error) {
        logger.error("Error in uploadResume:", error);
        throw error;
    }
};
// -------------------- RESUME DOWNLOAD --------------------
export const downloadResume = async (accessToken, candidateId) => {
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
    }
    catch (error) {
        logger.error("Error in downloadResume:", error);
        throw error;
    }
};
// -------------------- DIRECT DOWNLOAD LINK (optional) --------------------
export const getResumeDownloadUrl = (candidateId) => `${API_URL}${ROUTES.RESUME(candidateId)}`;
