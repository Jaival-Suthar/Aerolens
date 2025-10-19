// src/Resume/services/__tests__/candidateService.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createCandidate,
  getCandidates,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  secureDownloadResume,
  getResumeDownloadUrl,
} from './useResume';
import type { Candidate, AddEditCandidate, CandidateUpdatePayload } from '../types/resumeTypes';

// Mock environment variables
const MOCK_BASE_URL = 'https://aerolens-backend.onrender.com';
vi.stubGlobal('import.meta', {
  env: {
    VITE_BASE_URL: MOCK_BASE_URL,
    DEV: false, // Set to false to suppress console logs during tests
  },
});

describe('Candidate Service', () => {
  beforeEach(() => {
    // Mock global fetch
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
      const mockCandidate: AddEditCandidate = {
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
        resumeFile: null,
      };

      const mockResponse: Candidate = {
        candidateId: 1,
        ...mockCandidate,
        resumeFile: undefined,
      } as any;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      });

      const result = await createCandidate(mockCandidate);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a candidate with resume file', async () => {
      const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const mockCandidate: AddEditCandidate = {
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
        resumeFile: mockFile,
      };

      const mockResponse: Candidate = {
        candidateId: 1,
        ...mockCandidate,
        resumeFilename: 'resume_123.pdf',
        resumeFile: undefined,
      } as any;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      });

      const result = await createCandidate(mockCandidate);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      // Verify FormData contains the resume file
      const callArgs = (global.fetch as any).mock.calls[0];
      const formData = callArgs[1].body as FormData;
      expect(formData.get('resume')).toBe(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation failure with error message', async () => {
      const mockCandidate: AddEditCandidate = {
        candidateName: 'John Doe',
        contactNumber: '1234567890',
        email: 'invalid-email',
        recruiterName: 'Jane Smith',
        jobRole: 'Software Engineer',
        preferredJobLocation: 'New York',
        currentCTC: 100000,
        expectedCTC: 120000,
        noticePeriod: 30,
        experienceYears: 5,
        statusName: 'Active',
        linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
        resumeFile: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid email format' }),
      });

      await expect(createCandidate(mockCandidate)).rejects.toThrow(
        'API Error on https://aerolens-backend.onrender.com/candidate (400): Invalid email format'
      );
    });
  });

  // =========================================================================
  // GET CANDIDATES TESTS
  // =========================================================================
  describe('getCandidates', () => {
    it('should fetch candidates with pagination', async () => {
      const mockCandidates: Candidate[] = [
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { candidates: mockCandidates } }),
      });

      const result = await getCandidates(1, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate?pageSize=5&pageNumber=1`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockCandidates);
      expect(result).toHaveLength(2);
    });

    it('should handle empty candidates list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { candidates: [] } }),
      });

      const result = await getCandidates(1, 5);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle missing candidates field gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }), // Missing candidates field
      });

      const result = await getCandidates(1, 5);

      expect(result).toEqual([]);
    });

    it('should use default page size when not provided', async () => {
      const mockCandidates: Candidate[] = [];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { candidates: mockCandidates } }),
      });

      await getCandidates(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate?pageSize=5&pageNumber=1`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  // =========================================================================
  // UPDATE CANDIDATE TESTS
  // =========================================================================
  describe('updateCandidate', () => {
    it('should update candidate with partial data', async () => {
      const updatePayload: CandidateUpdatePayload = {
        candidateName: 'John Updated',
        email: 'john.updated@example.com',
      };

      const mockResponse: Candidate = {
        candidateId: 1,
        candidateName: 'John Updated',
        contactNumber: '1234567890',
        email: 'john.updated@example.com',
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      });

      const result = await updateCandidate(1, updatePayload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            candidateName: 'John Updated',
            email: 'john.updated@example.com',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should map statusName to status field', async () => {
      const updatePayload: CandidateUpdatePayload = {
        statusName: 'Inactive',
      };

      const mockResponse: Candidate = {
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
        statusName: 'Inactive',
        linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      });

      await updateCandidate(1, updatePayload);

      const callArgs = (global.fetch as any).mock.calls[0];
      const bodyString = callArgs[1].body;
      const body = JSON.parse(bodyString);

      expect(body).toHaveProperty('status', 'Inactive');
      expect(body).not.toHaveProperty('statusName');
    });

    it('should filter out undefined and null values', async () => {
      const updatePayload: CandidateUpdatePayload = {
        candidateName: 'John Doe',
        email: undefined,
        contactNumber: null as any,
        currentCTC: 0, // Should be included (0 is valid)
      };

      const mockResponse: Candidate = {
        candidateId: 1,
        candidateName: 'John Doe',
        contactNumber: '1234567890',
        email: 'john@example.com',
        recruiterName: 'Jane Smith',
        jobRole: 'Software Engineer',
        preferredJobLocation: 'New York',
        currentCTC: 0,
        expectedCTC: 120000,
        noticePeriod: 30,
        experienceYears: 5,
        statusName: 'Active',
        linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      });

      await updateCandidate(1, updatePayload);

      const callArgs = (global.fetch as any).mock.calls[0];
      const bodyString = callArgs[1].body;
      const body = JSON.parse(bodyString);

      expect(body).toHaveProperty('candidateName', 'John Doe');
      expect(body).toHaveProperty('currentCTC', 0);
      expect(body).not.toHaveProperty('email');
      expect(body).not.toHaveProperty('contactNumber');
    });

    it('should handle update failure', async () => {
      const updatePayload: CandidateUpdatePayload = {
        candidateName: 'John Doe',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Candidate not found' }),
      });

      await expect(updateCandidate(999, updatePayload)).rejects.toThrow(
        'API Error on https://aerolens-backend.onrender.com/candidate/999 (404): Candidate not found'
      );
    });
  });

  // =========================================================================
  // DELETE CANDIDATE TESTS
  // =========================================================================
  describe('deleteCandidate', () => {
    it('should delete candidate successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204, // No Content
        json: async () => ({}),
      });

      const result = await deleteCandidate(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toBe(true);
    });

    it('should handle delete failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Candidate not found',
      });

      await expect(deleteCandidate(999)).rejects.toThrow();
    });

    it('should handle server error on delete', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Database connection failed' }),
      });

      await expect(deleteCandidate(1)).rejects.toThrow(
        'API Error on https://aerolens-backend.onrender.com/candidate/1 (500): Database connection failed'
      );
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      });

      const result = await uploadResume(1, mockFile);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate/1/resume`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      // Verify FormData contains the resume file
      const callArgs = (global.fetch as any).mock.calls[0];
      const formData = callArgs[1].body as FormData;
      expect(formData.get('resume')).toBe(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload failure', async () => {
      const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        json: async () => ({ error: 'File size exceeds limit' }),
      });

      await expect(uploadResume(1, mockFile)).rejects.toThrow(
        'API Error on https://aerolens-backend.onrender.com/candidate/1/resume (413): File size exceeds limit'
      );
    });
  });

  // =========================================================================
  // DOWNLOAD RESUME TESTS
  // =========================================================================
  describe('secureDownloadResume', () => {
    it('should download resume as blob successfully', async () => {
      const mockBlob = new Blob(['resume content'], { type: 'application/pdf' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: async () => mockBlob,
      });

      const result = await secureDownloadResume(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/candidate/1/resume`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
      expect(result).toBe(mockBlob);
    });

    it('should handle download failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resume not found',
      });

      await expect(secureDownloadResume(1)).rejects.toThrow(
        'Failed to download resume. Status: 404'
      );
    });

    it('should handle server error on download', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(secureDownloadResume(1)).rejects.toThrow(
        'Failed to download resume. Status: 500'
      );
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
      (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

      await expect(getCandidates(1, 5)).rejects.toThrow('Network failure');
    });

    it('should handle timeout errors', async () => {
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      );

      await expect(getCandidates(1, 5)).rejects.toThrow();
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Unexpected token in JSON');
        },
      });

      await expect(getCandidates(1, 5)).rejects.toThrow();
    });

    it('should attach status code to error object', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Access denied' }),
      });

      try {
        await getCandidates(1, 5);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.status).toBe(403);
        expect(error.message).toContain('403');
      }
    });
  });

  // =========================================================================
  // AUTHORIZATION HEADER TESTS
  // =========================================================================
  describe('Authorization', () => {
    it('should include Authorization header in all requests', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { candidates: [] } }),
      });

      await getCandidates(1, 5);

      const callArgs = (global.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers as Headers;
      expect(headers.get('Authorization')).toBeTruthy();
    });
  });
});