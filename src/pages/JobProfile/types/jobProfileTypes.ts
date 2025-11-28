export type JobStatus = 'In Progress' | 'Closed' | 'Cancelled' | 'Pending';

export interface Client {
  clientId: number;
  clientName: string;
  departments: Department[];
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface Location {
  city: string;
  state?: string;
  country: string;
}


export interface JobProfile {
  jobProfileId: number;
  clientId: number;
  departmentId?: number;
  clientName: string; // Add this - comes from API
  departmentName: string; // Add this - comes from API
  jobProfileDescription: string;
  jobRole: string;
  techSpecification: string;
  positions: number;
  receivedOn?: string;
  estimatedCloseDate: string;
  workArrangement: 'onsite' | 'hybrid' | 'remote';
  // locationId: number; // API returns locationId, not location
  location: Location;
  status: JobStatus;
  statusName?: string; // API returns statusName
}

// Payload type for create/update JobProfile API
export interface JobProfilePayload {
  clientId: number;
  departmentId: number;
  jobProfileDescription: string;
  jobRole: string;
  techSpecification: string;
  positions: number;
  estimatedCloseDate: string;
  workArrangement: 'onsite' | 'hybrid' | 'remote';
  location: Location; 
  status: JobStatus;
}

// Type for dropdown options used in UI
export interface ClientOption {
  clientId: number;
  clientName: string;
  departments: DepartmentOption[];
}

export interface DepartmentOption {
  departmentId: number;
  departmentName: string;
}

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface JobProfileFormErrors {
  clientId?: string;
  departmentId?: string;
  jobProfileDescription?: string;
  jobRole?: string;
  techSpecification?: string;
  positions?: string;
  estimatedCloseDate?: string;
  workArrangement?: string;
  location?: string;
  status?: string;
}