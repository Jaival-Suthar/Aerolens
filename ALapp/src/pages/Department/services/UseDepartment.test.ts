import { vi } from 'vitest';
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../Department/services/useDepartment';

import type {
  DepartmentsResponse,
  AddDepartmentPayload,
  UpdateDepartmentPayload,
  ApiResponse,
  Department,
  ErrorResponse,
} from '../../Department/types/departmentTypes';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

global.fetch = vi.fn();

describe('departmentService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getDepartments', () => {
    it('fetches and returns departments on success', async () => {
      const mockData: DepartmentsResponse = {
        departments: [{ departmentId: 1, departmentName: 'HR', departmentDescription: '', clientId: 1 }],
        clientName: 'Client A',
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      } as Response);

      const result = await getDepartments(1);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/client/1`);
      expect(result).toEqual(mockData);
    });

    it('returns empty departments and clientName if no data', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await getDepartments(5);
      expect(result).toEqual({ departments: [], clientName: '' });
    });

    it('throws error when fetch response is not ok', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(getDepartments(1)).rejects.toThrow('Failed to fetch departments');
    });

    it('throws on fetch error', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('fetch-failed'));

      await expect(getDepartments(1)).rejects.toThrow('fetch-failed');
    });
  });

  describe('addDepartment', () => {
    const payload: AddDepartmentPayload = {
      departmentName: 'New Dept',
      departmentDescription: 'Description',
      clientId: 1,
    };

    it('adds department successfully', async () => {
      const apiResponse: ApiResponse<Department> = {
        success: true,
        message: 'Department added successfully',
        data: { departmentId: 10, ...payload },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      } as Response);

      const response = await addDepartment(payload);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/department`, expect.objectContaining({
        method: 'POST',
      }));
      expect(response).toEqual(apiResponse);
    });

    it('throws error with API error message', async () => {
      const errorResponse: ErrorResponse = { success: false, message: 'Duplicate department' };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      } as Response);

      await expect(addDepartment(payload)).rejects.toThrow('Duplicate department');
    });

    it('throws generic error if no error message', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(addDepartment(payload)).rejects.toThrow('Failed to add department');
    });

    it('throws error on fetch reject', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('network-failure'));

      await expect(addDepartment(payload)).rejects.toThrow('network-failure');
    });
  });

  describe('updateDepartment', () => {
    const basePayload: UpdateDepartmentPayload = {
      departmentId: 5,
      departmentName: 'Updated Dept',
      departmentDescription: 'Updated Desc',
    };

    it('updates successfully with both fields', async () => {
      const apiResponse: ApiResponse<Department> = {
        success: true,
        message: 'Department updated successfully',
        data: { departmentId: 5, departmentName: 'Updated Dept', departmentDescription: 'Updated Desc', clientId: 1 },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      } as Response);

      const response = await updateDepartment(basePayload);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/department/5`, expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          departmentName: 'Updated Dept',
          departmentDescription: 'Updated Desc',
        }),
      }));
      expect(response).toEqual(apiResponse);
    });

    it('updates successfully with just one field', async () => {
      const payload: UpdateDepartmentPayload = {
        departmentId: 5,
        departmentName: 'Name Only',
      };

      const apiResponse: ApiResponse<Department> = {
        success: true,
        message: 'Department updated successfully',
        data: { departmentId: 5, departmentName: 'Name Only', departmentDescription: '', clientId: 1 },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      } as Response);

      const response = await updateDepartment(payload);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/department/5`, expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ departmentName: 'Name Only' }),
      }));
      expect(response).toEqual(apiResponse);
    });

    it('throws error if neither name nor description provided', async () => {
      await expect(updateDepartment({ departmentId: 5 })).rejects.toThrow(
        'At least one of departmentName or departmentDescription must be provided for update'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws error with API error message', async () => {
      const errorResponse: ErrorResponse = { success: false, message: 'Update failed' };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      } as Response);

      await expect(updateDepartment(basePayload)).rejects.toThrow('Update failed');
    });

    it('throws generic error if no message from API', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(updateDepartment(basePayload)).rejects.toThrow('Failed to update department');
    });

    it('throws error on fetch rejected', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('network-failure'));

      await expect(updateDepartment(basePayload)).rejects.toThrow('network-failure');
    });
  });

  describe('deleteDepartment', () => {
    it('deletes successfully when response is ok', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await deleteDepartment(10);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/department/10`, expect.objectContaining({
        method: 'DELETE',
      }));
      expect(result).toBe(true);
    });

    it('throws error with API error message', async () => {
      const errorResponse: ErrorResponse = { success: false, message: 'Delete failed' };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      } as Response);

      await expect(deleteDepartment(10)).rejects.toThrow('Delete failed');
    });

    it('throws generic error if no message from API', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(deleteDepartment(10)).rejects.toThrow('Failed to delete department');
    });

    it('throws error on fetch rejected', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('network-failure'));

      await expect(deleteDepartment(10)).rejects.toThrow('network-failure');
    });
  });
});
