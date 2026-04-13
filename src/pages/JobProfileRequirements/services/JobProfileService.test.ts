import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'mock-token' }),
}));

global.fetch = vi.fn() as any;

import {
  getClients,
  getJobProfileRequirements,
  createJobProfileRequirements,
  updateJobProfileRequirements,
  deleteJobProfileRequirements,
  validateJobProfileRequirementsRequest,
} from '../services/jobProfileRequirementsService';

const TOKEN = 'test-token';
const BASE_URL = (import.meta as any).env?.VITE_BASE_URL ?? '';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('JobProfileRequirementsService', () => {
  it('getClients fetches clients successfully', async () => {
    const mockData = {
      data: {
        clientData: [{ clientId: 1, clientName: 'A', departments: [] }],
        locationData: [],
      }
    };
    (global.fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockData) });
    const result = await getClients(TOKEN);
    expect(result.clients).toHaveLength(1);
    expect(result.clients[0].clientId).toBe(1);
  });

  it('getClients throws on network error', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    await expect(getClients(TOKEN)).rejects.toThrow('Network error');
  });

  it('getJobProfileRequirements fetches profiles', async () => {
    const mockData = {
      success: true,
      message: 'OK',
      data: [],
    };
    const clientData = { success: true, data: { clients: [], locationData: [] } };
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(mockData) })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(clientData) });
    const result = await getJobProfileRequirements(TOKEN);
    expect(result.JobProfileRequirements).toBeDefined();
  });

  it('validateJobProfileRequirementsRequest catches missing fields', () => {
    const errors = validateJobProfileRequirementsRequest({} as any);
    expect(Array.isArray(errors)).toBe(true);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('validateJobProfileRequirementsRequest passes for valid data', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const errors = validateJobProfileRequirementsRequest({
      clientId: 1,
      departmentId: 1,
      jobProfileId: 1,
      jobRole: 'Engineer',
      techSpecification: 'React,Node',
      positions: 3,
      estimatedCloseDate: future.toISOString(),
      location: { city: 'NYC', country: 'US' },
      status: 'In Progress',
      workArrangement: 'onsite',
    } as any);
    expect(errors).toHaveLength(0);
  });

  it('createJobProfileRequirements posts data', async () => {
    const mockData = { success: true, message: 'Created', data: { jobProfileRequirementId: 2 } };
    (global.fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockData) });
    const result = await createJobProfileRequirements(TOKEN, {
      clientId: 1, departmentId: 1, jobProfileId: 1, jobRole: 'Dev',
      techSpecification: 'React', positions: 1,
      estimatedCloseDate: '2026-01-01', location: { city: 'NYC', country: 'US' }, status: 'In Progress',
    } as any);
    expect(result.success).toBe(true);
  });

  it('updateJobProfileRequirements patches data', async () => {
    const mockData = { success: true, message: 'Updated', data: { jobProfileRequirementId: 1 } };
    (global.fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockData) });
    const result = await updateJobProfileRequirements(TOKEN, 1, { jobRole: 'Senior Dev' } as any);
    expect(result.success).toBe(true);
  });

  it('deleteJobProfileRequirements deletes successfully', async () => {
    const mockData = { success: true, message: 'Deleted' };
    (global.fetch as any).mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(mockData) });
    const result = await deleteJobProfileRequirements(TOKEN, 1);
    expect(result.success).toBe(true);
  });
});
