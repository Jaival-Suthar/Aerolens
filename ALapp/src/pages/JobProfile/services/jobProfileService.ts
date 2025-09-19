import { 
  JobProfile, 
  JobProfilePayload, 
  ClientOption, 
  DepartmentOption,
  ApiResponse,
  JobStatus
} from '../types/jobProfileTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Data mapping function to transform API response to frontend format
function mapApiJobProfile(data: any): JobProfile {
  console.log('Mapping API job profile:', data);
  const mapped = {
    jobProfileId: data.jobProfileId,
    clientId: data.clientId || 0,
    departmentId: data.departmentId || 0,
    clientName: data.clientName || '',
    departmentName: data.departmentName || '',
    jobProfileDescription: data.jobProfileDescription,
    jobRole: data.jobRole,
    techSpecification: data.techSpecification,
    positions: data.positions,
    receivedOn: data.receivedOn,
    estimatedCloseDate: data.estimatedCloseDate,
    // locationId: data.locationId || 0,
    locationName: data.locationName || '',
    location: data.locationName || data.location || '', // Fallback logic
    status: (data.statusName || data.status || 'Pending') as JobStatus,
    statusName: data.statusName
  };
  console.log('Mapped job profile:', mapped);
  return mapped;
}

// Get clients from the new /client/all endpoint
export const getClients = async (): Promise<ClientOption[]> => {
  //console.log('Fetching clients from:', `${API_BASE_URL}/client/all`);
  const response = await fetch(`${API_BASE_URL}/client/all`);
  //console.log('Client response status:', response.status);
  if (!response.ok) throw new Error(`Failed to fetch clients: ${response.status}`);
  const data = await response.json();
  //console.log('Client response data:', data);
  if (!data.success) throw new Error(data.message || 'Failed to fetch clients');
  
  const clients = data.data.map((client: any): ClientOption => {
    const mappedClient = {
      clientId: client.clientId,
      clientName: client.clientName,
      departments: client.departments.map((dept: any): DepartmentOption => ({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName
      }))
    };
    //console.log('Mapped client:', mappedClient);
    return mappedClient;
  });
  //console.log('All mapped clients:', clients);
  return clients;
};

// Get departments from API (keeping for backward compatibility if needed)
export const getDepartments = async (): Promise<DepartmentOption[]> => {
  //console.log('Fetching departments from:', `${API_BASE_URL}/departments`);
  const response = await fetch(`${API_BASE_URL}/departments`);
  //console.log('Department response status:', response.status);
  if (!response.ok) throw new Error(`Failed to fetch departments: ${response.status}`);
  const data = await response.json();
  //console.log('Department response data:', data);
  if (!data.success) throw new Error(data.message || 'Failed to fetch departments');
  //console.log('Departments:', data.departments);
  return data.departments as DepartmentOption[];
};

// Fetch all job profiles and then fetch clients
export const getJobProfiles = async (): Promise<{ jobProfiles: ApiResponse<JobProfile[]>, clients: ClientOption[] }> => {
  //console.log('Fetching job profiles from:', `${API_BASE_URL}/jobProfile`);
  const jobProfileResponse = await fetch(`${API_BASE_URL}/jobProfile`);
  //console.log('Job profile response status:', jobProfileResponse.status);
  if (!jobProfileResponse.ok) throw new Error(`Failed to fetch job profiles: ${jobProfileResponse.status}`);
  const jobProfileData = await jobProfileResponse.json();
  //console.log('Job profile response data:', jobProfileData); // (1)
  if (!jobProfileData.success) throw new Error(jobProfileData.message || 'Failed to fetch job profiles');

  const mappedJobProfiles = jobProfileData.data.map(mapApiJobProfile);
  //console.log('Mapped job profiles:', mappedJobProfiles);

  const jobProfilesResult: ApiResponse<JobProfile[]> = {
    success: true,
    message: jobProfileData.message,
    data: mappedJobProfiles,
  };
  //console.log('Job profiles result:', jobProfilesResult);

  const clients = await getClients();
  //console.log('Fetched clients:', clients);

  return {
    jobProfiles: jobProfilesResult,
    clients: clients
  };
};

