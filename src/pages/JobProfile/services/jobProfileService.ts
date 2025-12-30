import { 
  JobProfile, 
  JobProfilePayload, 
  ClientOption, 
  DepartmentOption,
  ApiResponse,
  Location,
  JDInfo
} from '../types/jobProfileTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string) => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

const makeMultipartHeaders = (accessToken?: string) => {
  const headers: HeadersInit = {};
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
    statusName: data.statusName,
    jdFileName: data.jdFileName ?? null,
    jdOriginalName: data.jdOriginalName ?? null,
    jdUploadDate: data.jdUploadDate ?? null,
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
    const result = await response.json();
    
    const profileStatuses = result.data
      .filter((item: any) => item.tag === "profileStatus")
      .map((item: any) => item.value);
    
    //console.log('Fetched profile statuses:', profileStatuses);
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
    
    const data = await response.json();
    
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
    
    const data = await response.json();
    
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
      const err = await jobProfileResponse.json();
      throw err;
    }
    
    const jobProfileData = await jobProfileResponse.json();
    if (!jobProfileData.success) {
      throw jobProfileData;
    }
    const rawProfiles = Array.isArray(jobProfileData.data) ? jobProfileData.data : [];

    const mappedJobProfiles = rawProfiles.map(mapApiJobProfile);

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
    
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw data || {
        success: false,
        message: 'Failed to fetch job profile'
      };
    }

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
    const formData = new FormData();

    Object.entries(jobProfileData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'status') return; // not allowed on create
      if (key === 'JD') return;     // handled separately

      if (key === 'location') {
        formData.append('location', JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // ✅ append JD only once
    if (jobProfileData.JD instanceof File) {
      formData.append('JD', jobProfileData.JD);
    }

    const response = await fetch(`${API_BASE_URL}/jobProfile`, {
      method: 'POST',
      headers: makeMultipartHeaders(accessToken || undefined),
      body: formData,
      credentials: 'include'
    });

    const data = await response.json().catch(() => null);

    // ✅ backend-controlled error message
    if (!response.ok || !data?.success) {
      throw data; // 🔥 preserve backend response
    }

    return {
      success: true,
      message: data.message,
      data: mapApiJobProfile(data.data),
    };
  } catch (error) {
    console.error('Error in createJobProfile:', error);
    throw error; // 👈 UI Toast will show backend message
  }
};


// Update a job profile
export const updateJobProfile = async (
  accessToken: string | null,
  id: number,
  jobProfileData: Partial<Omit<JobProfilePayload, 'jobProfileId'>>
): Promise<ApiResponse<JobProfile>> => {
  try {
    const formData = new FormData();

    Object.entries(jobProfileData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === 'location') {
        formData.append('location', JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // OPTIONAL JD update
    if (jobProfileData.JD) {
      formData.append('JD', jobProfileData.JD);
    }


    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: 'PATCH',
      headers: makeMultipartHeaders(accessToken || undefined),
      body: formData,
      credentials: 'include'
    });


    const data = await response.json();

    if (!response.ok || !data.success) {
      throw data;
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

export const getJDInfo = async (
  accessToken: string | null,
  jobProfileId: number
): Promise<ApiResponse<JDInfo>> => {
  const response = await fetch(
    `${API_BASE_URL}/jobProfile/${jobProfileId}/JD/info`,
    {
      headers: makeMultipartHeaders(accessToken || undefined),
      credentials: 'include'
    }
  );
  return response.json();
};


// Delete job profile by ID
export const deleteJobProfile = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<null>> => {
  try {
    if (!id || typeof id !== 'number') {
      throw {
        success: false,
        error: 'INVALID_JOB_PROFILE_ID',
        message: 'Valid job profile ID is required for deletion'
      };
    }

    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw data || {
        success: false,
        message: 'Failed to delete job profile'
      };
    }

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