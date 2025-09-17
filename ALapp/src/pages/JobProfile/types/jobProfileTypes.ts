// jobProfileTypes.ts

export type JobStatus = 'In Progress' | 'Closed' | 'Cancelled' | 'Pending';

export interface JobProfile {
  jobProfileId?: number;
  clientId: number;
  clientName: string;
  departmentId: number;
  departmentName: string;
  jobProfileDescription: string;
  jobRole: string;
  techSpecification: string;
  positions: number;
  receivedOn: string; // ISO string
  estimatedCloseDate: string; // ISO string
  location: string;
  status: JobStatus;
}

export interface JobProfileRequest {
  jobProfileId?: number;
  clientId: number;
  departmentId: number;
  jobProfileDescription: string;
  jobRole: string;
  techSpecification: string;
  positions: number;
  receivedOn?: string;           // ISO string - optional for create
  estimatedCloseDate: string;   // ISO string
  location: string;
  status: JobStatus;
}

export interface ClientOption {
  id: number;
  name: string;
}

export interface DepartmentOption {
  id: number;
  name: string;
  clientId: number;
}

export interface JobProfileFormData {
  jobProfileId?: number;
  clientId: number | null;
  departmentId: number | null;
  jobProfileDescription: string;
  jobRole: string;
  techSpecification: string;
  positions: number | null;
  receivedOn: Date | null;          // JS Date for inputs
  estimatedCloseDate: Date | null;  // JS Date for inputs
  location: string;
  status: JobStatus | null;
}

export interface JobProfileFormErrors {
  clientId?: string;
  departmentId?: string;
  jobProfileDescription?: string;
  jobRole?: string;
  techSpecification?: string;
  positions?: string;
  receivedOn?: string;
  estimatedCloseDate?: string;
  location?: string;
  status?: string;
}

// Additional utility types for better type safety
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  totalRecords: number;
}

export interface JobProfileFilters {
  clientId?: number;
  departmentId?: number;
  status?: JobStatus;
  location?: string;
  jobRole?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  totalRecords: number;
  currentPage: number;
}