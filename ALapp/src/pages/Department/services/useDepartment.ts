// src/pages/Department/services/departmentService.ts
import { 
  Department, 
  DepartmentsResponse, 
  AddDepartmentPayload, 
  UpdateDepartmentPayload,
  ApiResponse,
  ErrorResponse
} from '../types/departmentTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

export default API_BASE_URL;

// ✅ Get all departments for a client
export const getDepartments = async (clientId: number): Promise<DepartmentsResponse> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/client/${clientId}`);
    if (!response.ok) throw new Error("Failed to fetch departments");
    
    const result: ApiResponse<DepartmentsResponse> = await response.json();
    return result?.data || { departments: [], clientName: "" };
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

// ✅ Add a department
export const addDepartment = async (payload: AddDepartmentPayload): Promise<ApiResponse<Department>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/department`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errData: ErrorResponse = await response.json();
      throw new Error(errData.message || "Failed to add department");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
};

// ✅ Update an existing department
export const updateDepartment = async (selectedDepartment: UpdateDepartmentPayload): Promise<ApiResponse<Department>> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/department/${selectedDepartment.departmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedDepartment),
    });
    
    if (!response.ok) {
      const errData: ErrorResponse = await response.json();
      throw new Error(errData.message || "Failed to update department");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
};

// ✅ Delete department by ID
export const deleteDepartment = async (id: number): Promise<boolean> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/department/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const errData: ErrorResponse = await response.json();
      throw new Error(errData.message || "Failed to delete department");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};