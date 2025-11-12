const API_URL = import.meta.env.VITE_BASE_URL;
const IS_DEV = import.meta.env.DEV;
const logger = {
    //log: (...args: any[]) => IS_DEV && console.log("DEPARTMENT LOG:", ...args),
    error: (...args) => console.error("DEPARTMENT ERROR:", ...args),
};
/* ------------------------------------------------------------------------- */
/*  HEADER BUILDER                                                           */
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
/*  GLOBAL API FETCH HELPER                                                  */
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
        const response = await fetch(url, { ...options, headers, credentials: "include" });
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
/*  CRUD OPERATIONS                                                          */
/* ========================================================================= */
// -------------------- GET DEPARTMENTS --------------------
export const getDepartments = async (accessToken, clientId) => {
    try {
        const endpoint = `/client/${clientId}`;
        const response = await apiFetch(endpoint, { method: "GET" }, accessToken || undefined);
        return response;
    }
    catch (error) {
        logger.error("Error in getDepartments:", error);
        throw error;
    }
};
// -------------------- ADD DEPARTMENT --------------------
export const addDepartment = async (accessToken, payload) => {
    try {
        return await apiFetch(`/department`, {
            method: "POST",
            body: JSON.stringify(payload),
        }, accessToken || undefined);
    }
    catch (error) {
        logger.error("Error in addDepartment:", error);
        throw error;
    }
};
// -------------------- UPDATE DEPARTMENT --------------------
export const updateDepartment = async (accessToken, payload) => {
    try {
        const { departmentId, departmentName, departmentDescription } = payload;
        const updateBody = {};
        if (departmentName)
            updateBody.departmentName = departmentName;
        if (departmentDescription)
            updateBody.departmentDescription = departmentDescription;
        if (!departmentName && !departmentDescription) {
            throw new Error("At least one field required for update");
        }
        return await apiFetch(`/department/${departmentId}`, {
            method: "PATCH",
            body: JSON.stringify(updateBody),
        }, accessToken || undefined);
    }
    catch (error) {
        logger.error("Error in updateDepartment:", error);
        throw error;
    }
};
// -------------------- DELETE DEPARTMENT --------------------
export const deleteDepartment = async (accessToken, id) => {
    try {
        if (!id || typeof id !== "number")
            throw new Error("Valid department ID required");
        await apiFetch(`/department/${id}`, { method: "DELETE" }, accessToken || undefined);
    }
    catch (error) {
        logger.error("Error in deleteDepartment:", error);
        throw error;
    }
};
