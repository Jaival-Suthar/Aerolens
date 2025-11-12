// src/Resume/services/__tests__/candidateService.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCandidate, getCandidates, updateCandidate, deleteCandidate, uploadResume, downloadResume, getResumeDownloadUrl, } from './useResume';
// Mock environment variables
const MOCK_BASE_URL = 'https://aerolens-backend.onrender.com';
vi.stubGlobal('import.meta', {
    env: {
        VITE_BASE_URL: MOCK_BASE_URL,
        DEV: false,
    },
});
// Mock AuthContext
vi.mock('../../../shared/auth/AuthContext', () => ({
    useAuth: () => ({
        accessToken: 'mock-token-123'
    })
}));
describe('Candidate Service', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    // =========================================================================
    // CREATE CANDIDATE TESTS
    // =========================================================================
    describe('createCandidate', () => {
        it('should create a candidate successfully', async () => {
            const mockCandidate = {
                candidateName: 'John Doe',
                contactNumber: '1234567890',
                email: 'john@example.com',
                recruiterName: 'Jane Smith',
                jobRole: 'Software Engineer',
                preferredJobLocation: 'New York',
                currentCTC: 100000,
                expectedCTC: 120000,
                statusName: 'Active',
                noticePeriod: 30,
                experienceYears: 5,
                linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
                resumeFile: null,
            };
            const mockResponse = {
                candidateId: 1,
                ...mockCandidate,
                statusName: 'Active',
                resumeFile: undefined,
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: mockResponse }),
            });
            const result = await createCandidate('mock-token-123', mockCandidate);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate`, expect.objectContaining({
                method: 'POST',
                credentials: 'include',
                body: expect.any(FormData),
            }));
            expect(result).toEqual(mockResponse);
        });
        it('should create a candidate with resume file', async () => {
            const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
            const mockCandidate = {
                candidateName: 'John Doe',
                contactNumber: '1234567890',
                email: 'john@example.com',
                recruiterName: 'Jane Smith',
                jobRole: 'Software Engineer',
                preferredJobLocation: 'New York',
                currentCTC: 100000,
                expectedCTC: 120000,
                noticePeriod: 30,
                statusName: 'Active',
                experienceYears: 5,
                linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
                resumeFile: mockFile,
            };
            const mockResponse = {
                candidateId: 1,
                ...mockCandidate,
                statusName: 'Active',
                resumeFilename: 'resume_123.pdf',
                resumeFile: undefined,
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: mockResponse }),
            });
            const result = await createCandidate('mock-token-123', mockCandidate);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate`, expect.objectContaining({
                method: 'POST',
                credentials: 'include',
                body: expect.any(FormData),
            }));
            const callArgs = vi.mocked(fetch).mock.calls[0];
            const formData = callArgs[1]?.body;
            expect(formData.get('resume')).toBe(mockFile);
            expect(result).toEqual(mockResponse);
        });
        it('should handle creation failure with error message', async () => {
            const mockCandidate = {
                candidateName: 'John Doe',
                contactNumber: '1234567890',
                email: 'invalid-email',
                recruiterName: 'Jane Smith',
                jobRole: 'Software Engineer',
                preferredJobLocation: 'New York',
                currentCTC: 100000,
                expectedCTC: 120000,
                noticePeriod: 30,
                statusName: 'Active',
                experienceYears: 5,
                linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
                resumeFile: null,
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: async () => 'Invalid email format',
            });
            await expect(createCandidate('mock-token-123', mockCandidate)).rejects.toThrow('API Error (400)');
        });
    });
    // =========================================================================
    // GET CANDIDATES TESTS
    // =========================================================================
    describe('getCandidates', () => {
        it('should fetch candidates with pagination', async () => {
            const mockCandidates = [
                {
                    candidateId: 1,
                    candidateName: 'John Doe',
                    contactNumber: '1234567890',
                    email: 'john@example.com',
                    recruiterName: 'Jane Smith',
                    jobRole: 'Software Engineer',
                    preferredJobLocation: 'New York',
                    currentCTC: 100000,
                    expectedCTC: 120000,
                    noticePeriod: 30,
                    experienceYears: 5,
                    statusName: 'Active',
                    linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
                },
                {
                    candidateId: 2,
                    candidateName: 'Jane Smith',
                    contactNumber: '0987654321',
                    email: 'jane@example.com',
                    recruiterName: 'Bob Johnson',
                    jobRole: 'Product Manager',
                    preferredJobLocation: 'San Francisco',
                    currentCTC: 90000,
                    expectedCTC: 110000,
                    noticePeriod: 60,
                    experienceYears: 3,
                    statusName: 'Pending',
                    linkedinProfileUrl: 'https://linkedin.com/in/janesmith',
                },
            ];
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: { candidates: mockCandidates, totalCount: 2 } }),
            });
            const result = await getCandidates('mock-token-123', 1, 10);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate?page=1&limit=10`, expect.objectContaining({
                method: 'GET',
                credentials: 'include',
            }));
            expect(result.candidates).toEqual(mockCandidates);
            expect(result.candidates).toHaveLength(2);
            expect(result.totalCount).toBe(2);
        });
        it('should handle empty candidates list', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: { candidates: [] } }),
            });
            const result = await getCandidates('mock-token-123', 1, 10);
            expect(result.candidates).toEqual([]);
            expect(result.candidates).toHaveLength(0);
        });
        it('should use default pagination when not provided', async () => {
            const mockCandidates = [];
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: { candidates: mockCandidates } }),
            });
            await getCandidates('mock-token-123');
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate?page=1&limit=10`, expect.objectContaining({
                method: 'GET',
                credentials: 'include',
            }));
        });
    });
    // =========================================================================
    // UPDATE CANDIDATE TESTS
    // =========================================================================
    describe('updateCandidate', () => {
        it('should update candidate with all data', async () => {
            const updatePayload = {
                candidateName: 'John Updated',
                contactNumber: '1234567890',
                email: 'john.updated@example.com',
                recruiterName: 'Jane Smith',
                jobRole: 'Senior Software Engineer',
                preferredJobLocation: 'New York',
                currentCTC: 110000,
                expectedCTC: 130000,
                noticePeriod: 30,
                experienceYears: 6,
                statusName: 'Active',
                linkedinProfileUrl: 'https://linkedin.com/in/johnupdated',
            };
            const mockResponse = {
                success: true,
                message: 'Candidate updated successfully',
                data: {
                    candidateId: 1,
                    ...updatePayload,
                },
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            });
            const result = await updateCandidate('mock-token-123', 1, updatePayload);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate/1`, expect.objectContaining({
                method: 'PATCH',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token-123',
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(updatePayload),
            }));
            expect(result).toEqual(mockResponse);
        });
        it('should handle update failure', async () => {
            const updatePayload = {
                candidateName: 'John Doe',
                contactNumber: '1234567890',
                email: 'john@example.com',
                recruiterName: 'Jane Smith',
                jobRole: 'Software Engineer',
                preferredJobLocation: 'New York',
                currentCTC: 100000,
                expectedCTC: 120000,
                noticePeriod: 30,
                experienceYears: 5,
                statusName: 'Active',
                linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });
            await expect(updateCandidate('mock-token-123', 999, updatePayload)).rejects.toThrow('Failed to update candidate: Not Found');
        });
    });
    // =========================================================================
    // DELETE CANDIDATE TESTS
    // =========================================================================
    describe('deleteCandidate', () => {
        it('should delete candidate successfully', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 204,
                json: async () => ({}),
            });
            await deleteCandidate('mock-token-123', 1);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate/1`, expect.objectContaining({
                method: 'DELETE',
                credentials: 'include',
            }));
        });
        it('should throw error for invalid candidate ID', async () => {
            await expect(deleteCandidate('mock-token-123', 0)).rejects.toThrow('Valid candidate ID is required for deletion');
        });
        it('should handle delete failure', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: async () => 'Candidate not found',
            });
            await expect(deleteCandidate('mock-token-123', 999)).rejects.toThrow('API Error (404)');
        });
        it('should handle server error on delete', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: async () => 'Database connection failed',
            });
            await expect(deleteCandidate('mock-token-123', 1)).rejects.toThrow('API Error (500)');
        });
    });
    // =========================================================================
    // UPLOAD RESUME TESTS
    // =========================================================================
    describe('uploadResume', () => {
        it('should upload resume successfully', async () => {
            const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
            const mockResponse = {
                message: 'Resume uploaded successfully',
                filename: 'resume_123.pdf',
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: mockResponse }),
            });
            const result = await uploadResume('mock-token-123', 1, mockFile);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate/1/resume`, expect.objectContaining({
                method: 'POST',
                credentials: 'include',
                body: expect.any(FormData),
            }));
            const callArgs = vi.mocked(fetch).mock.calls[0];
            const formData = callArgs[1]?.body;
            expect(formData.get('resume')).toBe(mockFile);
            expect(result).toEqual(mockResponse);
        });
        it('should handle upload failure', async () => {
            const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 413,
                statusText: 'Payload Too Large',
                text: async () => 'File size exceeds limit',
            });
            await expect(uploadResume('mock-token-123', 1, mockFile)).rejects.toThrow('API Error (413)');
        });
    });
    // =========================================================================
    // DOWNLOAD RESUME TESTS
    // =========================================================================
    describe('downloadResume', () => {
        it('should download resume as blob successfully', async () => {
            const mockBlob = new Blob(['resume content'], { type: 'application/pdf' });
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob,
            });
            const result = await downloadResume('mock-token-123', 1);
            expect(fetch).toHaveBeenCalledWith(`${MOCK_BASE_URL}/candidate/1/resume`, expect.objectContaining({
                headers: expect.any(Object),
            }));
            expect(result).toBe(mockBlob);
        });
        it('should handle download failure', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: async () => 'Resume not found',
            });
            await expect(downloadResume('mock-token-123', 1)).rejects.toThrow('Failed to download resume: Resume not found');
        });
        it('should handle server error on download', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: async () => 'Server error',
            });
            await expect(downloadResume('mock-token-123', 1)).rejects.toThrow('Failed to download resume: Server error');
        });
    });
    // =========================================================================
    // GET RESUME DOWNLOAD URL TESTS
    // =========================================================================
    describe('getResumeDownloadUrl', () => {
        it('should return correct download URL', () => {
            const url = getResumeDownloadUrl(1);
            expect(url).toBe(`${MOCK_BASE_URL}/candidate/1/resume`);
        });
        it('should return correct download URL for different candidate IDs', () => {
            expect(getResumeDownloadUrl(1)).toBe(`${MOCK_BASE_URL}/candidate/1/resume`);
            expect(getResumeDownloadUrl(42)).toBe(`${MOCK_BASE_URL}/candidate/42/resume`);
            expect(getResumeDownloadUrl(999)).toBe(`${MOCK_BASE_URL}/candidate/999/resume`);
        });
    });
    // =========================================================================
    // ERROR HANDLING TESTS
    // =========================================================================
    describe('Error Handling', () => {
        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'));
            await expect(getCandidates('mock-token-123', 1, 10)).rejects.toThrow('Network failure');
        });
        it('should handle timeout errors', async () => {
            vi.mocked(fetch).mockImplementationOnce(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 100)));
            await expect(getCandidates('mock-token-123', 1, 10)).rejects.toThrow();
        });
        it('should handle malformed JSON responses', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => {
                    throw new Error('Unexpected token in JSON');
                },
            });
            await expect(getCandidates('mock-token-123', 1, 10)).rejects.toThrow();
        });
    });
});