// Fetch job profile by ID
export const getJobProfileById = async (id: number): Promise<ApiResponse<JobProfile>> => {
  //console.log('Fetching job profile with ID:', id);
  const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`);
  //console.log('Job profile response status:', response.status);
  if (!response.ok) throw new Error(`Failed to fetch job profile: ${response.status}`);
  const data = await response.json();
  //console.log('Job profile response data:', data);
  if (!data.success) throw new Error(data.message || 'Job profile not found');

  const mappedData = mapApiJobProfile(data.data);
  //console.log('Mapped job profile by ID:', mappedData);

  return {
    success: true,
    message: data.message,
    data: mappedData,
  };
};

// Create a new job profile
export const createJobProfile = async (
  jobProfileData: Omit<JobProfilePayload, 'jobProfileId'>
): Promise<ApiResponse<JobProfile>> => {
  //console.log('Creating job profile with data:', jobProfileData);
  const req = {
    ...jobProfileData,
    receivedOn: undefined, // Backend sets this automatically
  };
  //console.log('Request payload for create:', req);

  const response = await fetch(`${API_BASE_URL}/jobProfile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  //console.log('Create job profile response status:', response.status);

  if (!response.ok) throw new Error(`Failed to create job profile: ${response.status}`);
  const data = await response.json();
  //console.log('Create job profile response data:', data);
  if (!data.success) {
    if (data.error === 'VALIDATION_ERROR' && data.details) {
      const errMsg = data.details.map((d: any) => d.message).join(', ');
      //console.log('Validation error details:', errMsg);
      throw new Error(errMsg);
    }
    throw new Error(data.message || 'Failed to create job profile');
  }

  const mappedData = mapApiJobProfile(data.data);
  //console.log('Mapped created job profile:', mappedData);

  return {
    success: true,
    message: data.message,
    data: mappedData,
  };
};

// Update a job profile
export const updateJobProfile = async (
  id: number,
  jobProfileData: Partial<Omit<JobProfilePayload, 'jobProfileId'>>
): Promise<ApiResponse<JobProfile>> => {
  //console.log('Updating job profile ID:', id, 'with data:', jobProfileData);
  const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobProfileData),
  });
  //console.log('Update job profile response status:', response.status);

  if (!response.ok) throw new Error(`Failed to update job profile: ${response.status}`);
  const data = await response.json();
  //console.log('Update job profile response data:', data);
  if (!data.success) {
    if (data.error === 'VALIDATION_ERROR' && data.details) {
      const errMsg = data.details.map((d: any) => d.message).join(', ');
      //console.log('Validation error details:', errMsg);
      throw new Error(errMsg);
    }
    throw new Error(data.message || 'Failed to update job profile');
  }

  const mappedData = mapApiJobProfile(data.data);
  //console.log('Mapped updated job profile:', mappedData);

  return {
    success: true,
    message: data.message,
    data: mappedData,
  };
};

// Delete job profile by ID
export const deleteJobProfile = async (id: number): Promise<ApiResponse<null>> => {
  //console.log('Deleting job profile with ID:', id);
  const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    method: 'DELETE',
  });
  //console.log('Delete job profile response status:', response.status);

  if (!response.ok) throw new Error(`Failed to delete job profile: ${response.status}`);
  const data = await response.json();
  //console.log('Delete job profile response data:', data);
  if (!data.success) throw new Error(data.message || 'Failed to delete job profile');

  return {
    success: true,
    message: data.message,
    data: null,
  };
};

// Validation for job profile data
export const validateJobProfileRequest = (data: Partial<JobProfilePayload>): string[] => {
  //console.log('Validating job profile data:', data);
  const errors: string[] = [];

  if (!data.clientId) errors.push('Client is required');
  if (!data.departmentId) errors.push('Department is required');
  if (!data.jobProfileDescription?.trim()) errors.push('Job Profile Description is required');
  if (data.jobProfileDescription && data.jobProfileDescription.length < 10) errors.push('Job Profile Description must be at least 10 characters');
  if (data.jobProfileDescription && data.jobProfileDescription.length > 500) errors.push('Job Profile Description must not exceed 500 characters');
  if (!data.jobRole?.trim()) errors.push('Job Role is required');
  if (data.jobRole && data.jobRole.length < 2) errors.push('Job Role must be at least 2 characters');
  if (data.jobRole && data.jobRole.length > 100) errors.push('Job Role must not exceed 100 characters');
  if (!data.techSpecification?.trim()) errors.push('Tech Specification is required');
  if (data.techSpecification) {
    const techs = data.techSpecification.split(',').map(t => t.trim());
    if (techs.some(t => t.length < 2)) errors.push('Each tech specification must be at least 2 characters');
  }
  if (!data.positions || data.positions < 1) errors.push('Positions must be at least 1');
  if (!data.estimatedCloseDate) errors.push('Estimated Close Date is required');
  if (!data.location?.trim()) errors.push('Location is required');
  if (!data.status) errors.push('Status is required');

  if (data.estimatedCloseDate) {
    const closeDate = new Date(data.estimatedCloseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (closeDate < today) {
      errors.push('Estimated Close Date must be in the future');
    }
  }

  //console.log('Validation errors:', errors);
  return errors;
};