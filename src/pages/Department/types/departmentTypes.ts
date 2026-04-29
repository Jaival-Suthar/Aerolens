// src/pages/Department/types/departmentTypes.ts

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
  onSuccess: (response: ApiResponse<Department>) => void;
  onError?: (error: any) => void; // ✅ Added error handler
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
  onSuccess: (response: ApiResponse<null>) => void;
  onClearSelection: () => void;
}

// Service function parameter types
export interface AddDepartmentPayload {
  clientId: number;
  departmentName: string;
  departmentDescription: string;
}

export interface UpdateDepartmentPayload {
  departmentId: number;
  departmentName?: string;
  departmentDescription?: string;
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

export type DepartmentAuditLog = {
  id: number;
  user_id: number | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  verb: string | null;
  resource_type: string | null;
  resource_id: string | null;
  old_values: unknown;
  new_values: unknown;
  summary: string | null;
  timestamp: string;
  occurred_at: string | null;
  actor_name: string | null;
};

export type DepartmentAuditLogResponse = {
  success: boolean;
  data: DepartmentAuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type DepartmentAuditLogsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  departmentId?: number | null;
};

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: {
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
}