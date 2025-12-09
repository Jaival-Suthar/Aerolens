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
import { describe, it, expect, afterEach } from 'vitest';
const API_BASE_URL = import.meta.env.VITE_PREPROD_URL;
// Mock AuthContext
vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'mock-token-123'
  })
}));
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

  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ data: mockData }),
  } as Response);

  const result = await getDepartments('mock-token-123', 1);
  
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/client/1`, 
    expect.objectContaining({
      credentials: 'include',
      method: 'GET',
    })
  );
  expect(result).toEqual(mockData);
});

    it('returns empty departments and clientName if no data', async () => {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}), // apiFetch returns {} when data is empty
  } as Response);

  const result = await getDepartments('mock-token-123', 5);
  expect(result).toEqual({});
});

    it('throws error when fetch response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Error text',
        statusText: 'Bad Request',
      } as Response);

      await expect(getDepartments('mock-token-123',1)).rejects.toThrow('API Error (400)');
    });

    it('throws on fetch error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('fetch-failed'));

      await expect(getDepartments('mock-token-123',1)).rejects.toThrow('fetch-failed');
    });
  });

  describe('addDepartment', () => {
    const payload: AddDepartmentPayload = {
      departmentName: 'New Dept',
      departmentDescription: 'Description',
      clientId: 1,
    };

    it('adds department successfully', async () => {
  const department = { departmentId: 10, ...payload };
  const apiResponse: ApiResponse<Department> = {
    success: true,
    message: 'Department added successfully',
    data: department,
  };

  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => apiResponse,
  } as Response);

  const response = await addDepartment('mock-token-123', payload);
  
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/department`, 
    expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(payload)
    })
  );
  // apiFetch extracts data.data, so it returns just the department
  expect(response).toEqual(department);
});

    it('throws error with API error message', async () => {
      const errorResponse: ErrorResponse = { success: false, message: 'Duplicate department' };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify(errorResponse),
        statusText: 'Bad Request',
      } as Response);

      await expect(addDepartment('mock-token-123', payload)).rejects.toThrow('API Error (400)');
    });

    it('throws generic error if no error message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => '{}',
        statusText: 'Bad Request',
      } as Response);

      await expect(addDepartment('mock-token-123', payload)).rejects.toThrow('API Error (400)');
    });

    it('throws error on fetch reject', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('network-failure'));

      await expect(addDepartment('mock-token-123',payload)).rejects.toThrow('network-failure');
    });
  });

  describe('updateDepartment', () => {
    const basePayload: UpdateDepartmentPayload = {
      departmentId: 5,
      departmentName: 'Updated Dept',
      departmentDescription: 'Updated Desc',
    };

    it('updates successfully with both fields', async () => {
  const department = { departmentId: 5, departmentName: 'Updated Dept', departmentDescription: 'Updated Desc', clientId: 1 };
  const apiResponse: ApiResponse<Department> = {
    success: true,
    message: 'Department updated successfully',
    data: department,
  };

  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => apiResponse,
  } as Response);

  const response = await updateDepartment('mock-token-123', basePayload);
  
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/department/5`, 
    expect.objectContaining({
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({
        departmentName: 'Updated Dept',
        departmentDescription: 'Updated Desc',
      }),
    })
  );
  // apiFetch extracts data.data, so it returns just the department
  expect(response).toEqual(department);
});

    it('updates successfully with just one field', async () => {
  const payload: UpdateDepartmentPayload = {
    departmentId: 5,
    departmentName: 'Name Only',
  };

  const department = { departmentId: 5, departmentName: 'Name Only', departmentDescription: '', clientId: 1 };
  const apiResponse: ApiResponse<Department> = {
    success: true,
    message: 'Department updated successfully',
    data: department,
  };

  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => apiResponse,
  } as Response);

  const response = await updateDepartment('mock-token-123', payload);
  
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/department/5`, 
    expect.objectContaining({
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({ departmentName: 'Name Only' }),
    })
  );
  // apiFetch extracts data.data, so it returns just the department
  expect(response).toEqual(department);
});

    it('throws error if neither name nor description provided', async () => {
      await expect(updateDepartment('mock-token-123', { departmentId: 5 })).rejects.toThrow(
  'At least one field required for update'  // Match the actual error message
);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws error with API error message', async () => {
      const errorResponse: ErrorResponse = { success: false, message: 'Update failed' };

      vi.mocked(fetch).mockResolvedValueOnce({
  ok: false,
  status: 400,
  text: async () => JSON.stringify(errorResponse),
  statusText: 'Bad Request',
} as Response);

await expect(updateDepartment('mock-token-123', basePayload)).rejects.toThrow('API Error (400)');
    });

    it('throws generic error if no message from API', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
  ok: false,
  status: 400,
  text: async () => '{}',
  statusText: 'Bad Request',
} as Response);

await expect(updateDepartment('mock-token-123', basePayload)).rejects.toThrow('API Error (400)');
    });

    it('throws error on fetch rejected', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('network-failure'));

      await expect(updateDepartment('mock-token-123',basePayload)).rejects.toThrow('network-failure');
    });
  });

  describe('deleteDepartment', () => {
    it('deletes successfully when response is ok', async () => {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    status: 204,
    json: async () => ({}),
  } as Response);

  const result = await deleteDepartment('mock-token-123', 10);
  
  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/department/10`, 
    expect.objectContaining({
      method: 'DELETE',
      credentials: 'include',
    })
  );
  expect(result).toBeUndefined();
});

    it('throws error with API error message', async () => {
      const errorResponse: ErrorResponse = { success: false, message: 'Delete failed' };

      vi.mocked(fetch).mockResolvedValueOnce({
  ok: false,
  status: 400,
  text: async () => JSON.stringify(errorResponse),
  statusText: 'Bad Request',
} as Response);

await expect(deleteDepartment('mock-token-123', 10)).rejects.toThrow('API Error (400)');
    });

    it('throws generic error if no message from API', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
  ok: false,
  status: 400,
  text: async () => '{}',
  statusText: 'Bad Request',
} as Response);

await expect(deleteDepartment('mock-token-123', 10)).rejects.toThrow('API Error (400)');
    });

    it('throws error on fetch rejected', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('network-failure'));

      await expect(deleteDepartment('mock-token-123',10)).rejects.toThrow('network-failure');
    });
  });
});
