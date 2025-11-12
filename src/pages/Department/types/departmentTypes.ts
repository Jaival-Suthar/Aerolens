export interface Department {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  clientId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  clientId: number;
  clientName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentsResponse {
  departments: Department[];
  clientName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Props interfaces for components
export interface DepartmentAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedDepartment: Department | null;
  clientId: number;
  onSuccess: () => void;
}

export interface DepartmentTableProps {
  clientId: number;
  clientName: string;
  onBackClick: () => void;
}

export interface DepartmentDeleteProps {
  visible: boolean;
  onHide: () => void;
  selectedDepartment: Department | null;
  departments?: Department[];
  onSuccess: () => void;
  onClearSelection: () => void;
}

// Service function parameter types
export interface AddDepartmentPayload {
  clientId: number;
  departmentName: string;
  departmentDescription: string;
}

// FIX: This type definition must allow optional fields for PATCH operations.
export interface UpdateDepartmentPayload {
    departmentId: number; // Critical ID is mandatory
    departmentName?: string; // Now optional to allow partial updates
    departmentDescription?: string; // Now optional to allow partial updates
}

// Shared button component props
export interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// DataTable selection event type
export interface SelectionChangeEvent<T> {
  value: T;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Error response from API
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: string;
}
