import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// --- MOCK DEFINITIONS & SETUP ---
// Mock Environment Variable and Base URL
const API_BASE_URL = 'http://test-api.com';
// ----------------------------------------------------------------------
// Copy of the functions provided by the user, adapted to the test environment.
// In a real project, these would be imported from `../api/auth`.
// ----------------------------------------------------------------------
const registerUser = async (formData) => {
    try {
        const payload = {
            memberName: formData.fullName,
            memberContact: formData.contactNumber,
            email: formData.email,
            password: formData.password,
            designation: formData.designation,
            isRecruiter: formData.isRecruiter,
        };
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            // ✅ Handle structured backend validation error
            if (data.error === "VALIDATION_ERROR" && Array.isArray(data.details)) {
                const fieldErrors = data.details
                    .map((d) => `${d.field}: ${d.message}`)
                    .join(", ");
                // Throw an Error with a concise message containing all field errors
                throw new Error(fieldErrors || data.message || "Validation failed");
            }
            throw new Error(data.message || "Registration failed");
        }
        // console.log("Registration successful:", data); // Removed console logs for testing
        return data;
    }
    catch (error) {
        // console.error("Registration failed:", error.message); // Removed console logs for testing
        // The inner Error message is correctly propagated
        throw new Error(error.message || "Registration failed");
    }
};
// ✅ Updated to accept token for Authorization
const fetchDesignations = async (token) => {
    const response = await fetch(`${API_BASE_URL}/lookup?page=1&limit=100`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch designations: ${response.status} - ${text}`);
    }
    const result = await response.json();
    const designations = result.data
        .filter((item) => item.tag === "designation")
        .map((item) => item.value);
    return designations;
};
// --- TEST MOCK DATA ---
const mockFormData = {
    fullName: 'Test User',
    contactNumber: '1234567890',
    email: 'test@example.com',
    password: 'Password123!',
    designation: 'Developer',
    isRecruiter: false,
};
const mockDesignationsLookup = {
    data: [
        { id: 1, value: 'Admin', tag: 'designation' },
        { id: 2, value: 'Developer', tag: 'designation' },
        { id: 3, value: 'HR', tag: 'department' }, // Should be filtered out
        { id: 4, value: 'Manager', tag: 'designation' },
    ],
    meta: { total: 4 }
};
const mockToken = 'test-auth-token-123';
// Mock implementation for fetch
const mockFetch = vi.fn();
// Restore the original fetch after tests, set the mock before each test
const originalFetch = global.fetch;
beforeEach(() => {
    mockFetch.mockClear();
    global.fetch = mockFetch;
});
afterEach(() => {
    global.fetch = originalFetch;
});
// --- TEST SUITE FOR registerUser ---
describe('registerUser', () => {
    it('should successfully register a user and return the response data', async () => {
        // Mock successful API response (HTTP 200 OK)
        const mockSuccessResponse = { success: true, message: 'User created', token: 'jwt' };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSuccessResponse,
        });
        const result = await registerUser(mockFormData);
        // 1. Assert fetch call details
        expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/register`, expect.objectContaining({
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                memberName: mockFormData.fullName,
                memberContact: mockFormData.contactNumber,
                email: mockFormData.email,
                password: mockFormData.password,
                designation: mockFormData.designation,
                isRecruiter: mockFormData.isRecruiter,
            }),
        }));
        // 2. Assert return value
        expect(result).toEqual(mockSuccessResponse);
    });
    it('should throw an error for generic HTTP failure (e.g., 401)', async () => {
        // Mock HTTP 401 Unauthorized response
        const mockErrorData = { message: 'Invalid credentials' };
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => mockErrorData,
        });
        await expect(registerUser(mockFormData)).rejects.toThrow('Invalid credentials');
    });
    it('should throw a concatenated error message for VALIDATION_ERROR', async () => {
        // Mock structured validation error
        const mockValidationError = {
            error: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: [
                { field: 'email', message: 'Email format is incorrect' },
                { field: 'password', message: 'Password is too weak' },
            ],
        };
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => mockValidationError,
        });
        await expect(registerUser(mockFormData)).rejects.toThrow('email: Email format is incorrect, password: Password is too weak');
    });
    it('should throw a general error if backend validation details are missing', async () => {
        // Mock validation error without 'details' array
        const mockValidationError = {
            error: 'VALIDATION_ERROR',
            message: 'Generic validation error',
        };
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => mockValidationError,
        });
        await expect(registerUser(mockFormData)).rejects.toThrow('Generic validation error');
    });
    it('should throw a network error if fetch fails', async () => {
        // Mock network failure
        const networkError = new Error('Failed to fetch');
        mockFetch.mockRejectedValueOnce(networkError);
        await expect(registerUser(mockFormData)).rejects.toThrow('Failed to fetch');
    });
});
// --- TEST SUITE FOR fetchDesignations ---
describe('fetchDesignations', () => {
    it('should successfully fetch, filter, and map designations', async () => {
        // Mock successful lookup API response (HTTP 200 OK)
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDesignationsLookup,
            text: async () => JSON.stringify(mockDesignationsLookup),
        });
        const result = await fetchDesignations(mockToken);
        // 1. Assert fetch call details, especially the Authorization header
        expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/lookup?page=1&limit=100`, expect.objectContaining({
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${mockToken}`,
            },
        }));
        // 2. Assert filtering and mapping (only designation tags)
        expect(result).toEqual(['Admin', 'Developer', 'Manager']);
    });
    it('should throw an error for HTTP failure during fetchDesignations', async () => {
        // Mock HTTP 500 Internal Server Error
        const statusText = 'Internal Server Error';
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({}),
            text: async () => statusText,
        });
        await expect(fetchDesignations(mockToken)).rejects.toThrow(`Failed to fetch designations: 500 - ${statusText}`);
    });
    it('should throw an error for empty response text during HTTP failure', async () => {
        // Mock HTTP 403 Forbidden with empty body
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
            json: async () => ({}),
            text: async () => '', // Empty response text
        });
        await expect(fetchDesignations(mockToken)).rejects.toThrow(`Failed to fetch designations: 403 -`);
    });
    it('should throw a network error if fetch fails during designation lookup', async () => {
        // Mock network failure
        const networkError = new Error('DNS resolution failed');
        mockFetch.mockRejectedValueOnce(networkError);
        await expect(fetchDesignations(mockToken)).rejects.toThrow('DNS resolution failed');
    });
});
