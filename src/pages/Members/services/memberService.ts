import { 
  Member,
  ApiResponse,
  ClientOption,
  MemberPatchPayload,
  Location
} from '../types/memberTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Common headers
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// --------------------------
// API → Frontend Mapper
// --------------------------
export function mapApiMember(data: any): Member {
  return {
    memberId: data.memberId,
    memberName: data.memberName,
    memberContact: data.memberContact,
    email: data.email,
    designation: data.designation,

    isRecruiter: Boolean(data.isRecruiter),
    isActive: Boolean(data.isActive),

    lastLogin: data.lastLogin || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,

    location: {
      city: data.city || "",
      country: data.country || "",
    },

    clientName: data.clientName ?? "",
    organisation: data.organisation ?? "",

    isInterviewer: Boolean(data.isInterviewer),
    interviewerCapacity: data.interviewerCapacity ?? 0,

    skills: Array.isArray(data.skills) ? data.skills : [],
  };
}

// --------------------------
// GET ALL Members
// --------------------------
export const getMembers = async (
  accessToken: string | null
): Promise<ApiResponse<Member[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/member`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized - invalid or expired token");
      throw new Error(`Failed to fetch members: ${response.status}`);
    }

    const data = await response.json();
    console.log("getMembers response data:", data);
    // Backend returns: { success: true, message, data: [...] }
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch members");
    }

    const mapped = Array.isArray(data.data)
      ? data.data.map(mapApiMember)
      : [];
    console.log("Mapped members:", mapped);
    return {
      success: true,
      message: data.message,
      data: mapped,
    };
  } catch (error) {
    console.error("Error in getMembers:", error);
    throw error;
  }
};

// --------------------------
// GET Member by ID
// --------------------------
export const getMemberById = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<Member>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/member/${id}`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized – invalid or expired token");
      throw new Error(`Failed to fetch member: ${response.status}`);
    }

    const data = await response.json();
    console.log("getMemberById response data:", data);
    if (!data.success) {
      throw new Error(data.message || "Member not found");
    }

    const mapped = mapApiMember(data.data);

    return {
      success: true,
      message: data.message,
      data: mapped,
    };
  } catch (error) {
    console.error("Error in getMemberById:", error);
    throw error;
  }
};

export const patchMember = async (
  accessToken: string | null,
  memberId: number,
  payload: MemberPatchPayload
): Promise<ApiResponse<Member>> => {
  if (!accessToken) throw new Error("Access token is required");
  if (!memberId || memberId <= 0) throw new Error("Invalid memberId");

  try {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`, {
      method: "PATCH",
      credentials: "include",
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("patchMember response data:", data);
    if (!response.ok) {
      const msg = data.message || `Failed to update member: ${response.status}`;
      throw new Error(msg);
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to update member");
    }

    const mapped = mapApiMember(data.data);

    return {
      success: true,
      message: data.message,
      data: mapped,
    };
  } catch (error) {
    console.error("Error in patchMember:", error);
    throw error;
  }
};

// --------------------------
// GET Lookup Data (Designations, Skills)
// --------------------------
export const fetchMemberLookupData = async (
  accessToken: string | null
): Promise<{ designations: string[]; skills: string[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lookup?page=1&limit=100`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lookup data: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !Array.isArray(result.data)) {
      console.error('Unexpected lookup response structure:', result);
      return { designations: [], skills: [] };
    }
    
    const designations = result.data
      .filter((item: any) => item.tag === "designation")
      .map((item: any) => item.value);
    
    const skills = result.data
      .filter((item: any) => item.tag === "skill")
      .map((item: any) => item.value);
    
    console.log('Fetched designations:', designations);
    console.log('Fetched skills:', skills);
    
    return { designations, skills };
  } catch (error) {
    console.error('Error fetching member lookup data:', error);
    throw error;
  }
};

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

export const deleteMember = async (
  accessToken: string | null,
  memberId: number
): Promise<ApiResponse<null>> => {
  if (!accessToken) throw new Error("Access token is required");
  if (!memberId || memberId <= 0) throw new Error("Invalid memberId");

  try {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`, { // Fixed endpoint to match others
      method: "DELETE",
      credentials: "include",
      headers: makeHeaders(accessToken), // Always call makeHeaders with accessToken
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.message || `Failed to delete member: ${response.status}`;
      throw new Error(msg);
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to delete member");
    }

    return {
      success: true,
      message: data.message,
      data: null,
    };

  } catch (error) {
    console.error("Error in deleteMember:", error);
    throw error;
  }
};

