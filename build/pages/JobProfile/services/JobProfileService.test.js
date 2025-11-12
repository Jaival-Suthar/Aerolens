import { describe, test, expect, beforeEach, vi } from 'vitest';
import { getClients, getDepartments, getJobProfiles, getJobProfileById, createJobProfile, updateJobProfile, deleteJobProfile, validateJobProfileRequest, } from '../services/jobProfileService';
// ✅ Mock AuthContext FIRST
vi.mock('../../../shared/auth/AuthContext', () => ({
    useAuth: () => ({
        accessToken: 'mock-token-123'
    })
}));
// Mock fetch globally
global.fetch = vi.fn();
describe('jobProfileService', () => {
    const mockFetch = global.fetch;
    const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';
    beforeEach(() => {
        vi.clearAllMocks();
    });
    // Helper to create mock responses
    const createMockResponse = (data, ok = true) => ({
        ok,
        status: ok ? 200 : 400,
        json: async () => data,
        text: async () => JSON.stringify(data),
    });
    describe('getClients', () => {
        test('fetches and maps clients successfully', async () => {
            const mockData = {
                success: true,
                data: [
                    {
                        clientId: 1,
                        clientName: 'Client A',
                        departments: [
                            { departmentId: 101, departmentName: 'Dept A1' },
                            { departmentId: 102, departmentName: 'Dept A2' },
                        ],
                    },
                    {
                        clientId: 2,
                        clientName: 'Client B',
                        departments: [
                            { departmentId: 201, departmentName: 'Dept B1' },
                        ],
                    },
                ],
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockData));
            const result = await getClients('mock-token-123');
            expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/client/all`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token-123'
                }
            });
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                clientId: 1,
                clientName: 'Client A',
                departments: [
                    { departmentId: 101, departmentName: 'Dept A1' },
                    { departmentId: 102, departmentName: 'Dept A2' },
                ],
            });
            expect(result[1].departments).toHaveLength(1);
        });
        test('throws error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(getClients('mock-token-123')).rejects.toThrow('Failed to fetch clients: 400');
        });
        test('throws error when API returns success: false', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Database connection error',
            }));
            await expect(getClients('mock-token-123')).rejects.toThrow('Database connection error');
        });
        test('throws default error message when no message provided', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
            }));
            await expect(getClients('mock-token-123')).rejects.toThrow('Failed to fetch clients');
        });
    });
    describe('getDepartments', () => {
        test('fetches departments successfully', async () => {
            const mockData = {
                success: true,
                departments: [
                    { departmentId: 1, departmentName: 'Engineering' },
                    { departmentId: 2, departmentName: 'Sales' },
                ],
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockData));
            const result = await getDepartments('mock-token-123');
            expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/departments`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token-123'
                }
            });
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ departmentId: 1, departmentName: 'Engineering' });
        });
        test('throws error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(getDepartments('mock-token-123')).rejects.toThrow('Failed to fetch departments: 400');
        });
        test('throws error when API returns success: false', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Unauthorized access',
            }));
            await expect(getDepartments('mock-token-123')).rejects.toThrow('Unauthorized access');
        });
    });
    describe('getJobProfiles', () => {
        test('fetches and maps job profiles with clients', async () => {
            const mockJobProfileData = {
                success: true,
                message: 'Success',
                data: [
                    {
                        jobProfileId: 1,
                        clientId: 1,
                        departmentId: 101,
                        clientName: 'Client A',
                        departmentName: 'Dept A1',
                        jobProfileDescription: 'Full Stack Developer',
                        jobRole: 'Developer',
                        techSpecification: 'React, Node.js',
                        positions: 2,
                        receivedOn: '2024-01-01',
                        estimatedCloseDate: '2024-12-31',
                        locationName: 'Remote',
                        statusName: 'In Progress',
                    },
                ],
            };
            const mockClientData = {
                success: true,
                data: [
                    {
                        clientId: 1,
                        clientName: 'Client A',
                        departments: [{ departmentId: 101, departmentName: 'Dept A1' }],
                    },
                ],
            };
            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockJobProfileData))
                .mockResolvedValueOnce(createMockResponse(mockClientData));
            const result = await getJobProfiles('mock-token-123');
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenNthCalledWith(1, `${API_BASE_URL}/jobProfile`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token-123'
                }
            });
            expect(mockFetch).toHaveBeenNthCalledWith(2, `${API_BASE_URL}/client/all`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token-123'
                }
            });
            expect(result.jobProfiles.success).toBe(true);
            expect(result.jobProfiles.data).toHaveLength(1);
            expect(result.jobProfiles.data[0].location).toBe('Remote');
            expect(result.jobProfiles.data[0].status).toBe('In Progress');
            expect(result.clients).toHaveLength(1);
        });
        test('maps job profile with fallback location field', async () => {
            const mockData = {
                success: true,
                message: 'Success',
                data: [
                    {
                        jobProfileId: 1,
                        clientId: 1,
                        departmentId: 101,
                        clientName: 'Client A',
                        departmentName: 'Dept A1',
                        jobProfileDescription: 'Developer',
                        jobRole: 'Dev',
                        techSpecification: 'React',
                        positions: 1,
                        receivedOn: '2024-01-01',
                        estimatedCloseDate: '2024-12-31',
                        location: 'Onsite', // Using 'location' instead of 'locationName'
                        status: 'Pending',
                    },
                ],
            };
            const mockClientData = { success: true, data: [] };
            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockData))
                .mockResolvedValueOnce(createMockResponse(mockClientData));
            const result = await getJobProfiles('mock-token-123');
            expect(result.jobProfiles.data[0].location).toBe('Onsite');
            expect(result.jobProfiles.data[0].status).toBe('Pending');
        });
        test('maps job profile with default values for missing fields', async () => {
            const mockData = {
                success: true,
                message: 'Success',
                data: [
                    {
                        jobProfileId: 1,
                        jobProfileDescription: 'Developer',
                        jobRole: 'Dev',
                        techSpecification: 'React',
                        positions: 1,
                        receivedOn: '2024-01-01',
                        estimatedCloseDate: '2024-12-31',
                        // Missing: clientId, departmentId, clientName, departmentName, location, status
                    },
                ],
            };
            const mockClientData = { success: true, data: [] };
            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockData))
                .mockResolvedValueOnce(createMockResponse(mockClientData));
            const result = await getJobProfiles('mock-token-123');
            expect(result.jobProfiles.data[0].clientId).toBe(0);
            expect(result.jobProfiles.data[0].departmentId).toBe(0);
            expect(result.jobProfiles.data[0].clientName).toBe('');
            expect(result.jobProfiles.data[0].departmentName).toBe('');
            expect(result.jobProfiles.data[0].location).toBe('');
            expect(result.jobProfiles.data[0].status).toBe('Pending');
        });
        test('throws error when job profiles fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(getJobProfiles('mock-token-123')).rejects.toThrow('Failed to fetch job profiles: 400');
        });
        test('throws error when job profiles API returns success: false', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Server error',
            }));
            await expect(getJobProfiles('mock-token-123')).rejects.toThrow('Server error');
        });
        test('throws error when clients fetch fails after successful job profiles fetch', async () => {
            const mockJobProfileData = {
                success: true,
                message: 'Success',
                data: [],
            };
            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockJobProfileData))
                .mockResolvedValueOnce(createMockResponse({}, false));
            await expect(getJobProfiles('mock-token-123')).rejects.toThrow('Failed to fetch clients: 400');
        });
    });
    describe('getJobProfileById', () => {
        test('fetches and maps job profile by ID', async () => {
            const mockData = {
                success: true,
                message: 'Job profile found',
                data: {
                    jobProfileId: 1,
                    clientId: 1,
                    departmentId: 101,
                    clientName: 'Client A',
                    departmentName: 'Dept A1',
                    jobProfileDescription: 'Full Stack Developer',
                    jobRole: 'Developer',
                    techSpecification: 'React, Node.js',
                    positions: 2,
                    receivedOn: '2024-01-01',
                    estimatedCloseDate: '2024-12-31',
                    locationName: 'Remote',
                    statusName: 'In Progress',
                },
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockData));
            const result = await getJobProfileById('mock-token-123', 1);
            expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/jobProfile/1`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token-123'
                }
            });
            expect(result.success).toBe(true);
            expect(result.data.jobProfileId).toBe(1);
            expect(result.data.location).toBe('Remote');
            expect(result.data.status).toBe('In Progress');
        });
        test('throws error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(getJobProfileById('mock-token-123', 1)).rejects.toThrow('Failed to fetch job profile: 400');
        });
        test('throws error when API returns success: false', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Job profile not found',
            }));
            await expect(getJobProfileById('mock-token-123', 1)).rejects.toThrow('Job profile not found');
        });
        test('throws default error when no message provided', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
            }));
            await expect(getJobProfileById('mock-token-123', 1)).rejects.toThrow('Job profile not found');
        });
    });
    describe('createJobProfile', () => {
        const validJobProfileData = {
            clientId: 1,
            departmentId: 101,
            jobProfileDescription: 'Full Stack Developer position',
            jobRole: 'Developer',
            techSpecification: 'React, Node.js',
            positions: 2,
            estimatedCloseDate: '2024-12-31',
            location: 'Remote',
            status: 'In Progress',
        };
        test('creates job profile successfully', async () => {
            const mockResponse = {
                success: true,
                message: 'Job profile created successfully',
                data: {
                    jobProfileId: 1,
                    ...validJobProfileData,
                    receivedOn: '2024-01-01',
                    clientName: 'Client A',
                    departmentName: 'Dept A1',
                    locationName: 'Remote',
                    statusName: 'In Progress',
                },
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));
            const result = await createJobProfile('mock-token-123', validJobProfileData);
            expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/jobProfile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token-123' },
                body: JSON.stringify({
                    ...validJobProfileData,
                    receivedOn: undefined,
                }),
                credentials: 'include'
            });
            expect(result.success).toBe(true);
            expect(result.data.jobProfileId).toBe(1);
        });
        test('removes receivedOn from request payload', async () => {
            const mockResponse = {
                success: true,
                message: 'Created',
                data: { jobProfileId: 1, ...validJobProfileData, receivedOn: '2024-01-01' },
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));
            await createJobProfile('mock-token-123', validJobProfileData);
            const callArgs = mockFetch.mock.calls[0][1];
            const requestBody = JSON.parse(callArgs.body);
            expect(requestBody.receivedOn).toBeUndefined();
        });
        test('throws error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(createJobProfile('mock-token-123', validJobProfileData)).rejects.toThrow('Failed to create job profile: 400');
        });
        test('handles validation error from API', async () => {
            const mockResponse = {
                success: false,
                error: 'VALIDATION_ERROR',
                details: [
                    { message: 'Client ID is required' },
                    { message: 'Job role must be at least 2 characters' },
                ],
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));
            await expect(createJobProfile('mock-token-123', validJobProfileData)).rejects.toThrow('Client ID is required, Job role must be at least 2 characters');
        });
        test('throws default error when API returns success: false without details', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Duplicate entry',
            }));
            await expect(createJobProfile('mock-token-123', validJobProfileData)).rejects.toThrow('Duplicate entry');
        });
        test('throws default error message when no message provided', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
            }));
            await expect(createJobProfile('mock-token-123', validJobProfileData)).rejects.toThrow('Failed to create job profile');
        });
    });
    describe('updateJobProfile', () => {
        const updateData = {
            jobRole: 'Senior Developer',
            positions: 3,
        };
        test('updates job profile successfully', async () => {
            const mockResponse = {
                success: true,
                message: 'Job profile updated successfully',
                data: {
                    jobProfileId: 1,
                    clientId: 1,
                    departmentId: 101,
                    clientName: 'Client A',
                    departmentName: 'Dept A1',
                    jobProfileDescription: 'Full Stack Developer',
                    jobRole: 'Senior Developer',
                    techSpecification: 'React, Node.js',
                    positions: 3,
                    receivedOn: '2024-01-01',
                    estimatedCloseDate: '2024-12-31',
                    locationName: 'Remote',
                    statusName: 'In Progress',
                },
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));
            const result = await updateJobProfile('mock-token-123', 1, updateData);
            expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/jobProfile/1`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token-123' },
                body: JSON.stringify(updateData),
                credentials: 'include'
            });
            expect(result.success).toBe(true);
            expect(result.data.jobRole).toBe('Senior Developer');
            expect(result.data.positions).toBe(3);
        });
        test('throws error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(updateJobProfile('mock-token-123', 1, updateData)).rejects.toThrow('Failed to update job profile: 400');
        });
        test('handles validation error from API', async () => {
            const mockResponse = {
                success: false,
                error: 'VALIDATION_ERROR',
                details: [
                    { message: 'Positions must be at least 1' },
                ],
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));
            await expect(updateJobProfile('mock-token-123', 1, updateData)).rejects.toThrow('Positions must be at least 1');
        });
        test('throws error when API returns success: false', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Job profile not found',
            }));
            await expect(updateJobProfile('mock-token-123', 1, updateData)).rejects.toThrow('Job profile not found');
        });
        test('throws default error message when no message provided', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
            }));
            await expect(updateJobProfile('mock-token-123', 1, updateData)).rejects.toThrow('Failed to update job profile');
        });
    });
    describe('deleteJobProfile', () => {
        test('deletes job profile successfully', async () => {
            const mockResponse = {
                success: true,
                message: 'Job profile deleted successfully',
            };
            mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));
            const result = await deleteJobProfile('mock-token-123', 1);
            expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/jobProfile/1`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token-123'
                }
            });
            expect(result.success).toBe(true);
            expect(result.data).toBeNull();
        });
        test('throws error when fetch fails', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({}, false));
            await expect(deleteJobProfile('mock-token-123', 1)).rejects.toThrow('Failed to delete job profile: {}');
        });
        test('throws error when API returns success: false', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
                message: 'Cannot delete job profile with associated candidates',
            }));
            await expect(deleteJobProfile('mock-token-123', 1)).rejects.toThrow('Cannot delete job profile with associated candidates');
        });
        test('throws default error message when no message provided', async () => {
            mockFetch.mockResolvedValueOnce(createMockResponse({
                success: false,
            }));
            await expect(deleteJobProfile('mock-token-123', 1)).rejects.toThrow('Failed to delete job profile');
        });
    });
    describe('validateJobProfileRequest', () => {
        const validData = {
            clientId: 1,
            departmentId: 101,
            jobProfileDescription: 'Full Stack Developer position with 5 years experience',
            jobRole: 'Senior Developer',
            techSpecification: 'React, Node.js, MongoDB',
            positions: 2,
            estimatedCloseDate: '2025-12-31',
            location: 'Remote',
            status: 'In Progress',
        };
        test('returns no errors for valid data', () => {
            const errors = validateJobProfileRequest(validData);
            expect(errors).toHaveLength(0);
        });
        test('validates required clientId', () => {
            const errors = validateJobProfileRequest({ ...validData, clientId: undefined });
            expect(errors).toContain('Client is required');
        });
        test('validates required departmentId', () => {
            const errors = validateJobProfileRequest({ ...validData, departmentId: undefined });
            expect(errors).toContain('Department is required');
        });
        test('validates required jobProfileDescription', () => {
            const errors = validateJobProfileRequest({ ...validData, jobProfileDescription: '' });
            expect(errors).toContain('Job Profile Description is required');
        });
        test('validates jobProfileDescription whitespace', () => {
            const errors = validateJobProfileRequest({ ...validData, jobProfileDescription: '   ' });
            expect(errors).toContain('Job Profile Description is required');
        });
        test('validates jobProfileDescription minimum length', () => {
            const errors = validateJobProfileRequest({ ...validData, jobProfileDescription: 'Short' });
            expect(errors).toContain('Job Profile Description must be at least 10 characters');
        });
        test('validates jobProfileDescription maximum length', () => {
            const errors = validateJobProfileRequest({
                ...validData,
                jobProfileDescription: 'x'.repeat(501)
            });
            expect(errors).toContain('Job Profile Description must not exceed 500 characters');
        });
        test('validates required jobRole', () => {
            const errors = validateJobProfileRequest({ ...validData, jobRole: '' });
            expect(errors).toContain('Job Role is required');
        });
        test('validates jobRole whitespace', () => {
            const errors = validateJobProfileRequest({ ...validData, jobRole: '   ' });
            expect(errors).toContain('Job Role is required');
        });
        test('validates jobRole minimum length', () => {
            const errors = validateJobProfileRequest({ ...validData, jobRole: 'X' });
            expect(errors).toContain('Job Role must be at least 2 characters');
        });
        test('validates jobRole maximum length', () => {
            const errors = validateJobProfileRequest({ ...validData, jobRole: 'x'.repeat(101) });
            expect(errors).toContain('Job Role must not exceed 100 characters');
        });
        test('validates required techSpecification', () => {
            const errors = validateJobProfileRequest({ ...validData, techSpecification: '' });
            expect(errors).toContain('Tech Specification is required');
        });
        test('validates techSpecification whitespace', () => {
            const errors = validateJobProfileRequest({ ...validData, techSpecification: '   ' });
            expect(errors).toContain('Tech Specification is required');
        });
        test('validates techSpecification individual items minimum length', () => {
            const errors = validateJobProfileRequest({
                ...validData,
                techSpecification: 'React, X, Node.js'
            });
            expect(errors).toContain('Each tech specification must be at least 2 characters');
        });
        test('validates positions minimum value', () => {
            const errors = validateJobProfileRequest({ ...validData, positions: 0 });
            expect(errors).toContain('Positions must be at least 1');
        });
        test('validates positions undefined', () => {
            const errors = validateJobProfileRequest({ ...validData, positions: undefined });
            expect(errors).toContain('Positions must be at least 1');
        });
        test('validates required estimatedCloseDate', () => {
            const errors = validateJobProfileRequest({ ...validData, estimatedCloseDate: '' });
            expect(errors).toContain('Estimated Close Date is required');
        });
        test('validates estimatedCloseDate is in future', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const errors = validateJobProfileRequest({
                ...validData,
                estimatedCloseDate: yesterday.toISOString().split('T')[0]
            });
            expect(errors).toContain('Estimated Close Date must be in the future');
        });
        test('accepts estimatedCloseDate as today', () => {
            const today = new Date().toISOString().split('T')[0];
            const errors = validateJobProfileRequest({
                ...validData,
                estimatedCloseDate: today
            });
            expect(errors).not.toContain('Estimated Close Date must be in the future');
        });
        test('validates required location', () => {
            const errors = validateJobProfileRequest({ ...validData, location: '' });
            expect(errors).toContain('Location is required');
        });
        test('validates location whitespace', () => {
            const errors = validateJobProfileRequest({ ...validData, location: '   ' });
            expect(errors).toContain('Location is required');
        });
        test('validates required status', () => {
            const errors = validateJobProfileRequest({ ...validData, status: undefined });
            expect(errors).toContain('Status is required');
        });
        test('returns multiple errors for multiple issues', () => {
            const errors = validateJobProfileRequest({
                jobProfileDescription: 'Short',
                jobRole: 'X',
                techSpecification: 'A',
                positions: 0,
            });
            expect(errors.length).toBeGreaterThan(5);
            expect(errors).toContain('Client is required');
            expect(errors).toContain('Department is required');
            expect(errors).toContain('Job Profile Description must be at least 10 characters');
            expect(errors).toContain('Job Role must be at least 2 characters');
            expect(errors).toContain('Each tech specification must be at least 2 characters');
            expect(errors).toContain('Positions must be at least 1');
        });
        test('handles empty object', () => {
            const errors = validateJobProfileRequest({});
            expect(errors.length).toBeGreaterThan(0);
            expect(errors).toContain('Client is required');
            expect(errors).toContain('Department is required');
        });
    });
});
