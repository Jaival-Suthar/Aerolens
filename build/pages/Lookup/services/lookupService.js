const API_BASE_URL = import.meta.env.VITE_BASE_URL;
/**
 * ✅ Build headers safely for both JSON and FormData requests
 */
const makeHeaders = (accessToken, isFormData = false) => {
    const headers = {};
    if (!isFormData)
        headers["Content-Type"] = "application/json";
    if (accessToken)
        headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
};
/**
 * ✅ Common response handler
 */
async function checkStatus(res) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
}
/**
 * 🔹 Lookup API Service
 */
export const lookupService = {
    /**
     * Get all lookups with pagination
     */
    async getAll(accessToken, page = 1, limit = 10) {
        const url = `${API_BASE_URL}/lookup?page=${page}&limit=${limit}`;
        const res = await fetch(url, {
            method: "GET",
            headers: makeHeaders(accessToken),
            // ❌ no credentials: 'include' — prevents cookie-based reauth conflicts
        });
        return checkStatus(res);
    },
    /**
     * Get a single lookup by key
     */
    async getByKey(accessToken, lookupKey) {
        if (!lookupKey || lookupKey <= 0) {
            throw new Error("Invalid lookupKey provided");
        }
        const url = `${API_BASE_URL}/lookup/${lookupKey}`;
        const res = await fetch(url, {
            method: "GET",
            headers: makeHeaders(accessToken),
        });
        return checkStatus(res);
    },
    /**
     * Create a new lookup entry
     */
    async create(accessToken, payload) {
        if (!payload?.tag?.trim() || !payload?.value?.trim()) {
            throw new Error("Payload validation failed: tag and value are required");
        }
        const url = `${API_BASE_URL}/lookup`;
        const res = await fetch(url, {
            method: "POST",
            headers: makeHeaders(accessToken),
            body: JSON.stringify(payload),
        });
        return checkStatus(res);
    },
    /**
     * Update an existing lookup entry
     */
    async update(accessToken, lookupKey, payload) {
        if (!lookupKey || lookupKey <= 0) {
            throw new Error("Invalid lookupKey provided");
        }
        const url = `${API_BASE_URL}/lookup/${lookupKey}`;
        const res = await fetch(url, {
            method: "PUT",
            headers: makeHeaders(accessToken),
            body: JSON.stringify(payload),
        });
        return checkStatus(res);
    },
    /**
     * Delete a lookup entry
     */
    async delete(accessToken, lookupKey) {
        if (!lookupKey || lookupKey <= 0) {
            throw new Error("Invalid lookupKey provided");
        }
        const url = `${API_BASE_URL}/lookup/${lookupKey}`;
        const res = await fetch(url, {
            method: "DELETE",
            headers: makeHeaders(accessToken),
        });
        return checkStatus(res);
    },
};
