import { 
  JobProfileRequirements, 
  JobProfileRequirementsPayload, 
  ClientOption, 
  DepartmentOption,
  ApiResponse,
  Location,
  JobProfileRequirementDeletedResponse
} from '../types/jobProfileRequirementsTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string) => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};
const normalizeApiError = (data: any) => {
  const error: any = new Error(data?.message || 'Request failed');

  error.success = false;
  error.error = data?.error;
  error.details = data?.details;

  if (data?.error === 'VALIDATION_ERROR') {
    error.isValidationError = true;
    error.validationErrors = data?.details?.validationErrors || [];
  }

  return error;
};
const makeMultipartHeaders = (accessToken?: string) => {
  const headers: HeadersInit = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// Data mapping function to transform API response to frontend format
function mapApiJobProfileRequirements(data: any): JobProfileRequirements {
  const mapped = {
    jobProfileRequirementId: data.jobProfileRequirementId,
    jobProfileId: data.jobProfileId,

    clientId: data.clientId,
    departmentId: data.departmentId,

    clientName: data.clientName ?? '',
    departmentName: data.departmentName ?? '',

    jobRole: data.jobRole ?? '',

    positions: data.positions ?? 0,

    receivedOn: data.receivedOn ?? undefined,

    estimatedCloseDate: data.estimatedCloseDate,

    location: data.location ?? {
      city: '',
      country: ''
    },

    workArrangement: data.workArrangement ?? 'onsite',

    status: data.status ?? 'Pending',
    statusName: data.statusName
  };
  return mapped;
}
export const fetchJobProfileRequirementsLookupData = async (
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
export const getJobProfileRequirements = async (
  accessToken: string | null
): Promise<{ JobProfileRequirements: ApiResponse<JobProfileRequirements[]>; clients: ClientOption[]; locations: Location[] }> => {
  try {
    const JobProfileRequirementsResponse = await fetch(`${API_BASE_URL}/jobProfileRequirement`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    if (!JobProfileRequirementsResponse.ok) {
      const err = await JobProfileRequirementsResponse.json();
      throw normalizeApiError(err);
    }

    
    const JobProfileRequirementsData = await JobProfileRequirementsResponse.json();
    if (!JobProfileRequirementsData.success) {
      throw normalizeApiError(JobProfileRequirementsData);
    }
    const rawProfiles = Array.isArray(JobProfileRequirementsData.data) ? JobProfileRequirementsData.data : [];

    const mappedJobProfileRequirements = rawProfiles.map(mapApiJobProfileRequirements);

    const JobProfileRequirementsResult: ApiResponse<JobProfileRequirements[]> = {
      success: true,
      message: JobProfileRequirementsData.message,
      data: mappedJobProfileRequirements,
    };

    const { clients, locations } = await getClients(accessToken);

    return {
      JobProfileRequirements: JobProfileRequirementsResult,
      clients: clients,
      locations: locations
    };
  } catch (error) {
    console.error('Error in getJobProfileRequirements:', error);
    throw error;
  }
};
// Fetch job profile by ID
export const getJobProfileRequirementsById = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<JobProfileRequirements>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfileRequirement/${id}`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw normalizeApiError(data);
    }

    const mappedData = mapApiJobProfileRequirements(data.data);
    return {
      success: true,
      message: data.message,
      data: mappedData,
    };
  } catch (error) {
    console.error('Error in getJobProfileRequirementsById:', error);
    throw error;
  }
};

// Create a new job profile
export const createJobProfileRequirements = async (
  accessToken: string | null,
  JobProfileRequirementsData: JobProfileRequirementsPayload
): Promise<ApiResponse<JobProfileRequirements>> => {
  try {
    // Remove fields not allowed on create
    const payload = { ...JobProfileRequirementsData };
    delete (payload as any).status;
    delete (payload as any).JD;

    const response = await fetch(`${API_BASE_URL}/jobProfileRequirement`, {
      method: 'POST',
      headers: makeHeaders(accessToken || undefined), // ✅ JSON headers
      body: JSON.stringify(payload),                 // ✅ JSON body
      credentials: 'include'
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      throw normalizeApiError(data);
    }

    return {
      success: true,
      message: data.message,
      data: mapApiJobProfileRequirements(data.data),
    };

  } catch (error) {
    console.error('Error in createJobProfileRequirements:', error);
    throw error;
  }
};



// Update a job profile
export const updateJobProfileRequirements = async (
  accessToken: string | null,
  id: number,
  data: Partial<JobProfileRequirementsPayload>
): Promise<ApiResponse<JobProfileRequirements>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/jobProfileRequirement/${id}`,
      {
        method: 'PATCH',
        headers: makeHeaders(accessToken || undefined),
        body: JSON.stringify(data),
        credentials: 'include'
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw normalizeApiError(result);
    }

    return {
      success: true,
      message: result.message,
      data: mapApiJobProfileRequirements(result.data)
    };
  } catch (error) {
    console.error('Error in updateJobProfileRequirements:', error);
    throw error;
  }
};


// export const getJDInfo = async (
//   accessToken: string | null,
//   JobProfileRequirementsId: number
// ): Promise<ApiResponse<JDInfo>> => {
//   const response = await fetch(
//     `${API_BASE_URL}/JobProfileRequirements/${JobProfileRequirementsId}/JD/info`,
//     {
//       headers: makeMultipartHeaders(accessToken || undefined),
//       credentials: 'include'
//     }
//   );
//   return response.json();
// };


// Delete job profile by ID
export const deleteJobProfileRequirements = async (
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

    const response = await fetch(`${API_BASE_URL}/JobProfileRequirement/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });
    
    const data = await response.json();
    if (!response.ok || !data?.success) {
       throw normalizeApiError(data);
    }

    return {
      success: true,
      message: data.message,
      data: null,
    };
  } catch (error) {
    console.error('Error in deleteJobProfileRequirements:', error);
    throw error;
  }
};

export const getDeletedJobProfileRequirements = async (
  accessToken: string | null
): Promise<JobProfileRequirementDeletedResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobProfileRequirement/deletions`, {
    credentials: "include",
    headers: makeHeaders(accessToken || undefined),
  });

  const data = await response.json();
  if (!response.ok || !data?.success) {
    throw normalizeApiError(data);
  }

  return data as JobProfileRequirementDeletedResponse;
};

export const restoreJobProfileRequirement = async (
  accessToken: string | null,
  id: number
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/jobProfileRequirement/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
    headers: makeHeaders(accessToken || undefined),
  });
  const data = await response.json();
  if (!response.ok || !data?.success) throw normalizeApiError(data);
  return data;
};



// Validation for job profile data
export const validateJobProfileRequirementsRequest = (
  data: Partial<JobProfileRequirementsPayload>
): string[] => {

  const errors: string[] = [];

  if (!data.positions || data.positions < 1) {
    errors.push('Positions must be at least 1');
  }

  if (!data.estimatedCloseDate) {
    errors.push('Estimated Close Date is required');
  }

  if (!data.location?.country || !data.location?.city) {
    errors.push('Location must include city and country');
  }

  if (!data.workArrangement) {
    errors.push('Work Arrangement is required');
  }

  if (data.estimatedCloseDate) {
    const closeDate = new Date(data.estimatedCloseDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
  }

  return errors;
};
