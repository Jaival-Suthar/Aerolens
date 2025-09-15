// src/pages/Department/services/departmentService.ts
import {
  Department,
  DepartmentsResponse,
  AddDepartmentPayload,
  UpdateDepartmentPayload,
  ApiResponse,
  ErrorResponse,
} from '../types/departmentTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

export default API_BASE_URL;

// Get all departments for a client
export const getDepartments = async (clientId: number): Promise<DepartmentsResponse> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/client/${clientId}`);
    if (!response.ok) throw new Error('Failed to fetch departments');

    const result: ApiResponse<DepartmentsResponse> = await response.json();
    return result?.data || { departments: [], clientName: '' };
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Add a new department
export const addDepartment = async (payload: AddDepartmentPayload): Promise<ApiResponse<Department>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/department`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData: ErrorResponse = await response.json();
      throw new Error(errData.message || 'Failed to add department');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

// Update an existing department
export const updateDepartment = async (payload: UpdateDepartmentPayload): Promise<ApiResponse<Department>> => {
  try {
    const { departmentId, departmentName, departmentDescription } = payload;

    // Build update body with required fields only
    const updateBody: Partial<Omit<Department, 'departmentId'>> = {};

    if (departmentName) updateBody.departmentName = departmentName;
    if (departmentDescription) updateBody.departmentDescription = departmentDescription;

    if (!departmentName && !departmentDescription) {
      throw new Error('At least one of departmentName or departmentDescription must be provided for update');
    }

    const response: Response = await fetch(`${API_BASE_URL}/department/${departmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      const errData: ErrorResponse = await response.json();
      throw new Error(errData.message || 'Failed to update department');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Delete department by id
export const deleteDepartment = async (id: number): Promise<boolean> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/department/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errData: ErrorResponse = await response.json();
      throw new Error(errData.message || 'Failed to delete department');
    }

    return true;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
