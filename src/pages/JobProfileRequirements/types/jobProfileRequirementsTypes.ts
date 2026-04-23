// ✅ Make it a simple string - values come from lookup API
export type JobStatus = string;
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

// export interface JDInfo {
//   hasJD: boolean;
//   originalName: string | null;
//   uploadDate: string | null;
//   s3Key: string | null;
//   fileExtension?: string;
//   mimeType?: string;
//   supportsPreview?: boolean;
// }


export interface JobProfileRequirements {
  jobProfileRequirementId: number;
  jobProfileId: number;
  clientId?: number;
  departmentId?: number;
  clientName: string; // Add this - comes from API
  departmentName: string; // Add this - comes from API
  // jobProfileDescription: string;
  jobRole: string;
  // techSpecification: string;
  positions: number;
  receivedOn?: string;
  estimatedCloseDate: string;
  workArrangement: 'onsite' | 'hybrid' | 'remote';
  // locationId: number; // API returns locationId, not location
  location: Location;
  status: JobStatus;
  statusName?: string; // API returns statusName
  // jdFileName?: string;
  // jdOriginalName?: string;
  // jdUploadDate?: string;
}

// Payload type for create/update JobProfile API
export interface JobProfileRequirementsPayload {
  jobProfileId: number;
  clientId: number;
  departmentId: number;
  // jobProfileDescription: string;
  // jobRole: string;
  // techSpecification: string;
  positions: number;
  estimatedCloseDate: string;
  workArrangement: 'onsite' | 'hybrid' | 'remote';
  location: Location; 
  status?: JobStatus;
  // JD?: File;
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
  details?: {
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
  error?: string;
}

export interface JobProfileRequirementsFormErrors {
  jobProfileId?: string;
  clientId?: string;
  departmentId?: string;
  // jobProfileDescription?: string;
  // jobRole?: string;
  // techSpecification?: string;
  positions?: string;
  estimatedCloseDate?: string;
  workArrangement?: string;
  location?: string;
  status?: string;
  // JD?: string;
}