import { 
  JobProfile, 
  JobProfilePayload, 
  ClientOption, 
  DepartmentOption,
  ApiResponse,
  Location
} from '../types/jobProfileTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string) => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// Data mapping function to transform API response to frontend format
function mapApiJobProfile(data: any): JobProfile {
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
    location: data.location || { city: '', country: '' },
    workArrangement: data.workArrangement || 'onsite',
    status: data.statusName || data.status || 'Pending',
    statusName: data.statusName
  };
  return mapped;
}
export const fetchJobProfileLookupData = async (
  accessToken: string | null
): Promise<{ profileStatuses: string[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookup?page=1&limit=100`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lookup data: ${response.status}`);
    }

    const result = await response.json();
    
    // ✅ API returns: { success: true, message: "...", data: [...] }
    if (!result.success || !Array.isArray(result.data)) {
      console.error('Unexpected lookup response structure:', result);
      return { profileStatuses: [] };
    }
    
    const profileStatuses = result.data
      .filter((item: any) => item.tag === "profileStatus")
      .map((item: any) => item.value);
    
    console.log('Fetched profile statuses:', profileStatuses);
    return { profileStatuses };
  } catch (error) {
    console.error('Error fetching lookup data:', error);
    throw error;
  }
};
// Get clients from the new /client/all endpoint
export const getClients = async (
  accessToken: string | null
): Promise<{ clients: ClientOption[]; locations: Location[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/all`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch clients');
    
    const clients = Array.isArray(data.data?.clientData)
      ? data.data.clientData.map((client: any): ClientOption => {
          let departmentsArray = [];

          if (typeof client.departments === 'string') {
            try {
              departmentsArray = JSON.parse(client.departments);
            } catch (err) {
              console.error("Failed to parse departments:", err);
              departmentsArray = [];
            }
          } else if (Array.isArray(client.departments)) {
            departmentsArray = client.departments;
          }
          
          return {
            clientId: client.clientId,
            clientName: client.clientName,
            departments: departmentsArray.map((dept: any) => ({
              departmentId: dept.departmentId,
              departmentName: dept.departmentName
            }))
          };
        })
      : [];

    // Extract locations from the response
    const locations = Array.isArray(data.data?.locationData)
      ? data.data.locationData.map((loc: any): Location => ({
          city: loc.city,
          state: loc.state,
          country: loc.country
        }))
      : [];
    
    return { clients, locations };
  } catch (error) {
    console.error('Error in getClients:', error);
    throw error;
  }
};


// Get departments from API
export const getDepartments = async (accessToken: string | null): Promise<DepartmentOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch departments');
    
    return data.departments as DepartmentOption[];
  } catch (error) {
    console.error('Error in getDepartments:', error);
    throw error;
  }
};

// Fetch all job profiles and then fetch clients
export const getJobProfiles = async (
  accessToken: string | null
): Promise<{ jobProfiles: ApiResponse<JobProfile[]>; clients: ClientOption[]; locations: Location[] }> => {
  try {
    const jobProfileResponse = await fetch(`${API_BASE_URL}/jobProfile`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    if (!jobProfileResponse.ok) {
      throw new Error(`Failed to fetch job profiles: ${jobProfileResponse.status}`);
    }
    
    const jobProfileData = await jobProfileResponse.json();
    if (!jobProfileData.success) {
      throw new Error(jobProfileData.message || 'Failed to fetch job profiles');
    }
    const mappedJobProfiles = jobProfileData.data.map(mapApiJobProfile);
    const jobProfilesResult: ApiResponse<JobProfile[]> = {
      success: true,
      message: jobProfileData.message,
      data: mappedJobProfiles,
    };

    const { clients, locations } = await getClients(accessToken);

    return {
      jobProfiles: jobProfilesResult,
      clients: clients,
      locations: locations
    };
  } catch (error) {
    console.error('Error in getJobProfiles:', error);
    throw error;
  }
};
// Fetch job profile by ID
export const getJobProfileById = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<JobProfile>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch job profile: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw job profile data:', data);
    if (!data.success) throw new Error(data.message || 'Job profile not found');

    const mappedData = mapApiJobProfile(data.data);
    return {
      success: true,
      message: data.message,
      data: mappedData,
    };
  } catch (error) {
    console.error('Error in getJobProfileById:', error);
    throw error;
  }
};

// Create a new job profile
export const createJobProfile = async (
  accessToken: string | null,
  jobProfileData: Omit<JobProfilePayload, 'jobProfileId'>
): Promise<ApiResponse<JobProfile>> => {
  try {
    const req = {
      ...jobProfileData,
      receivedOn: undefined, 
      workArrangement: jobProfileData.workArrangement,
      location: jobProfileData.location,
    };

    const response = await fetch(`${API_BASE_URL}/jobProfile`, {
      method: 'POST',
      headers: makeHeaders(accessToken || undefined),
      body: JSON.stringify(req),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to create job profile: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      if (data.error === 'VALIDATION_ERROR' && data.details) {
        const errMsg = data.details.map((d: any) => d.message).join(', ');
        throw new Error(errMsg);
      }
      throw new Error(data.message || 'Failed to create job profile');
    }

    const mappedData = mapApiJobProfile(data.data);

    return {
      success: true,
      message: data.message,
      data: mappedData,
    };
  } catch (error) {
    console.error('Error in createJobProfile:', error);
    throw error;
  }
};

// Update a job profile
export const updateJobProfile = async (
  accessToken: string | null,
  id: number,
  jobProfileData: Partial<Omit<JobProfilePayload, 'jobProfileId'>>
): Promise<ApiResponse<JobProfile>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: 'PATCH',
      headers: makeHeaders(accessToken || undefined),
      body: JSON.stringify(jobProfileData),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to update job profile: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      if (data.error === 'VALIDATION_ERROR' && data.details) {
        const errMsg = data.details.map((d: any) => d.message).join(', ');
        throw new Error(errMsg);
      }
      throw new Error(data.message || 'Failed to update job profile');
    }

    const mappedData = mapApiJobProfile(data.data);

    return {
      success: true,
      message: data.message,
      data: mappedData,
    };
  } catch (error) {
    console.error('Error in updateJobProfile:', error);
    throw error;
  }
};

// Delete job profile by ID
export const deleteJobProfile = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<null>> => {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid job profile ID is required for deletion');
    }

    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete job profile: ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete job profile');

    return {
      success: true,
      message: data.message,
      data: null,
    };
  } catch (error) {
    console.error('Error in deleteJobProfile:', error);
    throw error;
  }
};

// Validation for job profile data
export const validateJobProfileRequest = (data: Partial<JobProfilePayload>): string[] => {
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
  if (!data.location || !data.location.city || !data.location.country) {
    errors.push('Location must include city and country');
  }
  if (!data.workArrangement) errors.push('Work Arrangement is required');

  if (!data.status) errors.push('Status is required');

  if (data.estimatedCloseDate) {
    const closeDate = new Date(data.estimatedCloseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (closeDate < today) {
      errors.push('Estimated Close Date must be in the future');
    }
  }

  return errors;
};