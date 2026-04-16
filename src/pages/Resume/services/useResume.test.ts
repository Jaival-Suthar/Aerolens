import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createCandidate,
  getCandidates,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  downloadResume,
  getResumeDownloadUrl,
} from './useResume';
import type {
  Candidate,
  AddEditCandidate,
  CandidateUpdatePayload,
} from '../types/resumeTypes';

/** Matches runtime VITE_BASE_URL baked into the module at build/test time */
const API_BASE = import.meta.env.VITE_BASE_URL as string;


function makeAddEdit(overrides?: Partial<AddEditCandidate>): AddEditCandidate {
  return {
    candidateName: 'John Doe',
    contactNumber: '1234567890',
    email: 'john@example.com',
    recruiterId: 1,
    recruiterName: 'Jane Smith',
    jobProfileRequirementId: 10,
    expectedLocation: { city: 'New York', country: 'USA' },
    currentCTCAmount: 100000,
    currentCTCCurrencyId: 1,
    currentCTCTypeId: 1,
    expectedCTCAmount: 120000,
    expectedCTCCurrencyId: 1,
    expectedCTCTypeId: 1,
    noticePeriod: 30,
    experienceYears: 5,
    linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
    resumeFile: null,
    ...overrides,
  };
}

function toCandidate(
  id: number,
  payload: AddEditCandidate,
  extras?: Partial<Candidate>
): Candidate {
  return {
    candidateId: id,
    candidateName: payload.candidateName,
    contactNumber: payload.contactNumber ?? '',
    email: payload.email ?? '',
    recruiterId: payload.recruiterId,
    recruiterName: payload.recruiterName,
    recruiterContact: null,
    recruiterEmail: null,
    jobProfileRequirementId: payload.jobProfileRequirementId,
    jobRole: 'Software Engineer',
    expectedLocation: payload.expectedLocation ?? null,
    currentLocation: payload.currentLocation ?? null,
    workMode: null,
    workModeId: null,
    currentCTCAmount: payload.currentCTCAmount ?? null,
    currentCTCCurrencyId: payload.currentCTCCurrencyId ?? null,
    currentCTCTypeId: payload.currentCTCTypeId ?? null,
    expectedCTCAmount: payload.expectedCTCAmount ?? null,
    expectedCTCCurrencyId: payload.expectedCTCCurrencyId ?? null,
    expectedCTCTypeId: payload.expectedCTCTypeId ?? null,
    noticePeriod: payload.noticePeriod,
    experienceYears: payload.experienceYears,
    statusName: 'Active',
    linkedinProfileUrl: payload.linkedinProfileUrl ?? null,
    ...extras,
  };
}

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
      const mockCandidate = makeAddEdit();
      const mockResponse = toCandidate(1, mockCandidate);

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      } as Response);

      const result = await createCandidate('mock-token-123', mockCandidate);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a candidate with resume file', async () => {
      const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const mockCandidate = makeAddEdit({ resumeFile: mockFile });
      const mockResponse = toCandidate(1, mockCandidate, {
        resumeFilename: 'resume_123.pdf',
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      } as Response);

      const result = await createCandidate('mock-token-123', mockCandidate);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: expect.any(FormData),
        })
      );

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const formData = callArgs[1]?.body as FormData;
      expect(formData.get('resume')).toBe(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation failure with error message', async () => {
      const mockCandidate = makeAddEdit({ email: 'invalid-email' });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid email format' }),
      } as Response);

      await expect(createCandidate('mock-token-123', mockCandidate)).rejects.toEqual({
        message: 'Invalid email format',
      });
    });
  });

  // =========================================================================
  // GET CANDIDATES TESTS
  // =========================================================================
  describe('getCandidates', () => {
    it('should fetch candidates with pagination', async () => {
      const first = makeAddEdit();
      const second = makeAddEdit({
        candidateName: 'Jane Smith',
        contactNumber: '0987654321',
        email: 'jane@example.com',
        recruiterName: 'Bob Johnson',
        recruiterId: 2,
        jobProfileRequirementId: 11,
        expectedLocation: { city: 'San Francisco', country: 'USA' },
        currentCTCAmount: 90000,
        expectedCTCAmount: 110000,
        noticePeriod: 60,
        experienceYears: 3,
        linkedinProfileUrl: 'https://linkedin.com/in/janesmith',
      });
      const mockCandidates: Candidate[] = [
        toCandidate(1, first, { jobRole: 'Software Engineer' }),
        toCandidate(2, second, {
          jobRole: 'Product Manager',
          statusName: 'Pending',
        }),
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockCandidates }),
      } as Response);

      const result = await getCandidates('mock-token-123', 1, 10);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate?page=1&limit=10`,
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
      expect(result.candidates).toEqual(mockCandidates);
      expect(result.candidates).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it('should handle empty candidates list', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      } as Response);

      const result = await getCandidates('mock-token-123', 1, 10);

      expect(result.candidates).toEqual([]);
      expect(result.candidates).toHaveLength(0);
    });

    it('should use default pagination when not provided', async () => {
      const mockCandidates: Candidate[] = [];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockCandidates }),
      } as Response);

      await getCandidates('mock-token-123');

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate?page=1&limit=10`,
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });
  });

  // =========================================================================
  // UPDATE CANDIDATE TESTS
  // =========================================================================
  describe('updateCandidate', () => {
    it('should update candidate with all data', async () => {
      const updatePayload: CandidateUpdatePayload = {
        candidateName: 'John Updated',
        contactNumber: '1234567890',
        email: 'john.updated@example.com',
        recruiterId: 1,
        recruiterName: 'Jane Smith',
        jobProfileRequirementId: 10,
        expectedLocation: { city: 'New York', country: 'USA' },
        currentCTCAmount: 110000,
        currentCTCCurrencyId: 1,
        currentCTCTypeId: 1,
        expectedCTCAmount: 130000,
        expectedCTCCurrencyId: 1,
        expectedCTCTypeId: 1,
        noticePeriod: 30,
        experienceYears: 6,
        linkedinProfileUrl: 'https://linkedin.com/in/johnupdated',
      };

      const mockResponse = {
        success: true,
        message: 'Candidate updated successfully',
        data: {
          candidateId: 1,
          ...updatePayload,
          jobRole: 'Senior Software Engineer',
          statusName: 'Active',
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await updateCandidate('mock-token-123', 1, updatePayload);

      expect(fetch).toHaveBeenCalledWith(
  `${API_BASE}/candidate/1`,
  expect.objectContaining({
    method: 'PATCH',
    headers: expect.objectContaining({
      'Authorization': 'Bearer mock-token-123',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(updatePayload),
  })
);

      expect(result).toEqual(mockResponse);
    });

    it('should handle update failure', async () => {
      const updatePayload: CandidateUpdatePayload = {
        candidateName: 'John Doe',
        contactNumber: '1234567890',
        email: 'john@example.com',
        recruiterId: 1,
        recruiterName: 'Jane Smith',
        jobProfileRequirementId: 10,
        expectedLocation: { city: 'New York', country: 'USA' },
        currentCTCAmount: 100000,
        currentCTCCurrencyId: 1,
        currentCTCTypeId: 1,
        expectedCTCAmount: 120000,
        expectedCTCCurrencyId: 1,
        expectedCTCTypeId: 1,
        noticePeriod: 30,
        experienceYears: 5,
        linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Not Found' }),
      } as Response);

      await expect(updateCandidate('mock-token-123', 999, updatePayload)).rejects.toEqual({
        message: 'Not Found',
      });
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
      } as Response);

      await deleteCandidate('mock-token-123', 1);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate/1`,
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );
    });

    it('should throw error for invalid candidate ID', async () => {
      await expect(deleteCandidate('mock-token-123', 0)).rejects.toThrow(
        'Valid candidate ID is required for deletion'
      );
    });

    it('should handle delete failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Candidate not found' }),
      } as Response);

      await expect(deleteCandidate('mock-token-123', 999)).rejects.toEqual({
        message: 'Candidate not found',
      });
    });

    it('should handle server error on delete', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Database connection failed' }),
      } as Response);

      await expect(deleteCandidate('mock-token-123', 1)).rejects.toEqual({
        message: 'Database connection failed',
      });
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
      } as Response);

      const result = await uploadResume('mock-token-123', 1, mockFile);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate/1/resume`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: expect.any(FormData),
        })
      );

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const formData = callArgs[1]?.body as FormData;
      expect(formData.get('resume')).toBe(mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload failure', async () => {
      const mockFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        json: async () => ({ message: 'File size exceeds limit' }),
      } as Response);

      await expect(uploadResume('mock-token-123', 1, mockFile)).rejects.toEqual({
        message: 'File size exceeds limit',
      });
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
      } as Response);

      const result = await downloadResume('mock-token-123', 1);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/candidate/1/resume`,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
      expect(result).toBe(mockBlob);
    });

    it('should handle download failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resume not found' }),
      } as Response);

      await expect(downloadResume('mock-token-123', 1)).rejects.toEqual({
        message: 'Resume not found',
      });
    });

    it('should handle server error on download', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      } as Response);

      await expect(downloadResume('mock-token-123', 1)).rejects.toEqual({
        message: 'Server error',
      });
    });
  });

  // =========================================================================
  // GET RESUME DOWNLOAD URL TESTS
  // =========================================================================
  describe('getResumeDownloadUrl', () => {
    it('should return correct download URL', () => {
      const url = getResumeDownloadUrl(1);
      expect(url).toBe(`${API_BASE}/candidate/1/resume`);
    });

    it('should return correct download URL for different candidate IDs', () => {
      expect(getResumeDownloadUrl(1)).toBe(`${API_BASE}/candidate/1/resume`);
      expect(getResumeDownloadUrl(42)).toBe(`${API_BASE}/candidate/42/resume`);
      expect(getResumeDownloadUrl(999)).toBe(`${API_BASE}/candidate/999/resume`);
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
      vi.mocked(fetch).mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      );

      await expect(getCandidates('mock-token-123', 1, 10)).rejects.toThrow();
    });

    it('should handle malformed JSON responses', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Unexpected token in JSON');
        },
      } as unknown as Response);

      await expect(getCandidates('mock-token-123', 1, 10)).rejects.toThrow();
    });
  });
});